'use client'
import { useState } from "react"
import AddPropertyModal from "@/components/AddPropertyModal"

export default function OwnerDashboard () {
    const [ isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
  
        <div className="flex flex-1 items-center justify-center text-gray-600 py-10">Owner Dashboard</div> 
        
        <button onClick={() => setIsModalOpen(true)}>Add Property</button>
        {isModalOpen && <AddPropertyModal onClose={() => setIsModalOpen(false)}/>}
        </>
    )
}