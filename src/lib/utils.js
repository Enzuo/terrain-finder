/**
 * 
 * @param {(...args: any[]) => void} fn 
 * @param {number} delay ms
 * @returns {(...args: any[]) => void}
 */
export function debounce(fn, delay = 300) {
  /** @type {NodeJS.Timeout} */
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}