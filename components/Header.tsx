'use client'

import Link from "next/link";
import Image from "next/image"; //better for optimization, but requires a valid src path and width/height
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from "next/navigation";


export default function Header() {
//dynamic header
const [user, setUser] = useState<any>(null);
const router = useRouter();


useEffect(()=>{
    async function checkUser(){
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
    }
    checkUser()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null)
    })

    return () => {
        listener.subscription.unsubscribe()
    }
}, [])

const handleLogout = async() => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')

}

    return (

        <nav className="flex items-center justify-between px-8 py-4 sticky top-0 bg-white z-10 shadow-sm">
            <Image src="/images/coworking.png" alt="Coworking App Logo" width={130} height={60} />
            <div>
                <Link href="/" className="text-gray-600 hover:text-gray-800 transition-colors justify-between items-center pr-8">
                    Home
                </Link>

                <Link href="/why-choose-us" className="text-gray-600 hover:text-gray-800 transition-colors pr-8">
                    Why Choose us?
                </Link>

                { user ? (
                <button onClick={handleLogout} className="text-gray-600 hover:text-gray-800 transition-colors">
                    Logout
                </button>
               
                ) : (
                    <>
                        <Link href="/register" className="text-gray-600 hover:text-gray-800 transition-colors pr-8">
                        Register
                        </Link>                
                        <Link href="/login" className="text-gray-600 hover:text-gray-800 transition-colors">
                            Login
                        </Link>

                   </>
                )}
                </div>
            </nav>    
            );
        }
