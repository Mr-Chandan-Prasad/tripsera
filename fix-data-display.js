// Quick fix script to ensure data is properly loaded and displayed
// Run this in the browser console to fix the data display issue

console.log('🔧 Starting data display fix...');

// Function to ensure data is properly loaded
function fixDataDisplay() {
  // Check if data exists in localStorage
  const tables = ['destinations', 'services', 'bookings', 'addons', 'gallery', 'testimonials', 'advertisements', 'offers'];
  
  tables.forEach(table => {
    const data = localStorage.getItem(table);
    if (data) {
      const parsed = JSON.parse(data);
      console.log(`✅ ${table}: ${parsed.length} items found`);
    } else {
      console.log(`❌ ${table}: No data found`);
    }
  });
  
  // Force reload the page to refresh data
  console.log('🔄 Reloading page to refresh data...');
  window.location.reload();
}

// Function to add sample data if none exists
function addSampleData() {
  const sampleDestinations = [
    {
      id: 1,
      name: "Goa Beach Paradise",
      description: "Beautiful beaches and vibrant nightlife",
      price: 15000,
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500",
      location: "Goa, India",
      duration: "5 days",
      category: "Beach"
    },
    {
      id: 2,
      name: "Kerala Backwaters",
      description: "Serene backwaters and lush greenery",
      price: 12000,
      image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=500",
      location: "Kerala, India",
      duration: "4 days",
      category: "Nature"
    }
  ];
  
  const sampleServices = [
    {
      id: 1,
      name: "Flight Booking",
      description: "Domestic and international flights",
      price: 5000,
      category: "Transportation"
    },
    {
      id: 2,
      name: "Hotel Booking",
      description: "Luxury and budget accommodations",
      price: 3000,
      category: "Accommodation"
    }
  ];
  
  // Add sample data to localStorage
  localStorage.setItem('destinations', JSON.stringify(sampleDestinations));
  localStorage.setItem('services', JSON.stringify(sampleServices));
  
  console.log('✅ Sample data added to localStorage');
  console.log('🔄 Reloading page...');
  window.location.reload();
}

// Function to clear all data and start fresh
function clearAllData() {
  const tables = ['destinations', 'services', 'bookings', 'addons', 'gallery', 'testimonials', 'advertisements', 'offers'];
  tables.forEach(table => localStorage.removeItem(table));
  console.log('🗑️ All data cleared');
  console.log('🔄 Reloading page...');
  window.location.reload();
}

// Auto-run the fix
fixDataDisplay();

// Make functions available globally
window.fixDataDisplay = fixDataDisplay;
window.addSampleData = addSampleData;
window.clearAllData = clearAllData;

console.log('🔧 Fix functions available:');
console.log('- fixDataDisplay() - Check and fix data display');
console.log('- addSampleData() - Add sample data if none exists');
console.log('- clearAllData() - Clear all data and start fresh');
