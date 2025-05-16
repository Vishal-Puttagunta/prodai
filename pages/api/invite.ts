// pages/api/invite.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { clerkClient, getAuth } from "@clerk/nextjs/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId, orgId: currentOrgId } = getAuth(req);
  const { email, orgId } = req.body;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  if (orgId !== currentOrgId) {
    return res.status(403).json({ error: "You can only invite to your current organization." });
  }

  try {
    console.log("typeof clerkClient:", typeof clerkClient);
    console.log("clerkClient keys:", Object.keys(clerkClient as any));
  
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Invite error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
