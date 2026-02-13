export interface SurplusListing {
  id: string;
  title: string;
  description: string;
  quantity: string;
  location: string;
  distance?: string;
  imageUrl?: string;
  postedBy: string;
  postedAt: string;
  isAvailable: boolean;
}
