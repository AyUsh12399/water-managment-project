# AquaFlow — Enterprise Water Distribution & Order Management System

AquaFlow is a production-grade, responsive, full-stack Water Distribution and Order Management Platform designed to replace manual paper order books and telephone ledgers for commercial and residential bulk drinking water distributors.

Built with **React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, and Supabase PostgreSQL Schema Integration**, the system provides end-to-end automation for customer ordering, real-time dispatch, reusable 20-Litre jar balancing, customer dues accounting, dynamic product pricing with price-snapshot protection, delivery driver mobile management, daily closing reports, and tamper-evident audit trails.

---

## 🌟 Key Features by System Module

### 1. Customer Ordering Portal (Part 1)
- **Zero-Friction Guest Checkout**: Customers can place orders without creating an account or memorizing passwords.
- **Product Catalogue**:
  - *Kulick Fresh – 20 Litre Jar*: ₹40 (Ozonized & UV Purified)
  - *Bisleri – 20 Litre Jar*: ₹95 (With Added Minerals)
  - *Save Life – 20 Litre Jar*: ₹45 (Configurable RO Spring Water)
  - *Bisleri – 1 Litre Case*: ₹240 (Shrink-wrapped box of 12 x 1L bottles)
  - *Bisleri – 2 Litre Case*: ₹270 (Heavy-duty carton of 9 x 2L bottles)
- **Realistic Vector Product Graphics**: Crisp, branded 20L jars and boxed case illustrations.
- **Customer Order Form**: Validated 10-digit mobile number, full street address, nearby landmark, and special instructions.
- **Unique Order ID Generation**: E.g., `ORD-20261111-XXXX`.
- **Celebratory Confetti & Instant Owner Visibility**.
- **Real-Time Logistics Tracker**: Stepper progress (Order Placed → Confirmed by Hub → Out for Delivery → Delivered) accessible via Order ID + Mobile number.

### 2. Owner Executive Dashboard (Part 2)
- **Top 8 KPI Metric Cards**:
  1. *Today's Orders*
  2. *New Orders (Pending Confirmation)*
  3. *Pending Deliveries (In Transit)*
  4. *Completed Deliveries (Lifetime)*
  5. *Total Customer Accounts*
  6. *Total Revenue Collected (Actual verified payments)*
  7. *Outstanding Customer Dues (Total system balance)*
  8. *Outstanding Jar Count (Total 20L jars currently with customers)*
- **Complete Order Management Console**:
  - Search by Order ID, customer name, mobile number, or address.
  - Multi-status filter: `New`, `Confirmed`, `Out for Delivery`, `Delivered`, `Failed`, `Cancelled`.
  - Date range filters: `Today`, `Yesterday`, `Last 7 Days`, `All Dates`.
  - Quick action controls: Confirm order, Assign driver, Edit address/instructions, Cancel order with audit reason.

### 3. Individual Customer Financial Ledger (Part 3)
- **Chronological Double-Entry Ledger**:
  - Maintains immutable historical transactions (`Debit`, `Credit`, `Running Balance`).
  - Historical records are never overwritten.
- **Customer Profile View (Matches Rahul Sharma Specification)**:
  - Header: Name, Mobile (+91 9876543210), Address (Salt Lake, Kolkata), Account Status.
  - Financial Summary: *Previous Due*, *New Orders*, *Total Payments*, *Current Due*.
  - Jar Summary: *Previous Jar Balance*, *New Jars Delivered*, *Empty Jars Returned*, *Current Jar Balance*.
- **Integrated Customer Actions**:
  - Record payments with method selector (`Cash`, `UPI`, `Bank Transfer`, `Other`), reference number, and notes.
  - Add manual dues with reasons (e.g., jar breakage fee, opening balance).
  - Download Official PDF Statement with company branding, summary boxes, and table.
  - Edit customer profile details.

### 4. Individual 20L Jar Inventory Management (Part 4)
- **Strict Decoupling of Money and Jars**: Jars and currency are tracked in separate ledgers.
- **Core Formula**:
  $$\text{Current Outstanding Jars} = \text{Previous Balance} + \text{Jars Delivered} - \text{Empty Jars Returned}$$
- **Delivery Driver Integration**: Delivery personnel record actual jars dropped off and empty jars collected at the doorstep, instantly adjusting customer jar balance.
- **Manual Jar Adjustment**: Authorized owner adjustments with audit logging.

### 5. Dynamic Product Pricing (Part 5)
- **Price Management Console**: Update rates, add new items, or disable unavailable products.
- **CRITICAL ARCHITECTURAL SAFEGUARD — Price Snapshot Protection**:
  - Orders permanently store an immutable unit price snapshot (`priceAtOrder`).
  - Price revisions affect **only new orders placed after the change**.
  - Previous invoices, order subtotals, and customer dues are **never recalculated** upon price edits.
