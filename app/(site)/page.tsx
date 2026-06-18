import Image from "next/image";
import Footer from "@/components/Footer";
import Link from "next/link"

export default function Home() {
  return (
  <>

    <div className="flex flex-1 flex-col items-center justify-center bg-white py-16 px-4">
      <div className="text-center max-w-xl mx-auto mb-12">
        <h2 className="text-2xl font-bold mb-2">Welcome to Coworking App</h2>

        <p className="text-gray-500 text-sm mb-6">Your one-stop solution for coworking spaces.</p>

      <div className="flex gap-6 mb-20">
        <Link href="/login">
          <button className="w-48 py-3 bg-gradient-to-r from-blue-600 to-purple-500 font-bold text-xl hover:opacity-90 transition text-white rounded-md">
            Login
          </button>
        </Link>

        <Link href="/register">
          <button className="space-between w-48 py-3 bg-gradient-to-r from-blue-600 to-purple-500 font-bold text-xl hover:opacity-90 transition text-white rounded-md">
            Sign in
          </button>
        </Link>
                  
        </div>

        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-4"> Find your room and rent today! </h2>
          <p className="text-gray-500 text-sm mb-6">Your one-stop solution for coworking spaces.</p>
        </div>

      </div>  
  
    </div>
    <Footer />
    </>
  );
}
