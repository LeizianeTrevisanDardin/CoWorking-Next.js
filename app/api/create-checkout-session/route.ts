import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is missing.");
}

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing.");
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is missing."
  );
}

const stripe = new Stripe(stripeSecretKey);

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const authorization =
      request.headers.get("authorization");

    const accessToken =
      authorization?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json(
        { error: "User not authenticated." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid user session." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const workspaceId =
      typeof body.workspaceId === "string"
        ? body.workspaceId
        : "";

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required." },
        { status: 400 }
      );
    }

    const { data: workspace, error: workspaceError } =
      await supabaseAdmin
        .from("workspaces")
        .select(`
          id,
          owner_id,
          title,
          description,
          price,
          is_available
        `)
        .eq("id", workspaceId)
        .single();

    if (workspaceError || !workspace) {
      return NextResponse.json(
        { error: "Workspace not found." },
        { status: 404 }
      );
    }

    if (!workspace.is_available) {
      return NextResponse.json(
        {
          error:
            "This workspace is no longer available.",
        },
        { status: 409 }
      );
    }

    if (workspace.owner_id === user.id) {
      return NextResponse.json(
        {
          error:
            "You cannot rent your own workspace.",
        },
        { status: 403 }
      );
    }

    const price = Number(workspace.price);

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: "Invalid workspace price." },
        { status: 400 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.nextUrl.origin;

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        customer_email: user.email || undefined,

        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "cad",
              unit_amount: Math.round(price * 100),

              product_data: {
                name: workspace.title,
                description:
                  workspace.description ||
                  "Coworking workspace rental",
              },
            },
          },
        ],

        metadata: {
          workspace_id: workspace.id,
          coworker_id: user.id,
          owner_id: workspace.owner_id,
        },

        success_url:
          `${appUrl}/CoworkerDashboard/payment-success` +
          `?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${appUrl}/CoworkerDashboard/payment-cancelled` +
          `?workspace_id=${workspace.id}`,
      });

    if (!session.url) {
      throw new Error(
        "Stripe did not return a checkout URL."
      );
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to create checkout session.";

    console.error(
      "Create Stripe session error:",
      error
    );

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}