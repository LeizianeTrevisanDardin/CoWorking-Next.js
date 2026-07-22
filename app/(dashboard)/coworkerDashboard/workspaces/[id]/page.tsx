"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ContactOwnerModal from "@/components/ContactOwnerModal";


type PropertyInfo = {
  id: string;
  name: string;
  address: string | null;
  neighborhood: string | null;
};

type Workspace = {
  id: string;
  owner_id: string;
  property_id: string;
  title: string;
  description: string | null;
  seats: number;
  smoking_allowed: boolean;
  available_date: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  square_feet: number | null;
  parking_available: boolean;
  public_transportation: boolean;
  lease_term: string | null;
  property: PropertyInfo | null;
};

export default function WorkspaceDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const workspaceId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [workspace, setWorkspace] =
    useState<Workspace | null>(null);

  const [signedImageUrl, setSignedImageUrl] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [renting, setRenting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [contactModalOpen, setContactModalOpen] =
  useState(false);

  const [coworkerId, setCoworkerId] =
  useState("");

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
    const loadWorkspace = async () => {
      if (!workspaceId) {
        setErrorMessage("Workspace ID was not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/login");
          return;
        }
        
        setCoworkerId(user.id);

        const { data, error } = await supabase
          .from("workspaces")
          .select(`
            id,
            owner_id,
            property_id,
            title,
            description,
            seats,
            smoking_allowed,
            available_date,
            price,
            image_url,
            is_available,
            square_feet,
            parking_available,
            public_transportation,
            lease_term,
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

          if (imageError) {
            console.error(
              "Error loading workspace image:",
              imageError.message
            );
          } else {
            setSignedImageUrl(
              imageData.signedUrl
            );
          }
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load workspace.";

        console.error(
          "Error loading workspace:",
          error
        );

        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    };

    void loadWorkspace();
  }, [workspaceId, router]);     


  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Loading workspace...
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
      <section className="mx-auto w-full max-w-6xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
        <div className="mb-8">
          <Link
            href="/CoworkerDashboard"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to workspaces
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            RENT A WORKSPACE
          </h1>

          <p className="mt-2 text-gray-500">
            Review the workspace details before
            continuing.
          </p>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="relative h-80 overflow-hidden rounded-2xl bg-gray-100 md:h-[430px]">
              {signedImageUrl ? (
                <Image
                  src={signedImageUrl}
                  alt={workspace.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              {workspace.property?.name ||
                "Workspace"}
            </p>

            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {workspace.title}
            </h2>

            {(workspace.property?.address ||
              workspace.property?.neighborhood) && (
              <p className="mt-3 text-gray-500">
                {workspace.property?.address}

                {workspace.property?.address &&
                  workspace.property
                    ?.neighborhood &&
                  ", "}

                {workspace.property?.neighborhood}
              </p>
            )}

            <p className="mt-6 leading-7 text-gray-600">
              {workspace.description ||
                "No description available."}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-5 rounded-2xl bg-gray-50 p-5">
              <div>
                <p className="text-sm text-gray-400">
                  Price
                </p>

                <p className="mt-1 text-lg font-bold text-gray-900">
                  $
                  {Number(
                    workspace.price
                  ).toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">
                  Seats
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {workspace.seats}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">
                  Square feet
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {workspace.square_feet ??
                    "Not informed"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">
                  Lease term
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {workspace.lease_term ||
                    "Flexible"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">
                  Parking
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {workspace.parking_available
                    ? "Available"
                    : "Not available"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">
                  Public transportation
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {workspace.public_transportation
                    ? "Nearby"
                    : "Not informed"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">
                  Smoking
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {workspace.smoking_allowed
                    ? "Allowed"
                    : "Not allowed"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">
                  Available date
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {workspace.available_date
                    ? new Date(
                        `${workspace.available_date}T00:00:00`
                      ).toLocaleDateString(
                        "en-CA"
                      )
                    : "Available now"}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                    type="button"
                    onClick={() =>
                    router.push(
                        `/CoworkerDashboard/checkout/${workspace.id}`
                    )
                    }
                    disabled={!workspace.is_available}
                    className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-500 px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {workspace.is_available
                    ? "Rent Workspace"
                    : "Not Available"}
                </button>

                <button
                    type="button"
                    onClick={() =>
                    setContactModalOpen(true)
                    }
                    disabled={!coworkerId}
                    className="flex-1 rounded-lg border border-blue-600 px-6 py-3 font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Contact Owner
                </button>
                </div>

                <ContactOwnerModal
                isOpen={contactModalOpen}
                onClose={() =>
                    setContactModalOpen(false)
                }
                workspaceId={workspace.id}
                coworkerId={coworkerId}
                />
            </div>
        </div>
      </section>
    </main>
  );
}