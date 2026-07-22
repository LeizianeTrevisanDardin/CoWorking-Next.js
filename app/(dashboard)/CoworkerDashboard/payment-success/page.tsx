import Link from "next/link";

type PaymentSuccessPageProps = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const { session_id: sessionId } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm md:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
          ✓
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Payment successful
        </h1>

        <p className="mt-4 leading-7 text-gray-600">
          Your Stripe test payment was completed successfully.
          No real money was charged.
        </p>

        {sessionId && (
          <div className="mt-6 rounded-xl bg-gray-50 p-4 text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Stripe session
            </p>

            <p className="mt-2 break-all font-mono text-xs text-gray-600">
              {sessionId}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/CoworkerDashboard"
            className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-500 px-6 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Back to dashboard
          </Link>

          <Link
            href="/"
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Go to home
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Stripe sandbox environment
        </p>
      </section>
    </main>
  );
}