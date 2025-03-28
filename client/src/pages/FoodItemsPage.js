import React from 'react';
import FoodItemsManagement from '../components/food/FoodItemsManagement';

const FoodItemsPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Makanan & Minuman</h1>
        <p className="text-gray-400">
          Kelola katalog makanan, minuman, dan snack yang tersedia di Kenzie Gaming.
        </p>
      </div>
      
      <FoodItemsManagement />
    </div>
  );
};

export default FoodItemsPage;