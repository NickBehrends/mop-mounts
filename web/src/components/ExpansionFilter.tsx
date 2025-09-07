import type { Expansion } from '../lib/types';

interface ExpansionFilterProps {
  value: string;
  onChange: (expansion: string) => void;
}

const expansions: Expansion[] = [
  "Classic",
  "The Burning Crusade", 
  "Wrath of the Lich King",
  "Cataclysm",
  "Mists of Pandaria"
];

export default function ExpansionFilter({ value, onChange }: ExpansionFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="expansion-filter"
    >
      <option value="all">All Expansions</option>
      {expansions.map((expansion) => (
        <option key={expansion} value={expansion}>
          {expansion}
        </option>
      ))}
    </select>
  );
}