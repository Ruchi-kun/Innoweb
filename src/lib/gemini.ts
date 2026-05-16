import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";

const MODEL_NAME = "gemma-4-26b-a4b-it";

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
        companyType: { type: SchemaType.STRING },
        primaryIndustry: { type: SchemaType.STRING },
        operatingStage: { type: SchemaType.STRING },
        keyCapabilities: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        operationalNeeds: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        targetMarkets: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        businessModel: { type: SchemaType.STRING },
        productsOrServices: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        targetCorporateSectors: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        fundingTargetMYR: { type: SchemaType.NUMBER, nullable: true },
        teamGaps: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        regulatoryRequirements: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        partnershipGoals: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
      },
      required: ["companyType", "primaryIndustry", "operatingStage", "keyCapabilities", "operationalNeeds", "targetMarkets", "businessModel"]
    }
  },
  required: ["companyName", "isDataSufficient", "missingFieldsReasoning", "extractedVectors"]
};

export const getStructuredGeminiModel = () => {
  return genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: geminiSchema,
    }
  });
};

export const getChatModel = () => {
  return genAI.getGenerativeModel({
      model: MODEL_NAME
  });
};
