import type { NextRequest } from "next/server";
import { signOut } from "@/server/api/signout";

export function POST(request?: NextRequest) {
  return signOut(request);
}
