// pages/api/clerk-user.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { Clerk } from '@clerk/clerk-sdk-node'

const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY! })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid userId' })
  }

  try {
    const user = await clerk.users.getUser(userId)
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim()
    const email = user.emailAddresses?.[0]?.emailAddress || ''
    return res.status(200).json({ name, email })
  } catch (err) {
    console.error('Error fetching Clerk user:', err)
    return res.status(500).json({ error: 'Failed to fetch user' })
  }
}
