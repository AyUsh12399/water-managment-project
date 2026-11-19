import { 
  Product, 
  PriceHistory, 
  Order, 
  Customer, 
  FinancialTransaction, 
  JarTransaction, 
  AdminActivityLog,
  User
} from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'aquaflow_products_v1',
  PRICE_HISTORY: 'aquaflow_price_history_v1',
  ORDERS: 'aquaflow_orders_v1',
  CUSTOMERS: 'aquaflow_customers_v1',
  FINANCIAL_TX: 'aquaflow_financial_tx_v1',
  JAR_TX: 'aquaflow_jar_tx_v1',
  AUDIT_LOGS: 'aquaflow_audit_logs_v1',
  USERS: 'aquaflow_users_v1',
  CURRENT_USER: 'aquaflow_current_user_v1',
};

// Initial Products as specified in Part 1 & Part 5
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_kulick_20l',
    name: 'Kulick Fresh – 20 Litre Jar',
    shortName: 'Kulick Fresh 20L',
    capacity: '20 Litre',
    category: 'jar_20l',
    price: 40, // ₹40 as specified
    isActive: true,
    isJar20L: true,
    description: 'Triple-filtered, multi-stage ozonized & UV-purified natural water. Highest hygiene standard for residential and commercial use.',
    badge: 'Best Value',
    imageType: 'kulick_20l'
  },
  {
    id: 'prod_bisleri_20l',
    name: 'Bisleri – 20 Litre Jar',
    shortName: 'Bisleri 20L',
    capacity: '20 Litre',
    category: 'jar_20l',
    price: 95, // ₹95 as specified
    isActive: true,
    isJar20L: true,
    description: 'Authentic Bisleri mineral water with added minerals (Magnesium & Potassium). 114 quality tests, tamper-evident sealed cap.',
    badge: 'Popular Choice',
    imageType: 'bisleri_20l'
  },
  {
    id: 'prod_savelife_20l',
    name: 'Save Life – 20 Litre Jar',
    shortName: 'Save Life 20L',
    capacity: '20 Litre',
    category: 'jar_20l',
    price: 45, // Configurable by owner
    isActive: true,
    isJar20L: true,
    description: 'Enriched mineral drinking water. Certified RO + UV purification technology designed for pure everyday hydration.',
    badge: 'Economy',
    imageType: 'savelife_20l'
  },
  {
    id: 'prod_bisleri_1l_case',
    name: 'Bisleri – 1 Litre Case',
    shortName: 'Bisleri 1L Case (12 Pcs)',
    capacity: '12 x 1 Litre Bottles',
    category: 'bottle_case',
    price: 240, // Configurable by owner (12 bottles pack)
    isActive: true,
    isJar20L: false,
    description: 'Shrink-wrapped box of 12 sealed Bisleri 1-Litre bottles. Ideal for family gatherings, corporate conferences, and travel.',
    imageType: 'bisleri_1l_case'
  },
  {
    id: 'prod_bisleri_2l_case',
    name: 'Bisleri – 2 Litre Case',
    shortName: 'Bisleri 2L Case (9 Pcs)',
    capacity: '9 x 2 Litre Bottles',
    category: 'bottle_case',
    price: 270, // Configurable by owner (9 bottles pack)
    isActive: true,
    isJar20L: false,
    description: 'Carton of 9 jumbo 2-Litre Bisleri bottles. Perfect balance of portability and high-volume hydration for events.',
    imageType: 'bisleri_2l_case'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_owner_1',
    name: 'Owner Admin',
    role: 'owner',
    phone: '9800000001',
    username: 'admin'
  },
  {
    id: 'usr_driver_1',
    name: 'Ramesh Kumar (Van 1)',
    role: 'delivery',
    phone: '9876500001',
    username: 'ramesh'
  },
  {
    id: 'usr_driver_2',
    name: 'Suresh Verma (Bike 2)',
    role: 'delivery',
    phone: '9876500002',
    username: 'suresh'
  }
];

