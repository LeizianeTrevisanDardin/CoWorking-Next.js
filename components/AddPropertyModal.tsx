'use  client'

import { useState } from "react"
import { supabase } from "@/lib/supabase"


type AddPropertyModalProps ={
    onClose: () => void;
};

export default function AddPropertyModal( { onClose} : AddPropertyModalProps){
    const [ name, setName ] = useState("");
    const [ description, setDescription ] = useState("");
    const [ imageFile, setImageFile] = useState<File | null>(null);
    const [ loading, setLoading] = useState(false);

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
    setLoading(false);
}

return (
    <div className="fixed inset-0 bg-black/50 flex items justifify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">

        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700">
            X
        </button>

        <h2 className="text-xl font-bold mb-4">Add Property</h2>
     
            <input
                type="text"
                placeholder="Property Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            
            <textarea
                placeholder="Description"
                value={description}
                onChange={(e)=> setDescription(e.target.value)}
            />

            <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null )}
            />

            <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700 disabled:opacity-50">

                {loading ? "Saving" : "Save Property" }
            </button>

        </div>
    </div>
      
    );
}