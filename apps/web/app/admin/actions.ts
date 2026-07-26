"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { backendUrl } from "@/lib/admin-api";

function getToken(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return cookieStore.get("issuer_token")?.value;
}

export async function getDashboard() {
  const cookieStore = await cookies();
  const token = getToken(cookieStore);
  if (!token) return { error: "Not authenticated" };

  const res = await fetch(backendUrl("/admin/dashboard"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return { error: "Failed to fetch dashboard" };
  return { data: await res.json() };
}

export async function getUsers() {
  const cookieStore = await cookies();
  const token = getToken(cookieStore);
  if (!token) return { error: "Not authenticated" };

  const res = await fetch(backendUrl("/admin/users"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return { error: "Failed to fetch users" };
  return { data: await res.json() };
}

export async function getInvitations() {
  const cookieStore = await cookies();
  const token = getToken(cookieStore);
  if (!token) return { error: "Not authenticated" };

  const res = await fetch(backendUrl("/admin/invitations"), {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    cache: "no-store",
  });
  if (!res.ok) return { error: "Failed to fetch invitations" };
  return { data: await res.json() };
}

export async function createInvitation(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const token = getToken(cookieStore);
  if (!token) return;

  const email = formData.get("email") as string;
  const role = (formData.get("role") as string) || "lawyer";

  if (!email) return;

  const res = await fetch(backendUrl("/admin/invitations"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({ email, role }),
  });

  if (res.ok) {
    revalidatePath("/admin/invitations-permissions");
  }
}

export async function revokeInvitation(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const token = getToken(cookieStore);
  if (!token) return;

  const invitationId = formData.get("invitation_id") as string;
  if (!invitationId) return;

  const res = await fetch(backendUrl(`/admin/invitations/${invitationId}`), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });

  if (res.ok || res.status === 204) {
    revalidatePath("/admin/invitations-permissions");
  }
}
