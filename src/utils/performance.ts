// Performance monitoring and optimization utilities

interface PerformanceMetrics {
  pageLoadTime: number;
  componentRenderTime: number;
  apiResponseTime: number;
  imageLoadTime: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    pageLoadTime: 0,
    componentRenderTime: 0,
    apiResponseTime: 0,
    imageLoadTime: 0,
  };

  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    // Monitor page load performance
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
        console.log(`📊 Page load time: ${this.metrics.pageLoadTime.toFixed(2)}ms`);
      });

      // Monitor long tasks
      if ('PerformanceObserver' in window) {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
            }
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      }
    }
  }

  // Measure component render time
  measureComponentRender(componentName: string, renderFn: () => void) {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    const renderTime = end - start;
    
    if (renderTime > 16) { // More than one frame (60fps)
      console.warn(`⚠️ Slow component render: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
    
    return renderTime;
  }

  // Measure API response time
  async measureApiCall<T>(apiCall: () => Promise<T>, endpoint: string): Promise<T> {
    const start = performance.now();
    try {
      const result = await apiCall();
      const end = performance.now();
      const responseTime = end - start;
      
      if (responseTime > 1000) {
        console.warn(`⚠️ Slow API call: ${endpoint} took ${responseTime.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const end = performance.now();
      const responseTime = end - start;
      console.error(`❌ API call failed: ${endpoint} after ${responseTime.toFixed(2)}ms`, error);
      throw error;
    }
  }

  // Measure image load time
  measureImageLoad(src: string): Promise<number> {
    return new Promise((resolve) => {
      const start = performance.now();
      const img = new Image();
      
      img.onload = () => {
        const end = performance.now();
        const loadTime = end - start;
        resolve(loadTime);
      };
      
      img.onerror = () => {
        const end = performance.now();
        const loadTime = end - start;
        console.warn(`⚠️ Image failed to load: ${src} after ${loadTime.toFixed(2)}ms`);
        resolve(loadTime);
      };
      
      img.src = src;
    });
  }

  // Get performance metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Create global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Performance optimization utilities
export const optimizeImages = {
  // Generate responsive image URLs
  getResponsiveImageUrl: (baseUrl: string, width: number, quality: number = 80): string => {
    // This would integrate with your image optimization service
    return `${baseUrl}?w=${width}&q=${quality}&f=webp`;
  },

  // Preload critical images
  preloadImage: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  },

  // Lazy load images with intersection observer
  createLazyLoader: (callback: () => void, options: IntersectionObserverInit = {}) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          observer.disconnect();
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options,
    });

    return observer;
  },
};

// Memory optimization utilities
export const memoryOptimizer = {
  // Debounce function calls
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function calls
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Clean up event listeners
  cleanupEventListeners: (element: HTMLElement, events: string[]) => {
    events.forEach(event => {
      element.removeEventListener(event, () => {});
    });
  },
};

// Bundle size optimization
export const bundleOptimizer = {
  // Dynamic imports for code splitting
  dynamicImport: async <T>(importFn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    try {
      const module = await importFn();
      const end = performance.now();
      console.log(`📦 Dynamic import completed in ${(end - start).toFixed(2)}ms`);
      return module;
    } catch (error) {
      console.error('❌ Dynamic import failed:', error);
      throw error;
    }
  },

  // Preload critical chunks
  preloadChunk: (chunkName: string): void => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = `/src/pages/${chunkName}.tsx`;
      document.head.appendChild(link);
    }
  },
};

// Export performance utilities
export default {
  performanceMonitor,
  optimizeImages,
  memoryOptimizer,
  bundleOptimizer,
};
