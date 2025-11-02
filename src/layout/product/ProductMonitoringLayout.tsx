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
    name: string;
    stock: number;
    status: "In Stock" | "Low Stock" | "Out of Stock";
    expiryDate: string;
}

const initialProducts: Product[] = [
    { name: "Milk", stock: 25, status: "In Stock", expiryDate: "2025-12-01" },
    { name: "Bread", stock: 0, status: "Out of Stock", expiryDate: "2024-07-10" },
    { name: "Eggs", stock: 100, status: "In Stock", expiryDate: "2024-09-15" },
    { name: "Butter", stock: 10, status: "Low Stock", expiryDate: "2024-08-20" },
    { name: "Cheese", stock: 0, status: "Out of Stock", expiryDate: "2024-06-30" },
    { name: "Juice", stock: 15, status: "Low Stock", expiryDate: "2024-07-12" },
    { name: "Cereal", stock: 50, status: "In Stock", expiryDate: "2025-01-15" },
    { name: "Yogurt", stock: 5, status: "Low Stock", expiryDate: "2024-07-20" },
    { name: "Ham", stock: 0, status: "Out of Stock", expiryDate: "2024-07-01" },
    { name: "Soda", stock: 60, status: "In Stock", expiryDate: "2025-03-10" },
    { name: "Water", stock: 100, status: "In Stock", expiryDate: "2026-01-01" },
];

export default function ProductInventoryTable() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"" | Product["status"]>("");
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
    const [newProduct, setNewProduct] = useState<Product>({
        name: "",
        stock: 0,
        status: "In Stock",
        expiryDate: "",
    });
    const [editProduct, setEditProduct] = useState<Product>({
        name: "",
        stock: 0,
        status: "In Stock",
        expiryDate: "",
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const handleAddProduct = () => {
        setProducts([...products, newProduct]);
        setNewProduct({ name: "", stock: 0, status: "In Stock", expiryDate: "" });
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
                        <DropdownItem onClick={() => setStatusFilter("")} className="hover:bg-gray-100 text-gray-700 px-4 py-2">All</DropdownItem>
                        <DropdownItem onClick={() => setStatusFilter("In Stock")} className="hover:bg-green-100 text-green-700 px-4 py-2">In Stock</DropdownItem>
                        <DropdownItem onClick={() => setStatusFilter("Low Stock")} className="hover:bg-yellow-100 text-yellow-700 px-4 py-2">Low Stock</DropdownItem>
                        <DropdownItem onClick={() => setStatusFilter("Out of Stock")} className="hover:bg-red-100 text-red-700 px-4 py-2">Out of Stock</DropdownItem>
                    </Dropdown>
                </div>
            </div>

            <table className="min-w-full border border-gray-300 text-sm text-left text-gray-700">
                <thead className="bg-emerald-600 text-gray-100">
                <tr>
                    <th className="p-3 border border-gray-300 font-medium">Product</th>
                    <th className="p-3 border border-gray-300 font-medium">Stocks</th>
                    <th className="p-3 border border-gray-300 font-medium">Status</th>
                    <th className="p-3 border border-gray-300 font-medium">Expiry Date</th>
                    <th className="p-3 border border-gray-300 font-medium">Actions</th>
                </tr>
                </thead>
                <tbody>
                {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product, idx) => (
                        <tr key={idx} className="hover:bg-gray-100 transition duration-150 ease-in-out">
                            <td className="p-3 border border-gray-300 font-medium">{product.name}</td>
                            <td className="p-3 border border-gray-300">{product.stock}</td>
                            <td className="p-3 border border-gray-300">
                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(product.status)}`}>
                                    {product.status}
                                </span>
                            </td>
                            <td className="p-3 border border-gray-300">{product.expiryDate}</td>
                            <td className="p-3 border border-gray-300 flex flex-wrap gap-2">
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
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="text-center py-4 text-gray-500 border border-gray-300">
                            No products found.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

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
                        <div>
                            <Label htmlFor="name">Product Name</Label>
                            <TextInput id="name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required />
                        </div>
                        <div>
                            <Label htmlFor="stock">Stock</Label>
                            <TextInput id="stock" type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })} required />
                        </div>
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select id="status" value={newProduct.status} onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value as Product["status"] })}>
                                <option value="In Stock">In Stock</option>
                                <option value="Low Stock">Low Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <TextInput id="expiry" type="date" value={newProduct.expiryDate} onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })} required />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button className="bg-green-700 hover:bg-green-800 text-white shadow-md hover:shadow-lg transition duration-200 ease-in-out" onClick={handleAddProduct}>Add Product</Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition duration-200 ease-in-out" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                </ModalFooter>
            </Modal>

            {/* Edit Product Modal */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <ModalHeader>Update Product</ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="editName">Product Name</Label>
                            <TextInput id="editName" value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} />
                        </div>
                        <div>
                            <Label htmlFor="editStock">Stock</Label>
                            <TextInput id="editStock" type="number" value={editProduct.stock} onChange={(e) => setEditProduct({ ...editProduct, stock: parseInt(e.target.value) })} />
                        </div>
                        <div>
                            <Label htmlFor="editStatus">Status</Label>
                            <Select id="editStatus" value={editProduct.status} onChange={(e) => setEditProduct({ ...editProduct, status: e.target.value as Product["status"] })}>
                                <option value="In Stock">In Stock</option>
                                <option value="Low Stock">Low Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="editExpiry">Expiry Date</Label>
                            <TextInput id="editExpiry" type="date" value={editProduct.expiryDate} onChange={(e) => setEditProduct({ ...editProduct, expiryDate: e.target.value })} />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-md hover:shadow-lg transition duration-200 ease-in-out" onClick={handleUpdateProduct}>Update Product</Button>
                    <Button className="bg-gray-400 hover:bg-gray-500 text-white" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}
