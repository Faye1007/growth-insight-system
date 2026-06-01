import Link from "next/link";
import { ArrowLeft, CheckCircle2, Heart, Trash2 } from "lucide-react";

import { deactivateHabitAction, softDeleteHabitAction } from "@/app/daily/actions";
import { updateChecklistHabitAction } from "@/app/checklist/actions";
import { FeedbackMessage } from "@/components/feedback-message";
import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";
import { getHabitByIdForUser } from "@/lib/data/user-data";
import { taskCategories } from "@/lib/tasks/options";

type HabitDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    habitError?: string;
    habitUpdated?: string;
    habitDeleted?: string;
  }>;
};

export default async function HabitDetailPage({ params, searchParams }: HabitDetailPageProps) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  const user = await getCurrentUser();
  const isLoggedIn = Boolean(user);
  const loginPath = buildLoginPath({ next: `/checklist/habits/${id}`, message: loginRequiredMessage });

  const habit = user ? await getHabitByIdForUser(user.id, id) : null;

  const errorFeedback =
    sp.habitError === "missing_name"
      ? { tone: "error" as const, title: "习惯名称不能为空", detail: "请填写习惯名称后重试。" }
      : sp.habitError === "save_failed"
        ? { tone: "error" as const, title: "习惯没有保存成功", detail: "请稍后重试。" }
        : sp.habitError === "missing_habit"
          ? { tone: "error" as const, title: "未找到这条习惯", detail: "这条习惯可能已被删除。" }
          : null;
  const updatedFeedback =
    sp.habitUpdated === "1"
      ? { tone: "success" as const, title: "习惯已更新", detail: "习惯信息已保存。" }
      : sp.habitUpdated === "deactivated"
        ? { tone: "success" as const, title: "习惯状态已更新", detail: habit?.isActive ? "习惯已停用。" : "习惯已重新启用。" }
        : null;
  const deletedFeedback =
    sp.habitDeleted === "1"
      ? { tone: "success" as const, title: "习惯已删除", detail: "这条习惯已从列表中移除。" }
      : null;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div className="flex items-center gap-3">
          <Link className="quiet-button" href="/checklist?tab=habits">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            返回清单
          </Link>
        </div>
        <p className="page-kicker mt-4">习惯详情</p>
        <h1 className="page-title">{habit?.name ?? "习惯维护"}</h1>
      </header>

      <FeedbackMessage feedback={errorFeedback} />
      <FeedbackMessage feedback={updatedFeedback} />
      <FeedbackMessage feedback={deletedFeedback} />

      {!isLoggedIn ? (
        <section className="panel-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-heading">登录后查看习惯详情</h2>
              <p className="body-copy mt-2">未登录时可以浏览页面结构；登录后可以查看和编辑习惯。</p>
            </div>
            <Link className="soft-button w-full sm:w-auto" href={loginPath}>
              登录 / 注册
            </Link>
          </div>
        </section>
      ) : !habit ? (
        <section className="panel-card">
          <div className="empty-state">
            <span className="empty-icon">
              <Heart aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="list-label">未找到这条习惯</p>
              <p className="body-copy mt-1">这条习惯可能已被删除或不属于当前账号。</p>
              <Link className="soft-button mt-3 inline-block" href="/checklist?tab=habits">
                返回清单
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="panel-card">
            <h2 className="section-heading">编辑习惯</h2>
            <form action={updateChecklistHabitAction} className="task-form mt-4">
              <input type="hidden" name="habitId" value={habit.id} />

              <label className="form-field">
                <span>习惯名称</span>
                <input name="name" type="text" maxLength={120} defaultValue={habit.name} required />
              </label>

              <label className="form-field">
                <span>说明</span>
                <textarea name="description" rows={3} maxLength={500} defaultValue={habit.description ?? ""} />
              </label>

              <div className="task-form-grid">
                <label className="form-field">
                  <span>分类</span>
                  <select name="category" defaultValue={habit.category}>
                    {taskCategories.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span>开始日期</span>
                  <input name="startDate" type="date" defaultValue={habit.startDate ?? ""} />
                </label>
                <label className="form-field">
                  <span>启用状态</span>
                  <input type="text" value={habit.isActive ? "启用中" : "已停用"} disabled readOnly />
                </label>
              </div>

              <button className="soft-button w-fit text-sm" type="submit">保存习惯</button>
            </form>
          </section>

          <section className="panel-card">
            <h2 className="section-heading">操作</h2>
            <div className="flex flex-wrap gap-3 mt-4">
              <form action={deactivateHabitAction}>
                <input type="hidden" name="habitId" value={habit.id} />
                <input type="hidden" name="source" value="checklist" />
                <button className="quiet-button text-sm" type="submit">
                  <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                  {habit.isActive ? "停用习惯" : "重新启用"}
                </button>
              </form>
              <form action={softDeleteHabitAction}>
                <input type="hidden" name="habitId" value={habit.id} />
                <input type="hidden" name="source" value="checklist" />
                <button className="quiet-button danger-button text-sm" type="submit">
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                  删除习惯
                </button>
              </form>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
