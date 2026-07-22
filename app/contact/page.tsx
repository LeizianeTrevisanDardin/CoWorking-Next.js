import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function ContactPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-20">

      <h1 className="text-4xl font-bold text-center mb-4">
        Contact Us
      </h1>

      <p className="text-center text-gray-600 mb-12">
        We'd love to hear from you.
      </p>

      <div className="grid md:grid-cols-3 gap-8">

        <div className="rounded-2xl border p-8 text-center shadow-sm">
          <Mail className="mx-auto text-blue-600 mb-4" size={34} />

          <h3 className="font-semibold mb-2">
            Email
          </h3>

          <p>support@coworkingapp.com</p>
        </div>

        <div className="rounded-2xl border p-8 text-center shadow-sm">
          <Phone className="mx-auto text-purple-600 mb-4" size={34} />

          <h3 className="font-semibold mb-2">
            Phone
          </h3>

          <p>+1 (403) 555-1234</p>
        </div>

        <div className="rounded-2xl border p-8 text-center shadow-sm">
          <MapPin className="mx-auto text-pink-600 mb-4" size={34} />

          <h3 className="font-semibold mb-2">
            Office
          </h3>

          <p>Calgary, Alberta</p>
        </div>

      </div>

    </main>
  );
}