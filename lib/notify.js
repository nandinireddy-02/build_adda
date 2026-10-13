import "server-only";
import { query } from "./db";

// Sends an in-app notification to one or more people. Never notifies the
// person who caused it, and never lets a failed notification break the action.
export async function notify(userIds, message, link = "", { except } = {}) {
  const ids = [...new Set([].concat(userIds))].filter((id) => id && id !== except);
  if (ids.length === 0) return;
  try {
    await query(
      `insert into notifications (user_id, message, link)
       select unnest($1::int[]), $2, $3`,
      [ids, message.slice(0, 300), link]
    );
  } catch (error) {
    console.error("Couldn't save notification:", error.message);
  }
}
