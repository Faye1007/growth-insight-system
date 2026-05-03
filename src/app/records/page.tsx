const recordTypes = [
  "任务完成记录",
  "习惯打卡记录",
  "日程记录",
  "事件记录",
  "灵感记录",
];

export default function RecordsPage() {
  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="page-kicker">成长记录</p>
        <h1 className="page-title">长期生活数据沉淀</h1>
        <p className="page-description">
          后续会用统一时间线展示任务、习惯、日程和随手记录。
        </p>
      </header>

      <section className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="section-heading">近期记录</h2>
          <span className="status-pill">展示数据</span>
        </div>
        <div className="panel-list">
          {recordTypes.map((type) => (
            <div key={type} className="list-row">
              <span className="list-label">{type}</span>
              <span className="status-pill">待接入</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
