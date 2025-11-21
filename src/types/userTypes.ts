export interface UserProfile {
  id?: number;
  userName: string;
  photoUrl: string;
  address: string;
  mobileNumber: string;
  email: string;
  driversLicenseNumber: string;
  frontIdUrl: string;
  backIdUrl: string;
  createdDate: string;
  userAccountStatus: "ACTIVE" | "INACTIVE" | "PENDING" | "BANNED";
}
