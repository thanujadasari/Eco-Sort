import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Screen, ClassificationResult, REEResult, MaterialInfoResult, CompositionItem, ScanHistoryItem } from './types';
import { classifyWaste, lookupREEs, getMaterialInfo } from './services/geminiService';
import { createThumbnail } from './services/imageService';
import { saveScanToBackend, saveREEsToBackend, logMaterialInfoBackend } from './services/backendService';

import TitleScreen from './components/TitleScreen';
import UploadScreen from './components/UploadScreen';
import ResultScreen from './components/ResultScreen';
import REEScreen from './components/REEScreen';
import MaterialInfoScreen from './components/MaterialInfoScreen';
import HistoryScreen from './components/HistoryScreen';
import LoginScreen from './components/LoginScreen';
import SignUpScreen from './components/SignUpScreen';
import LoadingSpinner from './components/common/LoadingSpinner';

console.log("Loaded API key:", import.meta.env.VITE_GEMINI_API_KEY);

const App: React.FC = () => {
    const [screen, setScreen] = useState<Screen>(Screen.Title);
    const [screenHistory, setScreenHistory] = useState<Screen[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<string | null>(null);

    const [image, setImage] = useState<{ base64: string; url: string; file: File; } | null>(null);
    const [classificationResults, setClassificationResults] = useState<ClassificationResult[] | null>(null);
    const [reeResult, setReeResult] = useState<REEResult | null>(null);
    const [materialInfo, setMaterialInfo] = useState<MaterialInfoResult | null>(null);
    const [selectedItemComposition, setSelectedItemComposition] = useState<CompositionItem[] | null>(null);
    const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("Analyzing...");
    const [error, setError] = useState<string | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);

    // Navigation
    const navigateTo = useCallback((newScreen: Screen) => {
        setScreenHistory(prev => [...prev, screen]);
        setScreen(newScreen);
        setError(null);
        setAuthError(null);
    }, [screen]);

    const handleBack = useCallback(() => {
        const lastScreen = screenHistory[screenHistory.length - 1];
        if (lastScreen !== undefined) {
            setScreenHistory(prev => prev.slice(0, -1));
            setScreen(lastScreen);
            setError(null);
            setAuthError(null);
        }
    }, [screenHistory]);

    // Auto-login if remembered
    useEffect(() => {
        const rememberedUser = localStorage.getItem('eco-sort-remembered-user');
        if (rememberedUser) {
            setIsAuthenticated(true);
            setCurrentUser(rememberedUser);
            setScreen(Screen.Upload);
        }
    }, []);

    const handleReset = useCallback(() => {
        navigateTo(Screen.Upload);
        setImage(null);
        setClassificationResults(null);
        setReeResult(null);
        setMaterialInfo(null);
        setSelectedItemComposition(null);
        setError(null);
        setIsLoading(false);
    }, [navigateTo]);

    // Authentication
    const handleLogin = (email: string, rememberMe: boolean) => {
        const users = JSON.parse(localStorage.getItem('eco-sort-users') || '[]');
        if (users.includes(email)) {
            setIsAuthenticated(true);
            setCurrentUser(email);
            if (rememberMe) localStorage.setItem('eco-sort-remembered-user', email);
            navigateTo(Screen.Upload);
        } else {
            setAuthError("No account found with that email. Please sign up.");
        }
    };

    const handleSignUp = (email: string) => {
        const users = JSON.parse(localStorage.getItem('eco-sort-users') || '[]');
        if (users.includes(email)) {
            setAuthError("An account with this email already exists.");
        } else {
            const newUsers = [...users, email];
            localStorage.setItem('eco-sort-users', JSON.stringify(newUsers));
            setIsAuthenticated(true);
            setCurrentUser(email);
            navigateTo(Screen.Upload);
        }
    };

    // Save scan to history
    const saveScanToHistory = useCallback(async (results: ClassificationResult[], imageBase64: string, imageFile: File) => {
        if (!currentUser) return;

        try {
            const thumbnail = await createThumbnail(imageBase64, imageFile.type);
            const newHistoryItem: ScanHistoryItem = {
                id: `scan_${Date.now()}`,
                timestamp: Date.now(),
                thumbnail: `data:image/jpeg;base64,${thumbnail}`,
                results,
            };

            const allHistory = JSON.parse(localStorage.getItem('eco-sort-history') || '{}');
            const userHistory = allHistory[currentUser] || [];
            userHistory.unshift(newHistoryItem);
            allHistory[currentUser] = userHistory.slice(0, 50);

            localStorage.setItem('eco-sort-history', JSON.stringify(allHistory));
        } catch (err) {
            console.error("Failed to save scan to history:", err);
        }
    }, [currentUser]);

    // Image upload -> classify waste
    const handleImageUpload = useCallback(async (base64: string, file: File) => {
        setImage({ base64, url: URL.createObjectURL(file), file });
        navigateTo(Screen.Result);
        setIsLoading(true);
        setError(null);
        setLoadingText("Classifying waste item(s)...");

        try {
            const results = await classifyWaste(base64, file.type);
            setClassificationResults(results);
            if (results.length > 0) await saveScanToHistory(results, base64, file);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error');
            handleBack();
        } finally { setIsLoading(false); }
    }, [navigateTo, handleBack, saveScanToHistory]);

    // Lookup REEs
    const handleLookupREEs = useCallback(async () => {
        if (!image) return;
        navigateTo(Screen.REE);
        setIsLoading(true);
        setError(null);
        setLoadingText("Scanning for Rare Earth Elements...");

        try {
            const result = await lookupREEs(image.base64, image.file.type);
            setReeResult(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error');
            handleBack();
        } finally { setIsLoading(false); }
    }, [image, navigateTo, handleBack]);

    // Material info
    const handleLearnMore = useCallback(async (materialName: string, composition: CompositionItem[]) => {
        setSelectedItemComposition(composition);
        navigateTo(Screen.MaterialInfo);
        setIsLoading(true);
        setError(null);
        setLoadingText(`Fetching details for ${materialName}...`);

        try {
            const result = await getMaterialInfo(materialName);
            setMaterialInfo(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error');
            setSelectedItemComposition(null);
            handleBack();
        } finally { setIsLoading(false); }
    }, [navigateTo, handleBack]);

    // Show scan history
    const handleShowHistory = useCallback(() => {
        if (!currentUser) return;
        const allHistory = JSON.parse(localStorage.getItem('eco-sort-history') || '{}');
        setScanHistory(allHistory[currentUser] || []);
        navigateTo(Screen.History);
    }, [currentUser, navigateTo]);

    // Reset inconsistent states
    useEffect(() => {
        if (isLoading) return;
        if ((screen === Screen.Result && (!classificationResults || !image)) ||
            (screen === Screen.REE && (!reeResult || !image)) ||
            (screen === Screen.MaterialInfo && (!materialInfo || !image || !selectedItemComposition))) {
            if (isAuthenticated) handleReset();
        }
    }, [screen, isLoading, classificationResults, reeResult, materialInfo, image, isAuthenticated, selectedItemComposition, handleReset]);

    // Render screens
    const renderScreen = useMemo(() => {
        if (!isAuthenticated && screen !== Screen.Title) {
            switch(screen) {
                case Screen.Login:
                    return <LoginScreen onLogin={handleLogin} onSwitchToSignUp={() => navigateTo(Screen.SignUp)} error={authError} />;
                case Screen.SignUp:
                    return <SignUpScreen onSignUp={handleSignUp} onSwitchToLogin={() => navigateTo(Screen.Login)} error={authError} />;
                default:
                    return <LoginScreen onLogin={handleLogin} onSwitchToSignUp={() => navigateTo(Screen.SignUp)} error={authError} />;
            }
        }

        switch(screen) {
            case Screen.Title: return <TitleScreen onStart={() => navigateTo(Screen.Login)} />;
            case Screen.Upload: return <UploadScreen onImageUpload={handleImageUpload} onBack={handleBack} onShowHistory={handleShowHistory} />;
            case Screen.Result:
                if (isLoading) return <LoadingSpinner text={loadingText} />;
                if (classificationResults && image) return <ResultScreen imageSrc={image.url} results={classificationResults} onLookupREEs={handleLookupREEs} onReset={handleReset} onBack={handleBack} onLearnMore={handleLearnMore} />;
                return <LoadingSpinner text="Preparing results..." />;
            case Screen.REE:
                if (isLoading) return <LoadingSpinner text={loadingText} />;
                if (reeResult && image) return <REEScreen imageSrc={image.url} result={reeResult} onReset={handleReset} onBack={handleBack} />;
                return <LoadingSpinner text="Preparing results..." />;
            case Screen.MaterialInfo:
                if (isLoading) return <LoadingSpinner text={loadingText} />;
                if (materialInfo && image && selectedItemComposition) return <MaterialInfoScreen imageSrc={image.url} result={materialInfo} composition={selectedItemComposition} onBack={handleBack} />;
                return <LoadingSpinner text="Preparing details..." />;
            case Screen.History:
                return <HistoryScreen history={scanHistory} onBack={handleBack} />;
            default:
                return isAuthenticated ? <UploadScreen onImageUpload={handleImageUpload} onBack={handleBack} onShowHistory={handleShowHistory}/> : <TitleScreen onStart={() => navigateTo(Screen.Login)} />;
        }
    }, [screen, isAuthenticated, isLoading, loadingText, classificationResults, image, reeResult, materialInfo, selectedItemComposition, scanHistory, handleImageUpload, handleLookupREEs, handleReset, handleBack, handleLogin, handleSignUp, navigateTo, authError, handleLearnMore, handleShowHistory]);

    return (
        <main className="w-screen h-screen bg-gray-100 text-slate-800 antialiased overflow-hidden">
            {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg z-50 shadow-lg flex items-center gap-4" role="alert">
                    <div>
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                    <button onClick={() => setError(null)} className="font-bold text-xl leading-none px-2">&times;</button>
                </div>
            )}
            <div className="w-full h-full transition-opacity duration-500">{renderScreen}</div>
        </main>
    );
};

export default App;
