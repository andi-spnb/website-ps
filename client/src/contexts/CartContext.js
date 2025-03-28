import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [rentalItem, setRentalItem] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [member, setMember] = useState(null);

  // Add device (PlayStation) to cart
  const addRental = (device, duration, price) => {
    setRentalItem({
      device_id: device.device_id,
      device_name: device.device_name,
      device_type: device.device_type,
      duration,
      price,
      type: 'rental'
    });
  };

  // Remove PlayStation from cart
  const removeRental = () => {
    setRentalItem(null);
  };

  // Add food item to cart
  const addFoodItem = (item) => {
    // Check if item already exists in cart
    const existingItemIndex = foodItems.findIndex(i => i.item_id === item.item_id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      const updatedItems = [...foodItems];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].subtotal = 
        updatedItems[existingItemIndex].price * updatedItems[existingItemIndex].quantity;
      setFoodItems(updatedItems);
    } else {
      // Add new item
      setFoodItems([...foodItems, {
        item_id: item.item_id,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: 1,
        subtotal: item.price,
        type: 'food'
      }]);
    }
  };

  // Update food item quantity
  const updateFoodItemQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFoodItem(itemId);
      return;
    }
    
    const updatedItems = foodItems.map(item => {
      if (item.item_id === itemId) {
        return {
          ...item,
          quantity,
          subtotal: item.price * quantity
        };
      }
      return item;
    });
    
    setFoodItems(updatedItems);
  };

  // Remove food item from cart
  const removeFoodItem = (itemId) => {
    setFoodItems(foodItems.filter(item => item.item_id !== itemId));
  };

  // Clear entire cart
  const clearCart = () => {
    setRentalItem(null);
    setFoodItems([]);
    setMember(null);
  };

  // Set member for the order
  const setOrderMember = (memberData) => {
    setMember(memberData);
  };

  // Calculate subtotal for all food items
  const calculateFoodSubtotal = () => {
    return foodItems.reduce((total, item) => total + item.subtotal, 0);
  };

  // Calculate total for everything in cart
  const calculateTotal = () => {
    const rentalTotal = rentalItem ? rentalItem.price : 0;
    const foodTotal = calculateFoodSubtotal();
    return rentalTotal + foodTotal;
  };

  const value = {
    rentalItem,
    foodItems,
    member,
    addRental,
    removeRental,
    addFoodItem,
    updateFoodItemQuantity,
    removeFoodItem,
    clearCart,
    setOrderMember,
    calculateFoodSubtotal,
    calculateTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;