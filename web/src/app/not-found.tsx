import Link from "next/link";
import { SearchX } from "lucide-react";
import { Screen } from "@/components/screen";
import { EmptyState } from "@/components/ui/feedback";

export default function NotFound() {
  return (
    <Screen>
      <EmptyState
        icon={<SearchX />}
        title="We couldn't find that"
        body="It may have been deleted, or the link is wrong."
        action={
          <Link href="/" className="inline-flex h-11 items-center rounded-md bg-accent px-4 text-sm font-semibold text-on-accent">
            Back to today
          </Link>
        }
      />
    </Screen>
  );
}
