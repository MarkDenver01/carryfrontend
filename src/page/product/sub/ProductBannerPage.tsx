// src/page/marketing/ProductBannerPage.tsx

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  Search,
  Sparkles,
  LayoutGrid,
  Rows,
  Link2,
  Trash2,
  Gift,
  Plus,
  Info,
  XCircle,
  ChevronDown,
  Tag,
} from "lucide-react";
import { motion } from "framer-motion";
import { Pagination } from "flowbite-react";

// === API FUNCTIONS (BACKEND) ===
// NOTE: make sure to implement these in ApiGatewayDatasource
import {
  getAllBanners,
  createBanner,
  deleteBanner,
} from "../../../libs/ApiGatewayDatasource";

const getAllSnowballOffers = async () => {
  // TODO: replace with real backend call
  return [];
};

const createSnowballOffer = async (payload: any) => {
  // TODO: replace with real backend call
  return {
    id: Date.now(),
    ...payload,
    products: payload.productIds.map((id: number) => ({
      id,
      name: "Sample Product",
      categoryName: "Sample Category",
      imageUrl: "/placeholder.png",
      promoPrice: payload.promoPrices?.[id] ?? null,
    })),
  };
};

const deleteSnowballOffer = async (_id: number) => {
  // TODO: replace with real backend call
  return true;
};

import type { ProductBanner } from "../../../libs/models/product/ProductBanner";
import { useProductsContext } from "../../../context/ProductsContext";

/* =============================
   TYPES
============================= */

type SnowballOfferProduct = {
  id: number;
  name: string;
  categoryName?: string;
  imageUrl?: string;
  promoPrice?: number;
};

type SnowballOffer = {
  id: number;
  title: string;
  reward: string;
  requiredQty: number;
  hasExpiry: boolean;
  expiry?: string | null;
  terms: string;
  products: SnowballOfferProduct[];
  promoPrices?: Record<number, number>;
};

/* Tabs & view modes */
type PromoTab = "banners" | "snowballs";
type ViewMode = "table" | "grid";

