export enum Screen {
  Title,
  Login,
  SignUp,
  Upload,
  Result,
  REE,
  MaterialInfo,
  History,
}

export enum WasteType {
  Biodegradable = 'Biodegradable',
  NonBiodegradable = 'Non-Biodegradable',
  EWaste = 'E-Waste',
  Unknown = 'Unknown',
}

export interface CompositionItem {
  name: string;
  value: number;
}

export interface ClassificationResult {
  itemName: string;
  wasteType: WasteType;
  recyclingInfo: string;
  composition: CompositionItem[];
}

export interface REEResult {
  identifiedREEs: string[];
}

export interface MaterialInfoResult {
    materialName: string;
    description: string[];
    environmentalImpact: string[];
    recyclingPotential: string[];
}

export interface ScanHistoryItem {
    id: string;
    timestamp: number;
    thumbnail: string; // base64 encoded image
    results: ClassificationResult[];
}