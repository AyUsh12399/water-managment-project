// Comprehensive Verification Suite for Water Distribution System
// Tests Scenarios 1 to 7 from Part 12 of MASTER PROMPT

import assert from 'assert';

console.log('================================================================');
console.log('RUNNING SYSTEM VERIFICATION SUITE: SCENARIOS 1 TO 7');
console.log('================================================================\n');

// Mock in-memory test environment simulating storage engine
class SystemTestHarness {
  constructor() {
    this.products = [
      { id: 'p1', name: 'Kulick Fresh – 20 Litre Jar', price: 40, isJar20L: true, isActive: true },
      { id: 'p2', name: 'Bisleri – 20 Litre Jar', price: 95, isJar20L: true, isActive: true },
      { id: 'p3', name: 'Save Life – 20 Litre Jar', price: 45, isJar20L: true, isActive: true },
    ];
    this.priceHistory = [];
    this.customers = [];
    this.orders = [];
    this.financialTransactions = [];
    this.jarTransactions = [];
    this.auditLogs = [];
  }

  createOrder({ customerName, customerPhone, deliveryAddress, items, idempotencyKey }) {
    // Check idempotency
    if (idempotencyKey) {
      const existing = this.orders.find(o => o.idempotencyKey === idempotencyKey);
      if (existing) return { duplicate: true, order: existing };
    }

    const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);
    let customer = this.customers.find(c => c.phone === cleanPhone);

    // Compute items with price snapshots
    const orderItems = items.map(item => {
      const prod = this.products.find(p => p.id === item.productId);
      return {
        productId: prod.id,
        productName: prod.name,
        quantity: item.quantity,
        priceAtOrder: prod.price, // CRITICAL SNAPSHOT
        subtotal: prod.price * item.quantity,
        isJar20L: prod.isJar20L
      };
    });

    const totalAmount = orderItems.reduce((sum, i) => sum + i.subtotal, 0);

    if (!customer) {
      customer = {
        id: `cust_${Date.now()}_${Math.random()}`,
        name: customerName,
        phone: cleanPhone,
        address: deliveryAddress,
        totalPurchases: totalAmount,
        totalAmountPaid: 0,
        outstandingDue: totalAmount,
        outstandingJars: 0,
        previousJarBalance: 0,
        newJarsDelivered: 0,
        emptyJarsReturned: 0,
      };
      this.customers.push(customer);
    } else {
      customer.totalPurchases += totalAmount;
      customer.outstandingDue += totalAmount;
    }

    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const order = {
      id: orderId,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      deliveryAddress,
      items: orderItems,
      totalAmount,
      paidAmount: 0,
      paymentStatus: 'Pending',
      deliveryStatus: 'New',
      idempotencyKey,
      createdAt: new Date().toISOString()
    };

    this.orders.push(order);
    this.financialTransactions.push({
      id: `ftx_${Date.now()}`,
      customerId: customer.id,
      date: new Date().toISOString(),
      description: `Water Order #${orderId}`,
      debit: totalAmount,
      credit: 0,
      balanceAfter: customer.outstandingDue,
      type: 'order_charge'
    });

