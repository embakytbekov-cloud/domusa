interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button type="button" className={`chip${active ? " is-active" : ""}`} onClick={onClick}>
      {label}
    </button>
  );
}
