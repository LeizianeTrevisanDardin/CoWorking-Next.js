import OpenAI from "openai";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type RequestBody = {
  workspaceId?: string;
  selectedTopic?: string;
  messages?: ChatMessage[];
};

export async function POST(
  request: NextRequest
) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          error:
            "OPENROUTER_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    const body =
      (await request.json()) as RequestBody;

    const workspaceId =
      body.workspaceId;

    const selectedTopic =
      body.selectedTopic?.trim();

    const messages =
      body.messages ?? [];

    if (!workspaceId) {
      return NextResponse.json(
        {
          error:
            "Workspace ID is required.",
        },
        { status: 400 }
      );
    }

    if (!selectedTopic) {
      return NextResponse.json(
        {
          error:
            "Selected topic is required.",
        },
        { status: 400 }
      );
    }

    const userMessages =
      messages.filter(
        (message) =>
          message.role === "user"
      );

    if (userMessages.length === 0) {
      return NextResponse.json(
        {
          error:
            "The conversation does not contain a user message.",
        },
        { status: 400 }
      );
    }

    const {
      data: workspace,
      error: workspaceError,
    } = await supabaseAdmin
      .from("workspaces")
      .select(`
        id,
        title,
        price,
        seats,
        available_date,
        lease_term,
        parking_available,
        public_transportation,
        is_available,
        property:properties (
          name,
          address,
          neighborhood
        )
      `)
      .eq("id", workspaceId)
      .single();

    if (
      workspaceError ||
      !workspace
    ) {
      console.error(
        "Summary workspace error:",
        workspaceError
      );

      return NextResponse.json(
        {
          error:
            "Workspace not found.",
        },
        { status: 404 }
      );
    }

    const property =
      Array.isArray(
        workspace.property
      )
        ? workspace.property[0]
        : workspace.property;

    const conversationText =
      messages
        .slice(-20)
        .map((message) => {
          const speaker =
            message.role === "user"
              ? "Coworker"
              : "Workspace Assistant";

          return `${speaker}: ${message.content}`;
        })
        .join("\n\n");
const completion =
  await openai.chat.completions.create({
    model: "openrouter/free",

    messages: [
      {
        role: "system",
        content: `
You create professional email summaries for workspace owners.

Summarize the coworker's request clearly and concisely.

Important rules:

1. Focus on what the coworker wants or needs.
2. Ignore greetings and casual assistant messages.
3. Do not invent dates, times, prices, preferences, or facts.
4. Clearly mark missing information as "Not specified" only when relevant.
5. Do not say that a request is confirmed.
6. Do not promise availability, bookings, prices, or visits.
7. Keep the summary easy for a workspace owner to scan.
8. Use plain text.
9. Do not use markdown tables.
10. Write in English because the owner email template is in English.
11. The entire summary must contain no more than 1200 characters.
12. Be brief and remove unnecessary explanations.

Use this exact structure:

Workspace inquiry

Workspace:
[workspace title]

Property:
[property name]

Topic:
[selected topic]

Coworker request:
[short summary]

Requested date:
[date or Not specified]

Requested time:
[time or Not specified]

Questions for the owner:
- [question]

Additional details:
[relevant details or None]
`,
      },
      {
        role: "user",
        content: `
Workspace title:
${workspace.title}

Property name:
${property?.name ?? "Not provided"}

Selected topic:
${selectedTopic}

Workspace availability:
${
  workspace.is_available
    ? "Available"
    : "Not available"
}

Available date:
${workspace.available_date ?? "Not specified"}

Price:
$${Number(workspace.price).toFixed(2)}

Seats:
${workspace.seats}

Lease term:
${workspace.lease_term ?? "Not specified"}

Parking:
${
  workspace.parking_available
    ? "Available"
    : "Not available"
}

Public transportation:
${
  workspace.public_transportation
    ? "Nearby"
    : "Not specified"
}

Conversation:

${conversationText}
`,
      },
    ],

    temperature: 0.2,
    max_tokens: 350,
  });

const generatedSummary =
  completion.choices[0]
    ?.message?.content?.trim();

const coworkerMessages = messages
  .filter(
    (message) =>
      message.role === "user" &&
      message.content.trim() !== selectedTopic
  )
  .map((message) => message.content.trim())
  .filter(Boolean);

const fallbackSummary = `
Workspace inquiry

Workspace:
${workspace.title}

Property:
${property?.name ?? "Not provided"}

Topic:
${selectedTopic}

Coworker request:
${
  coworkerMessages.length > 0
    ? coworkerMessages.join(" ")
    : "The coworker requested more information about this workspace."
}

Requested date:
Not specified

Requested time:
Not specified

Questions for the owner:
${
  coworkerMessages.length > 0
    ? coworkerMessages
        .map((message) => `- ${message}`)
        .join("\n")
    : "- No additional question provided"
}

Additional details:
Workspace availability date: ${
  workspace.available_date ?? "Not specified"
}.
Lease term: ${
  workspace.lease_term ?? "Not specified"
}.
`.trim();

const finalSummary =
  generatedSummary || fallbackSummary;

const summary =
  finalSummary.length > 1400
    ? `${finalSummary.slice(0, 1397)}...`
    : finalSummary;

return NextResponse.json({
  summary,
});
  } catch (error) {
    console.error(
      "Conversation summary error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to summarize the conversation.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}