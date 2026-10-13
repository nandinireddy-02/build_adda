"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function markAllRead() {
  const user = await requireUser("/notifications");
  await query("update notifications set read_at = now() where user_id = $1 and read_at is null", [user.id]);
  revalidatePath("/", "layout");
}
