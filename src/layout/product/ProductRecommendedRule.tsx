"use client";

import React, { useState } from "react";
import { useRecommendationRules } from "../../context/RecommendationRulesContext";
import Swal from "sweetalert2";
import { format } from "date-fns";
import type { RecommendationRuleRequest, RecommendationRuleDTO } from "../../libs/models/product/RecommendedRule";

const RecommendationRulesPage: React.FC = () => {
  const { rules, addRule, updateRuleById, removeRule } = useRecommendationRules();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RecommendationRuleDTO | null>(null);

  const [form, setForm] = useState<RecommendationRuleRequest>({
    baseProductId: 0,
    recommendedProductIds: [],
    effectiveDate: "",
    expiryDate: "",
  });

  const openCreateModal = () => {
    setEditingRule(null);
    setForm({ baseProductId: 0, recommendedProductIds: [], effectiveDate: "", expiryDate: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (rule: RecommendationRuleDTO) => {
    setEditingRule(rule);
    setForm({
      baseProductId: rule.productId,
      recommendedProductIds: [], // You can fetch actual IDs here if needed
      effectiveDate: rule.effectiveDate,
      expiryDate: rule.expiryDate,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSaveRule = async () => {
    if (!form.baseProductId || form.recommendedProductIds.length === 0) {
      await Swal.fire("Validation", "Please fill all required fields", "warning");
      return;
    }

    try {
      if (editingRule) {
        await updateRuleById(editingRule.id, form);
        await Swal.fire("Updated", "Rule updated successfully!", "success");
      } else {
        await addRule(form);
        await Swal.fire("Created", "Rule created successfully!", "success");
      }
      closeModal();
    } catch (err: any) {
      await Swal.fire("Error", err.message || "Failed to save rule", "error");
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the rule permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });
    if (confirm.isConfirmed) {
      await removeRule(id);
      await Swal.fire("Deleted", "Rule has been removed.", "success");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Recommendation Rules</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={openCreateModal}
        >
          + Add Rule
        </button>
      </div>

      <table className="min-w-full bg-white shadow rounded-lg">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="py-3 px-4">Product</th>
            <th className="py-3 px-4">Recommended</th>
            <th className="py-3 px-4">Effective Date</th>
            <th className="py-3 px-4">Expiry Date</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <tr key={rule.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">{rule.productName}</td>
              <td className="py-3 px-4">{rule.recommendedNames.join(", ")}</td>
              <td className="py-3 px-4">{rule.effectiveDate ? format(new Date(rule.effectiveDate), "yyyy-MM-dd") : "-"}</td>
              <td className="py-3 px-4">{rule.expiryDate ? format(new Date(rule.expiryDate), "yyyy-MM-dd") : "-"}</td>
              <td className="py-3 px-4 text-right space-x-3">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => openEditModal(rule)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => handleDelete(rule.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <h2 className="text-xl font-semibold mb-4">
              {editingRule ? "Edit Recommendation Rule" : "Add New Recommendation Rule"}
            </h2>

            <div className="space-y-4">
              <input
                type="number"
                placeholder="Base Product ID"
                value={form.baseProductId}
                onChange={(e) => setForm({ ...form, baseProductId: Number(e.target.value) })}
                className="border w-full p-2 rounded"
              />

              <input
                type="text"
                placeholder="Recommended Product IDs (comma-separated)"
                onChange={(e) =>
                  setForm({
                    ...form,
                    recommendedProductIds: e.target.value
                      .split(",")
                      .map((id) => Number(id.trim()))
                      .filter((id) => !isNaN(id)),
                  })
                }
                className="border w-full p-2 rounded"
              />

              <input
                type="date"
                value={form.effectiveDate}
                onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
                className="border w-full p-2 rounded"
              />

              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="border w-full p-2 rounded"
              />
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRule}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingRule ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationRulesPage;
