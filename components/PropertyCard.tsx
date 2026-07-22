"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Property } from "@/app/types/property";
import { supabase } from "@/lib/supabase";

type PropertyCardProps = {
  property: Property;
};

function getStoragePath(imageUrl: string) {
  const bucketMarker = "/property-images/";

  const markerPosition =
    imageUrl.indexOf(bucketMarker);

  if (markerPosition === -1) {
    return imageUrl;
  }

  return imageUrl.slice(
    markerPosition + bucketMarker.length
  );
}

export default function PropertyCard({
  property,
}: PropertyCardProps) {
  const [signedImageUrl, setSignedImageUrl] =
    useState<string | null>(null);

  const [loadingImage, setLoadingImage] =
    useState(true);

  useEffect(() => {
    let active = true;

    async function loadImage() {
      setLoadingImage(true);

      if (!property.image_url) {
        if (active) {
          setSignedImageUrl(null);
          setLoadingImage(false);
        }

        return;
      }

      const storagePath =
        getStoragePath(property.image_url);

      console.log(
        "Property storage path:",
        storagePath
      );

      const { data, error } =
        await supabase.storage
          .from("property-images")
          .createSignedUrl(
            storagePath,
            60 * 60
          );

      if (error) {
        console.error(
          "Error creating signed URL:",
          error.message,
          storagePath
        );

        if (active) {
          setSignedImageUrl(null);
          setLoadingImage(false);
        }

        return;
      }

      if (active) {
        setSignedImageUrl(
          data.signedUrl
        );

        setLoadingImage(false);
      }
    }

    void loadImage();

    return () => {
      active = false;
    };
  }, [property.image_url]);

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-56 w-full overflow-hidden bg-gray-100">
        {loadingImage ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Loading image...
          </div>
        ) : signedImageUrl ? (
          <Image
            src={signedImageUrl}
            alt={property.name}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 to-purple-50 text-gray-400">
            <span className="text-3xl">
              🏢
            </span>

            <span className="text-sm">
              No image available
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          Property
        </p>

        <h3 className="mt-1 text-lg font-bold text-gray-900">
          {property.name}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm text-gray-500">
          {property.description ||
            "No description provided."}
        </p>

        <p className="mt-4 text-sm font-semibold text-purple-600">
          View property →
        </p>
      </div>
    </Link>
  );
}