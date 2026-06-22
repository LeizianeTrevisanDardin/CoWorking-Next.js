'use client'
import { useState , useEffect } from "react"
import AddPropertyModal from "@/components/AddPropertyModal"
import { supabase } from "@/lib/supabase";



export default function OwnerDashboard () {
    const [ isModalOpen, setIsModalOpen] = useState(false);
    const [ properties, setProperties] = useState<any[]>([]);


    const loadProperties = async() => {
        const { data: {user}}  = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", {ascending: false})
        .limit(10);  
        
        if(error){
            console.error(error)
        return;
        }
        

        setProperties(data || []);

    };

    useEffect(() => {
        loadProperties();
    }, []);

    return (
        <>
        <section className="m-10">
            <div className="max-w-6xl w-full mx-auto mt-20 p-10 rounded-2xl shadow border border-gray-200">
            
            <h1 className="text-3xl font-bold">Owner Dashboard</h1>

            <div className="border border-gray-200 rounded-md p-2 mt-10 mb-10 text-gray-500 shadow-sm">
                search filter
            </div>

            <div className="mt-8 space-y-4">
                {properties.map((property) => (
                    <div
                        key={property.id}
                        className="flex justify-between items-center border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
                        >
                            <div>
                                <h3 className="font-semibold">{property.name}</h3>
                                <p className="text-sm text-gray-500">
                                    {property.description}
                                </p>
                            </div>

                            <div className="flex gap-2">
                            <button className="px-3 py-1  rounded border">
                                Edit
                            </button>

                            <button className="px-3 py-1  rounded border">
                                Delete
                            </button>
                        </div>
                        </div>
                        ))}
                    </div>

                    <div className="mt-10">        
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="w-48 py-2 bg-gradient-to-r from-blue-600 to-purple-500 font-bold text-xl hover:opacity-90 transition text-white rounded-md items-center justify-center text-center mt-5">
                                Add Property
                        </button>
                    </div>

                    {isModalOpen && (<AddPropertyModal 
                        onClose={() => setIsModalOpen(false)}
                        onSaved={loadProperties}
                        />
                    )}
                    </div>
        </section>
    </>
    );
}