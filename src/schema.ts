import { z } from "zod";

export const StartupEcosystemNodeSchema = z.object({
  companyName: z.string(),
  isDataSufficient: z.boolean(),
  missingFieldsReasoning: z.string(),
  extractedVectors: z.object({
    primaryVertical: z.string(),
    operationalStage: z.enum(["Idea", "MVP", "Early Traction", "Scaling"]),
    operationalBottlenecks: z.array(z.string()),
    targetMarkets: z.array(z.string()),
    coreTechStack: z.array(z.string()).optional(),
    businessModel: z.enum(["B2B", "B2C", "B2B2C", "Marketplace", "D2C"]),
    targetCorporateSectors: z.array(z.string()).optional(),
    fundingTargetMYR: z.number().nullable().optional(),
    teamGaps: z.array(z.string()).optional(),
    regulatoryRequirements: z.array(z.string()).optional()
  })
});

export type StartupEcosystemNode = z.infer<typeof StartupEcosystemNodeSchema>;
