"use client";

import { useState, useRef, useEffect } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Gift,
  Heart,
  Lightbulb,
  Send,
  Sparkles,
} from "lucide-react";

import {
  createHabitAction,
  createQuickRecordAction,
  createScheduleItemAction,
  createTaskAction,
} from "@/app/daily/actions";
import { createAnniversaryAction, createGiftRecordAction } from "@/app/life/actions";
import { getBeijingDateValue } from "@/lib/date";
import { parseIntent, type IntentType, type ParsedIntent } from "@/lib/intent-parser";

type ChatMessage = {
  id: string;
  role: "user" | "system" | "confirmation";
  content: string;
  intent?: ParsedIntent;
  timestamp: Date;
};

const quickActions: Array<{
  type: IntentType;
  label: string;
  Icon: typeof CheckCircle2;
  placeholder: string;
}> = [
  { type: "task", label: "任务", Icon: CheckCircle2, placeholder: "输入任务标题..." },
  { type: "schedule", label: "日程", Icon: Clock, placeholder: "输入日程标题..." },
  { type: "habit", label: "习惯", Icon: Heart, placeholder: "输入习惯名称..." },
  { type: "event", label: "事件", Icon: Sparkles, placeholder: "记录今天发生的事..." },
  { type: "idea", label: "灵感", Icon: Lightbulb, placeholder: "记录你的想法..." },
  { type: "anniversary", label: "纪念日", Icon: CalendarDays, placeholder: "输入纪念日标题..." },
  { type: "gift", label: "礼物", Icon: Gift, placeholder: "输入礼物名称..." },
];

