import Link from "next/link";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/session";
import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { getTrashedItemsForUser } from "@/lib/data/user-data/index";
import { restoreTrashItemAction, permanentlyDeleteTrashItemAction } from "@/app/trash/actions";

type TrashPageProps = {
  searchParams?: Promise<{
    restored?: string;
    deleted?: string;
    error?: string;
  }>;
};

function formatDeletedAt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function daysUntilPurge(iso: string) {
  const deleted = new Date(iso).getTime();
  const now = Date.now();
  const daysLeft = Math.ceil((30 * 86400000 - (now - deleted)) / 86400000);
  return daysLeft > 0 ? daysLeft : 0;
}

export default async function TrashPage({ searchParams }: TrashPageProps) {
  const user = await getCurrentUser();
  const params = searchParams ? await searchParams : undefined;
  const loginPath = buildLoginPath({ next: "/trash", message: loginRequiredMessage });
  const restored = params?.restored === "1";
  const deleted = params?.deleted === "1";
  const errorMessage = params?.error === "invalid_input" ? "无效请求" : params?.error === "save_failed" ? "操作失败，请稍后重试" : null;

  const trashedItems = user ? await getTrashedItemsForUser(user.id) : [];

  if (!user) {
    return (
      <div className="page-stack">
        <header className="page-header">
          <p className="page-kicker">回收站</p>
          <h1 className="page-title">已删除项目</h1>
        </header>
        <div className="empty-state mt-4">
          <span className="empty-icon"><Trash2 aria-hidden="true" className="h-5 w-5" /></span>
          <div>
            <p className="list-label">登录后查看回收站</p>
            <Link className="soft-button mt-3 inline-block" href={loginPath}>登录 / 注册</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="page-kicker">回收站</p>
            <h1 className="page-title">已删除项目</h1>
          </div>
          <Link className="quiet-button" href="/settings">← 返回设置</Link>
        </div>
        <p className="page-description">
          超过 30 天会自动永久删除。恢复后数据会回到原来的列表。
        </p>
      </header>

      {restored && (
        <div className="panel-card" style={{ background: "var(--sage-soft)", border: "1px solid var(--sage)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--sage)" }}>已成功恢复</p>
        </div>
      )}
      {deleted && (
        <div className="panel-card" style={{ background: "var(--sage-soft)", border: "1px solid var(--sage)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--sage)" }}>已永久删除</p>
        </div>
      )}
      {errorMessage && (
        <div className="panel-card" style={{ background: "var(--clay-soft)", border: "1px solid var(--clay)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--clay)" }}>{errorMessage}</p>
        </div>
      )}

      {trashedItems.length === 0 ? (
        <div className="empty-state mt-4">
          <span className="empty-icon"><Trash2 aria-hidden="true" className="h-5 w-5" /></span>
          <div>
            <p className="list-label">回收站是空的</p>
            <p className="body-copy mt-1">删除的项目会出现在这里，30 天内可以恢复。</p>
          </div>
        </div>
      ) : (
        <div className="task-list mt-4">
          {trashedItems.map((item) => (
            <article key={`${item.kind}-${item.id}`} className="task-list-item compact-list-item">
              <div className="compact-main-row">
                <span className="nav-icon text-[var(--clay)]">
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <span className="list-label">{item.title.length > 80 ? `${item.title.slice(0, 80)}...` : item.title}</span>
                  <p className="list-meta mt-1">
                    {item.label} · 删除于 {formatDeletedAt(item.deletedAt)}
                    <span className="status-pill ml-2">
                      <AlertTriangle aria-hidden="true" className="h-3 w-3 inline mr-1" />
                      {daysUntilPurge(item.deletedAt)} 天后清除
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={restoreTrashItemAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="kind" value={item.kind} />
                    <button className="quiet-button text-sm" type="submit" title="恢复">
                      <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                      恢复
                    </button>
                  </form>
                  <details className="batch-confirm-disclosure">
                    <summary className="quiet-button text-sm" style={{ color: "var(--clay)" }} title="永久删除">
                      <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                      删除
                    </summary>
                    <div className="batch-confirm-card">
                      <p className="text-sm">永久删除后不可恢复，确定？</p>
                      <form action={permanentlyDeleteTrashItemAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="kind" value={item.kind} />
                        <div className="flex gap-2 mt-3">
                          <button type="submit" className="soft-button text-sm">确定删除</button>
                        </div>
                      </form>
                    </div>
                  </details>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
