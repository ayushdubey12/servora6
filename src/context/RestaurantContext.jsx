import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getRestaurant, getCategories, getMenuItems, getTables, updateTable } from '../lib/api';
import { useAuth } from './AuthContext';

const RestaurantContext = createContext(null);

function normalizeItem(item) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    categoryId: item.categoryId,
    isVeg: item.isVeg,
    isAvailable: item.isAvailable,
    isPopular: item.isPopular,
    prepTime: item.prepTime,
    calories: item.calories,
    imageUrl: item.imageUrl,
    restaurantId: item.restaurantId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function normalizeCategory(cat) {
  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    itemCount: cat.itemCount || 0,
    order: cat.order,
    restaurantId: cat.restaurantId,
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt,
  };
}

function normalizeTable(table) {
  return {
    id: table.id,
    number: table.number,
    seats: table.seats,
    status: table.status,
    section: table.section,
    restaurantId: table.restaurantId,
    createdAt: table.createdAt,
    updatedAt: table.updatedAt,
  };
}

function fromSnake(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    phone: row.phone,
    email: row.email,
    address: row.address,
    openingHours: row.openingHours || row.opening_hours,
    settings: row.settings,
    createdAt: row.createdAt || row.created_at,
    updatedAt: row.updatedAt || row.updated_at,
  };
}

export function RestaurantProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [restaurantData, setRestaurantData] = useState(null);
  const [tableList, setTableList] = useState([]);
  const [menu, setMenu] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const clear = useCallback(() => {
    setRestaurantData(null);
    setTableList([]);
    setMenu([]);
    setCategoryList([]);
    setError('');
  }, []);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !user?.restaurantId) {
      clear();
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const rid = user.restaurantId;
      const restaurant = await getRestaurant(rid);
      if (!restaurant) throw new Error('Restaurant not found');
      setRestaurantData(fromSnake(restaurant));

      const [cats, items, tables] = await Promise.all([
        getCategories(rid),
        getMenuItems(rid),
        getTables(rid),
      ]);

      setCategoryList((Array.isArray(cats) ? cats : []).map(normalizeCategory));
      setMenu((Array.isArray(items) ? items : []).map(normalizeItem));
      setTableList((Array.isArray(tables) ? tables : []).map(normalizeTable));
    } catch (err) {
      console.error('[RestaurantContext] Failed to load data:', err);
      setError(err.message || 'Failed to load restaurant data');
      // A 401 here means the session expired — AuthContext hydrate/logout will handle clearing it.
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.restaurantId, clear]);

  // Reload whenever auth state resolves or the signed-in user changes.
  // This fixes the class of bugs where lists stayed empty after login/deploy
  // because the context only read localStorage once on mount.
  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateTableStatus = useCallback(async (tableId, status) => {
    setTableList(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));
    try {
      await updateTable(tableId, { status });
    } catch (error) {
      console.error('[updateTableStatus]', error);
      refresh();
    }
  }, [refresh]);

  const getMenuByCategory = useCallback(
    (categoryId) => menu.filter(item => item.categoryId === categoryId),
    [menu]
  );
  const getCategoryName = useCallback(
    (categoryId) => categoryList.find(c => c.id === categoryId)?.name || '',
    [categoryList]
  );

  return (
    <RestaurantContext.Provider value={{
      restaurant: restaurantData,
      tables: tableList,
      updateTableStatus,
      menu,
      categories: categoryList,
      getMenuByCategory,
      getCategoryName,
      loading,
      error,
      refresh,
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
