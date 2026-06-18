import Link from "next/link";
import Image from "next/image"; //better for optimization, but requires a valid src path and width/height

export default function Footer() {
    return (
        <footer className="bg-blue-900 text-white px-16 py-12">

            <div className="flex flex-col md:flex-row justify-between items-center">
                <div> 
                    <Image src="/images/coworkingNoBckg.png" alt="Coworking App Logo" width={100} height={50} />
                </div>
                <div>Quick Links</div>
                <div>Socials</div>
            </div>


              <div className="text-center text-gray-400 mt-4">
                    <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors mx-2">
                        Privacy Policy

                    </Link>
                    <Link href="/terms" className="text-gray-400 hover:text-white transition-colors mx-2">
                        Terms of Service
                    </Link>
              
          </div>
        </footer>
    )
}