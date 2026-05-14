"use client";

import { useRef, useState } from "react";

import {
  type PublicVerifyResponse,
  verifyPublicPdf,
} from "@/lib/public-verifier-api";

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

function formatHash(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  if (value.length <= 28) {
    return value;
  }

  return `${value.slice(0, 14)}...${value.slice(-12)}`;
}

function normalizeStatus(value: string) {
  const status = value.toLowerCase();

  if (status === "match" || status === "verified" || status === "valid") {
    return "Verified";
  }

  if (status === "pending") {
    return "Pending";
  }

  return "Invalid";
}

function formatConfidence(value: number) {
  const percentage = value <= 1 ? value * 100 : value;
  return `${Math.round(percentage)}%`;
}

export function PublicVerifyForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PublicVerifyResponse | null>(null);

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
    setIsPending(true);

    try {
      setResult(await verifyPublicPdf(file));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to verify uploaded PDF.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div
        role="button"
        tabIndex={0}
        aria-disabled={isPending}
        aria-label="Choose or drop one PDF file to verify"
        onClick={() => {
          if (!isPending) {
            inputRef.current?.click();
          }
        }}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && !isPending) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);

          if (event.dataTransfer.files.length > 1) {
            setError("Drop one PDF file only.");
            return;
          }

          void handleFile(event.dataTransfer.files[0]);
        }}
        className={[
          "rounded-lg border border-dashed p-8 text-center transition",
          isDragging ? "border-[#0985E7] bg-[#EAF6FF]" : "border-[#9fb0c6] bg-[#f7f9fc]",
          isPending ? "cursor-wait opacity-75" : "cursor-pointer hover:border-[#0985E7]",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept="application/pdf,.pdf"
          disabled={isPending}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => {
            void handleFile(event.currentTarget.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-white text-2xl shadow-sm">
          PDF
        </div>
        <p className="mt-4 text-base font-black text-[#102033]">
          {isPending ? "Verifying PDF..." : "Choose or drop a PDF"}
        </p>
        <p className="mt-2 text-sm font-medium text-[#526172]">
          {selectedFile
            ? `${selectedFile.name} (${formatFileSize(selectedFile.size)})`
            : "Upload one PDF document to check against notarized LexChain records."}
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <section className="rounded-lg border border-[#d9e2ef] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
                Verification result
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#102033]">
                {normalizeStatus(result.status)}
              </h2>
            </div>
            <div className="rounded-full bg-[#EAF6FF] px-4 py-2 text-sm font-black text-[#0770c4]">
              {formatConfidence(result.confidence)} confidence
            </div>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md bg-[#f7f9fc] p-4">
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#526172]">
                File
              </dt>
              <dd className="mt-2 text-sm font-bold text-[#102033]">
                {result.file_name ?? selectedFile?.name ?? "Not available"}
              </dd>
            </div>
            <div className="rounded-md bg-[#f7f9fc] p-4">
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#526172]">
                Matched at
              </dt>
              <dd className="mt-2 text-sm font-bold text-[#102033]">
                {formatDate(result.matched_at)}
              </dd>
            </div>
            <div className="rounded-md bg-[#f7f9fc] p-4">
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#526172]">
                Notarized at
              </dt>
              <dd className="mt-2 text-sm font-bold text-[#102033]">
                {formatDate(result.notarized_at)}
              </dd>
            </div>
            <div className="rounded-md bg-[#f7f9fc] p-4">
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#526172]">
                Notarized by
              </dt>
              <dd className="mt-2 break-all text-sm font-bold text-[#102033]">
                {result.notarized_by ?? "Not available"}
              </dd>
            </div>
          </dl>
          <div className="mt-4 rounded-md bg-[#102033] p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-white/50">
              Transaction hash
            </p>
            <p className="mt-2 break-all font-mono text-sm font-semibold text-white">
              {formatHash(result.tx_hash)}
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
