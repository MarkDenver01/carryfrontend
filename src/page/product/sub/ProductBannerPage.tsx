import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
export default function ProductBannerPage() {
  const [banners, setBanners] = useState<any[]>([]);
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

    const newBanner = {
      bannerId: Date.now(),
      bannerUrl: preview,
      discountPromo: form.discountPromo,
      bannerUrlLink: form.bannerUrlLink,
    };

    setBanners([...banners, newBanner]);

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
    }).then((res) => {
      if (res.isConfirmed) {
        setBanners(banners.filter((b) => b.bannerId !== id));
        Swal.fire("Deleted!", "Banner removed from UI.", "success");
      }
    });
  };

  return (
    <div className="p-6">
      {/* PAGE HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Product Banner Management</h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 flex items-center gap-2 bg-primary text-white rounded-md"
        >
          <Plus size={18} />
          Add Banner
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left">
              <th className="p-3">Banner</th>
              <th className="p-3">Promo</th>
              <th className="p-3">URL Link</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {banners.map((item) => (
              <tr key={item.bannerId} className="border-b">
                <td className="p-3">
                  <img
                    src={item.bannerUrl}
                    className="h-16 w-40 object-cover rounded shadow-sm"
                    alt="banner"
                  />
                </td>

                <td className="p-3 font-medium">{item.discountPromo}</td>

                <td className="p-3 text-blue-600 underline cursor-pointer">
                  {item.bannerUrlLink}
                </td>

                <td className="p-3">
                  <button
                    onClick={() => handleDelete(item.bannerId)}
                    className="p-2 bg-red-500 text-white rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {banners.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-4 text-gray-500">
                  No banners yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[450px] p-6 rounded-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Add Product Banner</h2>

            {/* IMAGE */}
            <label className="block font-medium mb-1">Banner Image</label>
            <input type="file" accept="image/*" onChange={handleFile} />

            {preview && (
              <img
                src={preview}
                className="w-full h-40 object-cover rounded mt-3 shadow"
              />
            )}

            {/* PROMO */}
            <div className="mt-4">
              <label className="block font-medium mb-1">Promo Text</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                placeholder="e.g., 50% Off Today"
                value={form.discountPromo}
                onChange={(e) =>
                  setForm({ ...form, discountPromo: e.target.value })
                }
              />
            </div>

            {/* LINK */}
            <div className="mt-4">
              <label className="block font-medium mb-1">Redirect URL</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                placeholder="https://yourwebsite.com"
                value={form.bannerUrlLink}
                onChange={(e) =>
                  setForm({ ...form, bannerUrlLink: e.target.value })
                }
              />
            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-white rounded"
              >
                Save Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
