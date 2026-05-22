import { NextRequest } from "next/server";
import { apiResponse, apiError, requireApiKey } from "@/lib/api/auth";
import {
  getDailyReviewRowsForUser,
  getWeeklyReviewRowsForUser,
  getMonthlyReviewRowsForUser,
} from "@/lib/data/user-data";
import { getBeijingDateValue, getBeijingDateAfter, getBeijingMonthStart, getBeijingMonthEnd } from "@/lib/date";

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
