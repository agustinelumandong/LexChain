import { permanentRedirect } from "next/navigation";

type InvitationTokenPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InvitationTokenPage({
  params,
}: InvitationTokenPageProps) {
  const { token } = await params;

  permanentRedirect(`/invite/${encodeURIComponent(token)}`);
}
