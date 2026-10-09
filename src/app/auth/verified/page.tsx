import type { Metadata } from "next";

import { VerifiedContent } from "./verified-content";

export const metadata: Metadata = {
  title: "Email verification | LexChain",
  description: "Continue email verification or request another link.",
};

export default function AuthVerifiedPage() {
  return <VerifiedContent />;
}
