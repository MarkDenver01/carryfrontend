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
  productName: string;
  productDescription: string;
  stocks: number;
  productSize: string;
  productStatus: "In Stock" | "Low Stock" | "Out of Stock";
  expiryDate: string;
  productInDate: string;
  productImgUrl: string;
}

const initialProducts: Product[] = [
  {
    productCode: "P001",
    productName: "Milk",
    productDescription: "Fresh cow milk",
    stocks: 25,
    productSize: "1L",
    productStatus: "In Stock",
    expiryDate: "2025-12-01",
    productInDate: "2024-11-01",
    productImgUrl: "/images/milk.jpg",
  },
  {
    productCode: "P002",
    productName: "Bread",
    productDescription: "Wheat bread loaf",
    stocks: 0,
    productSize: "500g",
    productStatus: "Out of Stock",
    expiryDate: "2024-07-10",
    productInDate: "2024-06-10",
    productImgUrl: "/images/bread.jpg",
  },
];

export default function ProductInventoryTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | Product["productStatus"]>("");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);

  const [newProduct, setNewProduct] = useState<Product>({
    productCode: "",
    productName: "",
    productDescription: "",
    stocks: 0,
    productSize: "",
    productStatus: "In Stock",
    expiryDate: "",
    productInDate: "",
    productImgUrl: "",
  });

  const [editProduct, setEditProduct] = useState<Product>({
    productCode: "",
    productName: "",
    productDescription: "",
    stocks: 0,
    productSize: "",
    productStatus: "In Stock",
    expiryDate: "",
    productInDate: "",
    productImgUrl: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleAddProduct = () => {
    setProducts([...products, newProduct]);
    setNewProduct({
      productCode: "",
      productName: "",
      productDescription: "",
      stocks: 0,
      productSize: "",
      productStatus: "In Stock",
      expiryDate: "",
      productInDate: "",
      productImgUrl: "",
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

  const getStatusStyle = (status: Product["productStatus"]) => {
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
    return products.filter((p) => {
      const matchesSearch =
        p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.productCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "" || p.productStatus === statusFilter;
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
            <DropdownItem onClick={() => setStatusFilter("In Stock")}>
              In Stock
            </DropdownItem>
            <DropdownItem onClick={() => setStatusFilter("Low Stock")}>
              Low Stock
            </DropdownItem>
            <DropdownItem onClick={() => setStatusFilter("Out of Stock")}>
              Out of Stock
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <table className="min-w-full border border-gray-300 text-sm text-left text-gray-700">
        <thead className="bg-emerald-600 text-gray-100">
          <tr>
            <th className="p-3 border">Code</th>
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Description</th>
            <th className="p-3 border">Size</th>
            <th className="p-3 border">Stocks</th>
            <th className="p-3 border">Status</th>
            <th className="p-3 border">Expiry</th>
            <th className="p-3 border">Date In</th>
            <th className="p-3 border">Image</th>
            <th className="p-3 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product, idx) => (
              <tr key={idx} className="hover:bg-gray-100">
                <td className="p-3 border">{product.productCode}</td>
                <td className="p-3 border font-medium">{product.productName}</td>
                <td className="p-3 border">{product.productDescription}</td>
                <td className="p-3 border">{product.productSize}</td>
                <td className="p-3 border">{product.stocks}</td>
                <td className="p-3 border">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(
                      product.productStatus
                    )}`}
                  >
                    {product.productStatus}
                  </span>
                </td>
                <td className="p-3 border">{product.expiryDate}</td>
                <td className="p-3 border">{product.productInDate}</td>
                <td className="p-3 border">
                  <img
                    src={product.productImgUrl}
                    alt={product.productName}
                    className="w-10 h-10 object-cover rounded-md"
                  />
                </td>
                <td className="p-3 border flex flex-wrap gap-2">
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
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-red-500 hover:bg-red-600 rounded-md">
                    <XCircle className="w-4 h-4" /> Not Available
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={10} className="text-center py-4 text-gray-500 border">
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

      {/* Add Product Modal */}
      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader>Add New Product</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Label htmlFor="productCode">Product Code</Label>
            <TextInput
              id="productCode"
              value={newProduct.productCode}
              onChange={(e) =>
                setNewProduct({ ...newProduct, productCode: e.target.value })
              }
            />
            <Label htmlFor="productName">Name</Label>
            <TextInput
              id="productName"
              value={newProduct.productName}
              onChange={(e) =>
                setNewProduct({ ...newProduct, productName: e.target.value })
              }
            />
            <Label htmlFor="productDescription">Description</Label>
            <TextInput
              id="productDescription"
              value={newProduct.productDescription}
              onChange={(e) =>
                setNewProduct({ ...newProduct, productDescription: e.target.value })
              }
            />
            <Label htmlFor="productSize">Size</Label>
            <TextInput
              id="productSize"
              value={newProduct.productSize}
              onChange={(e) =>
                setNewProduct({ ...newProduct, productSize: e.target.value })
              }
            />
            <Label htmlFor="stocks">Stocks</Label>
            <TextInput
              id="stocks"
              type="number"
              value={newProduct.stocks}
              onChange={(e) =>
                setNewProduct({ ...newProduct, stocks: parseInt(e.target.value) })
              }
            />
            <Label htmlFor="productStatus">Status</Label>
            <Select
              id="productStatus"
              value={newProduct.productStatus}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  productStatus: e.target.value as Product["productStatus"],
                })
              }
            >
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </Select>
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <TextInput
              id="expiryDate"
              type="date"
              value={newProduct.expiryDate}
              onChange={(e) =>
                setNewProduct({ ...newProduct, expiryDate: e.target.value })
              }
            />
            <Label htmlFor="productInDate">Product In Date</Label>
            <TextInput
              id="productInDate"
              type="date"
              value={newProduct.productInDate}
              onChange={(e) =>
                setNewProduct({ ...newProduct, productInDate: e.target.value })
              }
            />
            <Label htmlFor="productImgUrl">Image URL</Label>
            <TextInput
              id="productImgUrl"
              value={newProduct.productImgUrl}
              onChange={(e) =>
                setNewProduct({ ...newProduct, productImgUrl: e.target.value })
              }
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleAddProduct} className="bg-green-700 hover:bg-green-800">
            Add Product
          </Button>
          <Button color="failure" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalHeader>Edit Product</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Label htmlFor="editProductName">Name</Label>
            <TextInput
              id="editProductName"
              value={editProduct.productName}
              onChange={(e) =>
                setEditProduct({ ...editProduct, productName: e.target.value })
              }
            />
            <Label htmlFor="editStocks">Stocks</Label>
            <TextInput
              id="editStocks"
              type="number"
              value={editProduct.stocks}
              onChange={(e) =>
                setEditProduct({ ...editProduct, stocks: parseInt(e.target.value) })
              }
            />
            <Label htmlFor="editStatus">Status</Label>
            <Select
              id="editStatus"
              value={editProduct.productStatus}
              onChange={(e) =>
                setEditProduct({
                  ...editProduct,
                  productStatus: e.target.value as Product["productStatus"],
                })
              }
            >
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </Select>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleUpdateProduct} className="bg-yellow-600 hover:bg-yellow-700">
            Update Product
          </Button>
          <Button color="gray" onClick={() => setIsEditModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
