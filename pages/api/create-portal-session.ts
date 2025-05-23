import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { supabase } from "../../lib/supabaseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get the customer ID from your database
    const { data: customerData, error } = await supabase
      .from("customers")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (error || !customerData?.stripe_customer_id) {
      return res.status(400).json({ message: "No subscription found" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerData.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    res.status(500).json({ message: "Internal server error" });
  }
} 