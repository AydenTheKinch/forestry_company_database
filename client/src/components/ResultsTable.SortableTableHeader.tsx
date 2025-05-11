import { Contractor } from "../containers/ContractorRegistryData";
import { ChevronDown, ChevronUp}  from 'lucide-react';

interface SortableTableHeaderProps {
  field: keyof Contractor;
  label: string;
  currentSortField: keyof Contractor;
  sortDirection: "asc" | "desc";
  onSort: (field: keyof Contractor) => void;
}

export const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({ 
  field,
  label, 
  currentSortField, 
  sortDirection,
  onSort 
}) => {
  const renderSortIndicator = () => {
    if (currentSortField !== field) return null;
    return sortDirection === "asc" ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />;
  };

  return (
    <th className="px-4 py-3 cursor-pointer" onClick={() => onSort(field)}>
      {label} {renderSortIndicator()}
    </th>
  );
};