// Seed sample customer matching prompt example (Rahul Sharma)
export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_rahul_sharma',
    name: 'Rahul Sharma',
    phone: '9876543210',
    address: 'Flat 4B, Greenwood Heights, Salt Lake Sector 2',
    landmark: 'Near Karunamoyee Metro',
    totalPurchases: 1700,
    totalAmountPaid: 800,
    outstandingDue: 900, // Matches prompt sample: ₹900
    outstandingJars: 3, // Matches prompt sample: 3 jars
    previousJarBalance: 2,
    newJarsDelivered: 3,
    emptyJarsReturned: 2,
    lastPaymentDate: '2026-11-08T14:30:00.000Z',
    lastOrderDate: '2026-11-06T10:15:00.000Z',
    accountStatus: 'Overdue',
    createdAt: '2026-10-25T08:00:00.000Z',
    notes: 'Regular residential customer. Delivers every Monday & Thursday.'
  },
  {
    id: 'cust_priya_patel',
    name: 'Priya Patel',
    phone: '9833445566',
    address: 'Office 301, Tech Park 1, Salt Lake Sector 5',
    landmark: 'Behind RDB Cinemas',
    totalPurchases: 2850,
    totalAmountPaid: 2850,
    outstandingDue: 0,
    outstandingJars: 5,
    previousJarBalance: 5,
    newJarsDelivered: 5,
    emptyJarsReturned: 5,
    lastPaymentDate: '2026-11-10T11:00:00.000Z',
    lastOrderDate: '2026-11-10T09:30:00.000Z',
    accountStatus: 'Clear',
    createdAt: '2026-10-15T09:00:00.000Z',
    notes: 'Corporate account: Bisleri 20L jars.'
  },
  {
    id: 'cust_amit_roy',
    name: 'Amit Roy',
    phone: '9811223344',
    address: '12/A Southern Avenue, Near Lake Stadium',
    landmark: 'Opposite Sweet Corner',
    totalPurchases: 480,
    totalAmountPaid: 400,
    outstandingDue: 80,
    outstandingJars: 2,
    previousJarBalance: 1,
    newJarsDelivered: 2,
    emptyJarsReturned: 1,
    lastPaymentDate: '2026-11-09T17:20:00.000Z',
    lastOrderDate: '2026-11-11T12:00:00.000Z',
    accountStatus: 'Active',
    createdAt: '2026-11-01T10:00:00.000Z',
    notes: 'Prefers deliveries between 9 AM and 12 PM.'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-20261106-1082',
    customerId: 'cust_rahul_sharma',
    customerName: 'Rahul Sharma',
    customerPhone: '9876543210',
    deliveryAddress: 'Flat 4B, Greenwood Heights, Salt Lake Sector 2',
    landmark: 'Near Karunamoyee Metro',
    specialInstructions: 'Ring doorbell twice. Keep jars near doorway.',
    items: [
      {
        productId: 'prod_kulick_20l',
        productName: 'Kulick Fresh – 20 Litre Jar',
        quantity: 15,
        priceAtOrder: 40,
        subtotal: 600,
        isJar20L: true
      }
    ],
    totalAmount: 600,
    paidAmount: 300,
    paymentStatus: 'Partial',
    deliveryStatus: 'Delivered',
    assignedDeliveryPersonId: 'usr_driver_1',
    assignedDeliveryPersonName: 'Ramesh Kumar (Van 1)',
    createdAt: '2026-11-06T10:15:00.000Z',
    confirmedAt: '2026-11-06T10:30:00.000Z',
    outForDeliveryAt: '2026-11-06T11:00:00.000Z',
    deliveredAt: '2026-11-06T12:45:00.000Z',
    actualDeliveredJars: 15,
    emptyJarsCollected: 14,
    amountCollectedAtDelivery: 300,
    deliveryPaymentMethod: 'Cash',
    deliveryNotes: 'Delivered 15 jars, collected 14 empties. Rs 300 paid in cash.'
  },
  {
    id: 'ORD-20261111-4091',
    customerId: 'cust_amit_roy',
    customerName: 'Amit Roy',
    customerPhone: '9811223344',
    deliveryAddress: '12/A Southern Avenue, Near Lake Stadium',
    landmark: 'Opposite Sweet Corner',
    specialInstructions: 'Please deliver before 2 PM today.',
    items: [
      {
        productId: 'prod_bisleri_20l',
        productName: 'Bisleri – 20 Litre Jar',
        quantity: 2,
        priceAtOrder: 95,
        subtotal: 190,
        isJar20L: true
      },
      {
        productId: 'prod_bisleri_1l_case',
        productName: 'Bisleri – 1 Litre Case',
        quantity: 1,
        priceAtOrder: 240,
        subtotal: 240,
        isJar20L: false
      }
    ],
    totalAmount: 430,
    paidAmount: 0,
    paymentStatus: 'Pending',
    deliveryStatus: 'Out for Delivery',
    assignedDeliveryPersonId: 'usr_driver_2',
    assignedDeliveryPersonName: 'Suresh Verma (Bike 2)',
    createdAt: '2026-11-11T09:15:00.000Z',
    confirmedAt: '2026-11-11T09:30:00.000Z',
    outForDeliveryAt: '2026-11-11T10:15:00.000Z',
  },
  {
    id: 'ORD-20261111-7823',
    customerId: 'cust_rahul_sharma',
    customerName: 'Rahul Sharma',
    customerPhone: '9876543210',
    deliveryAddress: 'Flat 4B, Greenwood Heights, Salt Lake Sector 2',
    landmark: 'Near Karunamoyee Metro',
    specialInstructions: 'Need 3 fresh jars today.',
    items: [
      {
        productId: 'prod_kulick_20l',
        productName: 'Kulick Fresh – 20 Litre Jar',
        quantity: 3,
        priceAtOrder: 40,
        subtotal: 120,
        isJar20L: true
      }
    ],
    totalAmount: 120,
    paidAmount: 0,
    paymentStatus: 'Pending',
    deliveryStatus: 'New',
    createdAt: '2026-11-11T11:45:00.000Z',
  }
];

export const INITIAL_FINANCIAL_TX: FinancialTransaction[] = [
  {
    id: 'ftx_01',
    customerId: 'cust_rahul_sharma',
    customerName: 'Rahul Sharma',
    date: '2026-11-01T09:00:00.000Z',
    description: 'Previous Due Brought Forward',
    type: 'manual_due',
    debit: 500,
    credit: 0,
    balanceAfter: 500,
    recordedBy: 'Owner Admin',
    notes: 'Opening balance ledger transfer'
  },
  {
    id: 'ftx_02',
    customerId: 'cust_rahul_sharma',
    customerName: 'Rahul Sharma',
    date: '2026-11-03T10:00:00.000Z',
    description: 'Water Order (15 x Kulick Fresh 20L)',
    type: 'order_charge',
    debit: 600,
    credit: 0,
    balanceAfter: 1100,
    recordedBy: 'System',
    orderId: 'ORD-20261103-9901'
  },
  {
    id: 'ftx_03',
    customerId: 'cust_rahul_sharma',
    customerName: 'Rahul Sharma',
    date: '2026-11-04T16:00:00.000Z',
    description: 'Payment Received via UPI',
    type: 'payment',
    debit: 0,
    credit: 500,
    balanceAfter: 600,
    paymentMethod: 'UPI',
    paymentReference: 'UPI/61104160012/PAYTM',
    recordedBy: 'Owner Admin'
  },
  {
    id: 'ftx_04',
    customerId: 'cust_rahul_sharma',
    customerName: 'Rahul Sharma',
    date: '2026-11-06T12:45:00.000Z',
    description: 'Water Order #ORD-20261106-1082',
    type: 'order_charge',
    debit: 600,
    credit: 0,
    balanceAfter: 1200,
    recordedBy: 'System',
    orderId: 'ORD-20261106-1082'
  },
  {
    id: 'ftx_05',
    customerId: 'cust_rahul_sharma',
    customerName: 'Rahul Sharma',
    date: '2026-11-08T14:30:00.000Z',
    description: 'Partial Cash Payment Received',
    type: 'payment',
    debit: 0,
    credit: 300,
    balanceAfter: 900,
    paymentMethod: 'Cash',
    recordedBy: 'Ramesh Kumar (Van 1)'
  }
];

export const INITIAL_JAR_TX: JarTransaction[] = [
  {
    id: 'jtx_01',
    customerId: 'cust_rahul_sharma',
    customerName: 'Rahul Sharma',
    date: '2026-11-01T09:00:00.000Z',
    description: 'Initial Outstanding Jar Balance',
    type: 'manual_adjustment',
    jarsDelivered: 2,
    jarsReturned: 0,
    balanceAfter: 2,
    recordedBy: 'Owner Admin'
  },
  {
    id: 'jtx_02',
    customerId: 'cust_rahul_sharma',
    customerName: 'Rahul Sharma',
    date: '2026-11-06T12:45:00.000Z',
    description: 'Delivery #ORD-20261106-1082 (Delivered 3, Returned 2)',
    type: 'delivery',
    jarsDelivered: 3,
    jarsReturned: 2,
    balanceAfter: 3, // 2 + 3 - 2 = 3
    orderId: 'ORD-20261106-1082',
    recordedBy: 'Ramesh Kumar (Van 1)'
  }
];

