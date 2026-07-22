"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type ContactOwnerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  coworkerId: string;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type ApiResult = {
  message?: string;
  summary?: string;
  error?: string;
};

const questionOptions = [
  {
    label: "Availability",
    message:
      "I would like to know more about the workspace availability.",
  },
  {
    label: "Schedule a visit",
    message:
      "I would like to schedule a visit to this workspace.",
  },
  {
    label: "Price",
    message:
      "I have a question about the workspace price.",
  },
  {
    label: "Lease terms",
    message:
      "I would like more information about the lease terms.",
  },
  {
    label: "Parking",
    message:
      "I would like more information about parking.",
  },
  {
    label: "Other",
    message:
      "I have another question about this workspace.",
  },
];

const initialMessages: ChatMessage[] = [
  {
    id: "welcome-message",
    role: "assistant",
    content:
      "Hi! 👋 I’m the Workspace Assistant. How can I help you today?",
  },
];

export default function ContactOwnerModal({
  isOpen,
  onClose,
  workspaceId,
  coworkerId,
}: ContactOwnerModalProps) {
  const [messages, setMessages] =
    useState<ChatMessage[]>(initialMessages);

  const [selectedTopic, setSelectedTopic] =
    useState("");

  const [inputMessage, setInputMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [sendingToOwner, setSendingToOwner] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const chatEndRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [
    messages,
    loading,
    sendingToOwner,
    errorMessage,
    successMessage,
  ]);

  useEffect(() => {
    if (!isOpen) {
      resetChat();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  function createMessage(
    role: ChatMessage["role"],
    content: string
  ): ChatMessage {
    return {
      id: `${role}-${Date.now()}-${Math.random()}`,
      role,
      content,
    };
  }

  function resetChat() {
    setMessages(initialMessages);
    setSelectedTopic("");
    setInputMessage("");
    setLoading(false);
    setSendingToOwner(false);
    setSuccessMessage("");
    setErrorMessage("");
  }

  function handleClose() {
    resetChat();
    onClose();
  }

  function handleQuestionSelection(
    label: string,
    optionMessage: string
  ) {
    setSelectedTopic(label);
    setSuccessMessage("");
    setErrorMessage("");

    const userMessage = createMessage(
      "user",
      label
    );

    const assistantMessage =
      createMessage(
        "assistant",
        `${optionMessage} Please tell me a little more so I can help you.`
      );

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      assistantMessage,
    ]);
  }

  async function readApiResult(
    response: Response
  ): Promise<ApiResult> {
    try {
      return (await response.json()) as ApiResult;
    } catch {
      return {
        error:
          "The server returned an invalid response.",
      };
    }
  }

  async function handleSendChatMessage(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedMessage =
      inputMessage.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const userMessage = createMessage(
      "user",
      trimmedMessage
    );

    const conversation = [
      ...messages,
      userMessage,
    ].map((message) => ({
      role: message.role,
      content: message.content,
    }));

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ]);

    setInputMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/workspace-assistant",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            workspaceId,
            messages: conversation,
          }),
        }
      );

      const result =
        await readApiResult(response);

      if (!response.ok) {
        console.warn(
          "Workspace assistant API response:",
          result
        );

        setErrorMessage(
          result.error ||
            "Unable to contact the assistant."
        );

        return;
      }

      if (!result.message) {
        setErrorMessage(
          "The assistant returned an empty response."
        );

        return;
      }

      const assistantMessage =
        createMessage(
          "assistant",
          result.message
        );

      setMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to contact the assistant.";

      console.warn(
        "Workspace assistant request failed:",
        error
      );

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendToOwner() {
    const hasUserMessage =
      messages.some(
        (message) =>
          message.role === "user" &&
          message.content !==
            selectedTopic
      );

    if (!selectedTopic) {
      setErrorMessage(
        "Please select a question topic first."
      );

      return;
    }

    if (!hasUserMessage) {
      setErrorMessage(
        "Please write a message before contacting the owner."
      );

      return;
    }

    if (!coworkerId || !workspaceId) {
      setErrorMessage(
        "Unable to identify the coworker or workspace."
      );

      return;
    }

    setSendingToOwner(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      /*
       * STEP 1:
       * Generate an AI summary.
       */
      const summaryResponse =
        await fetch(
          "/api/workspace-assistant/summary",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              workspaceId,
              selectedTopic,
              messages: messages.map(
                (message) => ({
                  role: message.role,
                  content:
                    message.content,
                })
              ),
            }),
          }
        );

      const summaryResult =
        await readApiResult(
          summaryResponse
        );

      if (!summaryResponse.ok) {
        console.warn(
          "Summary API response:",
          summaryResult
        );

        setErrorMessage(
          summaryResult.error ||
            "Unable to summarize the conversation."
        );

        return;
      }

      const summary =
        summaryResult.summary?.trim();

      if (!summary) {
        setErrorMessage(
          "The conversation summary is empty."
        );

        return;
      }

      /*
       * Extra protection for the
       * contact-owner limit.
       */
      const safeSummary =
        summary.length > 1400
          ? `${summary.slice(
              0,
              1397
            )}...`
          : summary;

      /*
       * STEP 2:
       * Send the AI summary to the owner.
       */
      const emailResponse =
        await fetch(
          "/api/contact-owner",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
            workspaceId,
            coworkerId,
            questionType: selectedTopic,
            message: safeSummary,

            messages: messages.map((chatMessage) => ({
                role: chatMessage.role,
                content: chatMessage.content,
            })),
            }),
          }
        );

      const emailResult =
        await readApiResult(
          emailResponse
        );

      if (!emailResponse.ok) {
        console.warn(
          "Contact owner API response:",
          emailResult
        );

        setErrorMessage(
          emailResult.error ||
            "Unable to send the summary to the owner."
        );

        return;
      }

      const assistantMessage =
        createMessage(
          "assistant",
          "I summarized your request and sent it to the workspace owner successfully. The owner can reply directly to your email. ✅"
        );

      setMessages(
        (currentMessages) => [
          ...currentMessages,
          assistantMessage,
        ]
      );

      setSuccessMessage(
        "Your request was summarized and sent to the owner."
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to send the request to the owner.";

      console.warn(
        "Error sending summarized conversation:",
        error
      );

      setErrorMessage(message);
    } finally {
      setSendingToOwner(false);
    }
  }

  const hasUserDetails =
    messages.some(
      (message) =>
        message.role === "user" &&
        message.content !==
          selectedTopic
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      onMouseDown={handleClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Workspace Assistant
            </h2>

            <div className="mt-1 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

              <p className="text-sm text-gray-500">
                Online and ready to help
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close assistant"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 px-5 py-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                    message.role === "user"
                      ? "rounded-br-md bg-gradient-to-r from-blue-600 to-purple-500 text-white"
                      : "rounded-bl-md border border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />

                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />

                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {!selectedTopic && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold text-gray-700">
                Choose a topic:
              </p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {questionOptions.map(
                  (option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() =>
                        handleQuestionSelection(
                          option.label,
                          option.message
                        )
                      }
                      className="rounded-xl border border-blue-200 bg-white px-3 py-3 text-sm font-medium text-blue-700 transition hover:border-blue-500 hover:bg-blue-50"
                    >
                      {option.label}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {selectedTopic && (
            <div className="mt-5 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
                  Selected topic
                </p>

                <p className="font-semibold text-blue-900">
                  {selectedTopic}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedTopic("");
                  setMessages(
                    initialMessages
                  );
                  setInputMessage("");
                  setSuccessMessage("");
                  setErrorMessage("");
                }}
                disabled={
                  loading ||
                  sendingToOwner
                }
                className="text-sm font-semibold text-blue-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                Change
              </button>
            </div>
          )}

          {errorMessage && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </p>
          )}
        </div>

        <div className="border-t border-gray-200 bg-white p-5">
          <form
            onSubmit={
              handleSendChatMessage
            }
            className="flex items-end gap-3"
          >
            <textarea
              value={inputMessage}
              onChange={(event) =>
                setInputMessage(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                    "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();

                  event.currentTarget.form?.requestSubmit();
                }
              }}
              disabled={
                !selectedTopic ||
                loading ||
                sendingToOwner
              }
              rows={1}
              placeholder={
                selectedTopic
                  ? "Write your message..."
                  : "Choose a topic to begin..."
              }
              className="max-h-32 min-h-12 flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            />

            <button
              type="submit"
              disabled={
                !selectedTopic ||
                !inputMessage.trim() ||
                loading ||
                sendingToOwner
              }
              className="h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-500 px-5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Thinking..."
                : "Send"}
            </button>
          </form>

          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={handleClose}
              disabled={
                loading ||
                sendingToOwner
              }
              className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={
                handleSendToOwner
              }
              disabled={
                !selectedTopic ||
                !hasUserDetails ||
                loading ||
                sendingToOwner ||
                Boolean(
                  successMessage
                )
              }
              className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sendingToOwner
                ? "Summarizing and Sending..."
                : "Send Request to Owner"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}