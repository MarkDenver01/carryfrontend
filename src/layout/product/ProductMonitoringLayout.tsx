import { useState, useMemo } from "react";
import { Pencil, XCircle } from "lucide-react";
import {
  Dropdown,
  DropdownItem,
  Modal,
  Button,
  Label,
  TextInput,
  Select,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "flowbite-react";

interface Product {
  productCode: string;
  name: string;
  description: string;
  size: string;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  expiryDate: string;
  imgUrl: string;
}

const initialProducts: Product[] = [
  {
    productCode: "PRD-001",
    name: "Milk",
    description: "Fresh whole milk",
    size: "1L",
    stock: 25,
    status: "In Stock",
    expiryDate: "2025-12-01",
    imgUrl: "https://via.placeholder.com/60",
  },
  {
    productCode: "PRD-002",
    name: "Bread",
    description: "Whole grain loaf",
    size: "500g",
    stock: 0,
    status: "Out of Stock",
    expiryDate: "2024-07-10",
    imgUrl: "https://via.placeholder.com/60",
  },
  {
    productCode: "PRD-003",
    name: "Eggs",
    description: "Free range dozen",
    size: "12 pcs",
    stock: 100,
    status: "In Stock",
    expiryDate: "2024-09-15",
    imgUrl: "https://via.placeholder.com/60",
  },
];

export default function ProductInventoryTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | Product["status"]>("");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);

  const [newProduct, setNewProduct] = useState<Product>({
    productCode: "",
    name: "",
    description: "",
    size: "",
    stock: 0,
    status: "In Stock",
    expiryDate: "",
    imgUrl: "",
  });

  const [editProduct, setEditProduct] = useState<Product>({
    productCode: "",
    name: "",
    description: "",
    size: "",
    stock: 0,
    status: "In Stock",
    expiryDate: "",
    imgUrl: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleAddProduct = () => {
    setProducts([...products, newProduct]);
    setNewProduct({
      productCode: "",
      name: "",
      description: "",
      size: "",
      stock: 0,
      status: "In Stock",
      expiryDate: "",
      imgUrl: "",
    });
    setIsModalOpen(false);
  };

  const handleUpdateProduct = () => {
    if (selectedProductIndex !== null) {
      const updated = [...products];
      updated[selectedProductIndex] = editProduct;
      setProducts(updated);
      setIsEditModalOpen(false);
    }
  };

  const getStatusStyle = (status: Product["status"]) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-700";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-700";
      case "Out of Stock":
        return "bg-red-100 text-red-700";
      default:
        return "";
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "" || product.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, products]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Product Inventory Monitoring</h2>
        <div className="flex flex-wrap gap-2 sm:items-center">
          <input
            type="text"
            placeholder="Search Product..."
            value={searchTerm}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchTerm(e.target.value);
            }}
            className="px-3 py-2 text-sm border border-gray-600 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
          <Dropdown
            label={statusFilter || "Filter by Status"}
            color="light"
            className="bg-white border border-gray-600 shadow-md text-sm"
          >
            <DropdownItem onClick={() => setStatusFilter("")}>All</DropdownItem>
            <DropdownItem onClick={() => setStatusFilter("In Stock")}>In Stock</DropdownItem>
            <DropdownItem onClick={() => setStatusFilter("Low Stock")}>Low Stock</DropdownItem>
            <DropdownItem onClick={() => setStatusFilter("Out of Stock")}>Out of Stock</DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* Table */}
      <table className="min-w-full border border-gray-300 text-sm text-left text-gray-700">
        <thead className="bg-emerald-600 text-gray-100">
          <tr>
            <th className="p-3 border border-gray-300 font-medium">Image</th>
            <th className="p-3 border border-gray-300 font-medium">Code</th>
            <th className="p-3 border border-gray-300 font-medium">Product</th>
            <th className="p-3 border border-gray-300 font-medium">Description</th>
            <th className="p-3 border border-gray-300 font-medium">Size</th>
            <th className="p-3 border border-gray-300 font-medium">Stocks</th>
            <th className="p-3 border border-gray-300 font-medium">Status</th>
            <th className="p-3 border border-gray-300 font-medium">Expiry Date</th>
            <th className="p-3 border border-gray-300 font-medium text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product, idx) => (
              <tr
                key={idx}
                className="hover:bg-gray-100 transition duration-150 ease-in-out"
              >
                <td className="p-3 border border-gray-300">
                  <img
                    src={product.imgUrl}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                </td>
                <td className="p-3 border border-gray-300">{product.productCode}</td>
                <td className="p-3 border border-gray-300 font-medium">{product.name}</td>
                <td className="p-3 border border-gray-300">{product.description}</td>
                <td className="p-3 border border-gray-300">{product.size}</td>
                <td className="p-3 border border-gray-300">{product.stock}</td>
                <td className="p-3 border border-gray-300">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(
                      product.status
                    )}`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="p-3 border border-gray-300">{product.expiryDate}</td>
                <td className="p-3 border border-gray-300 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-yellow-500 hover:bg-yellow-600 rounded-md"
                      onClick={() => {
                        setSelectedProductIndex((currentPage - 1) * itemsPerPage + idx);
                        setEditProduct({ ...product });
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" /> Update
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-red-500 hover:bg-red-600 rounded-md">
                      <XCircle className="w-4 h-4" /> Not Available
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={9}
                className="text-center py-4 text-gray-500 border border-gray-300"
              >
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination + Add button */}
      <div className="mt-4 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 mt-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </button>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition"
        >
          + Add Product
        </button>
      </div>
    </div>
  );
}
