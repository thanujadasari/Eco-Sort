import { GoogleGenAI, Type } from '@google/genai';
import { ClassificationResult, CompositionItem, REEResult, WasteType, MaterialInfoResult } from '../types';
import { saveScanToBackend, saveREEsToBackend, logMaterialInfoBackend } from './backendService';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Classification schema for Gemini
const classificationSchema = {
  type: Type.OBJECT,
  properties: {
    itemName: { type: Type.STRING, description: "Short name of the item" },
    wasteType: {
      type: Type.STRING,
      description: "Type of waste",
      enum: ['Biodegradable', 'Non-Biodegradable', 'E-Waste'],
    },
    recyclingInfo: { type: Type.STRING, description: "Recycling/disposal instructions" },
    composition: {
      type: Type.ARRAY,
      description: "Material composition",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          value: { type: Type.NUMBER }
        },
        required: ['name', 'value']
      }
    }
  },
  required: ['itemName', 'wasteType', 'recyclingInfo', 'composition']
};

const multiItemClassificationSchema = { type: Type.ARRAY, items: classificationSchema };

const reeSchema = {
  type: Type.OBJECT,
  properties: { identifiedREEs: { type: Type.ARRAY, items: { type: Type.STRING } } },
  required: ['identifiedREEs']
};

const materialInfoSchema = {
  type: Type.OBJECT,
  properties: {
    materialName: { type: Type.STRING },
    description: { type: Type.ARRAY, items: { type: Type.STRING } },
    environmentalImpact: { type: Type.ARRAY, items: { type: Type.STRING } },
    recyclingPotential: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['materialName', 'description', 'environmentalImpact', 'recyclingPotential']
};

// Waste classification
export const classifyWaste = async (imageBase64: string, mimeType: string, sendToBackend = true): Promise<ClassificationResult[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: "Identify all distinct waste items in the image. Return JSON array with name, type, recycling info, and composition." }
        ]
      },
      config: { responseMimeType: "application/json", responseSchema: multiItemClassificationSchema }
    });

    const parsed = JSON.parse(response.text.trim());
    if (!Array.isArray(parsed)) throw new Error("Gemini returned non-array result");

    const results: ClassificationResult[] = parsed.map(item => ({
      ...item,
      composition: Array.isArray(item.composition) ? item.composition.filter(c => c.value > 0) : []
    }));

    // Optional: send to backend
    if (sendToBackend && results.length > 0) {
      try {
        const blob = await fetch(`data:${mimeType};base64,${imageBase64}`).then(res => res.blob());
        await saveScanToBackend(new File([blob], `scan_${Date.now()}`), results);
      } catch (err) {
        console.warn("Failed to send classification to backend", err);
      }
    }

    return results;

  } catch (error) {
    console.error("Error classifying waste:", error);
    throw new Error("Failed to classify waste");
  }
};

// Lookup REEs
export const lookupREEs = async (imageBase64: string, mimeType: string, sendToBackend = true): Promise<REEResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: "Identify Rare Earth Elements in this e-waste image. Return JSON object with identifiedREEs array." }
        ]
      },
      config: { responseMimeType: "application/json", responseSchema: reeSchema }
    });

    const parsed: REEResult = JSON.parse(response.text.trim());

    if (sendToBackend) {
      try {
        const blob = await fetch(`data:${mimeType};base64,${imageBase64}`).then(res => res.blob());
        await saveREEsToBackend(new File([blob], `ree_${Date.now()}`), parsed);
      } catch (err) {
        console.warn("Failed to send REE results to backend", err);
      }
    }

    return parsed;

  } catch (error) {
    console.error("Error looking up REEs:", error);
    throw new Error("Failed to lookup REEs");
  }
};

// Material info
export const getMaterialInfo = async (materialName: string, sendToBackend = true): Promise<MaterialInfoResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: `Provide material info for '${materialName}'. Return JSON with description, environmentalImpact, recyclingPotential arrays.` }],
      config: { responseMimeType: "application/json", responseSchema: materialInfoSchema }
    });

    const parsed: MaterialInfoResult = JSON.parse(response.text.trim());

    if (sendToBackend) {
      try { await logMaterialInfoBackend(materialName); } 
      catch (err) { console.warn("Failed to log material info to backend", err); }
    }

    return parsed;

  } catch (error) {
    console.error("Error getting material info:", error);
    throw new Error(`Failed to get material info for ${materialName}`);
  }
};
