"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarHeart,
  Gift,
  NotebookPen,
  Plus,
} from "lucide-react";

import { createChecklistEventAction } from "@/app/checklist/actions";
import { createAnniversaryAction, createGiftRecordAction } from "@/app/life/actions";
import type { AnniversaryRecord, GiftRecord, LifeEventRecord } from "@/lib/data/user-data";

type LifeTab = "events" | "anniversaries" | "gifts";

const tabs: Array<{ id: LifeTab; label: string; Icon: typeof NotebookPen }> = [
  { id: "events", label: "事件", Icon: NotebookPen },
  { id: "anniversaries", label: "纪念日", Icon: CalendarHeart },
  { id: "gifts", label: "礼物", Icon: Gift },
];

const emotionColorMap: Record<string, string> = {
  平静: "var(--muted-foreground)",
  开心: "var(--sage)",
  满足: "var(--sage)",
  期待: "var(--mist)",
  兴奋: "var(--mist)",
  焦虑: "var(--clay)",
  疲惫: "var(--clay)",
  低落: "var(--clay)",
  委屈: "var(--clay)",
  生气: "var(--clay)",
  压力: "var(--clay)",
  混乱: "var(--clay)",
  孤独: "var(--clay)",
  感激: "var(--sage)",
};

function groupByDate<T>(items: T[], getDate: (item: T) => string): Array<[string, T[]]> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const date = getDate(item);
    groups.set(date, [...(groups.get(date) ?? []), item]);
  }

  return Array.from(groups.entries());
}

function formatDateLabel(date: string) {
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return formatter.format(new Date(`${date}T00:00:00+08:00`));
}

function getTodayValue() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date());
}

