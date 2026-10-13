export function InboxLink({ unread }: { unread: number }) {
  const label = unread
    ? `Avisos, ${unread} sin leer`
    : "Avisos";
  return (
    <a
      href="/privado/avisos"
      className="relative inline-flex size-10 items-center justify-center text-ink hover:text-gilt"
      aria-label={label}
      title={label}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
        <path d="M4 7.5 12 13l8-5.5" />
      </svg>
      {unread > 0 ? (
        <span className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[0.6rem] font-medium leading-4 text-porcelain">
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </a>
  );
}
