"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { buildLoginPath, getSafeNextPath } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";
import { assertSupabasePublicConfig } from "@/lib/supabase/config";

const userOwnedTablesInDeleteOrder = [
  "habit_checkins",
  "gift_records",
  "tool_sessions",
  "insight_reports",
  "personal_manuals",
  "ideas",
  "schedule_items",
  "life_events",
  "anniversaries",
  "habits",
  "tasks",
] as const;

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

async function deleteBusinessDataForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  for (const table of userOwnedTablesInDeleteOrder) {
    const { error } = await supabase.from(table).delete().eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete ${table} rows for user.`);
    }
  }
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

export async function clearAccountDataAction(formData: FormData) {
  const confirmClear = getStringValue(formData, "confirmClear");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || confirmClear !== "CLEAR_MY_DATA") {
    redirect("/settings");
  }

  try {
    await deleteBusinessDataForUser(supabase, user.id);
  } catch {
    redirect("/settings?accountError=clear_failed");
  }

  redirect("/settings?accountDataCleared=1");
}

export async function deleteAccountAction(formData: FormData) {
  const confirmDelete = getStringValue(formData, "confirmDelete");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || confirmDelete !== "DELETE_MY_ACCOUNT") {
    redirect("/settings");
  }

  const userId = user.id;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    redirect("/settings?accountError=missing_service_role");
  }

  const { url } = assertSupabasePublicConfig();
  const adminSupabase = createAdminClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    await deleteBusinessDataForUser(adminSupabase, userId);

    const { error: deleteUserError } = await adminSupabase.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      throw new Error("Failed to delete auth user.");
    }
  } catch {
    redirect("/settings?accountError=delete_failed");
  }

  await supabase.auth.signOut();

  redirect("/?accountDeleted=1");
}