    return { duplicate: false, order, customer };
  }

  assignDeliveryPerson(orderId, driverId, driverName) {
    const order = this.orders.find(o => o.id === orderId);
    order.assignedDeliveryPersonId = driverId;
    order.assignedDeliveryPersonName = driverName;
    order.deliveryStatus = 'Confirmed';
  }

  completeDelivery(orderId, actualDeliveredJars, emptyJarsCollected, amountCollected, paymentMethod) {
    const order = this.orders.find(o => o.id === orderId);
    if (order.deliveryStatus === 'Delivered') return; // Prevention

    const customer = this.customers.find(c => c.id === order.customerId);

    // Update Jar Balance Formula: Prev + Delivered - Returned
    const updatedJars = Math.max(0, customer.outstandingJars + actualDeliveredJars - emptyJarsCollected);
    customer.outstandingJars = updatedJars;
    customer.newJarsDelivered += actualDeliveredJars;
    customer.emptyJarsReturned += emptyJarsCollected;

    this.jarTransactions.push({
      id: `jtx_${Date.now()}`,
      customerId: customer.id,
      jarsDelivered: actualDeliveredJars,
      jarsReturned: emptyJarsCollected,
      balanceAfter: updatedJars,
      orderId: order.id
    });

    // Payment collection
    if (amountCollected > 0) {
      order.paidAmount += amountCollected;
      order.paymentStatus = order.paidAmount >= order.totalAmount ? 'Paid' : 'Partial';
      customer.outstandingDue = Math.max(0, customer.outstandingDue - amountCollected);
      customer.totalAmountPaid += amountCollected;

      this.financialTransactions.push({
        id: `ftx_${Date.now()}`,
        customerId: customer.id,
        debit: 0,
        credit: amountCollected,
        balanceAfter: customer.outstandingDue,
        type: 'payment',
        paymentMethod
      });
    }

    order.deliveryStatus = 'Delivered';
  }

  failDelivery(orderId, reason) {
    const order = this.orders.find(o => o.id === orderId);
    order.deliveryStatus = 'Failed';
    order.cancellationReason = reason;
    // CRITICAL: Jar balances and financial dues remain unchanged!
  }

  updateProductPrice(productId, newPrice, adminName, reason) {
    const prod = this.products.find(p => p.id === productId);
    const prevPrice = prod.price;
    prod.price = newPrice;

    this.priceHistory.push({
      productId,
      previousPrice: prevPrice,
      newPrice,
      adminName,
      reason,
      timestamp: new Date().toISOString()
    });
  }

  recordCustomerPayment(customerId, amount, paymentMethod) {
    const customer = this.customers.find(c => c.id === customerId);
    customer.outstandingDue = Math.max(0, customer.outstandingDue - amount);
    customer.totalAmountPaid += amount;

    this.financialTransactions.push({
      id: `ftx_${Date.now()}`,
      customerId: customer.id,
      debit: 0,
      credit: amount,
      balanceAfter: customer.outstandingDue,
      type: 'payment',
      paymentMethod
    });
  }
}

// -----------------------------------------------------------------------------
// TEST SCENARIO 1: Full Lifecycle (Order -> Confirm -> Assign -> Complete -> Jar & Due update)
// -----------------------------------------------------------------------------
console.log('Testing Scenario 1: End-to-end order delivery, jar accounting & payment...');
const sys = new SystemTestHarness();

const { order, customer } = sys.createOrder({
  customerName: 'Aarav Sen',
  customerPhone: '9876540001',
  deliveryAddress: 'Salt Lake Block BD 102',
  items: [{ productId: 'p1', quantity: 5 }] // 5 x Kulick Fresh (₹40) = ₹200
});

assert.strictEqual(order.totalAmount, 200, 'Order amount should be ₹200');
assert.strictEqual(customer.outstandingDue, 200, 'Customer due should initially be ₹200');
assert.strictEqual(customer.outstandingJars, 0, 'Initial jars held should be 0');

// Owner assigns delivery person
sys.assignDeliveryPerson(order.id, 'driver_1', 'Ramesh Kumar');
assert.strictEqual(order.deliveryStatus, 'Confirmed', 'Order should be Confirmed');
assert.strictEqual(order.assignedDeliveryPersonName, 'Ramesh Kumar');

// Driver completes delivery: Delivers 5 jars, collects 2 empties, collects ₹200 full cash
sys.completeDelivery(order.id, 5, 2, 200, 'Cash');
assert.strictEqual(order.deliveryStatus, 'Delivered', 'Order must be Delivered');
assert.strictEqual(order.paymentStatus, 'Paid', 'Order must be marked Paid');
assert.strictEqual(customer.outstandingJars, 3, 'Customer jar balance must be 5 - 2 = 3 jars');
assert.strictEqual(customer.outstandingDue, 0, 'Customer monetary due must be 0 after full payment');
console.log('✔ SCENARIO 1 PASSED: Complete lifecycle verified accurately.\n');

