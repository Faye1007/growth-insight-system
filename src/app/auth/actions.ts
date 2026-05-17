"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { buildLoginPath, getSafeNextPath } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function signInAction(formData: FormData) {
  const email = getStringValue(formData, "email");
  const password = getStringValue(formData, "password");
  const next = getSafeNextPath(formData.get("next"));

  if (!email || !password) {
    redirect(buildLoginPath({ mode: "login", error: "missing_fields", next }));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(buildLoginPath({ mode: "login", error: "login_failed", next }));
  }

  redirect(next);
}

export async function signUpAction(formData: FormData) {
  const email = getStringValue(formData, "email");
  const password = getStringValue(formData, "password");
  const next = getSafeNextPath(formData.get("next"));

  if (!email || !password) {
    redirect(buildLoginPath({ mode: "signup", error: "missing_fields", next }));
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? "http://localhost:3001";
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirect(buildLoginPath({ mode: "signup", error: "signup_failed", next }));
  }

  redirect(buildLoginPath({ mode: "login", message: "check_email", next }));
}

export async function signOutAction() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/");
}

export async function updateNicknameAction(formData: FormData) {
  const nickname = getStringValue(formData, "nickname");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/settings");
  }

  if (!nickname) {
    redirect("/settings?nicknameError=empty");
  }

  const { error } = await supabase.auth.updateUser({
    data: { nickname },
  });

  if (error) {
    redirect("/settings?nicknameError=failed");
  }

  redirect("/settings?nicknameUpdated=1");
}

export async function deleteAccountAction(formData: FormData) {
  const confirmDelete = getStringValue(formData, "confirmDelete");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || confirmDelete !== "DELETE_MY_ACCOUNT") {
    redirect("/settings");
  }

  const userId = user.id;

  const { data: db, error: dbError } = await supabase
    .from("_direct_db_check")
    .select("*")
    .limit(1);

  if (dbError && dbError.code === "42P01") {
    const { createClient: createDirectClient } = await import("@/lib/supabase/server");
    const directSupabase = await createDirectClient();

    const tables = [
      "tasks", "habits", "habit_checkins", "schedule_items",
      "life_events", "ideas", "insight_reports", "personal_manuals",
      "anniversaries", "gift_records", "tool_sessions",
    ];

    for (const table of tables) {
      await directSupabase
        .from(table)
        .update({ deleted_at: new Date().toISOString() })
        .eq("user_id", userId)
        .is("deleted_at", null);
    }
  }

  await supabase.auth.signOut();

  redirect("/?accountDeleted=1");
}
