export type FeedbackTone = "success" | "error" | "info";

export type FeedbackMessage = {
  tone: FeedbackTone;
  title: string;
  detail: string;
};

export function getFeedbackByCode(
  code: string | undefined,
  messages: Record<string, FeedbackMessage>,
  fallback?: FeedbackMessage,
) {
  if (!code) {
    return null;
  }

  return messages[code] ?? fallback ?? null;
}

export const authMessageFeedback: Record<string, FeedbackMessage> = {
  check_email: {
    tone: "success",
    title: "注册邮件已发送",
    detail: "请按邮件提示完成确认后再登录。",
  },
  login_required: {
    tone: "info",
    title: "需要先登录",
    detail: "保存任务、习惯、日程、事件、灵感或复盘前，需要先注册或登录。",
  },
};

export const authErrorFeedback: Record<string, FeedbackMessage> = {
  missing_fields: {
    tone: "error",
    title: "邮箱或密码还没填完整",
    detail: "请补全邮箱和密码后再提交。",
  },
  login_failed: {
    tone: "error",
    title: "登录没有成功",
    detail: "请检查邮箱和密码是否正确，再重新登录。",
  },
  signup_failed: {
    tone: "error",
    title: "注册没有成功",
    detail: "请稍后重试，或确认这个邮箱是否已经注册。",
  },
  confirm_failed: {
    tone: "error",
    title: "邮箱确认没有成功",
    detail: "请重新打开确认邮件；如果链接已过期，可以重新注册一次。",
  },
};

export const dailyTaskErrorFeedback: Record<string, FeedbackMessage> = {
  missing_title: {
    tone: "error",
    title: "任务标题还没填写",
    detail: "请先填写任务标题，再保存。",
  },
  invalid_status: {
    tone: "error",
    title: "任务状态无法识别",
    detail: "请刷新页面后重试。",
  },
  missing_postponed_date: {
    tone: "error",
    title: "延期日期还没选择",
    detail: "延期任务需要选择新的日期。",
  },
  missing_task: {
    tone: "error",
    title: "没有找到这条任务",
    detail: "这条任务可能已经不存在。请刷新页面后重试。",
  },
  save_failed: {
    tone: "error",
    title: "任务没有保存成功",
    detail: "请稍后重试；如果连续失败，可以先刷新页面再操作。",
  },
};

export const dailyTaskUpdatedFeedback: Record<string, FeedbackMessage> = {
  in_progress: {
    tone: "success",
    title: "任务已更新",
    detail: "任务已标记为进行中。",
  },
  completed: {
    tone: "success",
    title: "任务已完成",
    detail: "任务已标记为已完成。",
  },
  postponed: {
    tone: "success",
    title: "任务已延期",
    detail: "任务日期已同步更新到新的延期日期。",
  },
  edited: {
    tone: "success",
    title: "任务已保存",
    detail: "任务标题、分类、日期、状态或备注已更新。",
  },
  deleted: {
    tone: "success",
    title: "任务已删除",
    detail: "这条任务已从每日工作台、成长记录和统计中移除。",
  },
};

export const dailyHabitErrorFeedback: Record<string, FeedbackMessage> = {
  missing_name: {
    tone: "error",
    title: "习惯名称还没填写",
    detail: "请先填写习惯名称，再保存。",
  },
  invalid_checkin: {
    tone: "error",
    title: "习惯打卡操作无法识别",
    detail: "请刷新页面后重试。",
  },
  missing_habit: {
    tone: "error",
    title: "没有找到这个启用习惯",
    detail: "这个习惯可能已停用或不存在。请刷新页面后重试。",
  },
  save_failed: {
    tone: "error",
    title: "习惯没有保存成功",
    detail: "请稍后重试；如果连续失败，可以先刷新页面再操作。",
  },
};

export const dailyHabitUpdatedFeedback: Record<string, FeedbackMessage> = {
  checked: {
    tone: "success",
    title: "习惯已打卡",
    detail: "今日习惯已标记为完成。",
  },
  skipped: {
    tone: "success",
    title: "打卡已取消",
    detail: "今日打卡状态已恢复为未完成。",
  },
  edited: {
    tone: "success",
    title: "习惯已保存",
    detail: "习惯名称、分类、说明或开始日期已更新。",
  },
  deactivated: {
    tone: "success",
    title: "习惯已停用",
    detail: "这个习惯不会再出现在今日打卡列表，历史打卡记录仍会保留。",
  },
};

export const dailyScheduleErrorFeedback: Record<string, FeedbackMessage> = {
  missing_title: {
    tone: "error",
    title: "日程标题还没填写",
    detail: "请先填写日程标题，再保存。",
  },
  missing_time: {
    tone: "error",
    title: "日程时间还没选择",
    detail: "请先选择开始时间，再保存。",
  },
  invalid_time: {
    tone: "error",
    title: "日程时间格式不正确",
    detail: "请重新选择开始时间或结束时间。",
  },
  missing_schedule: {
    tone: "error",
    title: "没有找到这条日程",
    detail: "这条日程可能已经不存在。请刷新页面后重试。",
  },
  save_failed: {
    tone: "error",
    title: "日程没有保存成功",
    detail: "请稍后重试；如果连续失败，可以先刷新页面再操作。",
  },
};

