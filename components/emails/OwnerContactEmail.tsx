type OwnerContactEmailProps = {
  ownerName: string;
  coworkerName: string;
  coworkerEmail: string;
  propertyName: string;
  workspaceTitle: string;
  questionType: string;
  message: string;
};

export default function OwnerContactEmail({
  ownerName,
  coworkerName,
  coworkerEmail,
  propertyName,
  workspaceTitle,
  questionType,
  message,
}: OwnerContactEmailProps) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        lineHeight: "1.6",
        color: "#111827",
      }}
    >
      <h1>New workspace inquiry</h1>

      <p>Hello {ownerName},</p>

      <p>
        A coworker has sent you a question about one of your
        workspaces.
      </p>

      <hr />

      <p>
        <strong>Property:</strong> {propertyName}
      </p>

      <p>
        <strong>Workspace:</strong> {workspaceTitle}
      </p>

      <p>
        <strong>Question:</strong> {questionType}
      </p>

      <p>
        <strong>Message:</strong>
      </p>

      <p>{message}</p>

      <hr />

      <p>
        <strong>From:</strong> {coworkerName}
      </p>

      <p>
        <strong>Email:</strong> {coworkerEmail}
      </p>

      <p>
        You can reply directly to the coworker using the email
        address above.
      </p>
    </div>
  );
}