import { useState, useEffect, useCallback } from 'react';

// LocalStorage-only hooks for data management
export function useLocalStorageQuery<T>(
  table: string,
  select: string = '*',
  filters?: Record<string, any>
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      
      // Get data from localStorage
      const storedData = localStorage.getItem(table);
      let result: T[] = [];
      
      if (storedData) {
        result = JSON.parse(storedData);
        
        // Apply filters if provided
        if (filters && Object.keys(filters).length > 0) {
          result = result.filter((item: any) => {
            return Object.entries(filters).every(([key, value]) => {
              if (value === null || value === undefined) return true;
              if (typeof value === 'string') {
                return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
              }
              return item[key] === value;
            });
          });
        }
      }
      
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error(`Error loading ${table}:`, err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [table, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

export function useLocalStorageMutation() {
  const [loading, setLoading] = useState(false);

  const insert = async (table: string, data: any) => {
    try {
      setLoading(true);
      
      // Get existing data
      const existingData = JSON.parse(localStorage.getItem(table) || '[]');
      
      // Create new item with ID
      const newItem = {
        ...data,
        id: table === 'bookings' ? `BK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}` : Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(table === 'bookings' && {
          payment_status: data.payment_status || 'pending',
          amount: data.amount || 0
        })
      };
      
      // Add to array
      const updatedData = [...existingData, newItem];
      
      // Save to localStorage
      localStorage.setItem(table, JSON.stringify(updatedData));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('localStorageUpdate', { 
        detail: { table, action: 'insert', data: newItem } 
      }));
      
      console.log(`✅ Data inserted into ${table}:`, newItem);
      return newItem;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Insert failed';
      console.error(`Insert error for ${table}:`, message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const update = async (table: string, id: string, data: any) => {
    try {
      setLoading(true);
      
      // Get existing data
      const existingData = JSON.parse(localStorage.getItem(table) || '[]');
      
      // Find and update item
      const updatedData = existingData.map((item: any) => {
        if (item.id === id) {
          return {
            ...item,
            ...data,
            updated_at: new Date().toISOString()
          };
        }
        return item;
      });
      
      // Save to localStorage
      localStorage.setItem(table, JSON.stringify(updatedData));
      
      // Dispatch custom event to notify other components
      const updatedItem = updatedData.find((item: any) => item.id === id);
      window.dispatchEvent(new CustomEvent('localStorageUpdate', { 
        detail: { table, action: 'update', data: updatedItem } 
      }));
      
      console.log(`✅ Data updated in ${table}:`, updatedItem);
      return updatedItem;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed';
      console.error(`Update error for ${table}:`, message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (table: string, id: string) => {
    try {
      setLoading(true);
      
      // Get existing data
      const existingData = JSON.parse(localStorage.getItem(table) || '[]');
      
      // Remove item
      const updatedData = existingData.filter((item: any) => item.id !== id);
      
      // Save to localStorage
      localStorage.setItem(table, JSON.stringify(updatedData));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('localStorageUpdate', { 
        detail: { table, action: 'delete', data: { id } } 
      }));
      
      console.log(`✅ Data removed from ${table}:`, id);
      return { message: 'Item deleted successfully' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      console.error(`Delete error for ${table}:`, message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return { insert, update, remove, loading };
}

// Availability management functions
export function checkAvailability(itemId: string, itemType: 'destinations' | 'services', requestedSeats: number = 1): { available: boolean; remainingCapacity: number; message: string } {
  try {
    const items = JSON.parse(localStorage.getItem(itemType) || '[]');
    const item = items.find((i: any) => i.id === itemId);
    
    if (!item) {
      return { available: false, remainingCapacity: 0, message: 'Item not found' };
    }
    
    if (!item.is_available) {
      return { available: false, remainingCapacity: 0, message: 'This item is currently unavailable' };
    }
    
    const remainingCapacity = item.max_capacity - item.current_bookings;
    
    if (remainingCapacity < requestedSeats) {
      return { 
        available: false, 
        remainingCapacity, 
        message: `Only ${remainingCapacity} seats available. You requested ${requestedSeats} seats.` 
      };
    }
    
    return { 
      available: true, 
      remainingCapacity, 
      message: `${remainingCapacity} seats available` 
    };
  } catch (error) {
    console.error('Error checking availability:', error);
    return { available: false, remainingCapacity: 0, message: 'Error checking availability' };
  }
}

export function updateBookingCount(itemId: string, itemType: 'destinations' | 'services', seatsToAdd: number): boolean {
  try {
    const items = JSON.parse(localStorage.getItem(itemType) || '[]');
    const itemIndex = items.findIndex((i: any) => i.id === itemId);
    
    if (itemIndex === -1) {
      return false;
    }
    
    items[itemIndex].current_bookings += seatsToAdd;
    items[itemIndex].updated_at = new Date().toISOString();
    
    // Check if item should be marked as unavailable
    if (items[itemIndex].current_bookings >= items[itemIndex].max_capacity) {
      items[itemIndex].is_available = false;
    }
    
    localStorage.setItem(itemType, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error('Error updating booking count:', error);
    return false;
  }
}

export function removeBookingCount(itemId: string, itemType: 'destinations' | 'services', seatsToRemove: number): boolean {
  try {
    const items = JSON.parse(localStorage.getItem(itemType) || '[]');
    const itemIndex = items.findIndex((i: any) => i.id === itemId);
    
    if (itemIndex === -1) {
      return false;
    }
    
    items[itemIndex].current_bookings = Math.max(0, items[itemIndex].current_bookings - seatsToRemove);
    items[itemIndex].updated_at = new Date().toISOString();
    
    // Mark as available if there's capacity
    if (items[itemIndex].current_bookings < items[itemIndex].max_capacity) {
      items[itemIndex].is_available = true;
    }
    
    localStorage.setItem(itemType, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error('Error removing booking count:', error);
    return false;
  }
}

export function getAvailabilityStatus(itemId: string, itemType: 'destinations' | 'services'): { status: 'available' | 'limited' | 'full' | 'unavailable'; remainingCapacity: number; percentage: number } {
  try {
    const items = JSON.parse(localStorage.getItem(itemType) || '[]');
    const item = items.find((i: any) => i.id === itemId);
    
    if (!item || !item.is_available) {
      return { status: 'unavailable', remainingCapacity: 0, percentage: 0 };
    }
    
    const remainingCapacity = item.max_capacity - item.current_bookings;
    const percentage = Math.round((item.current_bookings / item.max_capacity) * 100);
    
    if (remainingCapacity === 0) {
      return { status: 'full', remainingCapacity: 0, percentage: 100 };
    } else if (remainingCapacity <= 3) {
      return { status: 'limited', remainingCapacity, percentage };
    } else {
      return { status: 'available', remainingCapacity, percentage };
    }
  } catch (error) {
    console.error('Error getting availability status:', error);
    return { status: 'unavailable', remainingCapacity: 0, percentage: 0 };
  }
}

export function cancelBooking(bookingId: string, reason?: string): { success: boolean; message: string } {
  try {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const bookingIndex = bookings.findIndex((b: any) => b.id === bookingId);
    
    if (bookingIndex === -1) {
      return { success: false, message: 'Booking not found' };
    }
    
    const booking = bookings[bookingIndex];
    
    // Check if booking is already cancelled
    if (booking.payment_status === 'cancelled') {
      return { success: false, message: 'Booking is already cancelled' };
    }
    
    // Check if booking is already paid (optional: you might want to allow cancellation of paid bookings)
    if (booking.payment_status === 'paid') {
      // For now, we'll allow cancellation of paid bookings
      // In a real system, you might want to implement refund logic here
    }
    
    // Update booking status
    bookings[bookingIndex] = {
      ...booking,
      payment_status: 'cancelled',
      cancellation_reason: reason || 'No reason provided',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Update availability counts by removing the booking
    if (booking.destination_id) {
      removeBookingCount(booking.destination_id, 'destinations', booking.seats_selected || 1);
    }
    if (booking.service_id) {
      removeBookingCount(booking.service_id, 'services', booking.seats_selected || 1);
    }
    
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    console.log('✅ Booking cancelled successfully:', bookingId);
    return { success: true, message: 'Booking cancelled successfully' };
    
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { success: false, message: 'Error cancelling booking' };
  }
}

export function getCancellableBookings(): any[] {
  try {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    return bookings.filter((booking: any) => 
      booking.payment_status !== 'cancelled' && 
      booking.payment_status !== 'failed'
    );
  } catch (error) {
    console.error('Error getting cancellable bookings:', error);
    return [];
  }
}

export function resetAllBookingCounts(): { success: boolean; message: string } {
  try {
    // Reset destinations booking counts
    const destinations = JSON.parse(localStorage.getItem('destinations') || '[]');
    const resetDestinations = destinations.map((dest: any) => ({
      ...dest,
      current_bookings: 0,
      updated_at: new Date().toISOString()
    }));
    localStorage.setItem('destinations', JSON.stringify(resetDestinations));

    // Reset services booking counts
    const services = JSON.parse(localStorage.getItem('services') || '[]');
    const resetServices = services.map((service: any) => ({
      ...service,
      current_bookings: 0,
      updated_at: new Date().toISOString()
    }));
    localStorage.setItem('services', JSON.stringify(resetServices));

    console.log('✅ All booking counts reset successfully');
    return { success: true, message: 'All booking counts have been reset to 0' };
  } catch (error) {
    console.error('Error resetting booking counts:', error);
    return { success: false, message: 'Error resetting booking counts' };
  }
}

export function getServicesForDestination(destinationId: string): any[] {
  try {
    const services = JSON.parse(localStorage.getItem('services') || '[]');
    return services.filter((service: any) => {
      // If service has compatible_destinations array, check if it includes the destination
      if (service.compatible_destinations && Array.isArray(service.compatible_destinations)) {
        // Only show service if it has destinations selected AND includes the current destination
        return service.compatible_destinations.length > 0 && service.compatible_destinations.includes(destinationId);
      }
      // If no compatible_destinations defined, show all services (backward compatibility)
      return true;
    });
  } catch (error) {
    console.error('Error filtering services by destination:', error);
    return [];
  }
}

export function updateServiceDestinationCompatibility(serviceId: string, destinationIds: string[]): { success: boolean; message: string } {
  try {
    const services = JSON.parse(localStorage.getItem('services') || '[]');
    const serviceIndex = services.findIndex((s: any) => s.id === serviceId);
    
    if (serviceIndex === -1) {
      return { success: false, message: 'Service not found' };
    }
    
    services[serviceIndex] = {
      ...services[serviceIndex],
      compatible_destinations: destinationIds,
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem('services', JSON.stringify(services));
    console.log('✅ Service destination compatibility updated successfully');
    return { success: true, message: 'Service destination compatibility updated successfully' };
  } catch (error) {
    console.error('Error updating service destination compatibility:', error);
    return { success: false, message: 'Error updating service destination compatibility' };
  }
}

export function updateGroupTourPredefinedDates(serviceId: string, predefinedDates: any[]): { success: boolean; message: string } {
  try {
    const services = JSON.parse(localStorage.getItem('services') || '[]');
    const serviceIndex = services.findIndex((s: any) => s.id === serviceId);
    
    if (serviceIndex === -1) {
      return { success: false, message: 'Service not found' };
    }
    
    services[serviceIndex] = {
      ...services[serviceIndex],
      predefined_dates: predefinedDates,
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem('services', JSON.stringify(services));
    console.log('✅ Group tour predefined dates updated successfully');
    return { success: true, message: 'Group tour predefined dates updated successfully' };
  } catch (error) {
    console.error('Error updating group tour predefined dates:', error);
    return { success: false, message: 'Error updating group tour predefined dates' };
  }
}

export function getGroupTourPredefinedDates(serviceId: string): any[] {
  try {
    const services = JSON.parse(localStorage.getItem('services') || '[]');
    const service = services.find((s: any) => s.id === serviceId);
    
    if (!service || !service.is_group_tour) {
      return [];
    }
    
    return service.predefined_dates || [];
  } catch (error) {
    console.error('Error getting group tour predefined dates:', error);
    return [];
  }
}

export function getDestinationGroupTourDates(destinationId: string): any[] {
  try {
    const destinations = JSON.parse(localStorage.getItem('destinations') || '[]');
    console.log('🔍 Debug - All destinations in getDestinationGroupTourDates:', destinations);
    console.log('🔍 Debug - Looking for destination ID:', destinationId);
    
    const destination = destinations.find((d: any) => d.id === destinationId);
    console.log('🔍 Debug - Found destination:', destination);
    
    if (!destination) {
      console.log('🔍 Debug - Destination not found');
      return [];
    }
    
    const groupTourDates = destination.group_tour_dates || [];
    console.log('🔍 Debug - Group tour dates for destination:', groupTourDates);
    
    return groupTourDates;
  } catch (error) {
    console.error('Error getting destination group tour dates:', error);
    return [];
  }
}

export function updateDestinationGroupTourDates(destinationId: string, groupTourDates: any[]): { success: boolean; message: string } {
  try {
    const destinations = JSON.parse(localStorage.getItem('destinations') || '[]');
    const destinationIndex = destinations.findIndex((d: any) => d.id === destinationId);
    
    if (destinationIndex === -1) {
      return { success: false, message: 'Destination not found' };
    }
    
    destinations[destinationIndex] = {
      ...destinations[destinationIndex],
      group_tour_dates: groupTourDates,
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem('destinations', JSON.stringify(destinations));
    console.log('✅ Destination group tour dates updated successfully');
    return { success: true, message: 'Destination group tour dates updated successfully' };
  } catch (error) {
    console.error('Error updating destination group tour dates:', error);
    return { success: false, message: 'Error updating destination group tour dates' };
  }
}

export function refreshDestinationsWithGroupTourDates(): { success: boolean; message: string } {
  try {
    const destinations = JSON.parse(localStorage.getItem('destinations') || '[]');
    
    // Sample group tour dates for each destination
    const sampleGroupTourDates = {
      '1': [ // Goa Beach Paradise
        {
          id: '1',
          date: '2024-03-15',
          time: '09:00',
          description: 'Morning Beach Tour',
          available_slots: 20,
          booked_slots: 0
        },
        {
          id: '2',
          date: '2024-03-20',
          time: '14:00',
          description: 'Afternoon Beach Tour',
          available_slots: 20,
          booked_slots: 0
        }
      ],
      '2': [ // Kerala Backwaters
        {
          id: '1',
          date: '2024-03-18',
          time: '10:00',
          description: 'Morning Backwater Tour',
          available_slots: 15,
          booked_slots: 0
        },
        {
          id: '2',
          date: '2024-03-22',
          time: '15:00',
          description: 'Afternoon Backwater Tour',
          available_slots: 15,
          booked_slots: 0
        }
      ],
      '3': [ // Rajasthan Heritage
        {
          id: '1',
          date: '2024-03-25',
          time: '08:00',
          description: 'Heritage Palace Tour',
          available_slots: 25,
          booked_slots: 0
        },
        {
          id: '2',
          date: '2024-03-28',
          time: '16:00',
          description: 'Desert Safari Tour',
          available_slots: 25,
          booked_slots: 0
        }
      ]
    };
    
    const updatedDestinations = destinations.map((destination: any) => {
      if (!destination.group_tour_dates && sampleGroupTourDates[destination.id as keyof typeof sampleGroupTourDates]) {
        return {
          ...destination,
          group_tour_dates: sampleGroupTourDates[destination.id as keyof typeof sampleGroupTourDates],
          updated_at: new Date().toISOString()
        };
      }
      return destination;
    });
    
    localStorage.setItem('destinations', JSON.stringify(updatedDestinations));
    console.log('✅ Destinations refreshed with group tour dates');
    return { success: true, message: 'Destinations refreshed with group tour dates' };
  } catch (error) {
    console.error('Error refreshing destinations:', error);
    return { success: false, message: 'Error refreshing destinations' };
  }
}



// Migrate existing data to include group tour dates
export function migrateDataForGroupTourDates() {
  try {
    const destinations = JSON.parse(localStorage.getItem('destinations') || '[]');
    let needsUpdate = false;
    
    const updatedDestinations = destinations.map((destination: any) => {
      if (!destination.group_tour_dates) {
        needsUpdate = true;
        return {
          ...destination,
          group_tour_dates: [],
          updated_at: new Date().toISOString()
        };
      }
      return destination;
    });
    
    if (needsUpdate) {
      localStorage.setItem('destinations', JSON.stringify(updatedDestinations));
      console.log('✅ Migrated destinations to include group_tour_dates field');
    }
    
    return { success: true, message: 'Migration completed' };
  } catch (error) {
    console.error('Error migrating data for group tour dates:', error);
    return { success: false, message: 'Migration failed' };
  }
}

// Migrate existing data to include capacity fields
export function migrateDataForAvailability() {
  try {
    // Migrate destinations
    const destinations = JSON.parse(localStorage.getItem('destinations') || '[]');
    let destinationsUpdated = false;
    const migratedDestinations = destinations.map((dest: any) => {
      if (dest.max_capacity === undefined) {
        destinationsUpdated = true;
        return {
          ...dest,
          max_capacity: 20, // Default capacity
          current_bookings: 0,
          is_available: true,
          updated_at: new Date().toISOString()
        };
      }
      return dest;
    });
    
    if (destinationsUpdated) {
      localStorage.setItem('destinations', JSON.stringify(migratedDestinations));
      console.log('✅ Migrated destinations with capacity fields');
    }

    // Migrate services
    const services = JSON.parse(localStorage.getItem('services') || '[]');
    let servicesUpdated = false;
    const migratedServices = services.map((service: any) => {
      if (service.max_capacity === undefined) {
        servicesUpdated = true;
        return {
          ...service,
          max_capacity: 30, // Default capacity
          current_bookings: 0,
          is_available: true,
          updated_at: new Date().toISOString()
        };
      }
      return service;
    });
    
    if (servicesUpdated) {
      localStorage.setItem('services', JSON.stringify(migratedServices));
      console.log('✅ Migrated services with capacity fields');
    }
  } catch (error) {
    console.error('Error migrating data for availability:', error);
  }
}

// Migrate existing booking data to use correct field names
export function migrateBookingData() {
  try {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    let bookingsUpdated = false;
    
    const migratedBookings = bookings.map((booking: any) => {
      let updated = false;
      const newBooking = { ...booking };
      
      // Fix travel_date to booking_date
      if (booking.travel_date && !booking.booking_date) {
        newBooking.booking_date = booking.travel_date;
        updated = true;
      }
      
      // Fix travelers to seats_selected
      if (booking.travelers && !booking.seats_selected) {
        newBooking.seats_selected = booking.travelers;
        updated = true;
      }
      
      // Add missing amount fields
      if (booking.total_amount && !booking.amount) {
        newBooking.amount = booking.total_amount;
        updated = true;
      }
      
      if (booking.total_amount && !booking.base_amount) {
        newBooking.base_amount = booking.total_amount - (booking.addons_total || 0);
        updated = true;
      }
      
      if (updated) {
        newBooking.updated_at = new Date().toISOString();
        bookingsUpdated = true;
      }
      
      return newBooking;
    });
    
    if (bookingsUpdated) {
      localStorage.setItem('bookings', JSON.stringify(migratedBookings));
      console.log('✅ Migrated booking data to use correct field names');
    }
    
  } catch (error) {
    console.error('Error migrating booking data:', error);
  }
}

// Migrate existing data to use correct field names
export function migrateDataFieldNames() {
  try {
    // Migrate destinations
    const destinations = JSON.parse(localStorage.getItem('destinations') || '[]');
    let destinationsUpdated = false;
    const migratedDestinations = destinations.map((dest: any) => {
      if (dest.image && !dest.image_url) {
        destinationsUpdated = true;
        return {
          ...dest,
          image_url: dest.image,
          updated_at: new Date().toISOString()
        };
      }
      return dest;
    });
    
    if (destinationsUpdated) {
      localStorage.setItem('destinations', JSON.stringify(migratedDestinations));
      console.log('✅ Migrated destinations to use image_url field');
    }

    // Migrate gallery
    const gallery = JSON.parse(localStorage.getItem('gallery') || '[]');
    let galleryUpdated = false;
    const migratedGallery = gallery.map((item: any) => {
      if (item.image && !item.image_url) {
        galleryUpdated = true;
        return {
          ...item,
          image_url: item.image,
          updated_at: new Date().toISOString()
        };
      }
      return item;
    });
    
    if (galleryUpdated) {
      localStorage.setItem('gallery', JSON.stringify(migratedGallery));
      console.log('✅ Migrated gallery to use image_url field');
    }

    // Migrate advertisements
    const advertisements = JSON.parse(localStorage.getItem('advertisements') || '[]');
    let adsUpdated = false;
    const migratedAds = advertisements.map((ad: any) => {
      if (ad.image && !ad.image_url) {
        adsUpdated = true;
        return {
          ...ad,
          image_url: ad.image,
          updated_at: new Date().toISOString()
        };
      }
      return ad;
    });
    
    if (adsUpdated) {
      localStorage.setItem('advertisements', JSON.stringify(migratedAds));
      console.log('✅ Migrated advertisements to use image_url field');
    }

    // Migrate offers
    const offers = JSON.parse(localStorage.getItem('offers') || '[]');
    let offersUpdated = false;
    const migratedOffers = offers.map((offer: any) => {
      if (offer.image && !offer.image_url) {
        offersUpdated = true;
        return {
          ...offer,
          image_url: offer.image,
          updated_at: new Date().toISOString()
        };
      }
      return offer;
    });
    
    if (offersUpdated) {
      localStorage.setItem('offers', JSON.stringify(migratedOffers));
      console.log('✅ Migrated offers to use image_url field');
    }

  } catch (error) {
    console.error('Error migrating data field names:', error);
  }
}

// Add new destinations and services to existing data
export function addNewDestinationsAndServices() {
  const existingDestinations = JSON.parse(localStorage.getItem('destinations') || '[]');
  const existingServices = JSON.parse(localStorage.getItem('services') || '[]');
  
  // New destinations to add
  const newDestinations = [
    {
      id: '4',
      name: 'Kashmir Valley Explorer',
      description: 'Discover the breathtaking beauty of Kashmir with houseboat stays and mountain views',
      price: 27999,
      price_range: {
        min: 25000,
        max: 35000
      },
      image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
      location: 'Srinagar, Kashmir',
      duration: '7 days',
      category: 'Mountain',
      max_capacity: 15,
      current_bookings: 3,
      is_available: true,
      group_tour_dates: [
        {
          id: '1',
          date: '2024-04-10',
          time: '09:00',
          description: 'Houseboat Experience',
          available_slots: 15,
          booked_slots: 3
        },
        {
          id: '2',
          date: '2024-04-15',
          time: '10:00',
          description: 'Gulmarg Gondola Ride',
          available_slots: 15,
          booked_slots: 2
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Himachal Adventure',
      description: 'Adventure-packed mountain experience with trekking and adventure sports',
      price: 24999,
      price_range: {
        min: 22000,
        max: 32000
      },
      image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
      location: 'Manali, Himachal Pradesh',
      duration: '8 days',
      category: 'Adventure',
      max_capacity: 18,
      current_bookings: 4,
      is_available: true,
      group_tour_dates: [
        {
          id: '1',
          date: '2024-04-20',
          time: '08:00',
          description: 'Mountain Trekking',
          available_slots: 18,
          booked_slots: 4
        },
        {
          id: '2',
          date: '2024-04-25',
          time: '14:00',
          description: 'Paragliding Adventure',
          available_slots: 18,
          booked_slots: 2
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '6',
      name: 'Andaman Island Escape',
      description: 'Tropical paradise with pristine beaches and water activities',
      price: 35999,
      price_range: {
        min: 32000,
        max: 45000
      },
      image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500',
      location: 'Port Blair, Andaman',
      duration: '6 days',
      category: 'Beach',
      max_capacity: 16,
      current_bookings: 5,
      is_available: true,
      group_tour_dates: [
        {
          id: '1',
          date: '2024-05-05',
          time: '09:00',
          description: 'Scuba Diving Experience',
          available_slots: 16,
          booked_slots: 5
        },
        {
          id: '2',
          date: '2024-05-10',
          time: '11:00',
          description: 'Island Hopping Tour',
          available_slots: 16,
          booked_slots: 3
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '7',
      name: 'Ladakh High Altitude',
      description: 'Experience the raw beauty of Ladakh with monasteries and high-altitude lakes',
      price: 32999,
      price_range: {
        min: 28000,
        max: 40000
      },
      image_url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=500',
      location: 'Leh, Ladakh',
      duration: '9 days',
      category: 'Mountain',
      max_capacity: 12,
      current_bookings: 2,
      is_available: true,
      group_tour_dates: [
        {
          id: '1',
          date: '2024-06-01',
          time: '07:00',
          description: 'Monastery Tour',
          available_slots: 12,
          booked_slots: 2
        },
        {
          id: '2',
          date: '2024-06-05',
          time: '10:00',
          description: 'Pangong Lake Visit',
          available_slots: 12,
          booked_slots: 1
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '8',
      name: 'Tamil Nadu Temples',
      description: 'Explore the rich cultural heritage and magnificent temples of Tamil Nadu',
      price: 19999,
      price_range: {
        min: 16000,
        max: 25000
      },
      image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=500',
      location: 'Madurai, Tamil Nadu',
      duration: '5 days',
      category: 'Heritage',
      max_capacity: 20,
      current_bookings: 6,
      is_available: true,
      group_tour_dates: [
        {
          id: '1',
          date: '2024-05-15',
          time: '08:00',
          description: 'Temple Heritage Tour',
          available_slots: 20,
          booked_slots: 6
        },
        {
          id: '2',
          date: '2024-05-18',
          time: '16:00',
          description: 'Cultural Show Experience',
          available_slots: 20,
          booked_slots: 4
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // New services to add
  const newServices = [
    {
      id: '5',
      name: 'Houseboat Stay',
      description: 'Traditional houseboat accommodation in Kashmir and Kerala',
      price: 4000,
      price_range: {
        min: 3000,
        max: 6000
      },
      category: 'Accommodation',
      compatible_destinations: ['2', '4'], // Kerala Backwaters and Kashmir
      max_capacity: 8,
      current_bookings: 0,
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '6',
      name: 'Adventure Sports',
      description: 'Paragliding, trekking, and adventure activities',
      price: 3500,
      price_range: {
        min: 2500,
        max: 5000
      },
      category: 'Adventure',
      compatible_destinations: ['5', '7'], // Himachal and Ladakh
      max_capacity: 15,
      current_bookings: 0,
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '7',
      name: 'Water Sports Package',
      description: 'Scuba diving, snorkeling, and water activities',
      price: 4500,
      price_range: {
        min: 3500,
        max: 6500
      },
      category: 'Adventure',
      compatible_destinations: ['1', '6'], // Goa and Andaman
      max_capacity: 12,
      current_bookings: 0,
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '8',
      name: 'Cultural Heritage Tour',
      description: 'Guided tours of temples, palaces, and cultural sites',
      price: 2500,
      price_range: {
        min: 2000,
        max: 3500
      },
      category: 'Cultural',
      compatible_destinations: ['3', '8'], // Rajasthan and Tamil Nadu
      max_capacity: 20,
      current_bookings: 0,
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '9',
      name: 'Mountain Resort Stay',
      description: 'Luxury mountain resort accommodation with scenic views',
      price: 5000,
      price_range: {
        min: 4000,
        max: 7000
      },
      category: 'Accommodation',
      compatible_destinations: ['4', '5', '7'], // Kashmir, Himachal, Ladakh
      max_capacity: 25,
      current_bookings: 0,
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '10',
      name: 'Island Hopping Tour',
      description: 'Boat tours to multiple islands with lunch included',
      price: 3000,
      price_range: {
        min: 2500,
        max: 4000
      },
      category: 'Tour',
      compatible_destinations: ['6'], // Andaman only
      max_capacity: 16,
      current_bookings: 0,
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Check if new destinations already exist
  const existingDestinationIds = existingDestinations.map((d: any) => d.id);
  const destinationsToAdd = newDestinations.filter(d => !existingDestinationIds.includes(d.id));
  
  // Check if new services already exist
  const existingServiceIds = existingServices.map((s: any) => s.id);
  const servicesToAdd = newServices.filter(s => !existingServiceIds.includes(s.id));

  // Update existing services to include all destinations
  const updatedServices = existingServices.map((service: any) => ({
    ...service,
    compatible_destinations: ['1', '2', '3', '4', '5', '6', '7', '8']
  }));

  // Add new destinations and services
  if (destinationsToAdd.length > 0 || servicesToAdd.length > 0) {
    const allDestinations = [...existingDestinations, ...destinationsToAdd];
    const allServices = [...updatedServices, ...servicesToAdd];
    
    localStorage.setItem('destinations', JSON.stringify(allDestinations));
    localStorage.setItem('services', JSON.stringify(allServices));
    
    console.log(`Added ${destinationsToAdd.length} new destinations and ${servicesToAdd.length} new services`);
  }
}

// Initialize sample data if localStorage is empty
export function initializeSampleData() {
  // First migrate existing data
  migrateDataForAvailability();
  migrateDataForGroupTourDates();
  migrateDataFieldNames();
  migrateBookingData();
  
  // Add new destinations and services to existing data
  addNewDestinationsAndServices();
  
  const tables = ['destinations', 'services', 'bookings', 'addons', 'gallery', 'testimonials', 'advertisements', 'offers', 'inquiries', 'site_settings'];
  
  tables.forEach(table => {
    const existingData = localStorage.getItem(table);
    if (!existingData) {
      let sampleData: any[] = [];
      
      switch (table) {
        case 'destinations':
          sampleData = [
            {
              id: '1',
              name: 'Goa Beach Paradise',
              description: 'Beautiful beaches and vibrant nightlife in Goa',
              price: 15000,
              price_range: {
                min: 12000,
                max: 18000
              },
              image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500',
              location: 'Goa, India',
              duration: '5 days',
              category: 'Beach',
              max_capacity: 20,
              current_bookings: 0,
              is_available: true,
              group_tour_dates: [
                {
                  id: '1',
                  date: '2024-03-15',
                  time: '09:00',
                  description: 'Morning Beach Tour',
                  available_slots: 20,
                  booked_slots: 0
                },
                {
                  id: '2',
                  date: '2024-03-20',
                  time: '14:00',
                  description: 'Afternoon Beach Tour',
                  available_slots: 20,
                  booked_slots: 0
                }
              ],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '2',
              name: 'Kerala Backwaters',
              description: 'Serene backwaters and lush greenery',
              price: 12000,
              price_range: {
                min: 10000,
                max: 15000
              },
              image_url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=500',
              location: 'Kerala, India',
              duration: '4 days',
              category: 'Nature',
              max_capacity: 15,
              current_bookings: 0,
              is_available: true,
              group_tour_dates: [
                {
                  id: '1',
                  date: '2024-03-18',
                  time: '10:00',
                  description: 'Morning Backwater Tour',
                  available_slots: 15,
                  booked_slots: 0
                },
                {
                  id: '2',
                  date: '2024-03-22',
                  time: '15:00',
                  description: 'Afternoon Backwater Tour',
                  available_slots: 15,
                  booked_slots: 0
                }
              ],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '3',
              name: 'Rajasthan Heritage',
              description: 'Royal palaces and desert adventures',
              price: 18000,
              price_range: {
                min: 15000,
                max: 22000
              },
              image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=500',
              location: 'Rajasthan, India',
              duration: '6 days',
              category: 'Heritage',
              max_capacity: 25,
              current_bookings: 0,
              is_available: true,
              group_tour_dates: [
                {
                  id: '1',
                  date: '2024-03-25',
                  time: '08:00',
                  description: 'Heritage Palace Tour',
                  available_slots: 25,
                  booked_slots: 0
                },
                {
                  id: '2',
                  date: '2024-03-28',
                  time: '16:00',
                  description: 'Desert Safari Tour',
                  available_slots: 25,
                  booked_slots: 0
                }
              ],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '4',
              name: 'Kashmir Valley Explorer',
              description: 'Discover the breathtaking beauty of Kashmir with houseboat stays and mountain views',
              price: 27999,
              price_range: {
                min: 25000,
                max: 35000
              },
              image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
              location: 'Srinagar, Kashmir',
              duration: '7 days',
              category: 'Mountain',
              max_capacity: 15,
              current_bookings: 3,
              is_available: true,
              group_tour_dates: [
                {
                  id: '1',
                  date: '2024-04-10',
                  time: '09:00',
                  description: 'Houseboat Experience',
                  available_slots: 15,
                  booked_slots: 3
                },
                {
                  id: '2',
                  date: '2024-04-15',
                  time: '10:00',
                  description: 'Gulmarg Gondola Ride',
                  available_slots: 15,
                  booked_slots: 2
                }
              ],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '5',
              name: 'Himachal Adventure',
              description: 'Adventure-packed mountain experience with trekking and adventure sports',
              price: 24999,
              price_range: {
                min: 22000,
                max: 32000
              },
              image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
              location: 'Manali, Himachal Pradesh',
              duration: '8 days',
              category: 'Adventure',
              max_capacity: 18,
              current_bookings: 4,
              is_available: true,
              group_tour_dates: [
                {
                  id: '1',
                  date: '2024-04-20',
                  time: '08:00',
                  description: 'Mountain Trekking',
                  available_slots: 18,
                  booked_slots: 4
                },
                {
                  id: '2',
                  date: '2024-04-25',
                  time: '14:00',
                  description: 'Paragliding Adventure',
                  available_slots: 18,
                  booked_slots: 2
                }
              ],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '6',
              name: 'Andaman Island Escape',
              description: 'Tropical paradise with pristine beaches and water activities',
              price: 35999,
              price_range: {
                min: 32000,
                max: 45000
              },
              image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500',
              location: 'Port Blair, Andaman',
              duration: '6 days',
              category: 'Beach',
              max_capacity: 16,
              current_bookings: 5,
              is_available: true,
              group_tour_dates: [
                {
                  id: '1',
                  date: '2024-05-05',
                  time: '09:00',
                  description: 'Scuba Diving Experience',
                  available_slots: 16,
                  booked_slots: 5
                },
                {
                  id: '2',
                  date: '2024-05-10',
                  time: '11:00',
                  description: 'Island Hopping Tour',
                  available_slots: 16,
                  booked_slots: 3
                }
              ],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '7',
              name: 'Ladakh High Altitude',
              description: 'Experience the raw beauty of Ladakh with monasteries and high-altitude lakes',
              price: 32999,
              price_range: {
                min: 28000,
                max: 40000
              },
              image_url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=500',
              location: 'Leh, Ladakh',
              duration: '9 days',
              category: 'Mountain',
              max_capacity: 12,
              current_bookings: 2,
              is_available: true,
              group_tour_dates: [
                {
                  id: '1',
                  date: '2024-06-01',
                  time: '07:00',
                  description: 'Monastery Tour',
                  available_slots: 12,
                  booked_slots: 2
                },
                {
                  id: '2',
                  date: '2024-06-05',
                  time: '10:00',
                  description: 'Pangong Lake Visit',
                  available_slots: 12,
                  booked_slots: 1
                }
              ],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '8',
              name: 'Tamil Nadu Temples',
              description: 'Explore the rich cultural heritage and magnificent temples of Tamil Nadu',
              price: 19999,
              price_range: {
                min: 16000,
                max: 25000
              },
              image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=500',
              location: 'Madurai, Tamil Nadu',
              duration: '5 days',
              category: 'Heritage',
              max_capacity: 20,
              current_bookings: 6,
              is_available: true,
              group_tour_dates: [
                {
                  id: '1',
                  date: '2024-05-15',
                  time: '08:00',
                  description: 'Temple Heritage Tour',
                  available_slots: 20,
                  booked_slots: 6
                },
                {
                  id: '2',
                  date: '2024-05-18',
                  time: '16:00',
                  description: 'Cultural Show Experience',
                  available_slots: 20,
                  booked_slots: 4
                }
              ],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          break;
          
        case 'services':
          sampleData = [
            {
              id: '1',
              name: 'Flight Booking',
              description: 'Domestic and international flights',
              price: 5000,
              price_range: {
                min: 3000,
                max: 8000
              },
              category: 'Transportation',
              compatible_destinations: ['1', '2', '3', '4', '5', '6', '7', '8'], // All destinations
              max_capacity: 50,
              current_bookings: 0,
              is_available: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '2',
              name: 'Hotel Booking',
              description: 'Luxury and budget accommodations',
              price: 3000,
              price_range: {
                min: 2000,
                max: 5000
              },
              category: 'Accommodation',
              compatible_destinations: ['1', '2', '3', '4', '5', '6', '7', '8'], // All destinations
              max_capacity: 30,
              current_bookings: 0,
              is_available: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '3',
              name: 'Car Rental',
              description: 'Self-drive and chauffeur-driven cars',
              price: 2000,
              price_range: {
                min: 1500,
                max: 3000
              },
              category: 'Transportation',
              compatible_destinations: ['3'], // Only Rajasthan Heritage
              max_capacity: 10,
              current_bookings: 0,
              is_available: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '4',
              name: 'Group Tour',
              description: 'Organized group tours with guide and transportation included',
              price: 8000,
              price_range: {
                min: 6000,
                max: 12000
              },
              category: 'Group Travel',
              compatible_destinations: ['1', '2', '3', '4', '5', '6', '7', '8'], // All destinations
              max_capacity: 25,
              current_bookings: 0,
              is_available: true,
              is_group_tour: true,
              predefined_dates: [
                {
                  id: '1',
                  date: '2024-02-15',
                  time: '09:00',
                  description: 'Morning Group Tour',
                  available_slots: 25,
                  booked_slots: 0
                },
                {
                  id: '2',
                  date: '2024-02-20',
                  time: '14:00',
                  description: 'Afternoon Group Tour',
                  available_slots: 25,
                  booked_slots: 0
                },
                {
                  id: '3',
                  date: '2024-02-25',
                  time: '10:00',
                  description: 'Weekend Group Tour',
                  available_slots: 25,
                  booked_slots: 0
                }
              ],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '5',
              name: 'Houseboat Stay',
              description: 'Traditional houseboat accommodation in Kashmir and Kerala',
              price: 4000,
              price_range: {
                min: 3000,
                max: 6000
              },
              category: 'Accommodation',
              compatible_destinations: ['2', '4'], // Kerala Backwaters and Kashmir
              max_capacity: 8,
              current_bookings: 0,
              is_available: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '6',
              name: 'Adventure Sports',
              description: 'Paragliding, trekking, and adventure activities',
              price: 3500,
              price_range: {
                min: 2500,
                max: 5000
              },
              category: 'Adventure',
              compatible_destinations: ['5', '7'], // Himachal and Ladakh
              max_capacity: 15,
              current_bookings: 0,
              is_available: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '7',
              name: 'Water Sports Package',
              description: 'Scuba diving, snorkeling, and water activities',
              price: 4500,
              price_range: {
                min: 3500,
                max: 6500
              },
              category: 'Adventure',
              compatible_destinations: ['1', '6'], // Goa and Andaman
              max_capacity: 12,
              current_bookings: 0,
              is_available: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '8',
              name: 'Cultural Heritage Tour',
              description: 'Guided tours of temples, palaces, and cultural sites',
              price: 2500,
              price_range: {
                min: 2000,
                max: 3500
              },
              category: 'Cultural',
              compatible_destinations: ['3', '8'], // Rajasthan and Tamil Nadu
              max_capacity: 20,
              current_bookings: 0,
              is_available: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '9',
              name: 'Mountain Resort Stay',
              description: 'Luxury mountain resort accommodation with scenic views',
              price: 5000,
              price_range: {
                min: 4000,
                max: 7000
              },
              category: 'Accommodation',
              compatible_destinations: ['4', '5', '7'], // Kashmir, Himachal, Ladakh
              max_capacity: 25,
              current_bookings: 0,
              is_available: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '10',
              name: 'Island Hopping Tour',
              description: 'Boat tours to multiple islands with lunch included',
              price: 3000,
              price_range: {
                min: 2500,
                max: 4000
              },
              category: 'Tour',
              compatible_destinations: ['6'], // Andaman only
              max_capacity: 16,
              current_bookings: 0,
              is_available: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          break;
          
        case 'addons':
          sampleData = [
            {
              id: '1',
              name: 'Photography Package',
              description: 'Professional photography during your trip',
              price: 2000,
              price_range: {
                min: 1500,
                max: 3000
              },
              category: 'Services',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '2',
              name: 'Airport Transfer',
              description: 'Pickup and drop from airport',
              price: 1500,
              price_range: {
                min: 1000,
                max: 2500
              },
              category: 'Transportation',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '3',
              name: 'Car Rental Service',
              description: 'Self-drive car rental for local sightseeing',
              price: 2500,
              price_range: {
                min: 2000,
                max: 4000
              },
              category: 'Transportation',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '4',
              name: 'Vehicle Rental',
              description: 'Luxury vehicle rental with driver',
              price: 4000,
              price_range: {
                min: 3000,
                max: 6000
              },
              category: 'Transportation',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          break;
          
        case 'gallery':
          sampleData = [
            {
              id: '1',
              title: 'Goa Beach Paradise',
              image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
              description: 'Golden sands and crystal clear waters of Goa beaches',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '2',
              title: 'Kerala Backwaters',
              image_url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
              description: 'Serene backwaters and lush greenery of Kerala',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '3',
              title: 'Rajasthan Heritage',
              image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
              description: 'Magnificent palaces and royal architecture of Rajasthan',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '4',
              title: 'Taj Mahal Sunrise',
              image_url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
              description: 'The iconic Taj Mahal at sunrise - a symbol of eternal love',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '5',
              title: 'Himalayan Peaks',
              image_url: 'https://images.unsplash.com/photo-1464822759844-d150baecf5b1?w=800',
              description: 'Majestic Himalayan mountain ranges covered in snow',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '6',
              title: 'Kerala Houseboat',
              image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
              description: 'Traditional houseboat cruise through Kerala backwaters',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '7',
              title: 'Goa Sunset',
              image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
              description: 'Breathtaking sunset over the Arabian Sea in Goa',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '8',
              title: 'Rajasthan Desert',
              image_url: 'https://images.unsplash.com/photo-1515408320274-ad2e7223e0ba?w=800',
              description: 'Golden sand dunes of the Thar Desert in Rajasthan',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '9',
              title: 'Kerala Tea Plantations',
              image_url: 'https://images.unsplash.com/photo-1605538883669-825200433431?w=800',
              description: 'Rolling hills covered with lush green tea plantations',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '10',
              title: 'Goa Portuguese Architecture',
              image_url: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800',
              description: 'Colonial Portuguese architecture in Old Goa',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '11',
              title: 'Rajasthan Fort',
              image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
              description: 'Ancient fort overlooking the desert landscape',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '12',
              title: 'Kerala Elephant',
              image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
              description: 'Gentle elephants in their natural habitat',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          break;
          
        case 'testimonials':
          sampleData = [
            {
              id: '1',
              author: 'John Doe',
              text: 'Amazing trip to Goa! The service was excellent.',
              rating: 5,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '2',
              author: 'Jane Smith',
              text: 'Kerala backwaters were absolutely beautiful.',
              rating: 5,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          break;
          
        case 'advertisements':
          sampleData = [
            {
              id: '1',
              title: 'Summer Special',
              description: 'Get 20% off on all beach destinations',
              image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          break;
          
        case 'offers':
          sampleData = [
            {
              id: '1',
              title: 'Early Bird Offer',
              description: 'Book 3 months in advance and save 15%',
              price: 0,
              discount_percentage: 15,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          break;
          
        case 'inquiries':
          sampleData = [
            {
              id: '1',
              name: 'John Doe',
              email: 'john.doe@example.com',
              phone: '+91 9876543210',
              message: 'I am interested in booking a trip to Goa. Can you provide more details about the packages available?',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '2',
              name: 'Jane Smith',
              email: 'jane.smith@example.com',
              phone: '+91 9876543211',
              message: 'What are the best destinations for a family vacation with kids? Looking for something safe and fun.',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          break;
          
        case 'site_settings':
          sampleData = [
            {
              id: '1',
              company_name: 'TripSera',
              contact_number: '+91 8296724981',
              contact_email: 'Tripsera.info@gmail.com',
              company_address: 'Kesarhatti, Karnataka, India',
              website_url: 'https://tripsera.com',
              social_media: {
                facebook: 'https://facebook.com/tripsera',
                instagram: 'https://instagram.com/tripsera',
                twitter: 'https://twitter.com/tripsera'
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          break;
          
        default:
          sampleData = [];
      }
      
      localStorage.setItem(table, JSON.stringify(sampleData));
      console.log(`✅ Initialized sample data for ${table}:`, sampleData.length, 'items');
    }
  });
  
  console.log('🎉 Sample data initialization complete!');
}

// Clear all sample bookings for a user
export function clearUserSampleBookings(userEmail: string) {
  try {
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const filteredBookings = existingBookings.filter((booking: any) => 
      !(booking.email && booking.email.toLowerCase() === userEmail.toLowerCase() && booking.customer_name === 'Test User')
    );
    
    localStorage.setItem('bookings', JSON.stringify(filteredBookings));
    console.log('✅ Cleared sample bookings for user:', userEmail);
    return { success: true, message: 'Sample bookings cleared successfully' };
  } catch (error) {
    console.error('Error clearing sample bookings:', error);
    return { success: false, message: 'Error clearing sample bookings' };
  }
}

export function createSampleBookingsForUser(userEmail: string) {
  try {
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    // Check if user already has bookings
    const userBookings = existingBookings.filter((booking: any) => 
      booking.email && booking.email.toLowerCase() === userEmail.toLowerCase()
    );
    
    if (userBookings.length > 0) {
      console.log('User already has bookings');
      return false;
    }
    
    // Create sample bookings for the user
    const sampleBookings = [
      {
        id: `booking_${Date.now()}_1`,
        customer_name: 'Test User',
        email: userEmail,
        mobile: '9876543210',
        destination_id: '1',
        service_id: '1',
        seats_selected: 2,
        booking_date: '2024-03-15',
        total_amount: 30000,
        amount: 30000,
        base_amount: 28000,
        addons_total: 2000,
        payment_status: 'paid',
        booking_status: 'confirmed',
        addons: [
          {
            id: '1',
            name: 'Airport Transfer',
            price: 2000,
            quantity: 1
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `booking_${Date.now()}_2`,
        customer_name: 'Test User',
        email: userEmail,
        mobile: '9876543210',
        destination_id: '2',
        service_id: '2',
        seats_selected: 1,
        booking_date: '2024-03-20',
        total_amount: 12000,
        amount: 12000,
        base_amount: 12000,
        addons_total: 0,
        payment_status: 'pending',
        booking_status: 'confirmed',
        addons: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    const updatedBookings = [...existingBookings, ...sampleBookings];
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    
    console.log('Created sample bookings for user:', userEmail);
    return true;
  } catch (error) {
    console.error('Error creating sample bookings:', error);
    return false;
  }
}