
import { useEffect, useState } from "react";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/react";

import { syncCurrentUser } from "../users/userApi.js";
import DashboardLayout from "../dashboard/DashboardLayout.jsx";

export default function AuthPage() {
  const { isLoaded, isSignedIn } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setUser(null);
      setError("");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function synchronizeUser() {
      try {
        setLoading(true);
        setError("");
        setUser(null);

        const result = await syncCurrentUser();

        if (!result.success || !result.data) {
          throw new Error("The server did not return your library account.");
        }

        if (!cancelled) {
          setUser(result.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to connect your account to the library."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    synchronizeUser();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, retry]);

  // Clerk is still initializing
  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading authentication...</p>
      </main>
    );
  }

  // User is not authenticated
  if (!isSignedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
              📚
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Library Management System
            </h1>

            <p className="mt-3 text-gray-600">
              Sign in or create an account to access your library.
            </p>
          </div>

          <div className="space-y-4">
            <SignInButton mode="modal">
              <button
                type="button"
                className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Sign In
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button
                type="button"
                className="w-full rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Create Account
              </button>
            </SignUpButton>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            New accounts receive the student role by default.
          </p>
        </section>
      </main>
    );
  }

  // Signed in, but synchronization is still running
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <section className="rounded-xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <h1 className="text-xl font-semibold text-gray-900">
            Connecting your account
          </h1>

          <p className="mt-2 text-gray-600">
            Please wait while we connect your Clerk account to the library.
          </p>
        </section>
      </main>
    );
  }

  // Signed in, but the backend synchronization failed
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <section className="w-full max-w-lg rounded-xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Unable to connect your account
          </h1>

          <p className="mt-4 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Try Again
            </button>

            <UserButton />
          </div>
        </section>
      </main>
    );
  }

  // Signed in and synchronized with PostgreSQL
  if (user) {
    if (user.role !== "student" && user.role !== "librarian") {
      return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h1 className="text-xl font-bold text-gray-900">
              Account access unavailable
            </h1>

            <p className="mt-3 text-gray-600">
              Your library account has an invalid role. Please contact the
              library administrator.
            </p>

            <div className="mt-5">
              <UserButton />
            </div>
          </section>
        </main>
      );
    }

    return <DashboardLayout user={user} />;
  }

  return null;
}
