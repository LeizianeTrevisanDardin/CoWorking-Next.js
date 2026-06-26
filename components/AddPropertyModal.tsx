'use  client'

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Property } from "@/app/type/properties"

type AddPropertyModalProps ={
    onClose: () => void;
    onSaved: () => void;
    property?: Property;
};

export default function AddPropertyModal( { onClose, onSaved, property} : AddPropertyModalProps){
    const [ name, setName ] = useState(property?.name ?? "");
    const [ description, setDescription ] = useState(property?.description ?? "");
    const [ imageFile, setImageFile] = useState<File | null>(null);
    const [ loading, setLoading] = useState(false);
    const [ successMessage, setSuccessMessage] = useState("");
    const [ address, setAddress ] = useState(property?.address ?? "");
    const [ neighborhood, setNeighborhood ] = useState(property?.neighborhood ?? "");
    const [ squareFeet, setSquareFeet ] = useState(property?.square_feet ?? "");
    const [ parking, setParking ] = useState(property?.parking ?? false);
    const [ publicTransportation, setPublicTransportation ] = useState(property?.public_transportation ?? false);
    const [ suggestions, setSuggestions ] = useState([]);//list
    const [ loadingSuggestions, setLoadingSuggestions ] = useState(false);


    const handleSubmit = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    let image_url = property?.image_url ?? ""; 

    if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from("property-images")
            .upload(fileName, imageFile);

        if (uploadError) { console.error(uploadError); setLoading(false); return; }

        const { data: urlData } = supabase.storage
            .from("property-images")
            .getPublicUrl(fileName);

        image_url = urlData.publicUrl;
    }

    if (property) {
        const { error } = await supabase
            .from("properties")
            .update({ name, description, image_url, address, neighborhood, square_feet: squareFeet ? Number(squareFeet) : null, parking, public_transportation: publicTransportation})
            .eq("id", property.id); 

            console.log("update error:", error); 
            console.log("update id:", property.id);
        if (error) { 
            console.error(error); 
            setLoading(false);
            return;} 
        
        }else{
            

        const { error } = await supabase
            .from("properties")
            .insert({ owner_id: user.id, name, description, image_url, address, neighborhood, square_feet: squareFeet ? Number(squareFeet) : null, parking, public_transportation: publicTransportation});

        if (error) { console.error(error); setLoading(false); return; }
    }

    setSuccessMessage("Property saved successfully!");
    onSaved();
    setLoading(false);
    setTimeout(() => onClose(), 1000);
};

const searchAddress = async () => {
    if(!address) return;
    setLoadingSuggestions(true);

    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1&limit=5&countrycodes=ca`,
        { headers: {"Accept-Language": "en"}}
    );

    const data = await response.json();
    setSuggestions(data);
    setLoadingSuggestions(false);

};

const handleSelectSuggestions = (suggestion: any) => {
    setAddress(suggestion.display_name);
    setNeighborhood(suggestion.address.suburb ?? suggestion.address.village ?? "")
    setSuggestions([])

};

return (
   <div className="fixed inset-0 bg-black/50 flex items-center justify-center text-gray-900 z-[9999]">
     <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-xl max-h-[80vh] mt-5 overflow-y-auto">

        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700">
            X
        </button>

        <h2 className="text-xl font-bold mb-4">
            {property? "Edit Property" : "Add Property"}
        </h2>
     
        {successMessage && (
            <p className="text-gray-900 text-sm mb-4">
                {successMessage}
            </p>
        )}
            <input
                className="text-sm border-gray-200 w-full border border-gray-200 rounded-md mt-5 p-2"
                type="text"
                placeholder="Property Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <div className="border border-gray-200 rounded-md p-2 mt-10 text-gray-500 shadow-sm">
                <input
                type="text"
                placeholder="Search Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoComplete="on"
                className="w-full outline-none text-gray-500">
                </input>
</div>
                <button onClick={searchAddress} disabled={loading}
            className="w-full py-2 rounded px-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-colors mt-5"
            >
                Search
            </button>
            {suggestions.length > 0 && (
                <ul className="border border-gray-200 rounded-md shadow-sm">
                    {suggestions.map((suggestion: any, index) => (
                    <li
                        key={index}
                        onClick={() =>
                        handleSelectSuggestions(suggestion) }
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                        >
                            {suggestion.display_name}
                        </li>
                    ))}
                </ul>
            )}
           
           
            <input
                className="text-sm border-gray-200 w-full border border-gray-200 rounded-md mt-5 p-2"
                type="text"
                placeholder="Neighborhood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
            />

             <input
                className="text-sm border-gray-200 w-full border border-gray-200 rounded-md mt-5 p-2"
                type="number"
                placeholder="Square Feet"
                value={squareFeet}
                onChange={(e) => setSquareFeet(e.target.value)}
            />
                        
            <textarea
                className="text-base mb-1 border-gray-200 w-full border border-gray-200 rounded-md mt-5 p-2"
                placeholder="Description"
                value={description}
                onChange={(e)=> setDescription(e.target.value)}
            />
            <div className="flex items-center gap-6 mt-5 mb-5">
                        <label className="flex items-center gap-2 mt-5 m text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={parking}
                                onChange={(e) => setParking(e.target.checked)}
                                className="accent-purple-600 w-4 h-4"
                                />
                                Parking
                        </label>
                        
                        <label className="flex items-center gap-2 mt-5 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={publicTransportation}
                                onChange={(e) => setPublicTransportation(e.target.checked)}
                                className="accent-purple-600 w-4 h-4" 
                                />
                                Public Transportation
                        </label>
            </div>
                        
               <input
                    className="text-sm  border-gray-200 w-full border border-gray-200 rounded-md mt-5 p-2"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null )}
            />
            

            <button onClick={handleSubmit} disabled={loading}
            className="w-full py-2 rounded px-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-colors mt-5">
                {loading ? "Saving" : "Save Property" }
            </button>

        </div>
    </div>
      
    );
}