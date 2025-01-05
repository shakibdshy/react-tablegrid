import { cn } from "@/utils/cn";
import { SortDirection } from "@/types/table.types";

interface SortIconProps {
  direction?: SortDirection;
  className?: string;
  active?: boolean;
}

function CaretUp({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.47951 4.02951C7.21352 3.76352 6.78647 3.76352 6.52049 4.02951L3.52049 7.02951C3.25451 7.29549 3.25451 7.72254 3.52049 7.98852C3.78647 8.25451 4.21352 8.25451 4.47951 7.98852L7 5.46803L9.52049 7.98852C9.78647 8.25451 10.2135 8.25451 10.4795 7.98852C10.7455 7.72254 10.7455 7.29549 10.4795 7.02951L7.47951 4.02951Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CaretDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.52049 6.02951C3.25451 6.29549 3.25451 6.72254 3.52049 6.98852L6.52049 9.98852C6.78647 10.2545 7.21352 10.2545 7.47951 9.98852L10.4795 6.98852C10.7455 6.72254 10.7455 6.29549 10.4795 6.02951C10.2135 5.76352 9.78647 5.76352 9.52049 6.02951L7 8.54999L4.47951 6.02951C4.21352 5.76352 3.78647 5.76352 3.52049 6.02951Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SortIcon({
  direction,
  className,
  active = false,
}: SortIconProps) {
  if (!direction) {
    return <CaretDown className={cn("size-5 text-gray-400", className)} />;
  }

  return direction === "asc" ? (
    <CaretUp
      className={cn(
        "size-5",
        active ? "text-current" : "text-gray-400",
        className
      )}
    />
  ) : (
    <CaretDown
      className={cn(
        "size-5",
        active ? "text-current" : "text-gray-400",
        className
      )}
    />
  );
}
