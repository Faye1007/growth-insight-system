import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { searchAllForUser } from "@/lib/data/user-data/index";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ results: [] });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";

  if (!query.trim()) {
    return Response.json({ results: [] });
  }

  try {
    const results = await searchAllForUser(user.id, query);
    return Response.json({ results });
  } catch {
    return Response.json({ results: [] });
  }
}
