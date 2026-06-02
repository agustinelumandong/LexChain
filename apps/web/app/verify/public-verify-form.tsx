"use client";

import { useEffect, useState } from "react";

type MockVerificationCheck = {
  label: string;
  status: string;
  description: string;
};

type MockVerificationResult = {
  fileName: string;
  status: "Verified";
  checkedAt: string;
  checks: MockVerificationCheck[];
};

function createMockVerificationResult(file: File): MockVerificationResult {
  return {
    fileName: file.name,
    status: "Verified",
    checkedAt: new Date().toISOString(),
    checks: [
      {
        label: "Notarial reference",
        status: "Matched",
        description: "The uploaded PDF matches a registered notarial reference.",
      },
      {
        label: "Content hash",
        status: "Matched",
        description: "The uploaded PDF hash matches the stored document hash.",
      },
      {
        label: "Blockchain integrity",
        status: "Verified / not tampered",
        description: "The stored hash matches the blockchain verification record.",
      },
    ],
  };
}

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function formatDate(value?: string | number | null) {
  if (!value) {
    return "Not available";
  }

  const date = typeof value === "number" ? new Date(value * 1000) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PublicVerifyForm() {
  const [isDragging, setIsDragging] = useState(false);
  const [, setDragDepth] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MockVerificationResult | null>(null);

  useEffect(() => {
    function onWindowDragEnter(event: DragEvent) {
      event.preventDefault();
      setDragDepth((currentDepth) => currentDepth + 1);
      setIsDragging(true);
    }

    function onWindowDragOver(event: DragEvent) {
      event.preventDefault();
    }

    function onWindowDragLeave(event: DragEvent) {
      event.preventDefault();
      setDragDepth((currentDepth) => {
        const nextDepth = Math.max(0, currentDepth - 1);
        setIsDragging(nextDepth > 0);
        return nextDepth;
      });
    }

    function onWindowDrop(event: DragEvent) {
      event.preventDefault();
      setDragDepth(0);
      setIsDragging(false);

      if (event.dataTransfer?.files.length === 0) {
        return;
      }

      if (event.dataTransfer && event.dataTransfer.files.length > 1) {
        setError("Drop one PDF file only.");
        return;
      }

      void handleFile(event.dataTransfer?.files[0]);
    }

    window.addEventListener("dragenter", onWindowDragEnter);
    window.addEventListener("dragover", onWindowDragOver);
    window.addEventListener("dragleave", onWindowDragLeave);
    window.addEventListener("drop", onWindowDrop);

    return () => {
      window.removeEventListener("dragenter", onWindowDragEnter);
      window.removeEventListener("dragover", onWindowDragOver);
      window.removeEventListener("dragleave", onWindowDragLeave);
      window.removeEventListener("drop", onWindowDrop);
    };
  });

  async function handleFile(file?: File) {
    if (!file || isPending) {
      return;
    }

    if (!isPdfFile(file)) {
      setSelectedFile(null);
      setResult(null);
      setError("Only PDF files can be verified.");
      return;
    }

    setSelectedFile(file);
    setResult(null);
    setError(null);
    setProgress(0);
  }

  function handleInputFile(input: HTMLInputElement) {
    const file = input.files?.[0];
    input.value = "";
    void handleFile(file);
  }

  function removeSelectedFile() {
    if (isPending) {
      return;
    }

    setSelectedFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
  }

  function runProgressToSeventy() {
    setProgress(0);

    return new Promise<void>((resolve) => {
      let currentProgress = 0;
      const intervalId = window.setInterval(() => {
        currentProgress = Math.min(70, currentProgress + 5);
        setProgress(currentProgress);

        if (currentProgress >= 70) {
          window.clearInterval(intervalId);
          resolve();
        }
      }, 120);
    });
  }

  async function verifySelectedFile() {
    if (!selectedFile || isPending) {
      return;
    }

    setResult(null);
    setError(null);
    setIsPending(true);
    const progressPromise = runProgressToSeventy();

    await progressPromise;
    setProgress(100);
    window.setTimeout(() => {
      setResult(createMockVerificationResult(selectedFile));
      setIsPending(false);
    }, 250);
  }

  return (
    <div className="space-y-6">
      {isDragging ? (
        <div className="fixed inset-x-0 top-0 z-50 flex h-dvh items-center justify-center bg-[#0C2B49]/70 p-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[24px] border border-white/25 bg-white p-8 text-center shadow-[0_24px_80px_rgba(12,43,73,0.35)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center text-[#0985E7]">
              <svg
                aria-hidden="true"
                className="h-12 w-12"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.4"
                viewBox="0 0 24 24"
              >
                <path d="M16 16l-4-4-4 4" />
                <path d="M12 12v9" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              </svg>
            </div>
            <p className="mt-4 text-2xl font-black text-[#0C2B49]">
              Drop PDF anywhere
            </p>
            <p className="mt-2 text-sm font-semibold text-[#64748b]">
              Release anywhere on this screen to attach it to the verifier.
            </p>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-[#64748b]">
              PDF only
            </p>
          </div>
        </div>
      ) : null}

      {!result ? (
        <div
          aria-disabled={isPending}
          aria-label="Choose or drop one PDF file to verify"
          className={[
            "relative rounded-[18px] border border-dashed px-6 py-24 text-center transition",
            isDragging ? "border-[#0985E7] bg-[#EAF6FF]" : "border-[#9fb0c6] bg-[#f7f9fc]",
            isPending ? "cursor-wait opacity-75" : "cursor-pointer hover:border-[#0985E7]",
          ].join(" ")}
        >
          <div className="mx-auto flex h-11 w-11 items-center justify-center text-[#0985E7]">
            <svg
              aria-hidden="true"
              className="h-10 w-10"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.4"
              viewBox="0 0 24 24"
            >
              <path d="M16 16l-4-4-4 4" />
              <path d="M12 12v9" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              <path d="M16 16l-4-4-4 4" />
            </svg>
          </div>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-[#64748b]">
            PDF only
          </p>
          <p className="mt-3 text-xl font-black text-[#0C2B49]">
            {selectedFile?.name ?? (isPending ? "Verifying uploaded document" : "Drag and Drop here")}
          </p>
          {selectedFile ? (
            <div className="mt-3 space-y-4">
              <p className="text-sm font-semibold text-[#64748b]">
                {formatFileSize(selectedFile.size)}
              </p>
              <p className="text-sm font-semibold text-[#64748b]">
                Choose or drop one PDF file to verify
              </p>
              {isPending ? (
                <div className="mx-auto max-w-sm rounded-2xl bg-white/75 p-4 text-left">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-[#0C2B49]">
                        Verifying uploaded document
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#64748b]">
                        Notarial reference, content hash, and blockchain integrity checks are running.
                      </p>
                    </div>
                    <p className="text-sm font-black text-[#0985E7]">{progress}%</p>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E4EEF9]">
                    <div
                      className="h-full rounded-full bg-[#0985E7] transition-[width] duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {progress >= 70 ? (
                    <p className="mt-3 text-center text-xs font-black uppercase tracking-[0.14em] text-[#64748b]">
                      Finalizing verification checks
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    className="rounded-full border border-[#E4EEF9] bg-white px-6 py-3 text-sm font-black text-[#64748b] transition hover:bg-[#F5FAFF] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isPending}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeSelectedFile();
                    }}
                  >
                    Remove file
                  </button>
                  <button
                    className="rounded-full bg-[#0985E7] px-9 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(9,133,231,0.22)] transition hover:bg-[#0770c4] disabled:cursor-not-allowed disabled:bg-[#9fb0c6] disabled:shadow-none"
                    disabled={isPending}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void verifySelectedFile();
                    }}
                  >
                    Verify
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <p className="mt-2 text-base font-semibold text-[#64748b]">or</p>
              <label
                className={[
                  "relative mt-4 inline-flex cursor-pointer overflow-hidden rounded-full bg-[#0985E7] px-8 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(9,133,231,0.22)] transition hover:bg-[#0770c4]",
                  isPending ? "cursor-not-allowed bg-[#9fb0c6] shadow-none" : "",
                ].join(" ")}
              >
                <input
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  type="file"
                  accept="application/pdf,.pdf"
                  disabled={isPending}
                  aria-label="Choose one PDF file to verify"
                  onChange={(event) => handleInputFile(event.currentTarget)}
                  onInput={(event) => handleInputFile(event.currentTarget)}
                />
                Select file
              </label>
            </>
          )}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl bg-red-50 p-4">
          <p className="text-sm font-black text-red-700">Unable to verify upload</p>
          <p className="mt-1 text-sm font-semibold text-red-700">{error}</p>
        </div>
      ) : null}

      {result ? (
        <section className="rounded-[24px] border border-[#E4EEF9] bg-white p-6 shadow-[0_10px_24px_rgba(12,43,73,0.08)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase text-[#0985E7]">
                LexChain Verification
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#0C2B49]">
                {result.fileName}
              </h2>
              <p className="mt-2 text-sm font-semibold text-[#64748b]">
                Checked {formatDate(result.checkedAt)}
              </p>
            </div>
            <div className="rounded-full bg-[#EAF6FF] px-4 py-2 text-sm font-black text-[#0770c4]">
              {result.status}
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            {result.checks.map((check) => (
              <article
                className="flex gap-3 rounded-2xl border border-[#D7ECD7] bg-[#F3FBF5] p-4"
                key={check.label}
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#18A058] text-white"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-sm font-black text-[#0C2B49]">
                      {check.label}
                    </h3>
                    <p className="text-sm font-black text-[#127A43]">
                      {check.status}
                    </p>
                  </div>
                  <p className="mt-1 text-sm font-semibold leading-5 text-[#4F6475]">
                    {check.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-5 flex justify-center">
            <button
              className="rounded-full border border-[#E4EEF9] bg-white px-5 py-2.5 text-sm font-black text-[#0C2B49] transition hover:bg-[#F5FAFF]"
              type="button"
              onClick={removeSelectedFile}
            >
              Verify another document
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
