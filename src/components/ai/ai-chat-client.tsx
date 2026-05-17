"use client";

import { useState, useRef, useEffect } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
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

type IntentType = "task" | "schedule" | "habit" | "event" | "idea" | "anniversary" | null;

type ChatMessage = {
  id: string;
  role: "user" | "system" | "confirmation";
  content: string;
  intent?: {
    type: IntentType;
    title: string;
    category: string;
    date: string;
    time?: string;
    endTime?: string;
    emotionTags?: string[];
    tags?: string[];
    personName?: string;
    anniversaryDate?: string;
  };
  timestamp: Date;
};

const quickActions: Array<{
  type: IntentType;
  label: string;
  Icon: typeof CheckCircle2;
  placeholder: string;
}> = [
  { type: "task", label: "创建任务", Icon: CheckCircle2, placeholder: "输入任务标题..." },
  { type: "schedule", label: "创建日程", Icon: Clock, placeholder: "输入日程标题..." },
  { type: "habit", label: "创建习惯", Icon: Heart, placeholder: "输入习惯名称..." },
  { type: "event", label: "记录事件", Icon: Sparkles, placeholder: "记录今天发生的事..." },
  { type: "idea", label: "记录灵感", Icon: Lightbulb, placeholder: "记录你的想法..." },
  { type: "anniversary", label: "创建纪念日", Icon: CalendarDays, placeholder: "输入纪念日标题..." },
];

function getBeijingDateValue(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(date);
}

function parseIntent(text: string): { type: IntentType; title: string; category: string; date: string; time?: string } | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const today = getBeijingDateValue();

  // Task patterns
  const taskPatterns = [
    /^(?:创建|新增|添加|加一个)?(?:任务|todo|待办)[：:]?\s*(.+)$/i,
    /^(?:今天|明天|后天)?(?:要|需要|得)?(.{2,})$/i,
  ];
  for (const pattern of taskPatterns) {
    const match = trimmed.match(pattern);
    if (match) {
      return { type: "task", title: match[1] || trimmed, category: "other", date: today };
    }
  }

  // Schedule patterns
  const schedulePatterns = [
    /^(?:创建|新增|添加)?(?:日程|会议|约会|安排)[：:]?\s*(.+)$/i,
    /^(?:明天|后天|下周)?(?:上午|下午|晚上|早上|中午|晚上)?(.{2,})(?:点|时|:)\s*(\d{1,2}):?(\d{2})?/i,
  ];
  for (const pattern of schedulePatterns) {
    const match = trimmed.match(pattern);
    if (match) {
      const timeMatch = trimmed.match(/(\d{1,2}):?(\d{2})/);
      return {
        type: "schedule",
        title: match[1] || trimmed,
        category: "other",
        date: today,
        time: timeMatch ? `${timeMatch[1].padStart(2, "0")}:${timeMatch[2] || "00"}` : undefined,
      };
    }
  }

  // Habit patterns
  const habitPatterns = [
    /^(?:创建|新增|添加|养成)?(?:习惯|打卡|每日)[：:]?\s*(.+)$/i,
    /^(?:每天|每日|每周)?(?:坚持|开始)?(.{2,})(?:打卡|习惯)?$/i,
  ];
  for (const pattern of habitPatterns) {
    const match = trimmed.match(pattern);
    if (match) {
      return { type: "habit", title: match[1] || trimmed, category: "health", date: today };
    }
  }

  // Event patterns
  const eventPatterns = [
    /^(?:记录|记下|写一下)?(?:事件|今天|心情|感受)[：:]?\s*(.+)$/i,
    /^(?:今天|刚才|刚刚)(.{3,})$/i,
  ];
  for (const pattern of eventPatterns) {
    const match = trimmed.match(pattern);
    if (match) {
      return { type: "event", title: match[1] || trimmed, category: "other", date: today };
    }
  }

  // Idea patterns
  const ideaPatterns = [
    /^(?:记录|记下|想到)?(?:灵感|想法|创意|点子)[：:]?\s*(.+)$/i,
    /^(?:突然想到|有个想法|想)(.{3,})$/i,
  ];
  for (const pattern of ideaPatterns) {
    const match = trimmed.match(pattern);
    if (match) {
      return { type: "idea", title: match[1] || trimmed, category: "other", date: today };
    }
  }

  // Default: treat as task
  if (trimmed.length >= 2) {
    return { type: "task", title: trimmed, category: "other", date: today };
  }

  return null;
}

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
  const [activeQuickAction, setActiveQuickAction] = useState<IntentType>(null);
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
      ? { type: activeQuickAction, title: text, category: "other", date: getBeijingDateValue() }
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

    const confirmMessage: ChatMessage = {
      id: `confirm-${nextId()}`,
      role: "confirmation",
      content: `识别到意图：${getIntentLabel(intent.type)}`,
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
          直接输入内容，AI 会自动识别意图并创建对应记录。也可以点击下方快捷键快速创建。
        </p>
      </header>

      {/* Chat messages */}
      <div className="panel-card min-h-[24rem] max-h-[36rem] overflow-y-auto">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-[var(--mist)] text-white"
                    : msg.role === "confirmation"
                      ? "bg-[var(--card-muted)] border border-[var(--border)]"
                      : "bg-[var(--surface)]"
                }`}
              >
                <p className="text-sm">{msg.content}</p>

                {msg.role === "confirmation" && msg.intent && (
                  <div className="mt-3 space-y-2">
                    <div className="rounded-md bg-[var(--card)] p-3 text-sm">
                      <p className="font-semibold">{msg.intent.title}</p>
                      <p className="text-[var(--muted-foreground)] mt-1">
                        类型：{getIntentLabel(msg.intent.type)}
                        {msg.intent.time && ` · 时间：${msg.intent.time}`}
                        {msg.intent.date && ` · 日期：${msg.intent.date}`}
                      </p>
                    </div>
                    <button
                      className="soft-button w-full text-sm"
                      type="button"
                      onClick={() => handleConfirmCreation(msg.id)}
                      disabled={isCreating}
                    >
                      <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                      确认创建
                    </button>
                  </div>
                )}

                <p className="text-xs text-[var(--muted-foreground)] mt-2">
                  {msg.timestamp.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => {
          const Icon = action.Icon;
          const isActive = action.type === activeQuickAction;
          return (
            <button
              key={action.type}
              className={`quiet-button text-sm ${isActive ? "bg-[var(--mist-soft)] border-[var(--mist)]" : ""}`}
              type="button"
              onClick={() => setActiveQuickAction(isActive ? null : action.type)}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {action.label}
            </button>
          );
        })}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 min-h-[2.75rem] border border-[var(--border-strong)] rounded-md bg-[var(--surface)] px-3 text-sm"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={isCreating}
        />
        <button
          className="soft-button"
          type="submit"
          disabled={!input.trim() || isCreating}
        >
          <Send aria-hidden="true" className="h-4 w-4" />
          发送
        </button>
      </form>
    </div>
  );
}
