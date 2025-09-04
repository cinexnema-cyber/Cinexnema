// Utility to suppress specific React warnings from third-party libraries
// This specifically targets the recharts defaultProps deprecation warnings

let originalConsoleWarn: typeof console.warn;
let originalConsoleError: typeof console.error;

const shouldSuppressDefaultProps = (...args: any[]) => {
  // Suppress all defaultProps deprecation warnings regardless of source library
  // React formats warnings with a template string and %s placeholders, so merge args
  const toStr = (v: any) => (typeof v === "string" ? v : v?.toString?.() || "");
  const full = args.map(toStr).join(" ");
  if (!full) return false;
  return full.includes(
    "Support for defaultProps will be removed from function components",
  );
};

export const suppressRechartsWarnings = () => {
  if (!originalConsoleWarn) originalConsoleWarn = console.warn;
  if (!originalConsoleError) originalConsoleError = console.error;

  console.warn = (...args: any[]) => {
    if (shouldSuppressDefaultProps(...args)) return;
    originalConsoleWarn.apply(console, args);
  };

  console.error = (...args: any[]) => {
    if (shouldSuppressDefaultProps(...args)) return;
    originalConsoleError.apply(console, args);
  };
};

export const restoreConsoleWarn = () => {
  if (originalConsoleWarn) console.warn = originalConsoleWarn;
  if (originalConsoleError) console.error = originalConsoleError;
};

// Auto-suppress on import
suppressRechartsWarnings();
