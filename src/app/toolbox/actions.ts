"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth/session";
import { createToolSessionForUser, type ToolType } from "@/lib/data/user-data/index";

const toolTypes: ToolType[] = ["emotion_review", "stress_sorting", "tomorrow_plan"];

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function isToolType(value: string): value is ToolType {
  return toolTypes.includes(value as ToolType);
}

function getToolTitle(toolType: ToolType) {
  const titles: Record<ToolType, string> = {
    emotion_review: "情绪复盘",
    stress_sorting: "压力整理",
    tomorrow_plan: "明日计划",
  };

  return titles[toolType];
}

function buildProgramOutput(toolType: ToolType, inputContent: string) {
  const normalizedInput = inputContent.replace(/\s+/g, " ").trim();
  const preview = normalizedInput.length > 80 ? `${normalizedInput.slice(0, 80)}...` : normalizedInput;

  if (toolType === "emotion_review") {
    return [
      "情绪复盘结果",
      `- 当前记录：${preview}`,
      "- 先给这段体验命名：它可能包含情绪、事件和未被满足的需要。",
      "- 下一步：补一句“我现在最需要的是……”；再选一个 10 分钟内能完成的小动作。",
    ].join("\n");
  }

  if (toolType === "stress_sorting") {
    return [
      "压力整理结果",
      `- 当前压力源：${preview}`,
      "- 先拆成两类：今天能推进的事、今天只能接受或等待的事。",
      "- 下一步：从能推进的事里选 1 件，写成一个具体动作，并把其余内容放到稍后处理。",
    ].join("\n");
  }

  return [
    "明日计划结果",
    `- 当前输入：${preview}`,
    "- 明天优先只保留 1 个最重要目标、2 个必要任务、1 个恢复精力的安排。",
    "- 下一步：把最重要目标安排到最清醒的时间段，并提前写下第一步动作。",
  ].join("\n");
}

export async function createToolSessionAction(formData: FormData) {
  const user = await requireCurrentUser("/toolbox");
  const toolTypeValue = getStringValue(formData, "toolType");
  const inputContent = getStringValue(formData, "inputContent");

  if (!isToolType(toolTypeValue) || !inputContent) {
    redirect("/toolbox?toolError=invalid_input#new-tool-session");
  }

  try {
    await createToolSessionForUser({
      userId: user.id,
      toolType: toolTypeValue,
      title: getToolTitle(toolTypeValue),
      inputContent,
      outputContent: buildProgramOutput(toolTypeValue, inputContent),
      aiUsed: false,
    });
  } catch {
    redirect("/toolbox?toolError=save_failed#new-tool-session");
  }

  revalidatePath("/toolbox");
  redirect(`/toolbox?toolSaved=created&toolType=${toolTypeValue}#tool-history`);
}
