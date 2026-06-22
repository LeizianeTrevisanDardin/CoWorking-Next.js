'use  client'

import { useState } from "react"
import { supabase } from "@/lib/supabase"


type AddPropertyModalProps ={
    onClose: () => void;
    onSaved: () => void;
};

export default function AddPropertyModal( { onClose, onSaved} : AddPropertyModalProps){
    const [ name, setName ] = useState("");
    const [ description, setDescription ] = useState("");
    const [ imageFile, setImageFile] = useState<File | null>(null);
    const [ loading, setLoading] = useState(false);
    const [ successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async() => {
        setLoading(true);

    const { data: {user} } = await supabase.auth.getUser();

    if(!user || !imageFile){
        setLoading(false);
        return;
    }

    const fileExt = imageFile?.name.split(".").pop();
    const fileName = `${user.id} - ${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
    .from("property-images")
    .upload(fileName, imageFile);

    if(uploadError){
        console.error(uploadError);
        setLoading(false);
        return;
    }

    const { data: urlData } = supabase.storage
    .from("property-images")
    .getPublicUrl(fileName);
    

    const { error:  insertError} = await supabase
    .from("properties")
    .insert({
        owner_id: user.id,
        name: name,
        description: description,
        image_url: urlData.publicUrl,
    });


    if(insertError){
        console.error(insertError);
        setLoading(false);
        return;
    }

    setName("");
    setDescription("");
    setImageFile(null);
    setSuccessMessage("Property saved successfully!");
    onSaved();
    setLoading(false);

    //to close modal automatically
    setTimeout(() => {
        onClose();
    }, 1000);
    
}

return (
   <div className="fixed inset-0 bg-black/50 flex items-center justify-center text-gray-900 z-[9999]">
     <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-xl max-h-[80vh] mt-5 overflow-y-auto">

        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700">
            X
        </button>

        <h2 className="text-xl font-bold mb-4">Add Property</h2>
     
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
            
            <textarea
                className="text-base mb-5 border-gray-200 w-full border border-gray-200 rounded-md mt-5 p-2"
                placeholder="Description"
                value={description}
                onChange={(e)=> setDescription(e.target.value)}
            />

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