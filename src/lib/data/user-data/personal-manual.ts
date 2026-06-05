import { createClient } from "@/lib/supabase/server";
import { assertRow } from "./helpers";
import type { PersonalManualRow } from "./types";

export async function getPersonalManualForUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("personal_manuals")
    .select("life_stage,current_goals,ability_profile,emotion_patterns,energy_sources,drain_sources,recurring_problems,preferred_action_style,notes,created_at,updated_at")
    .eq("user_id", userId)
    .returns<PersonalManualRow>()
    .maybeSingle();
  const row = assertRow(data as PersonalManualRow | null, error);

  return row
    ? {
        lifeStage: row.life_stage,
        currentGoals: row.current_goals,
        abilityProfile: row.ability_profile,
        emotionPatterns: row.emotion_patterns,
        energySources: row.energy_sources,
        drainSources: row.drain_sources,
        recurringProblems: row.recurring_problems,
        preferredActionStyle: row.preferred_action_style,
        notes: row.notes,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }
    : null;
}

export async function upsertPersonalManualForUser(input: {
  userId: string;
  lifeStage: string | null;
  currentGoals: string[];
  abilityProfile: string | null;
  emotionPatterns: string | null;
  energySources: string[];
  drainSources: string[];
  recurringProblems: string[];
  preferredActionStyle: string | null;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("personal_manuals").upsert(
    {
      user_id: input.userId,
      life_stage: input.lifeStage,
      current_goals: input.currentGoals,
      ability_profile: input.abilityProfile,
      emotion_patterns: input.emotionPatterns,
      energy_sources: input.energySources,
      drain_sources: input.drainSources,
      recurring_problems: input.recurringProblems,
      preferred_action_style: input.preferredActionStyle,
      updated_at: input.updatedAt.toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw error;
  }
}
