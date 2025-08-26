import { useState, useMemo } from "react";
import { Lightbulb } from "lucide-react";
import { Pagination } from "flowbite-react";

interface Customer {
    name: string;
    email: string;
    phone: string;
    address: string;
    age: number;
    status: "Active" | "Inactive";
}

type SortKey = keyof Customer;
type SortOrder = "asc" | "desc";

const initialData: Customer[] = [
    { name: "Alice Johnson", email: "alice@email.com", phone: "09171234567", address: "Makati", age: 28, status: "Active" },
    { name: "Bob Smith", email: "bob@email.com", phone: "09181234567", address: "Quezon City", age: 34, status: "Inactive" },
    { name: "Carol Reyes", email: "carol@email.com", phone: "09221234567", address: "Pasig", age: 41, status: "Active" },
    { name: "Derek Cruz", email: "derek@email.com", phone: "09191122334", address: "Taguig", age: 30, status: "Active" },
    { name: "Ella Santos", email: "ella@email.com", phone: "09291234567", address: "Manila", age: 26, status: "Inactive" },
    { name: "Felix Gomez", email: "felix@email.com", phone: "09175556666", address: "Cebu", age: 37, status: "Active" },
    { name: "Grace Lee", email: "grace@email.com", phone: "09178889999", address: "Davao", age: 33, status: "Active" },
    { name: "Harry Tan", email: "harry@email.com", phone: "09229998888", address: "Baguio", age: 45, status: "Inactive" },
];

export default function CustomerTable() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<SortKey>("name");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const pageSize = 4;

    const handleSort = (key: SortKey) => {
        if (key === sortBy) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(key);
            setSortOrder("asc");
        }
    };

    const getSortIcon = (key: SortKey) =>
        sortBy === key ? (sortOrder === "asc" ? "↑" : "↓") : "⇅";

    const filteredData = useMemo(() => {
        return initialData.filter((customer) =>
            Object.values(customer).some((value) =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm]);

    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];
            if (typeof aValue === "number" && typeof bValue === "number") {
                return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
            }
            return sortOrder === "asc"
                ? String(aValue).localeCompare(String(bValue))
                : String(bValue).localeCompare(String(aValue));
        });
    }, [filteredData, sortBy, sortOrder]);

    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="p-6 bg-white rounded-lg shadow-md overflow-x-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <h2 className="text-xl font-semibold text-gray-700">
                        Product Rule and Suggestions
                    </h2>
                </div>
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-full sm:w-64 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </div>

            <table className="min-w-full border border-gray-300 text-sm text-left text-gray-700">
                <thead className="bg-emerald-600 text-white">
                <tr>
                    {[
                        ["name", "Customer"],
                        ["email", "Email"],
                        ["phone", "Phone"],
                        ["address", "Address"],
                        ["age", "Age"],
                        ["status", "Status"],
                    ].map(([key, label]) => (
                        <th
                            key={key}
                            className="p-3 border border-gray-300 font-medium cursor-pointer select-none"
                            onClick={() => handleSort(key as SortKey)}
                        >
                            {label} <span className="text-xs">{getSortIcon(key as SortKey)}</span>
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className="bg-gray-50">
                {paginatedData.length > 0 ? (
                    paginatedData.map((customer, idx) => (
                        <tr key={idx} className="hover:bg-emerald-100 transition">
                            <td className="p-3 border border-gray-300 font-medium">{customer.name}</td>
                            <td className="p-3 border border-gray-300">{customer.email}</td>
                            <td className="p-3 border border-gray-300">{customer.phone}</td>
                            <td className="p-3 border border-gray-300">{customer.address}</td>
                            <td className="p-3 border border-gray-300">{customer.age}</td>
                            <td className="p-3 border border-gray-300">
                  <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.status === "Active"
                              ? "text-green-700 bg-green-100"
                              : "text-red-700 bg-red-100"
                      }`}
                  >
                    {customer.status}
                  </span>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={6} className="p-4 text-center text-gray-500 border border-gray-300">
                            No results found.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            {totalPages > 1 && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-6 text-sm text-gray-600">
          <span>
            Showing{" "}
              <span className="font-semibold text-gray-800">
              {(currentPage - 1) * pageSize + 1}
            </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-800">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800">
              {sortedData.length}
            </span>{" "}
              entries
          </span>

                    <div className="flex overflow-x-auto sm:justify-center">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            showIcons
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
