
import { useState } from "react";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/react";

import { syncCurrentUser } from "../services/userService.js";

function AuthButtons() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGetToken() {
    try {
      const token = await getToken();
      setMessage(
        token
          ? "Clerk token retrieved successfully."
          : "No token available. Please sign in."
      );
    } catch {
      setMessage("Could not retrieve the Clerk token.");
    }
  }

  async function handleConnectLibrary() {
    try {
      setLoading(true);
      setMessage("");

      const result = await syncCurrentUser();

      setMessage(result.message);
      console.log("Library user:", result.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Could not connect to the Library API. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!isLoaded) {
    return <p>Loading authentication...</p>;
  }

  if (!isSignedIn) {
    return (
      <div className="flex gap-4">
        <SignInButton mode="modal">
          <button className="rounded-lg bg-blue-600 px-5 py-3 text-white">
            Sign In
          </button>
        </SignInButton>

        <SignUpButton mode="modal">
          <button className="rounded-lg bg-green-600 px-5 py-3 text-white">
            Sign Up
          </button>
        </SignUpButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <UserButton />

      <button
        onClick={handleGetToken}
        className="rounded-lg bg-gray-700 px-5 py-3 text-white"
      >
        Get Token
      </button>

      <button
        onClick={handleConnectLibrary}
        disabled={loading}
        className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
      >
        {loading ? "Connecting..." : "Connect Library Account"}
      </button>

      {message && (
        <p className="text-center text-sm text-gray-700">
          {message}
        </p>
      )}
    </div>
  );
}

export default AuthButtons;
