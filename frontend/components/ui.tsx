import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-content px-5 sm:px-8 lg:px-10 ${className}`}>{children}</div>;
}

export function Rule({ className = "" }: { className?: string }) {
  return <hr className={`border-0 border-t border-line ${className}`} />;
}

export function SectionTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`text-h2 text-text ${className}`}>{children}</h2>;
}

export function Tabs({ items, active = 0 }: { items: string[]; active?: number }) {
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-3 border-b border-line pb-0">
      {items.map((item, i) => (
        <span
          key={item}
          className={`relative pb-4 text-ui ${
            i === active ? "text-text after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent-2" : "text-muted"
          }`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
