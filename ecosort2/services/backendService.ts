import { ClassificationResult, REEResult, MaterialInfoResult } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Call backend to classify waste
export const classifyWasteBackend = async (formData: FormData): Promise<ClassificationResult[]> => {
  const response = await fetch(`${API_BASE_URL}/classify`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Failed to classify waste via backend");
  return response.json();
};

// Call backend to lookup REEs
export const lookupREEsBackend = async (formData: FormData): Promise<REEResult> => {
  const response = await fetch(`${API_BASE_URL}/ree`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Failed to get REEs via backend");
  return response.json();
};

// Call backend to get material info
export const getMaterialInfoBackend = async (materialName: string): Promise<MaterialInfoResult> => {
  const response = await fetch(`${API_BASE_URL}/material-info?name=${encodeURIComponent(materialName)}`);
  if (!response.ok) throw new Error(`Failed to get material info for ${materialName}`);
  return response.json();
};

// ✅ Aliases for backward compatibility with App.tsx
export const saveScanToBackend = classifyWasteBackend;
export const saveREEsToBackend = lookupREEsBackend;
export const logMaterialInfoBackend = getMaterialInfoBackend;
