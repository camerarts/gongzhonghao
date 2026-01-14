import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponseItem } from '../types';

// Helper to safely get the API Key from various environment sources
const getEnvApiKey = (): string | undefined => {
  // 1. Try standard process.env (Node/Webpack/some polyfills)
  try {
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // process is not defined
  }

  // 2. Try Vite standard (common in Cloudflare Pages)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env?.API_KEY) {
      // @ts-ignore
      return import.meta.env.API_KEY;
    }
  } catch (e) {
    // import.meta is not defined
  }

  return undefined;
};

// Helper to ensure we have a key or prompt user
export const ensureApiKey = async (): Promise<boolean> => {
  // Check environment variable first
  const envKey = getEnvApiKey();
  if (envKey) return true;

  // Check AI Studio selection
  if (window.aistudio) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      try {
        await window.aistudio.openSelectKey();
        return await window.aistudio.hasSelectedApiKey();
      } catch (e) {
        console.error("Failed to select key", e);
        return false;
      }
    }
    return true;
  }
  
  return false;
};

// Internal helper to get the effective key for requests
const getEffectiveKey = (): string | undefined => {
  const envKey = getEnvApiKey();
  if (envKey) return envKey;
  // If no env key, the GoogleGenAI SDK will try to use the one from window.aistudio internally 
  // or we assume the user has selected one which injects it implicitly for some SDK versions, 
  // BUT for @google/genai we usually need to pass it if it's process.env.
  // If window.aistudio is used, the SDK might handle it, but to be safe we return undefined 
  // and let the caller handle the missing key error if specific logic is needed.
  return process.env?.API_KEY; // Fallback to allow SDK to try its default behavior
};

// 1. Analyze and Segment Text
export const analyzeArticle = async (text: string): Promise<AnalysisResponseItem[]> => {
  const apiKey = getEnvApiKey() || process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  const prompt = `
  You are a professional WeChat Official Account editor and art director. 
  Your task is to process the following article text (in Chinese).

  Instructions:
  1. Clean the text: Remove extra newlines, weird symbols, but KEEP the original flow and paragraphs.
  2. Structure Analysis: Split the text into 3 to 6 semantic segments based on the narrative arc, mood shifts, or key arguments.
     - Minimum 3 segments.
     - Maximum 6 segments.
     - Do NOT split by fixed word count. Split by meaning.
  3. Visual Extraction: For EACH segment, extract:
     - 'mood': The emotional tone in CHINESE (e.g., 治愈, 忧伤, 充满希望).
     - 'visualSummary': A concise, one-sentence abstract visual description of the segment's core meaning in CHINESE.
     - 'imagePrompt': A highly detailed ENGLISH prompt for an AI image generator to create a high-quality, artistic illustration. 
       - **CRITICAL**: The image will be cropped to a 2.35:1 Cinematic Wide Aspect Ratio. Composition should be wide and cinematic.
       - Style: Consistent artistic style (e.g., flat illustration, watercolor, or cinematic digital art).
       - No text or watermarks.

  Input Text:
  """
  ${text}
  """
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING, description: "The cleaned original text for this segment" },
            visualSummary: { type: Type.STRING, description: "One sentence visual summary in Chinese" },
            mood: { type: Type.STRING, description: "The mood of the segment in Chinese" },
            imagePrompt: { type: Type.STRING, description: "English image generation prompt, optimized for 2.35:1 aspect ratio" }
          },
          required: ["content", "visualSummary", "mood", "imagePrompt"]
        }
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as AnalysisResponseItem[];
  }
  throw new Error("Failed to analyze text");
};

// 2. Generate Image for a Segment
export const generateSegmentImage = async (prompt: string): Promise<string> => {
  const apiKey = getEnvApiKey() || process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt + " , cinematic shot, wide angle, 8k resolution, high quality" }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9", // We will crop this to 2.35:1 in CSS as Gemini doesn't support 2.35:1 native yet
          imageSize: "1K"
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
};