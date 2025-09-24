import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Save, X, Upload, Star, DollarSign, Package } from 'lucide-react';
import { useLocalStorageQuery, useLocalStorageMutation, initializeSampleData } from '../../hooks/useLocalStorage';
import { formatPrice, hasPriceRange } from '../../utils/priceUtils';
import { useNotificationContext } from '../../contexts/NotificationContext';
import LoadingSpinner from '../common/LoadingSpinner';

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  price_range?: {
    min: number;
    max: number;
  };
  category: string;
  image_url?: string;
  is_active: boolean;
  max_quantity: number;
  created_at: string;
}

const AddOnsManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<AddOn | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<AddOn>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    image_url: '',
    is_active: true,
    max_quantity: 1
  });
  const { showSuccess, showError, showWarning } = useNotificationContext();
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Initialize sample data
  React.useEffect(() => {
    initializeSampleData();
  }, []);

  const { data: addons = [], loading, refetch } = useLocalStorageQuery<AddOn[]>('addons', '*');
  const { insert: createAddOn, update: updateAddOn, remove: deleteAddOn, loading: mutationLoading } = useLocalStorageMutation();

  // Filter add-ons
  const filteredAddOns = addons.filter(addon => {
    const matchesSearch = !searchQuery || 
      addon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addon.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addon.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || addon.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(addons.map(addon => addon.category)))];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.description || !formData.category || formData.price === undefined || formData.price < 0) {
      showWarning('Validation Error', 'Please fill in all required fields with valid values.', 4000);
      return;
    }
    
    try {
      // Process price range fields
      const processedData = { ...formData };
      
      // If price range fields are provided, create price_range object
      if (formData.price_range_min && formData.price_range_max) {
        processedData.price_range = {
          min: Number(formData.price_range_min),
          max: Number(formData.price_range_max)
        };
        // Remove the individual fields
        delete processedData.price_range_min;
        delete processedData.price_range_max;
      }
      
      console.log('Saving add-on with data:', processedData);
      if (editingItem) {
        console.log('Updating add-on:', editingItem.id);
        await updateAddOn('addons', editingItem.id, processedData);
      } else {
        console.log('Creating new add-on');
        await createAddOn('addons', processedData);
      }
      
      setEditingItem(null);
      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        image_url: '',
        is_active: true,
        max_quantity: 1
      });
      setSuccessMessage(editingItem ? 'Add-on updated successfully!' : 'Add-on created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      refetch();
    } catch (error) {
      console.error('Error saving add-on:', error);
      showError('Save Failed', 'Error saving add-on. Please try again.', 5000);
    }
  };

  const handleEdit = (addon: AddOn) => {
    setEditingItem(addon);
    // Process price range for form display
    const formData = { ...addon };
    if (addon.price_range) {
      formData.price_range_min = addon.price_range.min;
      formData.price_range_max = addon.price_range.max;
    }
    setFormData(formData);
    setShowForm(true);
    setSuccessMessage('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this add-on?')) {
      try {
        await deleteAddOn('addons', id);
        refetch();
      } catch (error) {
        console.error('Error deleting add-on:', error);
        showError('Delete Failed', 'Error deleting add-on. Please try again.', 5000);
      }
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setShowForm(false);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      image_url: '',
      is_active: true,
      max_quantity: 1
    });
    setSuccessMessage('');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transportation': return '🚗';
      case 'insurance': return '🛡️';
      case 'photography': return '📸';
      case 'guide': return '🗺️';
      case 'wellness': return '🧘';
      case 'adventure': return '🏔️';
      case 'accommodation': return '🏨';
      case 'culture': return '🎭';
      case 'connectivity': return '📶';
      case 'dining': return '🍽️';
      default: return '✨';
    }
  };

  const getFormFields = () => [
    { name: 'name', label: 'Add-on Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'price', label: 'Base Price (₹)', type: 'number', required: true },
    { name: 'price_range_min', label: 'Min Price (₹)', type: 'number' },
    { name: 'price_range_max', label: 'Max Price (₹)', type: 'number' },
    { name: 'category', label: 'Category', type: 'select', required: true, options: [
      'transportation', 'insurance', 'photography', 'guide', 'wellness', 
      'adventure', 'accommodation', 'culture', 'connectivity', 'dining'
    ]},
    { name: 'image_url', label: 'Image URL', type: 'url' },
    { name: 'max_quantity', label: 'Max Quantity', type: 'number', required: true },
    { name: 'is_active', label: 'Active', type: 'checkbox' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600">Loading add-ons...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 font-poppins">Add-ons Management</h2>
          <p className="text-gray-600 font-inter">Manage additional services and experiences</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setSuccessMessage('');
          }}
          className="btn-primary inline-flex items-center font-inter"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Add-on
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg font-inter">
          {successMessage}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-inter">Total Add-ons</p>
              <p className="text-2xl font-bold text-gray-800 font-poppins">{addons.length}</p>
            </div>
            <Package className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-inter">Active Add-ons</p>
              <p className="text-2xl font-bold text-green-600 font-poppins">
                {addons.filter(a => a.is_active).length}
              </p>
            </div>
            <Star className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-inter">Categories</p>
              <p className="text-2xl font-bold text-blue-600 font-poppins">
                {categories.length - 1}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search add-ons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-inter transition-colors duration-300 ${
                selectedCategory === category
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All' : (
                <span className="flex items-center space-x-1">
                  <span>{getCategoryIcon(category)}</span>
                  <span className="capitalize">{category}</span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Add-ons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAddOns.map((addon) => (
          <div key={addon.id} className="admin-card">
            <div className="relative">
              <img
                src={addon.image_url || 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400'}
                alt={addon.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400';
                }}
              />
              
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                <span className="text-sm font-semibold text-gray-800 flex items-center space-x-1">
                  <span>{getCategoryIcon(addon.category)}</span>
                  <span className="capitalize">{addon.category}</span>
                </span>
              </div>

              {!addon.is_active && (
                <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-2 py-1">
                  <span className="text-xs font-semibold">Inactive</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800 font-poppins">{addon.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-2 font-inter">{addon.description}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-500 font-poppins">
                    {formatPrice(addon)}
                  </div>
                  <div className="text-sm text-gray-500 font-inter">Max: {addon.max_quantity}</div>
                  {hasPriceRange(addon) && (
                    <div className="text-xs text-gray-400 mt-1">
                      Avg: ₹{Math.round((addon.price_range.min + addon.price_range.max) / 2).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(addon)}
                  className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm font-inter"
                >
                  <Edit className="w-4 h-4 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(addon.id)}
                  className="flex-1 bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm font-inter"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAddOns.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-600 mb-2">No add-ons found</h3>
          <p className="text-gray-500 mb-4">Create your first add-on to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary font-inter"
          >
            Add New Add-on
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 font-poppins">
                {editingItem ? 'Edit Add-on' : 'Add New Add-on'}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {getFormFields().map((field) => (
                <div key={field.name}>
                  <label className="form-label">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.name as keyof AddOn] as string || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="form-input"
                      rows={3}
                      required={field.required}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.name as keyof AddOn] as string || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="form-input"
                      required={field.required}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData[field.name as keyof AddOn] as boolean || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.checked }))}
                        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-600 font-inter">Active</span>
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.name as keyof AddOn] as string || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="form-input"
                      required={field.required}
                      min={field.type === 'number' ? 0 : undefined}
                    />
                  )}
                </div>
              ))}

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300 font-inter"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutationLoading}
                  className="flex-1 btn-primary font-poppins disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mutationLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 inline mr-2" />
                      {editingItem ? 'Update' : 'Create'} Add-on
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddOnsManager;
