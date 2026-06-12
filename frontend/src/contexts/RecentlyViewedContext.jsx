import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const RecentlyViewedContext = createContext(null);

const STORAGE_KEY = 'recently-viewed';
const MAX_ITEMS = 8;

const readStored = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
};

export function RecentlyViewedProvider({ children }) {
  const [ids, setIds] = useState(readStored);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  // Đưa sản phẩm vừa xem lên đầu, giữ tối đa MAX_ITEMS mục.
  const track = useCallback((id) => {
    if (!id) return;
    setIds((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, MAX_ITEMS));
  }, []);

  return (
    <RecentlyViewedContext.Provider value={{ ids, track }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export const useRecentlyViewed = () => {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error('useRecentlyViewed must be inside RecentlyViewedProvider');
  return ctx;
};
