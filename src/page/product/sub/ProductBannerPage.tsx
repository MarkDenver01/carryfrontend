import { useState, useMemo, useEffect } from "react";
import { Pagination } from "flowbite-react";
import Swal from "sweetalert2";
import {
  Search,
  Sparkles,
  Trash2,
  Plus,
  Link2,
  Gift,
} from "lucide-react";
import { motion } from "framer-motion";

// === API FUNCTIONS (UNCHANGED) ===
import {
  getAllBanners,
  createBanner,
  deleteBanner,
} from "../../../libs/ApiGatewayDatasource";

// === TYPE ===
import type { ProductBanner } from "../../../libs/models/product/ProductBanner";

// ✅ FRONTEND-ONLY TYPE FOR SNOWBALL
type SnowballOffer = {
  id: number;
  title: string;
  description: string;
  requiredQty: number;
  expiry: string;
  reward: string;
  terms: string;
};

export default function ProductBannerPage() {
  // ✅ NORMAL BANNERS (BACKEND)
  const [banners, setBanners] = useState<ProductBanner[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // ✅ SNOWBALL OFFERS (FRONTEND ONLY)
  const [snowballs, setSnowballs] = useState<SnowballOffer[]>([]);

  // ✅ MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ NORMAL BANNER FORM
  const [bannerForm, setBannerForm] = useState({
    bannerUrl: "",
    bannerUrlLink: "",
  });

  // ✅ SNOWBALL FORM
  const [snowballForm, setSnowballForm] = useState({
    title: "",
    description: "",
    requiredQty: 1,
    expiry: "",
    reward: "",
    terms: "",
  });

  // ✅ LOAD BANNERS (UNCHANGED)
  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    try {
      const list = await getAllBanners();
      setBanners(list);
    } catch (err) {
      console.error("Failed loading banners:", err);
      Swal.fire("Error", "Failed to load banners.", "error");
    }
  }

  // ✅ SAVE NORMAL PRODUCT BANNER (BACKEND UNCHANGED)
  const handleSaveBanner = async () => {
    if (!bannerForm.bannerUrl.trim()) {
      Swal.fire("Missing Banner URL", "Please paste the Cloudinary URL.", "warning");
      return;
    }

    if (!bannerForm.bannerUrlLink.trim()) {
      Swal.fire("Missing Redirect URL", "Please enter a redirect link.", "warning");
      return;
    }

    try {
      const saved = await createBanner({
        bannerUrl: bannerForm.bannerUrl,
        bannerUrlLink: bannerForm.bannerUrlLink,
      });

      setBanners((prev) => [saved, ...prev]);
      Swal.fire("Success", "Banner added!", "success");

      setBannerForm({ bannerUrl: "", bannerUrlLink: "" });
    } catch (err) {
      console.error("Create failed:", err);
      Swal.fire("Error", "Failed to save banner.", "error");
    }
  };

  // ✅ SAVE SNOWBALL (FRONTEND ONLY)
  const handleSaveSnowball = () => {
    if (!snowballForm.title || !snowballForm.expiry) {
      Swal.fire("Missing fields", "Fill all snowball fields", "warning");
      return;
    }

    setSnowballs((prev) => [
      {
        id: Date.now(),
        ...snowballForm,
      },
      ...prev,
    ]);

    setSnowballForm({
      title: "",
      description: "",
      requiredQty: 1,
      expiry: "",
      reward: "",
      terms: "",
    });

    Swal.fire("Success", "Snowball Offer Added!", "success");
  };

  // ✅ DELETE BANNER (UNCHANGED BACKEND)
  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Delete Banner?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await deleteBanner(id);
          setBanners((prev) => prev.filter((b) => b.bannerId !== id));
          Swal.fire("Deleted", "Banner removed.", "success");
        } catch (err) {
          console.error("Delete failed:", err);
          Swal.fire("Error", "Failed to delete banner.", "error");
        }
      }
    });
  };

  // ✅ SEARCH + PAGINATION
  const filtered = useMemo(() => {
    const t = search.toLowerCase();
    return banners.filter(
      (b) =>
        b.bannerUrl.toLowerCase().includes(t) ||
        b.bannerUrlLink.toLowerCase().includes(t)
    );
  }, [banners, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <motion.div className="relative p-8 space-y-8">

      {/* ✅ HEADER */}
      <h1 className="text-3xl font-bold text-emerald-600 flex items-center gap-2">
        <Sparkles /> Product Banners & Snowball Offers
      </h1>

      {/* ✅ ADD BUTTON */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-5 py-2 rounded-full bg-gradient-to-r 
        from-emerald-600 via-emerald-500 to-cyan-400 text-white 
        font-semibold shadow-lg flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Banner / Snowball
      </button>

      {/* ✅ SEARCH */}
      <div className="relative max-w-sm">
        <input
          type="text"
          placeholder="Search banner..."
          className="w-full px-4 py-2 pl-11 rounded-full border border-emerald-200 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="absolute left-3 top-2.5 text-emerald-500 w-5 h-5" />
      </div>

      {/* ✅ TABLE */}
      <div className="overflow-x-auto rounded-xl border border-emerald-200">
        <table className="min-w-[900px] w-full text-sm text-gray-700">
          <thead className="bg-emerald-600 text-white">
            <tr>
              <th className="p-4 text-left">Banner</th>
              <th className="p-4 text-left">Redirect URL</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((item) => (
              <tr key={item.bannerId} className="border-b hover:bg-emerald-50/50">
                <td className="p-4">
                  <img
                    src={item.bannerUrl}
                    className="h-16 w-40 object-cover rounded border"
                  />
                </td>

                <td className="p-4 text-blue-600 underline flex items-center gap-1">
                  <Link2 className="w-4 h-4" />
                  {item.bannerUrlLink}
                </td>

                <td className="p-4 text-center">
                  <button
                    onClick={() => handleDelete(item.bannerId)}
                    className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ PAGINATION */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* ✅ SNOWBALL SUMMARY (PARA WALANG UNUSED STATE ERROR) */}
      <div className="border p-4 rounded bg-orange-50 text-sm text-orange-700">
        <span className="font-semibold">🎁 Total Snowball Offers:</span>{" "}
        {snowballs.length}
      </div>

      {/* ✅ SINGLE MODAL – SEPARATE FORMS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[520px] p-6 rounded-xl shadow-xl border">

            <h2 className="text-lg font-semibold mb-4 text-emerald-600">
              Add Product Banner / Snowball Offer
            </h2>

            {/* ✅ NORMAL PRODUCT BANNER FORM */}
            <div className="border p-4 rounded mb-5">
              <h3 className="font-semibold text-sm mb-2 text-emerald-600">
                Product Banner (Backend)
              </h3>

              <input
                placeholder="Banner Image URL"
                className="border p-2 w-full mb-2"
                value={bannerForm.bannerUrl}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, bannerUrl: e.target.value })
                }
              />

              <input
                placeholder="Redirect URL"
                className="border p-2 w-full"
                value={bannerForm.bannerUrlLink}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, bannerUrlLink: e.target.value })
                }
              />

              <button
                onClick={handleSaveBanner}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded"
              >
                Save Product Banner
              </button>
            </div>

            {/* ✅ SNOWBALL OFFER FORM */}
            <div className="border p-4 rounded bg-orange-50">
              <h3 className="font-semibold text-sm mb-2 text-orange-600 flex items-center gap-1">
                <Gift className="w-4 h-4" /> Snowball Offer (Frontend Only)
              </h3>

              <input
                placeholder="Title"
                className="border p-2 w-full mb-2"
                value={snowballForm.title}
                onChange={(e) =>
                  setSnowballForm({ ...snowballForm, title: e.target.value })
                }
              />

              <textarea
                placeholder="Description"
                className="border p-2 w-full mb-2"
                value={snowballForm.description}
                onChange={(e) =>
                  setSnowballForm({ ...snowballForm, description: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Required Qty"
                className="border p-2 w-full mb-2"
                value={snowballForm.requiredQty}
                onChange={(e) =>
                  setSnowballForm({
                    ...snowballForm,
                    requiredQty: Number(e.target.value),
                  })
                }
              />

              <input
                type="date"
                className="border p-2 w-full mb-2"
                value={snowballForm.expiry}
                onChange={(e) =>
                  setSnowballForm({ ...snowballForm, expiry: e.target.value })
                }
              />

              <input
                placeholder="Reward"
                className="border p-2 w-full mb-2"
                value={snowballForm.reward}
                onChange={(e) =>
                  setSnowballForm({ ...snowballForm, reward: e.target.value })
                }
              />

              <textarea
                placeholder="Terms"
                className="border p-2 w-full mb-2"
                value={snowballForm.terms}
                onChange={(e) =>
                  setSnowballForm({ ...snowballForm, terms: e.target.value })
                }
              />

              <button
                onClick={handleSaveSnowball}
                className="mt-3 px-4 py-2 bg-orange-500 text-white rounded"
              >
                Save Snowball Offer
              </button>
            </div>

            {/* ✅ CLOSE */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
