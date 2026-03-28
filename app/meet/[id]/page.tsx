import { Suspense } from "react";
import Link from "next/link";
import { scrapeMeetDetail } from "@/lib/scraper/meets";
import { LiveMeetDetail } from "@/components/meets/LiveMeetDetail";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

interface MeetPageProps {
  params: Promise<{ id: string }>;
}

async function MeetContent({ id }: { id: string }) {
  let meet;
  try {
    meet = await scrapeMeetDetail(id);
  } catch (err) {
    return (
      <ErrorMessage
        message={err instanceof Error ? err.message : "Failed to load meet"}
        swimcloudUrl={`https://www.swimcloud.com/results/${id}/`}
      />
    );
  }

  return <LiveMeetDetail initialMeet={meet} />;
}

export default async function MeetPage({ params }: MeetPageProps) {
  const { id } = await params;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/meets"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to meets
      </Link>
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <MeetContent id={id} />
      </Suspense>
    </div>
  );
}
