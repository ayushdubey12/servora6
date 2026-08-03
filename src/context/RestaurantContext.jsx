import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { restaurant as mockRestaurant, branches, tables as mockTables, menuItems as mockMenu, categories as mockCategories } from '../data/mockData';

const RestaurantContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Normalize a backend menu item to the shape the UI expects
function normalizeItem(it) {
  return {
    ...it,
    category: it.categoryId || it.category,
    isPopular: it.isPopular ?? false,
    prepTime: it.prepTime ?? 15,
    calories: it.calories ?? 0,
  };
}

export function RestaurantProvider({ children }) {
  const [restaurantData, setRestaurantData] = useState(mockRestaurant);
  const [branchList] = useState(branches);
  const [tableList, setTableList] = useState(mockTables);
  const [menu, setMenu] = useState(mockMenu);
  const [categoryList, setCategoryList] = useState(mockCategories);

  // Load real data from the backend; keep mock data as a graceful fallback.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [rRes, cRes, mRes, tRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/restaurant`).then(r => r.json()).catch(() => null),
          fetch(`${API_BASE_URL}/api/categories`).then(r => r.json()).catch(() => null),
          fetch(`${API_BASE_URL}/api/menu-items`).then(r => r.json()).catch(() => null),
          fetch(`${API_BASE_URL}/api/tables`).then(r => r.json()).catch(() => null),
        ]);
        if (cancelled) return;
        if (rRes?.success && rRes.data) setRestaurantData({ ...mockRestaurant, ...rRes.data });
        if (cRes?.success && Array.isArray(cRes.data) && cRes.data.length) setCategoryList(cRes.data);
        if (mRes?.success && Array.isArray(mRes.data) && mRes.data.length) setMenu(mRes.data.map(normalizeItem));
        if (tRes?.success && Array.isArray(tRes.data) && tRes.data.length) setTableList(tRes.data);
      } catch {
        /* keep mock fallback */
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const updateTableStatus = useCallback((tableId, status) => {
    setTableList(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));
    fetch(`${API_BASE_URL}/api/tables/${tableId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  }, []);

  const getMenuByCategory = useCallback(
    (categoryId) => menu.filter(item => (item.category || item.categoryId) === categoryId),
    [menu]
  );
  const getCategoryName = useCallback(
    (categoryId) => categoryList.find(c => c.id === categoryId)?.name || '',
    [categoryList]
  );

  return (
    <RestaurantContext.Provider value={{
      restaurant: restaurantData, branches: branchList,
      tables: tableList, updateTableStatus,
      menu, categories: categoryList,
      getMenuByCategory, getCategoryName,
    }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error('useRestaurant must be used within RestaurantProvider');
  return context;
};
