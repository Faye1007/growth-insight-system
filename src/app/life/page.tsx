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
import type { AnniversaryRecord, GiftRecord, LifeEventRecord } from "@/lib/data/user-data";

type LifePageProps = {
  searchParams?: Promise<{
    tab?: string;
    anniversaryError?: string;
    anniversarySaved?: string;
    giftError?: string;
    giftSaved?: string;
    eventError?: string;
    eventCreated?: string;
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

const dataLoadFeedback: FeedbackMessageType = {
  tone: "error",
  title: "人生数据暂时没有加载完整",
  detail: "事件、纪念日或礼物记录中有一部分读取失败。可以先刷新页面；如果仍然失败，其他功能不会受影响。",
};

function settledValue<T>(result: PromiseSettledResult<T>, fallback: T) {
  return result.status === "fulfilled" ? result.value : fallback;
}

export default async function LifePage({ searchParams }: LifePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const user = await getCurrentUser();
  const isLoggedIn = Boolean(user);
  const loginPath = buildLoginPath({ next: "/life", message: loginRequiredMessage });

  const todayFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayValue = todayFormatter.format(new Date());
  let events: LifeEventRecord[] = [];
  let anniversaries: AnniversaryRecord[] = [];
  let giftRecords: GiftRecord[] = [];
  let hasDataLoadError = false;

  if (user) {
    const [eventsResult, anniversariesResult, giftRecordsResult] = await Promise.allSettled([
      getLifeEventsForUser(user.id, "2020-01-01", todayValue),
      getAnniversariesForUser(user.id),
      getGiftRecordsForUser({ userId: user.id }),
    ]);

    events = settledValue(eventsResult, []);
    anniversaries = settledValue(anniversariesResult, []);
    giftRecords = settledValue(giftRecordsResult, []);
    hasDataLoadError = [eventsResult, anniversariesResult, giftRecordsResult].some(
      (result) => result.status === "rejected",
    );
  }

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
  const eventCreatedFeedback: FeedbackMessageType | null =
    params?.eventCreated === "1"
      ? { tone: "success", title: "事件已保存", detail: "这条事件已添加到列表中。" }
      : null;
  const eventErrorFeedback: FeedbackMessageType | null =
    params?.eventError === "missing_content"
      ? { tone: "error", title: "事件内容不能为空", detail: "请填写事件内容后重试。" }
      : params?.eventError === "save_failed"
        ? { tone: "error", title: "事件没有保存成功", detail: "请稍后重试。" }
        : null;

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
      <FeedbackMessage feedback={eventCreatedFeedback} />
      <FeedbackMessage feedback={eventErrorFeedback} />
      <FeedbackMessage feedback={hasDataLoadError ? dataLoadFeedback : null} />
    </div>
  );
}
