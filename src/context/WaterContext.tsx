import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Product, 
  PriceHistory, 
  Order, 
  Customer, 
  FinancialTransaction, 
  JarTransaction, 
  AdminActivityLog,
  OrderItem,
  PaymentMethod,
  DailyClosingReportData,
  OrderStatus
} from '../types';
import { WaterStorage } from '../db/storage';
import { generateId, generateOrderId, cleanPhone } from '../utils/formatters';
import { useAuth } from './AuthContext';

interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  landmark?: string;
  specialInstructions?: string;
  items: { productId: string; quantity: number }[];
  idempotencyKey?: string;
}

interface WaterContextType {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  financialTransactions: FinancialTransaction[];
  jarTransactions: JarTransaction[];
  priceHistory: PriceHistory[];
  auditLogs: AdminActivityLog[];
  
  // Cart State (Customer portal)
  cart: { [productId: string]: number };
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotalCount: number;
  cartTotalAmount: number;

  // Actions
  createOrder: (input: CreateOrderInput) => Promise<{ success: boolean; order?: Order; message?: string }>;
  confirmOrder: (orderId: string) => void;
  assignDeliveryPerson: (orderId: string, deliveryPersonId: string, deliveryPersonName: string) => void;
  updateDeliveryStatus: (orderId: string, status: OrderStatus, reason?: string) => void;
  completeDelivery: (
    orderId: string, 
    actualDeliveredJars: number, 
    emptyJarsCollected: number, 
    amountCollected: number, 
    paymentMethod: PaymentMethod, 
    deliveryNotes?: string
  ) => void;
  cancelOrder: (orderId: string, reason: string) => void;
  editOrderDetails: (orderId: string, updates: Partial<Order>) => void;
  
  // Financial Ledger Actions
  recordCustomerPayment: (
    customerId: string, 
    amount: number, 
    paymentMethod: PaymentMethod, 
    reference?: string, 
    notes?: string
  ) => void;
  addManualDue: (
    customerId: string, 
    amount: number, 
    description: string, 
    notes?: string
  ) => void;

  // Jar Ledger Actions
  manualJarAdjustment: (
    customerId: string, 
    adjustmentCount: number, 
    reason: string
  ) => void;

  // Pricing Actions
  updateProductPrice: (productId: string, newPrice: number, reason: string) => boolean;
  addProduct: (product: Omit<Product, 'id'>) => void;
  toggleProductStatus: (productId: string) => void;
  editProduct: (productId: string, updates: Partial<Product>) => void;

  // Customer Management Actions
  updateCustomer: (customerId: string, updates: Partial<Customer>) => void;

  // Reports & Backup
  getDailyClosingReport: (dateStr?: string) => DailyClosingReportData;
  exportDatabase: () => string;
  importDatabase: (jsonString: string) => boolean;
  resetDatabase: () => void;
}

const WaterContext = createContext<WaterContextType | undefined>(undefined);

