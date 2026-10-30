export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const options = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit', hour12: true }),
  };

  return new Intl.DateTimeFormat('en-IN', options).format(date);
};

export const generateSKU = (category = 'SAR') => {
  const prefix = category.substring(0, 3).toUpperCase();
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${randomNum}`;
};

export const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(10 + Math.random() * 90);
  return `ORD-${timestamp}-${random}`;
};

export const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}-${random}`;
};
