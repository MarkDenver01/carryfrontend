import { useState, useEffect, useMemo } from "react";
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
import Swal from "sweetalert2";
import { getAllProductsWithRecommendations } from "../../libs/ApiGatewayDatasource";
import type { ProductDTO } from "../../libs/models/product/ProductDTO";
import type { ProductRecommendedDTO } from "../../libs/models/product/ProductRecommendedDTO";

/* Frontend-friendly types */
interface ProductRecommended {
  productRecommendedId: number;
  productCode: string;
  productName: string;
  productDescription: string;
  productSize: string;
  productImgUrl: string;
  expiryDate?: string | null;
  createdDate?: string | null;
}

interface Product {
  image: string;
  code: string;
  name: string;
  description: string;
  size: string;
  stock: number;
  expiryDate?: string | null;
  inDate?: string | null;
  status: "Available" | "Not Available";
  recommendations?: ProductRecommended[];
}

/* Helper to format ISO date-ish strings safely */
const formatDate = (d?: string | null) => {
  if (!d) return "";
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return d; // fallback to raw string
  return parsed.toLocaleDateString();
};

export default function ProductInventoryTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | Product["status"]>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
  const [selectedRecommendations, setSelectedRecommendations] = useState<ProductRecommended[]>([]);

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

  const [editProduct, setEditProduct] = useState<Product>({ ...newProduct });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        const data: ProductDTO[] = await getAllProductsWithRecommendations();

        // map backend DTO to frontend-friendly Product
        const mapped: Product[] = data.map((p) => ({
          image: p.productImgUrl ?? "",
          code: p.productCode ?? "",
          name: p.productName ?? "",
          description: p.productDescription ?? "",
          size: p.productSize ?? "",
          stock: p.stocks ?? 0,
          expiryDate: p.expiryDate ? formatDate(p.expiryDate) : "",
          inDate: p.productInDate ? formatDate(p.productInDate) : "",
          status: (p.productStatus ?? "").toLowerCase() === "available" ? "Available" : "Not Available",
          recommendations: (p.recommendations ?? []).map((r: ProductRecommendedDTO) => ({
            productRecommendedId: r.productRecommendedId,
            productCode: r.productCode,
            productName: r.productName,
            productDescription: r.productDescription,
            productSize: r.productSize,
            productImgUrl: r.productImgUrl,
            expiryDate: r.expiryDate ? formatDate(r.expiryDate) : "",
            createdDate: r.createdDate ? formatDate(r.createdDate) : "",
          })),
        }));

        if (!mounted) return;
        setProducts(mapped);
      } catch (err: any) {
        Swal.fire("Error", err?.message || "Failed to load products", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAddProduct = () => {
    setProducts((prev) => [...prev, newProduct]);
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
      setProducts((prev) => {
        const copy = [...prev];
        copy[selectedProductIndex] = editProduct;
        return copy;
      });
      setIsEditModalOpen(false);
    }
  };

  const toggleAvailability = (index: number) => {
    setProducts((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        status: copy[index].status === "Available" ? "Not Available" : "Available",
      };
      return copy;
    });
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

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  if (loading) {
    return <div className="text-center p-6 text-gray-500">Loading products...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md overflow-x-auto">
      {/* Header */}
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
            <DropdownItem onClick={() => setStatusFilter("Available")}>Available</DropdownItem>
            <DropdownItem onClick={() => setStatusFilter("Not Available")}>Not Available</DropdownItem>
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
                <td className="p-3 border border-gray-300 align-middle">
                  <img src={product.image || "/placeholder.png"} alt={product.name} className="w-12 h-12 rounded-md object-cover" />
                </td>
                <td className="p-3 border border-gray-300 align-middle">{product.code}</td>
                <td className="p-3 border border-gray-300 align-middle font-medium">{product.name}</td>
                <td className="p-3 border border-gray-300 align-middle">{product.description}</td>
                <td className="p-3 border border-gray-300 align-middle">{product.size}</td>
                <td className="p-3 border border-gray-300 align-middle">{product.stock}</td>
                <td className="p-3 border border-gray-300 align-middle">{product.expiryDate}</td>
                <td className="p-3 border border-gray-300 align-middle">{product.inDate}</td>
                <td className={`p-3 border border-gray-300 align-middle font-semibold ${product.status === "Available" ? "text-green-600" : "text-red-600"}`}>{product.status}</td>
                <td className="p-3 border border-gray-300 align-middle">
                  <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                    <button
                      className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-yellow-500 hover:bg-yellow-600 rounded-md"
                      onClick={() => {
                        const realIndex = (currentPage - 1) * itemsPerPage + idx;
                        setSelectedProductIndex(realIndex);
                        setEditProduct({ ...product });
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" /> Update
                    </button>

                    <button
                      className={`flex items-center gap-1 px-3 py-1 text-xs text-white rounded-md ${product.status === "Available" ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}`}
                      onClick={() => toggleAvailability((currentPage - 1) * itemsPerPage + idx)}
                    >
                      {product.status === "Available" ? (<><XCircle className="w-4 h-4" /> Not Available</>) : (<><CheckCircle className="w-4 h-4" /> Available</>)}
                    </button>

                    <button
                      className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                      onClick={() => {
                        const target = paginatedProducts[idx];
                        setSelectedRecommendations(target.recommendations ?? []);
                        setIsViewModalOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" /> View Recommended
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={10} className="text-center py-4 text-gray-500 border border-gray-300">No products found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>Previous</button>
          <span className="text-sm text-gray-600 mt-1">Page {currentPage} of {totalPages}</span>
          <button className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50" disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>Next</button>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition">+ Add Product</Button>
      </div>

      {/* View Recommended Modal */}
      <Modal show={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
        <ModalHeader>Recommended Products</ModalHeader>
        <ModalBody>
          {selectedRecommendations.length > 0 ? (
            <ul className="space-y-3">
              {selectedRecommendations.map((rec, index) => (
                <li key={index} className="flex items-center gap-3">
                  <img src={rec.productImgUrl || "/placeholder.png"} alt={rec.productName} className="w-12 h-12 rounded" />
                  <div>
                    <p className="font-medium">{rec.productName}</p>
                    <p className="text-sm text-gray-600">{rec.productDescription}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recommendations available.</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={() => setIsViewModalOpen(false)}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
