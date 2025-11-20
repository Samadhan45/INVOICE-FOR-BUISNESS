import { GoogleGenAI, Type } from "@google/genai";

// Safely access API Key to prevent "process is not defined" crashes in browser
const getApiKey = () => {
  try {
    // Check for Vite environment variable
    // @ts-ignore
    if (typeof import.meta !== "undefined" && import.meta.env) {
      // @ts-ignore
      const key = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY;
      if (key) return key;
    }
    
    // Check for process environment variable (Node/Webpack/Next.js)
    if (typeof process !== "undefined" && process.env) {
      return process.env.API_KEY || "";
    }
  } catch (e) {
    console.warn("Environment variable access failed", e);
  }
  return "";
};

const apiKey = getApiKey();
// Initialize only if key exists, otherwise handle gracefully in function
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy_key_to_prevent_crash' });

export const parseWorkDescription = async (description: string): Promise<{ description: string; quantity: number }[]> => {
  if (!apiKey || apiKey === 'dummy_key_to_prevent_crash') {
    console.warn("API Key is missing. AI features disabled.");
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a helper for a Marathi Painting Contractor. Convert this rough description: "${description}" into a list of items.
      Translate everything to simple Marathi. 
      Example: "2 room color" -> description: "हॉल व बेडरूम ऑईल पेंट", quantity: 2.
      Return JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
            },
            required: ["description", "quantity"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};