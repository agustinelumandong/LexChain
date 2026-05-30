"use client";

import { useState } from "react";
import { Modal } from "../components/modal";
import { Dropdown } from "../components/dropdown";
import AddIcon from "@mui/icons-material/Add";

type CreateInvitationModalProps = {
  label?: string;
  className?: string;
  onCreate?: (invite: { email: string; role: string }) => void;
};

export function CreateInvitationModal({ label = "Create Invitation", className, onCreate }: CreateInvitationModalProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("lawyer");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (onCreate) {
        onCreate({ email, role });
      } else {
        await fetch("/api/admin/invitations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, role }),
        });
        window.location.reload();
      }
      setEmail("");
      setRole("lawyer");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className ?? "flex cursor-pointer items-center gap-2 rounded-lg bg-[#0985E7] px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-[#0770c4]"}
      >
        <AddIcon fontSize="small" />
        {label}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Create Invitation">
        <p className="text-sm font-semibold text-[#64748b]">
          Send a magic-link invitation to a lawyer to join the platform.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-[0.1em] text-[#64748b] mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="lawyer@example.com"
              className="w-full rounded-xl border border-[#E4EEF9] bg-[#F8FBFF] px-4 py-2.5 text-sm font-semibold text-[#0C2B49] outline-none placeholder:text-[#94a3b8] focus:border-[#0985E7]"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-[0.1em] text-[#64748b] mb-1.5">
              Role
            </label>
            <Dropdown
              value={role}
              onChange={setRole}
              options={[
                { label: "Lawyer", value: "lawyer" },
                { label: "Admin", value: "admin" },
              ]}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-xl bg-[#0985E7] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0770c4] disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Invitation"}
          </button>
        </form>
      </Modal>
    </>
  );
}
