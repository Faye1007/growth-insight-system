"use client";

import { RefreshCw } from "lucide-react";

type AppErrorPageProps = {
  reset: () => void;
};

export default function AppErrorPage({ reset }: AppErrorPageProps) {
  return (
    <div className="page-stack">
      <section className="panel-card max-w-2xl">
        <p className="page-kicker">加载失败</p>
        <h1 className="page-title mt-2">页面暂时没有加载成功</h1>
        <p className="page-description mt-3">
          可能是数据库连接或网络短暂不稳定。请先重试一次；如果仍然失败，可以稍后再打开。
        </p>
        <button className="soft-button mt-5 w-full sm:w-fit" type="button" onClick={reset}>
          <RefreshCw aria-hidden="true" className="h-4 w-4" />
          重新加载
        </button>
      </section>
    </div>
  );
}
