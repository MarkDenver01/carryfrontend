import { useState, useMemo, useEffect } from "react";
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

// === API FUNCTIONS (UNCHANGED - SAFE) ===
import {
  getAllBanners,
  createBanner,
  deleteBanner,
} from "../../../libs/ApiGatewayDatasource";

import type { ProductBanner } from "../../../libs/models/product/ProductBanner";

/* =============================
   ✅ MOCK PRODUCTS (FROM PRODUCT MONITORING - FRONTEND ONLY)
============================= */
type PromoProduct = {
  productId: number;
  name: string;
  category: string;
};

const MOCK_PRODUCTS: PromoProduct[] = [
  { productId: 1, name: "Sardines", category: "Canned Goods" },
  { productId: 2, name: "Corned Beef", category: "Canned Goods" },
  { productId: 3, name: "Tuna", category: "Canned Goods" },
  { productId: 4, name: "Soft Drinks", category: "Beverages" },
  { productId: 5, name: "Instant Noodles", category: "Dry Goods" },
];

/* =============================
   ✅ SNOWBALL TYPE
============================= */
type SnowballOffer = {
  id: number;
  title: string;
  reward: string;
  requiredQty: number;
  hasExpiry: boolean;
  expiry?: string;
  terms: string;
  products: PromoProduct[];
};

