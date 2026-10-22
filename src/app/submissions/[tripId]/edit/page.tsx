"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { TripWithStops } from "@/types/trip";
import { useAuth } from "@/components/AuthProvider";
import { SubmissionEditorClient } from "@/components/submissions/SubmissionEditorClient";

interface EditSubmissionPageProps {
  params: Promise<{ tripId: string }>;
}

export default function EditSubmissionPage({ params }: EditSubmissionPageProps) {
  const { tripId } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();

  const [trip, setTrip] = useState<TripWithStops | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?returnTo=/submissions/${tripId}/edit`);
      return;
    }

    async function loadSubmission() {
      try {
        const res = await fetch(`/api/submissions/${tripId}`, { cache: "no-store" });
        if (!res.ok) {
          setError("Submission not found or you do not have permission to edit it.");
        } else {
          const data = await res.json();
          setTrip(data.submission);
        }
      } catch {
        setError("Failed to load submission data.");
      } finally {
        setFetching(false);
      }
    }

    if (user) {
      loadSubmission();
    }
  }, [tripId, user, loading, router]);

  if (loading || fetching) {
    return (
      <div className="cute-page-container py-16 text-center text-xs font-bold text-slate-500">
        Loading submission...
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="cute-page-container py-16 text-center">
        <p className="text-sm font-bold text-rose-600">{error || "Submission not found"}</p>
      </div>
    );
  }

  return <SubmissionEditorClient mode="edit" initialTrip={trip} />;
}

