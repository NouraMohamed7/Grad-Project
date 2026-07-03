const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const asList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const normalizeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getStatus = (value) => String(value ?? '').toLowerCase().trim();

const isSuccessfulOrder = (status) => ['paid', 'confirmed', 'delivered', 'complete', 'completed', 'success', 'successful'].includes(status);

const getOrderRevenue = (order) => {
  if (!order) return 0;
  const status = getStatus(order.status);
  if (!isSuccessfulOrder(status)) return 0;
  return toNumber(order.total ?? order.amount ?? order.price ?? order.net_amount ?? 0);
};

const getOrderDiscount = (order) => {
  if (!order) return 0;
  const explicit = toNumber(order.discount_amount ?? order.discount ?? order.discount_value ?? 0);
  if (explicit > 0) return explicit;
  const subtotal = toNumber(order.subtotal ?? order.sub_total ?? order.original_total ?? 0);
  const total = toNumber(order.total ?? order.amount ?? order.net_amount ?? 0);
  return Math.max(0, subtotal - total);
};

const getOrderDate = (order) => normalizeDate(order?.created_at ?? order?.createdAt ?? order?.date ?? order?.updated_at ?? order?.updatedAt);

const getCategoryName = (item, fallback = 'Uncategorized') => {
  if (!item) return fallback;
  return (
    item.category?.name ||
    item.category_name ||
    item.category ||
    item.product?.category?.name ||
    item.product?.category_name ||
    item.product?.category ||
    fallback
  );
};

export const getDashboardMetrics = ({ orders = [], products = [], offers = [] } = {}) => {
  const orderList = asList(orders);
  const productList = asList(products);
  const offerList = asList(offers);

  let totalRevenue = 0;
  let pendingOrders = 0;
  let completedOrders = 0;
  let totalDiscount = 0;

  orderList.forEach((order) => {
    const status = getStatus(order.status);
    const revenue = getOrderRevenue(order);
    const discount = getOrderDiscount(order);

    totalRevenue += revenue;
    totalDiscount += discount;

    if (status === 'pending') pendingOrders += 1;
    if (isSuccessfulOrder(status)) completedOrders += 1;
  });

  const totalProducts = productList.length;
  const lowStock = productList.filter((product) => toNumber(product.stock ?? product.available_units ?? 0) <= 5).length;
  const customRequests = offerList.length;
  const completedRequests = offerList.filter((offer) => getStatus(offer.status) === 'accepted').length;

  return {
    totalRevenue,
    pendingOrders,
    completedOrders,
    totalOrders: orderList.length,
    averageOrderValue: completedOrders > 0 ? totalRevenue / completedOrders : 0,
    totalDiscount,
    totalProducts,
    lowStock,
    customRequests,
    completedRequests,
  };
};

export const buildSalesSeries = (orders, range = '7') => {
  const orderList = asList(orders);
  const successfulOrders = orderList.filter((order) => isSuccessfulOrder(getStatus(order.status)));

  if (!successfulOrders.length) return [];

  const now = new Date();
  const buckets = [];
  const totalPeriods = range === '7' ? 7 : 4;

  for (let index = totalPeriods - 1; index >= 0; index -= 1) {
    const current = new Date(now);
    if (range === '7') {
      current.setDate(now.getDate() - index);
      buckets.push({
        key: current.toISOString().slice(0, 10),
        label: current.toLocaleDateString('en', { weekday: 'short' }),
        value: 0,
      });
    } else {
      current.setDate(now.getDate() - (index * 7));
      buckets.push({
        key: `W${index + 1}`,
        label: `W${index + 1}`,
        value: 0,
      });
    }
  }

  successfulOrders.forEach((order) => {
    const date = getOrderDate(order);
    if (!date) return;

    if (range === '7') {
      const key = date.toISOString().slice(0, 10);
      const bucket = buckets.find((item) => item.key === key);
      if (bucket) bucket.value += getOrderRevenue(order);
    } else {
      const bucketIndex = Math.min(totalPeriods - 1, Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 7)));
      const bucket = buckets[bucketIndex];
      if (bucket) bucket.value += getOrderRevenue(order);
    }
  });

  return buckets;
};

export const buildMonthlyRevenueSeries = (orders) => {
  const orderList = asList(orders);
  const buckets = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    return {
      month: date.toLocaleDateString('en', { month: 'short' }),
      revenue: 0,
      expenses: 0,
    };
  });

  orderList.forEach((order) => {
    const date = getOrderDate(order);
    if (!date) return;
    const monthIndex = buckets.findIndex((item) => item.month === date.toLocaleDateString('en', { month: 'short' }));
    if (monthIndex < 0) return;

    const revenue = getOrderRevenue(order);
    const discount = getOrderDiscount(order);
    buckets[monthIndex].revenue += revenue;
    buckets[monthIndex].expenses += discount;
  });

  return buckets;
};

export const buildWeeklyOrderSeries = (orders) => {
  const orderList = asList(orders);
  const buckets = Array.from({ length: 6 }, (_, index) => ({
    week: `W${index + 1}`,
    orders: 0,
  }));

  orderList.forEach((order) => {
    const date = getOrderDate(order);
    if (!date) return;
    const weekIndex = Math.min(buckets.length - 1, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 7)));
    if (weekIndex >= 0) buckets[weekIndex].orders += 1;
  });

  return buckets.reverse();
};

export const buildCategorySeries = ({ orders = [], products = [] } = {}) => {
  const buckets = new Map();
  const addBucket = (name, revenue, units = 1) => {
    const existing = buckets.get(name) || { name, revenue: 0, units: 0, color: '#3b82f6' };
    existing.revenue += revenue;
    existing.units += units;
    buckets.set(name, existing);
  };

  const orderList = asList(orders);
  orderList.forEach((order) => {
    const items = Array.isArray(order.items) ? order.items : Array.isArray(order.products) ? order.products : [];
    if (items.length) {
      items.forEach((item) => {
        const category = getCategoryName(item, 'Uncategorized');
        const quantity = toNumber(item.quantity ?? item.qty ?? 1);
        const amount = toNumber(item.price ?? item.amount ?? item.total ?? order.total ?? 0);
        addBucket(category, amount * quantity, quantity);
      });
      return;
    }

    const category = getCategoryName(order, 'Uncategorized');
    addBucket(category, getOrderRevenue(order), 1);
  });

  const productList = asList(products);
  productList.forEach((product) => {
    const category = getCategoryName(product, 'Uncategorized');
    const stock = toNumber(product.stock ?? product.available_units ?? 1);
    const price = toNumber(product.price ?? 0);
    addBucket(category, price * stock, stock);
  });

  const palette = ['#2563eb', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#14b8a6'];
  return Array.from(buckets.values())
    .map((item, index) => ({ ...item, color: palette[index % palette.length] }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
};
