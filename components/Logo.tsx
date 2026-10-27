export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="#06392F" />
      <path d="M10 12h20L10 28h20" fill="none" stroke="#F2EFE6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
