"use client";

import { supabase } from "@/lib/supabase";
import { ChangeEvent, useEffect, useState } from "react";

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
};

type AddWorkspaceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  workspace?: Workspace | null;
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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [currentImagePath, setCurrentImagePath] = useState("");

  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSeats("");
    setSmokingAllowed(false);
    setAvailableDate("");
    setPrice("");
    setImageFile(null);
    setImagePreview("");
    setCurrentImagePath("");
  };

  useEffect(() => {
    const loadWorkspaceData = async () => {
      if (!workspace) {
        resetForm();
        return;
      }

      setTitle(workspace.title || "");
      setDescription(workspace.description || "");

      setSeats(
        workspace.seats !== null &&
          workspace.seats !== undefined
          ? String(workspace.seats)
          : ""
      );

      setSmokingAllowed(workspace.smoking_allowed ?? false);

      setAvailableDate(
        workspace.available_date
          ? String(workspace.available_date).slice(0, 10)
          : ""
      );

      setPrice(
        workspace.price !== null &&
          workspace.price !== undefined
          ? String(workspace.price)
          : ""
      );

      setImageFile(null);
      setCurrentImagePath(workspace.image_url || "");

      if (!workspace.image_url) {
        setImagePreview("");
        return;
      }

      const { data, error } = await supabase.storage
        .from("property-images")
        .createSignedUrl(workspace.image_url, 60 * 60);

      if (error) {
        console.error(
          "Error creating image preview:",
          error.message
        );

        setImagePreview("");
        return;
      }

      setImagePreview(data.signedUrl);
    };

    if (isOpen) {
      loadWorkspaceData();
    }
  }, [workspace, isOpen]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Please select a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    const maximumSize = 5 * 1024 * 1024;

    if (selectedFile.size > maximumSize) {
      alert("The image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
  };

  const uploadWorkspaceImage = async (
    userId: string
  ): Promise<string | null> => {
    if (!imageFile) {
      return currentImagePath || null;
    }

    const extension =
      imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

    const safeExtension = [
      "jpg",
      "jpeg",
      "png",
      "webp",
    ].includes(extension)
      ? extension
      : "jpg";

    const fileName = `${crypto.randomUUID()}.${safeExtension}`;

    const filePath =
      `workspaces/${userId}/${propertyId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("property-images")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: imageFile.type,
      });

    if (uploadError) {
      throw new Error(
        `Image upload failed: ${uploadError.message}`
      );
    }

    return filePath;
  };

  const handleSubmit = async () => {
    const seatsNumber = Number(seats);
    const priceNumber = Number(price);

    if (
      !title.trim() ||
      !propertyId ||
      !Number.isFinite(seatsNumber) ||
      seatsNumber <= 0 ||
      !Number.isFinite(priceNumber) ||
      priceNumber <= 0
    ) {
      alert("Please fill in all required fields correctly.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated.");
      }

      const imagePath = await uploadWorkspaceImage(user.id);

      const workspaceData = {
        property_id: propertyId,
        title: title.trim(),
        description: description.trim() || null,
        seats: seatsNumber,
        smoking_allowed: smokingAllowed,
        available_date: availableDate || null,
        price: priceNumber,
        image_url: imagePath,
        is_available: workspace?.is_available ?? true,
      };

      if (workspace) {
        const { error } = await supabase
          .from("workspaces")
          .update(workspaceData)
          .eq("id", workspace.id)
          .eq("owner_id", user.id);

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase
          .from("workspaces")
          .insert({
            ...workspaceData,
            owner_id: user.id,
          });

        if (error) {
          throw error;
        }
      }

      alert(
        workspace
          ? "Workspace updated successfully!"
          : "Workspace added successfully!"
      );

      resetForm();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save workspace.";

      console.error("Error saving workspace:", error);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;

    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="mb-6 text-center text-2xl font-bold">
          {workspace ? "Edit Workspace" : "Add Workspace"}
        </h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="workspace-image"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Workspace image
            </label>

            <input
              id="workspace-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="w-full rounded-lg border p-3"
            />

            <p className="mt-1 text-xs text-gray-500">
              JPG, PNG or WEBP. Maximum size: 5 MB.
            </p>
          </div>

          {imagePreview && (
            <div className="overflow-hidden rounded-xl border">
              <img
                src={imagePreview}
                alt="Workspace preview"
                className="h-52 w-full object-cover"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="workspace-title"
              className="mb-1 block text-sm font-medium"
            >
              Title *
            </label>

            <input
              id="workspace-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Private Office"
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label
              htmlFor="workspace-description"
              className="mb-1 block text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="workspace-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe the workspace"
              className="min-h-28 w-full resize-y rounded-lg border p-3"
            />
          </div>

          <div>
            <label
              htmlFor="workspace-seats"
              className="mb-1 block text-sm font-medium"
            >
              Seats *
            </label>

            <input
              id="workspace-seats"
              type="number"
              min="1"
              step="1"
              value={seats}
              onChange={(event) =>
                setSeats(event.target.value)
              }
              placeholder="4"
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label
              htmlFor="workspace-date"
              className="mb-1 block text-sm font-medium"
            >
              Available date
            </label>

            <input
              id="workspace-date"
              type="date"
              value={availableDate}
              onChange={(event) =>
                setAvailableDate(event.target.value)
              }
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label
              htmlFor="workspace-price"
              className="mb-1 block text-sm font-medium"
            >
              Price *
            </label>

            <input
              id="workspace-price"
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(event) =>
                setPrice(event.target.value)
              }
              placeholder="500.00"
              className="w-full rounded-lg border p-3"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={smokingAllowed}
              onChange={(event) =>
                setSmokingAllowed(event.target.checked)
              }
            />

            <span>Smoking Allowed</span>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg bg-gray-300 px-4 py-2 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
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