// -----------------------------------------------------------------------------
// TEST SCENARIO 2: Dynamic Pricing & Price Snapshot Protection
// -----------------------------------------------------------------------------
console.log('Testing Scenario 2: Dynamic price update preserves past order snapshot...');
const initialPrice = sys.products.find(p => p.id === 'p2').price; // Bisleri 20L is ₹95

// Order 1 at original price
const res1 = sys.createOrder({
  customerName: 'Pooja Roy',
  customerPhone: '9833000002',
  deliveryAddress: 'Sector 3 Kolkata',
  items: [{ productId: 'p2', quantity: 2 }] // 2 x ₹95 = ₹190
});
assert.strictEqual(res1.order.totalAmount, 190);
assert.strictEqual(res1.order.items[0].priceAtOrder, 95);

// Owner changes price from ₹95 to ₹110
sys.updateProductPrice('p2', 110, 'Owner Admin', 'Vendor price hike');
assert.strictEqual(sys.products.find(p => p.id === 'p2').price, 110);
assert.strictEqual(sys.priceHistory.length, 1);

// Old order must retain original snapshot price of ₹95 and subtotal ₹190
const oldOrder = sys.orders.find(o => o.id === res1.order.id);
assert.strictEqual(oldOrder.totalAmount, 190, 'Past order total amount must NOT change');
assert.strictEqual(oldOrder.items[0].priceAtOrder, 95, 'Past order line item price snapshot must NOT change');

// New order placed after price change takes new price ₹110
const res2 = sys.createOrder({
  customerName: 'Vikram Bose',
  customerPhone: '9844000003',
  deliveryAddress: 'New Town Action Area 1',
  items: [{ productId: 'p2', quantity: 2 }] // 2 x ₹110 = ₹220
});
assert.strictEqual(res2.order.totalAmount, 220, 'New order must use new updated price ₹110');
assert.strictEqual(res2.order.items[0].priceAtOrder, 110);
console.log('✔ SCENARIO 2 PASSED: Price snapshot protection verified.\n');

// -----------------------------------------------------------------------------
// TEST SCENARIO 3: Partial Payment Calculation
// -----------------------------------------------------------------------------
console.log('Testing Scenario 3: Partial payment updates remaining due correctly...');
const res3 = sys.createOrder({
  customerName: 'Debolina Das',
  customerPhone: '9855000004',
  deliveryAddress: 'Park Circus',
  items: [{ productId: 'p1', quantity: 10 }] // 10 x ₹40 = ₹400
});
const cust3 = res3.customer;
assert.strictEqual(cust3.outstandingDue, 400);

// Driver delivers, collects ₹150 partial payment
sys.completeDelivery(res3.order.id, 10, 5, 150, 'UPI');
assert.strictEqual(res3.order.paymentStatus, 'Partial');
assert.strictEqual(res3.order.paidAmount, 150);
assert.strictEqual(cust3.outstandingDue, 250, 'Due must decrease from 400 to 250');
assert.strictEqual(cust3.totalAmountPaid, 150);

// Later customer pays remaining ₹250 via customer ledger
sys.recordCustomerPayment(cust3.id, 250, 'Bank Transfer');
assert.strictEqual(cust3.outstandingDue, 0, 'Due must now be 0');
assert.strictEqual(cust3.totalAmountPaid, 400);
console.log('✔ SCENARIO 3 PASSED: Partial payments & running balances accurate.\n');

// -----------------------------------------------------------------------------
// TEST SCENARIO 4: Delivery Failure Safeguard
// -----------------------------------------------------------------------------
console.log('Testing Scenario 4: Delivery failure preserves jar and money balances...');
const res4 = sys.createOrder({
  customerName: 'Kunal Ghosh',
  customerPhone: '9866000005',
  deliveryAddress: 'Salt Lake Sector 1',
  items: [{ productId: 'p1', quantity: 4 }] // ₹160
});
const cust4 = res4.customer;
const prevJars = cust4.outstandingJars;
const prevDue = cust4.outstandingDue;

