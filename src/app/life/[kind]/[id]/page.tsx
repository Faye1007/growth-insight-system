import Link from "next/link";
import type { ReactNode } from "react";

import {
  softDeleteAnniversaryAction,
  softDeleteGiftRecordAction,
  updateAnniversaryAction,
  updateGiftRecordAction,
} from "@/app/life/actions";
import { FeedbackMessage } from "@/components/feedback-message";
import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getAnniversariesForUser,
  getAnniversaryDetailForUser,
  getGiftRecordsForUser,
  getGiftRecordDetailForUser,
} from "@/lib/data/user-data/index";
import type { FeedbackMessage as FeedbackMessageType } from "@/lib/feedback";

type LifeDetailKind = "anniversary" | "gift";
type LifeDetailPageProps = {
  params: Promise<{
    kind?: string;
    id?: string;
  }>;
  searchParams?: Promise<{
    anniversaryError?: string;
    anniversarySaved?: string;
    giftError?: string;
    giftSaved?: string;
  }>;
};

const kindLabels: Record<LifeDetailKind, string> = {
  anniversary: "纪念日详情",
  gift: "礼物详情",
};

const anniversaryTypeLabels: Record<string, string> = {
  anniversary: "纪念日",
  birthday: "生日",
};

const reminderModeLabels: Record<string, string> = {
  once: "一次性",
  yearly: "按年",
};

const anniversaryErrorFeedback: Record<string, FeedbackMessageType> = {
  invalid_input: {
    tone: "error",
    title: "纪念日信息还没填完整",
    detail: "请填写标题、关系对象和日期；提醒日期如果填写，也需要是有效日期。",
  },
  save_failed: {
    tone: "error",
    title: "纪念日没有保存成功",
    detail: "请稍后重试；这次操作不会影响其他记录。",
  },
};

const anniversarySavedFeedback: Record<string, FeedbackMessageType> = {
  updated: {
    tone: "success",
    title: "纪念日已更新",
    detail: "标题、关系对象、日期、提醒日期或备注已保存。",
  },
};

const giftErrorFeedback: Record<string, FeedbackMessageType> = {
  invalid_input: {
    tone: "error",
    title: "礼物信息还没填完整",
    detail: "请填写礼物名称、对象和日期；对方回礼和关联纪念日选填。",
  },
  save_failed: {
    tone: "error",
    title: "礼物记录没有保存成功",
    detail: "请稍后重试；这次操作不会影响其他记录。",
  },
};

const giftSavedFeedback: Record<string, FeedbackMessageType> = {
  updated: {
    tone: "success",
    title: "礼物记录已更新",
    detail: "礼物名称、对象、日期、对方回礼、备注或关联纪念日已保存。",
  },
};

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function isLifeDetailKind(value: string | undefined): value is LifeDetailKind {
  return value === "anniversary" || value === "gift";
}

function formatDateValue(value: string | null | undefined) {
  return value ? dateFormatter.format(new Date(`${value}T00:00:00+08:00`)) : "未记录";
}

function formatDateTimeValue(value: Date | null | undefined) {
  return value ? dateTimeFormatter.format(value) : "未记录";
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-field">
      <span>{label}</span>
      <strong>{value || "未记录"}</strong>
    </div>
  );
}

function NotFoundState() {
  return (
    <section className="panel-card">
      <h2 className="section-heading">没有找到这条记录</h2>
      <p className="body-copy mt-2">
        这条记录可能不存在、已被删除，或不属于当前登录账号。
      </p>
      <Link className="soft-button mt-4 w-fit" href="/life">
        返回人生页
      </Link>
    </section>
  );
}

function DetailLayout({
  kindLabel,
  title,
  children,
}: {
  kindLabel: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="page-kicker">人生</p>
        <h1 className="page-title">{kindLabel}</h1>
        <p className="page-description">{title}</p>
        <Link className="quiet-button mt-4 w-fit" href="/life">
          返回人生页
        </Link>
      </header>
      {children}
    </div>
  );
}

