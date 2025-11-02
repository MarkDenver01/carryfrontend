import { useState, useMemo } from "react";
import { Pencil, Eye, XCircle, CheckCircle } from "lucide-react";
import {
  Dropdown,
  DropdownItem,
  Modal,
  Button,
  Label,
  TextInput,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "flowbite-react";

interface Product {
  image: string;
  code: string;
  name: string;
  description: string;
  size: string;
  stock: number;
  expiryDate: string;
  inDate: string;
  status: "Available" | "Not Available";
}

const initialProducts: Product[] = [
  {
    image: "https://via.placeholder.com/80",
    code: "PRD001",
    name: "Milk",
    description: "Fresh dairy milk",
    size: "1L",
    stock: 25,
    expiryDate: "2025-12-01",
    inDate: "2024-11-02",
    status: "Available",
  },
  {
    image: "https://via.placeholder.com/80",
    code: "PRD002",
    name: "Bread",
    description: "Whole wheat bread",
    size: "Large",
    stock: 0,
    expiryDate: "2024-07-10",
    inDate: "2024-06-15",
    status: "Not Available",
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
    image: "",
    code: "",
    name: "",
    description: "",
    size: "",
    stock: 0,
    expiryDate: "",
    inDate: "",
    status: "Available",
  });
  const [editProduct, setEditProduct] = useState<Product>({
    image: "",
    code: "",
    name: "",
    description: "",
    size: "",
    stock: 0,
    expiryDate: "",
    inDate: "",
    status: "Available",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleAddProduct = () => {
    setProducts([...products, newProduct]);
    setNewProduct({
      image: "",
      code: "",
      name: "",
      description: "",
      size: "",
      stock: 0,
      expiryDate: "",
      inDate: "",
      status: "Available",
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

  const toggleAvailability = (index: number) => {
    const updated = [...products];
    updated[index].status =
      updated[index].status === "Available" ? "Not Available" : "Available";
    setProducts(updated);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase());
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold text-gray-700">
          Product Inventory Monitoring
        </h2>
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
            <DropdownItem onClick={() => setStatusFilter("Available")}>
              Available
            </DropdownItem>
            <DropdownItem onClick={() => setStatusFilter("Not Available")}>
              Not Available
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* Table */}
      <table className="min-w-full border border-gray-300 text-sm text-left text-gray-700">
        <thead className="bg-emerald-600 text-gray-100">
          <tr>
            <th className="p-3 border border-gray-300 font-medium">Image</th>
            <th className="p-3 border border-gray-300 font-medium">Code</th>
            <th className="p-3 border border-gray-300 font-medium">Name</th>
            <th className="p-3 border border-gray-300 font-medium">Description</th>
            <th className="p-3 border border-gray-300 font-medium">Size</th>
            <th className="p-3 border border-gray-300 font-medium">Stocks</th>
            <th className="p-3 border border-gray-300 font-medium">Expiry Date</th>
            <th className="p-3 border border-gray-300 font-medium">In Date</th>
            <th className="p-3 border border-gray-300 font-medium">Status</th>
            <th className="p-3 border border-gray-300 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product, idx) => (
              <tr key={idx} className="hover:bg-gray-100">
                <td className="p-3 border border-gray-300">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                </td>
                <td className="p-3 border border-gray-300">{product.code}</td>
                <td className="p-3 border border-gray-300 font-medium">
                  {product.name}
                </td>
                <td className="p-3 border border-gray-300">
                  {product.description}
                </td>
                <td className="p-3 border border-gray-300">{product.size}</td>
                <td className="p-3 border border-gray-300">{product.stock}</td>
                <td className="p-3 border border-gray-300">{product.expiryDate}</td>
                <td className="p-3 border border-gray-300">{product.inDate}</td>
                <td
                  className={`p-3 border border-gray-300 font-semibold ${
                    product.status === "Available"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {product.status}
                </td>
                <td className="p-3 border border-gray-300 flex flex-wrap gap-2">
                  <button
                    className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-yellow-500 hover:bg-yellow-600 rounded-md"
                    onClick={() => {
                      setSelectedProductIndex(
                        (currentPage - 1) * itemsPerPage + idx
                      );
                      setEditProduct({ ...product });
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" /> Update
                  </button>

                  <button
                    className={`flex items-center gap-1 px-3 py-1 text-xs text-white rounded-md ${
                      product.status === "Available"
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                    onClick={() =>
                      toggleAvailability(
                        (currentPage - 1) * itemsPerPage + idx
                      )
                    }
                  >
                    {product.status === "Available" ? (
                      <>
                        <XCircle className="w-4 h-4" /> Not Available
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" /> Available
                      </>
                    )}
                  </button>

                  <button className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                    <Eye className="w-4 h-4" /> View Recommended
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={10}
                className="text-center py-4 text-gray-500 border border-gray-300"
              >
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
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
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
          >
            Next
          </button>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition"
        >
          + Add Product
        </Button>
      </div>

      {/* Add Product Modal */}
      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader>Add New Product</ModalHeader>
        <ModalBody>
          <div className="space-y-3">
            <Label htmlFor="image">Image URL</Label>
            <TextInput
              id="image"
              value={newProduct.image}
              onChange={(e) =>
                setNewProduct({ ...newProduct, image: e.target.value })
              }
            />
            <Label htmlFor="code">Product Code</Label>
            <TextInput
              id="code"
              value={newProduct.code}
              onChange={(e) =>
                setNewProduct({ ...newProduct, code: e.target.value })
              }
            />
            <Label htmlFor="name">Product Name</Label>
            <TextInput
              id="name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
            <Label htmlFor="desc">Description</Label>
            <TextInput
              id="desc"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
            />
            <Label htmlFor="size">Size</Label>
            <TextInput
              id="size"
              value={newProduct.size}
              onChange={(e) =>
                setNewProduct({ ...newProduct, size: e.target.value })
              }
            />
            <Label htmlFor="stock">Stocks</Label>
            <TextInput
              id="stock"
              type="number"
              value={newProduct.stock}
              onChange={(e) =>
                setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })
              }
            />
            <Label htmlFor="expiry">Expiry Date</Label>
            <TextInput
              id="expiry"
              type="date"
              value={newProduct.expiryDate}
              onChange={(e) =>
                setNewProduct({ ...newProduct, expiryDate: e.target.value })
              }
            />
            <Label htmlFor="inDate">In Date</Label>
            <TextInput
              id="inDate"
              type="date"
              value={newProduct.inDate}
              onChange={(e) =>
                setNewProduct({ ...newProduct, inDate: e.target.value })
              }
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="success" onClick={handleAddProduct}>
            Add Product
          </Button>
          <Button color="gray" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalHeader>Update Product</ModalHeader>
        <ModalBody>
          <div className="space-y-3">
            <Label htmlFor="editName">Product Name</Label>
            <TextInput
              id="editName"
              value={editProduct.name}
              onChange={(e) =>
                setEditProduct({ ...editProduct, name: e.target.value })
              }
            />
            <Label htmlFor="editDescription">Description</Label>
            <TextInput
              id="editDescription"
              value={editProduct.description}
              onChange={(e) =>
                setEditProduct({ ...editProduct, description: e.target.value })
              }
            />
            <Label htmlFor="editStock">Stocks</Label>
            <TextInput
              id="editStock"
              type="number"
              value={editProduct.stock}
              onChange={(e) =>
                setEditProduct({
                  ...editProduct,
                  stock: parseInt(e.target.value),
                })
              }
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="warning" onClick={handleUpdateProduct}>
            Update
          </Button>
          <Button color="gray" onClick={() => setIsEditModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
