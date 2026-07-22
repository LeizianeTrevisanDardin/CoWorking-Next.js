import React from "react";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import OwnerContactEmail from "@/components/emails/OwnerContactEmail";
import { resend } from "@/lib/resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type ContactOwnerBody = {
  workspaceId?: string;
  questionType?: string;
  message?: string;
  coworkerId?: string;
  messages?: ChatMessage[];
};

type PropertyRelation =
  | {
      name?: string | null;
    }
  | {
      name?: string | null;
    }[]
  | null;

export async function POST(
  request: NextRequest
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          error:
            "RESEND_API_KEY is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json(
        {
          error:
            "SUPABASE_SERVICE_ROLE_KEY is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const body =
      (await request.json()) as ContactOwnerBody;

    const workspaceId =
      body.workspaceId?.trim();

    const questionType =
      body.questionType?.trim();

    const message =
      body.message?.trim();

    const coworkerId =
      body.coworkerId?.trim();

    const conversationMessages =
      Array.isArray(body.messages)
        ? body.messages
            .filter(
              (chatMessage) =>
                chatMessage &&
                typeof chatMessage.content ===
                  "string" &&
                (chatMessage.role ===
                  "assistant" ||
                  chatMessage.role ===
                    "user")
            )
            .map((chatMessage) => ({
              role: chatMessage.role,
              content:
                chatMessage.content.trim(),
            }))
        : [];

    if (
      !workspaceId ||
      !questionType ||
      !message ||
      !coworkerId
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required information.",
        },
        {
          status: 400,
        }
      );
    }

    if (message.length > 1500) {
      return NextResponse.json(
        {
          error:
            "The message must contain 1500 characters or fewer.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Load workspace and property.
     */
    const {
      data: workspace,
      error: workspaceError,
    } = await supabaseAdmin
      .from("workspaces")
      .select(`
        id,
        title,
        owner_id,
        property:properties (
          name
        )
      `)
      .eq("id", workspaceId)
      .single();

    if (workspaceError) {
      console.error(
        "Workspace database error:",
        workspaceError
      );

      return NextResponse.json(
        {
          error:
            workspaceError.message ||
            "Unable to load the workspace.",
        },
        {
          status: 500,
        }
      );
    }

    if (!workspace) {
      return NextResponse.json(
        {
          error: "Workspace not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (!workspace.owner_id) {
      return NextResponse.json(
        {
          error:
            "The workspace does not have an owner.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Load owner.
     */
    const {
      data: ownerUserData,
      error: ownerUserError,
    } =
      await supabaseAdmin.auth.admin.getUserById(
        workspace.owner_id
      );

    if (ownerUserError) {
      console.error(
        "Owner user error:",
        ownerUserError
      );

      return NextResponse.json(
        {
          error:
            ownerUserError.message ||
            "Unable to load the owner.",
        },
        {
          status: 500,
        }
      );
    }

    const ownerUser =
      ownerUserData.user;

    if (!ownerUser?.email) {
      return NextResponse.json(
        {
          error:
            "Owner email was not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Load coworker.
     */
    const {
      data: coworkerUserData,
      error: coworkerUserError,
    } =
      await supabaseAdmin.auth.admin.getUserById(
        coworkerId
      );

    if (coworkerUserError) {
      console.error(
        "Coworker user error:",
        coworkerUserError
      );

      return NextResponse.json(
        {
          error:
            coworkerUserError.message ||
            "Unable to load the coworker.",
        },
        {
          status: 500,
        }
      );
    }

    const coworkerUser =
      coworkerUserData.user;

    if (!coworkerUser?.email) {
      return NextResponse.json(
        {
          error:
            "Coworker email was not found.",
        },
        {
          status: 404,
        }
      );
    }

    const ownerEmail =
      ownerUser.email;

    const coworkerEmail =
      coworkerUser.email;

    const ownerName =
      ownerUser.user_metadata?.name ||
      ownerUser.user_metadata
        ?.full_name ||
      ownerUser.user_metadata
        ?.display_name ||
      "Owner";

    const coworkerName =
      coworkerUser.user_metadata?.name ||
      coworkerUser.user_metadata
        ?.full_name ||
      coworkerUser.user_metadata
        ?.display_name ||
      coworkerEmail;

    const propertyRelation =
      workspace.property as PropertyRelation;

    const propertyName =
      Array.isArray(propertyRelation)
        ? propertyRelation[0]?.name ||
          "Property"
        : propertyRelation?.name ||
          "Property";

    /*
     * Save conversation as pending.
     */
    const {
      data: conversationRecord,
      error: conversationInsertError,
    } = await supabaseAdmin
      .from("workspace_conversations")
      .insert({
        workspace_id: workspaceId,
        coworker_id: coworkerId,
        owner_id: workspace.owner_id,
        topic: questionType,
        messages: conversationMessages,
        ai_summary: message,
        email_status: "pending",
        email_id: null,
        error_message: null,
        updated_at:
          new Date().toISOString(),
      })
      .select("id")
      .single();

    if (
      conversationInsertError ||
      !conversationRecord
    ) {
      console.error(
        "Conversation insert error:",
        conversationInsertError
      );

      return NextResponse.json(
        {
          error:
            conversationInsertError
              ?.message ||
            "Unable to save the conversation.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Render email.
     */
    const emailComponent =
      React.createElement(
        OwnerContactEmail,
        {
          ownerName,
          coworkerName,
          coworkerEmail,
          propertyName,
          workspaceTitle:
            workspace.title,
          questionType,
          message,
        }
      );

    /*
     * Send email.
     *
     * While using Resend test mode,
     * send only to your verified account.
     */
    const {
      data: emailData,
      error: resendError,
    } = await resend.emails.send({
      from:
        "Coworking App <onboarding@resend.dev>",

      to: [
        "leiziane.trevisan@gmail.com",
      ],

      // After verifying a domain,
      // replace the line above with:
      // to: [ownerEmail],

      replyTo: coworkerEmail,

      subject: `Workspace inquiry: ${workspace.title}`,

      react: emailComponent,
    });

    /*
     * Mark conversation as failed.
     */
    if (resendError) {
      console.error(
        "Resend email error:",
        resendError
      );

      const {
        error: failedUpdateError,
      } = await supabaseAdmin
        .from("workspace_conversations")
        .update({
          email_status: "failed",
          error_message:
            resendError.message ||
            "Unable to send the email.",
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          conversationRecord.id
        );

      if (failedUpdateError) {
        console.error(
          "Failed status update error:",
          failedUpdateError
        );
      }

      return NextResponse.json(
        {
          error:
            resendError.message ||
            "Unable to send the email through Resend.",
          conversationId:
            conversationRecord.id,
        },
        {
          status: 500,
        }
      );
    }

    if (!emailData?.id) {
      const noEmailIdMessage =
        "Resend did not return an email ID.";

      await supabaseAdmin
        .from("workspace_conversations")
        .update({
          email_status: "failed",
          error_message:
            noEmailIdMessage,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          conversationRecord.id
        );

      return NextResponse.json(
        {
          error:
            noEmailIdMessage,
          conversationId:
            conversationRecord.id,
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Mark conversation as sent.
     */
    const {
      error: sentUpdateError,
    } = await supabaseAdmin
      .from("workspace_conversations")
      .update({
        email_status: "sent",
        email_id: emailData.id,
        error_message: null,
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        conversationRecord.id
      );

    if (sentUpdateError) {
      console.error(
        "Conversation sent status update error:",
        sentUpdateError
      );
    }

    return NextResponse.json({
      success: true,
      emailId: emailData.id,
      conversationId:
        conversationRecord.id,
      sentTo: ownerEmail,
      message:
        "The request was saved and sent successfully.",
    });
  } catch (error) {
    console.error(
      "Contact owner route error:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.";

    return NextResponse.json(
      {
        error: errorMessage,
      },
      {
        status: 500,
      }
    );
  }
}