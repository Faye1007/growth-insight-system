"use client";

import { useState, useActionState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarHeart,
  Gift,
  NotebookPen,
  Plus,
  Trash2,
} from "lucide-react";

import { createChecklistEventAction } from "@/app/checklist/actions";
import { batchSoftDeleteAction, createAnniversaryAction, createGiftRecordAction } from "@/app/life/actions";
import { useToast } from "@/components/toast-provider";
import type { AnniversaryRecord, GiftRecord, LifeEventRecord, UpcomingAnniversary } from "@/lib/data/user-data";

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
  upcomingAnniversaries = [],
  isLoggedIn = false,
  loginPath = "/login",
}: {
  initialTab?: LifeTab;
  events: LifeEventRecord[];
  anniversaries: AnniversaryRecord[];
  giftRecords: GiftRecord[];
  upcomingAnniversaries?: UpcomingAnniversary[];
  isLoggedIn?: boolean;
  loginPath?: string;
}) {
  const [activeTab, setActiveTab] = useState<LifeTab>(initialTab);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [_batchState, batchAction, _batchPending] = useActionState(batchSoftDeleteAction, null);
  const { addToast } = useToast();

  useEffect(() => {
    if (!_batchState) return;
    if (_batchState.success) {
      addToast("已删除选中的项目", "success");
      exitSelectionMode();
    } else {
      addToast("删除失败，请稍后重试", "error");
    }
  }, [_batchState]);

  const today = getTodayValue();

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function getCurrentItems() {
    if (activeTab === "events") return events;
    if (activeTab === "anniversaries") return anniversaries;
    return giftRecords;
  }

  function toggleSelectAll() {
    const items = getCurrentItems();
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)));
    }
  }

  function exitSelectionMode() {
    setIsSelecting(false);
    setSelectedIds(new Set());
  }

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

      {/* Upcoming anniversaries banner */}
      {upcomingAnniversaries.length > 0 && (
        <section className="panel-card anniversary-reminder-banner">
          <div className="flex items-center gap-2">
            <CalendarHeart className="h-4 w-4 flex-shrink-0" />
            <h2 className="section-heading">即将到来的纪念日</h2>
            <span className="status-pill">{upcomingAnniversaries.length} 条</span>
          </div>
          <div className="task-list mt-3">
            {upcomingAnniversaries.map((ann) => (
              <article key={ann.id} className="task-list-item compact-list-item">
                <div className="compact-main-row">
                  <span className="nav-icon">
                    <CalendarHeart aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <Link className="list-label list-title-link" href={`/life/anniversary/${ann.id}`}>
                      {ann.title}
                    </Link>
                    <p className="list-meta mt-1">
                      {ann.personName}
                      {ann.type === "birthday" ? " · 生日" : ""}
                    </p>
                  </div>
                  <span className={`anniversary-days ${ann.isToday ? "anniversary-today" : ""}`}>
                    {ann.isToday ? "今天" : `${ann.daysUntil} 天后`}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

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
            <div className="flex items-center gap-2">
              {isLoggedIn && !isSelecting && (
                <button type="button" className="quiet-button text-sm" onClick={() => setIsSelecting(true)}>
                  选择
                </button>
              )}
              {isSelecting && (
                <button type="button" className="quiet-button text-sm" onClick={exitSelectionMode}>
                  取消
                </button>
              )}
            </div>
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
                          {isSelecting ? (
                            <label className="batch-checkbox-label">
                              <input
                                type="checkbox"
                                className="batch-checkbox"
                                checked={selectedIds.has(event.id)}
                                onChange={() => toggleSelect(event.id)}
                              />
                            </label>
                          ) : (
                            <span className="nav-icon">
                              <NotebookPen aria-hidden="true" className="h-4 w-4" />
                            </span>
                          )}
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
            <div className="flex items-center gap-2">
              {isLoggedIn && !isSelecting && (
                <button type="button" className="quiet-button text-sm" onClick={() => setIsSelecting(true)}>
                  选择
                </button>
              )}
              {isSelecting && (
                <button type="button" className="quiet-button text-sm" onClick={exitSelectionMode}>
                  取消
                </button>
              )}
              {isLoggedIn && (
                <details className="create-disclosure">
                  <summary className="create-summary soft-button text-sm">
                    <Plus aria-hidden="true" className="h-3 w-3" />
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
                      <span>类型</span>
                      <select name="type" defaultValue="anniversary">
                        <option value="anniversary">纪念日</option>
                        <option value="birthday">生日</option>
                      </select>
                    </label>
                  </div>
                  <div className="task-form-grid">
                    <label className="form-field">
                      <span>日期</span>
                      <input name="anniversaryDate" type="date" defaultValue={today} required />
                    </label>
                    <label className="form-field">
                      <span>提醒模式</span>
                      <select name="reminderMode" defaultValue="once">
                        <option value="once">一次性</option>
                        <option value="yearly">按年提醒</option>
                      </select>
                    </label>
                  </div>
                  <label className="form-field">
                    <span className="flex items-center gap-2">
                      <input name="isLunar" type="checkbox" className="h-4 w-4" />
                      农历日期
                    </span>
                  </label>
                  <label className="form-field">
                    <span>提醒日期</span>
                    <input name="reminderDate" type="date" />
                  </label>
                  <label className="form-field">
                    <span>备注</span>
                    <textarea name="note" rows={3} />
                  </label>
                  <button className="soft-button w-fit" type="submit">保存纪念日</button>
                </form>
              </details>
            )}
            </div>
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
                          {isSelecting ? (
                            <label className="batch-checkbox-label">
                              <input
                                type="checkbox"
                                className="batch-checkbox"
                                checked={selectedIds.has(anniversary.id)}
                                onChange={() => toggleSelect(anniversary.id)}
                              />
                            </label>
                          ) : (
                            <span className="nav-icon">
                              <CalendarHeart aria-hidden="true" className="h-4 w-4" />
                            </span>
                          )}
                          <div className="min-w-0">
                            <Link className="list-label list-title-link" href={`/life/anniversary/${anniversary.id}`}>
                              {anniversary.title}
                            </Link>
                            <p className="list-meta mt-1">
                              {anniversary.personName}
                              {anniversary.type === "birthday" ? " · 生日" : ""}
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
            <div className="flex items-center gap-2">
              {isLoggedIn && !isSelecting && (
                <button type="button" className="quiet-button text-sm" onClick={() => setIsSelecting(true)}>
                  选择
                </button>
              )}
              {isSelecting && (
                <button type="button" className="quiet-button text-sm" onClick={exitSelectionMode}>
                  取消
                </button>
              )}
              {isLoggedIn && (
                <details className="create-disclosure">
                  <summary className="create-summary soft-button text-sm">
                    <Plus aria-hidden="true" className="h-3 w-3" />
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
                      <span>对方回礼</span>
                      <input name="returnGift" type="text" maxLength={120} placeholder="选填" />
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
                          {isSelecting ? (
                            <label className="batch-checkbox-label">
                              <input
                                type="checkbox"
                                className="batch-checkbox"
                                checked={selectedIds.has(gift.id)}
                                onChange={() => toggleSelect(gift.id)}
                              />
                            </label>
                          ) : (
                            <span className="nav-icon">
                              <Gift aria-hidden="true" className="h-4 w-4" />
                            </span>
                          )}
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

      {/* Batch delete bar */}
      {isSelecting && (
        <div className="batch-action-bar">
          <label className="batch-checkbox-label">
            <input
              type="checkbox"
              className="batch-checkbox"
              checked={selectedIds.size === getCurrentItems().length && getCurrentItems().length > 0}
              onChange={toggleSelectAll}
            />
          </label>
          <span className="text-sm text-[var(--muted-foreground)]">
            {selectedIds.size > 0 ? `已选 ${selectedIds.size} 项` : "全选"}
          </span>
          <span className="flex-1" />
          <details className="batch-confirm-disclosure">
            <summary className="soft-button text-sm batch-delete-trigger">
              <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
              {selectedIds.size > 0 ? `删除 ${selectedIds.size} 项` : "删除"}
            </summary>
            <div className="batch-confirm-card">
              <p className="text-sm">确定删除选中的 {selectedIds.size} 项？此操作可恢复。</p>
              <form action={batchAction}>
                <input type="hidden" name="kind" value={activeTab} />
                <input type="hidden" name="ids" value={JSON.stringify(Array.from(selectedIds))} />
                <div className="flex gap-2 mt-3">
                  <button type="submit" className="soft-button text-sm">
                    确认删除
                  </button>
                </div>
              </form>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
