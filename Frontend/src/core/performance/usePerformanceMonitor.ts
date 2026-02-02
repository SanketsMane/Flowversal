import { useEffect, useRef } from 'react';
import { measureRenderTime } from './performance-monitor';

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor(componentName: string): void {
  const startTime = useRef(performance.now());

  useEffect(() => {
    const duration = performance.now() - startTime.current;
    measureRenderTime(componentName, startTime.current);
  });
}

/**
 * Hook to measure component mount time
 */
export function useMountTime(componentName: string): void {
  const mountStartTime = useRef(performance.now());

  useEffect(() => {
    const mountDuration = performance.now() - mountStartTime.current;
    measureRenderTime(`${componentName}:mount`, mountStartTime.current);
  }, [componentName]);
}

