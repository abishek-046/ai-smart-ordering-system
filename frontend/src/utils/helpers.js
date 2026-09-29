export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatTime = (dateStr) =>
  new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatDateTime = (dateStr) =>
  `${formatDate(dateStr)}, ${formatTime(dateStr)}`;

export const getStatusColor = (status) => {
  const map = {
    PENDING:   'status-pending',
    ACCEPTED:  'status-accepted',
    PREPARING: 'status-preparing',
    READY:     'status-ready',
    COLLECTED: 'status-collected',
    CANCELLED: 'status-cancelled',
  };
  return map[status] || 'badge bg-charcoal-100 text-charcoal-600';
};

export const getStatusLabel = (status) => {
  const map = {
    PENDING:   '⏳ Pending',
    ACCEPTED:  '✅ Accepted',
    PREPARING: '👨‍🍳 Preparing',
    READY:     '🔔 Ready for Pickup',
    COLLECTED: '✅ Collected',
    CANCELLED: '❌ Cancelled',
  };
  return map[status] || status;
};

export const getCategoryLabel = (cat) => {
  const map = {
    BREAKFAST: '🌅 Breakfast',
    LUNCH:     '🍱 Lunch',
    SNACKS:    '🍟 Snacks',
    BEVERAGES: '☕ Beverages',
    DESSERTS:  '🍮 Desserts',
    SPECIAL:   "⭐ Today's Special",
  };
  return map[cat] || cat;
};

export const getCategoryEmoji = (cat) => {
  const map = {
    BREAKFAST: '🌅',
    LUNCH:     '🍛',
    SNACKS:    '🍟',
    BEVERAGES: '☕',
    DESSERTS:  '🍮',
    SPECIAL:   '⭐',
  };
  return map[cat] || '🍽️';
};

export const getApiError = (err) =>
  err.response?.data?.message ||
  err.response?.data?.errors?.[0]?.msg ||
  err.message ||
  'Something went wrong';
