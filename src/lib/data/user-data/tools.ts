import { createClient } from "@/lib/supabase/server";
import { assertArray } from "./helpers";
import type { ToolSessionRow, ToolSessionRecord, ToolType } from "./types";

function mapToolSession(row: ToolSessionRow): ToolSessionRecord {
  return {
    id: row.id,
    toolType: row.tool_type,
    title: row.title,
    inputContent: row.input_content,
    outputContent: row.output_content,
    aiUsed: row.ai_used,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function createToolSessionForUser(input: {
  userId: string;
  toolType: ToolType;
  title: string;
  inputContent: string;
  outputContent: string;
  aiUsed: boolean;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("tool_sessions").insert({
    user_id: input.userId,
    tool_type: input.toolType,
    title: input.title,
    input_content: input.inputContent,
    output_content: input.outputContent,
    ai_used: input.aiUsed,
  });

  if (error) {
    throw error;
  }
}

export async function getToolSessionsForUser(input: {
  userId: string;
  toolType?: ToolType;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("tool_sessions")
    .select("id,tool_type,title,input_content,output_content,ai_used,created_at,updated_at")
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (input.toolType) {
    query = query.eq("tool_type", input.toolType);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<ToolSessionRow[]>();

  return assertArray(data, error).map(mapToolSession);
}
