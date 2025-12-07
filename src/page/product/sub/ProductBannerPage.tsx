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

// === API FUNCTIONS (UNCHANGED BACKEND) ===
import {
  getAllBanners,
  createBanner,
  deleteBanner,
} from "../../../libs/ApiGatewayDatasource";

// === TYPES ===
import type { ProductBanner } from "../../../libs/models/product/ProductBanner";

type SnowballOffer = {
  id: number;
  title: string;
  description: string;
  requiredQty: number;
  expiry: string; // "NO EXPIRATION" if not set
  reward: string;
  terms: string;
};

export default function ProductBannerPage() {
  // NORMAL BANNERS
  const [banners, setBanners] = useState<ProductBanner[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // SNOWBALL OFFERS
  const [snowballs, setSnowballs] = useState<SnowballOffer[]>([]);

  // MODAL VISIBILITY
  const [isModalOpen, setIsModalOpen] = useState(false);

  // FORMS
  const [bannerForm, setBannerForm] = useState({
    bannerUrl: "",
    bannerUrlLink: "",
  });

  const [snowballForm, setSnowballForm] = useState({
    title: "",
    description: "",
    requiredQty: 1,
    expiry: "",
    reward: "",
    terms: "",
  });

  const [hasExpiration, setHasExpiration] = useState(true);

  // LOAD BANNERS
  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    try {
      const list = await getAllBanners();
      setBanners(list);
    } catch (err) {
      Swal.fire("Error", "Failed to load banners.", "error");
    }
  }

  // SAVE BANNER
  const handleSaveBanner = async () => {
    if (!bannerForm.bannerUrl.trim()) {
      Swal.fire("Missing Field", "Banner URL is required.", "warning");
      return;
    }
    if (!bannerForm.bannerUrlLink.trim()) {
      Swal.fire("Missing Field", "Redirect URL is required.", "warning");
      return;
    }

    try {
      const saved = await createBanner(bannerForm);
      setBanners((prev) => [saved, ...prev]);

      Swal.fire("Success", "Banner added.", "success");

      setBannerForm({ bannerUrl: "", bannerUrlLink: "" });
    } catch (err) {
      Swal.fire("Error", "Failed to create banner.", "error");
    }
  };

  // SAVE SNOWBALL
  const handleSaveSnowball = () => {
    if (!snowballForm.title.trim()) {
      Swal.fire("Missing Title", "Enter snowball title.", "warning");
      return;
    }

    if (hasExpiration && !snowballForm.expiry.trim()) {
      Swal.fire("Missing Expiry", "Please select an expiration date.", "warning");
      return;
    }

    setSnowballs((prev) => [
      {
        id: Date.now(),
        ...snowballForm,
        expiry: hasExpiration ? snowballForm.expiry : "NO EXPIRATION",
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

    setHasExpiration(true);

    Swal.fire("Success", "Snowball offer added.", "success");
  };

  // DELETE BANNER
  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Delete Banner?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then(async (res) => {
      if (res.isConfirmed) {
        await deleteBanner(id);
        setBanners((prev) => prev.filter((b) => b.bannerId !== id));
        Swal.fire("Deleted", "Banner removed.", "success");
      }
    });
  };

  // FILTER BANNERS
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-8"
    >
      {/* HEADER */}
      <h1 className="text-3xl font-extrabold text-emerald-600 flex items-center gap-2">
        <Sparkles /> Product Banners & Snowball Offers
      </h1>

      {/* ADD BUTTON */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-5 py-2 rounded-full bg-gradient-to-r 
        from-emerald-600 via-emerald-500 to-cyan-400 text-white font-semibold
        shadow-lg flex items-center gap-2"
      >
        <Plus /> Add Banner / Snowball
      </button>

      {/* SEARCH */}
      <div className="relative max-w-sm">
        <input
          type="text"
          placeholder="Search banner..."
          className="w-full px-4 py-2 pl-11 rounded-full border border-emerald-300 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="absolute left-3 top-2.5 text-emerald-500 w-5 h-5" />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border border-emerald-200 bg-white shadow">
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
              <tr key={item.bannerId} className="border-b hover:bg-emerald-50">
                <td className="p-4">
                  <img
                    src={item.bannerUrl}
                    className="h-16 w-40 object-cover rounded border"
                  />
                </td>

                <td className="p-4 text-blue-600 underline flex items-center gap-1">
                  <Link2 className="w-4 h-4" /> {item.bannerUrlLink}
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

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* SNOWBALL COUNT DISPLAY */}
      <div className="border p-4 rounded bg-orange-50 text-sm text-orange-700">
        <span className="font-semibold">🎁 Total Snowball Offers:</span>{" "}
        {snowballs.length}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[450px] p-6 rounded-xl shadow-xl space-y-6">

            <h2 className="text-lg font-bold text-emerald-600">
              Add Banner / Add Snowball
            </h2>

            {/* BANNER FORM */}
            <div className="border p-4 rounded space-y-2">
              <p className="font-semibold text-sm text-emerald-700">
                Product Banner
              </p>

              <input
                placeholder="Banner Image URL"
                className="border p-2 w-full rounded text-sm"
                value={bannerForm.bannerUrl}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, bannerUrl: e.target.value })
                }
              />

              <input
                placeholder="Redirect URL"
                className="border p-2 w-full rounded text-sm"
                value={bannerForm.bannerUrlLink}
                onChange={(e) =>
                  setBannerForm({
                    ...bannerForm,
                    bannerUrlLink: e.target.value,
                  })
                }
              />

              <button
                onClick={handleSaveBanner}
                className="w-full mt-2 py-2 bg-emerald-600 text-white rounded text-sm"
              >
                Save Product Banner
              </button>
            </div>

            {/* SNOWBALL FORM */}
            <div className="border p-4 rounded space-y-2 bg-orange-50">
              <p className="font-semibold text-sm text-orange-700 flex items-center gap-1">
                <Gift className="w-4 h-4" /> Snowball Offer
              </p>

              <input
                placeholder="Title"
                className="border p-2 w-full rounded text-sm"
                value={snowballForm.title}
                onChange={(e) =>
                  setSnowballForm({ ...snowballForm, title: e.target.value })
                }
              />

              <textarea
                placeholder="Description"
                className="border p-2 w-full rounded text-sm"
                value={snowballForm.description}
                onChange={(e) =>
                  setSnowballForm({
                    ...snowballForm,
                    description: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Required Qty"
                className="border p-2 w-full rounded text-sm"
                value={snowballForm.requiredQty}
                onChange={(e) =>
                  setSnowballForm({
                    ...snowballForm,
                    requiredQty: Number(e.target.value),
                  })
                }
              />

              {/* EXPIRATION TOGGLE */}
              <div className="flex items-center gap-3 text-sm">
                <label className="font-medium">Has Expiration?</label>
                <input
                  type="checkbox"
                  checked={hasExpiration}
                  onChange={(e) => setHasExpiration(e.target.checked)}
                />
              </div>

              {hasExpiration && (
                <input
                  type="date"
                  className="border p-2 w-full rounded text-sm"
                  value={snowballForm.expiry}
                  onChange={(e) =>
                    setSnowballForm({
                      ...snowballForm,
                      expiry: e.target.value,
                    })
                  }
                />
              )}

              <input
                placeholder="Reward"
                className="border p-2 w-full rounded text-sm"
                value={snowballForm.reward}
                onChange={(e) =>
                  setSnowballForm({ ...snowballForm, reward: e.target.value })
                }
              />

              <textarea
                placeholder="Terms"
                className="border p-2 w-full rounded text-sm"
                value={snowballForm.terms}
                onChange={(e) =>
                  setSnowballForm({ ...snowballForm, terms: e.target.value })
                }
              />

              <button
                onClick={handleSaveSnowball}
                className="w-full mt-2 py-2 bg-orange-500 text-white rounded text-sm"
              >
                Save Snowball Offer
              </button>
            </div>

            {/* CLOSE MODAL */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full py-2 border rounded text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