export default function ProductBannerPage() {
  /* ===== PRODUCT BANNERS (BACKEND) ===== */
  const [banners, setBanners] = useState<ProductBanner[]>([]);
  const [search, setSearch] = useState("");

  /* ===== SNOWBALL (FRONTEND ONLY) ===== */
  const [snowballs, setSnowballs] = useState<SnowballOffer[]>([]);

  /* ===== MODAL ===== */
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ===== PRODUCT BANNER FORM ===== */
  const [bannerForm, setBannerForm] = useState({
    bannerUrl: "",
    bannerUrlLink: "",
  });

  /* ===== SNOWBALL FORM ===== */
  const [snowballForm, setSnowballForm] = useState({
    title: "",
    reward: "",
    requiredQty: 1,
    hasExpiry: false,
    expiry: "",
    terms: "",
  });

  const [selectedProducts, setSelectedProducts] = useState<PromoProduct[]>([]);

  /* =============================
     LOAD PRODUCT BANNERS
  ============================= */
  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    try {
      const list = await getAllBanners();
      setBanners(list);
    } catch {
      Swal.fire("Error", "Failed to load banners.", "error");
    }
  }

  /* =============================
     SAVE PRODUCT BANNER (BACKEND)
  ============================= */
  const handleSaveBanner = async () => {
    if (!bannerForm.bannerUrl || !bannerForm.bannerUrlLink) {
      Swal.fire("Missing Fields", "Fill banner fields.", "warning");
      return;
    }

    const saved = await createBanner(bannerForm);
    setBanners((prev) => [saved, ...prev]);
    setBannerForm({ bannerUrl: "", bannerUrlLink: "" });
    Swal.fire("Success", "Banner created!", "success");
  };

  /* =============================
     SAVE SNOWBALL (FRONTEND)
  ============================= */
  const handleSaveSnowball = () => {
    if (!snowballForm.title || !snowballForm.reward) {
      Swal.fire("Missing Fields", "Fill snowball fields.", "warning");
      return;
    }

    if (selectedProducts.length === 0) {
      Swal.fire("No Products", "Select at least 1 product.", "warning");
      return;
    }

    setSnowballs((prev) => [
      {
        id: Date.now(),
        ...snowballForm,
        expiry: snowballForm.hasExpiry ? snowballForm.expiry : undefined,
        products: selectedProducts,
      },
      ...prev,
    ]);

    setSnowballForm({
      title: "",
      reward: "",
      requiredQty: 1,
      hasExpiry: false,
      expiry: "",
      terms: "",
    });

    setSelectedProducts([]);
    Swal.fire("Success", "Snowball Promo Added!", "success");
  };

  /* =============================
     DELETE PRODUCT BANNER
  ============================= */
  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Delete Banner?",
      icon: "warning",
      showCancelButton: true,
    }).then(async (res) => {
      if (res.isConfirmed) {
        await deleteBanner(id);
        setBanners((prev) => prev.filter((b) => b.bannerId !== id));
        Swal.fire("Deleted", "Banner removed.", "success");
      }
    });
  };

  /* =============================
     SEARCH FILTER
  ============================= */
  const filtered = useMemo(() => {
    return banners.filter(
      (b) =>
        b.bannerUrl.toLowerCase().includes(search.toLowerCase()) ||
        b.bannerUrlLink.toLowerCase().includes(search.toLowerCase())
    );
  }, [banners, search]);

  /* =============================
     TOGGLE PRODUCT SELECT
  ============================= */
  const toggleProduct = (product: PromoProduct) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.productId === product.productId);
      return exists
        ? prev.filter((p) => p.productId !== product.productId)
        : [...prev, product];
    });
  };

  return (
    <motion.div className="p-8 space-y-8">

      <h1 className="text-3xl font-bold text-emerald-600 flex items-center gap-2">
        <Sparkles /> Product Banner & Snowball Promos
      </h1>

      <button
        onClick={() => setIsModalOpen(true)}
        className="px-5 py-2 bg-emerald-600 text-white rounded flex items-center gap-2"
      >
        <Plus /> Add Banner / Snowball
      </button>

      {/* SEARCH */}
      <div className="relative max-w-sm">
        <input
          type="text"
          placeholder="Search banner..."
          className="w-full px-4 py-2 pl-11 rounded-full border text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="absolute left-3 top-2.5 text-emerald-500 w-5 h-5" />
      </div>

      {/* PRODUCT BANNERS TABLE */}
      <table className="w-full border text-sm">
        <thead className="bg-emerald-600 text-white">
          <tr>
            <th className="p-3">Banner</th>
            <th className="p-3">Redirect</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((b) => (
            <tr key={b.bannerId} className="border-b">
              <td className="p-3">
                <img src={b.bannerUrl} className="h-14 rounded" />
              </td>
              <td className="p-3 text-blue-600 flex items-center gap-1">
                <Link2 size={14} /> {b.bannerUrlLink}
              </td>
              <td className="p-3">
                <button
                  onClick={() => handleDelete(b.bannerId)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* SNOWBALL OUTPUT */}
      <div className="border p-4 rounded bg-orange-50">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Gift /> Snowball Promos
        </h3>

        {snowballs.map((s) => (
          <div key={s.id} className="border p-3 mb-3 bg-white rounded">
            <h4 className="font-bold">{s.title}</h4>
            <p>🎁 Reward: {s.reward}</p>
            <p>📦 Products:</p>
            <ul className="ml-5 list-disc text-sm">
              {s.products.map((p) => (
                <li key={p.productId}>{p.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[560px] space-y-6">

            {/* PRODUCT BANNER FORM */}
            <div className="border p-4 rounded">
              <h3 className="font-semibold mb-2">Product Banner</h3>
              <input
                placeholder="Banner URL"
                className="border p-2 w-full mb-2"
                value={bannerForm.bannerUrl}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, bannerUrl: e.target.value })
                }
              />
              <input
                placeholder="Redirect URL"
                className="border p-2 w-full mb-2"
                value={bannerForm.bannerUrlLink}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, bannerUrlLink: e.target.value })
                }
              />
              <button
                onClick={handleSaveBanner}
                className="bg-emerald-600 text-white px-4 py-2 rounded"
              >
                Save Banner
              </button>
            </div>

            {/* SNOWBALL FORM */}
            <div className="border p-4 rounded bg-orange-50 space-y-2">
              <h3 className="font-semibold flex items-center gap-1">
                <Gift size={16} /> Snowball Offer
              </h3>

              <input
                placeholder="Promo Title"
                className="border p-2 w-full"
                value={snowballForm.title}
                onChange={(e) =>
                  setSnowballForm({ ...snowballForm, title: e.target.value })
                }
              />

              <input
                placeholder="Reward"
                className="border p-2 w-full"
                value={snowballForm.reward}
                onChange={(e) =>
                  setSnowballForm({ ...snowballForm, reward: e.target.value })
                }
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={snowballForm.hasExpiry}
                  onChange={(e) =>
                    setSnowballForm({
                      ...snowballForm,
                      hasExpiry: e.target.checked,
                    })
                  }
                />
                Has Expiration
              </label>

              {snowballForm.hasExpiry && (
                <input
                  type="date"
                  className="border p-2 w-full"
                  value={snowballForm.expiry}
                  onChange={(e) =>
                    setSnowballForm({
                      ...snowballForm,
                      expiry: e.target.value,
                    })
                  }
                />
              )}

              {/* PRODUCT SELECTOR */}
              <div className="border p-2 rounded bg-white">
                <p className="text-sm font-semibold mb-1">
                  Select Products (From Product Monitoring)
                </p>

                {MOCK_PRODUCTS.map((p) => (
                  <label
                    key={p.productId}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedProducts.find(
                        (sp) => sp.productId === p.productId
                      )}
                      onChange={() => toggleProduct(p)}
                    />
                    {p.name} ({p.category})
                  </label>
                ))}
              </div>

              <button
                onClick={handleSaveSnowball}
                className="bg-orange-500 text-white px-4 py-2 rounded"
              >
                Save Snowball
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="border px-4 py-2 rounded"
            >
              Close
            </button>

          </div>
        </div>
      )}
    </motion.div>
  );
}
