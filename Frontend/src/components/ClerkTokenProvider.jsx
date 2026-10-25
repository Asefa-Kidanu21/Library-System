


import { useEffect } from "react";
import { useAuth } from "@clerk/react";
import { setClerkTokenGetter } from "../services/api.js";

function ClerkTokenProvider() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    setClerkTokenGetter(isSignedIn ? getToken : null);

    return () => {
      setClerkTokenGetter(null);
    };
  }, [isLoaded, isSignedIn, getToken]);

  return null;
}

export default ClerkTokenProvider;
