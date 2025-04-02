import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CalendarDays, Filter, ChevronDown, Download, Layers, ZoomIn, ZoomOut, RefreshCw, Clock } from 'lucide-react';

// Data dummy untuk demonstrasi
const generateDummyData = () => {
  const categories = ['Food', 'Drink', 'Snack'];
  const devices = ['PS3', 'PS4', 'PS5'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Membuat data penjualan per bulan
  const salesData = months.map(month => {
    const obj = { name: month };
    
    categories.forEach(category => {
      obj[category] = Math.floor(Math.random() * 5000000) + 1000000;
    });
    
    devices.forEach(device => {
      obj[device] = Math.floor(Math.random() * 7000000) + 3000000;
    });
    
    return obj;
  });
  
  // Membuat data distribusi
  const distributionData = [
    { name: 'Food', value: 35 },
    { name: 'Drink', value: 40 },
    { name: 'Snack', value: 25 }
  ];
  
  const deviceDistribution = [
    { name: 'PS3', value: 15 },
    { name: 'PS4', value: 55 },
    { name: 'PS5', value: 30 }
  ];
  
  return {
    salesData,
    distributionData,
    deviceDistribution
  };
};

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

const InteractiveChart = () => {
  const [data, setData] = useState(() => generateDummyData());
  const [chartType, setChartType] = useState('line');
  const [dataView, setDataView] = useState('sales');
  const [dateRange, setDateRange] = useState('year');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataCategories, setDataCategories] = useState(['Food', 'Drink', 'Snack']);
  const [selectedCategories, setSelectedCategories] = useState(['Food', 'Drink', 'Snack']);
  const [zoomLevel, setZoomLevel] = useState(1);

  const refreshData = () => {
    setIsLoading(true);
    // Simulasi API call
    setTimeout(() => {
      setData(generateDummyData());
      setIsLoading(false);
    }, 800);
  };

  useEffect(() => {
    refreshData();
  }, [dateRange]);

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleZoomIn = () => {
    if (zoomLevel < 2) setZoomLevel(zoomLevel + 0.25);
  };

  const handleZoomOut = () => {
    if (zoomLevel > 0.5) setZoomLevel(zoomLevel - 0.25);
  };

  const formatCurrency = (value) => {
    return `Rp${Number(value).toLocaleString('id-ID')}`;
  };

  // Filter data based on selected categories
  const filteredData = data.salesData.map(item => {
    const filteredItem = { name: item.name };
    selectedCategories.forEach(category => {
      filteredItem[category] = item[category];
    });
    return filteredItem;
  });

  return (
    <div className="bg-gray-900 rounded-lg p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Laporan Interaktif</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center"
          >
            <Filter size={16} className="mr-1" /> 
            <span>Filter</span>
            <ChevronDown 
              size={16} 
              className={`ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} 
            />
          </button>
          <button 
            onClick={refreshData}
            className={`p-2 bg-gray-800 hover:bg-gray-700 rounded-lg ${isLoading ? 'animate-pulse' : ''}`}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Tipe Grafik</label>
              <div className="flex space-x-2">
                {['line', 'bar', 'area', 'pie'].map(type => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`px-3 py-1 rounded ${chartType === type ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Data</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setDataView('sales')}
                  className={`px-3 py-1 rounded ${dataView === 'sales' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  Penjualan
                </button>
                <button
                  onClick={() => setDataView('devices')}
                  className={`px-3 py-1 rounded ${dataView === 'devices' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  Device
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Periode</label>
              <div className="flex items-center">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded p-1 flex-grow"
                >
                  <option value="month">Bulan Ini</option>
                  <option value="quarter">3 Bulan Terakhir</option>
                  <option value="year">Tahun Ini</option>
                </select>
                <CalendarDays size={16} className="ml-2 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-gray-400 text-sm mb-2">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {dataCategories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1 rounded flex items-center ${
                    selectedCategories.includes(category) ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[dataCategories.indexOf(category) % COLORS.length] }}
                  ></div>
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-gray-800 p-4 rounded-lg mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {dataView === 'sales' ? (
              <h3 className="font-semibold text-white">Penjualan per Kategori</h3>
            ) : (
              <h3 className="font-semibold text-white">Penggunaan per Device</h3>
            )}
            <span className="ml-2 px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
              {dateRange === 'month' ? 'Bulan Ini' : 
               dateRange === 'quarter' ? '3 Bulan Terakhir' : 'Tahun Ini'}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={handleZoomOut}
              className="p-1 bg-gray-700 hover:bg-gray-600 rounded"
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOut size={16} />
            </button>
            <button 
              onClick={handleZoomIn}
              className="p-1 bg-gray-700 hover:bg-gray-600 rounded"
              disabled={zoomLevel >= 2}
            >
              <ZoomIn size={16} />
            </button>
            <button 
              onClick={() => {}}
              className="p-1 bg-gray-700 hover:bg-gray-600 rounded"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
        
        <div style={{ height: 350 * zoomLevel }} className="transition-all duration-300">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' && (
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }} 
                />
                <Legend />
                {selectedCategories.map((category, index) => (
                  <Line 
                    key={category}
                    type="monotone" 
                    dataKey={category} 
                    stroke={COLORS[index % COLORS.length]} 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                ))}
              </LineChart>
            )}
            
            {chartType === 'bar' && (
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }} 
                />
                <Legend />
                {selectedCategories.map((category, index) => (
                  <Bar 
                    key={category}
                    dataKey={category} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </BarChart>
            )}
            
            {chartType === 'area' && (
              <AreaChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }} 
                />
                <Legend />
                {selectedCategories.map((category, index) => (
                  <Area 
                    key={category}
                    type="monotone" 
                    dataKey={category} 
                    stackId="1"
                    stroke={COLORS[index % COLORS.length]} 
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={0.6} 
                  />
                ))}
              </AreaChart>
            )}
            
            {chartType === 'pie' && (
              <PieChart>
                <Pie
                  data={dataView === 'sales' ? data.distributionData : data.deviceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(dataView === 'sales' ? data.distributionData : data.deviceDistribution).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Total Penjualan</div>
            <div className="text-xl font-bold">
              {formatCurrency(selectedCategories.reduce((sum, category) => {
                return sum + data.salesData.reduce((total, item) => total + item[category], 0);
              }, 0))}
            </div>
          </div>
          
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Pertumbuhan</div>
            <div className="text-xl font-bold text-green-500">+8.5%</div>
            <div className="text-xs text-gray-500 flex items-center">
              <Clock size={12} className="mr-1" />
              Dibandingkan periode sebelumnya
            </div>
          </div>
          
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Kategori Teratas</div>
            <div className="text-xl font-bold">
              {dataView === 'sales' ? 
                data.distributionData.sort((a, b) => b.value - a.value)[0]?.name :
                data.deviceDistribution.sort((a, b) => b.value - a.value)[0]?.name}
            </div>
            <div className="text-xs text-gray-500">
              {dataView === 'sales' ? 
                `${data.distributionData.sort((a, b) => b.value - a.value)[0]?.value}% dari total` :
                `${data.deviceDistribution.sort((a, b) => b.value - a.value)[0]?.value}% dari total`}
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        Sentuh atau arahkan kursor ke grafik untuk detail lebih lanjut. Klik kategori di legenda untuk menyembunyikan/menampilkan.
      </div>
    </div>
  );
};

export default InteractiveChart;