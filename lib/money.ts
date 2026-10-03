export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
export const FREE_DELIVERY_FROM = 999;
export const DELIVERY_FEE = 79;
export const deliveryFor = (itemsTotal: number) => (itemsTotal === 0 || itemsTotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE);
