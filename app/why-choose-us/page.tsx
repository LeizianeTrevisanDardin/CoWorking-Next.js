import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Search,
  Clock3,
  Users,
  ArrowRight,
} from "lucide-react";

export default function WhyChooseUsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <section className="mx-auto max-w-6xl px-6 py-20">

        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-600">
            Why Choose Us
          </p>

          <h1 className="mt-4 text-5xl font-bold text-gray-900">
            Find the perfect workspace with confidence.
          </h1>

          <p className="mt-6 text-lg text-gray-600">
            Coworking App connects professionals with modern,
            flexible workspaces in just a few clicks.
            Whether you're a freelancer, startup or remote worker,
            finding your next office has never been easier.
          </p>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg transition">
            <Search className="h-10 w-10 text-blue-600" />

            <h3 className="mt-6 text-xl font-bold">
              Easy Search
            </h3>

            <p className="mt-3 text-gray-600">
              Browse available coworking spaces with detailed
              information and beautiful photos.
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg transition">
            <Building2 className="h-10 w-10 text-purple-600" />

            <h3 className="mt-6 text-xl font-bold">
              Verified Properties
            </h3>

            <p className="mt-3 text-gray-600">
              Every workspace is managed by registered owners,
              helping you choose reliable locations.
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg transition">
            <ShieldCheck className="h-10 w-10 text-green-600" />

            <h3 className="mt-6 text-xl font-bold">
              Secure Platform
            </h3>

            <p className="mt-3 text-gray-600">
              Authentication and secure cloud storage protect
              your information.
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg transition">
            <Clock3 className="h-10 w-10 text-orange-500" />

            <h3 className="mt-6 text-xl font-bold">
              Save Time
            </h3>

            <p className="mt-3 text-gray-600">
              Compare locations, availability and prices
              without contacting multiple owners.
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg transition">
            <Users className="h-10 w-10 text-pink-600" />

            <h3 className="mt-6 text-xl font-bold">
              Built for Everyone
            </h3>

            <p className="mt-3 text-gray-600">
              Perfect for freelancers, remote workers,
              startups and growing businesses.
            </p>
          </div>

          <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white shadow-lg">

            <h3 className="text-2xl font-bold">
              Ready to find your workspace?
            </h3>

            <p className="mt-4 text-blue-100">
              Explore available properties and discover the
              perfect place to work today.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 hover:bg-gray-100 transition"
            >
              Explore Properties
              <ArrowRight size={18} />
            </Link>

          </div>

        </div>
      </section>
    </main>
  );
}