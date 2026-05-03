const manualItems = ["当前人生阶段", "当前主要目标", "能力画像", "情绪模式", "常见内耗点"];

export default function ManualPage() {
  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="page-kicker">个人说明书</p>
        <h1 className="page-title">面向自己的长期说明书</h1>
        <p className="page-description">
          第一版先支持手动维护，后续再由复盘结果提出更新建议。
        </p>
      </header>

      <section className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="section-heading">说明书条目</h2>
          <span className="status-pill">手动维护</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {manualItems.map((item) => (
            <div key={item} className="field-tile">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
