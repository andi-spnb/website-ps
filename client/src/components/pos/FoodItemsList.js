import React, { useState, useEffect } from 'react';
import { Search, Coffee, Info, Plus } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import api from '../../services/api';

// Data default dari database SQL yang diberikan
const DEFAULT_FOOD_ITEMS = [
  {
    item_id: 1,
    name: 'Mie Goreng Instan',
    category: 'Food',
    price: 12000,
    stock_quantity: 25,
    image_url: null,
    is_available: true,
    createdAt: '2025-03-28T15:01:59',
    updatedAt: '2025-03-28T15:01:59'
  },
  {
    item_id: 2,
    name: 'Coca Cola',
    category: 'Drink',
    price: 8000,
    stock_quantity: 50,
    image_url: null,
    is_available: true,
    createdAt: '2025-03-28T15:01:59',
    updatedAt: '2025-03-28T15:01:59'
  },
  {
    item_id: 3,
    name: 'Keripik',
    category: 'Snack',
    price: 10000,
    stock_quantity: 15,
    image_url: null,
    is_available: true,
    createdAt: '2025-03-28T15:01:59',
    updatedAt: '2025-03-28T15:01:59'
  }
];

const FoodItemsList = () => {
  const { addFoodItem } = useCart() || { addFoodItem: () => {} };
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        setLoading(true);
        
        // Try to get data from API
        try {
          const response = await api.get('/food/items');
          console.log("API response for food items:", response.data);
          setFoodItems(response.data);
          setError(null);
        } catch (apiError) {
          console.error('Error fetching food items from API:', apiError);
          
          // Fallback to default data if API fails
          console.log("Using default food items data");
          setFoodItems(DEFAULT_FOOD_ITEMS);
          setError(null);
        }
      } catch (err) {
        console.error('Error in fetchFoodItems:', err);
        setError('Gagal memuat data makanan dan minuman');
      } finally {
        setLoading(false);
      }
    };

    fetchFoodItems();
  }, []);

  const filteredItems = foodItems
    .filter(item => item.is_available)
    .filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(item => 
      selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase()
    );

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-700 rounded w-full"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg border border-red-500">
        <div className="flex items-center text-red-500 mb-2">
          <Info size={18} className="mr-2" />
          <span className="font-medium">Error</span>
        </div>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari makanan atau minuman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>
      
      <div className="mb-4 flex overflow-x-auto space-x-2 pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
            selectedCategory === 'all' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => setSelectedCategory('Food')}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
            selectedCategory === 'Food' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Makanan
        </button>
        <button
          onClick={() => setSelectedCategory('Drink')}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
            selectedCategory === 'Drink' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Minuman
        </button>
        <button
          onClick={() => setSelectedCategory('Snack')}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
            selectedCategory === 'Snack' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Snack
        </button>
      </div>
      
      {filteredItems.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Coffee size={48} className="mx-auto mb-3 opacity-30" />
          <p>Tidak ada item yang ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map(item => (
            <div
              key={item.item_id}
              className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
            >
              <div className="h-32 bg-gray-700 relative">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <Coffee size={32} className="text-gray-500" />
                  </div>
                )}
                <span className="absolute top-2 right-2 text-xs bg-gray-900 bg-opacity-70 rounded px-2 py-1">
                  {item.category}
                </span>
              </div>
              <div className="p-3">
                <h3 className="font-medium">{item.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <div className="font-bold">Rp{item.price.toLocaleString()}</div>
                  <button
                    onClick={() => addFoodItem(item)}
                    className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded-full"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Stok: {item.stock_quantity}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodItemsList;