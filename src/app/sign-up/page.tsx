import { permanentRedirect } from "next/navigation";

type SignUpCompatibilityPageProps = {
  searchParams: Promise<{
    email?: string | string[];
    token?: string | string[];
  }>;
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignUpCompatibilityPage({
  searchParams,
}: SignUpCompatibilityPageProps) {
  const params = await searchParams;
  const token = firstValue(params.token)?.trim();
  const email = firstValue(params.email)?.trim();

  const query = new URLSearchParams();
  if (email) query.set("email", email);
  if (token) query.set("token", token);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  permanentRedirect(`/register${queryString}`);
}