- **Price History Audit Trail**: Tracks Previous Price, New Price, Timestamp, Admin Name, and Reason.

### 6. Delivery Driver Mobile Dashboard (Part 6)
- **Streamlined Mobile Interface**: Designed for one-thumb use on smartphones in bright daylight.
- **Role Scoping**: Delivery personnel only see runs assigned to them.
- **One-Touch Actions**: Click-to-Call customer (`tel:`) and Click-to-Navigate (`Google Maps`).
- **Proof of Delivery Workflow**:
  - Record actual delivered jars and empty jars collected.
  - Record payment collected (`Cash`, `UPI`, `Other`) or deliver on account.
  - Delivery failure mode with specific failure reasons (preserves jar and financial balances).

### 7. Important Business Precautions (Part 7)
- **Duplicate Order Protection**: Double-click button locking and client-side idempotency tokens.
- **Payment Protection**: Never marks an order paid automatically on delivery unless payment is verified. Supports partial payments.
- **Delivery Protection**: Failed deliveries do not alter jar counts or monetary debts.
- **Customer Unification**: Identifies recurring customers by 10-digit mobile number, preventing duplicate profiles.
- **Disaster Recovery**: One-click JSON database export and backup restore.

### 8. Daily Closing Report (Part 8)
- Date-picker selector for any business day.
- Detailed revenue breakdown: Cash Collected vs. UPI Collected vs. Bank Transfers.
- Jar circulation metrics: Delivered vs. Recovered empties.
- **Export to CSV / Excel** and clean printer-ready layout.

### 9. Permanent Activity Audit Log (Part 9)
- Immutable audit log of all price updates, manual dues, payment entries, cancellations, and driver assignments.

### 10. Security & Database Architecture (Part 11)
- Complete Supabase PostgreSQL schema provided in `src/supabase/migrations/20261111000000_water_distribution_schema.sql`.
- Row Level Security (RLS) policies for Owner, Delivery Drivers, and Public guests.
- ACID-compliant atomic state updates.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18, v20, or v22+)
- npm

### 1. Installation
```bash
git checkout feature/business-management-improvements
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Verification
```bash
npm run build
```

### 4. Run Automated Scenario Test Suite
```bash
node scripts/test_system.mjs
```

---

## 🧪 Verified Test Scenarios (Part 12)

| Scenario | Objective | Status |
| :--- | :--- | :---: |
| **Scenario 1** | Customer places order → Owner confirms & assigns driver → Driver delivers jars & collects cash → Jar balance & customer dues update atomically. | **PASS** |
| **Scenario 2** | Owner updates product price → New orders use new price → Past orders retain original snapshot prices with zero recalculation. | **PASS** |
| **Scenario 3** | Customer makes partial payment → Customer balance decreases by exact credit; remaining due is preserved. | **PASS** |
| **Scenario 4** | Delivery driver marks delivery as Failed → No jars delivered or collected are recorded; customer dues remain unchanged. | **PASS** |
| **Scenario 5** | Multiple orders placed with the same 10-digit phone number → Automatically unified under one customer ledger. | **PASS** |
| **Scenario 6** | Role enforcement: Delivery personnel are prevented from accessing owner financial ledgers or product pricing. | **PASS** |
| **Scenario 7** | Idempotency protection: Network retries or double-click form submissions do not generate duplicate orders. | **PASS** |

---

## 👥 Role Profiles for Testing & Evaluation

Use the **Role Switcher Pill** in the top navigation bar to seamlessly simulate user roles:

1. **Customer (Guest)**: Public water ordering, cart management, checkout form, and live order tracking.
2. **Owner Admin**: Unrestricted command center access across orders, financial ledgers, dynamic pricing, and closing reports.
3. **Ramesh Kumar (Van 1)**: Mobile delivery driver view for assigned routes.
4. **Suresh Verma (Bike 2)**: Mobile delivery driver view for two-wheeler runs.

---

## 🗄️ Database Architecture & Migrations

For deployment with a live Supabase PostgreSQL backend, execute the migration file located at:
```
src/supabase/migrations/20261111000000_water_distribution_schema.sql
```
This migration script provisions:
- Custom ENUM types (`order_status_enum`, `payment_status_enum`, `user_role_enum`).
- Tables: `profiles`, `products`, `product_price_history`, `customers`, `orders`, `order_items`, `financial_transactions`, `jar_transactions`, and `admin_activity_logs`.
- Foreign key constraints, cascade triggers, and performance B-Tree indexes.
- Row-Level Security (RLS) policies enforcing multi-role data access.
