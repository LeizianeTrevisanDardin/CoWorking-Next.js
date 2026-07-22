"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

type Property = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  address: string | null;
  neighborhood: string | null;
  square_feet: number | null;
  parking: boolean;
  public_transportation: boolean;
  image_url: string | null;
  created_at: string;
};

type Workspace = {
  id: string;
  property_id: string;
  title: string;
  description: string | null;
  seats: number;
  price: number;
  is_available: boolean;
  image_url: string | null;
};

function getStoragePath(
  imageUrl: string
) {
  const bucketMarker =
    "/property-images/";

  const markerPosition =
    imageUrl.indexOf(bucketMarker);

  if (markerPosition === -1) {
    return imageUrl;
  }

  return imageUrl.slice(
    markerPosition +
      bucketMarker.length
  );
}

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const propertyId =
    typeof params.id === "string"
      ? params.id
      : "";

  const [property, setProperty] =
    useState<Property | null>(null);

  const [workspaces, setWorkspaces] =
    useState<Workspace[]>([]);

  const [propertyImageUrl, setPropertyImageUrl] =
    useState<string | null>(null);

  const [workspaceImages, setWorkspaceImages] =
    useState<Record<string, string>>(
      {}
    );

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadProperty() {
      if (!propertyId) {
        return;
      }

      setLoading(true);
      setErrorMessage("");

      const {
        data: propertyData,
        error: propertyError,
      } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .single();

      if (
        propertyError ||
        !propertyData
      ) {
        console.error(
          "Property loading error:",
          propertyError
        );

        setErrorMessage(
          "Property not found."
        );

        setLoading(false);

        return;
      }

      setProperty(propertyData);

      const {
        data: workspaceData,
        error: workspaceError,
      } = await supabase
        .from("workspaces")
        .select(`
          id,
          property_id,
          title,
          description,
          seats,
          price,
          is_available,
          image_url
        `)
        .eq(
          "property_id",
          propertyId
        )
        .order("created_at", {
          ascending: false,
        });

      if (workspaceError) {
        console.error(
          "Workspace loading error:",
          workspaceError
        );

        setErrorMessage(
          "Unable to load the workspaces."
        );

        setLoading(false);

        return;
      }

      setWorkspaces(
        workspaceData || []
      );

      if (
        propertyData.image_url
      ) {
        const propertyStoragePath =
          getStoragePath(
            propertyData.image_url
          );

        const {
          data: propertyImageData,
          error:
            propertyImageError,
        } =
          await supabase.storage
            .from(
              "property-images"
            )
            .createSignedUrl(
              propertyStoragePath,
              60 * 60
            );

        if (
          propertyImageError
        ) {
          console.error(
            "Property signed URL error:",
            propertyImageError
          );
        } else {
          setPropertyImageUrl(
            propertyImageData.signedUrl
          );
        }
      }

      const workspaceImageEntries =
        await Promise.all(
          (workspaceData || []).map(
            async (workspace) => {
              if (
                !workspace.image_url
              ) {
                return null;
              }

              const workspaceStoragePath =
                getStoragePath(
                  workspace.image_url
                );

              const {
                data:
                  workspaceImageData,
                error:
                  workspaceImageError,
              } =
                await supabase.storage
                  .from(
                    "property-images"
                  )
                  .createSignedUrl(
                    workspaceStoragePath,
                    60 * 60
                  );

              if (
                workspaceImageError
              ) {
                console.error(
                  "Workspace signed URL error:",
                  workspaceImageError
                );

                return null;
              }

              return [
                workspace.id,
                workspaceImageData.signedUrl,
              ] as const;
            }
          )
        );

      const imageMap =
        Object.fromEntries(
          workspaceImageEntries.filter(
            (
              entry
            ): entry is readonly [
              string,
              string
            ] => entry !== null
          )
        );

      setWorkspaceImages(
        imageMap
      );

      setLoading(false);
    }

    void loadProperty();
  }, [propertyId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-20">
        <p className="text-center text-gray-500">
          Loading property...
        </p>
      </main>
    );
  }

  if (
    errorMessage ||
    !property
  ) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          {errorMessage ||
            "Property not found."}
        </div>
      </main>
    );
  }

  async function handleViewWorkspace(
  workspaceId: string
) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const workspaceUrl =
    `/CoworkerDashboard/workspaces/${workspaceId}`;

  if (error || !user) {
    router.push(
      `/login?redirect=${encodeURIComponent(
        workspaceUrl
      )}`
    );

    return;
  }

  router.push(workspaceUrl);
}

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Back to properties
        </Link>

        <section className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="relative h-72 w-full bg-gray-100 md:h-[420px]">
            {propertyImageUrl ? (
              <Image
                src={
                  propertyImageUrl
                }
                alt={property.name}
                fill
                unoptimized
                priority
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 text-gray-400">
                No property image
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Property
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              {property.name}
            </h1>

            <p className="mt-3 max-w-3xl text-gray-600">
              {property.description ||
                "No description provided."}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-400">
                  Address
                </p>

                <p className="mt-1 font-semibold text-gray-800">
                  {property.address ||
                    "Not informed"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-400">
                  Neighborhood
                </p>

                <p className="mt-1 font-semibold text-gray-800">
                  {property.neighborhood ||
                    "Not informed"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-400">
                  Square feet
                </p>

                <p className="mt-1 font-semibold text-gray-800">
                  {property.square_feet ??
                    "Not informed"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-400">
                  Transportation
                </p>

                <p className="mt-1 font-semibold text-gray-800">
                  {property.public_transportation
                    ? "Nearby"
                    : "Not informed"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                Workspaces
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Available workspaces
              </h2>
            </div>

            <p className="text-sm text-gray-500">
              {
                workspaces.filter(
                  (workspace) =>
                    workspace.is_available
                ).length
              }{" "}
              available
            </p>
          </div>

          {workspaces.length ===
          0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
              No workspaces have been added to this property.
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {workspaces.map(
                (workspace) => (
                  <article
                    key={
                      workspace.id
                    }
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-48 bg-gray-100">
                      {workspaceImages[
                        workspace.id
                      ] ? (
                        <Image
                          src={
                            workspaceImages[
                              workspace.id
                            ]
                          }
                          alt={
                            workspace.title
                          }
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 text-gray-400">
                          No workspace image
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-bold text-gray-900">
                          {
                            workspace.title
                          }
                        </h3>

                        {workspace.is_available ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Available
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            Unavailable
                          </span>
                        )}
                      </div>

                      <p className="mt-2 line-clamp-2 min-h-10 text-sm text-gray-500">
                        {workspace.description ||
                          "No description provided."}
                      </p>

                      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                        <span>
                          Seats:{" "}
                          <strong>
                            {
                              workspace.seats
                            }
                          </strong>
                        </span>

                        <span className="font-bold text-gray-900">
                          $
                          {Number(
                            workspace.price
                          ).toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                            handleViewWorkspace(
                            workspace.id
                            )
                        }
                        disabled={!workspace.is_available}
                        className={`mt-5 w-full rounded-xl px-4 py-3 text-center font-semibold text-white transition ${
                            workspace.is_available
                            ? "bg-gradient-to-r from-blue-600 to-purple-500 hover:opacity-90"
                            : "cursor-not-allowed bg-gray-300"
                        }`}
                        >
                        {workspace.is_available
                            ? "View Workspace"
                            : "Not Available"}
                        </button>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}