import type { Metadata } from "next";

import { VerifiedContent } from "./verified-content";

export const metadata: Metadata = {
  title: "Email confirmation | LexChain",
  description: "Check your email for the LexChain account verification link.",
};

export default function AuthVerifiedPage() {
  return <VerifiedContent />;
}
