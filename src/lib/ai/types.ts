export type ReviewType = "daily" | "weekly" | "monthly";

export type GenerateReviewInput = {
  userId: string;
  reviewType: ReviewType;
  dateRange: {
    start: string;
    end: string;
  };
  stats: Record<string, unknown>;
  highlights: string[];
  selectedOriginals?: Array<{
    eventId: string;
    content: string;
    sensitivityDecision: "allowed" | "downgraded_to_summary";
  }>;
  sensitiveMode: "summary_only" | "allow_selected_originals";
};

export type GenerateReviewOutput = {
  title: string;
  summary: string;
  patterns: string[];
  suggestions: string[];
  nextActions: string[];
  modelProvider: string;
  modelName: string;
};

export type AiProviderClient = {
  generateReview(input: GenerateReviewInput): Promise<GenerateReviewOutput>;
};
