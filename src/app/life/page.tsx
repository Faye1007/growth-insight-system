import Link from "next/link";
import { CalendarHeart, Gift, PlusCircle } from "lucide-react";

import {
  createAnniversaryAction,
  createGiftRecordAction,
  softDeleteAnniversaryAction,
  softDeleteGiftRecordAction,
  updateAnniversaryAction,
  updateGiftRecordAction,
} from "@/app/life/actions";
import { LifeClient } from "@/components/life/life-client";
import { FeedbackMessage } from "@/components/feedback-message";
import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getAnniversariesForUser,
  getGiftRecordsForUser,
  getLifeEventsForUser,
  type AnniversaryRecord,
  type GiftRecord,
} from "@/lib/data/user-data";
import type { FeedbackMessage as FeedbackMessageType } from "@/lib/feedback";

type LifePageProps = {
  searchParams?: Promise<{
    tab?: string;
    anniversaryError?: string;
    anniversarySaved?: string;
    giftError?: string;
    giftSaved?: string;
    giftRecipient?: string;
    giftAnniversaryId?: string;
  }>;
};

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

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

function formatDateValue(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00+08:00`));
}

function getBeijingDateValue(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(date);
}

function getDaysUntilNextAnniversary(value: string) {
  const todayValue = getBeijingDateValue();
  const today = new Date(`${todayValue}T00:00:00+08:00`);
  const todayYear = Number(todayValue.slice(0, 4));
  const monthDay = value.slice(5);
  let nextDate = new Date(`${todayYear}-${monthDay}T00:00:00+08:00`);

  if (nextDate < today) {
    nextDate = new Date(`${todayYear + 1}-${monthDay}T00:00:00+08:00`);
  }

  return Math.max(
    Math.round((nextDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)),
    0,
  );
}

function getAnniversaryTitle(
  anniversaries: AnniversaryRecord[],
  anniversaryId: string | null,
) {
  if (!anniversaryId) {
    return null;
  }

  return anniversaries.find((item) => item.id === anniversaryId)?.title ?? null;
}

function AnniversaryForm({
  action,
  anniversary,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  anniversary?: AnniversaryRecord;
  submitLabel: string;
}) {
  return (
    <form action={action} className="task-form">
      {anniversary ? (
        <input type="hidden" name="anniversaryId" value={anniversary.id} />
      ) : null}
      <div className="task-form-grid">
        <label className="form-field">
          标题
          <input
            name="title"
            required
            defaultValue={anniversary?.title}
            placeholder="例如：妈妈生日、结婚纪念日"
          />
        </label>
        <label className="form-field">
          关系对象
          <input
            name="personName"
            required
            defaultValue={anniversary?.personName}
            placeholder="例如：妈妈、朋友 A、自己"
          />
        </label>
        <label className="form-field">
          日期
          <input
            name="anniversaryDate"
            type="date"
            required
            defaultValue={anniversary?.anniversaryDate ?? getBeijingDateValue()}
          />
        </label>
        <label className="form-field">
          提醒日期
          <input
            name="reminderDate"
            type="date"
            defaultValue={anniversary?.reminderDate ?? ""}
          />
        </label>
        <label className="form-field sm:col-span-2">
          备注
          <textarea
            name="note"
            rows={3}
            defaultValue={anniversary?.note ?? ""}
            placeholder="可以写礼物偏好、需要提前准备的事项或当天安排。"
          />
        </label>
      </div>
      <div className="task-edit-actions">
        <button className="soft-button" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function GiftRecordForm({
  action,
  anniversaries,
  giftRecord,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  anniversaries: AnniversaryRecord[];
  giftRecord?: GiftRecord;
  submitLabel: string;
}) {
  return (
    <form action={action} className="task-form">
      {giftRecord ? <input type="hidden" name="giftRecordId" value={giftRecord.id} /> : null}
      <div className="task-form-grid">
        <label className="form-field">
          礼物名称
          <input
            name="giftName"
            required
            defaultValue={giftRecord?.giftName}
            placeholder="例如：护手霜、书、花束"
          />
        </label>
        <label className="form-field">
          对象
          <input
            name="recipientName"
            required
            defaultValue={giftRecord?.recipientName}
            placeholder="例如：妈妈、朋友 A、自己"
          />
        </label>
        <label className="form-field">
          日期
          <input
            name="giftDate"
            type="date"
            required
            defaultValue={giftRecord?.giftDate ?? getBeijingDateValue()}
          />
        </label>
        <label className="form-field">
          用途
          <input
            name="purpose"
            required
            defaultValue={giftRecord?.purpose}
            placeholder="例如：生日、感谢、节日、探望"
          />
        </label>
        <label className="form-field sm:col-span-2">
          关联纪念日
          <select name="anniversaryId" defaultValue={giftRecord?.anniversaryId ?? ""}>
            <option value="">不关联纪念日</option>
            {anniversaries.map((anniversary) => (
              <option key={anniversary.id} value={anniversary.id}>
                {anniversary.title} · {anniversary.personName}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field sm:col-span-2">
          备注
          <textarea
            name="note"
            rows={3}
            defaultValue={giftRecord?.note ?? ""}
            placeholder="可以写价格区间、对方反馈、下次避雷或同类备选。"
          />
        </label>
      </div>
      <div className="task-edit-actions">
        <button className="soft-button" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function AnniversaryCard({ anniversary }: { anniversary: AnniversaryRecord }) {
  const daysUntil = getDaysUntilNextAnniversary(anniversary.anniversaryDate);

  return (
    <article className="record-timeline-item tone-clay">
      <div className="nav-icon">
        <CalendarHeart aria-hidden="true" className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="record-item-heading">
          <span className="status-pill">{formatDateValue(anniversary.anniversaryDate)}</span>
          <span className="status-pill">
            {daysUntil === 0 ? "今天" : `${daysUntil} 天后`}
          </span>
        </div>
        <h3 className="list-label mt-3">{anniversary.title}</h3>
        <p className="body-copy mt-1">关系对象：{anniversary.personName}</p>
        {anniversary.note ? (
          <p className="body-copy mt-2">{anniversary.note}</p>
        ) : null}
        <div className="overview-detail-row mt-3">
          {anniversary.reminderDate ? (
            <span className="status-pill">提醒 {formatDateValue(anniversary.reminderDate)}</span>
          ) : (
            <span className="status-pill">暂未设置提醒日期</span>
          )}
          <span className="status-pill">只记录，不推送</span>
        </div>

        <details className="create-disclosure mt-4">
          <summary className="create-summary quiet-button w-fit">编辑纪念日</summary>
          <div className="mt-3">
            <AnniversaryForm
              action={updateAnniversaryAction}
              anniversary={anniversary}
              submitLabel="保存修改"
            />
            <form action={softDeleteAnniversaryAction} className="danger-zone mt-3">
              <input type="hidden" name="anniversaryId" value={anniversary.id} />
              <div>
                <h4 className="list-label">删除纪念日</h4>
                <p className="body-copy mt-1">
                  删除后这条纪念日不会再出现在纪念日列表中。
                </p>
              </div>
              <button className="quiet-button danger-button" type="submit">
                删除
              </button>
            </form>
          </div>
        </details>
      </div>
    </article>
  );
}

function GiftRecordCard({
  anniversaries,
  giftRecord,
}: {
  anniversaries: AnniversaryRecord[];
  giftRecord: GiftRecord;
}) {
  const anniversaryTitle = getAnniversaryTitle(anniversaries, giftRecord.anniversaryId);

  return (
    <article className="record-timeline-item tone-lavender">
      <div className="nav-icon">
        <Gift aria-hidden="true" className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="record-item-heading">
          <span className="status-pill">{formatDateValue(giftRecord.giftDate)}</span>
          <span className="status-pill">{giftRecord.purpose}</span>
        </div>
        <h3 className="list-label mt-3">{giftRecord.giftName}</h3>
        <p className="body-copy mt-1">对象：{giftRecord.recipientName}</p>
        {giftRecord.note ? <p className="body-copy mt-2">{giftRecord.note}</p> : null}
        <div className="overview-detail-row mt-3">
          {anniversaryTitle ? (
            <span className="status-pill">关联 {anniversaryTitle}</span>
          ) : (
            <span className="status-pill">未关联纪念日</span>
          )}
          <span className="status-pill">历史记录</span>
        </div>

        <details className="create-disclosure mt-4">
          <summary className="create-summary quiet-button w-fit">编辑礼物</summary>
          <div className="mt-3">
            <GiftRecordForm
              action={updateGiftRecordAction}
              anniversaries={anniversaries}
              giftRecord={giftRecord}
              submitLabel="保存修改"
            />
            <form action={softDeleteGiftRecordAction} className="danger-zone mt-3">
              <input type="hidden" name="giftRecordId" value={giftRecord.id} />
              <div>
                <h4 className="list-label">删除礼物记录</h4>
                <p className="body-copy mt-1">
                  删除后这条礼物记录不会再出现在纪念日列表中。
                </p>
              </div>
              <button className="quiet-button danger-button" type="submit">
                删除
              </button>
            </form>
          </div>
        </details>
      </div>
    </article>
  );
}

export default async function LifePage({ searchParams }: LifePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const user = await getCurrentUser();
  const isLoggedIn = Boolean(user);
  const loginPath = buildLoginPath({ next: "/life", message: loginRequiredMessage });

  const anniversaries = user ? await getAnniversariesForUser(user.id) : [];
  const giftRecipientFilter = params?.giftRecipient?.trim() ?? "";
  const giftAnniversaryFilter = params?.giftAnniversaryId?.trim() ?? "";
  const giftRecords = user
    ? await getGiftRecordsForUser({
        userId: user.id,
        recipientName: giftRecipientFilter || undefined,
        anniversaryId: giftAnniversaryFilter || undefined,
      })
    : [];

  const todayValue = getBeijingDateValue();
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
      />

      <FeedbackMessage feedback={anniversaryFeedback} />
      <FeedbackMessage feedback={giftFeedback} />

      {!isLoggedIn ? (
        <section className="panel-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-heading">登录后维护人生记录</h2>
              <p className="body-copy mt-2">
                未登录时可以浏览页面结构；登录后可以保存自己的事件、纪念日和礼物记录。
              </p>
            </div>
            <Link className="soft-button w-full sm:w-auto" href={loginPath}>
              登录 / 注册
            </Link>
          </div>
        </section>
      ) : null}

      {/* Anniversary CRUD section */}
      {isLoggedIn && (
        <section id="anniversaries" aria-labelledby="anniversaries-title" className="panel-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="page-kicker">纪念日</p>
              <h2 id="anniversaries-title" className="section-heading mt-1">
                纪念日维护
              </h2>
            </div>
          </div>

          <details className="create-disclosure mt-5">
            <summary className="create-summary soft-button w-fit">
              <PlusCircle aria-hidden="true" className="h-4 w-4" />
              新增纪念日
            </summary>
            <div className="mt-3">
              <AnniversaryForm action={createAnniversaryAction} submitLabel="保存纪念日" />
            </div>
          </details>

          {anniversaries.length ? (
            <div className="record-timeline mt-5">
              {anniversaries.map((anniversary) => (
                <AnniversaryCard key={anniversary.id} anniversary={anniversary} />
              ))}
            </div>
          ) : (
            <div className="empty-state mt-5">
              <span className="empty-icon">
                <CalendarHeart aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="list-label">暂无纪念日记录</p>
                <p className="body-copy mt-1">
                  登录后可以保存生日、纪念日或其他需要提前准备的重要日期。
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Gift CRUD section */}
      {isLoggedIn && (
        <section id="gifts" aria-labelledby="gifts-title" className="panel-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="page-kicker">礼物</p>
              <h2 id="gifts-title" className="section-heading mt-1">
                礼物维护
              </h2>
            </div>
          </div>

          <details className="create-disclosure mt-5">
            <summary className="create-summary soft-button w-fit">
              <PlusCircle aria-hidden="true" className="h-4 w-4" />
              新增礼物记录
            </summary>
            <div className="mt-3">
              <GiftRecordForm
                action={createGiftRecordAction}
                anniversaries={anniversaries}
                submitLabel="保存礼物"
              />
            </div>
          </details>

          <form action="/life#gifts" className="task-form mt-5">
            <div className="task-form-grid">
              <label className="form-field">
                按对象筛选
                <select name="giftRecipient" defaultValue={giftRecipientFilter}>
                  <option value="">全部对象</option>
                  {Array.from(
                    new Set(giftRecords.map((g) => g.recipientName)),
                  )
                    .sort((a, b) => a.localeCompare(b, "zh-CN"))
                    .map((recipientName) => (
                      <option key={recipientName} value={recipientName}>
                        {recipientName}
                      </option>
                    ))}
                </select>
              </label>
              <label className="form-field">
                按纪念日筛选
                <select name="giftAnniversaryId" defaultValue={giftAnniversaryFilter}>
                  <option value="">全部纪念日</option>
                  {anniversaries.map((anniversary) => (
                    <option key={anniversary.id} value={anniversary.id}>
                      {anniversary.title} · {anniversary.personName}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="task-edit-actions">
              <button className="soft-button" type="submit">
                应用筛选
              </button>
              <Link className="quiet-button" href="/life#gifts">
                清除筛选
              </Link>
            </div>
          </form>

          {giftRecords.length ? (
            <div className="record-timeline mt-5">
              {giftRecords.map((giftRecord) => (
                <GiftRecordCard
                  key={giftRecord.id}
                  anniversaries={anniversaries}
                  giftRecord={giftRecord}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state mt-5">
              <span className="empty-icon">
                <Gift aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="list-label">暂无礼物记录</p>
                <p className="body-copy mt-1">
                  登录后可以记录送出或收到的礼物，并按对象或纪念日回看。
                </p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