export default async function LifeDetailPage({ params, searchParams }: LifeDetailPageProps) {
  const { kind, id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const user = await getCurrentUser();
  const detailPath = isLifeDetailKind(kind) && id ? `/life/${kind}/${id}` : "/life";
  const loginPath = buildLoginPath({ next: detailPath, message: loginRequiredMessage });

  if (!isLifeDetailKind(kind) || !id) {
    return (
      <div className="page-stack">
        <header className="page-header">
          <p className="page-kicker">人生</p>
          <h1 className="page-title">记录详情</h1>
        </header>
        <NotFoundState />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-stack">
        <header className="page-header">
          <p className="page-kicker">人生</p>
          <h1 className="page-title">{kindLabels[kind]}</h1>
          <p className="page-description">登录后才能查看个人记录详情。</p>
        </header>
        <section className="panel-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-heading">需要登录</h2>
              <p className="body-copy mt-2">这条详情属于个人数据，登录后会回到当前详情页。</p>
            </div>
            <Link className="soft-button w-full sm:w-auto" href={loginPath}>
              登录 / 注册
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (kind === "anniversary") {
    const [anniversary, relatedGifts] = await Promise.all([
      getAnniversaryDetailForUser(user.id, id),
      getGiftRecordsForUser({ userId: user.id, anniversaryId: id }),
    ]);
    const anniversaryError =
      anniversaryErrorFeedback[resolvedSearchParams?.anniversaryError ?? ""] ?? null;
    const anniversarySaved =
      anniversarySavedFeedback[resolvedSearchParams?.anniversarySaved ?? ""] ?? null;

    if (!anniversary) {
      return (
        <DetailLayout kindLabel={kindLabels[kind]} title="未找到记录">
          <NotFoundState />
        </DetailLayout>
      );
    }

    return (
      <DetailLayout kindLabel={kindLabels[kind]} title={anniversary.title}>
        <FeedbackMessage feedback={anniversaryError} />
        <FeedbackMessage feedback={anniversarySaved} />
        <section className="panel-card">
          <div className="detail-grid">
            <DetailField label="标题" value={anniversary.title} />
            <DetailField label="关系对象" value={anniversary.personName} />
            <DetailField label="类型" value={anniversaryTypeLabels[anniversary.type] ?? anniversary.type} />
            <DetailField label="纪念日日期" value={formatDateValue(anniversary.anniversaryDate)} />
            {anniversary.isLunar && <DetailField label="农历" value="是" />}
            <DetailField label="提醒模式" value={reminderModeLabels[anniversary.reminderMode] ?? anniversary.reminderMode} />
            <DetailField label="提醒日期" value={formatDateValue(anniversary.reminderDate)} />
            <DetailField label="创建时间" value={formatDateTimeValue(anniversary.createdAt)} />
            <DetailField label="更新时间" value={formatDateTimeValue(anniversary.updatedAt)} />
          </div>
        </section>
        <section className="panel-card">
          <h2 className="section-heading">备注</h2>
          <p className="detail-copy mt-3">{anniversary.note || "未记录"}</p>
        </section>
        <section className="panel-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-heading">历史礼物记录</h2>
            <span className="status-pill">{relatedGifts.length} 条</span>
          </div>
          {relatedGifts.length > 0 ? (
            <div className="task-list mt-4">
              {relatedGifts.map((gift) => (
                <article key={gift.id} className="task-list-item compact-list-item">
                  <div className="compact-main-row">
                    <div className="schedule-time-chip">
                      {gift.giftDate}
                    </div>
                    <div className="min-w-0">
                      <Link className="list-label list-title-link" href={`/life/gift/${gift.id}`}>
                        {gift.giftName}
                      </Link>
                      <p className="list-meta mt-1">
                        {gift.recipientName}
                        {gift.returnGift ? ` · 回礼 ${gift.returnGift}` : ""}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state mt-4">
              <div>
                <p className="list-label">暂无关联礼物记录</p>
                <p className="body-copy mt-1">
                  在礼物记录里选择这个纪念日后，会出现在这里。
                </p>
              </div>
            </div>
          )}
        </section>
        <section className="panel-card">
          <h2 className="section-heading">编辑纪念日</h2>
          <form action={updateAnniversaryAction} className="task-form mt-4">
            <input type="hidden" name="anniversaryId" value={id} />
            <input type="hidden" name="source" value="detail" />
            <label className="form-field">
              <span>标题</span>
              <input name="title" type="text" maxLength={120} defaultValue={anniversary.title} required />
            </label>
            <div className="task-form-grid">
              <label className="form-field">
                <span>关系对象</span>
                <input name="personName" type="text" maxLength={80} defaultValue={anniversary.personName} required />
              </label>
              <label className="form-field">
                <span>类型</span>
                <select name="type" defaultValue={anniversary.type}>
                  <option value="anniversary">纪念日</option>
                  <option value="birthday">生日</option>
                </select>
              </label>
            </div>
            <div className="task-form-grid">
              <label className="form-field">
                <span>日期</span>
                <input name="anniversaryDate" type="date" defaultValue={anniversary.anniversaryDate} required />
              </label>
              <label className="form-field">
                <span>提醒模式</span>
                <select name="reminderMode" defaultValue={anniversary.reminderMode}>
                  <option value="once">一次性</option>
                  <option value="yearly">按年提醒</option>
                </select>
              </label>
            </div>
            <label className="form-field">
              <span className="flex items-center gap-2">
                <input name="isLunar" type="checkbox" className="h-4 w-4" defaultChecked={anniversary.isLunar} />
                农历日期
              </span>
            </label>
            <label className="form-field">
              <span>提醒日期</span>
              <input name="reminderDate" type="date" defaultValue={anniversary.reminderDate ?? ""} />
            </label>
            <label className="form-field">
              <span>备注</span>
              <textarea name="note" rows={4} defaultValue={anniversary.note ?? ""} />
            </label>
            <button className="soft-button w-fit" type="submit">
              保存纪念日
            </button>
          </form>

          <form action={softDeleteAnniversaryAction} className="danger-zone mt-4">
            <input type="hidden" name="anniversaryId" value={id} />
            <input type="hidden" name="source" value="detail" />
            <div>
              <h3 className="list-label">删除纪念日</h3>
              <p className="body-copy mt-1">删除后，这条纪念日不会再出现在人生页。</p>
            </div>
            <button className="quiet-button danger-button" type="submit">
              删除纪念日
            </button>
          </form>
        </section>
      </DetailLayout>
    );
  }

  const [gift, anniversaries] = await Promise.all([
    getGiftRecordDetailForUser(user.id, id),
    getAnniversariesForUser(user.id),
  ]);
  const giftError = giftErrorFeedback[resolvedSearchParams?.giftError ?? ""] ?? null;
  const giftSaved = giftSavedFeedback[resolvedSearchParams?.giftSaved ?? ""] ?? null;

  if (!gift) {
    return (
      <DetailLayout kindLabel={kindLabels[kind]} title="未找到记录">
        <NotFoundState />
      </DetailLayout>
    );
  }

  const relatedAnniversary = anniversaries.find((anniversary) => anniversary.id === gift.anniversaryId);

  return (
    <DetailLayout kindLabel={kindLabels[kind]} title={gift.giftName}>
      <FeedbackMessage feedback={giftError} />
      <FeedbackMessage feedback={giftSaved} />
      <section className="panel-card">
        <div className="detail-grid">
          <DetailField label="礼物名称" value={gift.giftName} />
          <DetailField label="对象" value={gift.recipientName} />
          <DetailField label="礼物日期" value={formatDateValue(gift.giftDate)} />
          <DetailField label="对方回礼" value={gift.returnGift ?? "未记录"} />
          <DetailField label="关联纪念日" value={relatedAnniversary?.title ?? "未关联"} />
          <DetailField label="创建时间" value={formatDateTimeValue(gift.createdAt)} />
          <DetailField label="更新时间" value={formatDateTimeValue(gift.updatedAt)} />
        </div>
      </section>
      <section className="panel-card">
        <h2 className="section-heading">备注</h2>
        <p className="detail-copy mt-3">{gift.note || "未记录"}</p>
      </section>
      <section className="panel-card">
        <h2 className="section-heading">编辑礼物</h2>
        <form action={updateGiftRecordAction} className="task-form mt-4">
          <input type="hidden" name="giftRecordId" value={id} />
          <input type="hidden" name="source" value="detail" />
          <label className="form-field">
            <span>礼物名称</span>
            <input name="giftName" type="text" maxLength={120} defaultValue={gift.giftName} required />
          </label>
          <div className="task-form-grid">
            <label className="form-field">
              <span>对象</span>
              <input name="recipientName" type="text" maxLength={80} defaultValue={gift.recipientName} required />
            </label>
            <label className="form-field">
              <span>日期</span>
              <input name="giftDate" type="date" defaultValue={gift.giftDate} required />
            </label>
            <label className="form-field">
              <span>对方回礼</span>
              <input name="returnGift" type="text" maxLength={120} defaultValue={gift.returnGift ?? ""} placeholder="选填" />
            </label>
            <label className="form-field">
              <span>关联纪念日</span>
              <select name="anniversaryId" defaultValue={gift.anniversaryId ?? ""}>
                <option value="">不关联</option>
                {anniversaries.map((anniversary) => (
                  <option key={anniversary.id} value={anniversary.id}>
                    {anniversary.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="form-field">
            <span>备注</span>
            <textarea name="note" rows={4} defaultValue={gift.note ?? ""} />
          </label>
          <button className="soft-button w-fit" type="submit">
            保存礼物
          </button>
        </form>

        <form action={softDeleteGiftRecordAction} className="danger-zone mt-4">
          <input type="hidden" name="giftRecordId" value={id} />
          <input type="hidden" name="source" value="detail" />
          <div>
            <h3 className="list-label">删除礼物</h3>
            <p className="body-copy mt-1">删除后，这条礼物记录不会再出现在人生页。</p>
          </div>
          <button className="quiet-button danger-button" type="submit">
            删除礼物
          </button>
        </form>
      </section>
    </DetailLayout>
  );
}
