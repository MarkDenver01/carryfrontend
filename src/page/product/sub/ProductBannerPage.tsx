import { useState, useMemo } from "react";
import { Pagination } from "flowbite-react";
import Swal from "sweetalert2";
import { Search, Sparkles, Trash2, Plus, Image as ImageIcon, Link2 } from "lucide-react";
import { motion } from "framer-motion";

type ProductBanner = {
  bannerId: number;
  bannerUrl: string;
  discountPromo: string;
  bannerUrlLink: string;
};

export default function ProductBannerPage() {
  const [banners, setBanners] = useState<ProductBanner[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    bannerFile: null as File | null,
    discountPromo: "",
    bannerUrlLink: "",
  });
  const [preview, setPreview] = useState("");

  /** HANDLE IMAGE PREVIEW */
  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setForm({ ...form, bannerFile: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  /** SAVE BANNER – UI ONLY (No API) */
  const handleSave = () => {
    if (!form.bannerFile) {
      Swal.fire("Missing Image", "Please upload a banner image.", "warning");
      return;
    }

    if (!form.discountPromo.trim()) {
      Swal.fire("Missing Promo", "Please enter discount / promo text.", "warning");
      return;
    }

    if (!form.bannerUrlLink.trim()) {
      Swal.fire("Missing Redirect URL", "Please enter a redirect URL.", "warning");
      return;
    }

    const newBanner: ProductBanner = {
      bannerId: Date.now(),
      bannerUrl: preview,
      discountPromo: form.discountPromo,
      bannerUrlLink: form.bannerUrlLink,
    };

    setBanners((prev) => [...prev, newBanner]);

    Swal.fire("Success", "Banner added (UI Only)", "success");

    // Reset
    setIsModalOpen(false);
    setForm({ bannerFile: null, discountPromo: "", bannerUrlLink: "" });
    setPreview("");
  };

  /** DELETE BANNER — UI ONLY */
  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Delete Banner?",
      text: "This will remove the banner from the UI list.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
    }).then((res) => {
      if (res.isConfirmed) {
        setBanners((prev) => prev.filter((b) => b.bannerId !== id));
        Swal.fire("Deleted!", "Banner removed from UI.", "success");
      }
    });
  };

  /** FILTER + SEARCH */
  const filtered = useMemo(() => {
    return banners.filter((b) => {
      const term = search.toLowerCase();
      return (
        b.discountPromo.toLowerCase().includes(term) ||
        b.bannerUrlLink.toLowerCase().includes(term)
      );
    });
  }, [banners, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative p-6 md:p-8 overflow-hidden"
    >
      {/* ===== BACKGROUND (same concept style) ===== */}
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

      {/* ===== HEADER (same vibe as ProductCategory) ===== */}
      <div className="mb-8 relative">
        <motion.h1
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="text-3xl font-extrabold tracking-tight bg-gradient-to-r 
            from-emerald-500 via-emerald-400 to-cyan-400 bg-clip-text text-transparent"
        >
          Product Banners
        </motion.h1>

        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Manage promotional banners displayed on your storefront.
        </div>

        <div
          className="mt-3 h-[3px] w-24 bg-gradient-to-r 
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
        {/* ADD BUTTON */}
        <div className="flex justify-between items-center mb-6">
          <motion.button
            whileHover={{ scale: 1.04 }}
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2 rounded-full bg-gradient-to-r 
              from-emerald-600 via-emerald-500 to-cyan-400 text-white 
              font-semibold shadow-lg hover:brightness-110 
              border border-emerald-300/80 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Banner
          </motion.button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full max-w-sm mb-6">
          <input
            type="text"
            placeholder="Search promo or URL…"
            className="w-full border border-emerald-200 rounded-full px-4 py-2 pl-11 
              shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 
              bg-white/95 text-sm text-slate-800 placeholder:text-slate-400"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Search className="absolute left-3 top-2.5 text-emerald-500 w-5 h-5" />
        </div>

        {/* ===== TABLE (same concept, pero for banners) ===== */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative w-full overflow-x-auto rounded-2xl 
            border border-emerald-200/60 bg-white/95 backdrop-blur-xl
            shadow-[0_14px_45px_rgba(15,23,42,0.15)]"
        >
          <table className="min-w-[900px] w-full text-sm text-gray-700">
            <thead className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-lg">
              <tr className="divide-x divide-emerald-300/30">
                <th className="p-4 font-semibold tracking-wide text-left">
                  Banner
                </th>
                <th className="p-4 font-semibold tracking-wide text-left">
                  Promo
                </th>
                <th className="p-4 font-semibold tracking-wide text-left">
                  URL Link
                </th>
                <th className="p-4 text-center font-semibold tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200/60">
              {paginated.length > 0 ? (
                paginated.map((item) => (
                  <motion.tr
                    key={item.bannerId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{
                      backgroundColor: "rgba(16,185,129,0.08)",
                      scale: 1.01,
                    }}
                    className="transition-all border-l-[4px] border-transparent hover:border-emerald-500"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {item.bannerUrl ? (
                          <img
                            src={item.bannerUrl}
                            className="h-14 w-32 object-cover rounded shadow-sm border border-emerald-100"
                            alt="banner"
                          />
                        ) : (
                          <div className="h-14 w-32 flex items-center justify-center rounded border border-dashed border-slate-300 text-xs text-slate-400">
                            No Image
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4 font-medium text-gray-800">
                      {item.discountPromo}
                    </td>

                    <td className="p-4 text-sm text-blue-600 underline cursor-pointer flex items-center gap-1">
                      <Link2 className="w-4 h-4" />
                      <span className="truncate max-w-xs">{item.bannerUrlLink}</span>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleDelete(item.bannerId)}
                          className="flex items-center justify-center p-2 text-white 
                            bg-gradient-to-r from-red-600 to-red-700 
                            hover:brightness-110 rounded-md shadow-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="p-4 text-center text-gray-500 border border-gray-300/40"
                  >
                    No banners found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>

        {/* PAGINATION */}
        {totalPages > 1 && (
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
                {Math.min(currentPage * pageSize, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800">
                {filtered.length}
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

      {/* ===== MODAL (with entity-like fields) ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[480px] p-6 rounded-[18px] shadow-2xl border border-emerald-100">
            <h2 className="text-xl font-semibold mb-4 text-emerald-600 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Add Product Banner
            </h2>

            {/* BANNER ID (auto display only) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banner ID
              </label>
              <input
                type="text"
                value={`AUTO-${Date.now()}`}
                disabled
                className="w-full px-3 py-2 bg-gray-100 text-gray-500 rounded border text-sm"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                This ID is generated automatically when you save the banner.
              </p>
            </div>

            {/* IMAGE UPLOAD */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Banner Image
              </label>
              <input type="file" accept="image/*" onChange={handleFile} />
              {preview && (
                <img
                  src={preview}
                  className="w-full h-40 object-cover rounded mt-3 shadow border border-emerald-100"
                  alt="preview"
                />
              )}
            </div>

            {/* PROMO TEXT */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Discount / Promo Text
              </label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded text-sm"
                placeholder="e.g., 50% OFF on selected items"
                value={form.discountPromo}
                onChange={(e) =>
                  setForm({ ...form, discountPromo: e.target.value })
                }
              />
            </div>

            {/* REDIRECT URL */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Redirect URL
              </label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded text-sm"
                placeholder="https://yourwebsite.com/special-offer"
                value={form.bannerUrlLink}
                onChange={(e) =>
                  setForm({ ...form, bannerUrlLink: e.target.value })
                }
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Customers will be redirected to this link when they click the banner.
              </p>
            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setForm({ bannerFile: null, discountPromo: "", bannerUrlLink: "" });
                  setPreview("");
                }}
                className="px-4 py-2 border rounded text-sm hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
              >
                Save Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
