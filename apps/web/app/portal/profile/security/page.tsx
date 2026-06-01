import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function SecurityPage() {
  return (
    <div className="flex flex-col gap-5">
      <Link href="/portal/profile" className="flex items-center gap-1.5 text-sm font-bold text-[#0985E7] w-fit">
        <ArrowBackIcon sx={{ fontSize: 16 }} /> Back
      </Link>
      <h1 className="text-[28px] font-black text-[#0C2B49]">Security</h1>

      <div className="bg-white rounded-[18px] border border-[#E8F0F8] shadow-[0_4px_12px_rgba(19,59,115,0.05)] divide-y divide-[#E8F0F8]">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-[#0C2B49] block">Password</span>
            <span className="text-[11px] text-[#64748b]">Last changed 30 days ago</span>
          </div>
          <button className="rounded-full border border-[#E8F0F8] px-4 py-2 text-xs font-bold text-[#0985E7] hover:bg-[#F5FAFF] transition">
            Change
          </button>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-[#0C2B49] block">Two-Factor Authentication</span>
            <span className="text-[11px] text-[#64748b]">Add an extra layer of security</span>
          </div>
          <span className="rounded-full bg-[#FFF4DD] px-3 py-1 text-[11px] font-bold text-[#B77900]">Off</span>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-[#0C2B49] block">Active Sessions</span>
            <span className="text-[11px] text-[#64748b]">Manage your logged-in devices</span>
          </div>
          <span className="text-xs font-bold text-[#64748b]">1 device</span>
        </div>
      </div>
    </div>
  );
}
