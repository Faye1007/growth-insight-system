import type { ScheduleRecurrence } from "@/lib/schedules/options";
import type { TaskCategory, TaskStatus } from "@/lib/tasks/options";

export type HabitCheckinStatus = "checked" | "skipped";
export type AiAnalysisPermission = "none" | "summary_only" | "allow_original";
export type IdeaStatus = "to_review" | "converted_to_task" | "shelved" | "abandoned";
export type ReportType = "daily" | "weekly" | "monthly";
export type GenerationStatus = "pending" | "completed" | "failed";
export type ToolType = "emotion_review" | "stress_sorting" | "tomorrow_plan";

export type AnniversaryType = "anniversary" | "birthday";
export type ReminderMode = "once" | "yearly";

// Row types (database format)
export type TaskRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  status: TaskStatus;
  task_date: string;
  is_postponed: boolean;
  postponed_from_date: string | null;
  postponed_to_date: string | null;
  review_note: string | null;
  completed_at: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type HabitRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: TaskCategory;
  is_active: boolean;
  start_date: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type HabitCheckinRow = {
  id: string;
  user_id: string;
  habit_id: string;
  checkin_date: string;
  status: HabitCheckinStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type ScheduleItemRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  start_date: string;
  end_date: string | null;
  recurrence: ScheduleRecurrence;
  start_time: string | null;
  end_time: string | null;
  is_pinned: boolean;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type LifeEventRow = {
  id: string;
  user_id: string;
  event_date: string;
  content: string;
  emotion_tags: unknown;
  tags: unknown;
  specific_event: string | null;
  next_action: string | null;
  ai_analysis_permission: AiAnalysisPermission;
  summary: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type IdeaRow = {
  id: string;
  user_id: string;
  idea_date: string;
  content: string;
  status: IdeaStatus;
  solution_note: string | null;
  converted_task_id: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type InsightReportRow = {
  id: string;
  user_id: string;
  report_type: ReportType;
  period_start: string;
  period_end: string;
  title: string;
  summary: string;
  patterns: string[];
  suggestions: string[];
  next_actions: string[];
  source_stats: Record<string, unknown> | null;
  source_highlights: string[] | null;
  selected_original_event_ids: string[] | null;
  model_provider: string;
  model_name: string;
  generation_status: GenerationStatus;
  error_message: string | null;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PersonalManualRow = {
  id: string;
  user_id: string;
  life_stage: string | null;
  current_goals: string[];
  ability_profile: string | null;
  emotion_patterns: string | null;
  energy_sources: string[];
  drain_sources: string[];
  recurring_problems: string[];
  preferred_action_style: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AnniversaryRow = {
  id: string;
  user_id: string;
  title: string;
  person_name: string;
  type: AnniversaryType;
  anniversary_date: string;
  is_lunar: boolean;
  reminder_date: string | null;
  reminder_mode: ReminderMode;
  note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type GiftRecordRow = {
  id: string;
  user_id: string;
  anniversary_id: string | null;
  gift_name: string;
  recipient_name: string;
  gift_date: string;
  return_gift: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ToolSessionRow = {
  id: string;
  user_id: string;
  tool_type: ToolType;
  title: string;
  input_content: string;
  output_content: string;
  ai_used: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

// Exported view types
export type TodayTask = {
  id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  status: TaskStatus;
  taskDate: string;
  isPostponed: boolean;
  postponedFromDate: string | null;
  postponedToDate: string | null;
  reviewNote: string | null;
  isPinned: boolean;
  createdAt: Date;
};

export type ActiveHabit = {
  id: string;
  name: string;
  description: string | null;
  category: TaskCategory;
  isActive: boolean;
  startDate: string | null;
  isPinned: boolean;
  createdAt: Date;
};

export type HabitRecord = {
  id: string;
  name: string;
  description: string | null;
  category: TaskCategory;
  isActive: boolean;
  startDate: string | null;
  isPinned: boolean;
  createdAt: Date;
};

export type HabitCheckin = {
  habitId: string;
  checkinDate: string;
  status: HabitCheckinStatus;
};

export type TodayScheduleItem = {
  id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  startDate: string;
  endDate: string | null;
  recurrence: ScheduleRecurrence;
  startTime: string | null;
  endTime: string | null;
  isPinned: boolean;
  isCompleted: boolean;
  createdAt: Date;
};

export type TodayLifeEvent = {
  id: string;
  content: string;
  eventDate: string;
  emotionTags: string[];
  tags: string[];
  specificEvent: string | null;
  nextAction: string | null;
  aiAnalysisPermission: AiAnalysisPermission;
  summary: string | null;
  isPinned: boolean;
  createdAt: Date;
};

export type TodayIdea = {
  id: string;
  content: string;
  ideaDate: string;
  status: IdeaStatus;
  solutionNote: string | null;
  isPinned: boolean;
  createdAt: Date;
};

export type DailyReviewReport = {
  id: string;
  title: string;
  summary: string;
  patterns: string[];
  suggestions: string[];
  nextActions: string[];
  modelProvider: string;
  modelName: string;
  generatedAt: Date | null;
};

export type ReviewReport = DailyReviewReport;

export type ExportReviewReport = ReviewReport & {
  reportType: ReportType;
  periodStart: string;
  periodEnd: string;
  createdAt: Date;
};

export type PersonalManual = {
  lifeStage: string | null;
  currentGoals: string[];
  abilityProfile: string | null;
  emotionPatterns: string | null;
  energySources: string[];
  drainSources: string[];
  recurringProblems: string[];
  preferredActionStyle: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AnniversaryRecord = {
  id: string;
  title: string;
  personName: string;
  type: AnniversaryType;
  anniversaryDate: string;
  isLunar: boolean;
  reminderDate: string | null;
  reminderMode: ReminderMode;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GiftRecord = {
  id: string;
  anniversaryId: string | null;
  giftName: string;
  recipientName: string;
  giftDate: string;
  returnGift: string | null;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ToolSessionRecord = {
  id: string;
  toolType: ToolType;
  title: string;
  inputContent: string;
  outputContent: string;
  aiUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type RecentTaskRecord = {
  id: string;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  taskDate: string;
  isPostponed: boolean;
  createdAt: Date;
};

export type RecentHabitCheckinRecord = {
  id: string;
  habitName: string;
  checkinDate: string;
  status: HabitCheckinStatus;
  createdAt: Date;
};

export type RecentScheduleRecord = {
  id: string;
  title: string;
  category: TaskCategory;
  startDate: string;
  startTime: string | null;
  endTime: string | null;
  isCompleted: boolean;
  createdAt: Date;
};

export type RecentLifeEventRecord = {
  id: string;
  content: string;
  eventDate: string;
  emotionTags: string[];
  tags: string[];
  createdAt: Date;
};

export type RecentIdeaRecord = {
  id: string;
  content: string;
  ideaDate: string;
  status: IdeaStatus;
  createdAt: Date;
};

export type TaskDetail = {
  title: string;
  description: string | null;
  category: TaskCategory;
  status: TaskStatus;
  taskDate: string;
  isPostponed: boolean;
  postponedFromDate: string | null;
  postponedToDate: string | null;
  reviewNote: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type HabitDetail = {
  habitId: string;
  habitName: string;
  habitDescription: string | null;
  habitCategory: TaskCategory;
  habitStartDate: string | null;
  habitIsActive: boolean;
  checkinDate: string;
  status: HabitCheckinStatus;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ScheduleDetail = {
  title: string;
  description: string | null;
  category: TaskCategory;
  startDate: string;
  endDate: string | null;
  recurrence: ScheduleRecurrence;
  startTime: string | null;
  endTime: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type EventDetail = {
  content: string;
  eventDate: string;
  emotionTags: string[];
  tags: string[];
  specificEvent: string | null;
  nextAction: string | null;
  aiAnalysisPermission: AiAnalysisPermission;
  summary: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type IdeaDetail = {
  content: string;
  ideaDate: string;
  status: IdeaStatus;
  solutionNote: string | null;
  convertedTaskId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InsightTask = {
  id: string;
  category: TaskCategory;
  status: TaskStatus;
  taskDate: string;
};

export type InsightHabit = {
  id: string;
  name: string;
  category: TaskCategory;
};

export type InsightHabitCheckin = HabitCheckin;

export type InsightSchedule = {
  scheduleDate: string;
};

export type InsightLifeEvent = {
  eventDate: string;
  emotionTags: string[];
};

export type InsightIdea = {
  ideaDate: string;
};

export type MonthlyInsightWeeklyReport = {
  id: string;
  periodStart: string;
  periodEnd: string;
  title: string;
  summary: string;
  generatedAt: Date | null;
};

export type DailyReviewTask = {
  id: string;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  isPostponed: boolean;
  reviewNote: string | null;
  completedAt: Date | null;
  createdAt: Date;
};

export type DailyReviewHabit = {
  id: string;
  name: string;
  category: TaskCategory;
  createdAt: Date;
};

export type DailyReviewHabitCheckin = {
  habitId: string;
  checkinDate: string;
  status: HabitCheckinStatus;
  note: string | null;
};

export type DailyReviewSchedule = {
  id: string;
  title: string;
  category: TaskCategory;
  startTime: string | null;
  endTime: string | null;
  description: string | null;
  createdAt: Date;
};

export type DailyReviewLifeEvent = {
  id: string;
  content: string;
  emotionTags: string[];
  tags: string[];
  specificEvent: string | null;
  nextAction: string | null;
  aiAnalysisPermission: AiAnalysisPermission;
  summary: string | null;
  createdAt: Date;
};

export type DailyReviewIdea = {
  id: string;
  content: string;
  status: IdeaStatus;
  solutionNote: string | null;
  createdAt: Date;
};

export type DailyReviewRows = {
  tasks: DailyReviewTask[];
  habits: DailyReviewHabit[];
  habitCheckins: DailyReviewHabitCheckin[];
  schedules: DailyReviewSchedule[];
  lifeEvents: DailyReviewLifeEvent[];
  ideas: DailyReviewIdea[];
};

export type WeeklyReviewTask = DailyReviewTask & {
  taskDate: string;
};

export type WeeklyReviewHabit = DailyReviewHabit;

export type WeeklyReviewHabitCheckin = DailyReviewHabitCheckin;

export type WeeklyReviewSchedule = DailyReviewSchedule & {
  startDate: string;
};

export type WeeklyReviewLifeEvent = DailyReviewLifeEvent & {
  eventDate: string;
};

export type WeeklyReviewIdea = DailyReviewIdea & {
  ideaDate: string;
};

export type WeeklyReviewRows = {
  tasks: WeeklyReviewTask[];
  habits: WeeklyReviewHabit[];
  habitCheckins: WeeklyReviewHabitCheckin[];
  schedules: WeeklyReviewSchedule[];
  lifeEvents: WeeklyReviewLifeEvent[];
  ideas: WeeklyReviewIdea[];
};

export type MonthlyReviewRows = WeeklyReviewRows & {
  weeklyReports: MonthlyInsightWeeklyReport[];
};

export type UpcomingAnniversary = AnniversaryRecord & {
  upcomingDate: string;
  daysUntil: number;
  isToday: boolean;
};

export type ChecklistTask = {
  id: string;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  taskDate: string;
  isPostponed: boolean;
  isPinned: boolean;
  createdAt: Date;
};

export type ChecklistSchedule = {
  id: string;
  title: string;
  category: TaskCategory;
  startDate: string;
  endDate: string | null;
  recurrence: ScheduleRecurrence;
  startTime: string | null;
  endTime: string | null;
  isPinned: boolean;
  createdAt: Date;
};

export type ChecklistHabit = {
  id: string;
  name: string;
  category: TaskCategory;
  startDate: string | null;
  isPinned: boolean;
  isCheckedOnDate: boolean;
  checkedDates: string[];
  totalCount: number;
  streakCount: number;
  createdAt: Date;
};

export type ChecklistIdea = {
  id: string;
  content: string;
  ideaDate: string;
  status: IdeaStatus;
  isPinned: boolean;
  createdAt: Date;
};

export type LifeEventRecord = {
  id: string;
  content: string;
  eventDate: string;
  emotionTags: string[];
  tags: string[];
  aiAnalysisPermission: AiAnalysisPermission;
  summary: string | null;
  isPinned: boolean;
  createdAt: Date;
};

export type TrashedItem = {
  id: string;
  kind: string;
  label: string;
  title: string;
  deletedAt: string;
};

export type SearchResultItem = {
  id: string;
  kind: string;
  label: string;
  title: string;
  date: string;
};

export type DailyOverviewStats = {
  totalTasks: number;
  completedTasks: number;
  totalHabits: number;
  checkedHabits: number;
  totalSchedules: number;
  totalEvents: number;
  totalIdeas: number;
};
