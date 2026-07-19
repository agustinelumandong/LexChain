import { getBlockchainRecordFields, type BlockchainRecordUi } from '../lib/blockchain-record-ui';

export function BlockchainRecordCard({ record }: { record: BlockchainRecordUi }) {
  const fields = getBlockchainRecordFields(record);

  return (
    <article className="rounded-[18px] border border-[#E8F0F8] bg-white p-5">
      <h2 className="text-base font-black text-[#0C2B49]">Blockchain record</h2>
      <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label}>
            <dt className="font-bold text-[#64748b]">{field.label}</dt>
            <dd className="mt-1 break-all font-mono text-[#0C2B49]">{field.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
