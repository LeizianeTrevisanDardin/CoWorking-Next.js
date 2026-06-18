'use client'

import { useState, useEffect } from "react"
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import {useRouter } from 'next/navigation'



export default function DashboardHeader() {
const [ profile, setProfile ] = useState<any>(null);

const router = useRouter();


useEffect(() => {
    async function loadProfile() {
        const { data } = await supabase.auth.getUser();

        const { data: profile } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', data.user?.id)
        .single()

        setProfile(profile);
    }
    loadProfile()
}, [])


const  handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    router.push('/login')

}

return (
  <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
    <Image
      src="/images/coworking.png"
      alt="Coworking App Logo"
      width={130}
      height={60}
    />

    <div className="flex items-center gap-8">
      <Link href="/" className="text-gray-600 hover:text-gray-800">
        Home
      </Link>

      <Link href="/ownerDashboard" className="text-gray-600 hover:text-gray-800">
        Dashboard
      </Link>

      <div className="flex items-center gap-3">
        <Image
            src="/images/ownerAvatar.png"
            alt="User Avatar"
            width={40}
            height={40}
            className="rounded-full"
        />

      <div className="flex items-center gap-3">
        <span className="text-gray-700">
          {profile?.name || profile?.role}
        </span>

        <button
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-800"
        >
          Logout
        </button>
      </div>
      </div>
    </div>
  </nav>
);
}
