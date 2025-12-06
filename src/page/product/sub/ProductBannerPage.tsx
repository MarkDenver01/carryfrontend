import { useState, useMemo } from "react";
import { Pagination } from "flowbite-react";
import Swal from "sweetalert2";
import { Search, Sparkles, Trash2, Plus, Link2, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

type ProductBanner = {
  bannerId: number;
  bannerUrl: string;      // CLOUDINARY URL
  bannerUrlLink: string;  // REDIRECT URL
};

export default function ProductBannerPage() {
  const [banners, setBanners] = useState<ProductBanner[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    bannerUrl: "",
    bannerUrlLink: "",
  });

  /** SAVE BANNER — URL ONLY */
  const handleSave = () => {
    if (!form.bannerUrl.trim()) {
      Swal.fire("Missing Banner URL", "Please paste the Cloudinary image URL.", "warning");
      return;
    }

    if (!form.bannerUrlLink.trim()) {
      Swal.fire("Missing Redirect URL", "Please enter a redirect link.", "warning");
      return;
    }

    const newBanner: ProductBanner = {
      bannerId: Date.now(),
      bannerUrl: form.bannerUrl,
      bannerUrlLink: form.bannerUrlLink,
    };

    setBanners((prev) => [...prev, newBanner]);

    Swal.fire("Success", "Banner added using URL only!", "success");

    setIsModalOpen(false);
    setForm({ bannerUrl: "", bannerUrlLink: "" });
  };

  /** DELETE */
  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Delete Banner?",
      text: "This will permanently remove the banner from UI list.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
    }).then((res) => {
      if (res.isConfirmed) {
        setBanners((prev) => prev.filter((b) => b.bannerId !== id));
        Swal.fire("Deleted!", "Banner removed.", "success");
      }
    });
  };

  /** SEARCH */
  const filtered = useMemo(() => {
    const t = search.toLowerCase();
    return banners.filter((b) =>
      b.bannerUrl.toLowerCase().includes(t) ||
      b.bannerUrlLink.toLowerCase().includes(t)
    );
  }, [banners, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative p-6 md:p-8 overflow-hidden"
    >
      {/* HEADER */}
      <div className="mb-8">
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
          Manage promotional banners using Cloudinary URLs.
        </div>

        <div className="mt-3 h-[3px] w-24 bg-gradient-to-r 
          from-emerald-400 via-emerald-500 to-transparent rounded-full"
        />
      </div>

      {/* CONTENT CARD */}
      <div className="rounded-2xl border border-emerald-200 bg-white/90 p-6 shadow-xl">
        {/* ADD BUTTON */}
        <div className="flex justify-between items-center mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2 rounded-full bg-gradient-to-r 
              from-emerald-600 via-emerald-500 to-cyan-400 text-white 
              font-semibold shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Banner (URL)
          </motion.button>
        </div>

        {/* SEARCH */}
        <div className="relative w-full max-w-sm mb-6">
          <input
            type="text"
            placeholder="Search banner URL or redirect URL…"
            className="w-full px-4 py-2 pl-11 rounded-full border border-emerald-200 text-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Search className="absolute left-3 top-2.5 text-emerald-500 w-5 h-5" />
        </div>

        {/* TABLE */}
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
              {paginated.length > 0 ? (
                paginated.map((item) => (
                  <tr key={item.bannerId} className="border-b hover:bg-emerald-50/50">
                    <td className="p-4">
                      <img
                        src={item.bannerUrl}
                        alt="Banner"
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
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center p-6 text-gray-500">
                    No banners found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 text-sm">
            <span>
              Showing { (currentPage - 1) * pageSize + 1 } – { Math.min(currentPage * pageSize, filtered.length) } of { filtered.length }
            </span>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} showIcons />
          </div>
        )}
      </div>

      {/* MODAL – URL ONLY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[420px] p-6 rounded-xl shadow-xl border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-600">
              <ImageIcon className="w-5 h-5" />
              Add Banner via URL
            </h2>

            {/* BANNER URL */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Banner Image URL (Cloudinary)</label>
              <input
                type="text"
                placeholder="https://res.cloudinary.com/.../banner.png"
                className="w-full border px-3 py-2 rounded text-sm"
                value={form.bannerUrl}
                onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
              />
            </div>

            {/* REDIRECT URL */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Redirect URL (click action)</label>
              <input
                type="text"
                placeholder="https://your-store.com/promo"
                className="w-full border px-3 py-2 rounded text-sm"
                value={form.bannerUrlLink}
                onChange={(e) => setForm({ ...form, bannerUrlLink: e.target.value })}
              />
            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setForm({ bannerUrl: "", bannerUrlLink: "" });
                }}
                className="px-4 py-2 border rounded text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-600 text-white rounded text-sm"
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
