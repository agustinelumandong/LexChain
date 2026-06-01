import { permanentRedirect } from "next/navigation";

type SignUpCompatibilityPageProps = {
  searchParams: Promise<{
    token?: string | string[];
  }>;
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignUpCompatibilityPage({
  searchParams,
}: SignUpCompatibilityPageProps) {
  const token = firstValue((await searchParams).token)?.trim();

  if (token) {
    permanentRedirect(`/invite/${encodeURIComponent(token)}`);
  }

  permanentRedirect("/register");
}
