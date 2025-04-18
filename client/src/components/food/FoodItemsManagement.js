import React, { useState, useEffect } from 'react';
import { Coffee, Plus, Edit, Trash, AlertCircle, Search, X } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const FoodItemsManagement = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Food',
    price: '',
    stock_quantity: '',
    image_url: '',
    is_available: true
  });

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/food/items');
      setFoodItems(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching food items:', err);
      setError('Gagal memuat data makanan dan minuman');
      
      // Mock data for demo
      setFoodItems([
        {
          item_id: 1,
          name: 'Mie Goreng Instan',
          category: 'Food',
          price: 12000,
          stock_quantity: 25,
          is_available: true
        },
        {
          item_id: 2,
          name: 'Coca Cola',
          category: 'Drink',
          price: 8000,
          stock_quantity: 50,
          is_available: true
        },
        {
          item_id: 3,
          name: 'Keripik',
          category: 'Snack',
          price: 10000,
          stock_quantity: 15,
          is_available: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert price and stock to numbers
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity, 10)
      };
      
      await api.post('/food/items', submitData);
      toast.success('Item berhasil ditambahkan');
      setShowAddModal(false);
      setFormData({
        name: '',
        category: 'Food',
        price: '',
        stock_quantity: '',
        image_url: '',
        is_available: true
      });
      fetchFoodItems();
    } catch (err) {
      console.error('Error adding food item:', err);
      toast.error(err.response?.data?.message || 'Gagal menambahkan item');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert price and stock to numbers
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity, 10)
      };
      
      await api.put(`/food/items/${selectedItem.item_id}`, submitData);
      toast.success('Item berhasil diperbarui');
      setShowEditModal(false);
      fetchFoodItems();
    } catch (err) {
      console.error('Error updating food item:', err);
      toast.error(err.response?.data?.message || 'Gagal memperbarui item');
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await api.delete(`/food/items/${selectedItem.item_id}`);
      toast.success('Item berhasil dihapus');
      setShowDeleteModal(false);
      fetchFoodItems();
    } catch (err) {
      console.error('Error deleting food item:', err);
      toast.error(err.response?.data?.message || 'Gagal menghapus item');
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      stock_quantity: item.stock_quantity.toString(),
      image_url: item.image_url || '',
      is_available: item.is_available
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const filteredItems = foodItems
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
        <div className="h-10 bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="h-12 bg-gray-700 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Makanan & Minuman</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg"
        >
          <Plus size={18} className="mr-1" />
          Tambah Item
        </button>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari makanan atau minuman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm ${
              selectedCategory === 'all' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setSelectedCategory('Food')}
            className={`px-4 py-2 rounded-full text-sm ${
              selectedCategory === 'Food' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Makanan
          </button>
          <button
            onClick={() => setSelectedCategory('Drink')}
            className={`px-4 py-2 rounded-full text-sm ${
              selectedCategory === 'Drink' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Minuman
          </button>
          <button
            onClick={() => setSelectedCategory('Snack')}
            className={`px-4 py-2 rounded-full text-sm ${
              selectedCategory === 'Snack' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Snack
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg border border-red-500 mb-6">
          <div className="flex items-center text-red-500 mb-2">
            <AlertCircle size={18} className="mr-2" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      {filteredItems.length === 0 ? (
        <div className="text-center py-8 text-gray-400 bg-gray-800 rounded-lg border border-gray-700">
          <Coffee size={48} className="mx-auto mb-3 opacity-30" />
          {searchQuery ? (
            <p>Tidak ada item yang sesuai dengan pencarian "{searchQuery}"</p>
          ) : (
            <p>Belum ada item makanan dan minuman</p>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg inline-flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Tambah Item
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Nama</th>
                <th className="py-3 px-4 text-left">Kategori</th>
                <th className="py-3 px-4 text-right">Harga</th>
                <th className="py-3 px-4 text-right">Stok</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredItems.map(item => (
                <tr key={item.item_id} className="hover:bg-gray-750">
                  <td className="py-3 px-4 font-medium">{item.name}</td>
                  <td className="py-3 px-4">{item.category}</td>
                  <td className="py-3 px-4 text-right">Rp{item.price.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`${
                      item.stock_quantity <= 5 ? 'text-red-400' : ''
                    }`}>
                      {item.stock_quantity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.is_available ? (
                      <span className="px-2 py-1 bg-green-900 bg-opacity-40 text-green-400 rounded-full text-xs">
                        Tersedia
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-900 bg-opacity-40 text-red-400 rounded-full text-xs">
                        Tidak Tersedia
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-blue-500 hover:text-blue-400 p-1"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(item)}
                      className="text-red-500 hover:text-red-400 p-1 ml-2"
                      title="Hapus"
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tambah Item Baru</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit}>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Nama Item</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Masukkan nama item"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Kategori</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  required
                >
                  <option value="Food">Makanan</option>
                  <option value="Drink">Minuman</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Harga (Rp)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Contoh: 15000"
                  min="0"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Jumlah Stok</label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Contoh: 20"
                  min="0"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">URL Gambar (Opsional)</label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleInputChange}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 mr-2"
                  />
                  <span className="text-gray-400">Tersedia untuk dijual</span>
                </label>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  type="button"
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg"
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-medium"
                >
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Item Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Item</h2>
              <button onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Nama Item</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Masukkan nama item"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Kategori</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  required
                >
                  <option value="Food">Makanan</option>
                  <option value="Drink">Minuman</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Harga (Rp)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Contoh: 15000"
                  min="0"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Jumlah Stok</label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Contoh: 20"
                  min="0"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">URL Gambar (Opsional)</label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleInputChange}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 mr-2"
                  />
                  <span className="text-gray-400">Tersedia untuk dijual</span>
                </label>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  type="button"
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg"
                  onClick={() => setShowEditModal(false)}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg font-medium"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="mb-4">
              <div className="flex items-center text-red-500 mb-2">
                <AlertCircle size={24} className="mr-2" />
                <h2 className="text-xl font-bold">Konfirmasi Hapus</h2>
              </div>
              <p>
                Apakah Anda yakin ingin menghapus <strong>{selectedItem.name}</strong>?
                Tindakan ini tidak dapat dikembalikan.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button 
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg"
                onClick={() => setShowDeleteModal(false)}
              >
                Batal
              </button>
              <button 
                className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg font-medium flex justify-center items-center"
                onClick={handleDeleteSubmit}
              >
                <Trash size={16} className="mr-2" />
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodItemsManagement;