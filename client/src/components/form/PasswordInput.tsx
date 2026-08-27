"use client";

import {
  type InputHTMLAttributes,
  type ReactNode,
  useId,
  useState,
} from "react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  hideLabel?: string;
  revealLabel?: string;
};

function EyeIcon({ isVisible }: { isVisible: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {isVisible ? (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.5 5.2A9.5 9.5 0 0 1 12 5c5 0 8.5 4.5 9.5 7a13.6 13.6 0 0 1-2.6 3.8" />
          <path d="M6.1 6.9A13.7 13.7 0 0 0 2.5 12c1 2.5 4.5 7 9.5 7a9.6 9.6 0 0 0 4.1-.9" />
        </>
      ) : (
        <>
          <path d="M2.5 12c1-2.5 4.5-7 9.5-7s8.5 4.5 9.5 7c-1 2.5-4.5 7-9.5 7s-8.5-4.5-9.5-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

export default function PasswordInput({
  className = "",
  hideLabel = "Hide password",
  id,
  label,
  revealLabel = "Show password",
  ...props
}: PasswordInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <label className="mb-2 block" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          id={inputId}
          type={isVisible ? "text" : "password"}
          className={`w-full border border-border-light bg-transparent p-3 pe-12 dark:border-border-subtle ${className}`}
        />
        <button
          type="button"
          aria-label={isVisible ? hideLabel : revealLabel}
          title={isVisible ? hideLabel : revealLabel}
          onClick={() => setIsVisible((current) => !current)}
          className="absolute inset-y-0 end-0 flex w-12 items-center justify-center text-fg-muted transition-colors hover:text-fg-secondary"
        >
          <EyeIcon isVisible={isVisible} />
        </button>
      </div>
    </div>
  );
}
