import { clerkClient } from '@clerk/clerk-sdk-node'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { orgId } = req.query
  if (!orgId || typeof orgId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid orgId' })
  }

  try {
    const memberships = await clerkClient.organizations.getOrganizationMembershipList({ organizationId: orgId })

    const formatted = await Promise.all(
      memberships.data.map(async (member: any) => {
        const user = await clerkClient.users.getUser(member.publicUserData.userId)
        return {
          user_id: member.publicUserData.userId,
          id: member.publicUserData.userId, // used as key for tasks
          name: user.fullName || user.emailAddresses?.[0]?.emailAddress || user.username || user.id,
          email: user.emailAddresses?.[0]?.emailAddress || ''
        }
      })
    )

    res.status(200).json(formatted)
  } catch (error) {
    console.error('Error fetching org members:', error)
    res.status(500).json({ error: 'Failed to fetch organization members' })
  }
}
