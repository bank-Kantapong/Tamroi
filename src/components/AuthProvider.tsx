"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { SessionUser } from "@/types/trip";

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  savedTripIds: string[];
  isSaved: (tripId: string) => boolean;
  toggleSave: (tripId: string) => Promise<{ saved: boolean; promptedLogin?: boolean }>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  refreshUser: async () => {},
  savedTripIds: [],
  isSaved: () => false,
  toggleSave: async () => ({ saved: false }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedTripIds, setSavedTripIds] = useState<string[]>([]);

  async function fetchUserSession() {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          fetchSavedTripIds();
          return;
        }
      }
      setUser(null);
      setSavedTripIds([]);
    } catch {
      setUser(null);
      setSavedTripIds([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSavedTripIds() {
    try {
      const res = await fetch("/api/saved?idsOnly=1", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.savedTripIds)) {
          setSavedTripIds(data.savedTripIds);
        }
      }
    } catch {
      // ignore fetch error
    }
  }

  useEffect(() => {
    fetchUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" };
      }
      setUser(data.user);
      fetchSavedTripIds();
      return { success: true };
    } catch {
      return { success: false, error: "Network error occurred." };
    }
  }

  async function register(email: string, password: string, displayName: string) {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, display_name: displayName }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detailMessage = data.details
          ? Object.values(data.details).flat().join(", ")
          : data.error;
        return { success: false, error: detailMessage || "Registration failed" };
      }
      setUser(data.user);
      fetchSavedTripIds();
      return { success: true };
    } catch {
      return { success: false, error: "Network error occurred." };
    }
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setSavedTripIds([]);
    }
  }

  function isSaved(tripId: string): boolean {
    return savedTripIds.includes(tripId);
  }

  async function toggleSave(
    tripId: string
  ): Promise<{ saved: boolean; promptedLogin?: boolean }> {
    if (!user) {
      return { saved: false, promptedLogin: true };
    }

    const currentlySaved = isSaved(tripId);

    if (currentlySaved) {
      // Optimistic update
      setSavedTripIds((prev) => prev.filter((id) => id !== tripId));
      try {
        const res = await fetch(`/api/saved?tripId=${encodeURIComponent(tripId)}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          // Revert if failed
          setSavedTripIds((prev) => [...prev, tripId]);
          return { saved: true };
        }
        return { saved: false };
      } catch {
        setSavedTripIds((prev) => [...prev, tripId]);
        return { saved: true };
      }
    } else {
      // Optimistic update
      setSavedTripIds((prev) => [...prev, tripId]);
      try {
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tripId }),
        });
        if (!res.ok) {
          // Revert if failed
          setSavedTripIds((prev) => prev.filter((id) => id !== tripId));
          return { saved: false };
        }
        return { saved: true };
      } catch {
        setSavedTripIds((prev) => prev.filter((id) => id !== tripId));
        return { saved: false };
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser: fetchUserSession,
        savedTripIds,
        isSaved,
        toggleSave,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
