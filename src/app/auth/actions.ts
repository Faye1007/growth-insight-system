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
