import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const webhookSecret =
  process.env.STRIPE_WEBHOOK_SECRET;

type RentalMetadata = {
  workspace_id?: string;
  coworker_id?: string;
  owner_id?: string;
};

async function completeRental(
  session: Stripe.Checkout.Session
) {
  if (session.payment_status !== "paid") {
    console.log(
      "Stripe session is not paid:",
      session.id
    );

    return;
  }

  const metadata =
    session.metadata as RentalMetadata | null;

  const workspaceId =
    metadata?.workspace_id;

  const coworkerId =
    metadata?.coworker_id;

  const ownerId =
    metadata?.owner_id;

  if (
    !workspaceId ||
    !coworkerId ||
    !ownerId
  ) {
    throw new Error(
      `Missing rental metadata for Stripe session ${session.id}.`
    );
  }

  const amount = Number(
    session.amount_total || 0
  ) / 100;

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(
      `Invalid amount for Stripe session ${session.id}.`
    );
  }

  const { data, error } =
    await supabaseAdmin.rpc(
      "complete_workspace_rental",
      {
        p_workspace_id: workspaceId,
        p_coworker_id: coworkerId,
        p_owner_id: ownerId,
        p_amount: amount,
        p_stripe_session_id:
          session.id,
      }
    );

  if (error) {
    throw new Error(
      `Unable to complete rental: ${error.message}`
    );
  }

  console.log(
    "Rental completed:",
    data
  );
}

export async function POST(
  request: NextRequest
) {
  if (!webhookSecret) {
    console.error(
      "STRIPE_WEBHOOK_SECRET is missing."
    );

    return NextResponse.json(
      {
        error:
          "Webhook is not configured.",
      },
      {
        status: 500,
      }
    );
  }

  const signature =
    request.headers.get(
      "stripe-signature"
    );

  if (!signature) {
    return NextResponse.json(
      {
        error:
          "Stripe signature is missing.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    // O Stripe precisa do corpo original,
    // sem JSON.parse antes da validação.
    const rawBody = await request.text();

    const event =
      stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );

    switch (event.type) {
      case "checkout.session.completed": {
        const session =
          event.data
            .object as Stripe.Checkout.Session;

        await completeRental(session);
        break;
      }

      case "checkout.session.async_payment_succeeded": {
        const session =
          event.data
            .object as Stripe.Checkout.Session;

        await completeRental(session);
        break;
      }

      default:
        console.log(
          `Unhandled Stripe event: ${event.type}`
        );
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Webhook failed.";

    console.error(
      "Stripe webhook error:",
      error
    );

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 400,
      }
    );
  }
}