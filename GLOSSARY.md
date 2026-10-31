# LexChain

Shared project language for document preparation, filing and verification, and the relationship between the user-facing application and its separately hosted service.

## Language

**LexChain frontend/backend boundary**:
The frontend owns the user interface, while the separate backend service owns authoritative data and business operations. The frontend consumes those operations through the backend API; backend source is not part of the frontend application.

**Document**:
A record representing one legal document throughout preparation, signing, filing and finalization. Its working draft and signed copies belong to that same record.
_Avoid_: Using document to mean only the Google draft or only an uploaded file.

**Working draft**:
The Google Docs document used to prepare a legal document and collect client comments before paper signing and notarization.
_Avoid_: Signed copy.

**Ready for signature**:
The preparation stage in which the working draft is ready for paper signing and notarization, and clients have read-only access until the lawyer reopens preparation.
_Avoid_: Finalized, signed.

**Signed copy**:
The scanned PDF of the signed and notarized legal document. Replaced copies remain part of the document's history.
_Avoid_: Working draft, reviewed extraction.

**Finalization**:
The operation that freezes the signed copy and records its fingerprint for later verification. Subsequent text processing does not change that signed-copy fingerprint.
_Avoid_: OCR approval, completion of processing.

**Document lifecycle**:
The legal document's stage: preparing, ready for signature, signed, finalized or cancelled.
_Avoid_: Processing status.

**Processing status**:
The progress of text extraction, review and enrichment after finalization. Processing may fail even when the signed document has been successfully finalized.
_Avoid_: Document lifecycle, finalization result.

**Register book**:
The book in which a signed document is filed with its document and page numbers. An open book can allocate the next entry; filing in a closed book requires the paper register numbers.

**Accepted invitation**:
A document-sharing invitation the recipient has accepted, granting the document access permitted by that invitation. A pending invitation grants no document access.
