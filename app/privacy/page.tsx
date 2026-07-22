export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-6">
        Privacy Policy
      </h1>

      <p className="text-gray-600 mb-6">
        At Coworking App, we value your privacy.
      </p>

      <div className="space-y-6 text-gray-700 leading-8">

        <div>
          <h2 className="font-semibold text-xl mb-2">
            Information We Collect
          </h2>

          <p>
            We collect only the information necessary to
            create your account, manage workspaces,
            and improve your experience.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-xl mb-2">
            Data Security
          </h2>

          <p>
            Your information is securely stored using
            Supabase authentication and database services.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-xl mb-2">
            Third-Party Services
          </h2>

          <p>
            Payments and emails are handled through
            trusted providers such as Stripe and Resend.
          </p>
        </div>

      </div>
    </main>
  );
}