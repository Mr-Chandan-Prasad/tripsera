import { apiClient, checkApiConnection } from '../lib/api';
import { 
  sampleDestinations, 
  sampleServices, 
  sampleOffers, 
  sampleGallery, 
  sampleTestimonials, 
  sampleAdvertisements,
  sampleBookings,
  sampleAddons
} from '../data/sampleData';

export async function initializeDatabase() {
  try {
    console.log('Initializing MySQL database with sample data...');

    // Check if API is available
    const isApiAvailable = await checkApiConnection();
    
    if (!isApiAvailable) {
      console.log('API not available, initializing localStorage with sample data');
      initializeLocalStorage();
      return;
    }

    // Check if data already exists
    const existingDestinations = await apiClient.get('destinations');
    
    if (existingDestinations && existingDestinations.length > 0) {
      console.log('Database already has data, skipping initialization');
      return;
    }

    // Insert sample data
    const promises = [];

    // Insert destinations
    if (sampleDestinations.length > 0) {
      promises.push(
        apiClient.create('destinations', sampleDestinations[0]).catch(err => {
          console.error('Failed to insert destinations:', err);
          return null;
        })
      );
    }

    // Insert services
    if (sampleServices.length > 0) {
      promises.push(
        apiClient.create('services', sampleServices[0]).catch(err => {
          console.error('Failed to insert services:', err);
          return null;
        })
      );
    }

    // Insert offers
    if (sampleOffers.length > 0) {
      promises.push(
        apiClient.create('offers', sampleOffers[0]).catch(err => {
          console.error('Failed to insert offers:', err);
          return null;
        })
      );
    }

    // Insert gallery
    if (sampleGallery.length > 0) {
      promises.push(
        apiClient.create('gallery', sampleGallery[0]).catch(err => {
          console.error('Failed to insert gallery:', err);
          return null;
        })
      );
    }

    // Insert testimonials
    if (sampleTestimonials.length > 0) {
      promises.push(
        apiClient.create('testimonials', sampleTestimonials[0]).catch(err => {
          console.error('Failed to insert testimonials:', err);
          return null;
        })
      );
    }

    // Insert advertisements
    if (sampleAdvertisements.length > 0) {
      promises.push(
        apiClient.create('advertisements', sampleAdvertisements[0]).catch(err => {
          console.error('Failed to insert advertisements:', err);
          return null;
        })
      );
    }

    // Insert bookings
    if (sampleBookings.length > 0) {
      promises.push(
        apiClient.create('bookings', sampleBookings[0]).catch(err => {
          console.error('Failed to insert bookings:', err);
          return null;
        })
      );
    }

    // Insert add-ons
    if (sampleAddons.length > 0) {
      promises.push(
        apiClient.create('addons', sampleAddons[0]).catch(err => {
          console.error('Failed to insert add-ons:', err);
          return null;
        })
      );
    }

    // Execute all insertions
    const results = await Promise.all(promises);

    // Check for errors
    const errors = results.filter(result => result === null);
    if (errors.length > 0) {
      console.error('Some data insertion failed');
    } else {
      console.log('MySQL database initialized successfully with sample data');
    }

  } catch (error) {
    console.error('Failed to initialize MySQL database:', error);
    
    // Fallback: Initialize localStorage with sample data
    initializeLocalStorage();
  }
}

// Function to initialize localStorage with sample data
function initializeLocalStorage() {
  try {
    localStorage.setItem('destinations', JSON.stringify(sampleDestinations));
    localStorage.setItem('services', JSON.stringify(sampleServices));
    localStorage.setItem('offers', JSON.stringify(sampleOffers));
    localStorage.setItem('gallery', JSON.stringify(sampleGallery));
    localStorage.setItem('testimonials', JSON.stringify(sampleTestimonials));
    localStorage.setItem('advertisements', JSON.stringify(sampleAdvertisements));
    localStorage.setItem('bookings', JSON.stringify(sampleBookings));
    localStorage.setItem('addons', JSON.stringify(sampleAddons));
    
    console.log('Fallback: Initialized localStorage with sample data');
  } catch (fallbackError) {
    console.error('Failed to initialize localStorage:', fallbackError);
  }
}

// Function to check database connection
export async function checkDatabaseConnection() {
  try {
    const isApiAvailable = await checkApiConnection();
    
    if (!isApiAvailable) {
      console.warn('MySQL API connection failed, using localStorage fallback');
      return false;
    }

    console.log('MySQL database connection successful');
    return true;
  } catch (error) {
    console.warn('MySQL database connection failed, using localStorage fallback:', error);
    return false;
  }
}
