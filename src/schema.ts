import { z } from "zod";

export const CompanyEcosystemNodeSchema = z.object({
  companyName: z.string(),
  isDataSufficient: z.boolean(),
  missingFieldsReasoning: z.string(),
  extractedVectors: z.object({
    companyType: z.string(),
    primaryIndustry: z.string(),
    operatingStage: z.string(),
    keyCapabilities: z.array(z.string()),
    operationalNeeds: z.array(z.string()),
    targetMarkets: z.array(z.string()),
    businessModel: z.string(),
    productsOrServices: z.array(z.string()).optional(),
    targetCorporateSectors: z.array(z.string()).optional(),
    fundingTargetMYR: z.number().nullable().optional(),
    teamGaps: z.array(z.string()).optional(),
    regulatoryRequirements: z.array(z.string()).optional(),
    partnershipGoals: z.array(z.string()).optional()
  })
});

export type CompanyEcosystemNode = z.infer<typeof CompanyEcosystemNodeSchema>;
export type StartupEcosystemNode = CompanyEcosystemNode;
