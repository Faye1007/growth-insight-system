import Link from "next/link";

import { savePersonalManualAction } from "@/app/manual/actions";
import { FeedbackMessage } from "@/components/feedback-message";
import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";
import { getPersonalManualForUser } from "@/lib/data/user-data/index";
import {
  defaultManualErrorFeedback,
  getFeedbackByCode,
  manualErrorFeedback,
  manualSavedFeedback,
} from "@/lib/feedback";

type ManualPageProps = {
  searchParams?: Promise<{
    manualError?: string;
    manualSaved?: string;
  }>;
};

function getListText(items: string[] | null | undefined) {
  return items?.length ? items.join("\n") : "";
}

export default async function ManualPage({ searchParams }: ManualPageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const loginPath = buildLoginPath({ next: "/manual", message: loginRequiredMessage });
  const manual = user ? await getPersonalManualForUser(user.id) : null;
  const savedFeedback = params?.manualSaved === "1" ? manualSavedFeedback : null;
  const errorFeedback = getFeedbackByCode(
    params?.manualError,
    manualErrorFeedback,
    defaultManualErrorFeedback,
  );

  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="page-kicker">个人说明书</p>
        <h1 className="page-title">面向自己的长期说明书</h1>
        <p className="page-description">
          这是洞察报告里 AI 复盘可参考的长期背景资料。第一版先支持手动维护，后续再由复盘结果提出更新建议。
        </p>
      </header>

      {!user ? (
        <section className="panel-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-heading">登录后维护个人说明书</h2>
              <p className="body-copy mt-2">
                个人说明书属于长期个人数据，登录后才能保存和读取。
              </p>
            </div>
            <Link className="soft-button w-full sm:w-auto" href={loginPath}>
              登录 / 注册
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="panel-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="section-heading">说明书状态</h2>
                <p className="body-copy mt-2">
                  {manual
                    ? "已读取当前账号的个人说明书，可以继续编辑后保存。"
                    : "当前账号还没有个人说明书，可以先保存第一版空白草稿。"}
                </p>
              </div>
              <span className="status-pill">{manual ? "已创建" : "未创建"}</span>
            </div>
          </section>

          <section className="panel-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="section-heading">说明书条目</h2>
                <p className="body-copy mt-2">
                  这些字段会保存到当前账号；是否进入 AI 输入仍以复盘发送预览为准。
                </p>
              </div>
              <Link className="quiet-button w-full sm:w-auto" href="/insights">
                回到洞察报告
              </Link>
            </div>

            <FeedbackMessage feedback={errorFeedback} className="mt-4" />
            <FeedbackMessage feedback={savedFeedback} className="mt-4" />

            <form action={savePersonalManualAction} className="task-form mt-5">
              <label className="form-field">
                <span>当前人生阶段</span>
                <textarea
                  name="lifeStage"
                  rows={3}
                  defaultValue={manual?.lifeStage ?? ""}
                  placeholder="例如：应用心理硕士，正在转向 AI 产品。"
                />
              </label>

              <label className="form-field">
                <span>当前主要目标</span>
                <textarea
                  name="currentGoals"
                  rows={4}
                  defaultValue={getListText(manual?.currentGoals)}
                  placeholder="每行写一个目标，例如：完成 AI 产品项目作品集"
                />
              </label>

              <label className="form-field">
                <span>能力画像</span>
                <textarea
                  name="abilityProfile"
                  rows={4}
                  defaultValue={manual?.abilityProfile ?? ""}
                  placeholder="记录已有优势、正在补齐的能力和可迁移经验。"
                />
              </label>

              <label className="form-field">
                <span>情绪模式</span>
                <textarea
                  name="emotionPatterns"
                  rows={4}
                  defaultValue={manual?.emotionPatterns ?? ""}
                  placeholder="记录最近常见情绪、触发场景和恢复方式。"
                />
              </label>

              <label className="form-field">
                <span>高能量来源</span>
                <textarea
                  name="energySources"
                  rows={4}
                  defaultValue={getListText(manual?.energySources)}
                  placeholder="每行写一个来源，例如：清晰产出、稳定运动、被看见的反馈。"
                />
              </label>

              <label className="form-field">
                <span>常见内耗点</span>
                <textarea
                  name="drainSources"
                  rows={4}
                  defaultValue={getListText(manual?.drainSources)}
                  placeholder="每行写一个内耗点，例如：信息太多时难以开始。"
                />
              </label>

              <label className="form-field">
                <span>反复出现的问题</span>
                <textarea
                  name="recurringProblems"
                  rows={4}
                  defaultValue={getListText(manual?.recurringProblems)}
                  placeholder="每行写一个问题，例如：目标过大时容易只规划不行动。"
                />
              </label>

              <label className="form-field">
                <span>适合自己的行动建议风格</span>
                <textarea
                  name="preferredActionStyle"
                  rows={4}
                  defaultValue={manual?.preferredActionStyle ?? ""}
                  placeholder="例如：先给最小下一步，再补充判断标准和复盘问题。"
                />
              </label>

              <button className="soft-button w-full sm:w-fit" type="submit">
                保存个人说明书
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
