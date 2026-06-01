'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const mockVerification = {
  verified: true,
  documentHash: '0x7f3a8c2d1e4b5f6a9c0d3e2f1a4b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3b2c1',
  onChainHash: '0x7f3a8c2d1e4b5f6a9c0d3e2f1a4b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3b2c1',
  blockNumber: 14523891,
  timestamp: 'May 28, 2026 at 14:32 UTC',
  network: 'Ethereum Mainnet',
};

function truncateHash(hash: string) {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

export default function DocumentVerifyPage() {
  const params = useParams();
  const id = params.id as string;
  const v = mockVerification;

  const details = [
    { label: 'Document Hash', value: truncateHash(v.documentHash), mono: true },
    { label: 'On-Chain Hash', value: truncateHash(v.onChainHash), mono: true },
    { label: 'Block Number', value: `#${v.blockNumber.toLocaleString()}` },
    { label: 'Timestamp', value: v.timestamp },
    { label: 'Network', value: v.network },
  ];

  return (
    <div className="space-y-6">
      <Link href={`/portal/documents/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowBackIcon fontSize="small" />
        Back to Document
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-[#1B2559]">Document Verification</h1>
        <p className="text-sm text-muted-foreground">Blockchain integrity check</p>
      </div>

      <div className="rounded-[18px] border bg-white p-6 shadow">
        <div className="flex flex-col items-center text-center mb-6">
          {v.verified ? (
            <CheckCircleIcon sx={{ fontSize: 64 }} className="text-[#12A150]" />
          ) : (
            <CancelIcon sx={{ fontSize: 64 }} className="text-[#D94B66]" />
          )}
          <p className={`text-xl font-extrabold mt-2 ${v.verified ? 'text-[#12A150]' : 'text-[#D94B66]'}`}>
            {v.verified ? 'Verified' : 'Verification Failed'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {v.verified ? "This document's hash matches the on-chain record." : 'Hash mismatch detected.'}
          </p>
        </div>

        <div>
          {details.map((row, i) => (
            <div key={row.label} className={`flex justify-between py-2.5 ${i < details.length - 1 ? 'border-b' : ''}`}>
              <span className="text-xs font-bold text-muted-foreground uppercase">{row.label}</span>
              <span className={`text-sm font-semibold text-[#1B2559] ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