export const WaterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isOwner } = useAuth();
  
  const [products, setProducts] = useState<Product[]>(() => WaterStorage.getProducts());
  const [orders, setOrders] = useState<Order[]>(() => WaterStorage.getOrders());
  const [customers, setCustomers] = useState<Customer[]>(() => WaterStorage.getCustomers());
  const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>(() => WaterStorage.getFinancialTransactions());
  const [jarTransactions, setJarTransactions] = useState<JarTransaction[]>(() => WaterStorage.getJarTransactions());
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>(() => WaterStorage.getPriceHistory());
  const [auditLogs, setAuditLogs] = useState<AdminActivityLog[]>(() => WaterStorage.getAuditLogs());

  // Customer Cart
  const [cart, setCart] = useState<{ [productId: string]: number }>({});

  // Sync to local storage
  useEffect(() => {
    WaterStorage.saveProducts(products);
  }, [products]);

  useEffect(() => {
    WaterStorage.saveOrders(orders);
  }, [orders]);

  useEffect(() => {
    WaterStorage.saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    WaterStorage.saveFinancialTransactions(financialTransactions);
  }, [financialTransactions]);

  useEffect(() => {
    WaterStorage.saveJarTransactions(jarTransactions);
  }, [jarTransactions]);

  useEffect(() => {
    WaterStorage.savePriceHistory(priceHistory);
  }, [priceHistory]);

  useEffect(() => {
    WaterStorage.saveAuditLogs(auditLogs);
  }, [auditLogs]);

  // Log an admin activity
  const logActivity = useCallback((
    action: AdminActivityLog['action'], 
    details: string, 
    previousValue?: string, 
    updatedValue?: string
  ) => {
    const newLog: AdminActivityLog = {
      id: generateId('log'),
      timestamp: new Date().toISOString(),
      action,
      adminName: currentUser?.name || 'Admin',
      details,
      previousValue,
      updatedValue
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, [currentUser]);

  // Cart operations
  const addToCart = (productId: string, quantity: number = 1) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + quantity
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => ({
      ...prev,
      [productId]: quantity
    }));
  };

  const clearCart = () => setCart({});

  const cartTotalCount = Object.values(cart).reduce((sum, q) => sum + q, 0);

  const cartTotalAmount = Object.entries(cart).reduce((sum, [pId, qty]) => {
    const prod = products.find(p => p.id === pId);
    return sum + (prod ? prod.price * qty : 0);
  }, 0);

  // 1. Create Order with Idempotency & Customer Linking
  const createOrder = async (input: CreateOrderInput): Promise<{ success: boolean; order?: Order; message?: string }> => {
    const phone = cleanPhone(input.customerPhone);
    if (phone.length !== 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number' };
    }

    // Check duplicate idempotency key
    if (input.idempotencyKey) {
      const existing = orders.find(o => o.idempotencyKey === input.idempotencyKey);
      if (existing) {
        return { success: true, order: existing, message: 'Existing order found (idempotent submission)' };
      }
    }

    // Calculate items with CRITICAL price snapshots
    const orderItems: OrderItem[] = [];
    let orderTotal = 0;
    let jarItemsCount = 0;

    for (const item of input.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product || item.quantity <= 0) continue;
      
      const subtotal = product.price * item.quantity;
      orderTotal += subtotal;
      if (product.isJar20L) {
        jarItemsCount += item.quantity;
      }

      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        priceAtOrder: product.price, // CRITICAL: Price snapshot
        subtotal,
        isJar20L: product.isJar20L
      });
    }

    if (orderItems.length === 0) {
      return { success: false, message: 'No valid products in order' };
    }

    // Customer Protection: Find existing customer by 10-digit phone number or create new
    let customer = customers.find(c => cleanPhone(c.phone) === phone);
    const nowIso = new Date().toISOString();

    if (!customer) {
      // Create new customer profile
      customer = {
        id: generateId('cust'),
        name: input.customerName.trim(),
        phone: phone,
        address: input.deliveryAddress.trim(),
        landmark: input.landmark?.trim(),
        totalPurchases: orderTotal,
        totalAmountPaid: 0,
        outstandingDue: orderTotal,
        outstandingJars: 0,
        previousJarBalance: 0,
        newJarsDelivered: 0,
        emptyJarsReturned: 0,
        lastOrderDate: nowIso,
        accountStatus: 'Active',
        createdAt: nowIso,
      };
      setCustomers(prev => [...prev, customer!]);
    } else {
      // Update existing customer profile
      const updatedCust: Customer = {
        ...customer,
        name: input.customerName.trim() || customer.name,
        address: input.deliveryAddress.trim() || customer.address,
        landmark: input.landmark?.trim() || customer.landmark,
        totalPurchases: customer.totalPurchases + orderTotal,
        outstandingDue: customer.outstandingDue + orderTotal,
        lastOrderDate: nowIso,
        accountStatus: (customer.outstandingDue + orderTotal) > 0 ? 'Overdue' : 'Clear',
      };
      setCustomers(prev => prev.map(c => c.id === updatedCust.id ? updatedCust : c));
      customer = updatedCust;
    }

    const newOrderId = generateOrderId();
    const newOrder: Order = {
      id: newOrderId,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      deliveryAddress: input.deliveryAddress.trim(),
      landmark: input.landmark?.trim(),
      specialInstructions: input.specialInstructions?.trim(),
      items: orderItems,
      totalAmount: orderTotal,
      paidAmount: 0,
      paymentStatus: 'Pending',
      deliveryStatus: 'New',
      createdAt: nowIso,
      idempotencyKey: input.idempotencyKey,
    };

    // Add financial ledger charge for this order
    const chargeTx: FinancialTransaction = {
      id: generateId('ftx'),
      customerId: customer.id,
      customerName: customer.name,
      date: nowIso,
      description: `Water Order #${newOrderId} (${orderItems.map(i => `${i.quantity}x ${i.productName}`).join(', ')})`,
      type: 'order_charge',
      debit: orderTotal,
      credit: 0,
      balanceAfter: customer.outstandingDue, // current updated due
      orderId: newOrderId,
      recordedBy: 'Customer Portal',
    };

    setOrders(prev => [newOrder, ...prev]);
    setFinancialTransactions(prev => [chargeTx, ...prev]);
    clearCart();

    logActivity(
      'Order Confirmation', 
      `New order ${newOrderId} placed by ${customer.name} (${customer.phone}) for ₹${orderTotal}`,
      '-',
      `Status: New, Total: ₹${orderTotal}`
    );

    return { success: true, order: newOrder };
  };

  // 2. Confirm Order (Owner)
  const confirmOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        logActivity('Order Confirmation', `Order ${orderId} confirmed by owner`, order.deliveryStatus, 'Confirmed');
        return {
          ...order,
          deliveryStatus: 'Confirmed',
          confirmedAt: new Date().toISOString()
        };
      }
      return order;
    }));
  };

  // 3. Assign Delivery Person
  const assignDeliveryPerson = (orderId: string, deliveryPersonId: string, deliveryPersonName: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        logActivity(
          'Delivery Assignment', 
          `Assigned order ${orderId} to ${deliveryPersonName}`,
          order.assignedDeliveryPersonName || 'Unassigned',
          deliveryPersonName
        );
        return {
          ...order,
          assignedDeliveryPersonId: deliveryPersonId,
          assignedDeliveryPersonName: deliveryPersonName,
        };
      }
      return order;
    }));
  };

  // 4. Update Delivery Status (Out for Delivery or Failed)
  const updateDeliveryStatus = (orderId: string, status: OrderStatus, reason?: string) => {
    const nowIso = new Date().toISOString();
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        logActivity(
          'Delivery Status Modification', 
          `Order ${orderId} status changed to ${status}${reason ? ` (Reason: ${reason})` : ''}`,
          order.deliveryStatus,
          status
        );

        return {
          ...order,
          deliveryStatus: status,
          outForDeliveryAt: status === 'Out for Delivery' ? nowIso : order.outForDeliveryAt,
          failedAt: status === 'Failed' ? nowIso : order.failedAt,
          cancellationReason: status === 'Failed' ? reason : order.cancellationReason
        };
      }
      return order;
    }));
  };

  // 5. Complete Delivery (Delivery Person or Owner)
  // ATOMIC UPDATE: Order delivered + Jar ledger update + Payment collection (if collected)
  const completeDelivery = (
    orderId: string, 
    actualDeliveredJars: number, 
    emptyJarsCollected: number, 
    amountCollected: number, 
    paymentMethod: PaymentMethod, 
    deliveryNotes?: string
  ) => {
    const nowIso = new Date().toISOString();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Delivery Protection: prevent duplicate delivery confirmations
    if (order.deliveryStatus === 'Delivered') {
      console.warn(`Order ${orderId} is already marked Delivered.`);
      return;
    }

    const customer = customers.find(c => c.id === order.customerId);
    if (!customer) return;

    // Update customer's jar balance:
    // Formula: Current Outstanding Jars = Previous Balance + Jars Delivered - Empty Jars Returned
    const updatedOutstandingJars = Math.max(0, customer.outstandingJars + actualDeliveredJars - emptyJarsCollected);

    // Record Jar Transaction
    const newJarTx: JarTransaction = {
      id: generateId('jtx'),
      customerId: customer.id,
      customerName: customer.name,
      date: nowIso,
      description: `Delivery for Order #${orderId} (${actualDeliveredJars} Jars Delivered, ${emptyJarsCollected} Empties Returned)`,
      type: 'delivery',
      jarsDelivered: actualDeliveredJars,
      jarsReturned: emptyJarsCollected,
      balanceAfter: updatedOutstandingJars,
      orderId: orderId,
      recordedBy: currentUser?.name || 'Delivery Personnel',
      notes: deliveryNotes
    };
    setJarTransactions(prev => [newJarTx, ...prev]);

    // Handle Payment Collection if amount collected > 0
    let updatedDue = customer.outstandingDue;
    let updatedTotalPaid = customer.totalAmountPaid;
    let newPaidAmount = order.paidAmount + amountCollected;
    let newPaymentStatus: Order['paymentStatus'] = order.paymentStatus;

    if (amountCollected > 0) {
      updatedDue = Math.max(0, customer.outstandingDue - amountCollected);
      updatedTotalPaid += amountCollected;
      
      if (newPaidAmount >= order.totalAmount) {
        newPaymentStatus = 'Paid';
      } else {
        newPaymentStatus = 'Partial';
      }

      // Add Financial Transaction for payment
      const paymentTx: FinancialTransaction = {
        id: generateId('ftx'),
        customerId: customer.id,
        customerName: customer.name,
        date: nowIso,
        description: `Payment collected at delivery for #${orderId} (${paymentMethod})`,
        type: 'payment',
        debit: 0,
        credit: amountCollected,
        balanceAfter: updatedDue,
        paymentMethod: paymentMethod,
        orderId: orderId,
        recordedBy: currentUser?.name || 'Delivery Personnel',
        notes: deliveryNotes
      };
      setFinancialTransactions(prev => [paymentTx, ...prev]);
    }

    // Update Customer
    setCustomers(prev => prev.map(c => {
      if (c.id === customer.id) {
        return {
          ...c,
          outstandingJars: updatedOutstandingJars,
          newJarsDelivered: c.newJarsDelivered + actualDeliveredJars,
          emptyJarsReturned: c.emptyJarsReturned + emptyJarsCollected,
          outstandingDue: updatedDue,
          totalAmountPaid: updatedTotalPaid,
          lastPaymentDate: amountCollected > 0 ? nowIso : c.lastPaymentDate,
          accountStatus: updatedDue > 0 ? 'Overdue' : 'Clear',
        };
      }
      return c;
    }));

    // Update Order
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          deliveryStatus: 'Delivered',
          deliveredAt: nowIso,
          actualDeliveredJars,
          emptyJarsCollected,
          amountCollectedAtDelivery: amountCollected,
          deliveryPaymentMethod: paymentMethod,
          paidAmount: newPaidAmount,
          paymentStatus: newPaymentStatus,
          deliveryNotes: deliveryNotes
        };
      }
      return o;
    }));

    logActivity(
      'Delivery Status Modification',
      `Completed delivery for Order ${orderId}: ${actualDeliveredJars} jars delivered, ${emptyJarsCollected} empties collected. Amount collected: ₹${amountCollected} (${paymentMethod})`,
      'Out for Delivery',
      'Delivered'
    );
  };

  // 6. Cancel Order
  const cancelOrder = (orderId: string, reason: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const customer = customers.find(c => c.id === order.customerId);
    const nowIso = new Date().toISOString();

    // Adjust customer financial dues if order was not previously paid
    if (customer) {
      const netChargeToReverse = order.totalAmount - order.paidAmount;
      const updatedDue = Math.max(0, customer.outstandingDue - netChargeToReverse);
      const updatedPurchases = Math.max(0, customer.totalPurchases - order.totalAmount);

      setCustomers(prev => prev.map(c => {
        if (c.id === customer.id) {
          return {
            ...c,
            outstandingDue: updatedDue,
            totalPurchases: updatedPurchases,
            accountStatus: updatedDue > 0 ? 'Overdue' : 'Clear',
          };
        }
        return c;
      }));

      // Add reversal ledger entry
      const reversalTx: FinancialTransaction = {
        id: generateId('ftx'),
        customerId: customer.id,
        customerName: customer.name,
        date: nowIso,
        description: `Order #${orderId} Cancelled - Charge Reversed (${reason})`,
        type: 'adjustment',
        debit: 0,
        credit: netChargeToReverse,
        balanceAfter: updatedDue,
        orderId: orderId,
        recordedBy: currentUser?.name || 'Owner Admin',
        notes: reason
      };
      setFinancialTransactions(prev => [reversalTx, ...prev]);
    }

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          deliveryStatus: 'Cancelled',
          cancelledAt: nowIso,
          cancellationReason: reason
        };
      }
      return o;
    }));

    logActivity(
      'Order Cancellation',
      `Cancelled Order ${orderId}. Reason: ${reason}`,
      order.deliveryStatus,
      'Cancelled'
    );
  };

  // 7. Edit Order Details
  const editOrderDetails = (orderId: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        logActivity(
          'Customer Edit',
          `Modified details for order ${orderId}`,
          JSON.stringify({ address: o.deliveryAddress, instructions: o.specialInstructions }),
          JSON.stringify({ address: updates.deliveryAddress, instructions: updates.specialInstructions })
        );
        return { ...o, ...updates };
      }
      return o;
    }));
  };

  // 8. Financial Ledger: Record Customer Payment
  const recordCustomerPayment = (
    customerId: string, 
    amount: number, 
    paymentMethod: PaymentMethod, 
    reference?: string, 
    notes?: string
  ) => {
    if (amount <= 0) return;
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const nowIso = new Date().toISOString();
    const updatedDue = Math.max(0, customer.outstandingDue - amount);
    const updatedPaid = customer.totalAmountPaid + amount;

    // Financial Transaction
    const tx: FinancialTransaction = {
      id: generateId('ftx'),
      customerId: customer.id,
      customerName: customer.name,
      date: nowIso,
      description: `Payment Received via ${paymentMethod}${reference ? ` (Ref: ${reference})` : ''}`,
      type: 'payment',
      debit: 0,
      credit: amount,
      balanceAfter: updatedDue,
      paymentMethod,
      paymentReference: reference,
      recordedBy: currentUser?.name || 'Owner Admin',
      notes
    };
    setFinancialTransactions(prev => [tx, ...prev]);

    // Update Customer Profile
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          outstandingDue: updatedDue,
          totalAmountPaid: updatedPaid,
          lastPaymentDate: nowIso,
          accountStatus: updatedDue > 0 ? 'Overdue' : 'Clear',
        };
      }
      return c;
    }));

    logActivity(
      'Payment Entry',
      `Recorded ₹${amount} payment for ${customer.name} via ${paymentMethod}`,
      `Due: ₹${customer.outstandingDue}`,
      `New Due: ₹${updatedDue}`
    );
  };

  // 9. Financial Ledger: Add Manual Due
  const addManualDue = (
    customerId: string, 
    amount: number, 
    description: string, 
    notes?: string
  ) => {
    if (amount <= 0) return;
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const nowIso = new Date().toISOString();
    const updatedDue = customer.outstandingDue + amount;

    const tx: FinancialTransaction = {
      id: generateId('ftx'),
      customerId: customer.id,
      customerName: customer.name,
      date: nowIso,
      description: `Manual Due: ${description}`,
      type: 'manual_due',
      debit: amount,
      credit: 0,
      balanceAfter: updatedDue,
      recordedBy: currentUser?.name || 'Owner Admin',
      notes
    };
    setFinancialTransactions(prev => [tx, ...prev]);

    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          outstandingDue: updatedDue,
          accountStatus: 'Overdue',
        };
      }
      return c;
    }));

    logActivity(
      'Manual Due',
      `Added ₹${amount} manual due for ${customer.name}. Reason: ${description}`,
      `Due: ₹${customer.outstandingDue}`,
      `New Due: ₹${updatedDue}`
    );
  };

  // 10. Jar Ledger: Manual Jar Adjustment
  const manualJarAdjustment = (customerId: string, adjustmentCount: number, reason: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const nowIso = new Date().toISOString();
    const updatedJarCount = Math.max(0, customer.outstandingJars + adjustmentCount);

    const jarTx: JarTransaction = {
      id: generateId('jtx'),
      customerId: customer.id,
      customerName: customer.name,
      date: nowIso,
      description: `Manual Adjustment: ${reason} (${adjustmentCount >= 0 ? `+${adjustmentCount}` : adjustmentCount} Jars)`,
      type: 'manual_adjustment',
      jarsDelivered: adjustmentCount > 0 ? adjustmentCount : 0,
      jarsReturned: adjustmentCount < 0 ? Math.abs(adjustmentCount) : 0,
      balanceAfter: updatedJarCount,
      recordedBy: currentUser?.name || 'Owner Admin',
      notes: reason
    };
    setJarTransactions(prev => [jarTx, ...prev]);

    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          outstandingJars: updatedJarCount
        };
      }
      return c;
    }));

    logActivity(
      'Jar Adjustment',
      `Adjusted jar balance for ${customer.name} by ${adjustmentCount >= 0 ? `+${adjustmentCount}` : adjustmentCount}. Reason: ${reason}`,
      `${customer.outstandingJars} jars`,
      `${updatedJarCount} jars`
    );
  };

  // 11. Dynamic Pricing: Update Product Price
  // CRITICAL RULE: Old orders retain their original product prices!
  // Price change only affects future orders.
  const updateProductPrice = (productId: string, newPrice: number, reason: string): boolean => {
    if (!isOwner) {
      console.error('Unauthorized: Only owner can update product prices');
      return false;
    }
    if (newPrice < 0) return false;

    const product = products.find(p => p.id === productId);
    if (!product) return false;

    const prevPrice = product.price;
    const nowIso = new Date().toISOString();

    // 1. Record Price History
    const historyItem: PriceHistory = {
      id: generateId('ph'),
      productId: product.id,
      productName: product.name,
      previousPrice: prevPrice,
      newPrice: newPrice,
      timestamp: nowIso,
      adminName: currentUser?.name || 'Owner Admin',
      reason
    };
    setPriceHistory(prev => [historyItem, ...prev]);

    // 2. Update Product Catalog
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, price: newPrice };
      }
      return p;
    }));

    // 3. Log Activity
    logActivity(
      'Price Change',
      `Updated price of ${product.name} from ₹${prevPrice} to ₹${newPrice}. Reason: ${reason}`,
      `₹${prevPrice}`,
      `₹${newPrice}`
    );

    return true;
  };

  // 12. Add New Product
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: generateId('prod'),
    };
    setProducts(prev => [...prev, newProduct]);
    logActivity('Price Change', `Added new product: ${newProduct.name} at ₹${newProduct.price}`);
  };

  // 13. Toggle Product Active / Inactive
  const toggleProductStatus = (productId: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const nextState = !p.isActive;
        logActivity('Price Change', `${nextState ? 'Activated' : 'Deactivated'} product ${p.name}`);
        return { ...p, isActive: nextState };
      }
      return p;
    }));
  };

  // 14. Edit Product Information
  const editProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, ...updates };
      }
      return p;
    }));
  };

  // 15. Edit Customer Information
  const updateCustomer = (customerId: string, updates: Partial<Customer>) => {
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return;

    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return { ...c, ...updates };
      }
      return c;
    }));

    logActivity(
      'Customer Edit',
      `Updated contact details for ${cust.name}`,
      `Phone: ${cust.phone}, Address: ${cust.address}`,
      `Phone: ${updates.phone || cust.phone}, Address: ${updates.address || cust.address}`
    );
  };

  // 16. Daily Closing Report Generation
  const getDailyClosingReport = (dateStr?: string): DailyClosingReportData => {
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const dateFormatted = targetDate.toISOString().split('T')[0];

    // Filter orders placed or delivered on that date
    const dayOrders = orders.filter(o => {
      const orderDate = (o.deliveredAt || o.createdAt).split('T')[0];
      return orderDate === dateFormatted;
    });

    const totalOrders = dayOrders.length;
    const deliveredOrders = dayOrders.filter(o => o.deliveryStatus === 'Delivered').length;
    const pendingDeliveries = dayOrders.filter(o => ['New', 'Confirmed', 'Out for Delivery'].includes(o.deliveryStatus)).length;
    const cancelledOrders = dayOrders.filter(o => o.deliveryStatus === 'Cancelled').length;

    // Filter financial transactions for that date
    const dayTxs = financialTransactions.filter(t => t.date.split('T')[0] === dateFormatted);
    
    // Revenue collected counts actual payments received, not merely orders placed
    let cashCollected = 0;
    let upiCollected = 0;
    let otherPaymentsCollected = 0;

    dayTxs.filter(t => t.type === 'payment').forEach(tx => {
      if (tx.paymentMethod === 'Cash') {
        cashCollected += tx.credit;
      } else if (tx.paymentMethod === 'UPI') {
        upiCollected += tx.credit;
      } else {
        otherPaymentsCollected += tx.credit;
      }
    });

    const totalRevenueCollected = cashCollected + upiCollected + otherPaymentsCollected;

    // Filter jar transactions for that date
    const dayJarTxs = jarTransactions.filter(j => j.date.split('T')[0] === dateFormatted);
    const totalJarsDelivered = dayJarTxs.reduce((sum, j) => sum + j.jarsDelivered, 0);
    const totalEmptyJarsReturned = dayJarTxs.reduce((sum, j) => sum + j.jarsReturned, 0);

    const totalOutstandingDues = customers.reduce((sum, c) => sum + c.outstandingDue, 0);
    const totalOutstandingJarsSystemWide = customers.reduce((sum, c) => sum + c.outstandingJars, 0);

    return {
      date: dateFormatted,
      totalOrders,
      deliveredOrders,
      pendingDeliveries,
      cancelledOrders,
      cashCollected,
      upiCollected,
      otherPaymentsCollected,
      totalRevenueCollected,
      totalOutstandingDues,
      totalJarsDelivered,
      totalEmptyJarsReturned,
      totalOutstandingJarsSystemWide,
      orders: dayOrders,
      transactions: dayTxs
    };
  };

  // Database Backup / Restore
  const exportDatabase = () => WaterStorage.exportDatabase();

  const importDatabase = (jsonString: string): boolean => {
    const success = WaterStorage.importDatabase(jsonString);
    if (success) {
      setProducts(WaterStorage.getProducts());
      setPriceHistory(WaterStorage.getPriceHistory());
      setOrders(WaterStorage.getOrders());
      setCustomers(WaterStorage.getCustomers());
      setFinancialTransactions(WaterStorage.getFinancialTransactions());
      setJarTransactions(WaterStorage.getJarTransactions());
      setAuditLogs(WaterStorage.getAuditLogs());
    }
    return success;
  };

  const resetDatabase = () => {
    WaterStorage.resetToDefaults();
    setProducts(WaterStorage.getProducts());
    setPriceHistory(WaterStorage.getPriceHistory());
    setOrders(WaterStorage.getOrders());
    setCustomers(WaterStorage.getCustomers());
    setFinancialTransactions(WaterStorage.getFinancialTransactions());
    setJarTransactions(WaterStorage.getJarTransactions());
    setAuditLogs(WaterStorage.getAuditLogs());
  };

  const value: WaterContextType = {
    products,
    orders,
    customers,
    financialTransactions,
    jarTransactions,
    priceHistory,
    auditLogs,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotalCount,
    cartTotalAmount,
    createOrder,
    confirmOrder,
    assignDeliveryPerson,
    updateDeliveryStatus,
    completeDelivery,
    cancelOrder,
    editOrderDetails,
    recordCustomerPayment,
    addManualDue,
    manualJarAdjustment,
    updateProductPrice,
    addProduct,
    toggleProductStatus,
    editProduct,
    updateCustomer,
    getDailyClosingReport,
    exportDatabase,
    importDatabase,
    resetDatabase
  };

  return <WaterContext.Provider value={value}>{children}</WaterContext.Provider>;
};

export const useWater = () => {
  const context = useContext(WaterContext);
  if (!context) {
    throw new Error('useWater must be used within a WaterProvider');
  }
  return context;
};
