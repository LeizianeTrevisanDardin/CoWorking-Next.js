export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-6">
        Terms of Service
      </h1>

      <div className="space-y-6 text-gray-700 leading-8">

        <p>
          By using Coworking App you agree to use the
          platform responsibly and provide accurate
          information.
        </p>

        <div>
          <h2 className="font-semibold text-xl">
            User Responsibilities
          </h2>

          <p>
            Users must respect other members and
            provide truthful workspace information.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-xl">
            Payments
          </h2>

          <p>
            Payments are processed securely through
            Stripe.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-xl">
            Changes
          </h2>

          <p>
            These terms may be updated periodically.
          </p>
        </div>

      </div>
    </main>
  );
}