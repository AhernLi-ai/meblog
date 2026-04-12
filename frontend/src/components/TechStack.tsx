interface TechStackProps {
  tags: string[];
}

// Color palette for tags
const TAG_COLORS = [
  'bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:bg-[var(--color-primary)]/20',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
];

function getTagColor(index: number) {
  return TAG_COLORS[index % TAG_COLORS.length];
}

export default function TechStack({ tags }: TechStackProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {tags.map((tag, index) => (
        <span
          key={index}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 ${getTagColor(index)}`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
