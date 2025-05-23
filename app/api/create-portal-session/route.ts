import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get the customer ID from your database
    const { data: customerData, error } = await supabase
      .from("customers")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (error || !customerData?.stripe_customer_id) {
      return NextResponse.json({ message: "No subscription found" }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerData.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
} 