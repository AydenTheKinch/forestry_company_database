import { Contractor } from "../containers/ContractorRegistryData";
import { SortableTableHeader } from "./ResultsTable.SortableTableHeader";
import { ExternalLink } from "lucide-react";

interface ResultsTableProps {
  filteredData: Contractor[];
  sortField: keyof Contractor;
  sortDirection: "asc" | "desc";
  handleSort: (field: keyof Contractor) => void;
  handleCityClick: (contractor: Contractor) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  filteredData,
  sortField,
  sortDirection,
  handleSort,
  handleCityClick
}) => {
  return (
    <div className="results-container">
      <h2 className="text-xl font-bold p-4 border-b">Search Results ({filteredData.length} contractors found)</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <SortableTableHeader 
                field="companyName"
                label="Contractor Name"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader 
                field="city"
                label="City"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Operations</th>
              <SortableTableHeader 
                field="size"
                label="Size"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <th className="px-4 py-3">Website</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-4 text-center text-gray-500">No results found</td>
              </tr>
            ) : (
              filteredData.map(contractor => (
                <tr key={contractor.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {contractor.lat && contractor.lon ? (
                      <button
                        onClick={() => handleCityClick(contractor)}
                        className="text-blue-600 hover:underline cursor-pointer"
                        title="Click to view on map"
                      >
                        {contractor.companyName}
                      </button>
                    ) : "N/A"
                  }
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {contractor.city}
                  </td>
                  <td className="px-4 py-3 font-medium">{contractor.status}</td>
                  <td className="px-4 py-3">
                    {contractor.operations.length > 0 ? (
                      <ul className="list-disc pl-4">
                        {contractor.operations.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : "N/A"}
                  </td>
                  <td className="px-4 py-3">{contractor.size}</td>
                  <td className="px-4 py-3">
                    {contractor.website ? (
                      <a href={contractor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                        Visit <ExternalLink className="ml-1 w-4 h-4" />
                      </a>
                    ) : "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};