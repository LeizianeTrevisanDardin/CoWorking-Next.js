"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

type PropertyInfo = {
  id: string;
  name: string;
  address: string | null;
  neighborhood: string | null;
};

type Workspace = {
  id: string;
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

type Filters = {
  address: string;
  neighborhood: string;
  minimumSquareFeet: string;
  maximumPrice: string;
  leaseTerm: string;
  minimumSeats: string;
  availableDate: string;
  parkingAvailable: boolean;
  publicTransportation: boolean;
  smokingAllowed: boolean;
};

const initialFilters: Filters = {
  address: "",
  neighborhood: "",
  minimumSquareFeet: "",
  maximumPrice: "",
  leaseTerm: "",
  minimumSeats: "",
  availableDate: "",
  parkingAvailable: false,
  publicTransportation: false,
  smokingAllowed: false,
};

export default function CoworkerDashboard() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  const [filters, setFilters] =
    useState<Filters>(initialFilters);

  const [appliedFilters, setAppliedFilters] =
    useState<Filters>(initialFilters);

  const [signedImageUrls, setSignedImageUrls] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(true);
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

  const loadSignedImages = async (
    items: Workspace[]
  ): Promise<void> => {
    const urls: Record<string, string> = {};

    await Promise.all(
      items.map(async (workspace) => {
        if (!workspace.image_url) return;

        const imagePath = getStoragePath(
          workspace.image_url
        );

        if (!imagePath) return;

        const { data, error } = await supabase.storage
          .from("property-images")
          .createSignedUrl(imagePath, 60 * 60);

        if (error) {
          console.error(
            `Error loading image for ${workspace.title}:`,
            error.message
          );

          return;
        }

        if (data?.signedUrl) {
          urls[workspace.id] = data.signedUrl;
        }
      })
    );

    setSignedImageUrls(urls);
  };

  const loadWorkspaces = async (): Promise<void> => {
    setLoading(true);
    setErrorMessage("");
    setSignedImageUrls({});

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setWorkspaces([]);

        setErrorMessage(
          "You must be logged in to view workspaces."
        );

        return;
      }

      const { data, error } = await supabase
        .from("workspaces")
        .select(`
          id,
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
        .eq("is_available", true)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      const loadedWorkspaces =
        (data || []) as unknown as Workspace[];

      setWorkspaces(loadedWorkspaces);

      await loadSignedImages(loadedWorkspaces);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load workspaces.";

      console.error("Error loading workspaces:", error);

      setWorkspaces([]);
      setSignedImageUrls({});
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadWorkspaces();
  }, []);

  const filteredWorkspaces = useMemo(() => {
    return workspaces.filter((workspace) => {
      const workspaceAddress =
        workspace.property?.address?.toLowerCase() || "";

      const workspaceNeighborhood =
        workspace.property?.neighborhood?.toLowerCase() || "";

      const addressMatches =
        !appliedFilters.address ||
        workspaceAddress.includes(
          appliedFilters.address
            .trim()
            .toLowerCase()
        );

      const neighborhoodMatches =
        !appliedFilters.neighborhood ||
        workspaceNeighborhood.includes(
          appliedFilters.neighborhood
            .trim()
            .toLowerCase()
        );

      const squareFeetMatches =
        !appliedFilters.minimumSquareFeet ||
        Number(workspace.square_feet || 0) >=
          Number(appliedFilters.minimumSquareFeet);

      const priceMatches =
        !appliedFilters.maximumPrice ||
        Number(workspace.price) <=
          Number(appliedFilters.maximumPrice);

      const leaseTermMatches =
        !appliedFilters.leaseTerm ||
        Boolean(
          workspace.lease_term
            ?.toLowerCase()
            .includes(
              appliedFilters.leaseTerm
                .trim()
                .toLowerCase()
            )
        );

      const seatsMatches =
        !appliedFilters.minimumSeats ||
        Number(workspace.seats) >=
          Number(appliedFilters.minimumSeats);

      const dateMatches =
        !appliedFilters.availableDate ||
        !workspace.available_date ||
        workspace.available_date <=
          appliedFilters.availableDate;

      const parkingMatches =
        !appliedFilters.parkingAvailable ||
        workspace.parking_available;

      const transportationMatches =
        !appliedFilters.publicTransportation ||
        workspace.public_transportation;

      const smokingMatches =
        !appliedFilters.smokingAllowed ||
        workspace.smoking_allowed;

      return (
        addressMatches &&
        neighborhoodMatches &&
        squareFeetMatches &&
        priceMatches &&
        leaseTermMatches &&
        seatsMatches &&
        dateMatches &&
        parkingMatches &&
        transportationMatches &&
        smokingMatches
      );
    });
  }, [workspaces, appliedFilters]);

  const updateFilter = <K extends keyof Filters>(
    field: K,
    value: Filters[K]
  ) => {
    setFilters((previousFilters) => ({
      ...previousFilters,
      [field]: value,
    }));
  };

  const handleSearch = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setAppliedFilters({
      ...filters,
    });
  };

  const handleClearFilters = () => {
    setFilters({
      ...initialFilters,
    });

    setAppliedFilters({
      ...initialFilters,
    });
  };

 
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="mx-auto w-full max-w-7xl rounded-3xl border-2 border-blue-500 bg-white p-6 shadow-sm md:p-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            DASHBOARD
          </h1>

          <h2 className="mt-3 text-xl font-bold text-gray-800">
            FIND A WORKSPACE
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Search for an available workspace that fits your
            needs.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="mx-auto mt-10 max-w-4xl"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Address
              </label>

              <input
                id="address"
                type="text"
                value={filters.address}
                onChange={(event) =>
                  updateFilter(
                    "address",
                    event.target.value
                  )
                }
                placeholder="Example: 123 Main Street"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="neighborhood"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Neighborhood
              </label>

              <input
                id="neighborhood"
                type="text"
                value={filters.neighborhood}
                onChange={(event) =>
                  updateFilter(
                    "neighborhood",
                    event.target.value
                  )
                }
                placeholder="Example: Downtown"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="minimumSquareFeet"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Minimum square feet
              </label>

              <input
                id="minimumSquareFeet"
                type="number"
                min="0"
                value={filters.minimumSquareFeet}
                onChange={(event) =>
                  updateFilter(
                    "minimumSquareFeet",
                    event.target.value
                  )
                }
                placeholder="Example: 500"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="minimumSeats"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Minimum number of seats
              </label>

              <input
                id="minimumSeats"
                type="number"
                min="1"
                value={filters.minimumSeats}
                onChange={(event) =>
                  updateFilter(
                    "minimumSeats",
                    event.target.value
                  )
                }
                placeholder="Example: 4"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="availableDate"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Available by date
              </label>

              <input
                id="availableDate"
                type="date"
                value={filters.availableDate}
                onChange={(event) =>
                  updateFilter(
                    "availableDate",
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="leaseTerm"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Lease term
              </label>

              <select
                id="leaseTerm"
                value={filters.leaseTerm}
                onChange={(event) =>
                  updateFilter(
                    "leaseTerm",
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Any lease term
                </option>

                <option value="Daily">
                  Daily
                </option>

                <option value="Weekly">
                  Weekly
                </option>

                <option value="Monthly">
                  Monthly
                </option>

                <option value="Yearly">
                  Yearly
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="maximumPrice"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Maximum price
              </label>

              <input
                id="maximumPrice"
                type="number"
                min="0"
                step="0.01"
                value={filters.maximumPrice}
                onChange={(event) =>
                  updateFilter(
                    "maximumPrice",
                    event.target.value
                  )
                }
                placeholder="Example: 1000"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3">
              <input
                type="checkbox"
                checked={filters.parkingAvailable}
                onChange={(event) =>
                  updateFilter(
                    "parkingAvailable",
                    event.target.checked
                  )
                }
                className="h-4 w-4"
              />

              <span className="text-sm text-gray-700">
                Parking available
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3">
              <input
                type="checkbox"
                checked={filters.publicTransportation}
                onChange={(event) =>
                  updateFilter(
                    "publicTransportation",
                    event.target.checked
                  )
                }
                className="h-4 w-4"
              />

              <span className="text-sm text-gray-700">
                Near public transportation
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3">
              <input
                type="checkbox"
                checked={filters.smokingAllowed}
                onChange={(event) =>
                  updateFilter(
                    "smokingAllowed",
                    event.target.checked
                  )
                }
                className="h-4 w-4"
              />

              <span className="text-sm text-gray-700">
                Smoking allowed
              </span>
            </label>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-500 px-10 py-3 font-semibold text-white transition hover:opacity-90"
            >
              Search
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-lg border border-gray-300 px-10 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </form>

        <div className="mt-14 border-t border-gray-200 pt-10">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                WORKSPACES FOR RENT
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {filteredWorkspaces.length} workspace
                {filteredWorkspaces.length === 1
                  ? ""
                  : "s"}{" "}
                found
              </p>
            </div>
          </div>

          {loading && (
            <p className="py-10 text-center text-gray-500">
              Loading workspaces...
            </p>
          )}

          {!loading && errorMessage && (
            <p className="py-10 text-center text-red-500">
              {errorMessage}
            </p>
          )}

          {!loading &&
            !errorMessage &&
            filteredWorkspaces.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 px-4 py-14 text-center">
                <h3 className="font-semibold text-gray-800">
                  No workspaces found
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Try changing or clearing your search
                  filters.
                </p>
              </div>
            )}

          {!loading &&
            !errorMessage &&
            filteredWorkspaces.length > 0 && (
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {filteredWorkspaces.map(
                  (workspace) => {
                    const imageUrl =
                      signedImageUrls[workspace.id];

                    return (
                      <article
                        key={workspace.id}
                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="relative h-52 w-full bg-gray-100">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={workspace.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-gray-400">
                              No image available
                            </div>
                          )}
                        </div>

                        <div className="p-5">
                          <h3 className="text-lg font-bold text-gray-900">
                            {workspace.title}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {workspace.property?.name ||
                              "Property name unavailable"}
                          </p>

                          <p className="mt-3 line-clamp-2 min-h-10 text-sm text-gray-600">
                            {workspace.description ||
                              "No description available."}
                          </p>

                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-400">
                                Seats
                              </p>

                              <p className="font-semibold text-gray-800">
                                {workspace.seats}
                              </p>
                            </div>

                            <div>
                              <p className="text-gray-400">
                                Square feet
                              </p>

                              <p className="font-semibold text-gray-800">
                                {workspace.square_feet ??
                                  "Not informed"}
                              </p>
                            </div>

                            <div>
                              <p className="text-gray-400">
                                Lease term
                              </p>

                              <p className="font-semibold text-gray-800">
                                {workspace.lease_term ||
                                  "Flexible"}
                              </p>
                            </div>

                            <div>
                              <p className="text-gray-400">
                                Price
                              </p>

                              <p className="font-semibold text-gray-800">
                                $
                                {Number(
                                  workspace.price
                                ).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {workspace.property
                            ?.neighborhood && (
                            <p className="mt-4 text-sm text-gray-500">
                              {
                                workspace.property
                                  .neighborhood
                              }
                            </p>
                          )}

                          <Link
                            href={`/CoworkerDashboard/workspaces/${workspace.id}`}
                            className="mt-5 block w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-500 px-4 py-3 text-center font-semibold text-white transition hover:opacity-90"
                            >
                            Select
                            </Link>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
        </div>
      </section>
    </main>
  );
}