import React, { createContext, useContext, useState, useEffect } from 'react';
import { BusinessSettings, Product, ServiceItem, Seminar, ProductCategory } from '../types';
import {
  DEFAULT_BUSINESS_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SERVICES,
  INITIAL_SEMINARS,
} from '../lib/constants';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface BusinessContextType {
  settings: BusinessSettings;
  updateSettings: (newSettings: Partial<BusinessSettings>) => Promise<void>;
  categories: ProductCategory[];
  products: Product[];
  services: ServiceItem[];
  seminars: Seminar[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  updateProductStock: (productId: string, newStock: number) => void;
  updateProduct: (product: Product) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateService: (service: ServiceItem) => Promise<void>;
  addService: (service: Omit<ServiceItem, 'id'>) => Promise<ServiceItem>;
  updateSeminar: (seminar: Seminar) => Promise<void>;
  addSeminar: (seminar: Omit<Seminar, 'id'>) => Promise<Seminar>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [categories, setCategories] = useState<ProductCategory[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [seminars, setSeminars] = useState<Seminar[]>(INITIAL_SEMINARS);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    try {
      // Load business settings from Firestore if available
      const settingsDocRef = doc(db, 'settings', 'global');
      const settingsSnap = await getDoc(settingsDocRef);
      if (settingsSnap.exists()) {
        setSettings({ ...DEFAULT_BUSINESS_SETTINGS, ...(settingsSnap.data() as Partial<BusinessSettings>) });
      }

      // Check for locally cached updates or server updates
      const savedProducts = localStorage.getItem('agro_products_cache');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }
      const savedServices = localStorage.getItem('agro_services_cache');
      if (savedServices) {
        try {
          const parsedServices = JSON.parse(savedServices);
          // If cached services contain old services, reset to current INITIAL_SERVICES
          const hasStaleServices =
            !Array.isArray(parsedServices) ||
            parsedServices.some(
              (s: any) =>
                s.id === 'srv-travel-guidance' ||
                s.id === 'srv-study-abroad' ||
                s.id === 'srv-scholarship-funding' ||
                s.name?.includes('Travel Enquiries') ||
                s.name?.includes('Study Abroad') ||
                s.name?.includes('Scholarship and Funding')
            );
          if (hasStaleServices) {
            setServices(INITIAL_SERVICES);
            localStorage.setItem('agro_services_cache', JSON.stringify(INITIAL_SERVICES));
          } else {
            setServices(parsedServices);
          }
        } catch {
          setServices(INITIAL_SERVICES);
        }
      }
      const savedSeminars = localStorage.getItem('agro_seminars_cache');
      if (savedSeminars) {
        setSeminars(JSON.parse(savedSeminars));
      }
    } catch (err) {
      console.warn('Could not sync remote business settings, using local defaults:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const updateSettings = async (newSettings: Partial<BusinessSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      await setDoc(doc(db, 'settings', 'global'), updated, { merge: true });
    } catch (e) {
      console.warn('Could not persist to firestore settings doc:', e);
    }
  };

  const updateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p));
      localStorage.setItem('agro_products_cache', JSON.stringify(next));
      return next;
    });
  };

  const updateProduct = async (product: Product) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === product.id ? product : p));
      localStorage.setItem('agro_products_cache', JSON.stringify(next));
      return next;
    });
  };

  const addProduct = async (newP: Omit<Product, 'id'>): Promise<Product> => {
    const product: Product = { ...newP, id: `prod-${Date.now()}` };
    setProducts((prev) => {
      const next = [product, ...prev];
      localStorage.setItem('agro_products_cache', JSON.stringify(next));
      return next;
    });
    return product;
  };

  const updateService = async (service: ServiceItem) => {
    setServices((prev) => {
      const next = prev.map((s) => (s.id === service.id ? service : s));
      localStorage.setItem('agro_services_cache', JSON.stringify(next));
      return next;
    });
  };

  const addService = async (newS: Omit<ServiceItem, 'id'>): Promise<ServiceItem> => {
    const service: ServiceItem = { ...newS, id: `srv-${Date.now()}` };
    setServices((prev) => {
      const next = [service, ...prev];
      localStorage.setItem('agro_services_cache', JSON.stringify(next));
      return next;
    });
    return service;
  };

  const updateSeminar = async (seminar: Seminar) => {
    setSeminars((prev) => {
      const next = prev.map((s) => (s.id === seminar.id ? seminar : s));
      localStorage.setItem('agro_seminars_cache', JSON.stringify(next));
      return next;
    });
  };

  const addSeminar = async (newS: Omit<Seminar, 'id'>): Promise<Seminar> => {
    const seminar: Seminar = { ...newS, id: `sem-${Date.now()}` };
    setSeminars((prev) => {
      const next = [seminar, ...prev];
      localStorage.setItem('agro_seminars_cache', JSON.stringify(next));
      return next;
    });
    return seminar;
  };

  return (
    <BusinessContext.Provider
      value={{
        settings,
        updateSettings,
        categories,
        products,
        services,
        seminars,
        isLoading,
        refreshData,
        updateProductStock,
        updateProduct,
        addProduct,
        updateService,
        addService,
        updateSeminar,
        addSeminar,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
