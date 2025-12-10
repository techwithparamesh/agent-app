import { useState, useEffect, useCallback, useRef } from "react";
import type { User } from "@shared/schema";

// Global state to share across all useAuth instances
let globalUser: User | null = null;
let globalIsLoading = true;
let globalHasFetched = false;
let fetchPromise: Promise<User | null> | null = null;
const listeners = new Set<() => void>();

async function fetchUser(): Promise<User | null> {
  try {
    const res = await fetch("/api/auth/user", {
      credentials: "include",
    });
    if (res.status === 401) {
      return null;
    }
    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (error) {
    return null;
  }
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

async function initializeAuth() {
  if (globalHasFetched || fetchPromise) {
    return fetchPromise;
  }
  
  fetchPromise = fetchUser().then((user) => {
    globalUser = user;
    globalIsLoading = false;
    globalHasFetched = true;
    notifyListeners();
    return user;
  });
  
  return fetchPromise;
}

export function useAuth() {
  const [, forceUpdate] = useState({});
  const isMounted = useRef(true);
  
  useEffect(() => {
    isMounted.current = true;
    
    const listener = () => {
      if (isMounted.current) {
        forceUpdate({});
      }
    };
    
    listeners.add(listener);
    
    // Only fetch if not already fetched
    if (!globalHasFetched && !fetchPromise) {
      initializeAuth();
    }
    
    return () => {
      isMounted.current = false;
      listeners.delete(listener);
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      globalUser = null;
      notifyListeners();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);

  const refetchUser = useCallback(async () => {
    globalHasFetched = false;
    fetchPromise = null;
    globalIsLoading = true;
    notifyListeners();
    await initializeAuth();
  }, []);

  const setUser = useCallback((user: User | null) => {
    globalUser = user;
    globalIsLoading = false;
    globalHasFetched = true;
    notifyListeners();
  }, []);

  return {
    user: globalUser,
    isLoading: globalIsLoading,
    isAuthenticated: !!globalUser,
    logout,
    refetchUser,
    setUser,
  };
}
