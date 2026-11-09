const AUTHENTICATOR_CODE_LENGTH = 6;

type AuthenticatorCodeInputProps = {
  id: string;
  value: string;
  invalid: boolean;
  describedBy?: string;
  onChange: (code: string) => void;
};

export function AuthenticatorCodeInput({ id, value, invalid, describedBy, onChange }: AuthenticatorCodeInputProps) {
  const activeIndex = Math.min(value.length, AUTHENTICATOR_CODE_LENGTH - 1);

  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type="text"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, AUTHENTICATOR_CODE_LENGTH))}
        autoComplete="one-time-code"
        inputMode="numeric"
        required
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        className="peer absolute inset-0 h-full w-full cursor-text text-base opacity-0"
      />
      <div aria-hidden="true" className="grid grid-cols-6 gap-2 peer-focus:[&>[data-active]]:border-[#0067B3] peer-focus:[&>[data-active]]:ring-2 peer-focus:[&>[data-active]]:ring-[#0067B3]">
        {Array.from({ length: AUTHENTICATOR_CODE_LENGTH }, (_, index) => (
          <div
            key={index}
            data-code-box=""
            data-active={index === activeIndex ? '' : undefined}
            className={`flex h-14 items-center justify-center rounded-lg border bg-[#F5FAFF] text-xl font-semibold text-[#0C2B49] ${invalid ? 'border-red-700' : 'border-[#B8C9D9]'}`}
          >
            {value[index]}
          </div>
        ))}
      </div>
    </div>
  );
}
