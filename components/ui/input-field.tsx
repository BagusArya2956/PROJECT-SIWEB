"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
  trailing?: ReactNode;
};

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField(
  { icon, trailing, className = "", ...props },
  ref
) {
  return (
    <div className="flex h-14 items-center rounded-full border border-[#ebede5] bg-[#f8f9f2] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      {icon ? <span className="mr-3 text-[#8c9387]">{icon}</span> : null}
      <input
        ref={ref}
        className={`h-full w-full bg-transparent text-sm text-shipin-ink outline-none placeholder:text-[#b8beb4] ${className}`}
        {...props}
      />
      {trailing ? <span className="ml-3 text-[#8c9387]">{trailing}</span> : null}
    </div>
  );
});
