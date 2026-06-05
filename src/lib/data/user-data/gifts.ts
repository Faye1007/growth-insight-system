import { createClient } from "@/lib/supabase/server";
import { assertRow, assertArray, assertAnniversaryBelongsToUser } from "./helpers";
import type { GiftRecordRow, GiftRecord } from "./types";

function mapGiftRecord(row: GiftRecordRow): GiftRecord {
  return {
    id: row.id,
    anniversaryId: row.anniversary_id,
    giftName: row.gift_name,
    recipientName: row.recipient_name,
    giftDate: row.gift_date,
    returnGift: row.return_gift,
    note: row.note,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function createGiftRecordForUser(input: {
  userId: string;
  anniversaryId: string | null;
  giftName: string;
  recipientName: string;
  giftDate: string;
  returnGift: string | null;
  note: string | null;
}) {
  const supabase = await createClient();
  await assertAnniversaryBelongsToUser(supabase, input.userId, input.anniversaryId);

  const { error } = await supabase.from("gift_records").insert({
    user_id: input.userId,
    anniversary_id: input.anniversaryId,
    gift_name: input.giftName,
    recipient_name: input.recipientName,
    gift_date: input.giftDate,
    return_gift: input.returnGift,
    note: input.note,
  });

  if (error) {
    throw error;
  }
}

export async function updateGiftRecordForUser(input: {
  userId: string;
  giftRecordId: string;
  anniversaryId: string | null;
  giftName: string;
  recipientName: string;
  giftDate: string;
  returnGift: string | null;
  note: string | null;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  await assertAnniversaryBelongsToUser(supabase, input.userId, input.anniversaryId);

  const { error } = await supabase
    .from("gift_records")
    .update({
      anniversary_id: input.anniversaryId,
      gift_name: input.giftName,
      recipient_name: input.recipientName,
      gift_date: input.giftDate,
      return_gift: input.returnGift,
      note: input.note,
      updated_at: input.updatedAt.toISOString(),
    })
    .eq("id", input.giftRecordId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function softDeleteGiftRecordForUser(input: {
  userId: string;
  giftRecordId: string;
  deletedAt: Date;
}) {
  const deletedAtIso = input.deletedAt.toISOString();
  const supabase = await createClient();
  const { error } = await supabase
    .from("gift_records")
    .update({
      deleted_at: deletedAtIso,
      updated_at: deletedAtIso,
    })
    .eq("id", input.giftRecordId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function getGiftRecordsForUser(input: {
  userId: string;
  recipientName?: string;
  anniversaryId?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("gift_records")
    .select("id,anniversary_id,gift_name,recipient_name,gift_date,return_gift,note,created_at,updated_at")
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (input.recipientName) {
    query = query.eq("recipient_name", input.recipientName);
  }

  if (input.anniversaryId) {
    query = query.eq("anniversary_id", input.anniversaryId);
  }

  const { data, error } = await query
    .order("gift_date", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<GiftRecordRow[]>();

  return assertArray(data, error).map(mapGiftRecord);
}

export async function getGiftRecordDetailForUser(userId: string, giftRecordId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gift_records")
    .select("id,anniversary_id,gift_name,recipient_name,gift_date,return_gift,note,created_at,updated_at")
    .eq("id", giftRecordId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle<GiftRecordRow>();

  const row = assertRow(data, error);

  return row ? mapGiftRecord(row) : null;
}
