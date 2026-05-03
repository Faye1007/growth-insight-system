const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type SupabaseConfigStatus = {
  hasUrl: boolean;
  hasPublicKey: boolean;
  hasServiceRoleKey: boolean;
  hasDatabaseUrl: boolean;
  isPublicClientReady: boolean;
  isServerConfigReady: boolean;
};

export function getSupabasePublicConfig() {
  return {
    url: supabaseUrl,
    publishableKey: supabasePublishableKey,
  };
}

export function assertSupabasePublicConfig(): {
  url: string;
  publishableKey: string;
} {
  const publicConfig = getSupabasePublicConfig();

  if (!publicConfig.url || !publicConfig.publishableKey) {
    throw new Error(
      "Missing Supabase public config. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return {
    url: publicConfig.url,
    publishableKey: publicConfig.publishableKey,
  };
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasPublicKey = Boolean(supabasePublishableKey);
  const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

  return {
    hasUrl,
    hasPublicKey,
    hasServiceRoleKey,
    hasDatabaseUrl,
    isPublicClientReady: hasUrl && hasPublicKey,
    isServerConfigReady: hasServiceRoleKey && hasDatabaseUrl,
  };
}
