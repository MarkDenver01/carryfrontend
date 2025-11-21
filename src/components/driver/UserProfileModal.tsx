import { Modal,ModalHeader, ModalBody,ModalFooter, Button } from "flowbite-react";
import type { UserProfile } from "../../types/userTypes";

interface Props {
  show: boolean;
  onClose: () => void;
  user: UserProfile | null;
}

export default function UserProfileModal({ show, onClose, user }: Props) {
  if (!user) return null;

  return (
    <Modal show={show} onClose={onClose} size="lg">
      <ModalHeader>User Profile Details</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <img
            src={user.photoUrl}
            className="w-32 h-32 rounded-full object-cover mx-auto"
          />

          <div className="grid grid-cols-2 gap-3">
            <p><b>Username:</b> {user.userName}</p>
            <p><b>Email:</b> {user.email}</p>
            <p><b>Mobile:</b> {user.mobileNumber}</p>
            <p><b>Address:</b> {user.address}</p>
            <p><b>Driver's License:</b> {user.driversLicenseNumber}</p>
            <p><b>Account Status:</b> {user.userAccountStatus}</p>
            <p><b>Created:</b> {user.createdDate}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="font-semibold">Front ID</p>
              <img src={user.frontIdUrl} className="rounded-lg shadow" />
            </div>

            <div>
              <p className="font-semibold">Back ID</p>
              <img src={user.backIdUrl} className="rounded-lg shadow" />
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button color="gray" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
