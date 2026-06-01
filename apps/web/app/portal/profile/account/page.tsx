import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-5">
      <Link href="/portal/profile" className="flex items-center gap-1.5 text-sm font-bold text-[#0985E7] w-fit">
        <ArrowBackIcon sx={{ fontSize: 16 }} /> Back
      </Link>
      <h1 className="text-[28px] font-black text-[#0C2B49]">Account Details</h1>

      <div className="bg-white rounded-[18px] border border-[#E8F0F8] shadow-[0_4px_12px_rgba(19,59,115,0.05)] divide-y divide-[#E8F0F8]">
        <div className="px-5 py-4">
          <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wide">First Name</span>
          <p className="text-sm font-bold text-[#0C2B49] mt-1">Atty.</p>
        </div>
        <div className="px-5 py-4">
          <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wide">Last Name</span>
          <p className="text-sm font-bold text-[#0C2B49] mt-1">Reyes</p>
        </div>
        <div className="px-5 py-4">
          <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wide">Email</span>
          <p className="text-sm font-bold text-[#0C2B49] mt-1">lawyer@example.com</p>
        </div>
        <div className="px-5 py-4">
          <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wide">Role</span>
          <p className="text-sm font-bold text-[#0C2B49] mt-1">Attorney</p>
        </div>
      </div>
    </div>
  );
}
