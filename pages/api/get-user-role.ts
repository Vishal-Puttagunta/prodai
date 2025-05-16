import { clerkClient } from "@clerk/clerk-sdk-node";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, orgId } = req.query;

  if (!userId || !orgId || typeof userId !== "string" || typeof orgId !== "string") {
    return res.status(400).json({ error: "Missing or invalid userId/orgId" });
  }

  try {
    const memberships = await clerkClient.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

    // Debug logging
    console.log("Memberships returned:", memberships.data.map(m => ({
      userId: m.publicUserData?.userId,
      role: m.role
    })));

    const membership = memberships.data.find(
      (m) => String(m.publicUserData?.userId) === String(userId)
    );

    if (!membership) {
      return res.status(404).json({ error: "User not found in organization" });
    }

    return res.status(200).json({ role: membership.role });
  } catch (error) {
    console.error("Error getting user role:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
