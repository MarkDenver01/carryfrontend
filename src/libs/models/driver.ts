export interface Driver {
  driverId: number;          // from backend
  userName: string;
  email: string;
  mobileNumber: string;
  address: string;
  driversLicenseNumber: string;

  photoUrl: string | null;   // returned from backend
  frontIdUrl: string | null;
  backIdUrl: string | null;
}