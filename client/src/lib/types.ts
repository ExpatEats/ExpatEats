export interface Category {
  id: number;
  name: string;
  icon: string;
  description: string;
}

export interface Place {
  id: number;
  uniqueId?: string;
  name: string;
  description: string;
  address: string;
  city: string;
  region?: string;
  country: string;
  category: string;
  tags: string[];
  latitude?: string;
  longitude?: string;
  
  // Contact Information
  phone?: string;
  email?: string;
  
  // Social Media
  instagram?: string;
  website?: string;
  
  // Boolean Filters
  glutenFree?: boolean;
  dairyFree?: boolean;
  nutFree?: boolean;
  vegan?: boolean;
  organic?: boolean;
  localFarms?: boolean;
  freshVegetables?: boolean;
  farmRaisedMeat?: boolean;
  noProcessed?: boolean;
  kidFriendly?: boolean;
  bulkBuying?: boolean;
  zeroWaste?: boolean;
  
  userId?: number;
  imageUrl?: string;
  averageRating?: number;
  createdAt?: string;
}

export interface Review {
  id: number;
  placeId: number;
  userId: number;
  rating: number;
  comment?: string;
  createdAt?: string;
}

export interface Testimonial {
  id: number;
  text: string;
  author: string;
  location: string;
  rating: number;
}

export interface City {
  id: number;
  name: string;
  country: string;
}

export interface NutritionConsultation {
  id?: number;
  name: string;
  email: string;
  goals: string;
  userId?: number;
  status?: string;
  createdAt?: string;
}
