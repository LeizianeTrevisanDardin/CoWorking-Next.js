import Link from "next/link";

type PaymentCancelledPageProps = {
  searchParams: Promise<{
    workspace_id?: string;
  }>;
};

export default async function PaymentCancelledPage({
  searchParams,
}: PaymentCancelledPageProps) {
  const { workspace_id: workspaceId } =
    await searchParams;

  const backUrl = workspaceId
    ? `/CoworkerDashboard/workspaces/${workspaceId}`
    : "/CoworkerDashboard";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm md:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
          !
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Payment cancelled
        </h1>

        <p className="mt-4 leading-7 text-gray-600">
          Your test payment was cancelled. No money was
          charged, and the workspace remains available.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={backUrl}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-500 px-6 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Try again
          </Link>

          <Link
            href="/CoworkerDashboard"
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Back to dashboard
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Stripe test environment — no real charge.
        </p>
      </section>
    </main>
  );
}