export function AiChatClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "system",
      content: "你好！我是你的 AI 助手。你可以直接输入内容，我会自动识别意图并创建对应记录。也可以点击下方快捷键快速创建。",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [activeQuickAction, setActiveQuickAction] = useState<IntentType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const idCounter = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  function nextId() {
    idCounter.current += 1;
    return idCounter.current;
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const placeholder = activeQuickAction
    ? quickActions.find((a) => a.type === activeQuickAction)?.placeholder ?? "输入内容..."
    : "输入内容，或点击下方快捷键...";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isCreating) return;

    const userMessage: ChatMessage = {
      id: `user-${nextId()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const text = input.trim();
    setInput("");

    const intent = activeQuickAction
      ? { type: activeQuickAction, title: text, category: "other", date: getBeijingDateValue(), confidence: "high" as const }
      : parseIntent(text);

    if (!intent) {
      setMessages((prev) => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          role: "system",
          content: "抱歉，我没有理解你的意图。请尝试更明确的表达，或点击下方快捷键。",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    if (intent.confidence === "low") {
      setMessages((prev) => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          role: "system",
          content: "我没完全理解你想创建什么。请描述得更清楚一些，或点击下方快捷键选择类型。",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    const content = intent.confidence === "medium"
      ? `我可能没完全理解，请确认：${getIntentLabel(intent.type)}`
      : `识别到意图：${getIntentLabel(intent.type)}`;

    const confirmMessage: ChatMessage = {
      id: `confirm-${nextId()}`,
      role: "confirmation",
      content,
      intent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, confirmMessage]);
  }

  async function handleConfirmCreation(messageId: string) {
    const message = messages.find((m) => m.id === messageId);
    if (!message?.intent) return;

    setIsCreating(true);
    const { intent } = message;

    try {
      switch (intent.type) {
        case "task": {
          const formData = new FormData();
          formData.append("title", intent.title);
          formData.append("category", intent.category);
          formData.append("taskDate", intent.date);
          formData.append("status", "todo");
          await createTaskAction(formData);
          break;
        }
        case "schedule": {
          const formData = new FormData();
          formData.append("title", intent.title);
          formData.append("category", intent.category);
          formData.append("scheduleDate", intent.date);
          formData.append("startDate", intent.date);
          formData.append("startTime", intent.time ?? "09:00");
          formData.append("recurrence", "none");
          await createScheduleItemAction(formData);
          break;
        }
        case "habit": {
          const formData = new FormData();
          formData.append("name", intent.title);
          formData.append("category", intent.category);
          formData.append("startDate", intent.date);
          await createHabitAction(formData);
          break;
        }
        case "event": {
          const formData = new FormData();
          formData.append("content", intent.title);
          formData.append("type", "event");
          formData.append("eventDate", intent.date);
          formData.append("aiAnalysisPermission", "summary_only");
          await createQuickRecordAction(formData);
          break;
        }
        case "idea": {
          const formData = new FormData();
          formData.append("content", intent.title);
          formData.append("type", "idea");
          formData.append("ideaDate", intent.date);
          await createQuickRecordAction(formData);
          break;
        }
        case "gift": {
          const formData = new FormData();
          formData.append("giftName", intent.title);
          formData.append("recipientName", "未知");
          formData.append("giftDate", intent.date);
          await createGiftRecordAction(formData);
          break;
        }
        case "anniversary": {
          const formData = new FormData();
          formData.append("title", intent.title);
          formData.append("personName", "未知");
          formData.append("anniversaryDate", intent.date);
          await createAnniversaryAction(formData);
          break;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `success-${nextId()}`,
          role: "system",
          content: `✅ 已创建${getIntentLabel(intent.type)}：${intent.title}`,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${nextId()}`,
          role: "system",
          content: "❌ 创建失败，请稍后重试。",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsCreating(false);
    }
  }

  function getIntentLabel(type: IntentType) {
    const map: Record<string, string> = {
      task: "任务",
      schedule: "日程",
      habit: "习惯",
      event: "事件",
      idea: "灵感",
      anniversary: "纪念日",
      gift: "礼物",
    };
    return map[type ?? ""] ?? "未知";
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="page-kicker">AI 助手</p>
            <h1 className="page-title">自然语言创建记录</h1>
          </div>
        </div>
        <p className="page-description">
          直接输入内容，AI 会自动识别意图并创建对应记录。
        </p>
      </header>

      {/* Unified chat container */}
      <div className="ai-chat-shell">
        {/* Messages area */}
        <div className="ai-chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`ai-msg-row ${msg.role === "user" ? "ai-msg-right" : "ai-msg-left"}`}
            >
              <div
                className={`ai-msg-bubble ${
                  msg.role === "user"
                    ? "ai-msg-user"
                    : msg.role === "confirmation"
                      ? "ai-msg-confirm"
                      : "ai-msg-system"
                }`}
              >
                <p className="ai-msg-text">{msg.content}</p>

                {msg.role === "confirmation" && msg.intent && (
                  <div className="ai-msg-confirm-detail">
                    <div className="ai-msg-confirm-card">
                      <p className="ai-msg-confirm-title">{msg.intent.title}</p>
                      <p className="ai-msg-confirm-meta">
                        类型：{getIntentLabel(msg.intent.type)}
                        {msg.intent.time && ` · 时间：${msg.intent.time}`}
                        {msg.intent.date && ` · 日期：${msg.intent.date}`}
                      </p>
                    </div>
                    <button
                      className="ai-msg-confirm-btn"
                      type="button"
                      onClick={() => handleConfirmCreation(msg.id)}
                      disabled={isCreating}
                    >
                      <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                      确认创建
                    </button>
                  </div>
                )}

                <p className={`ai-msg-time ${msg.role === "user" ? "ai-msg-time-user" : ""}`}>
                  {msg.timestamp.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area with quick actions */}
        <div className="ai-chat-input-bar">
          {/* Quick actions toolbar */}
          <div className="ai-quick-actions">
            {quickActions.map((action) => {
              const Icon = action.Icon;
              const isActive = action.type === activeQuickAction;
              return (
                <button
                  key={action.type}
                  className={`ai-quick-btn ${isActive ? "active" : ""}`}
                  type="button"
                  onClick={() => setActiveQuickAction(isActive ? null : action.type)}
                >
                  <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                  {action.label}
                </button>
              );
            })}
          </div>

          {/* Text input */}
          <form onSubmit={handleSubmit} className="ai-input-form">
            <input
              className="ai-input-field"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              disabled={isCreating}
            />
            <button
              className="ai-send-btn"
              type="submit"
              disabled={!input.trim() || isCreating}
            >
              <Send aria-hidden="true" className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
