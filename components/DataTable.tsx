import React from 'react';

interface DataTableProps {
  data: Record<string, string>[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-slate-500">Không có dữ liệu.</p>;
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col" className="py-3 px-6 whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors duration-200">
              {headers.map((header, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="py-4 px-6">
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
