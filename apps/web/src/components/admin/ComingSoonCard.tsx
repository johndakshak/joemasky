interface ComingSoonCardProps {
  title: string;
  description: string;
  items?: string[];
}

/**
 * ComingSoonCard
 *
 * Consistent placeholder for admin sections that are not yet implemented.
 * Reuses the project's existing design tokens and typography classes.
 */
export function ComingSoonCard({ title, description, items }: ComingSoonCardProps) {
  return (
    <div className="p-6 md:p-10">
      <div className="bg-white border border-charcoal/[.06] p-8 max-w-xl">
        <h2
          className="font-bebas tracking-wider text-charcoal mb-3"
          style={{ fontSize: "1.6rem" }}
        >
          {title}
        </h2>
        <p className="font-barlow font-light text-warmgray mb-5" style={{ fontSize: "0.875rem" }}>
          {description}
        </p>
        {items && items.length > 0 && (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item}
                className="font-barlow font-light text-warmgray flex items-start gap-2"
                style={{ fontSize: "0.82rem" }}
              >
                <span style={{ color: "var(--gold)", marginTop: "2px" }}>•</span>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
