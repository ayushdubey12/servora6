import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { restaurant as mockRestaurant, branches, tables as mockTables, menuItems as mockMenu, categories as mockCategories } from '../data/mockData';
import { supabase } from '../lib/supabase';

const RestaurantContext = createContext(null);

function normalizeItem(it) {
  return {
    ...it,
    category: it.categoryId || it.category,
    categoryId: it.category_id || it.categoryId,
    isPopular: it.isPopular ?? false,
    prepTime: it.prepTime ?? 15,
    calories: it.calories ?? 0,
  };
}

function fromSnake(row) {
  // Convert snake_case DB row to camelCase for the UI
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    phone: row.phone,
    email: row.email,
    address: row.address,
    openingHours: row.opening_hours,
    settings: row.settings,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function RestaurantProvider({ children }) {
  const [restaurantData, setRestaurantData] = useState(mockRestaurant);
  const [branchList] = useState(branches);
  const [tableList, setTableList] = useState(mockTables);
  const [menu, setMenu] = useState(mockMenu);
  const [categoryList, setCategoryList] = useState(mockCategories);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [rRes, cRes, mRes, tRes] = await Promise.all([
          supabase.from('restaurants').select('*').limit(1).single().catch(() => null),
          supabase.from('categories').select('*').order('sort_order', { ascending: true }).catch(() => null),
          supabase.from('menu_items').select('*').order('created_at', { ascending: true }).catch(() => null),
          supabase.from('tables').select('*').order('number', { ascending: true }).catch(() => null),
        ]);
        if (cancelled) return;

        if (rRes?.data) {
          setRestaurantData({ ...mockRestaurant, ...fromSnake(rRes.data) });
        }
        if (cRes?.data && mRes?.data && tRes?.data) {
          const cats = cRes.data.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            itemCount: c.item_count,
            order: c.sort_order,
            restaurantId: c.restaurant_id,
            createdAt: c.created_at,
          }));
          setCategoryList(cats);

          const items = mRes.data.map(normalizeItem);
          setMenu(items);

          const tables = tRes.data.map(t => ({
            id: t.id,
            number: t.number,
            seats: t.seats,
            status: t.status,
            restaurantId: t.restaurant_id,
            createdAt: t.created_at,
          }));
          setTableList(tables);
        }
      } catch {
        /* keep mock fallback */
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const updateTableStatus = useCallback((tableId, status) => {
    setTableList(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));
    supabase.from('tables').update({ status }).eq('id', tableId).then(() => {}).catch(() => {});
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
