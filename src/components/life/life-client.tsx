"use client";

import { useState } from "react";
import {
  CalendarHeart,
  Gift,
  NotebookPen,
} from "lucide-react";

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

export function LifeClient({
  initialTab = "events",
  events,
  anniversaries,
  giftRecords,
}: {
  initialTab?: LifeTab;
  events: LifeEventRecord[];
  anniversaries: AnniversaryRecord[];
  giftRecords: GiftRecord[];
}) {
  const [activeTab, setActiveTab] = useState<LifeTab>(initialTab);

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
      <div className="daily-tab-list" role="tablist">
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
        <section className="workspace-panel tone-mist">
          <h2 className="section-heading">事件</h2>
          {events.length > 0 ? (
            <div className="record-timeline mt-4">
              {events.map((event) => (
                <article key={event.id} className="record-timeline-item tone-mist">
                  <div className="nav-icon">
                    <NotebookPen aria-hidden="true" className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="record-item-heading">
                      <span className="status-pill">{event.eventDate}</span>
                      {event.emotionTags.length > 0 && (
                        <span className="status-pill" style={{ color: emotionColorMap[event.emotionTags[0]] ?? "var(--muted-foreground)" }}>
                          {event.emotionTags.join(" ")}
                        </span>
                      )}
                    </div>
                    <p className="body-copy mt-3">{event.content}</p>
                    {event.tags.length > 0 && (
                      <div className="compact-tag-row mt-2">
                        {event.tags.map((tag) => (
                          <span key={tag} className="status-pill">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="overview-detail-row mt-3">
                      <span className="status-pill">
                        {event.aiAnalysisPermission === "none"
                          ? "不参与 AI 分析"
                          : event.aiAnalysisPermission === "summary_only"
                            ? "仅摘要参与"
                            : "允许原文参与"}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state mt-4">
              <span className="empty-icon">
                <NotebookPen aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="list-label">暂无事件记录</p>
                <p className="body-copy mt-1">可以在每日工作台记录事件。</p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Anniversaries */}
      {activeTab === "anniversaries" && (
        <section className="workspace-panel tone-clay">
          <h2 className="section-heading">纪念日</h2>
          {anniversaries.length > 0 ? (
            <div className="record-timeline mt-4">
              {anniversaries.map((anniversary) => (
                <article key={anniversary.id} className="record-timeline-item tone-clay">
                  <div className="nav-icon">
                    <CalendarHeart aria-hidden="true" className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="record-item-heading">
                      <span className="status-pill">{anniversary.anniversaryDate}</span>
                      <span className="status-pill">{anniversary.personName}</span>
                    </div>
                    <h3 className="list-label mt-3">{anniversary.title}</h3>
                    {anniversary.note && (
                      <p className="body-copy mt-2">{anniversary.note}</p>
                    )}
                    <div className="overview-detail-row mt-3">
                      {anniversary.reminderDate ? (
                        <span className="status-pill">提醒 {anniversary.reminderDate}</span>
                      ) : (
                        <span className="status-pill">暂未设置提醒日期</span>
                      )}
                    </div>
                  </div>
                </article>
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
        <section className="workspace-panel tone-lavender">
          <h2 className="section-heading">礼物</h2>
          {giftRecords.length > 0 ? (
            <div className="record-timeline mt-4">
              {giftRecords.map((gift) => (
                <article key={gift.id} className="record-timeline-item tone-lavender">
                  <div className="nav-icon">
                    <Gift aria-hidden="true" className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="record-item-heading">
                      <span className="status-pill">{gift.giftDate}</span>
                      <span className="status-pill">{gift.purpose}</span>
                    </div>
                    <h3 className="list-label mt-3">{gift.giftName}</h3>
                    <p className="body-copy mt-1">对象：{gift.recipientName}</p>
                    {gift.note && (
                      <p className="body-copy mt-2">{gift.note}</p>
                    )}
                  </div>
                </article>
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
