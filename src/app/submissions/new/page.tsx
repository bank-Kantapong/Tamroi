"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { SubmissionEditorClient } from "@/components/submissions/SubmissionEditorClient";

export default function NewSubmissionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?returnTo=/submissions/new");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="cute-page-container py-16 text-center text-xs font-bold text-slate-500">
        Loading editor...
      </div>
    );
  }

  return <SubmissionEditorClient mode="create" />;
}