export default function ProductBannerPage() {
  /* ===== CONTEXT: REAL PRODUCTS (FROM PRODUCT MONITORING) ===== */
  const { products } = useProductsContext();

  const promoProducts: SnowballOfferProduct[] = useMemo(
    () =>
      products.map((p: any) => ({
        id: p.id,
        name: p.name,
        categoryName: p.categoryName,
        imageUrl: p.imageUrl,
      })),
    [products]
  );

  /* ===== STATE: PRODUCT BANNERS (BACKEND) ===== */
  const [banners, setBanners] = useState<ProductBanner[]>([]);
  const [bannerSearch, setBannerSearch] = useState("");

  /* ===== STATE: SNOWBALL OFFERS (BACKEND) ===== */
  const [snowballs, setSnowballs] = useState<SnowballOffer[]>([]);
  const [snowballSearch, setSnowballSearch] = useState("");

  /* ===== UI STATE ===== */
  const [activeTab, setActiveTab] = useState<PromoTab>("banners");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [showModal, setShowModal] = useState(false);

  // detail slide panel (pwedeng banner o snowball)
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailType, setDetailType] = useState<"banner" | "snowball" | null>(
    null
  );
  const [selectedBannerDetail, setSelectedBannerDetail] =
    useState<ProductBanner | null>(null);
  const [selectedSnowballDetail, setSelectedSnowballDetail] =
    useState<SnowballOffer | null>(null);

  /* ===== BANNER FORM STATE ===== */
  const [bannerForm, setBannerForm] = useState({
    bannerUrl: "",
    bannerUrlLink: "",
  });

  /* ===== SNOWBALL FORM STATE ===== */
  const [snowballForm, setSnowballForm] = useState({
    title: "",
    reward: "",
    requiredQty: 1,
    hasExpiry: false,
    expiry: "",
    terms: "",
  });

  const [selectedProducts, setSelectedProducts] = useState<
    SnowballOfferProduct[]
  >([]);
  const [productSearch, setProductSearch] = useState("");

  // Category collapse state for product selector
  const [collapsedCategories, setCollapsedCategories] = useState<
    Record<string, boolean>
  >({});

  /* =============================
     LOAD DATA ON MOUNT
  ============================= */
  useEffect(() => {
    loadBanners();
    loadSnowballs();
  }, []);

  async function loadBanners() {
    try {
      const list = await getAllBanners();
      setBanners(list || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load banners.", "error");
    }
  }

  async function loadSnowballs() {
    try {
      const list = await getAllSnowballOffers();
      setSnowballs(list || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load snowball promos.", "error");
    }
  }

  /* =============================
     HANDLERS: SAVE BANNER
  ============================= */
  const handleSaveBanner = async () => {
    if (!bannerForm.bannerUrl.trim() || !bannerForm.bannerUrlLink.trim()) {
      Swal.fire("Missing Fields", "Please fill all banner fields.", "warning");
      return;
    }

    try {
      const saved = await createBanner({
        bannerUrl: bannerForm.bannerUrl.trim(),
        bannerUrlLink: bannerForm.bannerUrlLink.trim(),
      });

      setBanners((prev) => [saved, ...prev]);
      setBannerForm({ bannerUrl: "", bannerUrlLink: "" });

      Swal.fire("Success", "Banner created successfully!", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to create banner.", "error");
    }
  };

  /* =============================
     PRODUCT SELECTION HELPERS
  ============================= */

  const toggleProduct = (product: SnowballOfferProduct) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [
        ...prev,
        {
          ...product,
          promoPrice:
            typeof product.promoPrice === "number" ? product.promoPrice : 0,
        },
      ];
    });
  };

  const updateProductPromoPrice = (id: number, price: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              promoPrice: price,
            }
          : p
      )
    );
  };

  const toggleCategoryCollapse = (category: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const isProductSelected = (id: number) =>
    !!selectedProducts.find((p) => p.id === id);

  const isCategoryFullySelected = (products: SnowballOfferProduct[]) =>
    products.length > 0 &&
    products.every((p) => selectedProducts.some((sp) => sp.id === p.id));

  const toggleCategorySelectAll = (products: SnowballOfferProduct[]) => {
    setSelectedProducts((prev) => {
      const allSelected = products.every((p) =>
        prev.some((sp) => sp.id === p.id)
      );
      if (allSelected) {
        // remove all from this category
        const ids = new Set(products.map((p) => p.id));
        return prev.filter((p) => !ids.has(p.id));
      }
      // add missing from this category
      const ids = new Set(prev.map((p) => p.id));
      const toAdd = products
        .filter((p) => !ids.has(p.id))
        .map((p) => ({
          ...p,
          promoPrice: typeof p.promoPrice === "number" ? p.promoPrice : 0,
        }));
      return [...prev, ...toAdd];
    });
  };

  /* =============================
     PRODUCT FILTER + CATEGORY GROUPING
  ============================= */

  const groupedPromoProducts = useMemo(() => {
    const query = productSearch.toLowerCase();
    const filtered = promoProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.categoryName || "").toLowerCase().includes(query)
    );

    const map = new Map<string, SnowballOfferProduct[]>();

    filtered.forEach((p) => {
      const category = p.categoryName?.trim() || "Uncategorized";
      if (!map.has(category)) {
        map.set(category, []);
      }
      map.get(category)!.push(p);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, products]) => ({ category, products }));
  }, [promoProducts, productSearch]);

  /* =============================
     HANDLERS: SAVE SNOWBALL OFFER
  ============================= */
  const handleSaveSnowball = async () => {
    if (!snowballForm.title.trim() || !snowballForm.reward.trim()) {
      Swal.fire(
        "Missing Fields",
        "Please fill promo title and reward.",
        "warning"
      );
      return;
    }

    if (selectedProducts.length === 0) {
      Swal.fire(
        "No Products",
        "Select at least one product for this promo.",
        "warning"
      );
      return;
    }

    // Validate promo prices (REQUIRED)
    const invalid = selectedProducts.find(
      (p) =>
        typeof p.promoPrice !== "number" ||
        isNaN(p.promoPrice) ||
        p.promoPrice <= 0
    );

    if (invalid) {
      Swal.fire(
        "Missing Promo Price",
        `Please set a valid promo price for "${invalid.name}".`,
        "warning"
      );
      return;
    }

    if (snowballForm.hasExpiry && !snowballForm.expiry) {
      Swal.fire("Missing Expiry", "Please select expiry date.", "warning");
      return;
    }

    // Build promoPrices map
    const promoPrices: Record<number, number> = {};
    selectedProducts.forEach((p) => {
      if (typeof p.promoPrice === "number") {
        promoPrices[p.id] = p.promoPrice;
      }
    });

    const payload = {
      title: snowballForm.title.trim(),
      reward: snowballForm.reward.trim(),
      requiredQty: snowballForm.requiredQty || 1,
      hasExpiry: snowballForm.hasExpiry,
      expiry: snowballForm.hasExpiry ? snowballForm.expiry || null : null,
      terms: snowballForm.terms.trim(),
      // VERY IMPORTANT: These product IDs will be used by mobile app
      productIds: selectedProducts.map((p) => p.id),
      promoPrices,
    };

    try {
      const saved = await createSnowballOffer(payload);

      const enriched: SnowballOffer = {
        ...saved,
        promoPrices,
        products:
          saved.products?.map((p: any) => ({
            ...p,
            promoPrice: promoPrices[p.id],
          })) ?? [],
      };

      setSnowballs((prev) => [enriched, ...prev]);

      // reset form
      setSnowballForm({
        title: "",
        reward: "",
        requiredQty: 1,
        hasExpiry: false,
        expiry: "",
        terms: "",
      });
      setSelectedProducts([]);
      setProductSearch("");

      Swal.fire("Success", "Snowball promo created!", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to create snowball promo.", "error");
    }
  };

  /* =============================
     DELETE HANDLERS
  ============================= */
  const handleDeleteBanner = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Banner?",
      text: "This will remove the banner from the system.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.bannerId !== id));
      Swal.fire("Deleted", "Banner removed successfully.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete banner.", "error");
    }
  };

  const handleDeleteSnowball = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Snowball Promo?",
      text: "This will remove the promo and will no longer show on mobile.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteSnowballOffer(id);
      setSnowballs((prev) => prev.filter((s) => s.id !== id));
      Swal.fire("Deleted", "Snowball promo removed.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete snowball promo.", "error");
    }
  };

  /* =============================
     FILTER + PAGINATION (BANNERS & SNOWBALLS)
  ============================= */

  // BANNERS
  const filteredBanners = useMemo(() => {
    const q = bannerSearch.toLowerCase();
    return banners.filter(
      (b) =>
        b.bannerUrl.toLowerCase().includes(q) ||
        b.bannerUrlLink.toLowerCase().includes(q)
    );
  }, [banners, bannerSearch]);

  // SNOWBALLS
  const filteredSnowballs = useMemo(() => {
    const q = snowballSearch.toLowerCase();
    return snowballs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.reward.toLowerCase().includes(q)
    );
  }, [snowballs, snowballSearch]);

  const activeData =
    activeTab === "banners" ? filteredBanners : filteredSnowballs;

  const totalPages = Math.ceil(activeData.length / pageSize) || 1;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = currentPage * pageSize;
    return activeData.slice(start, end);
  }, [activeData, currentPage, pageSize]);

  /* =============================
     DETAIL PANEL HANDLERS
  ============================= */
  const openBannerDetail = (banner: ProductBanner) => {
    setSelectedBannerDetail(banner);
    setSelectedSnowballDetail(null);
    setDetailType("banner");
    setDetailOpen(true);
  };

  const openSnowballDetail = (snowball: SnowballOffer) => {
    setSelectedSnowballDetail(snowball);
    setSelectedBannerDetail(null);
    setDetailType("snowball");
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailType(null);
    setSelectedBannerDetail(null);
    setSelectedSnowballDetail(null);
  };

  /* =============================
     UTIL: PROMO PRICE LABEL
  ============================= */
  const getSnowballMinPriceLabel = (snowball: SnowballOffer) => {
    const prices = (snowball.products || [])
      .map((p) => p.promoPrice)
      .filter(
        (v): v is number => typeof v === "number" && !isNaN(v) && v > 0
      );
    if (!prices.length) return null;
    const min = Math.min(...prices);
    return `From ₱${min.toFixed(2)}`;
  };

  /* =============================
     RENDER
  ============================= */
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative p-6 md:p-8 overflow-hidden"
    >
      {/* ===== BACKGROUND GRID + BLOBS ===== */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div
          className="w-full h-full opacity-30 mix-blend-soft-light 
          bg-[linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),
          linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)]
          bg-[size:42px_42px]"
        />
        <motion.div
          className="absolute -top-20 -left-16 h-64 w-64 bg-emerald-400/20 blur-3xl"
          animate={{ x: [0, 18, 8, -8, 0], y: [0, 10, 20, 6, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 right-[-3rem] h-72 w-72 bg-cyan-400/20 blur-3xl"
          animate={{ x: [0, -20, -30, -10, 0], y: [0, -8, -18, -4, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ===== HEADER ===== */}
      <div className="mb-8 relative">
        <motion.h1
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="text-3xl font-extrabold tracking-tight bg-gradient-to-r 
            from-emerald-500 via-emerald-400 to-cyan-400 bg-clip-text text-transparent"
        >
          Promo Center
        </motion.h1>

        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Manage homepage banners & Snowball promo offers with dedicated promo
          pricing for each product.
        </div>

        <div
          className="mt-3 h-[3px] w-28 bg-gradient-to-r 
          from-emerald-400 via-emerald-500 to-transparent rounded-full"
        />
      </div>

      {/* ===== CONTENT CARD ===== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative rounded-[24px] border border-emerald-200/80 
          bg-gradient-to-br from-white/96 via-slate-50/98 to-emerald-50/60 
          shadow-[0_18px_55px_rgba(15,23,42,0.28)] backdrop-blur-xl p-6 overflow-hidden"
      >
        {/* TOP BAR: Add + Search + Tabs + View Toggle */}
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
          {/* Left: Add button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            onClick={() => setShowModal(true)}
            className="px-5 py-2 rounded-full bg-gradient-to-r 
              from-emerald-600 via-emerald-500 to-cyan-400 text-white 
              font-semibold shadow-lg hover:brightness-110 
              border border-emerald-300/80 w-full md:w-auto text-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Banner / Snowball Promo</span>
          </motion.button>

          {/* Middle: Search input (depends on tab) */}
          <div className="relative w-full md:max-w-sm">
            <input
              type="text"
              placeholder={
                activeTab === "banners"
                  ? "Search banners by URL or link…"
                  : "Search snowball promos by title or reward…"
              }
              className="w-full border border-emerald-200 rounded-full px-4 py-2 pl-11 
                shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 
                bg-white/95 text-sm text-slate-800 placeholder:text-slate-400"
              value={activeTab === "banners" ? bannerSearch : snowballSearch}
              onChange={(e) => {
                if (activeTab === "banners") setBannerSearch(e.target.value);
                else setSnowballSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Search className="absolute left-3 top-2.5 text-emerald-500 w-5 h-5" />
          </div>

          {/* Right: Tabs + View toggle */}
          <div className="flex flex-col items-end gap-2">
            {/* Tab toggle: Banners / Snowballs */}
            <div className="inline-flex items-center rounded-full border border-emerald-200 bg-white/80 shadow-sm overflow-hidden">
              <button
                onClick={() => {
                  setActiveTab("banners");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs flex items-center gap-1 ${
                  activeTab === "banners"
                    ? "bg-emerald-500 text-white"
                    : "text-slate-600 hover:bg-emerald-50"
                }`}
              >
                <Rows className="w-4 h-4" />
                <span>Banners</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("snowballs");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs flex items-center gap-1 ${
                  activeTab === "snowballs"
                    ? "bg-emerald-500 text-white"
                    : "text-slate-600 hover:bg-emerald-50"
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>Snowball Offers</span>
              </button>
            </div>

            {/* View mode toggle (list/grid) */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                View
              </span>
              <div className="inline-flex items-center rounded-full border border-emerald-200 bg-white/80 shadow-sm overflow-hidden">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1.5 text-xs flex items-center gap-1 ${
                    viewMode === "table"
                      ? "bg-emerald-500 text-white"
                      : "text-slate-600 hover:bg-emerald-50"
                  }`}
                >
                  <Rows className="w-4 h-4" />
                  <span>List</span>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 text-xs flex items-center gap-1 ${
                    viewMode === "grid"
                      ? "bg-emerald-500 text-white"
                      : "text-slate-600 hover:bg-emerald-50"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>Grid</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== TABLE / GRID WRAPPER ===== */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative w-full overflow-x-auto rounded-2xl 
            border border-emerald-200/60 bg-white/95 backdrop-blur-xl
            shadow-[0_14px_45px_rgba(15,23,42,0.15)] p-1.5"
        >
          {viewMode === "table" ? (
            // ==========================
            // LIST / TABLE VIEW
            // ==========================
            activeTab === "banners" ? (
              <table className="min-w-[800px] w-full text-sm text-gray-700">
                <thead className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-lg">
                  <tr className="divide-x divide-emerald-300/30">
                    <th className="p-4 font-semibold tracking-wide text-left">
                      Banner
                    </th>
                    <th className="p-4 font-semibold tracking-wide text-left">
                      Redirect URL
                    </th>
                    <th className="p-4 text-center font-semibold tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((b: any) => (
                      <motion.tr
                        key={b.bannerId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{
                          backgroundColor: "rgba(16,185,129,0.06)",
                          scale: 1.01,
                        }}
                        className="transition-all border-l-[4px] border-transparent hover:border-emerald-500 cursor-pointer"
                        onClick={() => openBannerDetail(b)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={b.bannerUrl}
                              alt="Banner"
                              className="h-14 w-40 object-cover rounded-lg border border-slate-200"
                            />
                          </div>
                        </td>
                        <td className="p-4 text-blue-700 break-all">
                          <div className="flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs">{b.bannerUrlLink}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <button
                              className="flex items-center gap-1 px-3 py-1.5 text-xs text-white 
                                bg-gradient-to-r from-red-600 to-red-700 
                                hover:brightness-110 rounded-md shadow-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBanner(b.bannerId);
                              }}
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-4 text-center text-gray-500 border border-gray-300/40"
                      >
                        No banners found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              // TABLE VIEW - SNOWBALL OFFERS
              <table className="min-w-[900px] w-full text-sm text-gray-700">
                <thead className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-lg">
                  <tr className="divide-x divide-emerald-300/30">
                    <th className="p-4 font-semibold tracking-wide text-left">
                      Promo Title
                    </th>
                    <th className="p-4 font-semibold tracking-wide text-left">
                      Reward
                    </th>
                    <th className="p-4 font-semibold tracking-wide text-left">
                      Products
                    </th>
                    <th className="p-4 font-semibold tracking-wide text-left">
                      Promo Price
                    </th>
                    <th className="p-4 font-semibold tracking-wide text-left">
                      Expiry
                    </th>
                    <th className="p-4 text-center font-semibold tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((s: any) => {
                      const productCount = s.products?.length || 0;
                      const priceLabel = getSnowballMinPriceLabel(s);
                      return (
                        <motion.tr
                          key={s.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          whileHover={{
                            backgroundColor: "rgba(251,146,60,0.06)",
                            scale: 1.01,
                          }}
                          className="transition-all border-l-[4px] border-transparent hover:border-orange-400 cursor-pointer"
                          onClick={() => openSnowballDetail(s)}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {s.title}
                              </span>
                              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-orange-100 text-orange-700 border border-orange-200/80">
                                SNOWBALL
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-gray-700">
                            🎁 {s.reward}
                          </td>
                          <td className="p-4 text-gray-700">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-full 
                              bg-indigo-50 text-indigo-700 border border-indigo-200"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              {productCount} product
                              {productCount === 1 ? "" : "s"}
                            </span>
                          </td>
                          <td className="p-4 text-gray-700">
                            {priceLabel ? (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-full
                                bg-emerald-50 text-emerald-700 border border-emerald-200"
                              >
                                <Tag className="w-3.5 h-3.5" />
                                {priceLabel}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">
                                No promo prices
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-gray-700">
                            {s.hasExpiry && s.expiry ? (
                              <span className="text-xs text-slate-700">
                                ⏰ {s.expiry}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">
                                No expiry
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-3">
                              <button
                                className="flex items-center gap-1 px-3 py-1.5 text-xs text-white 
                                  bg-gradient-to-r from-red-600 to-red-700 
                                  hover:brightness-110 rounded-md shadow-md"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSnowball(s.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-4 text-center text-gray-500 border border-gray-300/40"
                      >
                        No snowball promos found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )
          ) : (
            // ==========================
            // GRID VIEW
            // ==========================
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedData.length > 0 ? (
                paginatedData.map((item: any) => {
                  if (activeTab === "banners") {
                    const b = item as ProductBanner;
                    return (
                      <motion.div
                        key={b.bannerId}
                        whileHover={{
                          y: -3,
                          boxShadow: "0 18px 40px rgba(15,23,42,0.20)",
                        }}
                        className="relative rounded-2xl border border-emerald-100/80 bg-white/95 p-4 cursor-pointer 
                          transition-all flex flex-col gap-3"
                        onClick={() => openBannerDetail(b)}
                      >
                        <img
                          src={b.bannerUrl}
                          alt="Banner"
                          className="w-full h-32 rounded-xl object-cover border border-slate-200"
                        />
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] text-slate-400 uppercase tracking-[0.12em]">
                            Homepage Banner
                          </span>
                          <div className="flex items-center gap-2 text-xs text-blue-700 break-all">
                            <Link2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{b.bannerUrlLink}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  } else {
                    const s = item as SnowballOffer;
                    const count = s.products?.length || 0;
                    const priceLabel = getSnowballMinPriceLabel(s);
                    return (
                      <motion.div
                        key={s.id}
                        whileHover={{
                          y: -3,
                          boxShadow: "0 18px 40px rgba(15,23,42,0.20)",
                        }}
                        className="relative rounded-2xl border border-orange-100/80 bg-white/95 p-4 cursor-pointer 
                          transition-all flex flex-col gap-3"
                        onClick={() => openSnowballDetail(s)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="inline-flex items-center gap-2 mb-1">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                                Snowball Offer
                              </span>
                              <span className="text-[11px] text-slate-400 uppercase tracking-[0.12em]">
                                {count} product{count === 1 ? "" : "s"}
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
                              {s.title}
                            </h3>
                          </div>
                          {priceLabel && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-full
                              bg-emerald-50 text-emerald-700 border border-emerald-200"
                            >
                              <Tag className="w-3 h-3" />
                              {priceLabel}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-3">
                          🎁 {s.reward}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 text-emerald-500" />
                            Click to view details
                          </span>
                          {s.hasExpiry && s.expiry && (
                            <span className="text-[11px] text-orange-600">
                              ⏰ {s.expiry}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  }
                })
              ) : (
                <div className="col-span-full py-6 text-center text-sm text-slate-500">
                  {activeTab === "banners"
                    ? "No banners found."
                    : "No snowball promos found."}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* PAGINATION */}
        {activeData.length > 0 && (
          <div
            className="flex flex-col gap-2 sm:flex-row sm:items-center 
            sm:justify-between mt-6 text-sm text-gray-600"
          >
            <span>
              Showing{" "}
              <span className="font-semibold text-gray-800">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-800">
                {Math.min(currentPage * pageSize, activeData.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800">
                {activeData.length}
              </span>{" "}
              entries
            </span>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              showIcons
              className="shadow-sm"
            />
          </div>
        )}
      </motion.div>

      {/* ===== DETAIL SLIDE PANEL ===== */}
      {detailOpen && detailType && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="h-full w-full max-w-md bg-white shadow-2xl border-l border-emerald-100 flex flex-col"
          >
            {/* HEADER */}
            <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-500/10 via-white to-cyan-500/10 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  {detailType === "banner"
                    ? "Banner Details"
                    : "Snowball Promo Details"}
                </p>
                <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                  {detailType === "banner"
                    ? selectedBannerDetail?.bannerUrlLink
                    : selectedSnowballDetail?.title}
                </p>
              </div>
              <button
                onClick={closeDetail}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {detailType === "banner" && selectedBannerDetail && (
                <>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
                      Preview
                    </p>
                    <img
                      src={selectedBannerDetail.bannerUrl}
                      alt="Banner Preview"
                      className="w-full h-40 rounded-xl object-cover border border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
                      Redirect URL
                    </p>
                    <div className="flex items-center gap-2 text-xs text-blue-700 break-all">
                      <Link2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{selectedBannerDetail.bannerUrlLink}</span>
                    </div>
                  </div>
                </>
              )}

              {detailType === "snowball" && selectedSnowballDetail && (
                <>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
                      Reward
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      🎁 {selectedSnowballDetail.reward}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
                      Terms & Conditions
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {selectedSnowballDetail.terms || (
                        <span className="italic text-slate-400">
                          No terms provided.
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5 flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-emerald-800">
                        Required Qty
                      </span>
                      <span className="text-base font-bold text-emerald-700">
                        {selectedSnowballDetail.requiredQty}
                      </span>
                    </div>
                    <div className="rounded-xl border border-orange-100 bg-orange-50/70 px-3 py-2.5 flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-orange-800">
                        Expiry
                      </span>
                      <span className="text-xs text-slate-800">
                        {selectedSnowballDetail.hasExpiry &&
                        selectedSnowballDetail.expiry
                          ? `⏰ ${selectedSnowballDetail.expiry}`
                          : "No expiry"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
                      Products in this promo
                    </p>

                    {selectedSnowballDetail.products?.length ? (
                      selectedSnowballDetail.products.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
                        >
                          <img
                            src={p.imageUrl || "/placeholder.png"}
                            alt={p.name}
                            className="w-8 h-8 rounded-md object-cover border border-slate-200"
                          />
                          <div className="flex flex-col flex-1">
                            <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-slate-500 line-clamp-1">
                              {p.categoryName || "No category"}
                            </span>
                          </div>
                          {typeof p.promoPrice === "number" &&
                            p.promoPrice > 0 && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-full
                                bg-emerald-50 text-emerald-700 border border-emerald-200"
                              >
                                <Tag className="w-3 h-3" />
                                ₱{p.promoPrice.toFixed(2)}
                              </span>
                            )}
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        No products attached to this promo.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* FOOTER */}
            <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between">
              <button
                onClick={closeDetail}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full hover:bg-slate-100 transition"
              >
                Close
              </button>

              {detailType === "snowball" && selectedSnowballDetail && (
                <button
                  onClick={() => handleDeleteSnowball(selectedSnowballDetail.id)}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Promo
                </button>
              )}
              {detailType === "banner" && selectedBannerDetail && (
                <button
                  onClick={() =>
                    handleDeleteBanner(selectedBannerDetail.bannerId)
                  }
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Banner
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* ===== MODAL: ADD BANNER + SNOWBALL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-500/10 via-white to-orange-400/10 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Promo Setup
                </p>
                <p className="text-sm text-slate-700">
                  Homepage Product Banner and SnowBall promos with dedicated promo prices.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Modal content: 3 columns */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* LEFT: Banner form */}
                <div className="border border-emerald-100 rounded-xl p-4 bg-emerald-50/40 space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2 text-emerald-800">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs">
                      1
                    </span>
                    Homepage Banner
                  </h3>
                  <p className="text-xs text-slate-600">
                    Upload a banner that will be shown at the top of the mobile
                    home screen. Clicking it will redirect to the URL below.
                  </p>

                  <div className="space-y-2 mt-2">
                    <label className="text-xs font-medium text-slate-700">
                      Banner Image URL
                    </label>
                    <input
                      placeholder="https://cdn.yourstore.com/banners/sale-2025.png"
                      className="border border-emerald-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={bannerForm.bannerUrl}
                      onChange={(e) =>
                        setBannerForm({
                          ...bannerForm,
                          bannerUrl: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">
                      Redirect URL
                    </label>
                    <input
                      placeholder="https://yourstore.com/landing-page"
                      className="border border-emerald-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={bannerForm.bannerUrlLink}
                      onChange={(e) =>
                        setBannerForm({
                          ...bannerForm,
                          bannerUrlLink: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSaveBanner}
                      className="px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-md"
                    >
                      Save Banner
                    </button>
                  </div>
                </div>

                {/* MIDDLE: Snowball promo details */}
                <div className="border border-orange-100 rounded-xl p-4 bg-orange-50/40 space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2 text-orange-800">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-xs">
                      2
                    </span>
                    Snowball Offer Details
                  </h3>
                  <p className="text-xs text-slate-600">
                    Define the main details of your Snowball promo. Products and
                    promo pricing are configured on the right.
                  </p>

                  <div className="space-y-2 mt-2">
                    <label className="text-xs font-medium text-slate-700">
                      Promo Title
                    </label>
                    <input
                      placeholder="Weekend Grocery Snowball"
                      className="border border-orange-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={snowballForm.title}
                      onChange={(e) =>
                        setSnowballForm({
                          ...snowballForm,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">
                      Reward
                    </label>
                    <input
                      placeholder="Free 1L Softdrinks for every 5 items"
                      className="border border-orange-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={snowballForm.reward}
                      onChange={(e) =>
                        setSnowballForm({
                          ...snowballForm,
                          reward: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700">
                        Required Quantity
                      </label>
                      <input
                        type="number"
                        min={1}
                        className="border border-orange-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={snowballForm.requiredQty}
                        onChange={(e) =>
                          setSnowballForm({
                            ...snowballForm,
                            requiredQty: Number(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700">
                        Expiry
                      </label>
                      <div className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={snowballForm.hasExpiry}
                          onChange={(e) =>
                            setSnowballForm({
                              ...snowballForm,
                              hasExpiry: e.target.checked,
                              expiry: e.target.checked
                                ? snowballForm.expiry
                                : "",
                            })
                          }
                        />
                        <span>Has expiration date</span>
                      </div>
                      {snowballForm.hasExpiry && (
                        <input
                          type="date"
                          className="border border-orange-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          value={snowballForm.expiry}
                          onChange={(e) =>
                            setSnowballForm({
                              ...snowballForm,
                              expiry: e.target.value,
                            })
                          }
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">
                      Terms & Conditions (optional)
                    </label>
                    <textarea
                      rows={5}
                      className="border border-orange-200 rounded-lg px-3 py-2 w-full text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                      placeholder="Write any additional mechanics here…"
                      value={snowballForm.terms}
                      onChange={(e) =>
                        setSnowballForm({
                          ...snowballForm,
                          terms: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="pt-3 flex flex-col gap-2 border-t border-orange-100">
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>
                        Selected products:{" "}
                        <span className="font-semibold">
                          {selectedProducts.length}
                        </span>
                      </span>
                      {selectedProducts.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Tag className="w-3 h-3" />
                          Promo price required for each
                        </span>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveSnowball}
                        className="px-4 py-2 rounded-full bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 shadow-md flex items-center gap-1"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        Save Snowball Promo
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Product selector with promo price */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3 flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm flex items-center gap-2 text-slate-800">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs">
                        3
                      </span>
                      Products & Promo Prices
                    </h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      From Product Monitoring
                    </span>
                  </div>

                  {/* Search inside product list */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products or categories…"
                      className="w-full border border-slate-200 rounded-full px-3 py-1.5 pl-9 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white/80"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                    <Search className="absolute left-2 top-1.5 w-4 h-4 text-slate-400" />
                  </div>

                  {/* Product groups */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[440px] mt-1">
                    {groupedPromoProducts.length ? (
                      groupedPromoProducts.map(({ category, products }) => {
                        const collapsed = collapsedCategories[category] ?? false;
                        const fullySelected =
                          products.length > 0 &&
                          isCategoryFullySelected(products);

                        return (
                          <div
                            key={category}
                            className="rounded-lg border border-slate-200 bg-white/90 overflow-hidden"
                          >
                            {/* Category header */}
                            <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50">
                              <div
                                className="flex items-center gap-2 flex-1"
                                onClick={() => toggleCategoryCollapse(category)}
                              >
                                <ChevronDown
                                  className={`w-4 h-4 text-slate-500 transition-transform ${
                                    collapsed ? "-rotate-90" : "rotate-0"
                                  }`}
                                />
                                <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                                  {category}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  ({products.length})
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-slate-600">
                                <input
                                  type="checkbox"
                                  checked={fullySelected}
                                  onChange={() =>
                                    toggleCategorySelectAll(products)
                                  }
                                  className="w-3.5 h-3.5"
                                />
                                <span className="mr-1">Select all</span>
                              </div>
                            </div>

                            {/* Category body */}
                            {!collapsed && (
                              <div className="border-t border-slate-100 divide-y divide-slate-100">
                                {products.map((p) => {
                                  const checked = isProductSelected(p.id);
                                  const selected = selectedProducts.find(
                                    (sp) => sp.id === p.id
                                  );
                                  const promoPrice =
                                    typeof selected?.promoPrice === "number"
                                      ? selected.promoPrice
                                      : 0;

                                  return (
                                    <div
                                      key={p.id}
                                      className={`flex items-center gap-2 px-3 py-1.5 text-[11px] ${
                                        checked
                                          ? "bg-emerald-50/60"
                                          : "bg-white"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 flex-1">
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() => toggleProduct(p)}
                                          className="w-3.5 h-3.5"
                                        />
                                        <div className="flex flex-col flex-1">
                                          <span className="font-medium text-slate-800 line-clamp-1">
                                            {p.name}
                                          </span>
                                          <span className="text-[10px] text-slate-500 line-clamp-1">
                                            {p.categoryName || "No category"}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Promo price field (only editable when selected) */}
                                      <div className="flex items-center gap-1">
                                        <span className="text-[10px] text-slate-500">
                                          ₱
                                        </span>
                                        <input
                                          type="number"
                                          min={0}
                                          step="0.01"
                                          disabled={!checked}
                                          className={`w-20 px-2 py-1 rounded-md border text-[11px] focus:outline-none focus:ring-1 ${
                                            checked
                                              ? "border-emerald-300 focus:ring-emerald-400 bg-white"
                                              : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                                          }`}
                                          value={checked ? promoPrice : ""}
                                          onChange={(e) =>
                                            updateProductPromoPrice(
                                              p.id,
                                              Number(e.target.value) || 0
                                            )
                                          }
                                          placeholder="0.00"
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-[11px] text-slate-400 italic px-1">
                        No products found. Make sure products are added in
                        Product Monitoring.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
