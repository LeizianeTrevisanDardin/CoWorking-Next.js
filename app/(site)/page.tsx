'use client'

import Image from "next/image";
import Footer from "@/components/Footer";
import Link from "next/link"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Property } from "@/app/types/properties"
import PropertyCard from "@/components/PropertyCard";

export default function Home() {

   const [properties, setProperties] = useState<Property[]>([]);

   //load 6 last propeties added

   useEffect(() => {
    const fetchProperties = async() => {
     const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", {ascending:false})
    .limit(6);

      if(error){
        console.error(error)
        return;
      }

    setProperties(data ?? []);
    }

    fetchProperties();
    
   }, []
  );

  return (
  <>

    <div className="flex flex-col items-center justify-center bg-white px-4">
      <div className="text-center max-w-xl mx-auto pt-20 pb-10">
        <h2 className="text-2xl font-bold mb-2">Welcome to Coworking App</h2>

        <p className="text-gray-500 text-sm mb-6">Your one-stop solution for coworking spaces.</p>

      <div className="flex gap-6 pb-24 justify-center">
        <Link href="/login">
          <button className="w-48 py-3 bg-gradient-to-r from-blue-600 to-purple-500 font-bold text-xl hover:opacity-90 transition text-white rounded-md">
            Login
          </button>
        </Link>

        <Link href="/register">
          <button className="space-between w-48 py-3 bg-gradient-to-r from-purple-600 to-blue-500 font-bold text-xl hover:opacity-90 transition text-white rounded-md">
            Sign in
          </button>
        </Link>
                  
        </div>

        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-4"> Find your room and rent today! </h2>
          <p className="text-gray-500 text-sm mb-6">Your one-stop solution for coworking spaces.</p>
        </div>

        <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
            ))}
        </div>

      </div>  
    </div>
    <Footer />
    </>
  );
}
