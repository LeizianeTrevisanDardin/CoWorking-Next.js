"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { supabase } from "@/lib/supabase";

type LoginFormProps = {
  redirectTo: string;
};

export default function LoginForm({
  redirectTo,
}: LoginFormProps) {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Fields are required");
      return;
    }

    try {
      setLoading(true);

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        alert(error.message);
        return;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
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
        alert(
          "Profile not found for this user."
        );
        return;
      }

      if (profile.role === "owner") {
        router.push(
          "/OwnerDashboard"
        );
        return;
      }

      if (profile.role === "coworker") {
        router.push(redirectTo);
        return;
      }

      alert("Invalid user role.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center py-10">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <Image
          src="/images/coworking.png"
          alt="Coworking App Logo in Blue"
          width={150}
          height={75}
          priority
          className="mx-auto mb-6 h-auto w-auto"
        />

        <h3 className="mb-2 text-center text-2xl font-bold">
          Login
        </h3>

        <p className="mb-8 text-center text-sm text-gray-500">
          Welcome back! Please login to your account.
        </p>

        <div className="mb-4">
          <label className="mb-1 block text-sm">
            Email address
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            autoComplete="email"
            className="w-full rounded-lg bg-gray-100 px-3 py-2 outline-none transition focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter"
              ) {
                void handleLogin();
              }
            }}
            autoComplete="current-password"
            className="w-full rounded-lg bg-gray-100 px-3 py-2 outline-none transition focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <button
          type="button"
          onClick={() =>
            void handleLogin()
          }
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-2 font-semibold text-white transition hover:from-blue-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Signing in..."
            : "Sign in"}
        </button>
      </div>
    </div>
  );
}