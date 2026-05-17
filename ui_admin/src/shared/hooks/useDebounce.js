import { useState, useEffect } from 'react';

/**
 * Debounce value — trì hoãn cập nhật giá trị để tránh gọi API liên tục
 *
 * Sử dụng:
 *   const debouncedSearch = useDebounce(searchValue, 400);
 *   useEffect(() => { fetchData(debouncedSearch) }, [debouncedSearch]);
 *
 * @param {any}    value - giá trị cần debounce (thường là input search)
 * @param {number} delay - thời gian trễ (ms), mặc định 400ms
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
