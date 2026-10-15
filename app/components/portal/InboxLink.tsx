export function InboxLink({ unread }: { unread: number }) {
  const label = unread
    ? `Avisos, ${unread} sin leer`
    : "Avisos";
  return (
    <a
      href="/privado/avisos"
      className="relative inline-flex min-h-11 items-center gap-2 text-ink hover:text-gilt md:size-10 md:min-h-0 md:justify-center"
      aria-label={label}
      title={label}
    >
      <span className="relative inline-flex">
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
          <span className="absolute -right-1.5 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[0.6rem] font-medium leading-4 text-porcelain">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </span>
      <span className="text-[0.68rem] uppercase tracking-[0.18em] md:sr-only">Avisos</span>
    </a>
  );
}
