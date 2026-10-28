"use client";

import { useState } from "react";
import { AdminShell } from "@/features/admin/admin-shell";
import { Dropdown } from "@/features/admin/components/dropdown";
import { PageHeader } from "@/features/admin/components/page-header";
import { Button, Card, Input, Switch } from "@/shared/components/ui";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import TuneIcon from "@mui/icons-material/Tune";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { toast } from "sonner";

export default function AdminSystemSettingsPage() {
  const [displayName, setDisplayName] = useState("LexChain Admin");
  const [email, setEmail] = useState("admin@lexchain.local");
  const [timezone, setTimezone] = useState("asia-manila");
  const [digest, setDigest] = useState("daily");
  const [maxFileSize, setMaxFileSize] = useState("10mb");
  const [network, setNetwork] = useState("polygon-amoy");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  function handleSave() {
    toast.success("Settings updated for this session.");
  }

  return (
    <AdminShell activeHref="">
      <div className="flex h-full w-full flex-col gap-6">
        <PageHeader
          title="Settings"
          description="Manage your admin profile, account security, notifications, and platform defaults."
          action={
            <Button type="button" onClick={handleSave}>
              Save Changes
            </Button>
          }
        />

        <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
          <Card padded={false} className="p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF4FB] text-[#0985E7]">
                <PersonIcon fontSize="small" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0C2B49]">Admin Profile</h2>
                <p className="text-sm font-semibold text-[#64748b]">Name, email, and public admin identity.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-5 lg:flex-row">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#0985E7] text-2xl font-black text-white">
                LA
              </div>
              <div className="grid flex-1 gap-4 sm:grid-cols-2">
                <Input label="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
                <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                <Input label="Role" value="Operations Administrator" disabled />
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.1em] text-[#64748b]">Timezone</span>
                  <div className="mt-2">
                    <Dropdown
                      value={timezone}
                      onChange={setTimezone}
                      options={[
                        { label: "Asia/Manila", value: "asia-manila" },
                        { label: "UTC", value: "utc" },
                        { label: "US Pacific", value: "us-pacific" },
                      ]}
                    />
                  </div>
                </label>
              </div>
            </div>
          </Card>

          <Card padded={false} className="p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f3ff] text-[#7c3aed]">
                <LockIcon fontSize="small" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0C2B49]">Security</h2>
                <p className="text-sm font-semibold text-[#64748b]">Password and sign-in protection.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <Input label="Current password" type="password" placeholder="Enter current password" />
              <Input label="New password" type="password" placeholder="Enter new password" />
              <Switch
                label="Two-factor authentication"
                description="Require extra verification for admin login."
                checked={twoFactorEnabled}
                onChange={(event) => setTwoFactorEnabled(event.target.checked)}
                className="rounded-2xl bg-[var(--surface-soft)] p-4"
              />
            </div>
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <Card padded={false} className="p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0fdf4] text-[#16a34a]">
                <NotificationsIcon fontSize="small" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0C2B49]">Notifications</h2>
                <p className="text-sm font-semibold text-[#64748b]">Admin report and alert preferences.</p>
              </div>
            </div>

            <div className="mt-6">
              <span className="text-xs font-black uppercase tracking-[0.1em] text-[#64748b]">Report digest</span>
              <div className="mt-2">
                <Dropdown
                  value={digest}
                  onChange={setDigest}
                  options={[
                    { label: "Daily", value: "daily" },
                    { label: "Weekly", value: "weekly" },
                    { label: "Critical only", value: "critical" },
                  ]}
                />
              </div>
            </div>
          </Card>

          <Card padded={false} className="p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fefce8] text-[#ca8a04]">
                <TuneIcon fontSize="small" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0C2B49]">Platform Defaults</h2>
                <p className="text-sm font-semibold text-[#64748b]">Upload, chain, and availability controls.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.1em] text-[#64748b]">Max file size</span>
                <div className="mt-2">
                  <Dropdown
                    value={maxFileSize}
                    onChange={setMaxFileSize}
                    options={[
                      { label: "10 MB", value: "10mb" },
                      { label: "25 MB", value: "25mb" },
                      { label: "50 MB", value: "50mb" },
                    ]}
                  />
                </div>
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-[0.1em] text-[#64748b]">Blockchain network</span>
                <div className="mt-2">
                  <Dropdown
                    value={network}
                    onChange={setNetwork}
                    options={[
                      { label: "Polygon Amoy", value: "polygon-amoy" },
                      { label: "Local Testnet", value: "local-testnet" },
                    ]}
                  />
                </div>
              </div>
              <Switch
                label="Maintenance mode"
                description="Pause public verification and admin mutations."
                checked={maintenanceMode}
                onChange={(event) => setMaintenanceMode(event.target.checked)}
                className="rounded-2xl bg-[var(--surface-soft)] p-4 sm:col-span-2"
              />
            </div>
          </Card>
        </section>
      </div>
    </AdminShell>
  );
}
