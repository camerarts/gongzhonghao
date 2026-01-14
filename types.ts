export interface ProcessedSegment {
  id: string;
  originalText: string;
  cleanedText: string;
  summary: string; // The "one sentence visual summary"
  mood: string;
  imagePrompt: string;
  imageUrl?: string;
  imageStatus: 'idle' | 'loading' | 'success' | 'error';
}

export type AppStatus = 'idle' | 'analyzing' | 'analyzed' | 'generating_images' | 'complete' | 'error';

export interface AnalysisResponseItem {
  content: string;
  visualSummary: string;
  mood: string;
  imagePrompt: string;
}

export interface ImageGenerationSettings {
  style: string;
  systemPrompt: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  lastModified: number;
  segments: ProcessedSegment[];
  status: AppStatus;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}