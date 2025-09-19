// Performance testing utilities
import { performanceMonitor, optimizeImages, memoryOptimizer } from './performance';

export const runPerformanceTests = async () => {
  console.log('🚀 Running Performance Tests...\n');

  // Test 1: Component render performance
  console.log('1. Testing component render performance...');
  const renderTime = performanceMonitor.measureComponentRender('TestComponent', () => {
    // Simulate component render work
    const data = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: Math.random() }));
    return data.filter(item => item.value > 0.5);
  });
  console.log(`✅ Component render time: ${renderTime.toFixed(2)}ms`);

  // Test 2: API call performance
  console.log('\n2. Testing API call performance...');
  try {
    const apiTime = await performanceMonitor.measureApiCall(
      async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        return { data: 'test' };
      },
      'test-endpoint'
    );
    console.log(`✅ API call completed successfully`);
  } catch (error) {
    console.log('❌ API call failed:', error);
  }

  // Test 3: Image loading performance
  console.log('\n3. Testing image loading performance...');
  const imageLoadTime = await performanceMonitor.measureImageLoad(
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+'
  );
  console.log(`✅ Image load time: ${imageLoadTime.toFixed(2)}ms`);

  // Test 4: Memory optimization utilities
  console.log('\n4. Testing memory optimization utilities...');
  
  // Test debounce
  let debounceCount = 0;
  const debouncedFn = memoryOptimizer.debounce(() => {
    debounceCount++;
  }, 100);
  
  // Call debounced function multiple times
  for (let i = 0; i < 5; i++) {
    debouncedFn();
  }
  
  // Wait for debounce to complete
  await new Promise(resolve => setTimeout(resolve, 150));
  console.log(`✅ Debounce test: ${debounceCount === 1 ? 'PASSED' : 'FAILED'} (count: ${debounceCount})`);

  // Test throttle
  let throttleCount = 0;
  const throttledFn = memoryOptimizer.throttle(() => {
    throttleCount++;
  }, 100);
  
  // Call throttled function multiple times
  for (let i = 0; i < 5; i++) {
    throttledFn();
  }
  
  // Wait for throttle to complete
  await new Promise(resolve => setTimeout(resolve, 150));
  console.log(`✅ Throttle test: ${throttleCount <= 2 ? 'PASSED' : 'FAILED'} (count: ${throttleCount})`);

  // Test 5: Image optimization utilities
  console.log('\n5. Testing image optimization utilities...');
  const responsiveUrl = optimizeImages.getResponsiveImageUrl('https://example.com/image.jpg', 800, 90);
  console.log(`✅ Responsive image URL: ${responsiveUrl}`);

  // Test 6: Performance metrics summary
  console.log('\n6. Performance metrics summary...');
  const metrics = performanceMonitor.getMetrics();
  console.log('📊 Performance Metrics:', metrics);

  console.log('\n🎉 All performance tests completed!');
  
  return {
    renderTime,
    imageLoadTime,
    debounceCount,
    throttleCount,
    metrics
  };
};

// Auto-run performance tests in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Run tests after a delay to allow page to load
  setTimeout(() => {
    runPerformanceTests();
  }, 2000);
}

export default runPerformanceTests;
