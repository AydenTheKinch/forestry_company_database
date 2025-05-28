import { Contractor } from "../types/ContractorRegistryData";
import { SortableTableHeader } from "./ResultsTable.SortableTableHeader";
import { ExternalLink, MapPin } from "lucide-react";

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
              <th className="px-4 py-3">Operations</th>
              <th className="px-4 py-3">Equipment</th>
              <th className="px-4 py-3">Models</th>
              <SortableTableHeader 
                field="city"
                label="City"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader 
                field="region"
                label="Region"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <th className="px-4 py-3">Website</th>
              <th className="px-4 py-3">Telephone</th>
              <th className="px-4 py-3">Address</th>
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
                        className="font-medium text-left hover:text-blue-600 hover:underline"
                      >
                        {contractor.companyName}
                      </button>
                    ) : (
                      <span className="font-medium">{contractor.companyName}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {contractor.operations.length > 0 ? (
                      <ul className="list-disc pl-4">
                        {contractor.operations.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    {contractor.equipment.length > 0 ? (
                      <ul className="list-disc pl-4">
                        {contractor.equipment.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    {contractor.models.length > 0 ? (
                      <ul className="list-disc pl-4">
                        {contractor.models.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : "N/A"}
                  </td>
                  <td className="px-4 py-3 font-medium">{contractor.city}</td>
                  <td className="px-4 py-3 font-medium">{contractor.region}</td>
                  <td className="px-4 py-3">
                    {contractor.website ? (
                      <a href={contractor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                        Visit <ExternalLink className="ml-1 w-4 h-4" />
                      </a>
                    ) : "N/A"}
                  </td>
                  <td className="px-4 py-3 font-medium">{contractor.phone}</td>
                  <td className="px-4 py-3 font-medium">{contractor.address}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};