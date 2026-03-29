export interface Video {
  id: string;
  title: string;
  category: string;
  url: string | File;
  thumbnail: string | File;
  isFeatured: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  eventType: string;
  date: string;
  budget: string;
  message: string;
  createdAt: string;
}

export interface SiteSettings {
  brandName: string;
  logo: string | File;
}

export interface AdminSettings {
  email: string;
  password: string;
}

export interface PageContent {
  home: {
    tagline: string;
    heroVideo: string | File;
    services: { title: string; description: string; image?: string | File }[];
    testimonialTag: string;
    testimonialTitle: string;
    testimonials: { 
      name: string; 
      text: string; 
      role: string; 
      rating: number; 
      image: string | File 
    }[];
  };
  info: {
    about: string;
    founder: {
      name: string;
      image: string | File;
      story: string;
    };
    vision: string;
  };
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  instagram: string;
  youtube: string;
  facebook: string;
  whatsapp: string;
}
