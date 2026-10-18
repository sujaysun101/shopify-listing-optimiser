export function Logo({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path
        d="M10.5 16.2c.2-3.3 2.6-5.7 6-5.7 2.1 0 3.6.8 4.6 2"
        fill="none"
        stroke="#fffaf3"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M10.5 16.2c.2 3.3 2.6 5.7 6 5.7 2.1 0 3.6-.8 4.6-2"
        fill="none"
        stroke="#fffaf3"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <circle cx="23.2" cy="10.2" r="2" fill="#f3d2b0" />
    </svg>
  );
}
