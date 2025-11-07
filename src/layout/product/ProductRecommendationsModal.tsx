import { Modal,  
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button
 } from "flowbite-react";
import type { ProductRecommended } from "./../../types/types";

interface Props {
  show: boolean;
  onClose: () => void;
  recommendations: ProductRecommended[];
}

export default function ProductRecommendationsModal({ show, onClose, recommendations }: Props) {
  return (
    <Modal show={show} onClose={onClose}>
      <ModalHeader>Recommended Products</ModalHeader>
      <ModalBody>
        {recommendations.length > 0 ? (
          <ul className="space-y-3">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-center gap-3">
                <img src={rec.productImgUrl || "/placeholder.png"} alt={rec.productName} className="w-12 h-12 rounded" />
                <div>
                  <p className="font-medium">{rec.productName}</p>
                  <p className="text-sm text-gray-600">{rec.productDescription}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No recommendations available.</p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="gray" onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  );
}
