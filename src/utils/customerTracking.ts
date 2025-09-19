// Customer tracking utilities for welcome messages and personalization

interface CustomerData {
  id: string;
  name: string;
  email: string;
  firstVisit: string;
  lastVisit: string;
  visitCount: number;
  isNewCustomer: boolean;
  hasBooked: boolean;
  lastBookingDate?: string;
}

const CUSTOMER_STORAGE_KEY = 'tripsera_customer_data';
const VISIT_COUNT_KEY = 'tripsera_visit_count';
const FIRST_VISIT_KEY = 'tripsera_first_visit';

/**
 * Get or create customer data
 */
export const getCustomerData = (): CustomerData => {
  try {
    const stored = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading customer data:', error);
  }

  // Create new customer data
  const now = new Date().toISOString();
  const visitCount = getVisitCount();
  
  const newCustomerData: CustomerData = {
    id: generateCustomerId(),
    name: '',
    email: '',
    firstVisit: now,
    lastVisit: now,
    visitCount: visitCount,
    isNewCustomer: true,
    hasBooked: false
  };

  saveCustomerData(newCustomerData);
  return newCustomerData;
};

/**
 * Update customer data
 */
export const updateCustomerData = (updates: Partial<CustomerData>): CustomerData => {
  const currentData = getCustomerData();
  const updatedData: CustomerData = {
    ...currentData,
    ...updates,
    lastVisit: new Date().toISOString(),
    visitCount: getVisitCount()
  };

  // Mark as returning customer after first visit
  if (updatedData.visitCount > 1) {
    updatedData.isNewCustomer = false;
  }

  saveCustomerData(updatedData);
  return updatedData;
};

/**
 * Mark customer as having made a booking
 */
export const markCustomerAsBooked = (): CustomerData => {
  return updateCustomerData({
    hasBooked: true,
    lastBookingDate: new Date().toISOString()
  });
};

/**
 * Check if customer should see welcome message
 */
export const shouldShowWelcomeMessage = (): boolean => {
  const customerData = getCustomerData();
  
  // Show welcome message for new customers or returning customers who haven't seen it recently
  if (customerData.isNewCustomer) {
    return true;
  }

  // For returning customers, show welcome message if they haven't seen it in the last 7 days
  const lastWelcomeShown = localStorage.getItem('tripsera_last_welcome_shown');
  if (!lastWelcomeShown) {
    return true;
  }

  const lastShownDate = new Date(lastWelcomeShown);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  return lastShownDate < sevenDaysAgo;
};

/**
 * Mark welcome message as shown
 */
export const markWelcomeMessageShown = (): void => {
  localStorage.setItem('tripsera_last_welcome_shown', new Date().toISOString());
};

/**
 * Get visit count
 */
const getVisitCount = (): number => {
  try {
    const count = localStorage.getItem(VISIT_COUNT_KEY);
    if (count) {
      const newCount = parseInt(count) + 1;
      localStorage.setItem(VISIT_COUNT_KEY, newCount.toString());
      return newCount;
    } else {
      localStorage.setItem(VISIT_COUNT_KEY, '1');
      localStorage.setItem(FIRST_VISIT_KEY, new Date().toISOString());
      return 1;
    }
  } catch (error) {
    console.error('Error updating visit count:', error);
    return 1;
  }
};

/**
 * Save customer data to localStorage
 */
const saveCustomerData = (data: CustomerData): void => {
  try {
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving customer data:', error);
  }
};

/**
 * Generate unique customer ID
 */
const generateCustomerId = (): string => {
  return 'customer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Get customer analytics data
 */
export const getCustomerAnalytics = () => {
  const customerData = getCustomerData();
  const firstVisit = localStorage.getItem(FIRST_VISIT_KEY);
  
  return {
    ...customerData,
    daysSinceFirstVisit: firstVisit 
      ? Math.floor((Date.now() - new Date(firstVisit).getTime()) / (1000 * 60 * 60 * 24))
      : 0,
    isFirstTimeVisitor: customerData.visitCount === 1,
    isReturningVisitor: customerData.visitCount > 1,
    hasMadeBooking: customerData.hasBooked
  };
};

/**
 * Reset customer data (for testing purposes)
 */
export const resetCustomerData = (): void => {
  localStorage.removeItem(CUSTOMER_STORAGE_KEY);
  localStorage.removeItem(VISIT_COUNT_KEY);
  localStorage.removeItem(FIRST_VISIT_KEY);
  localStorage.removeItem('tripsera_last_welcome_shown');
};

/**
 * Get personalized greeting
 */
export const getPersonalizedGreeting = (): string => {
  const analytics = getCustomerAnalytics();
  
  if (analytics.isFirstTimeVisitor) {
    return "Welcome to Tripsera! We're excited to help you plan your first adventure.";
  } else if (analytics.hasMadeBooking) {
    return "Welcome back! Ready for your next amazing journey?";
  } else {
    return "Welcome back! Don't miss out on our amazing travel deals.";
  }
};
