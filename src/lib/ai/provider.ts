import "server-only";

import { getAiRuntimeConfig } from "@/lib/ai/config";
import { generateOpenAiCompatibleReview } from "@/lib/ai/openai-compatible";
import type { AiProviderClient, GenerateReviewInput, GenerateReviewOutput } from "@/lib/ai/types";

export class AiConfigurationError extends Error {
  constructor(readonly missing: string[]) {
    super(`Missing AI configuration: ${missing.join(", ")}`);
    this.name = "AiConfigurationError";
  }
}

export function createAiProviderClient(reviewType: GenerateReviewInput["reviewType"]): AiProviderClient {
  const runtimeConfig = getAiRuntimeConfig(reviewType);

  if (!runtimeConfig.ok) {
    throw new AiConfigurationError(runtimeConfig.missing);
  }

  return {
    generateReview(input) {
      return generateOpenAiCompatibleReview(input, runtimeConfig.config);
    },
  };
}

export async function generateReview(input: GenerateReviewInput): Promise<GenerateReviewOutput> {
  const client = createAiProviderClient(input.reviewType);

  return client.generateReview(input);
}
