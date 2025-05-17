// pages/api/check-access.ts

import type { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "../../lib/supabaseClient"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ message: "Missing userId" })
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true)

  if (error || !data || data.length === 0) {
    return res.status(200).json({ ok: false })
  }

  return res.status(200).json({ ok: true })
}