export function LifeClient({
  initialTab = "events",
  events,
  anniversaries,
  giftRecords,
  isLoggedIn = false,
  loginPath = "/login",
}: {
  initialTab?: LifeTab;
  events: LifeEventRecord[];
  anniversaries: AnniversaryRecord[];
  giftRecords: GiftRecord[];
  isLoggedIn?: boolean;
  loginPath?: string;
}) {
  const [activeTab, setActiveTab] = useState<LifeTab>(initialTab);
  const today = getTodayValue();

  return (
    <div className="page-stack">
      <header className="page-header">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="page-kicker">人生</p>
            <h1 className="page-title">事件、纪念日和礼物</h1>
          </div>
        </div>
        <p className="page-description">
          记录生活中的重要事件、提前准备的重要日期和送出或收到的礼物。
        </p>
      </header>

      {/* Tab switcher */}
      <div className="daily-tab-list life-tab-list" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.Icon;
          const isActive = tab.id === activeTab;
          const counts: Record<LifeTab, number> = {
            events: events.length,
            anniversaries: anniversaries.length,
            gifts: giftRecords.length,
          };

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              className={`daily-tab ${isActive ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">
                <Icon aria-hidden="true" className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="daily-tab-title">{tab.label}</span>
                <span className="daily-tab-meta">{counts[tab.id]} 条</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Events */}
      {activeTab === "events" && (
        <section className="workspace-panel tone-mist" id="events">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-heading">事件</h2>
            {isLoggedIn && (
              <details className="create-disclosure">
                <summary className="create-summary soft-button text-sm">
                  <Plus aria-hidden="true" className="h-3 w-3" />
                  新增
                </summary>
                <form action={createChecklistEventAction} className="task-form mt-3">
                  <label className="form-field">
                    <span>内容</span>
                    <textarea name="content" rows={3} maxLength={500} placeholder="记录今天发生的事..." required />
                  </label>
                  <div className="task-form-grid">
                    <label className="form-field">
                      <span>日期</span>
                      <input name="eventDate" type="date" defaultValue={today} required />
                    </label>
                    <label className="form-field">
                      <span>AI 分析权限</span>
                      <select name="aiAnalysisPermission" defaultValue="summary_only">
                        <option value="none">不参与 AI 分析</option>
                        <option value="summary_only">仅摘要参与</option>
                        <option value="allow_original">允许原文参与</option>
                      </select>
                    </label>
                  </div>
                  <label className="form-field">
                    <span>情绪标签（逗号分隔）</span>
                    <input name="emotionTags" type="text" maxLength={120} placeholder="例如：开心、期待" />
                  </label>
                  <label className="form-field">
                    <span>普通标签（逗号分隔）</span>
                    <input name="tags" type="text" maxLength={120} placeholder="例如：工作、学习" />
                  </label>
                  <button className="soft-button w-fit text-sm" type="submit">保存事件</button>
                </form>
              </details>
            )}
          </div>
          {!isLoggedIn ? (
            <div className="empty-state mt-4">
              <span className="empty-icon">
                <NotebookPen aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="list-label">登录后记录事件</p>
                <p className="body-copy mt-1">
                  未登录时可以浏览页面结构；登录后可以保存自己的事件记录。
                </p>
                <Link className="soft-button mt-3 inline-block" href={loginPath}>
                  登录 / 注册
                </Link>
              </div>
            </div>
          ) : events.length > 0 ? (
            <div className="task-list mt-4">
              {groupByDate(events, (event) => event.eventDate).map(([date, items]) => (
                <div key={date}>
                  <h3 className="date-group-header">{formatDateLabel(date)}</h3>
                  <div className="task-group-list">
                    {items.map((event) => (
                      <article key={event.id} className="task-list-item compact-list-item">
                        <div className="compact-main-row">
                          <span className="nav-icon">
                            <NotebookPen aria-hidden="true" className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <Link className="list-label list-title-link two-line-preview" href={`/records/event/${event.id}`}>
                              {event.content}
                            </Link>
                            <div className="compact-tag-row mt-2">
                              {event.emotionTags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="status-pill"
                                  style={{ color: emotionColorMap[tag] ?? "var(--muted-foreground)" }}
                                >
                                  {tag}
                                </span>
                              ))}
                              {event.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="status-pill">{tag}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state mt-4">
              <span className="empty-icon">
                <NotebookPen aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="list-label">暂无事件记录</p>
                <p className="body-copy mt-1">点击上方"新增"记录事件。</p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Anniversaries */}
      {activeTab === "anniversaries" && (
        <section className="workspace-panel tone-clay" id="anniversaries">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-heading">纪念日</h2>
            {isLoggedIn && (
              <details className="create-disclosure">
                <summary className="create-summary soft-button text-sm">
                  新增
                </summary>
                <form action={createAnniversaryAction} className="task-form mt-3">
                  <label className="form-field">
                    <span>标题</span>
                    <input name="title" type="text" maxLength={120} required />
                  </label>
                  <div className="task-form-grid">
                    <label className="form-field">
                      <span>关系对象</span>
                      <input name="personName" type="text" maxLength={80} required />
                    </label>
                    <label className="form-field">
                      <span>日期</span>
                      <input name="anniversaryDate" type="date" defaultValue={today} required />
                    </label>
                    <label className="form-field">
                      <span>提醒日期</span>
                      <input name="reminderDate" type="date" />
                    </label>
                  </div>
                  <label className="form-field">
                    <span>备注</span>
                    <textarea name="note" rows={3} />
                  </label>
                  <button className="soft-button w-fit" type="submit">保存纪念日</button>
                </form>
              </details>
            )}
          </div>
          {!isLoggedIn ? (
            <div className="empty-state mt-4">
              <span className="empty-icon">
                <CalendarHeart aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="list-label">登录后维护纪念日</p>
                <p className="body-copy mt-1">
                  未登录时可以浏览页面结构；登录后可以保存自己的纪念日记录。
                </p>
                <Link className="soft-button mt-3 inline-block" href={loginPath}>
                  登录 / 注册
                </Link>
              </div>
            </div>
          ) : anniversaries.length > 0 ? (
            <div className="task-list mt-4">
              {groupByDate(anniversaries, (anniversary) => anniversary.anniversaryDate).map(([date, items]) => (
                <div key={date}>
                  <h3 className="date-group-header">{formatDateLabel(date)}</h3>
                  <div className="task-group-list">
                    {items.map((anniversary) => (
                      <article key={anniversary.id} className="task-list-item compact-list-item">
                        <div className="compact-main-row">
                          <span className="nav-icon">
                            <CalendarHeart aria-hidden="true" className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <Link className="list-label list-title-link" href={`/life/anniversary/${anniversary.id}`}>
                              {anniversary.title}
                            </Link>
                            <p className="list-meta mt-1">
                              {anniversary.personName}
                              {anniversary.reminderDate ? ` · 提醒 ${anniversary.reminderDate}` : ""}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state mt-4">
              <span className="empty-icon">
                <CalendarHeart aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="list-label">暂无纪念日记录</p>
                <p className="body-copy mt-1">可以在纪念日页面添加重要日期。</p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Gifts */}
      {activeTab === "gifts" && (
        <section className="workspace-panel tone-lavender" id="gifts">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-heading">礼物</h2>
            {isLoggedIn && (
              <details className="create-disclosure">
                <summary className="create-summary soft-button text-sm">
                  新增
                </summary>
                <form action={createGiftRecordAction} className="task-form mt-3">
                  <label className="form-field">
                    <span>礼物名称</span>
                    <input name="giftName" type="text" maxLength={120} required />
                  </label>
                  <div className="task-form-grid">
                    <label className="form-field">
                      <span>对象</span>
                      <input name="recipientName" type="text" maxLength={80} required />
                    </label>
                    <label className="form-field">
                      <span>日期</span>
                      <input name="giftDate" type="date" defaultValue={today} required />
                    </label>
                    <label className="form-field">
                      <span>用途</span>
                      <input name="purpose" type="text" maxLength={120} required />
                    </label>
                    <label className="form-field">
                      <span>关联纪念日</span>
                      <select name="anniversaryId" defaultValue="">
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
                    <textarea name="note" rows={3} />
                  </label>
                  <button className="soft-button w-fit" type="submit">保存礼物</button>
                </form>
              </details>
            )}
          </div>
          {!isLoggedIn ? (
            <div className="empty-state mt-4">
              <span className="empty-icon">
                <Gift aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="list-label">登录后记录礼物</p>
                <p className="body-copy mt-1">
                  未登录时可以浏览页面结构；登录后可以保存自己的礼物记录。
                </p>
                <Link className="soft-button mt-3 inline-block" href={loginPath}>
                  登录 / 注册
                </Link>
              </div>
            </div>
          ) : giftRecords.length > 0 ? (
            <div className="task-list mt-4">
              {groupByDate(giftRecords, (gift) => gift.giftDate).map(([date, items]) => (
                <div key={date}>
                  <h3 className="date-group-header">{formatDateLabel(date)}</h3>
                  <div className="task-group-list">
                    {items.map((gift) => (
                      <article key={gift.id} className="task-list-item compact-list-item">
                        <div className="compact-main-row">
                          <span className="nav-icon">
                            <Gift aria-hidden="true" className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <Link className="list-label list-title-link" href={`/life/gift/${gift.id}`}>
                              {gift.giftName}
                            </Link>
                            <p className="list-meta mt-1">
                              {gift.recipientName} · {gift.purpose}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state mt-4">
              <span className="empty-icon">
                <Gift aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="list-label">暂无礼物记录</p>
                <p className="body-copy mt-1">可以在纪念日页面添加礼物记录。</p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
