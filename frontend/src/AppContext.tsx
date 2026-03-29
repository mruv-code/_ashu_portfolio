import React, { createContext, useContext, useState, useEffect } from 'react';
import { Video, Category, Inquiry, PageContent, ContactInfo, SiteSettings, AdminSettings } from './types';
import { get, set } from 'idb-keyval';
import { API_URL } from './config';

interface AppContextType {
  videos: Video[];
  categories: Category[];
  inquiries: Inquiry[];
  pageContent: PageContent;
  contactInfo: ContactInfo;
  siteSettings: SiteSettings;
  adminSettings: AdminSettings;
  addVideo: (video: Omit<Video, 'id'>) => void;
  updateVideo: (id: string, video: Partial<Video>) => void;
  deleteVideo: (id: string) => void;
  addCategory: (name: string) => void;
  deleteCategory: (id: string) => void;
  updatePageContent: (content: PageContent) => void;
  updateContactInfo: (info: ContactInfo) => void;
  updateSiteSettings: (settings: SiteSettings) => void;
  updateAdminSettings: (settings: AdminSettings) => void;
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'createdAt'>) => void;
  deleteInquiry: (id: string) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_CONTENT: PageContent = {
  home: {
    tagline: "We Don't Shoot Weddings, We Craft Stories",
    heroVideo: "https://assets.mixkit.co/videos/preview/mixkit-wedding-couple-walking-in-a-field-of-flowers-34404-large.mp4",
    services: [
      { title: "Wedding Films", description: "Cinematic storytelling for your most precious day." },
      { title: "Commercials", description: "High-end visual content for brands and businesses." },
      { title: "Social Media", description: "Engaging short-form content for modern platforms." },
      { title: "Digital Marketing & Social Media Management", description: "Comprehensive strategies to grow your online presence and engage your audience." }
    ],
    testimonialTag: "TESTIMONIALS",
    testimonialTitle: "What Our Clients Say",
    testimonials: [
      { 
        name: "Rahul & Priya", 
        text: "Bandhan Films captured our wedding like a dream. Every frame tells a story.",
        role: "WEDDING COUPLE",
        rating: 5,
        image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=200&auto=format&fit=crop"
      },
      { 
        name: "Sarah Jenkins", 
        text: "Working with Bandhan Films was the best decision we made for our brand launch. Their vision and execution are truly world-class.",
        role: "CREATIVE DIRECTOR, VOGUE",
        rating: 5,
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
      }
    ]
  },
  info: {
    about: "Bandhan Films is a premium video production house dedicated to cinematic excellence. With over a decade of experience, we specialize in capturing the essence of human emotions and brand stories.",
    founder: {
      name: "Aryan Sharma",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
      story: "Aryan Sharma started Bandhan Films with a single vision: to bring cinematic quality to every story. His passion for visual storytelling has led the company to become a leader in the industry."
    },
    vision: "To become the most trusted name in cinematic storytelling, blending traditional values with modern visual techniques."
  }
};

const INITIAL_VIDEOS: Video[] = [
  { id: '1', title: 'The Royal Wedding', category: 'Wedding', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&auto=format&fit=crop', isFeatured: true },
  { id: '2', title: 'Urban Lifestyle Commercial', category: 'Commercial', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000&auto=format&fit=crop', isFeatured: true },
  { id: '3', title: 'Summer Vibes - Social Edit', category: 'Social Media', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1000&auto=format&fit=crop', isFeatured: true }
];

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Wedding' },
  { id: '2', name: 'Commercial' },
  { id: '3', name: 'Social Media' }
];

const INITIAL_CONTACT: ContactInfo = {
  email: "hello@bandhanfilms.com",
  phone: "+91 98765 43210",
  address: "Film City, Mumbai, MH",
  instagram: "https://instagram.com/bandhanfilms",
  youtube: "https://youtube.com/bandhanfilms",
  facebook: "https://facebook.com/bandhanfilms",
  whatsapp: "+919876543210"
};

const INITIAL_SETTINGS: SiteSettings = {
  brandName: "BANDHAN FILMS",
  logo: "" // Empty string means use the default icon
};

const INITIAL_ADMIN: AdminSettings = {
  email: "variyautsav@gmail.com",
  password: "password123"
};

// Helper function to add aggressive cache-busting timestamp + random token
const getCacheBustParam = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `t=${timestamp}&_=${random}`;
};

// Function to fetch data from backend with aggressive cache-busting
const fetchFromBackend = async (endpoint: string) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}?${getCacheBustParam()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      console.warn(`Failed to fetch from ${endpoint}:`, response.status);
      return null;
    }
  } catch (error) {
    console.warn(`Error fetching from ${endpoint}:`, error);
    return null;
  }
};

