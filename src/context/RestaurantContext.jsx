import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getRestaurant, getCategories, getMenuItems, getTables, updateTable } from '../lib/api';

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
  const [restaurantData, setRestaurantData] = useState(null);
  const [tableList, setTableList] = useState([]);
  const [menu, setMenu] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);

        // Get the owner's restaurant from auth profile
        const stored = JSON.parse(localStorage.getItem('servora-auth') || 'null');
        const restaurantId = stored?.user?.restaurantId;

        if (!restaurantId) {
          if (!cancelled) setLoading(false);
          return;
        }

        const restaurant = await getRestaurant(restaurantId);
        if (cancelled) return;

        if (restaurant) {
          setRestaurantData(fromSnake(restaurant));

          // Load categories, menu, tables for this restaurant
          const [cats, items, tables] = await Promise.all([
            getCategories(restaurantId),
            getMenuItems(restaurantId),
            getTables(restaurantId),
          ]);

          if (cancelled) return;

          setCategoryList(cats.map(normalizeCategory));
          setMenu(items.map(normalizeItem));
          setTableList(tables.map(normalizeTable));
        }
      } catch (error) {
        console.error('[RestaurantContext] Failed to load data:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const updateTableStatus = useCallback(async (tableId, status) => {
    setTableList(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));
    try {
      await updateTable(tableId, { status });
    } catch (error) {
      console.error('[updateTableStatus]', error);
    }
  }, []);

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
