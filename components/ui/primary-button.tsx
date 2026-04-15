import type { ButtonHTMLAttributes, ReactNode } from "react";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
};

export function PrimaryButton({
  children,
  className = "",
  icon,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      className={`inline-flex h-14 items-center justify-center rounded-full bg-shipin-deep px-7 text-sm font-semibold text-white shadow-soft hover:-translate-y-0.5 hover:bg-[#12572f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shipin-deep disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      {...props}
    >
      <span>{children}</span>
      {icon ? <span className="ml-2">{icon}</span> : null}
    </button>
  );
}
