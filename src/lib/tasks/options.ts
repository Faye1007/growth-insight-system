export const taskCategories = [
  { value: "study", label: "学习" },
  { value: "work", label: "工作" },
  { value: "life", label: "生活" },
  { value: "health", label: "健康" },
  { value: "relationship", label: "关系" },
  { value: "other", label: "其他" },
] as const;

export const taskStatuses = [
  { value: "todo", label: "未开始" },
  { value: "in_progress", label: "进行中" },
  { value: "completed", label: "已完成" },
  { value: "postponed", label: "延期" },
] as const;

export type TaskCategory = (typeof taskCategories)[number]["value"];
export type TaskStatus = (typeof taskStatuses)[number]["value"];

export function getTaskCategoryLabel(category: TaskCategory) {
  return taskCategories.find((item) => item.value === category)?.label ?? "其他";
}

export function getTaskStatusLabel(status: TaskStatus) {
  return taskStatuses.find((item) => item.value === status)?.label ?? "未开始";
}

export function isTaskCategory(value: string): value is TaskCategory {
  return taskCategories.some((item) => item.value === value);
}

export function isTaskStatus(value: string): value is TaskStatus {
  return taskStatuses.some((item) => item.value === value);
}
