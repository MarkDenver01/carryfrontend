import { useState, useMemo, useEffect } from "react";
import { Pagination } from "flowbite-react";
import Swal from "sweetalert2";
import {
  Sparkles,
  Trash2,
  Plus,
  Link2,
  Gift,
} from "lucide-react";
import { motion } from "framer-motion";

// === API (UNCHANGED - NORMAL BANNERS ONLY) ===
import {
  getAllBanners,
  createBanner,
  deleteBanner,
} from "../../../libs/ApiGatewayDatasource";

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

  // ✅ SNOWBALL OFFERS (FRONTEND ONLY)
  const [snowballs, setSnowballs] = useState<SnowballOffer[]>([]);
  const [snowballSearch, setSnowballSearch] = useState("");
  const [snowballPage, setSnowballPage] = useState(1);
  const snowballPageSize = 5;

  // ✅ MODALS (BOTH USED)
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isSnowballModalOpen, setIsSnowballModalOpen] = useState(false);

  const [form, setForm] = useState({
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

  // ✅ LOAD NORMAL BANNERS (UNCHANGED)
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

  // ✅ SAVE NORMAL BANNER (USED)
  const handleSave = async () => {
    if (!form.bannerUrl.trim() || !form.bannerUrlLink.trim()) {
      Swal.fire("Missing fields", "Fill all fields", "warning");
      return;
    }

    try {
      const saved = await createBanner(form);
      setBanners((prev) => [saved, ...prev]);
      setForm({ bannerUrl: "", bannerUrlLink: "" });
      setIsPromoModalOpen(false);
      Swal.fire("Success", "Banner added!", "success");
    } catch {
      Swal.fire("Error", "Failed to save banner.", "error");
    }
  };

  // ✅ DELETE NORMAL BANNER (USED)
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
        await deleteBanner(id);
        setBanners((prev) => prev.filter((b) => b.bannerId !== id));
        Swal.fire("Deleted", "Banner removed.", "success");
      }
    });
  };

  // ✅ SAVE SNOWBALL
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

    setIsSnowballModalOpen(false);
    Swal.fire("Success", "Snowball Offer Added!", "success");
  };

  // ✅ DELETE SNOWBALL
  const handleDeleteSnowball = (id: number) => {
    Swal.fire({
      title: "Delete Snowball Offer?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
    }).then((res) => {
      if (res.isConfirmed) {
        setSnowballs((prev) => prev.filter((s) => s.id !== id));
        Swal.fire("Deleted", "Snowball removed.", "success");
      }
    });
  };

  // ✅ FILTER NORMAL BANNERS
  const filtered = useMemo(() => {
    const t = search.toLowerCase();
    return banners.filter(
      (b) =>
        b.bannerUrl.toLowerCase().includes(t) ||
        b.bannerUrlLink.toLowerCase().includes(t)
    );
  }, [banners, search]);

  // ✅ SNOWBALL FILTER + PAGINATION
  const filteredSnowballs = useMemo(() => {
    const t = snowballSearch.toLowerCase();
    return snowballs.filter(
      (s) =>
        s.title.toLowerCase().includes(t) ||
        s.description.toLowerCase().includes(t)
    );
  }, [snowballs, snowballSearch]);

  const snowballTotalPages = Math.ceil(filteredSnowballs.length / snowballPageSize);

  const paginatedSnowballs = filteredSnowballs.slice(
    (snowballPage - 1) * snowballPageSize,
    snowballPage * snowballPageSize
  );

  return (
    <motion.div className="p-8 space-y-10">
      {/* ✅ HEADER */}
      <h1 className="text-3xl font-bold text-emerald-600 flex items-center gap-2">
        <Sparkles /> Banner & Snowball Manager
      </h1>

      {/* ✅ NORMAL PROMO SECTION */}
      <div className="border rounded-xl p-6 shadow">
        <h2 className="font-bold text-lg mb-4">🎯 Normal Promo Banners</h2>

        <button
          onClick={() => setIsPromoModalOpen(true)}
          className="mb-4 px-4 py-2 bg-emerald-600 text-white rounded flex items-center gap-2"
        >
          <Plus /> Add Banner
        </button>

        <input
          placeholder="Search banner..."
          className="border px-3 py-2 rounded text-sm mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filtered.map((item) => (
          <div key={item.bannerId} className="flex items-center justify-between border-b py-3">
            <img src={item.bannerUrl} className="h-14 w-32 rounded border" />
            <a href={item.bannerUrlLink} className="text-blue-600 underline flex items-center gap-1">
              <Link2 size={14} /> Open
            </a>
            <button
              onClick={() => handleDelete(item.bannerId)}
              className="bg-red-600 text-white p-2 rounded"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* ✅ SNOWBALL SECTION */}
      <div className="border rounded-xl p-6 shadow bg-gradient-to-br from-yellow-50 to-orange-50">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Gift /> Snowball Offers (Frontend)
        </h2>

        <div className="flex justify-between mb-4 gap-3">
          <button
            onClick={() => setIsSnowballModalOpen(true)}
            className="px-4 py-2 bg-orange-500 text-white rounded flex items-center gap-2"
          >
            <Plus /> Add Snowball Offer
          </button>

          <input
            placeholder="Search offer..."
            className="border px-3 py-2 rounded text-sm"
            value={snowballSearch}
            onChange={(e) => {
              setSnowballSearch(e.target.value);
              setSnowballPage(1);
            }}
          />
        </div>

        {paginatedSnowballs.map((s) => {
          const expired = new Date(s.expiry) < new Date();
          return (
            <div key={s.id} className="border p-4 rounded-xl bg-white mb-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{s.title}</h3>
                <button
                  onClick={() => handleDeleteSnowball(s.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                >
                  Delete
                </button>
              </div>

              <p className="text-sm text-gray-600">{s.description}</p>
              <p className="text-xs text-gray-400 mt-1">{s.terms}</p>

              <div className="mt-2 flex justify-between text-sm">
                <span>🎯 Progress: 0 / {s.requiredQty}</span>
                <span className={expired ? "text-red-600" : "text-green-600"}>
                  ⏳ {expired ? "Expired" : `Until ${s.expiry}`}
                </span>
              </div>

              <p className="mt-2 text-green-600 font-semibold">
                🎁 Reward: {s.reward}
              </p>
            </div>
          );
        })}

        {snowballTotalPages > 1 && (
          <Pagination
            currentPage={snowballPage}
            totalPages={snowballTotalPages}
            onPageChange={setSnowballPage}
          />
        )}
      </div>

      {/* ✅ PROMO MODAL (NOW FIXES ALL YELLOW WARNINGS) */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[460px] p-6 rounded-xl shadow-xl">
            <h2 className="font-bold mb-4 text-emerald-600">Add Promo Banner</h2>

            <input
              placeholder="Banner Image URL"
              className="border p-2 w-full mb-3"
              value={form.bannerUrl}
              onChange={(e) =>
                setForm({ ...form, bannerUrl: e.target.value })
              }
            />

            <input
              placeholder="Redirect URL"
              className="border p-2 w-full mb-4"
              value={form.bannerUrlLink}
              onChange={(e) =>
                setForm({ ...form, bannerUrlLink: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsPromoModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="bg-emerald-600 text-white px-4 py-2 rounded"
              >
                Save Banner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ SNOWBALL MODAL */}
      {isSnowballModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white w-[460px] p-6 rounded-xl">
            <h2 className="font-bold mb-4">Add Snowball Offer</h2>

            <input
              placeholder="Title"
              className="border p-2 w-full mb-2"
              onChange={(e) =>
                setSnowballForm({ ...snowballForm, title: e.target.value })
              }
            />

            <textarea
              placeholder="Description"
              className="border p-2 w-full mb-2"
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
              className="border p-2 w-full mb-2"
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
              onChange={(e) =>
                setSnowballForm({ ...snowballForm, expiry: e.target.value })
              }
            />

            <input
              placeholder="Reward"
              className="border p-2 w-full mb-2"
              onChange={(e) =>
                setSnowballForm({ ...snowballForm, reward: e.target.value })
              }
            />

            <textarea
              placeholder="Terms"
              className="border p-2 w-full mb-4"
              onChange={(e) =>
                setSnowballForm({ ...snowballForm, terms: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setIsSnowballModalOpen(false)}>
                Cancel
              </button>
              <button
                onClick={handleSaveSnowball}
                className="bg-orange-500 text-white px-4 py-2 rounded"
              >
                Save Snowball
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
