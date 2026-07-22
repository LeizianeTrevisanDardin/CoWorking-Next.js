"use client";

import { useEffect, useState } from "react";

import { Property } from "@/app/types/property";
import AddPropertyModal from "@/components/AddPropertyModal";
import AddWorkspaceModal from "@/components/AddWorkspaceModal";
import { supabase } from "@/lib/supabase";

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
  is_available: boolean;
  created_at: string;
};

export default function OwnerDashboard() {
  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [properties, setProperties] =
    useState<Property[]>([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [editProperty, setEditProperty] =
    useState<Property | null>(null);

  const [
    workspaceModalOpen,
    setWorkspaceModalOpen,
  ] = useState(false);

  const [
    selectedProperty,
    setSelectedProperty,
  ] = useState<Property | null>(null);

  const [workspaces, setWorkspaces] =
    useState<Workspace[]>([]);

  const [
    editWorkspace,
    setEditWorkspace,
  ] = useState<Workspace | null>(null);

  const filteredProperties =
    properties.filter((property) =>
      property.name
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
    );

  const loadProperties = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        "User not authenticated."
      );

      return;
    }

    const { data, error } =
      await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", {
          ascending: false,
        })
        .limit(10);

    if (error) {
      console.error(
        "Error loading properties:",
        error.message
      );

      return;
    }

    setProperties(data || []);
  };

  const loadWorkspaces = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        "User not authenticated."
      );

      return;
    }

    const { data, error } =
      await supabase
        .from("workspaces")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "Error loading workspaces:",
        error.message
      );

      return;
    }

    setWorkspaces(data || []);
  };

  const handleSaved = async () => {
    await loadProperties();
  };

  const handleDeleteProperty =
    async (id: string) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this property?"
        );

      if (!confirmed) {
        return;
      }

      const { error } =
        await supabase
          .from("properties")
          .delete()
          .eq("id", id);

      if (error) {
        console.error(
          "Delete property error:",
          error.message
        );

        alert(error.message);

        return;
      }

      setProperties(
        (previousProperties) =>
          previousProperties.filter(
            (property) =>
              property.id !== id
          )
      );

      setWorkspaces(
        (previousWorkspaces) =>
          previousWorkspaces.filter(
            (workspace) =>
              workspace.property_id !==
              id
          )
      );
    };

  const handleToggleAvailability =
    async (
      workspaceId: string,
      currentAvailability: boolean
    ) => {
      const newAvailability =
        !currentAvailability;

      const confirmed =
        window.confirm(
          newAvailability
            ? "Make this workspace available again?"
            : "Mark this workspace as unavailable?"
        );

      if (!confirmed) {
        return;
      }

      const {
        data: { user },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (userError || !user) {
        alert(
          "User not authenticated."
        );

        return;
      }

      const { error } =
        await supabase
          .from("workspaces")
          .update({
            is_available:
              newAvailability,
          })
          .eq("id", workspaceId)
          .eq("owner_id", user.id);

      if (error) {
        console.error(
          "Error updating availability:",
          error.message
        );

        alert(error.message);

        return;
      }

      setWorkspaces(
        (previousWorkspaces) =>
          previousWorkspaces.map(
            (workspace) =>
              workspace.id ===
              workspaceId
                ? {
                    ...workspace,
                    is_available:
                      newAvailability,
                  }
                : workspace
          )
      );
    };

  const handleDeleteWorkspace =
    async (id: string) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this workspace?"
        );

      if (!confirmed) {
        return;
      }

      const { error } =
        await supabase
          .from("workspaces")
          .delete()
          .eq("id", id);

      if (error) {
        console.error(
          "Delete workspace error:",
          error.message
        );

        alert(error.message);

        return;
      }

      setWorkspaces(
        (previousWorkspaces) =>
          previousWorkspaces.filter(
            (workspace) =>
              workspace.id !== id
          )
      );
    };

  const openAddWorkspaceModal = (
    property: Property
  ) => {
    setSelectedProperty(property);
    setEditWorkspace(null);
    setWorkspaceModalOpen(true);
  };

  const openEditWorkspaceModal = (
    property: Property,
    workspace: Workspace
  ) => {
    setSelectedProperty(property);
    setEditWorkspace(workspace);
    setWorkspaceModalOpen(true);
  };

  const closeWorkspaceModal =
    async () => {
      setWorkspaceModalOpen(false);
      setSelectedProperty(null);
      setEditWorkspace(null);

      await loadWorkspaces();
    };

  useEffect(() => {
    void loadProperties();
    void loadWorkspaces();
  }, []);

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto mt-16 w-full max-w-6xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Owner Dashboard
          </h1>

          <p className="text-gray-500">
            Manage your properties and
            workspaces.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
          <input
            type="text"
            placeholder="Search by property name"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            autoComplete="off"
            className="w-full bg-transparent text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="mt-8 space-y-6">
          {filteredProperties.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
              <p className="text-gray-500">
                No properties found.
              </p>
            </div>
          ) : (
            filteredProperties.map(
              (property) => {
                const propertyWorkspaces =
                  workspaces.filter(
                    (workspace) =>
                      workspace.property_id ===
                      property.id
                  );

                return (
                  <div
                    
  key={property.id}
  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
>
  <div className="flex flex-col gap-5">
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
        Property
      </p>

      <h3 className="mt-1 text-xl font-bold text-gray-900">
        {property.name}
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        {property.description || "No description provided."}
      </p>
    </div>

    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setEditProperty(property)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      >
        Edit
      </button>

      <button
        type="button"
        onClick={() =>
          openAddWorkspaceModal(property)
        }
        className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Add Workspace
      </button>

      <button
        type="button"
        onClick={() =>
          handleDeleteProperty(property.id)
        }
        className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  </div>
<div className="mt-5 space-y-3">
  {propertyWorkspaces.length === 0 ? (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
      <p className="text-sm text-gray-400">
        No workspaces yet.
      </p>
    </div>
  ) : (
    propertyWorkspaces.map((workspace) => (
      <div
        key={workspace.id}
        className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
            Workspace
          </p>

          <h4 className="mt-1 text-lg font-bold text-gray-900">
            {workspace.title}
          </h4>

          {workspace.description && (
            <p className="mt-1 text-sm text-gray-500">
              {workspace.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
            <span>
              Seats:{" "}
              <strong>{workspace.seats}</strong>
            </span>

            <span>
              Price:{" "}
              <strong>
                ${Number(workspace.price).toFixed(2)}
              </strong>
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {workspace.is_available ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Available
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Unavailable
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                openEditWorkspaceModal(
                  property,
                  workspace
                )
              }
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() =>
                handleToggleAvailability(
                  workspace.id,
                  workspace.is_available
                )
              }
              className={
                workspace.is_available
                  ? "rounded-lg bg-gradient-to-r from-blue-600 to-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  : "rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              }
            >
              {workspace.is_available
                ? "Mark Unavailable"
                : "Make Available"}
            </button>

            <button
              type="button"
              onClick={() =>
                handleDeleteWorkspace(
                  workspace.id
                )
              }
              className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    ))
  )}
</div>
</div>
                );
              }
            )
          )}
        </div>

        <div className="mt-10">
          <button
            type="button"
            onClick={() =>
              setIsModalOpen(true)
            }
            className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-500 px-6 py-3 text-lg font-bold text-white shadow-sm transition hover:opacity-90"
          >
            Add Property
          </button>
        </div>

        {isModalOpen && (
          <AddPropertyModal
            onClose={() =>
              setIsModalOpen(false)
            }
            onSaved={handleSaved}
          />
        )}

        {editProperty && (
          <AddPropertyModal
            onClose={() =>
              setEditProperty(null)
            }
            onSaved={handleSaved}
            property={editProperty}
          />
        )}

        {workspaceModalOpen &&
          selectedProperty && (
            <AddWorkspaceModal
              isOpen={
                workspaceModalOpen
              }
              onClose={
                closeWorkspaceModal
              }
              workspace={
                editWorkspace
              }
              propertyId={
                selectedProperty.id
              }
            />
          )}
      </div>
    </section>
  );
}