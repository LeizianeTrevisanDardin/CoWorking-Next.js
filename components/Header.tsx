"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center text-lg font-bold text-blue-700"
        >
          Coworking
        </Link>

        {/* Menu desktop */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm text-gray-600 hover:text-blue-600">
            Home
          </Link>

          <Link
            href="/why-choose-us"
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            Why Choose Us?
          </Link>

          <Link
            href="/register"
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            Register
          </Link>

          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            Login
          </Link>
        </nav>

        {/* Botão mobile */}
        <button
          type="button"
          onClick={() => setMenuOpen((previous) => !previous)}
          className="flex h-10 w-10 items-center justify-center rounded-md border text-xl md:hidden"
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
        >
          ☰
        </button>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <nav className="flex flex-col border-t bg-white px-4 py-4 md:hidden">
          <Link
            href="/"
            className="rounded-md px-3 py-3 text-gray-700 hover:bg-gray-100"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>

          <Link
            href="/why-choose-us"
            className="rounded-md px-3 py-3 text-gray-700 hover:bg-gray-100"
            onClick={() => setMenuOpen(false)}
          >
            Why Choose Us?
          </Link>

          <Link
            href="/register"
            className="rounded-md px-3 py-3 text-gray-700 hover:bg-gray-100"
            onClick={() => setMenuOpen(false)}
          >
            Register
          </Link>

          <Link
            href="/login"
            className="rounded-md px-3 py-3 text-gray-700 hover:bg-gray-100"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
        </nav>
      )}
    </header>
  );
}