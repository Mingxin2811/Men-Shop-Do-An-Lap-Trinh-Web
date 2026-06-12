import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { wishlistService } from '../services/wishlist.service';

const WishlistContext = createContext(null);

const STORAGE_KEY = 'wishlist';

const readStored = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
};

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState(readStored);

  // Đồng bộ theo trạng thái đăng nhập:
  // - Khách: dùng localStorage.
  // - Đăng nhập: gộp wishlist khách vào tài khoản rồi tải danh sách từ server.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user) {
        setIds(readStored());
        return;
      }
      try {
        const localIds = readStored();
        if (localIds.length > 0) {
          await Promise.all(localIds.map((id) => wishlistService.add(id).catch(() => {})));
        }
        const res = await wishlistService.get();
        if (cancelled) return;
        const serverIds = (res.data.data || []).map((p) => p.id);
        setIds(serverIds);
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Lỗi mạng: giữ nguyên danh sách hiện tại.
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user]);

  // Chỉ lưu localStorage khi là khách (chưa đăng nhập).
  useEffect(() => {
    if (!user) localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids, user]);

  // Đồng bộ giữa nhiều tab khi là khách.
  useEffect(() => {
    const sync = (e) => {
      if (e.key === STORAGE_KEY && !user) setIds(readStored());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [user]);

  const has = useCallback((id) => ids.includes(id), [ids]);

  const toggle = useCallback((id) => {
    if (!id) return;
    const exists = ids.includes(id);
    setIds((prev) => (exists ? prev.filter((x) => x !== id) : [id, ...prev]));
    if (user) {
      (exists ? wishlistService.remove(id) : wishlistService.add(id)).catch(() => {});
    }
  }, [ids, user]);

  const remove = useCallback((id) => {
    setIds((prev) => prev.filter((x) => x !== id));
    if (user) wishlistService.remove(id).catch(() => {});
  }, [user]);

  const clear = useCallback(() => {
    setIds([]);
    if (user) wishlistService.clear().catch(() => {});
  }, [user]);

  return (
    <WishlistContext.Provider value={{ ids, count: ids.length, has, toggle, remove, clear }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be inside WishlistProvider');
  return ctx;
};
