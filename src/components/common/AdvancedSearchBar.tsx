import React, { useState } from 'react';
import { Search, X, Calendar, Users, MapPin, Filter } from 'lucide-react';

interface SearchFilters {
  query: string;
  duration: string;
  persons: string;
  budget: string;
  category: string;
}

interface AdvancedSearchBarProps {
  placeholder?: string;
  onSearch: (filters: SearchFilters) => void;
  className?: string;
  showFilters?: boolean;
}

const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({ 
  placeholder = "Search destinations, experiences...", 
  onSearch, 
  className = "",
  showFilters = true
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    duration: '',
    persons: '',
    budget: '',
    category: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // Add small delay to prevent too many rapid calls
    setTimeout(() => {
      onSearch(newFilters);
    }, 100);
  };

  const clearFilters = () => {
    const emptyFilters = {
      query: '',
      duration: '',
      persons: '',
      budget: '',
      category: ''
    };
    setFilters(emptyFilters);
    onSearch(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Main Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-20 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/95 backdrop-blur-sm shadow-xl"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {showFilters && (
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`p-2 rounded-lg transition-colors ${
                  showAdvanced ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && showAdvanced && (
        <div className="mt-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Duration Filter */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                Duration
              </label>
              <select
                value={filters.duration}
                onChange={(e) => handleFilterChange('duration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Any Duration</option>
                <option value="1-3">1-3 Days</option>
                <option value="4-7">4-7 Days</option>
                <option value="8-14">1-2 Weeks</option>
                <option value="15+">15+ Days</option>
              </select>
            </div>

            {/* Number of Persons */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 mr-2 text-orange-500" />
                Travelers
              </label>
              <select
                value={filters.persons}
                onChange={(e) => handleFilterChange('persons', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Any Group Size</option>
                <option value="1">Solo (1 Person)</option>
                <option value="2">Couple (2 People)</option>
                <option value="3-5">Small Group (3-5)</option>
                <option value="6-10">Medium Group (6-10)</option>
                <option value="10+">Large Group (10+)</option>
              </select>
            </div>

            {/* Budget Range */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <span className="text-orange-500 mr-2">₹</span>
                Budget Range
              </label>
              <select
                value={filters.budget}
                onChange={(e) => handleFilterChange('budget', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Any Budget</option>
                <option value="0-10000">Under ₹10,000</option>
                <option value="10000-25000">₹10,000 - ₹25,000</option>
                <option value="25000-50000">₹25,000 - ₹50,000</option>
                <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                <option value="100000+">Above ₹1,00,000</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="adventure">Adventure</option>
                <option value="beach">Beach</option>
                <option value="mountain">Mountain</option>
                <option value="cultural">Cultural</option>
                <option value="religious">Religious</option>
                <option value="wildlife">Wildlife</option>
                <option value="romantic">Romantic</option>
                <option value="family">Family</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 mr-2">Active filters:</span>
                {Object.entries(filters).map(([key, value]) => 
                  value && (
                    <span
                      key={key}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                    >
                      {key === 'query' ? `"${value}"` : `${key}: ${value}`}
                      <button
                        onClick={() => handleFilterChange(key as keyof SearchFilters, '')}
                        className="ml-2 text-orange-600 hover:text-orange-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchBar;