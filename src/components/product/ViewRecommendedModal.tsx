import { useEffect, useState } from "react";
import { Modal, Spinner, Button } from "flowbite-react";
import { fetchAllRules } from "../../libs/ApiGatewayDatasource";
import type { RecommendationRuleDTO } from "../../libs/models/product/RecommendedRule";

interface Props {
  show: boolean;
  onClose: () => void;
  productId: number | null;
}

export default function ViewRecommendedModal({ show, onClose, productId }: Props) {
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState<RecommendationRuleDTO[]>([]);

  useEffect(() => {
    const fetchRecommended = async () => {
      if (!productId) return;
      setLoading(true);
      try {
        const data = await fetchAllRules();
        const filtered = data.filter((r) => r.productId === productId);
        setRules(filtered);
      } catch (err) {
        console.error("Error loading recommendation rules", err);
      } finally {
        setLoading(false);
      }
    };

    if (show) fetchRecommended();
  }, [show, productId]);

  /** 🔁 Navigate to Recommendation Rules page */
  const handleGoToRules = () => {
    window.location.href = "/dashboard/recommendations"; // or your actual route
  };

  return (
    <Modal show={show} onClose={onClose} size="xl" popup>
      <div className="bg-white rounded-lg shadow-lg">
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-3 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Recommended Products
          </h3>
          <Button color="gray" size="xs" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* BODY */}
        <div className="px-6 py-4 max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : rules.length > 0 ? (
            rules.map((rule) => (
              <div
                key={rule.id}
                className="border border-emerald-200 rounded-lg mb-6 shadow-sm"
              >
                <div className="flex justify-between items-center bg-emerald-50 px-4 py-2 rounded-t-lg">
                  <p className="text-sm text-emerald-800 font-medium">
                    Effective: {rule.effectiveDate} → Expiry: {rule.expiryDate}
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      rule.active
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-red-100 text-red-700 border border-red-300"
                    }`}
                  >
                    {rule.active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-t border-gray-200 text-sm text-left text-gray-700">
                    <thead className="bg-emerald-600 text-white">
                      <tr>
                        <th className="p-3 border font-medium">
                          Recommended Product Names
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rule.recommendedNames.map((name, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition">
                          <td className="p-3 border font-medium">{name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-gray-600 mb-4 text-center">
                No recommendations found for this product.
              </p>
              <Button
                onClick={handleGoToRules}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm"
              >
                Go to Recommendation Rules
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
