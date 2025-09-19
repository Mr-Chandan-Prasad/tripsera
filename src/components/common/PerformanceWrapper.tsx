import React, { memo, useMemo } from 'react';
import { performanceMonitor } from '../../utils/performance';

// Higher-order component for performance monitoring
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  const WrappedComponent = memo((props: P) => {
    const renderTime = performanceMonitor.measureComponentRender(
      componentName,
      () => {}
    );

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(`⚠️ Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }

    return <Component {...props} />;
  });

  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  return WrappedComponent;
};

// Memoized component wrapper with performance tracking
interface MemoizedComponentProps {
  children: React.ReactNode;
  dependencies?: any[];
  componentName?: string;
}

export const MemoizedComponent: React.FC<MemoizedComponentProps> = memo(
  ({ children, dependencies = [], componentName = 'Unknown' }) => {
    const memoizedChildren = useMemo(() => {
      const start = performance.now();
      const result = children;
      const end = performance.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 ${componentName} memoization: ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    }, dependencies);

    return <>{memoizedChildren}</>;
  }
);

MemoizedComponent.displayName = 'MemoizedComponent';

// Virtual scrolling component for large lists
interface VirtualScrollProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  overscan?: number;
}

export const VirtualScroll: React.FC<VirtualScrollProps> = memo(({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleRange.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

VirtualScroll.displayName = 'VirtualScroll';

// Lazy loading wrapper for components
export const LazyComponent: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
}> = memo(({ children, fallback = <div>Loading...</div>, threshold = 0.1 }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  );
});

LazyComponent.displayName = 'LazyComponent';

export default {
  withPerformanceMonitoring,
  MemoizedComponent,
  VirtualScroll,
  LazyComponent,
};