export const dailyScheduleUpdatedFeedback: Record<string, FeedbackMessage> = {
  edited: {
    tone: "success",
    title: "日程已保存",
    detail: "日程标题、分类、日期、时间或说明已更新。",
  },
  deleted: {
    tone: "success",
    title: "日程已删除",
    detail: "这条日程已从每日工作台、成长记录和统计中移除。",
  },
};

export const dailyRecordErrorFeedback: Record<string, FeedbackMessage> = {
  missing_content: {
    tone: "error",
    title: "记录内容还没填写",
    detail: "请先填写事件或灵感内容，再保存。",
  },
  invalid_type: {
    tone: "error",
    title: "记录类型无法识别",
    detail: "请刷新页面后重新选择事件或灵感。",
  },
  missing_event: {
    tone: "error",
    title: "没有找到这条事件",
    detail: "这条事件可能已经不存在。请刷新页面后重试。",
  },
  missing_idea: {
    tone: "error",
    title: "没有找到这条灵感",
    detail: "这条灵感可能已经不存在。请刷新页面后重试。",
  },
  save_failed: {
    tone: "error",
    title: "记录没有保存成功",
    detail: "请稍后重试；保存记录不会触发 AI 调用。",
  },
};

export const dailyRecordCreatedFeedback: Record<string, FeedbackMessage> = {
  event: {
    tone: "success",
    title: "事件已保存",
    detail: "这次保存不会自动触发 AI 分析。",
  },
  idea: {
    tone: "success",
    title: "灵感已保存",
    detail: "灵感已保存为待处理状态。",
  },
};

export const dailyRecordUpdatedFeedback: Record<string, FeedbackMessage> = {
  event_edited: {
    tone: "success",
    title: "事件已保存",
    detail: "事件内容、日期、标签或 AI 分析权限已更新。",
  },
  event_deleted: {
    tone: "success",
    title: "事件已删除",
    detail: "这条事件已从每日工作台、成长记录、统计和复盘上下文中移除。",
  },
  idea_edited: {
    tone: "success",
    title: "灵感已保存",
    detail: "灵感内容、日期、状态或处理说明已更新。",
  },
  idea_deleted: {
    tone: "success",
    title: "灵感已删除",
    detail: "这条灵感已从每日工作台、成长记录和统计中移除。",
  },
};

export const dailyReviewErrorFeedback: Record<string, FeedbackMessage> = {
  context_failed: {
    tone: "error",
    title: "复盘内容准备失败",
    detail: "系统暂时没有读到今天的统计摘要。请稍后重试，普通记录不受影响。",
  },
  missing_ai_config: {
    tone: "error",
    title: "每日复盘暂时不能生成",
    detail: "服务端 AI 配置还不完整。普通记录、统计和图表不受影响。",
  },
  provider_failed: {
    tone: "error",
    title: "AI 生成没有成功",
    detail: "请稍后重试；已有记录和程序统计不会受影响。",
  },
  save_failed: {
    tone: "error",
    title: "复盘报告没有保存成功",
    detail: "AI 已返回结果但保存失败。请稍后重新生成。",
  },
};

export const manualSavedFeedback: FeedbackMessage = {
  tone: "success",
  title: "个人说明书已保存",
  detail: "这些内容已关联到当前账号，刷新后可以继续读回。",
};

export const manualErrorFeedback: Record<string, FeedbackMessage> = {
  save_failed: {
    tone: "error",
    title: "个人说明书没有保存成功",
    detail: "请稍后重试；如果连续失败，可以先刷新页面再操作。",
  },
};

export const defaultAuthErrorFeedback: FeedbackMessage = {
  tone: "error",
  title: "操作没有成功",
  detail: "请稍后重试。",
};

export const defaultTaskErrorFeedback: FeedbackMessage = {
  tone: "error",
  title: "任务没有保存成功",
  detail: "请稍后重试；如果连续失败，可以先刷新页面再操作。",
};

export const defaultHabitErrorFeedback: FeedbackMessage = {
  tone: "error",
  title: "习惯操作没有成功",
  detail: "请稍后重试；如果连续失败，可以先刷新页面再操作。",
};

export const defaultScheduleErrorFeedback: FeedbackMessage = {
  tone: "error",
  title: "日程没有保存成功",
  detail: "请稍后重试；如果连续失败，可以先刷新页面再操作。",
};

export const defaultRecordErrorFeedback: FeedbackMessage = {
  tone: "error",
  title: "记录没有保存成功",
  detail: "请稍后重试；如果连续失败，可以先刷新页面再操作。",
};

export const defaultReviewErrorFeedback: FeedbackMessage = {
  tone: "error",
  title: "今日复盘没有生成成功",
  detail: "请稍后重试；普通记录和统计不受影响。",
};

export const defaultManualErrorFeedback: FeedbackMessage = {
  tone: "error",
  title: "个人说明书没有保存成功",
  detail: "请稍后重试；已保存的记录和统计不受影响。",
};
