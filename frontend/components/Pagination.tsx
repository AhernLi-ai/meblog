import clsx from 'clsx';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex justify-center gap-2 mt-8">
      {/* Previous */}
      <button
        onClick={() => onPageChange(Math.max(1, Math.min(currentPage - 1, totalPages)))}
        disabled={currentPage === 1}
        className={clsx(
          'px-3 py-2 rounded-[8px] text-sm',
          currentPage === 1
            ? 'text-[var(--color-foreground-secondary)] cursor-not-allowed opacity-50'
            : 'text-[var(--color-foreground)] hover:bg-[var(--color-background-secondary)]'
        )}
      >
        上一页
      </button>

      {/* Page numbers */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={clsx(
            'w-10 h-10 rounded-[8px] text-sm',
            page === currentPage
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--color-foreground)] hover:bg-[var(--color-background-secondary)]'
          )}
        >
          {page}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => onPageChange(Math.max(1, Math.min(currentPage + 1, totalPages)))}
        disabled={currentPage === totalPages}
        className={clsx(
          'px-3 py-2 rounded-[8px] text-sm',
          currentPage === totalPages
            ? 'text-[var(--color-foreground-secondary)] cursor-not-allowed opacity-50'
            : 'text-[var(--color-foreground)] hover:bg-[var(--color-background-secondary)]'
        )}
      >
        下一页
      </button>
    </nav>
  );
}
