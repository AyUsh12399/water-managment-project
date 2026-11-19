// Type definitions for Water Distribution Management System

export type UserRole = 'customer' | 'delivery' | 'owner';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  username: string;
}

export interface Product {
  id: string;
  name: string;
  shortName: string;
  capacity: string;
  category: 'jar_20l' | 'bottle_case';
  price: number;
  isActive: boolean;
  isJar20L: boolean; // Flag to identify 20L jars for jar inventory tracking
  description: string;
  badge?: string;
  imageType: 'kulick_20l' | 'bisleri_20l' | 'savelife_20l' | 'bisleri_1l_case' | 'bisleri_2l_case' | 'custom';
  imageUrl?: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  productName: string;
  previousPrice: number;
  newPrice: number;
  timestamp: string;
  adminName: string;
  reason?: string;
}

export type OrderStatus = 'New' | 'Confirmed' | 'Out for Delivery' | 'Delivered' | 'Failed' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Partial' | 'Paid';
export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Other';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtOrder: number; // CRITICAL: Price snapshot at time of order
  subtotal: number;
  isJar20L: boolean;
}

export interface Order {
  id: string; // Unique Order ID e.g., ORD-20261111-9214
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  landmark?: string;
  specialInstructions?: string;
  items: OrderItem[];
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  deliveryStatus: OrderStatus;
  assignedDeliveryPersonId?: string;
  assignedDeliveryPersonName?: string;
  createdAt: string;
  confirmedAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  deliveryNotes?: string;
  // Delivery completion details
  actualDeliveredJars?: number;
  emptyJarsCollected?: number;
  amountCollectedAtDelivery?: number;
  deliveryPaymentMethod?: PaymentMethod;
  idempotencyKey?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string; // Primary key identifier
  address: string;
  landmark?: string;
  totalPurchases: number; // Lifetime order value
  totalAmountPaid: number; // Lifetime payments received
  outstandingDue: number; // Current monetary due (Total Purchases - Total Paid + Manual Dues)
  outstandingJars: number; // Current jars in customer possession
  previousJarBalance: number;
  newJarsDelivered: number;
  emptyJarsReturned: number;
  lastPaymentDate?: string;
  lastOrderDate?: string;
  accountStatus: 'Active' | 'Overdue' | 'Clear';
  createdAt: string;
  notes?: string;
}

export interface FinancialTransaction {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  description: string;
  type: 'order_charge' | 'payment' | 'manual_due' | 'adjustment';
  debit: number; // Increases due
  credit: number; // Decreases due
  balanceAfter: number; // Running balance
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  orderId?: string;
  recordedBy: string;
  notes?: string;
}

export interface JarTransaction {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  description: string;
  type: 'delivery' | 'return' | 'manual_adjustment';
  jarsDelivered: number;
  jarsReturned: number;
  balanceAfter: number; // Running balance
  orderId?: string;
  recordedBy: string;
  notes?: string;
}

export interface AdminActivityLog {
  id: string;
  timestamp: string;
  action: 
    | 'Price Change' 
    | 'Customer Edit' 
    | 'Manual Due' 
    | 'Payment Entry' 
    | 'Jar Adjustment' 
    | 'Order Cancellation' 
    | 'Delivery Assignment' 
    | 'Delivery Status Modification'
    | 'Order Confirmation';
  adminName: string;
  details: string;
  previousValue?: string;
  updatedValue?: string;
}

export interface DailyClosingReportData {
  date: string;
  totalOrders: number;
  deliveredOrders: number;
  pendingDeliveries: number;
  cancelledOrders: number;
  cashCollected: number;
  upiCollected: number;
  otherPaymentsCollected: number;
  totalRevenueCollected: number;
  totalOutstandingDues: number;
  totalJarsDelivered: number;
  totalEmptyJarsReturned: number;
  totalOutstandingJarsSystemWide: number;
  orders: Order[];
  transactions: FinancialTransaction[];
}
