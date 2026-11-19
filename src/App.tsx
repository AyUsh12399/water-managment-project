import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WaterProvider } from './context/WaterContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProductCatalog } from './components/customer/ProductCatalog';
import { CartDrawer } from './components/customer/CartDrawer';
import { OrderCheckoutModal } from './components/customer/OrderCheckoutModal';
import { OrderConfirmationModal } from './components/customer/OrderConfirmationModal';
import { OrderTracker } from './components/customer/OrderTracker';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DeliveryDashboard } from './components/delivery/DeliveryDashboard';
import { Order } from './types';

const MainAppContent: React.FC = () => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<'catalog' | 'track' | 'admin' | 'delivery'>('catalog');
  
  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Preload tracking info
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');
  const [trackingPhone, setTrackingPhone] = useState<string>('');

  const handleOrderSuccess = (order: Order) => {
    setIsCheckoutOpen(false);
    setConfirmedOrder(order);
  };

  const handleTrackOrderFromConfirmation = (orderId: string, phone: string) => {
    setConfirmedOrder(null);
    setTrackingOrderId(orderId);
    setTrackingPhone(phone);
    setActiveTab('track');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-ocean-100 selection:text-ocean-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setIsCartOpen={setIsCartOpen}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'catalog' && (
          <ProductCatalog
            onOpenCheckout={() => {
              setIsCartOpen(false);
              setIsCheckoutOpen(true);
            }}
          />
        )}

        {activeTab === 'track' && (
          <OrderTracker
            initialOrderId={trackingOrderId}
            initialPhone={trackingPhone}
          />
        )}

        {activeTab === 'admin' && <AdminDashboard />}

        {activeTab === 'delivery' && <DeliveryDashboard />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Order Form Modal */}
      <OrderCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Confirmation Screen */}
      <OrderConfirmationModal
        order={confirmedOrder}
        isOpen={!!confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onTrackOrder={handleTrackOrderFromConfirmation}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <WaterProvider>
        <MainAppContent />
      </WaterProvider>
    </AuthProvider>
  );
}