// Function to push data to backend
const pushToBackend = async (endpoint: string, method: string, data: any) => {
  try {
    console.log(`Syncing data to ${endpoint}...`);
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      console.error(`Failed to sync to ${endpoint}: HTTP ${response.status}`);
      console.error('Response:', await response.text());
      return false;
    } else {
      const responseData = await response.json();
      console.log(`✓ Data synced to backend:`, responseData);
      // Update last sync time
      sessionStorage.setItem('bandhan_last_sync', Date.now().toString());
      return true;
    }
  } catch (error) {
    console.error(`Error syncing to ${endpoint}:`, error);
    return false;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [videos, setVideos] = useState<Video[]>(INITIAL_VIDEOS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [pageContent, setPageContent] = useState<PageContent>(INITIAL_CONTENT);
  const [contactInfo, setContactInfo] = useState<ContactInfo>(INITIAL_CONTACT);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(INITIAL_ADMIN);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount - fetch from backend with proper error handling
  useEffect(() => {
    const loadData = async () => {
      try {
        // Always try to fetch from backend FIRST - no IndexedDB fallback initially
        let backendData = null;
        try {
          backendData = await fetchFromBackend('/api/website-data');
          console.log('Backend data fetched:', backendData);
        } catch (error) {
          console.warn('Backend fetch failed, trying again...', error);
          // Retry once if first attempt fails
          backendData = await fetchFromBackend('/api/website-data');
        }
        
        // Use backend data if it has content
        if (backendData && typeof backendData === 'object') {
          if (backendData.videos && Array.isArray(backendData.videos)) setVideos(backendData.videos);
          if (backendData.categories && Array.isArray(backendData.categories)) setCategories(backendData.categories);
          if (backendData.inquiries && Array.isArray(backendData.inquiries)) setInquiries(backendData.inquiries);
          if (backendData.pageContent && typeof backendData.pageContent === 'object') setPageContent(backendData.pageContent);
          if (backendData.contactInfo && typeof backendData.contactInfo === 'object') setContactInfo(backendData.contactInfo);
          if (backendData.siteSettings && typeof backendData.siteSettings === 'object') setSiteSettings(backendData.siteSettings);
          console.log('✓ Website data loaded from backend');
        } else {
          console.log('No valid backend data, loading from IndexedDB...');
          // Fallback to IndexedDB if backend fails
          const savedVideos = await get('bandhan_videos');
          const savedCategories = await get('bandhan_categories');
          const savedInquiries = await get('bandhan_inquiries');
          const savedContent = await get('bandhan_content');
          const savedContact = await get('bandhan_contact');
          const savedSettings = await get('bandhan_settings');
          const savedAdmin = await get('bandhan_admin');

          if (savedVideos) setVideos(savedVideos);
          if (savedCategories) setCategories(savedCategories);
          if (savedInquiries) setInquiries(savedInquiries);
          if (savedContent) setPageContent(savedContent);
          if (savedContact) setContactInfo(savedContact);
          if (savedSettings) setSiteSettings(savedSettings);
          if (savedAdmin) {
            setAdminSettings({
              ...INITIAL_ADMIN,
              ...savedAdmin
            });
          }
          console.log('✓ Website data loaded from IndexedDB (backend unavailable)');
        }

        const savedIsAdmin = localStorage.getItem('bandhan_isAdmin') === 'true';
        if (savedIsAdmin) setIsAdmin(true);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Periodic refresh every 30 seconds to keep mobile in sync
  useEffect(() => {
    if (isLoading) return;

    const refreshInterval = setInterval(async () => {
      const backendData = await fetchFromBackend('/api/website-data');
      if (backendData && Object.keys(backendData).length > 0) {
        if (backendData.videos?.length > 0) setVideos(backendData.videos);
        if (backendData.categories?.length > 0) setCategories(backendData.categories);
        if (backendData.inquiries?.length > 0) setInquiries(backendData.inquiries);
        if (backendData.pageContent && Object.keys(backendData.pageContent).length > 0) setPageContent(backendData.pageContent);
        if (backendData.contactInfo && Object.keys(backendData.contactInfo).length > 0) setContactInfo(backendData.contactInfo);
        if (backendData.siteSettings && Object.keys(backendData.siteSettings).length > 0) setSiteSettings(backendData.siteSettings);
      }
    }, 30000); // Refresh every 30 seconds

    // Refresh when page regains focus
    const handleFocus = async () => {
      const backendData = await fetchFromBackend('/api/website-data');
      if (backendData && Object.keys(backendData).length > 0) {
        if (backendData.videos?.length > 0) setVideos(backendData.videos);
        if (backendData.categories?.length > 0) setCategories(backendData.categories);
        if (backendData.inquiries?.length > 0) setInquiries(backendData.inquiries);
        if (backendData.pageContent && Object.keys(backendData.pageContent).length > 0) setPageContent(backendData.pageContent);
        if (backendData.contactInfo && Object.keys(backendData.contactInfo).length > 0) setContactInfo(backendData.contactInfo);
        if (backendData.siteSettings && Object.keys(backendData.siteSettings).length > 0) setSiteSettings(backendData.siteSettings);
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isLoading]);

  // Save data to both IndexedDB and backend whenever it changes
  useEffect(() => {
    if (isLoading) return;

    const saveData = async () => {
      try {
        // Save to IndexedDB
        await set('bandhan_videos', videos);
        await set('bandhan_categories', categories);
        await set('bandhan_inquiries', inquiries);
        await set('bandhan_content', pageContent);
        await set('bandhan_contact', contactInfo);
        await set('bandhan_settings', siteSettings);
        await set('bandhan_admin', adminSettings);

        // Sync to backend
        const syncSuccess = await pushToBackend('/api/website-data', 'POST', {
          videos,
          categories,
          inquiries,
          pageContent,
          contactInfo,
          siteSettings
        });
        
        // After successful sync to backend, trigger a refresh in 1 second
        // This ensures the data is immediately available for other pages
        if (syncSuccess) {
          setTimeout(async () => {
            const freshData = await fetchFromBackend('/api/website-data');
            if (freshData && typeof freshData === 'object') {
              if (freshData.videos && Array.isArray(freshData.videos)) setVideos(freshData.videos);
              if (freshData.categories && Array.isArray(freshData.categories)) setCategories(freshData.categories);
              if (freshData.inquiries && Array.isArray(freshData.inquiries)) setInquiries(freshData.inquiries);
              if (freshData.pageContent && typeof freshData.pageContent === 'object') setPageContent(freshData.pageContent);
              if (freshData.contactInfo && typeof freshData.contactInfo === 'object') setContactInfo(freshData.contactInfo);
              if (freshData.siteSettings && typeof freshData.siteSettings === 'object') setSiteSettings(freshData.siteSettings);
              console.log('✓ Data verified from backend after sync');
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Failed to save data:', error);
      }
    };

    saveData();
  }, [videos, categories, inquiries, pageContent, contactInfo, siteSettings, adminSettings, isLoading]);

  const addVideo = (video: Omit<Video, 'id'>) => {
    const newVideo = { ...video, id: Date.now().toString() };
    setVideos([...videos, newVideo]);
  };

  const updateVideo = (id: string, updatedFields: Partial<Video>) => {
    setVideos(videos.map(v => v.id === id ? { ...v, ...updatedFields } : v));
  };

  const deleteVideo = (id: string) => {
    setVideos(videos.filter(v => v.id !== id));
  };

  const addCategory = (name: string) => {
    setCategories([...categories, { id: Date.now().toString(), name }]);
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const updatePageContent = (content: PageContent) => {
    setPageContent(content);
  };

  const updateContactInfo = (info: ContactInfo) => {
    setContactInfo(info);
  };

  const updateSiteSettings = (settings: SiteSettings) => {
    setSiteSettings(settings);
  };

  const updateAdminSettings = (settings: AdminSettings) => {
    setAdminSettings(settings);
  };

  const addInquiry = (inquiry: Omit<Inquiry, 'id' | 'createdAt'>) => {
    const newInquiry = {
      ...inquiry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setInquiries([newInquiry, ...inquiries]);
  };

  const deleteInquiry = (id: string) => {
    setInquiries(inquiries.filter(i => i.id !== id));
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('bandhan_isAdmin');
  };

  return (
    <AppContext.Provider value={{
      videos, categories, inquiries, pageContent, contactInfo, siteSettings, adminSettings,
      addVideo, updateVideo, deleteVideo,
      addCategory, deleteCategory,
      updatePageContent, updateContactInfo, updateSiteSettings, updateAdminSettings, addInquiry, deleteInquiry,
      isAdmin, setIsAdmin, logout, isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
