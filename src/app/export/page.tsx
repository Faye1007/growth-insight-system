import Link from "next/link";
import { Download, FileText, NotebookText } from "lucide-react";

import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ExportPage() {
  const user = await getCurrentUser();
  const isLoggedIn = Boolean(user);
  const loginPath = buildLoginPath({ next: "/export", message: loginRequiredMessage });

  return (
    <div className="page-stack">
      <header className="page-header">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="page-kicker">Markdown 导出</p>
            <h1 className="page-title">导出复盘与成长记录</h1>
          </div>
          <span className="status-pill w-fit">当前：单向导出</span>
        </div>
        <p className="page-description">
          导出当前账号下的复盘报告或近期成长记录为 Markdown 文件。当前不读取本地 Obsidian 仓库，也不做双向同步。
        </p>
      </header>

      {!isLoggedIn ? (
        <section className="panel-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-heading">登录后导出自己的数据</h2>
              <p className="body-copy mt-2">
                未登录时不能导出个人复盘或成长记录。
              </p>
            </div>
            <Link className="soft-button w-full sm:w-auto" href={loginPath}>
              登录 / 注册
            </Link>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="export-options-title" className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="page-kicker">导出类型</p>
            <h2 id="export-options-title" className="section-heading mt-1">
              选择要下载的 Markdown
            </h2>
          </div>
          <span className="status-pill w-fit">不包含密钥或底层错误</span>
        </div>

        <div className="record-summary-grid mt-5">
          <article className="field-tile">
            <span className="nav-icon mb-3">
              <FileText aria-hidden="true" className="h-4 w-4" />
            </span>
            <strong>复盘报告</strong>
            <p className="body-copy mt-2">
              导出最近完成的每日、周和月复盘报告，包含摘要、模式、建议和下一步行动。
            </p>
            {isLoggedIn ? (
              <a className="soft-button mt-4 w-fit" href="/export/markdown?kind=reports">
                <Download aria-hidden="true" className="h-4 w-4" />
                下载 Markdown
              </a>
            ) : null}
          </article>

          <article className="field-tile">
            <span className="nav-icon mb-3">
              <NotebookText aria-hidden="true" className="h-4 w-4" />
            </span>
            <strong>成长记录</strong>
            <p className="body-copy mt-2">
              导出近期任务、习惯打卡、日程、事件和灵感记录，用于外部整理或备份。
            </p>
            {isLoggedIn ? (
              <a className="soft-button mt-4 w-fit" href="/export/markdown?kind=records">
                <Download aria-hidden="true" className="h-4 w-4" />
                下载 Markdown
              </a>
            ) : null}
          </article>
        </div>
      </section>
    </div>
  );
}
