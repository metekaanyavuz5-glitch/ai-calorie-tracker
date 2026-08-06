"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { UploadCloud, Camera, ImageUp, X } from "lucide-react";

export default function PhotoUploader({
  previewUrl,
  onFileSelected,
  onOpenCamera,
  onClear,
  disabled,
}: {
  previewUrl: string | null;
  onFileSelected: (file: File) => void;
  onOpenCamera: () => void;
  onClear?: () => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file && file.type.startsWith("image/")) {
      onFileSelected(file);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(event.dataTransfer.files);
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Upload Meal Photo</p>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !previewUrl && !disabled && inputRef.current?.click()}
        className={`group relative flex min-h-[168px] flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed p-4 text-center transition ${
          previewUrl ? "border-solid border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5" : ""
        } ${
          isDragging
            ? "border-indigo-400 bg-indigo-50/70 dark:border-indigo-400/50 dark:bg-indigo-500/10"
            : !previewUrl
              ? "cursor-pointer border-slate-300 hover:border-indigo-300 hover:bg-slate-50 dark:border-white/15 dark:hover:border-indigo-400/40 dark:hover:bg-white/5"
              : ""
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        {previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Meal preview" className="max-h-48 w-full rounded-lg object-contain" />
            {onClear && !disabled && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onClear();
                }}
                aria-label="Remove photo"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/70 text-white backdrop-blur transition hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            )}
          </>
        ) : (
          <>
            <span
              className={`mb-2 flex h-11 w-11 items-center justify-center rounded-full border transition ${
                isDragging
                  ? "border-indigo-200 bg-indigo-100 text-indigo-600 dark:border-indigo-400/30 dark:bg-indigo-500/20 dark:text-indigo-300"
                  : "border-indigo-100 bg-indigo-50/60 text-indigo-400 group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-indigo-300/70"
              }`}
            >
              <UploadCloud className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </span>
            <p className="text-sm text-slate-500 dark:text-slate-400">Drag &amp; drop your image here</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">JPG, PNG up to 10MB</p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event: ChangeEvent<HTMLInputElement>) => handleFiles(event.target.files)}
      />
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
        >
          <ImageUp className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          Upload Image
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onOpenCamera}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
        >
          <Camera className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          Take Photo
        </button>
      </div>
    </div>
  );
}
