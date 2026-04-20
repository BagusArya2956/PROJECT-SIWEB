import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function UserIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="5" y="10" width="14" height="10" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="m3 3 18 18" />
      <path d="M10.6 10.6A2 2 0 0 0 12 16a2 2 0 0 0 1.4-.6" />
      <path d="M9.9 5.1A11.7 11.7 0 0 1 12 5c6.5 0 10 7 10 7a18.3 18.3 0 0 1-3.3 4.4" />
      <path d="M6.2 6.2A18.2 18.2 0 0 0 2 12s3.5 7 10 7c1.3 0 2.5-.2 3.6-.6" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" {...props}>
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  );
}

export function PackageIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="M12 12 4 7.5" />
      <path d="M12 12l8-4.5" />
      <path d="M12 12v9" />
    </svg>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 7h10v8H3z" />
      <path d="M13 10h3l3 3v2h-6z" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="17.5" cy="17.5" r="1.5" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="m12 2.5 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 16.8 6.5 19.7l1-6.2L3 9.1l6.2-.9L12 2.5Z" />
    </svg>
  );
}

export function WalletIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H17a3 3 0 0 1 3 3v7a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 15.5v-7Z" />
      <path d="M4 9h11.5A2.5 2.5 0 0 0 18 6.5V6" />
      <path d="M15.5 13h4.5v3h-4.5a1.5 1.5 0 0 1 0-3Z" />
      <circle cx="16.8" cy="14.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.5 19 5v5.7c0 4.3-2.9 8.3-7 9.8-4.1-1.5-7-5.5-7-9.8V5l7-2.5Z" />
    </svg>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.2 2 5.8 13h4.8L9.8 22 18.2 10.8h-4.9L13.2 2Z" />
    </svg>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.8 12h16.4" />
      <path d="M12 3.5c2.4 2.2 3.8 5.2 3.8 8.5S14.4 18.3 12 20.5c-2.4-2.2-3.8-5.2-3.8-8.5S9.6 5.7 12 3.5Z" />
    </svg>
  );
}

export function DollarCheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 3v18" />
      <path d="M16 7.5c0-1.7-1.8-3-4-3s-4 1.3-4 3 1.8 3 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3" />
      <path d="m17.5 16.5 1.8 1.8 3.2-3.2" />
    </svg>
  );
}

export function HeadsetIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4.5 12a7.5 7.5 0 1 1 15 0" />
      <rect x="3.5" y="11" width="4" height="6.5" rx="2" />
      <rect x="16.5" y="11" width="4" height="6.5" rx="2" />
      <path d="M20.5 17.5c0 2.2-1.8 4-4 4H13" />
      <circle cx="12" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function RocketIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M14 4c3.4.4 5.6 2.6 6 6-2 4.7-5.3 8-10 10-.4-3.4-2.6-5.6-6-6 2-4.7 5.3-8 10-10Z" />
      <circle cx="14.5" cy="9.5" r="1.6" />
      <path d="m8.2 15.8-2.7 2.7" />
      <path d="M5 14c-.2 2.1.3 3.8 1.8 5-1.2-1.5-2.9-2-5-1.8L5 14Z" />
      <path d="m10 7-3.2.3c-1.2.1-2.2 1.1-2.3 2.3L4.2 13" />
    </svg>
  );
}

export function BulbIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M8.5 15.5c-1.8-1.2-3-3.3-3-5.7A6.5 6.5 0 0 1 12 3.5a6.5 6.5 0 0 1 6.5 6.3c0 2.4-1.2 4.5-3 5.7-.7.5-1.1 1.2-1.1 2V18h-4.8v-.5c0-.8-.4-1.5-1.1-2Z" />
      <path d="M9.5 21h5" />
      <path d="M10 18h4" />
    </svg>
  );
}

export function ClipboardIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="6" y="5" width="12" height="15" rx="2.5" />
      <path d="M9 5.5h6" />
      <rect x="9" y="3" width="6" height="4" rx="1.5" />
    </svg>
  );
}

export function HistoryIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3.5 12A8.5 8.5 0 1 0 6 6.1" />
      <path d="M3.5 4.5v4h4" />
      <path d="M12 8.5v4l2.8 1.8" />
    </svg>
  );
}

export function PrinterIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M7 8V4h10v4" />
      <rect x="4" y="9" width="16" height="8" rx="2.5" />
      <rect x="7" y="14" width="10" height="6" rx="1.5" />
      <path d="M17 12h.01" />
    </svg>
  );
}

export function ChatBubbleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M6.5 18.5 4 20v-4A6.5 6.5 0 0 1 4.5 3h15A1.5 1.5 0 0 1 21 4.5v9A5.5 5.5 0 0 1 15.5 19h-9Z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </svg>
  );
}

export function MoneyIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3.5" y="6" width="17" height="12" rx="2.5" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M7 9.5h.01" />
      <path d="M17 14.5h.01" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" />
      <path d="M8 3.5v4" />
      <path d="M16 3.5v4" />
      <path d="M4 9.5h16" />
      <path d="M8 13h.01" />
      <path d="M12 13h.01" />
      <path d="M16 13h.01" />
      <path d="M8 16.5h.01" />
      <path d="M12 16.5h.01" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M5.5 4.5h4l1.2 4.2-2.1 1.5a14 14 0 0 0 5.2 5.2l1.5-2.1 4.2 1.2v4c0 .8-.7 1.5-1.5 1.5C11 20 4 13 4 6c0-.8.7-1.5 1.5-1.5Z" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4.5 7 7.5 6L19.5 7" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 21s6-5.6 6-10a6 6 0 1 0-12 0c0 4.4 6 10 6 10Z" />
      <circle cx="12" cy="11" r="2.3" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.8v4.6l3.2 1.8" />
    </svg>
  );
}
