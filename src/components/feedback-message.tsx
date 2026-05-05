import type { FeedbackMessage as FeedbackMessageData } from "@/lib/feedback";
import { cn } from "@/lib/utils";

type FeedbackMessageProps = {
  feedback: FeedbackMessageData | null;
  className?: string;
};

export function FeedbackMessage({ feedback, className }: FeedbackMessageProps) {
  if (!feedback) {
    return null;
  }

  return (
    <div
      className={cn("feedback-message", `feedback-message-${feedback.tone}`, className)}
      role={feedback.tone === "error" ? "alert" : "status"}
    >
      <p className="feedback-title">{feedback.title}</p>
      <p className="feedback-detail">{feedback.detail}</p>
    </div>
  );
}
