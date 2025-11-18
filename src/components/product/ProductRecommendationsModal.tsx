import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "flowbite-react";
import type { RecommendationRuleDTO } from "../../libs/models/product/RecommendedRule";

interface Props {
  show: boolean;
  onClose: () => void;
  recommendations: RecommendationRuleDTO[];
}

export default function ProductRecommendationsModal({
  show,
  onClose,
  recommendations,
}: Props) {
  return (
    <Modal show={show} onClose={onClose} size="lg">
      <ModalHeader>Recommended Products</ModalHeader>

      <ModalBody>
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rule) => (
              <div
                key={rule.id}
                className="border border-gray-200 rounded-md p-4 bg-gray-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-emerald-700">
                    {rule.productName}
                  </h4>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      rule.active
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-red-100 text-red-700 border border-red-300"
                    }`}
                  >
                    {rule.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-1">
                  <strong>Category:</strong>{" "}
                  {rule.categoryName || "Uncategorized"}
                </p>

                <p className="text-sm text-gray-600 mb-2">
                  <strong>Effective:</strong> {rule.effectiveDate} →{" "}
                  <strong>Expires:</strong> {rule.expiryDate}
                </p>

                <div>
                  <p className="text-sm font-medium mb-1 text-gray-700">
                    Recommended Products:
                  </p>
                  {rule.recommendedNames.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-700 text-sm">
                      {rule.recommendedNames.map((name, idx) => (
                        <li key={idx}>{name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No recommended products found.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">
            No recommendations available.
          </p>
        )}
      </ModalBody>

      <ModalFooter>
        <Button color="gray" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
