import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const parseWorkDescription = async (description: string): Promise<{ description: string; quantity: number }[]> => {
  if (!apiKey) return [];

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