import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { buildLoginPath, loginRequiredMessage } from "./paths";

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  } catch {
    return null;
  }
}

export async function requireCurrentUser(nextPath = "/daily"): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(buildLoginPath({ next: nextPath, message: loginRequiredMessage }));
  }

  return user;
}
