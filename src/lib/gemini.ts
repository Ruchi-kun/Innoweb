import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";

// Ensure you have VITE_GEMINI_API_KEY in your .env file
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export const geminiSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    companyName: { type: SchemaType.STRING },
    isDataSufficient: { type: SchemaType.BOOLEAN },
    missingFieldsReasoning: { type: SchemaType.STRING },
    extractedVectors: {
      type: SchemaType.OBJECT,
      properties: {
        primaryVertical: { type: SchemaType.STRING },
        operationalStage: { type: SchemaType.STRING, format: "enum", enum: ["Idea", "MVP", "Early Traction", "Scaling"] },
        operationalBottlenecks: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        targetMarkets: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        coreTechStack: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        businessModel: { type: SchemaType.STRING, format: "enum", enum: ["B2B", "B2C", "B2B2C", "Marketplace", "D2C"] },
        targetCorporateSectors: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        fundingTargetMYR: { type: SchemaType.NUMBER, nullable: true },
        teamGaps: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        regulatoryRequirements: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
      },
      required: ["primaryVertical", "operationalStage", "operationalBottlenecks", "targetMarkets", "businessModel"]
    }
  },
  required: ["companyName", "isDataSufficient", "missingFieldsReasoning", "extractedVectors"]
};

export const getStructuredGeminiModel = () => {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: geminiSchema,
    }
  });
};

export const getChatModel = () => {
  return genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
  });
};
