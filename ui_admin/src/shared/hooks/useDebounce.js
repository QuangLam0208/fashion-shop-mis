// src/shared/hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * useDebounce — trì hoãn cập nhật value sau `delay` ms
 *
 * Sử dụng:
 *   const debouncedSearch = useDebounce(searchText, 400);
 *   useEffect(() => { fetchData(debouncedSearch); }, [debouncedSearch]);
 */
const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;