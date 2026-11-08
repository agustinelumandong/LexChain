import type { Metadata } from "next";
import { PrivacyContent } from "@/shared/components/legal/privacy-content";

export const metadata: Metadata = {
  title: "Privacy Policy | LexChain",
  description: "How LexChain handles account, document, and Google data.",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
