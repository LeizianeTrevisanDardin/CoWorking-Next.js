'use client';// allows useState and events in the browser

import { useState } from 'react'; //save input values
import { Eye, EyeOff } from 'lucide-react' //icons such as the password reveal
import Image from 'next/image' //otimized img - it loads faster than using img src
import { supabase } from '@/lib/supabase' //connecting with supabase
import { useRouter } from 'next/navigation' //redirect the pages

export default function Register() {

  //states for each field
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('coworking'); // Default role is 'coworking'

  const router = useRouter();

  //step : verifies if the fields are empty
  const handleRegister = async () => {
    if(!name || !phoneNumber || !email || !password || !role ){
      alert('Fields are required')
      return
    }
  // create user in Auth Supabase
  //email + password saved in a safe format
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  //if an error occurs, the same error will be shown here
  if(error) {
    alert(error.message)
    return
    }
  

  //save extra info in the profile tables 
  //id comes from user's creation
  await supabase.from('profiles').insert({
    id: data.user?.id,
    name,
    phone: phoneNumber,
    role,
  })

  //it redirects to login page
  alert('Account created successfully! Please login!')
  router.push('/login')

}

  return (

     <div className="flex flex-1 items-center justify-center py-5">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
            <Image src="/images/coworking.png" alt="Coworking App Logo in Blue" width={150} height={10} className="mx-auto mb-auto" 
        />
        <h3 className="text-center text-2xl font-bold mb-2">Register</h3>
        <p className="text-center text-gray-500 text-sm mb-6 pb-5">Create your account to get started.</p>

        <div className="mb-4">
            <label className="block text-sm mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-200 rounded px-3 py-2 outline-none mg-5"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1">Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-gray-200 rounded px-3 py-2 outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1">Email address</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-200 rounded px-3 py-2 outline-none"
            /> 
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">Password</label>
            <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              
              className="w-full bg-gray-200 rounded px-3 py-2 outline-none pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-400"
              >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <div>
          </div>

            <div className="mb-4 pt-5">
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-gray-200 rounded px-3 py-2 outline-none mg-5 text-gray-600 text-sm cursor pointer focus:ring-2 focus:ring-blue-400"
                >
                <option value="">Select role</option>
                <option value="coworker">CoWorker</option>
                <option value="owner">Owner</option>
              </select>
            </div>


              <button 
              onClick={handleRegister}
              className="w-full py-2 rounded px-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold        hover:from-blue-600 hover:to-purple-700 transition-colors">
                Register
             </button>
            </div>
          </div>
        </div>
      </div>
   
  );
}