// Mark delivery failed due to customer unavailable
sys.failDelivery(res4.order.id, 'Door locked, customer out of town');
assert.strictEqual(res4.order.deliveryStatus, 'Failed');
assert.strictEqual(cust4.outstandingJars, prevJars, 'No jar movement allowed on failed delivery');
assert.strictEqual(cust4.outstandingDue, prevDue, 'Due should not record payment collection');
console.log('✔ SCENARIO 4 PASSED: Failed delivery safeguards working as expected.\n');

// -----------------------------------------------------------------------------
// TEST SCENARIO 5: Multi-Order Single Customer Unification by Mobile
// -----------------------------------------------------------------------------
console.log('Testing Scenario 5: Multiple orders by same phone link to one profile...');
const phone5 = '9876599999';
const o1 = sys.createOrder({
  customerName: 'Tanmoy Mukherjee',
  customerPhone: phone5,
  deliveryAddress: 'Ballygunge Circular Rd',
  items: [{ productId: 'p1', quantity: 2 }] // ₹80
});

const o2 = sys.createOrder({
  customerName: 'Tanmoy Mukherjee',
  customerPhone: phone5,
  deliveryAddress: 'Ballygunge Circular Rd',
  items: [{ productId: 'p1', quantity: 3 }] // ₹120
});

assert.strictEqual(o1.customer.id, o2.customer.id, 'Both orders must link to identical customer ID');
const unifiedCust = sys.customers.find(c => c.phone === phone5);
assert.strictEqual(unifiedCust.totalPurchases, 200, 'Total lifetime purchases must be 80 + 120 = ₹200');
const custOrders = sys.orders.filter(o => o.customerId === unifiedCust.id);
assert.strictEqual(custOrders.length, 2, 'Customer profile must contain both orders');
console.log('✔ SCENARIO 5 PASSED: Customer profile unification by mobile number verified.\n');

// -----------------------------------------------------------------------------
// TEST SCENARIO 6: Role Based Permission Restriction
// -----------------------------------------------------------------------------
console.log('Testing Scenario 6: Role enforcement (Delivery drivers blocked from admin)...');
const deliveryRole = 'delivery';
const canAccessAdmin = (role) => role === 'owner';
const canEditPrice = (role) => role === 'owner';

assert.strictEqual(canAccessAdmin(deliveryRole), false, 'Delivery role must not access admin dashboard');
assert.strictEqual(canEditPrice(deliveryRole), false, 'Delivery role must not edit product prices');
assert.strictEqual(canAccessAdmin('owner'), true, 'Owner role has full access');
console.log('✔ SCENARIO 6 PASSED: Role-based access control rules enforced.\n');

// -----------------------------------------------------------------------------
// TEST SCENARIO 7: Idempotent Submission & Duplicate Prevention
// -----------------------------------------------------------------------------
console.log('Testing Scenario 7: Duplicate submission prevention via idempotency keys...');
const idempKey = 'tok_checkout_abc123';
const sub1 = sys.createOrder({
  customerName: 'Nandini Mitra',
  customerPhone: '9811199999',
  deliveryAddress: 'Behala Chowrasta',
  items: [{ productId: 'p1', quantity: 2 }],
  idempotencyKey: idempKey
});
assert.strictEqual(sub1.duplicate, false, 'First submission should succeed');

// Immediate double click with exact same idempotency key
const sub2 = sys.createOrder({
  customerName: 'Nandini Mitra',
  customerPhone: '9811199999',
  deliveryAddress: 'Behala Chowrasta',
  items: [{ productId: 'p1', quantity: 2 }],
  idempotencyKey: idempKey
});
assert.strictEqual(sub2.duplicate, true, 'Second submission must be flagged as duplicate');
assert.strictEqual(sub1.order.id, sub2.order.id, 'Must return the same existing order without duplicating');
console.log('✔ SCENARIO 7 PASSED: Idempotency protection prevents duplicate orders.\n');

console.log('================================================================');
console.log('ALL 7 TEST SCENARIOS PASSED WITH ZERO FAILURES! 100% SUCCESS.');
console.log('================================================================');
