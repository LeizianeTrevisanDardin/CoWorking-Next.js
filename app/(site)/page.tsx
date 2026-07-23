"use client";

import Footer from "@/components/Footer";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Property } from "@/app/types/property";
import PropertyCard from "@/components/PropertyCard";

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) {
        console.error(error);
        return;
      }

      setProperties(data ?? []);
    };

    fetchProperties();
  }, []);

  return (
    <>
      <main className="w-full bg-white">
        {/* HERO */}
        <section className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-12 pt-12 text-center sm:px-6 sm:pb-16 sm:pt-16 lg:px-8 lg:pt-20">
          <div className="w-full max-w-2xl">
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
              Welcome to Coworking App
            </h1>

            <p className="mt-3 text-sm text-gray-500 sm:text-base">
              Your one-stop solution for coworking spaces.
            </p>

            <div className="mx-auto mt-8 flex w-full max-w-md flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="flex min-h-12 w-full items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-purple-500 px-6 text-lg font-bold text-white transition hover:opacity-90 sm:flex-1"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="flex min-h-12 w-full items-center justify-center rounded-md bg-gradient-to-r from-purple-600 to-blue-500 px-6 text-lg font-bold text-white transition hover:opacity-90 sm:flex-1"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </section>

        {/* PROPERTIES TITLE */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-6 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
            Find your room and rent today!
          </h2>

          <p className="mt-3 text-sm text-gray-500 sm:text-base">
            Explore the latest coworking spaces available.
          </p>
        </section>

        {/* PROPERTIES GRID */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
          {properties.length > 0 ? (
            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-gray-500">
              No properties available yet.
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}