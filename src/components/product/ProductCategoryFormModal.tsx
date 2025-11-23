import { useEffect, useState } from "react";
import {
  Button,
  ModalHeader,
  Modal,
  ModalBody,
  TextInput,
  Label,
} from "flowbite-react";
import Swal from "sweetalert2";
import { useCategoryContext } from "../../context/CategoryContext";

interface Props {
  show: boolean;
  onClose: () => void;
  editTarget: any | null;
}

export default function ProductCategoryFormModal({
  show,
  onClose,
  editTarget,
}: Props) {
  const { createCategory, updateCategoryData } = useCategoryContext();

  const [formData, setFormData] = useState({
    categoryName: "",
    categoryDescription: "",
  });

  useEffect(() => {
    if (editTarget) {
      setFormData({
        categoryName: editTarget.categoryName,
        categoryDescription: editTarget.categoryDescription,
      });
    } else {
      setFormData({
        categoryName: "",
        categoryDescription: "",
      });
    }
  }, [editTarget]);

  const handleSubmit = async () => {
    try {
      if (!formData.categoryName.trim()) {
        Swal.fire("Validation Error", "Category name is required.", "warning");
        return;
      }

      if (editTarget) {
        await updateCategoryData(editTarget.categoryId, formData);
        Swal.fire("Updated!", "Category updated successfully.", "success");
      } else {
        await createCategory(formData);
        Swal.fire("Added!", "Category created successfully.", "success");
      }

      onClose();
    } catch (err: any) {
      Swal.fire("Error", err.message || "Something went wrong", "error");
    }
  };

  return (
    <Modal show={show} size="md" popup onClose={onClose}>
      <ModalHeader />

      <ModalBody>
        {/* Premium Title */}
        <h3
          className="
            text-xl font-extrabold text-center mb-6
            text-transparent bg-clip-text 
            bg-gradient-to-r from-emerald-500 via-emerald-600 to-cyan-500
          "
        >
          {editTarget ? "Edit Category" : "Add New Category"}
        </h3>

        <div className="space-y-5">
          {/* CATEGORY NAME */}
          <div className="space-y-1">
            <Label className="font-semibold text-slate-700">
              Category Name
            </Label>
            <div
              className="
                rounded-2xl border border-emerald-300/60 bg-white/90
                backdrop-blur-sm px-3 py-2 shadow-sm
              "
            >
              <TextInput
                placeholder="e.g. Canned Goods"
                value={formData.categoryName}
                onChange={(e) =>
                  setFormData({ ...formData, categoryName: e.target.value })
                }
                className="focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1">
            <Label className="font-semibold text-slate-700">
              Description
            </Label>
            <div
              className="
                rounded-2xl border border-cyan-300/60 bg-white/90
                backdrop-blur-sm px-3 py-2 shadow-sm
              "
            >
              <TextInput
                placeholder="Optional description"
                value={formData.categoryDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categoryDescription: e.target.value,
                  })
                }
                className="focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              color="gray"
              onClick={onClose}
              className="
                rounded-full px-5 py-2 shadow-md hover:shadow-lg
                border border-slate-300 transition
              "
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              className="
                rounded-full px-5 py-2 font-semibold text-white
                bg-gradient-to-r from-emerald-600 to-cyan-500
                shadow-[0_8px_20px_rgba(0,200,180,0.45)]
                hover:brightness-110 transition
              "
            >
              {editTarget ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
