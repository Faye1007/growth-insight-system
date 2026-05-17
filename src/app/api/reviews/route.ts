import { NextRequest } from "next/server";
import { apiResponse, apiError, requireApiKey } from "@/lib/api/auth";
import {
  getDailyReviewRowsForUser,
  getWeeklyReviewRowsForUser,
  getMonthlyReviewRowsForUser,
} from "@/lib/data/user-data";

function getBeijingDateValue(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

function getBeijingDateAfter(days: number, date = new Date()) {
  const targetDate = new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  return getBeijingDateValue(targetDate);
}

function getBeijingMonthStart(date = new Date()) {
  return `${getBeijingDateValue(date).slice(0, 8)}01`;
}

function getBeijingMonthEnd(date = new Date()) {
  const dateValue = getBeijingDateValue(date);
  const year = Number(dateValue.slice(0, 4));
  const month = Number(dateValue.slice(5, 7));
  const nextMonthStart =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  return getBeijingDateAfter(-1, new Date(`${nextMonthStart}T00:00:00+08:00`));
}

export async function GET(request: NextRequest) {
  const auth = await requireApiKey(request);
  if (auth instanceof Response) return auth;

  const { userId } = auth;
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "daily";
  const date = url.searchParams.get("date") || getBeijingDateValue();

  try {
    let reviews;
    switch (type) {
      case "weekly": {
        const weekStart = getBeijingDateAfter(-6, new Date(`${date}T00:00:00+08:00`));
        reviews = await getWeeklyReviewRowsForUser(userId, weekStart, date);
        break;
      }
      case "monthly": {
        const monthStart = getBeijingMonthStart(new Date(`${date}T00:00:00+08:00`));
        const monthEnd = getBeijingMonthEnd(new Date(`${date}T00:00:00+08:00`));
        reviews = await getMonthlyReviewRowsForUser(userId, monthStart, monthEnd);
        break;
      }
      default:
        reviews = await getDailyReviewRowsForUser(userId, date);
        break;
    }
    return apiResponse(reviews);
  } catch {
    return apiError("获取复盘数据失败", 500);
  }
}
