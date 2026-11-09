import type { Metadata } from "next";
import { TermsContent } from "@/shared/components/legal/terms-content";

export const metadata: Metadata = {
  title: "Terms of Service | LexChain",
  description: "Terms for using the LexChain document service.",
};

export default function TermsPage() {
  return <TermsContent />;
}
