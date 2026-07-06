'use client';
import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
const router = useRouter();

const handleLogin = async () => {
  if (!email || !password) {
    alert("Fields are required");
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert(error.message);
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    console.error(profileError);
    alert("Error loading profile.");
    return;
  }

  if (!profile) {
    alert("Profile not found for this user.");
    return;
  }

  if (profile.role === "owner") {
    router.push("/OwnerDashboard");
  } else if (profile.role === "coworker") {
    router.push("/CoworkerDashboard");
  } else {
    alert("Invalid user role.");
  }

}
    return (
    <div className="flex flex-1 items-center justify-center py-10">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
            <Image src="/images/coworking.png" alt="Coworking App Logo in Blue" width={150} height={75} className="mx-auto mb-auto" />
            <h3 className="text-center text-2xl font-bold mb-2 pb-3">Login</h3>
            <p className="text-center text-gray-500 text-sm mb-6 pb-5">Welcome back! Please login to your account.</p>
        
        <div className="mb-4">
            <label className="block text-sm mb-1">Email address</label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-200 rounded px-3 py-2 outline-none"
            />
        </div>

        <div className="mb-4 pb-5">
            <label className="block text-sm mb-1">Password</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-200 rounded px-3 py-2 outline-none"
            />
        </div>

        <button className="w-full py-2 rounded px-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-colors"
        onClick={handleLogin}
        >
            Sign in
        </button>

        </div>
    </div>
    );
}
