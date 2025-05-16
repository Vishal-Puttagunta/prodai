import { clerkClient } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Missing auth token." });
  }

  try {
    // ✅ Use `as any` to avoid broken TS types
    const client = clerkClient as any;

    const { userId, organization } = await client.authenticateRequest({ token });
    const orgId = organization?.id;

    if (!userId || !orgId) {
      return res.status(403).json({ error: "Unauthorized or no organization." });
    }

    const memberships = await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

    const members = memberships.map((m: any) => ({
      id: m.id,
      name: `${m.publicUserData.firstName ?? ""} ${m.publicUserData.lastName ?? ""}`.trim(),
      email: m.publicUserData.identifier,
      role: m.role,
    }));

    return res.status(200).json({ members });
  } catch (err: any) {
    console.error("Error verifying token:", err.message);
    return res.status(401).json({ error: "Invalid session or token." });
  }
}
