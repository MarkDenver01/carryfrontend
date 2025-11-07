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
  Select,
} from "flowbite-react";
import Swal from "sweetalert2";
import {
  getAllProductsWithRecommendations,
  addProduct,
  updateProduct,
  deleteProduct
} from "../../libs/ApiGatewayDatasource";
import type { ProductDTO, ProductRecommendedDTO, ProductRequest } from "../../libs/models/product/Product";

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
  id?: number; // <-- keep productId for update
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
  return parsed.toISOString().split("T")[0]; // use YYYY-MM-DD for date inputs and display
};

export default function old() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | Product["status"]>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
  const [selectedRecommendations, setSelectedRecommendations] = useState<ProductRecommended[]>([]);

  // New product form state
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

  // Edit product state including id
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
  const [editProductId, setEditProductId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch products on mount
  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        const data: ProductDTO[] = await getAllProductsWithRecommendations();
        const mapped: Product[] = data.map((p) => ({
          id: p.productId as number,
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

  /* --- API helpers: assemble ProductRequest from frontend Product --- */
  const toProductRequest = (p: Product): ProductRequest => ({
    productCode: p.code,
    productName: p.name,
    productDescription: p.description,
    stocks: Number(p.stock ?? 0),
    productSize: p.size,
    productStatus: p.status,
    productImgUrl: p.image,
    expiryDate: p.expiryDate ? new Date(p.expiryDate).toISOString() : null,
    productInDate: p.inDate ? new Date(p.inDate).toISOString() : null,
  });

  /* ---- Add product (calls backend) ---- */
  const handleAddProduct = async () => {
    try {
      // basic validation
      if (!newProduct.code || !newProduct.name) {
        Swal.fire("Validation", "Product code and name are required.", "warning");
        return;
      }
      const payload = toProductRequest(newProduct);
      const added = await addProduct(payload); // returns ProductDTO

      // map returned DTO to frontend Product and insert into state (prepend)
      const mapped: Product = {
        id: added.productId as number,
        image: added.productImgUrl ?? "",
        code: added.productCode ?? "",
        name: added.productName ?? "",
        description: added.productDescription ?? "",
        size: added.productSize ?? "",
        stock: added.stocks ?? 0,
        expiryDate: added.expiryDate ? formatDate(added.expiryDate) : "",
        inDate: added.productInDate ? formatDate(added.productInDate) : "",
        status: (added.productStatus ?? "").toLowerCase() === "available" ? "Available" : "Not Available",
        recommendations: added.recommendations?.map((r) => ({
          productRecommendedId: r.productRecommendedId,
          productCode: r.productCode,
          productName: r.productName,
          productDescription: r.productDescription,
          productSize: r.productSize,
          productImgUrl: r.productImgUrl,
          expiryDate: r.expiryDate ? formatDate(r.expiryDate) : "",
          createdDate: r.createdDate ? formatDate(r.createdDate) : "",
        })) ?? [],
      };

      setProducts((prev) => [mapped, ...prev]);
      setIsModalOpen(false);
      // reset form
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
      Swal.fire("Success", "Product added successfully", "success");
    } catch (err: any) {
      Swal.fire("Error", err?.message || "Failed to add product", "error");
    }
  };

  /* ---- Open edit modal (prefill) ---- */
  const openEditModal = (realIndex: number) => {
    const p = products[realIndex];
    if (!p) return;
    setEditProduct({
      id: p.id,
      image: p.image,
      code: p.code,
      name: p.name,
      description: p.description,
      size: p.size,
      stock: p.stock,
      expiryDate: p.expiryDate ?? "",
      inDate: p.inDate ?? "",
      status: p.status,
      recommendations: p.recommendations,
    });
    setEditProductId(p.id ?? null);
    setSelectedProductIndex(realIndex);
    setIsEditModalOpen(true);
  };

  /* ---- Update product (calls backend) ---- */
  const handleUpdateProduct = async () => {
    try {
      if (!editProductId) {
        Swal.fire("Error", "No product selected to update.", "error");
        return;
      }
      const payload = toProductRequest(editProduct);
      const updatedDto = await updateProduct(editProductId, payload);

      const updatedMapped: Product = {
        id: updatedDto.productId as number,
        image: updatedDto.productImgUrl ?? "",
        code: updatedDto.productCode ?? "",
        name: updatedDto.productName ?? "",
        description: updatedDto.productDescription ?? "",
        size: updatedDto.productSize ?? "",
        stock: updatedDto.stocks ?? 0,
        expiryDate: updatedDto.expiryDate ? formatDate(updatedDto.expiryDate) : "",
        inDate: updatedDto.productInDate ? formatDate(updatedDto.productInDate) : "",
        status: (updatedDto.productStatus ?? "").toLowerCase() === "available" ? "Available" : "Not Available",
        recommendations: updatedDto.recommendations?.map((r) => ({
          productRecommendedId: r.productRecommendedId,
          productCode: r.productCode,
          productName: r.productName,
          productDescription: r.productDescription,
          productSize: r.productSize,
          productImgUrl: r.productImgUrl,
          expiryDate: r.expiryDate ? formatDate(r.expiryDate) : "",
          createdDate: r.createdDate ? formatDate(r.createdDate) : "",
        })) ?? [],
      };

      // update in state
      setProducts((prev) => {
        const copy = [...prev];
        if (selectedProductIndex !== null) {
          copy[selectedProductIndex] = updatedMapped;
        } else {
          // fallback: find by id
          const idx = copy.findIndex((x) => x.id === updatedMapped.id);
          if (idx >= 0) copy[idx] = updatedMapped;
        }
        return copy;
      });

      setIsEditModalOpen(false);
      Swal.fire("Success", "Product updated successfully", "success");
    } catch (err: any) {
      Swal.fire("Error", err?.message || "Failed to update product", "error");
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

  /* ---- Delete product (calls backend) ---- */
const handleDeleteProduct = async (productId: number) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });

  if (!result.isConfirmed) return;

  try {
    await deleteProduct(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    Swal.fire("Deleted!", "Product has been deleted.", "success");
  } catch (err: any) {
    Swal.fire("Error", err?.message || "Failed to delete product", "error");
  }
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
          <Dropdown label={statusFilter || "Filter by Status"} color="light" className="bg-white border border-gray-600 shadow-md text-sm">
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
                    <button className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-yellow-500 hover:bg-yellow-600 rounded-md"
                      onClick={() => {
                        const realIndex = (currentPage - 1) * itemsPerPage + idx;
                        openEditModal(realIndex);
                      }}>
                      <Pencil className="w-4 h-4" /> Update
                    </button>

                    <button className={`flex items-center gap-1 px-3 py-1 text-xs text-white rounded-md ${product.status === "Available" ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}`}
                      onClick={() => toggleAvailability((currentPage - 1) * itemsPerPage + idx)}>
                      {product.status === "Available" ? (<><XCircle className="w-4 h-4" /> Not Available</>) : (<><CheckCircle className="w-4 h-4" /> Available</>)}
                    </button>

                    <button className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                      onClick={() => {
                        const target = paginatedProducts[idx];
                        setSelectedRecommendations(target.recommendations ?? []);
                        setIsViewModalOpen(true);
                      }}>
                      <Eye className="w-4 h-4" /> View Recommended
                    </button>
                    <button
                      className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded-md"
                      onClick={() => {
                        const productId = product.id;
                        if (productId) handleDeleteProduct(productId);
                        }}
                        >
                          <XCircle className="w-4 h-4" /> Delete
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

      {/* Add Product Modal */}
      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader>Add New Product</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label htmlFor="image">Image URL</Label>
              <TextInput id="image" value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="code">Product Code</Label>
              <TextInput id="code" value={newProduct.code} onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="name">Product Name</Label>
              <TextInput id="name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <TextInput id="desc" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="size">Size</Label>
              <TextInput id="size" value={newProduct.size} onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="stock">Stocks</Label>
              <TextInput id="stock" type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value || "0") })} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" value={newProduct.status} onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value as Product["status"] })}>
                <option>Available</option>
                <option>Not Available</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <TextInput id="expiry" type="date" value={newProduct.expiryDate ?? ""} onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="inDate">In Date</Label>
              <TextInput id="inDate" type="date" value={newProduct.inDate ?? ""} onChange={(e) => setNewProduct({ ...newProduct, inDate: e.target.value })} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="success" onClick={handleAddProduct}>Add Product</Button>
          <Button color="gray" onClick={() => setIsModalOpen(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Edit Product Modal */}
      <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalHeader>Update Product</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label htmlFor="editImage">Image URL</Label>
              <TextInput id="editImage" value={editProduct.image} onChange={(e) => setEditProduct({ ...editProduct, image: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="editCode">Product Code</Label>
              <TextInput id="editCode" value={editProduct.code} onChange={(e) => setEditProduct({ ...editProduct, code: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="editName">Product Name</Label>
              <TextInput id="editName" value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="editDesc">Description</Label>
              <TextInput id="editDesc" value={editProduct.description} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="editSize">Size</Label>
              <TextInput id="editSize" value={editProduct.size} onChange={(e) => setEditProduct({ ...editProduct, size: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="editStock">Stocks</Label>
              <TextInput id="editStock" type="number" value={editProduct.stock} onChange={(e) => setEditProduct({ ...editProduct, stock: parseInt(e.target.value || "0") })} />
            </div>
            <div>
              <Label htmlFor="editStatus">Status</Label>
              <Select id="editStatus" value={editProduct.status} onChange={(e) => setEditProduct({ ...editProduct, status: e.target.value as Product["status"] })}>
                <option>Available</option>
                <option>Not Available</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="editExpiry">Expiry Date</Label>
              <TextInput id="editExpiry" type="date" value={editProduct.expiryDate ?? ""} onChange={(e) => setEditProduct({ ...editProduct, expiryDate: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="editInDate">In Date</Label>
              <TextInput id="editInDate" type="date" value={editProduct.inDate ?? ""} onChange={(e) => setEditProduct({ ...editProduct, inDate: e.target.value })} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="warning" onClick={handleUpdateProduct}>Update</Button>
          <Button color="gray" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

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
