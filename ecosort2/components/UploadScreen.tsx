import React, { useRef, useState, useEffect } from 'react';
import BackButton from './common/BackButton';

// A new self-contained component for the camera view logic.
const CameraCaptureView: React.FC<{
    onCapture: (base64: string, file: File) => void;
    onCancel: () => void;
}> = ({ onCapture, onCancel }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                // Request camera access, preferring the rear camera ('environment')
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
                streamRef.current = mediaStream;
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError("Could not access camera. Please check permissions and try again.");
            }
        };

        startCamera();

        // Cleanup function to stop the camera stream when the component unmounts
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
        // This effect should only run once on mount.
    }, []);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const context = canvas.getContext('2d');
            if (context) {
                // Draw the current video frame to the hidden canvas
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Convert canvas content to a blob, then to a base64 string
                canvas.toBlob(blob => {
                    if (blob) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64String = reader.result?.toString().split(',')[1];
                            if (base64String) {
                                const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                                onCapture(base64String, file);
                            }
                        };
                        reader.readAsDataURL(blob);
                    }
                }, 'image/jpeg', 0.95);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
            {error ? (
                <div className="text-white text-center p-4 bg-slate-800 rounded-lg shadow-lg">
                    <p className="text-xl text-red-400 font-bold">Camera Error</p>
                    <p className="mt-2">{error}</p>
                    <button onClick={onCancel} className="mt-4 px-6 py-2 bg-slate-500 rounded text-white font-semibold hover:bg-slate-600 transition-colors">Close</button>
                </div>
            ) : (
                <>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" muted></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center items-center bg-black/50">
                        <button onClick={onCancel} className="absolute left-4 px-4 py-2 bg-slate-500/70 rounded text-white backdrop-blur-sm hover:bg-slate-600 transition-colors">Cancel</button>
                        <button onClick={handleCapture} className="w-16 h-16 bg-white rounded-full border-4 border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition transform hover:scale-110" aria-label="Take Picture"></button>
                    </div>
                </>
            )}
        </div>
    );
};


interface UploadScreenProps {
    onImageUpload: (base64: string, file: File) => void;
    onBack: () => void;
    onShowHistory: () => void;
}

const UploadScreen: React.FC<UploadScreenProps> = ({ onImageUpload, onBack, onShowHistory }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result?.toString().split(',')[1];
                if (base64String) {
                    onImageUpload(base64String, file);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleCameraClick = () => {
        setIsCameraOpen(true);
    };

    const handleCapture = (base64: string, file: File) => {
        setIsCameraOpen(false);
        onImageUpload(base64, file);
    };

    // Conditionally render the camera view or the upload buttons
    if (isCameraOpen) {
        return <CameraCaptureView onCapture={handleCapture} onCancel={() => setIsCameraOpen(false)} />;
    }

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-sky-50">
            <BackButton onClick={onBack} />
            <button
                onClick={onShowHistory}
                className="absolute top-4 right-4 z-20 flex items-center justify-center w-10 h-10 bg-white/50 backdrop-blur-sm rounded-full shadow-md hover:bg-white/80 transition-all"
                aria-label="View scan history"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            <div className="w-full max-w-md text-center bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">
                    Upload or Capture Waste Item
                </h2>
                <p className="text-slate-600 mb-8">
                    Let's identify your item. Choose an option below.
                </p>
                
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />

                <div className="space-y-4">
                    <button
                        onClick={handleCameraClick}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-sky-500 text-white font-semibold rounded-xl shadow-md hover:bg-sky-600 transition-all duration-300 transform hover:scale-105"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span>Capture using Camera</span>
                    </button>
                    <button
                        onClick={handleUploadClick}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-emerald-500 text-white font-semibold rounded-xl shadow-md hover:bg-emerald-600 transition-all duration-300 transform hover:scale-105"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <span>Upload from Device</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadScreen;