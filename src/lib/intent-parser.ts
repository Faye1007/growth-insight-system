import { getBeijingDateValue, getBeijingDateAfter } from "@/lib/date";

export type IntentType = "task" | "schedule" | "habit" | "event" | "idea" | "anniversary" | "gift";

export type ParsedIntent = {
  type: IntentType;
  title: string;
  category: string;
  date: string;
  time?: string;
  endTime?: string;
  confidence: "high" | "medium" | "low";
};

const weekdayNames: Record<string, number> = {
  一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 日: 7, 天: 7,
  mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 7,
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7,
};

function parseChineseWeekday(text: string): number | null {
  const match = text.match(/[周|星期]([一二三四五六日天])/);
  if (match) return weekdayNames[match[1]];
  const engMatch = text.match(/(?:this|next|last)\s+(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
  if (engMatch) return weekdayNames[engMatch[1].toLowerCase()];
  return null;
}

function parseRelativeDateFromText(text: string): { date: string; rest: string } {
  const today = new Date();
  const todayStr = getBeijingDateValue();

  // 明天 / 后天
  const dayOffsetMatch = text.match(/^(今天|明天|后天|昨天|前天)/);
  if (dayOffsetMatch) {
    const map: Record<string, number> = { 今天: 0, 明天: 1, 后天: 2, 昨天: -1, 前天: -2 };
    const rest = text.slice(dayOffsetMatch[1].length).trim();
    return { date: getBeijingDateAfter(map[dayOffsetMatch[1]]), rest };
  }

  // 下周一 / 这周五
  const weekdayMatch = text.match(/^(下[周|星期]|这[周|星期]|本[周|星期])([一二三四五六日天])/);
  if (weekdayMatch) {
    const targetDay = weekdayNames[weekdayMatch[2]];
    const isNext = weekdayMatch[1].startsWith("下");
    const currentDay = today.getDay() || 7; // Sunday = 7
    let diff = targetDay - currentDay;
    if (isNext) diff += 7;
    if (diff <= 0 && !isNext) diff += 7; // "这周五"如果在周五之后，推到下周五
    const rest = text.slice(weekdayMatch[0].length).trim();
    return { date: getBeijingDateAfter(diff), rest };
  }

  // 下个月X号
  const monthDayMatch = text.match(/^下个月(\d{1,2})[号|日]/);
  if (monthDayMatch) {
    const day = parseInt(monthDayMatch[1], 10);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, day);
    const rest = text.slice(monthDayMatch[0].length).trim();
    return { date: getBeijingDateValue(nextMonth), rest };
  }

  return { date: todayStr, rest: text };
}

// 时间段 → hour offset
const periodToOffset: Record<string, number> = {
  早上: 6, 早晨: 6, 上午: 9, 中午: 12, 下午: 13, 晚上: 18, 夜间: 21, 半夜: 0,
};

// category keywords → category value
const categoryKeywords: Array<{ keywords: string[]; category: string }> = [
  { keywords: ["看医生", "牙医", "体检", "吃药", "复诊", "医院", "看病", "开药"], category: "health" },
  { keywords: ["健身", "跑步", "瑜伽", "冥想", "游泳", "打球", "锻炼", "运动", "散步", "早睡", "早起", "喝水"], category: "health" },
  { keywords: ["读书", "学习", "上课", "考试", "复习", "笔记", "论文", "作业", "看书", "阅读", "备考"], category: "study" },
  { keywords: ["开会", "汇报", "面试", "客户", "方案", "ppt", "邮件", "项目", "工作", "上班", "加班", "出差", "述职"], category: "work" },
  { keywords: ["买菜", "做饭", "打扫", "洗衣", "购物", "缴费", "还钱", "买", "修"], category: "life" },
];

function inferCategory(title: string): string {
  const lower = title.toLowerCase();
  for (const { keywords, category } of categoryKeywords) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return "other";
}

// Time parsing helpers
const timePatterns: Array<{ re: RegExp; parse: (m: RegExpExecArray) => { hour: number; minute: number } | null }> = [
  // 下午3点 / 下午3点半
  {
    re: /(早上|上午|中午|下午|晚上|夜间|半夜)?(\d{1,2})[：:点\.](半|(\d{1,2})[分]?)?/,
    parse: (m) => {
      let hour = parseInt(m[2], 10);
      const period = m[1];
      const minute = m[4] ? parseInt(m[4], 10) : m[3] === "半" ? 30 : 0;
      if (period === "下午" || period === "晚上" || period === "夜间") {
        if (hour < 12) hour += 12;
      } else if (period === "半夜") {
        if (hour >= 1 && hour <= 5) hour += 0; // keep as is (0-5)
        else hour = 0;
      }
      if (minute >= 60) return null;
      return { hour, minute };
    },
  },
  // 15:00 / 15：00
  {
    re: /(\d{1,2})[：:](\d{2})/,
    parse: (m) => {
      const hour = parseInt(m[1], 10);
      const minute = parseInt(m[2], 10);
      if (hour >= 24 || minute >= 60) return null;
      return { hour, minute };
    },
  },
  // 3pm / 3:00pm
  {
    re: /(\d{1,2})(?:[：:](\d{2}))?\s*(pm|am|p\.m\.|a\.m\.)/i,
    parse: (m) => {
      let hour = parseInt(m[1], 10);
      const minute = m[2] ? parseInt(m[2], 10) : 0;
      const isPM = /pm|p\.m\./i.test(m[3]);
      if (isPM && hour < 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
      if (minute >= 60) return null;
      return { hour, minute };
    },
  },
];

function parseTimeFromText(text: string): { time: string | undefined; rest: string } {
  for (const { re, parse } of timePatterns) {
    const m = re.exec(text);
    if (m) {
      const result = parse(m);
      if (result && result.hour >= 0 && result.hour <= 23) {
        const timeStr = `${String(result.hour).padStart(2, "0")}:${String(result.minute).padStart(2, "0")}`;
        const rest = text.slice(0, m.index) + text.slice(m.index + m[0].length);
        return { time: timeStr, rest: rest.trim() };
      }
    }
  }
  return { time: undefined, rest: text };
}

function detectPrefixType(text: string): { type: IntentType | null; clean: string } {
  const lower = text.toLowerCase();

  // Explicit intent prefixes extract the remainder
  const prefixRules: Array<{ pattern: RegExp; type: IntentType }> = [
    { pattern: /^(?:创建|新增|添加|加一个|记一个)(?:任务|todo|待办)[：:]?\s*/i, type: "task" },
    { pattern: /^(?:创建|新增|添加)(?:日程|会议|约会|安排)[：:]?\s*/i, type: "schedule" },
    { pattern: /^(?:创建|新增|添加|养成)(?:习惯|打卡|每日)[：:]?\s*/i, type: "habit" },
    { pattern: /^(?:记录|记下|写一下)(?:事件|心情|感受)[：:]?\s*/i, type: "event" },
    { pattern: /^(?:记录|记下|想到)(?:灵感|想法|创意|点子)[：:]?\s*/i, type: "idea" },
    { pattern: /^(?:创建|新增|添加)(?:纪念日)[：:]?\s*/i, type: "anniversary" },
    { pattern: /^(?:记录|新增|添加)(?:礼物)[：:]?\s*/i, type: "gift" },
  ];

  for (const { pattern, type } of prefixRules) {
    if (pattern.test(text)) {
      return { type, clean: text.replace(pattern, "").trim() };
    }
  }

  return { type: null, clean: text };
}

function detectImplicitType(text: string, date: string): { type: IntentType | null; confidence: "high" | "medium" | "low" } {
  const lower = text.toLowerCase();

  // 日期 + 时间 + 内容 → schedule
  const timeInText = text.match(/[：:点\.]|(?:am|pm)/i);
  const hasTime = timeInText !== null;
  // If date ≠ today and has time → high confidence schedule
  if (date !== getBeijingDateValue() && hasTime) {
    return { type: "schedule", confidence: "high" };
  }

  // Event patterns
  if (/^(?:今天|刚才|刚刚)/.test(text) && text.length >= 5) {
    return { type: "event", confidence: "high" };
  }

  // Habit keywords
  if (/(?:每天|每日|坚持|打卡|每周)/.test(lower) && text.length >= 4) {
    return { type: "habit", confidence: "medium" };
  }

  // Idea keywords
  if (/(?:突然想到|有个想法|灵感)/.test(lower)) {
    return { type: "idea", confidence: "medium" };
  }

  // Default to task if text is long enough
  if (text.length >= 4) {
    return { type: "task", confidence: "medium" };
  }

  return { type: null, confidence: "low" };
}

export function parseIntent(text: string): ParsedIntent | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Step 1: Detect explicit prefix type
  const { type: explicitType, clean: afterPrefix } = detectPrefixType(trimmed);

  // Step 2: Parse date
  const { date, rest: afterDate } = parseRelativeDateFromText(explicitType ? afterPrefix : trimmed);

  // Step 3: Parse time
  const { time, rest: afterTime } = parseTimeFromText(afterDate);

  // Step 4: Determine type
  let type: IntentType;
  let confidence: "high" | "medium" | "low";

  if (explicitType) {
    type = explicitType;
    confidence = "high";
  } else {
    const implicit = detectImplicitType(afterTime, date);
    if (!implicit.type) return null;
    type = implicit.type;
    confidence = implicit.confidence;
  }

  // Step 5: Infer category
  const category = inferCategory(afterTime);

  return {
    type,
    title: afterTime || trimmed,
    category,
    date,
    time,
    confidence,
  };
}
