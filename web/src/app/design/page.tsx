import type { Metadata } from "next";
import { Showcase } from "./showcase";

export const metadata: Metadata = {
  title: "Design system · Replica calorie tracker",
  robots: { index: false },
};

export default function DesignPage() {
  return <Showcase />;
}