export const INITIAL_AUDIT_LOGS: AdminActivityLog[] = [
  {
    id: 'log_01',
    timestamp: '2026-11-01T09:00:00.000Z',
    action: 'Manual Due',
    adminName: 'Owner Admin',
    details: 'Set initial balance for Rahul Sharma: ₹500 debit and 2 jars balance',
    previousValue: '₹0 / 0 jars',
    updatedValue: '₹500 / 2 jars'
  },
  {
    id: 'log_02',
    timestamp: '2026-11-05T15:00:00.000Z',
    action: 'Price Change',
    adminName: 'Owner Admin',
    details: 'Adjusted Bisleri 20L price from ₹90 to ₹95 due to distributor hike',
    previousValue: '₹90',
    updatedValue: '₹95'
  }
];

export const INITIAL_PRICE_HISTORY: PriceHistory[] = [
  {
    id: 'ph_01',
    productId: 'prod_bisleri_20l',
    productName: 'Bisleri – 20 Litre Jar',
    previousPrice: 90,
    newPrice: 95,
    timestamp: '2026-11-05T15:00:00.000Z',
    adminName: 'Owner Admin',
    reason: 'Distributor rate revision'
  }
];

// Local Storage Helper Functions
export class WaterStorage {
  private static get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item);
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return defaultValue;
    }
  }

  private static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
    }
  }

  // Products
  static getProducts(): Product[] {
    return this.get<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  static saveProducts(products: Product[]): void {
    this.set(STORAGE_KEYS.PRODUCTS, products);
  }

  // Price History
  static getPriceHistory(): PriceHistory[] {
    return this.get<PriceHistory[]>(STORAGE_KEYS.PRICE_HISTORY, INITIAL_PRICE_HISTORY);
  }

  static savePriceHistory(history: PriceHistory[]): void {
    this.set(STORAGE_KEYS.PRICE_HISTORY, history);
  }

  // Orders
  static getOrders(): Order[] {
    return this.get<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }

  static saveOrders(orders: Order[]): void {
    this.set(STORAGE_KEYS.ORDERS, orders);
  }

  // Customers
  static getCustomers(): Customer[] {
    return this.get<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  }

  static saveCustomers(customers: Customer[]): void {
    this.set(STORAGE_KEYS.CUSTOMERS, customers);
  }

  // Financial Transactions
  static getFinancialTransactions(): FinancialTransaction[] {
    return this.get<FinancialTransaction[]>(STORAGE_KEYS.FINANCIAL_TX, INITIAL_FINANCIAL_TX);
  }

  static saveFinancialTransactions(txs: FinancialTransaction[]): void {
    this.set(STORAGE_KEYS.FINANCIAL_TX, txs);
  }

  // Jar Transactions
  static getJarTransactions(): JarTransaction[] {
    return this.get<JarTransaction[]>(STORAGE_KEYS.JAR_TX, INITIAL_JAR_TX);
  }

  static saveJarTransactions(txs: JarTransaction[]): void {
    this.set(STORAGE_KEYS.JAR_TX, txs);
  }

  // Audit Logs
  static getAuditLogs(): AdminActivityLog[] {
    return this.get<AdminActivityLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  static saveAuditLogs(logs: AdminActivityLog[]): void {
    this.set(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  // Users
  static getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  // Full Database Backup & Restore
  static exportDatabase(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      products: this.getProducts(),
      priceHistory: this.getPriceHistory(),
      orders: this.getOrders(),
      customers: this.getCustomers(),
      financialTransactions: this.getFinancialTransactions(),
      jarTransactions: this.getJarTransactions(),
      auditLogs: this.getAuditLogs(),
    };
    return JSON.stringify(backup, null, 2);
  }

  static importDatabase(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.products) this.saveProducts(data.products);
      if (data.priceHistory) this.savePriceHistory(data.priceHistory);
      if (data.orders) this.saveOrders(data.orders);
      if (data.customers) this.saveCustomers(data.customers);
      if (data.financialTransactions) this.saveFinancialTransactions(data.financialTransactions);
      if (data.jarTransactions) this.saveJarTransactions(data.jarTransactions);
      if (data.auditLogs) this.saveAuditLogs(data.auditLogs);
      return true;
    } catch (e) {
      console.error('Failed to import database:', e);
      return false;
    }
  }

  static resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.PRICE_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.FINANCIAL_TX);
    localStorage.removeItem(STORAGE_KEYS.JAR_TX);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
  }
}
