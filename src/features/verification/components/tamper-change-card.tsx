import MyLocationIcon from '@mui/icons-material/MyLocation';
import type { ApiSchema } from '@/shared/types/index';

type TamperSegment = ApiSchema<'TamperSegment'>;
type WordDiffPart = ApiSchema<'WordDiffPart'>;

const SEVERITY_LABEL: Record<TamperSegment['severity'], string> = { critical: 'Critical', major: 'Major', minor: 'Minor' };
const SEVERITY_TONE: Record<TamperSegment['severity'], string> = {
  critical: 'bg-[#B42318] text-white',
  major: 'bg-amber-100 text-[#8A5B00]',
  minor: 'bg-[#EEF3F9] text-[#4B6382]',
};

function ChangedWords({ parts, hiddenOp }: { parts: WordDiffPart[]; hiddenOp: 'added' | 'removed' }) {
  return parts.filter((part) => part.op !== hiddenOp).map((part, index) => (
    <span key={index}>
      {index > 0 && ' '}
      {part.op === 'equal' && part.text}
      {part.op === 'removed' && <del className="rounded-sm bg-[#EEF3F9] px-0.5 decoration-[#B42318]">{part.text}</del>}
      {part.op === 'added' && <ins className="rounded-sm bg-red-100 px-0.5 font-extrabold text-[#B42318] no-underline">{part.text}</ins>}
    </span>
  ));
}

function TextRow({ label, tone, children }: { label: string; tone: 'saved' | 'current'; children: React.ReactNode }) {
  return (
    <div className={`border-l-2 pl-3 ${tone === 'current' ? 'border-[#B42318]' : 'border-[#D7E4F2]'}`}>
      <dt className={`text-xs font-bold ${tone === 'current' ? 'text-[#B42318]' : 'text-[#5B6F8A]'}`}>{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium leading-5 text-[#0C2B49]">{children}</dd>
    </div>
  );
}

export function TamperChangeCard({ segment, position, selected, onShow }: {
  segment: TamperSegment;
  position: number;
  selected: boolean;
  onShow?: () => void;
}) {
  const hasWordDiff = segment.type === 'replace' && segment.word_diff.length > 0;
  const interactionTone = selected
    ? 'border-[#0067B3] bg-[#F1F8FE] ring-1 ring-[#0067B3]'
    : onShow ? 'border-[#E8F0F8] hover:border-[#98C9F3] hover:bg-[#F1F8FE]' : 'border-[#E8F0F8]';

  return (
    <li data-change={position} className={`relative scroll-my-2 rounded-xl border p-3 transition-colors motion-reduce:transition-none ${interactionTone}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${SEVERITY_TONE[segment.severity]}`}>{SEVERITY_LABEL[segment.severity]}</span>
        {onShow ? (
          // The stretched ::after makes the whole card one real button target.
          <button
            type="button"
            aria-pressed={selected}
            onClick={onShow}
            className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-[#0067B3] after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[#0067B3]"
          >
            <MyLocationIcon aria-hidden="true" sx={{ fontSize: 14 }} />
            Show on page {(segment.page_idx ?? 0) + 1}
            <span className="sr-only">: change {position + 1}</span>
          </button>
        ) : (
          <span className="text-xs font-semibold text-[#5B6F8A]">
            {segment.location === 'original' && segment.page_idx != null ? `Saved version · page ${segment.page_idx + 1}` : 'Position not available'}
          </span>
        )}
      </div>
      <p className="mt-2 break-words text-sm font-bold text-[#0C2B49]">{segment.reason}</p>
      <dl className="mt-2 space-y-2">
        {segment.type === 'insert' && <TextRow label="Added to the current PDF" tone="current">{segment.current_text || 'Not provided'}</TextRow>}
        {segment.type === 'delete' && <TextRow label="Removed from the current PDF" tone="saved">{segment.original_text || 'Not provided'}</TextRow>}
        {segment.type === 'replace' && <>
          <TextRow label="Saved version" tone="saved">
            {hasWordDiff ? <ChangedWords parts={segment.word_diff} hiddenOp="added" /> : segment.original_text || 'Not provided'}
          </TextRow>
          <TextRow label="Current PDF" tone="current">
            {hasWordDiff ? <ChangedWords parts={segment.word_diff} hiddenOp="removed" /> : segment.current_text || 'Not provided'}
          </TextRow>
        </>}
      </dl>
    </li>
  );
}
