// Utility function for rial formatting
const formatRial = (value: string) => {
  const numericValue = value.replace(/[^\d]/g, "");
  if (!numericValue) return "";

  // Convert to number and format with thousand separators
  const number = Number(numericValue);
  return number.toLocaleString("en-US") + " ریال";
};

const parseRial = (value: string) => {
  return value.replace(/[^\d]/g, "");
};

export { formatRial, parseRial };
