import { createContext, useContext, useState, useCallback } from 'react';

const CustomerRestaurantContext = createContext(null);

export function CustomerRestaurantProvider({ children }) {
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);

  const setRestaurantData = useCallback((data) => {
    if (data.restaurant) setRestaurant(data.restaurant);
    if (data.categories) setCategories(data.categories);
    if (data.menuItems) setMenuItems(data.menuItems);
    if (data.tables) setTables(data.tables);
  }, []);

  return (
    <CustomerRestaurantContext.Provider value={{
      restaurant,
      categories,
      menuItems,
      tables,
      setRestaurantData,
    }}>
      {children}
    </CustomerRestaurantContext.Provider>
  );
}

export function useCustomerRestaurant() {
  const context = useContext(CustomerRestaurantContext);
  if (!context) throw new Error('useCustomerRestaurant must be used within CustomerRestaurantProvider');
  return context;
}
