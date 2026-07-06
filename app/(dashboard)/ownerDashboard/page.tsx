"use client";

import { useState, useEffect } from "react";
import AddPropertyModal from "@/components/AddPropertyModal";
import AddWorkspaceModal from "@/components/AddWorkspaceModal";
import { supabase } from "@/lib/supabase";
import { Property } from "@/app/type/properties";

export default function OwnerDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editProperty, setEditProperty] = useState<Property | null>(null);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [editWorkspace, setEditWorkspace] = useState<any | null>(null);

  const filteredProperties = properties.filter((property) =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadProperties = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error(error);
      return;
    }

    setProperties(data || []);
  };

  const handleDeleteWorkspace = async (id: string) => {
  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    return;
  }

  loadWorkspaces();
};

  const loadWorkspaces = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setWorkspaces(data || []);
  };

  const handleSaved = async () => {
    await loadProperties();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("properties").delete().eq("id", id);

    if (error) {
      console.error("Delete error:", error.message);
      return;
    }

    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  useEffect(() => {
    loadProperties();
    loadWorkspaces();
  }, []);

  return (
    <section className="m-10">
      <div className="max-w-6xl w-full mx-auto mt-20 p-10 rounded-2xl shadow border border-gray-200">
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>

        <div className="border border-gray-200 rounded-md p-2 mt-10 mb-10 text-gray-500 shadow-sm">
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
            className="w-full outline-none text-gray-500"
          />
        </div>

        <div className="mt-8 space-y-4">
          {filteredProperties.map((property) => {
            const propertyWorkspaces = workspaces.filter(
              (workspace) => workspace.property_id === property.id
            );

            return (
              <div
                key={property.id}
                className="p-4 shadow-sm hover:shadow-md transition rounded-lg border border-gray-100"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{property.name}</h3>
                    <p className="text-sm text-gray-500">
                      {property.description}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditProperty(property)}
                      className="px-3 py-1 rounded border"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProperty(property);
                        setWorkspaceModalOpen(true);
                      }}
                      className="px-3 py-1 rounded border text-purple-600 border-purple-300"
                    >
                      Add Workspace
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(property.id)}
                      className="px-3 py-1 rounded border text-red-500 border-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 ml-6 space-y-2">
                  {propertyWorkspaces.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      No workspaces yet.
                    </p>
                  ) : (
                    propertyWorkspaces.map((workspace) => (
                    <div
                        key={workspace.id}
                        className="bg-purple-50 border border-purple-100 rounded-lg p-3"
                    >
                        <p className="font-semibold text-purple-700">
                        {workspace.title}
                        </p>

                        <p className="text-sm text-purple-500">
                        Seats: {workspace.seats} | Price: ${workspace.price}
                        </p>

                        <p className="text-sm text-purple-500">
                        {workspace.is_available ? "Available" : "Unavailable"}
                        </p>

                        <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => {
                            setSelectedProperty(property);
                            setEditWorkspace(null);
                            setWorkspaceModalOpen(true);
                            }}
                            className="px-3 py-1 border rounded"
                        >
                            Edit
                        </button>

                        <button
                            onClick={() => handleDeleteWorkspace(workspace.id)}
                            className="px-3 py-1 border rounded text-red-500"
                        >
                            Delete
                        </button>
                        </div>
                    </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-48 py-2 bg-gradient-to-r from-blue-600 to-purple-500 font-bold text-xl hover:opacity-90 transition text-white rounded-md"
          >
            Add Property
          </button>
        </div>

        {isModalOpen && (
          <AddPropertyModal
            onClose={() => setIsModalOpen(false)}
            onSaved={handleSaved}
          />
        )}

        {editProperty && (
          <AddPropertyModal
            onClose={() => setEditProperty(null)}
            onSaved={handleSaved}
            property={editProperty}
          />
        )}

        {workspaceModalOpen && selectedProperty && (
            <AddWorkspaceModal
                isOpen={workspaceModalOpen}
                onClose={() => {
                setWorkspaceModalOpen(false);
                setSelectedProperty(null);
                setEditWorkspace(null);
                loadWorkspaces();
                }}
                workspace={editWorkspace}
                propertyId={selectedProperty.id}
            />
            )}

      </div>
    </section>
  );
}