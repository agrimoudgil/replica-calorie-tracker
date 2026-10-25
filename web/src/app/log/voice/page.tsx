import { redirect } from "next/navigation";
import { ComingSoon } from "@/components/screen";
import { VOICE_LOGGING } from "@/lib/ai";

/** S06: say it. With voice on, the add-food screen opens ready to listen (speech becomes typed text there). */
export default async function VoicePage({ searchParams }: PageProps<"/log/voice">) {
  if (!VOICE_LOGGING) {
    return <ComingSoon screen="S06" title="Say it" back="/" body="Voice logging comes later. Type or search what you ate for now." />;
  }
  const params = new URLSearchParams({ mode: "voice" });
  for (const [key, value] of Object.entries(await searchParams)) {
    if ((key === "meal" || key === "date") && typeof value === "string") params.set(key, value);
  }
  redirect(`/log/search?${params}`);
}
