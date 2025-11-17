import { useEffect, useState } from "react";
import { Button, ModalHeader, Modal, ModalBody, TextInput, Label } from "flowbite-react";
import Swal from "sweetalert2";
import { useCategoryContext } from "../../context/CategoryContext";

interface Props {
  show: boolean;
  onClose: () => void;
  editTarget: any | null;
}

export default function ProductCategoryFormModal({ show, onClose, editTarget }: Props) {
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
        <h3 className="text-lg font-bold mb-4">
          {editTarget ? "Edit Category" : "Add New Category"}
        </h3>

        <div className="mb-3">
          <Label>Category Name</Label>
          <TextInput
            placeholder="e.g. Canned Goods"
            value={formData.categoryName}
            onChange={(e) =>
              setFormData({ ...formData, categoryName: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <Label>Description</Label>
          <TextInput
            placeholder="Optional description"
            value={formData.categoryDescription}
            onChange={(e) =>
              setFormData({
                ...formData,
                categoryDescription: e.target.value,
              })
            }
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button color="gray" onClick={onClose}>
            Cancel
          </Button>

          <Button color="blue" onClick={handleSubmit}>
            {editTarget ? "Update" : "Add"}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
}
