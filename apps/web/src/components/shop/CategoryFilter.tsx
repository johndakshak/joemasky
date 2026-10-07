import type { Category } from "@/types/category";

type CategoryFilterProps = {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
};

export function CategoryFilter({ categories, selectedId, onSelect }: CategoryFilterProps) {
  const base = "px-5 py-2 text-[0.7rem] tracking-[0.18em] uppercase border transition-colors";
  const active = "bg-gold text-charcoal border-gold";
  const inactive = "border-charcoal/25 text-charcoal hover:border-gold";

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`${base} ${selectedId === null ? active : inactive}`}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.id)}
          className={`${base} ${selectedId === category.id ? active : inactive}`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}