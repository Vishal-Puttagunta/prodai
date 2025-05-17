import type { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"
import { buffer } from "micro"
import { supabase } from "../../lib/supabaseClient"

export const config = {
  api: {
    bodyParser: false, // Stripe requires raw body
  },
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)


const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET! // from Stripe dashboard

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed")

  const buf = await buffer(req)
  const sig = req.headers["stripe-signature"] as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret)
  } catch (err) {
    console.error("Webhook signature verification failed.", err)
    return res.status(400).send("Webhook Error")
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const subscriptionId = session.subscription as string

    if (userId && subscriptionId) {
      await supabase.from("subscriptions").upsert({
        user_id: userId,
        subscription_id: subscriptionId,
        active: true,
      }, { onConflict: "user_id" })
    }
  }

  return res.status(200).json({ received: true })
}
