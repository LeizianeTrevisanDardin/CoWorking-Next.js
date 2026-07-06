"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type AddWorkspaceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  workspace?: any | null;
};

export default function AddWorkspaceModal({
  isOpen,
  onClose,
  propertyId,
  workspace,
}: AddWorkspaceModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [seats, setSeats] = useState("");
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [availableDate, setAvailableDate] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workspace) {
      setTitle(workspace.title || "");
      setDescription(workspace.description || "");
      setSeats(workspace.seats ? String(workspace.seats) : "");
      setSmokingAllowed(workspace.smoking_allowed || false);
      setAvailableDate(workspace.available_date || "");
      setPrice(workspace.price ? String(workspace.price) : "");
    } else {
      setTitle("");
      setDescription("");
      setSeats("");
      setSmokingAllowed(false);
      setAvailableDate("");
      setPrice("");
    }
  }, [workspace]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title || !seats || !price || !propertyId) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("User not authenticated.");
      setLoading(false);
      return;
    }

    const workspaceData = {
      owner_id: user.id,
      property_id: propertyId,
      title,
      description,
      seats: Number(seats),
      smoking_allowed: smokingAllowed,
      available_date: availableDate || null,
      price: Number(price),
      is_available: true,
    };

    const { error } = workspace
      ? await supabase
          .from("workspaces")
          .update(workspaceData)
          .eq("id", workspace.id)
      : await supabase.from("workspaces").insert(workspaceData);

    setLoading(false);

    if (error) {
      console.error("Error saving workspace:", error.message);
      alert(error.message);
      return;
    }

    alert(workspace ? "Workspace updated!" : "Workspace added successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {workspace ? "Edit Workspace" : "Add Workspace"}
        </h2>

        <div className="space-y-4">
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="w-full border rounded-lg p-3"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            className="w-full border rounded-lg p-3"
            placeholder="Seats"
            type="number"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
          />

          <input
            className="w-full border rounded-lg p-3"
            type="date"
            value={availableDate}
            onChange={(e) => setAvailableDate(e.target.value)}
          />

          <input
            className="w-full border rounded-lg p-3"
            placeholder="Price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={smokingAllowed}
              onChange={(e) => setSmokingAllowed(e.target.checked)}
            />
            <span>Smoking Allowed</span>
          </label>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : workspace
              ? "Save Changes"
              : "Add Workspace"}
          </button>
        </div>
      </div>
    </div>
  );
}