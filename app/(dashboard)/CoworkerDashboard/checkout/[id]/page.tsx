"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";
import { useEffect, useState } from "react";

type PropertyInfo = {
  id: string;
  name: string;
  address: string | null;
  neighborhood: string | null;
};

type Workspace = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  seats: number;
  price: number;
  image_url: string | null;
  is_available: boolean;
  property: PropertyInfo | null;
};

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();

  const workspaceId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [workspace, setWorkspace] =
    useState<Workspace | null>(null);

  const [signedImageUrl, setSignedImageUrl] =
    useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const getStoragePath = (value: string): string => {
    const publicMarker =
      "/storage/v1/object/public/property-images/";

    const signedMarker =
      "/storage/v1/object/sign/property-images/";

    if (value.includes(publicMarker)) {
      return value.split(publicMarker)[1];
    }

    if (value.includes(signedMarker)) {
      return value
        .split(signedMarker)[1]
        .split("?")[0];
    }

    return value;
  };

  useEffect(() => {
    const loadCheckout = async () => {
      if (!workspaceId) {
        setErrorMessage(
          "Workspace ID was not found."
        );
        setLoading(false);
        return;
      }

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/login");
          return;
        }

        setEmail(user.email || "");

        const { data, error } = await supabase
          .from("workspaces")
          .select(`
            id,
            owner_id,
            title,
            description,
            seats,
            price,
            image_url,
            is_available,
            property:properties (
              id,
              name,
              address,
              neighborhood
            )
          `)
          .eq("id", workspaceId)
          .single();

        if (error) {
          throw error;
        }

        const loadedWorkspace =
          data as unknown as Workspace;

        if (!loadedWorkspace.is_available) {
          throw new Error(
            "This workspace is no longer available."
          );
        }

        setWorkspace(loadedWorkspace);

        if (loadedWorkspace.image_url) {
          const imagePath = getStoragePath(
            loadedWorkspace.image_url
          );

          const {
            data: imageData,
            error: imageError,
          } = await supabase.storage
            .from("property-images")
            .createSignedUrl(
              imagePath,
              60 * 60
            );

          if (
            !imageError &&
            imageData?.signedUrl
          ) {
            setSignedImageUrl(
              imageData.signedUrl
            );
          }
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load checkout.";

        console.error(
          "Checkout error:",
          error
        );

        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    };

    void loadCheckout();
  }, [workspaceId, router]);

  const handlePayment = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!workspace) return;

    if (!fullName.trim() || !email.trim()) {
      alert(
        "Please complete your contact information."
      );

      return;
    }

    setProcessing(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error(
          "You must be logged in to continue."
        );
      }

      const response = await fetch(
        "/api/create-checkout-session",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            workspaceId: workspace.id,
            fullName: fullName.trim(),
            email: email.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to start Stripe Checkout."
        );
      }

      if (!result.url) {
        throw new Error(
          "Stripe checkout URL was not returned."
        );
      }

      window.location.href = result.url;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to start payment.";

      console.error(
        "Stripe Checkout error:",
        error
      );

      alert(message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Loading checkout...
        </p>
      </main>
    );
  }

  if (errorMessage || !workspace) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-gray-50 px-4">
        <p className="text-center text-red-500">
          {errorMessage ||
            "Workspace not found."}
        </p>

        <Link
          href="/CoworkerDashboard"
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
        >
          Back to workspaces
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="mx-auto max-w-6xl rounded-3xl bg-white p-6 shadow-sm md:p-10">
        <div className="mb-8">
          <Link
            href={`/CoworkerDashboard/workspaces/${workspace.id}`}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to workspace
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold">
            PAYMENT
          </h1>

          <p className="mt-2 text-gray-500">
            Complete your rental information.
          </p>
        </div>

        <form
          onSubmit={handlePayment}
          className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]"
        >
          <div className="space-y-7">
            <div className="rounded-2xl border p-6">
              <h2 className="text-xl font-bold">
                Contact information
              </h2>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="full-name"
                    className="mb-2 block text-sm font-medium"
                  >
                    Full name
                  </label>

                  <input
                    id="full-name"
                    type="text"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border p-3"
                    placeholder="Your full name"
                    autoComplete="name"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border p-3"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border p-6">
              <h2 className="text-xl font-bold">
                Secure test payment
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                You will be redirected to Stripe
                Checkout to complete a simulated
                payment. No real money will be charged.
              </p>

              <div className="mt-5 rounded-xl bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-800">
                  Portfolio demonstration
                </p>

                <p className="mt-1 text-sm text-blue-700">
                  Use Stripe&apos;s test card on the
                  next page.
                </p>
              </div>

              <div className="mt-5 rounded-xl border border-dashed border-gray-300 p-4">
                <p className="text-sm font-medium text-gray-700">
                  Test card
                </p>

                <p className="mt-1 font-mono text-sm text-gray-600">
                  4242 4242 4242 4242
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  Use any future expiry date and any
                  three-digit CVC.
                </p>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border p-6 shadow-sm">
            <h2 className="text-xl font-bold">
              Order summary
            </h2>

            <div className="mt-5 flex gap-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                {signedImageUrl ? (
                  <Image
                    src={signedImageUrl}
                    alt={workspace.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">
                    No image
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-bold">
                  {workspace.title}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {workspace.property?.name ||
                    "Property"}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {workspace.seats} seats
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t pt-5">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Workspace
                </span>

                <span>
                  $
                  {Number(
                    workspace.price
                  ).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Processing fee
                </span>

                <span>$0.00</span>
              </div>

              <div className="flex justify-between border-t pt-4 text-lg font-bold">
                <span>Total</span>

                <span>
                  $
                  {Number(
                    workspace.price
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="mt-6 w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-500 px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing
                ? "Opening secure checkout..."
                : `Continue to payment — $${Number(
                    workspace.price
                  ).toFixed(2)} CAD`}
            </button>

            <p className="mt-3 text-center text-xs text-gray-400">
              Test environment — no real charge.
            </p>
          </aside>
        </form>
      </section>
    </main>
  );
}