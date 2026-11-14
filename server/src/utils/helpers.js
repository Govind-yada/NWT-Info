export const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `NWT-ORD-${dateStr}-${randomSuffix}`;
};

export const generateBookingReference = () => {
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const dateStr = new Date().toISOString().slice(2, 7).replace('-', '');
  return `NWT-BK-${dateStr}-${randomSuffix}`;
};

export const generatePaymentReference = () => {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `NWT-PAY-${randomSuffix}`;
};

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};
