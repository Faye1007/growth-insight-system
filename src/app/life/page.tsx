import { CalendarHeart, Gift } from "lucide-react";

import { LifeClient } from "@/components/life/life-client";
import { FeedbackMessage } from "@/components/feedback-message";
import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getAnniversariesForUser,
  getGiftRecordsForUser,
  getLifeEventsForUser,
} from "@/lib/data/user-data";
import type { FeedbackMessage as FeedbackMessageType } from "@/lib/feedback";

type LifePageProps = {
  searchParams?: Promise<{
    tab?: string;
    anniversaryError?: string;
    anniversarySaved?: string;
    giftError?: string;
    giftSaved?: string;
  }>;
};

const anniversaryErrorFeedback: Record<string, FeedbackMessageType> = {
  invalid_input: {
    tone: "error",
    title: "纪念日信息还没填完整",
    detail: "请填写标题、关系对象和日期；提醒日期如果填写，也需要是有效日期。",
  },
  missing_anniversary: {
    tone: "error",
    title: "没有找到这条纪念日",
    detail: "这条纪念日可能已经不存在。请刷新页面后重试。",
  },
  save_failed: {
    tone: "error",
    title: "纪念日没有保存成功",
    detail: "请稍后重试；这次操作不会影响其他记录。",
  },
};

const anniversarySavedFeedback: Record<string, FeedbackMessageType> = {
  created: {
    tone: "success",
    title: "纪念日已保存",
    detail: "这条纪念日已关联到当前账号。",
  },
  updated: {
    tone: "success",
    title: "纪念日已更新",
    detail: "标题、关系对象、日期、提醒日期或备注已保存。",
  },
  deleted: {
    tone: "success",
    title: "纪念日已删除",
    detail: "这条纪念日已从纪念日列表中移除。",
  },
};

const giftErrorFeedback: Record<string, FeedbackMessageType> = {
  invalid_input: {
    tone: "error",
    title: "礼物信息还没填完整",
    detail: "请填写礼物名称、对象、日期和用途；关联纪念日可以不选。",
  },
  missing_gift: {
    tone: "error",
    title: "没有找到这条礼物记录",
    detail: "这条礼物记录可能已经不存在。请刷新页面后重试。",
  },
  save_failed: {
    tone: "error",
    title: "礼物记录没有保存成功",
    detail: "请稍后重试；这次操作不会影响其他记录。",
  },
};

const giftSavedFeedback: Record<string, FeedbackMessageType> = {
  created: {
    tone: "success",
    title: "礼物记录已保存",
    detail: "这条礼物记录已关联到当前账号。",
  },
  updated: {
    tone: "success",
    title: "礼物记录已更新",
    detail: "礼物名称、对象、日期、用途、备注或关联纪念日已保存。",
  },
  deleted: {
    tone: "success",
    title: "礼物记录已删除",
    detail: "这条礼物记录已从纪念日列表中移除。",
  },
};

export default async function LifePage({ searchParams }: LifePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const user = await getCurrentUser();
  const isLoggedIn = Boolean(user);
  const loginPath = buildLoginPath({ next: "/life", message: loginRequiredMessage });

  const anniversaries = user ? await getAnniversariesForUser(user.id) : [];
  const giftRecords = user ? await getGiftRecordsForUser({ userId: user.id }) : [];

  const todayFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayValue = todayFormatter.format(new Date());
  const events = user ? await getLifeEventsForUser(user.id, "2020-01-01", todayValue) : [];

  const tab = params?.tab;
  const initialTab =
    tab === "events" || tab === "anniversaries" || tab === "gifts"
      ? tab
      : "events";

  const anniversaryFeedback =
    anniversaryErrorFeedback[params?.anniversaryError ?? ""] ??
    anniversarySavedFeedback[params?.anniversarySaved ?? ""] ??
    null;
  const giftFeedback =
    giftErrorFeedback[params?.giftError ?? ""] ??
    giftSavedFeedback[params?.giftSaved ?? ""] ??
    null;

  return (
    <div className="page-stack">
      <LifeClient
        initialTab={initialTab as "events" | "anniversaries" | "gifts"}
        events={events}
        anniversaries={anniversaries}
        giftRecords={giftRecords}
        isLoggedIn={isLoggedIn}
        loginPath={loginPath}
      />

      <FeedbackMessage feedback={anniversaryFeedback} />
      <FeedbackMessage feedback={giftFeedback} />
    </div>
  );
}
