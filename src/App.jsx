import React, { useState, useEffect } from 'react';
import { Package, User, MapPin, Clock, CheckCircle, XCircle, LogOut, AlertCircle, Bell, TrendingUp, Users, DollarSign, Activity, ShoppingBag, Edit, Trash2, Plus, Upload, X, Mail, MessageSquare, Star, UserCheck } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [smsModal, setSmsModal] = useState(null);
  const [emailModal, setEmailModal] = useState(null);

  const navigate = (view, userData = null, authToken = null) => {
    setCurrentView(view);
    if (userData) {
      setUser(userData);
      setToken(authToken);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setCurrentView('landing');
  };

  const showSMS = (phone, message) => {
    setSmsModal({ phone, message, timestamp: new Date() });
  };

  const showEmail = (to, subject, body) => {
    setEmailModal({ to, subject, body, timestamp: new Date() });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SMS Modal */}
      {smsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-8 h-8 text-blue-500" />
                <h3 className="text-2xl font-bold">SMS Sent</h3>
              </div>
              <button onClick={() => setSmsModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-semibold mb-1">To:</p>
                <p className="font-mono">{smsModal.phone}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-semibold mb-2">Message:</p>
                <p className="text-gray-800">{smsModal.message}</p>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Sent at {smsModal.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-8 h-8 text-red-500" />
                <h3 className="text-2xl font-bold">Email Sent</h3>
              </div>
              <button onClick={() => setEmailModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600 font-semibold mb-1">To:</p>
                <p className="font-mono">{emailModal.to}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-semibold mb-1">Subject:</p>
                <p className="font-bold">{emailModal.subject}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-semibold mb-2">Message:</p>
                <p className="text-gray-800">{emailModal.body}</p>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Sent at {emailModal.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {currentView === 'landing' && <LandingPage navigate={navigate} showSMS={showSMS} showEmail={showEmail} />}
      {currentView === 'customer' && <CustomerDashboard navigate={navigate} user={user} token={token} handleLogout={handleLogout} showSMS={showSMS} showEmail={showEmail} />}
      {currentView === 'rider' && <RiderDashboard navigate={navigate} user={user} token={token} handleLogout={handleLogout} showSMS={showSMS} showEmail={showEmail} />}
      {currentView === 'admin' && <AdminDashboard navigate={navigate} user={user} token={token} handleLogout={handleLogout} />}
    </div>
  );
}

// ============================================
// LANDING PAGE COMPONENT
// ============================================
const LandingPage = ({ navigate, showSMS, showEmail }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'customer',
    confirmPassword: '',
    vehicleType: 'motorcycle'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        const user = data.data.user;
        const token = data.data.token;
        
        if (!isLogin) {
          showEmail(user.email, 'Welcome to FastBite!', `Hi ${user.name}, welcome to FastBite!`);
          showSMS(user.phone, `FastBite: Welcome ${user.name}! Your account has been created.`);
        } else {
          showSMS(user.phone, `FastBite: Welcome back ${user.name}!`);
        }
        
        navigate(user.role, user, token);
      } else {
        setError(data.message || 'An error occurred');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickDemo = (role) => {
    const demoData = {
      customer: { email: 'customer@fastbite.com', password: 'demo123', role: 'customer' },
      rider: { email: 'rider@fastbite.com', password: 'demo123', role: 'rider' },
      admin: { email: 'admin@fastbite.com', password: 'admin123', role: 'admin' }
    };
    setFormData({ ...formData, ...demoData[role] });
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">🍔</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            FastBite
          </h1>
          <p className="text-gray-600">Your favorite food, delivered fast!</p>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg font-bold transition ${
              isLogin ? 'bg-white shadow-md' : 'text-gray-600'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg font-bold transition ${
              !isLogin ? 'bg-white shadow-md' : 'text-gray-600'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </>
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />

          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          )}

          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="customer">Customer</option>
            <option value="rider">Rider</option>
            <option value="admin">Admin</option>
          </select>

                  {!isLogin && formData.role === 'rider' && (
          <select
            value={formData.vehicleType}
            onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="motorcycle">🏍️ Motorcycle</option>
            <option value="bike">🚴 Bike</option>
            <option value="car">🚗 Car</option>
          </select>
        )}

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold hover:shadow-xl transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t-2">
          <p className="text-sm text-gray-500 mb-3 text-center">Quick Demo Access</p>
          <div className="flex space-x-2">
            <button onClick={() => quickDemo('customer')} className="flex-1 bg-orange-100 text-orange-600 py-2 rounded-lg text-xs font-bold hover:bg-orange-200 transition">
              Customer
            </button>
            <button onClick={() => quickDemo('rider')} className="flex-1 bg-blue-100 text-blue-600 py-2 rounded-lg text-xs font-bold hover:bg-blue-200 transition">
              Rider
            </button>
            <button onClick={() => quickDemo('admin')} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition">
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// CUSTOMER DASHBOARD COMPONENT
// ============================================
const CustomerDashboard = ({ user, token, handleLogout, showSMS, showEmail }) => {
  const [activeTab, setActiveTab] = useState('menu');
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newOrder, setNewOrder] = useState({ pickup: '', dropoff: '', notes: '' });

  useEffect(() => {
    fetchMenuItems();
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab]);

  const fetchMenuItems = async () => {
    try {
      const res = await fetch(`${API_URL}/menu`);
      const data = await res.json();
      if (data.success) setMenuItems(data.data.menuItems);
    } catch (err) {
      console.error('Failed to fetch menu');
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setOrders(data.data.orders);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existing = cart.find(i => i.menuItemId === item._id);
    if (existing) {
      setCart(cart.map(i => i.menuItemId === item._id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { menuItemId: item._id, name: item.name, price: item.price, qty: 1 }]);
    }
  };

  const updateCartQty = (menuItemId, qty) => {
    if (qty <= 0) {
      setCart(cart.filter(i => i.menuItemId !== menuItemId));
    } else {
      setCart(cart.map(i => i.menuItemId === menuItemId ? { ...i, qty } : i));
    }
  };

  const placeOrder = async () => {
    if (!newOrder.pickup || !newOrder.dropoff || cart.length === 0) {
      setError('Please fill all fields and add items to cart');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          pickup: newOrder.pickup,
          dropoff: newOrder.dropoff,
          notes: newOrder.notes
        })
      });

      const data = await res.json();
      if (data.success) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0) + 5;
        showEmail(user.email, 'Order Confirmed', `Your order has been placed! Total: $${total.toFixed(2)}`);
        showSMS(user.phone, `FastBite: Order confirmed! We're finding a rider for you.`);
        setCart([]);
        setNewOrder({ pickup: '', dropoff: '', notes: '' });
        setActiveTab('orders');
        fetchOrders();
      }
    } catch (err) {
      setError('Error placing order');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];
  const filteredMenuItems = selectedCategory === 'all' ? menuItems : menuItems.filter(item => item.category === selectedCategory);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Package className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold">Customer Portal</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">{user?.name}</span>
            <button onClick={handleLogout} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab('menu')}
            className={`pb-3 px-4 font-semibold ${activeTab === 'menu' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            Order Food
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 font-semibold ${activeTab === 'orders' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            My Orders
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
            <button onClick={() => setError('')} className="ml-auto">×</button>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4">Menu</h2>
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMenuItems.map(item => (
                  <div key={item._id} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-blue-600">${item.price.toFixed(2)}</span>
                      <button onClick={() => addToCart(item)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                <h3 className="text-xl font-bold mb-4">Your Order</h3>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                      {cart.map(item => (
                        <div key={item.menuItemId} className="flex justify-between items-center border-b pb-2">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button onClick={() => updateCartQty(item.menuItemId, item.qty - 1)} className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300">-</button>
                            <span className="w-6 text-center">{item.qty}</span>
                            <button onClick={() => updateCartQty(item.menuItemId, item.qty + 1)} className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300">+</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-3 mb-4">
                      <div className="flex justify-between mb-2">
                        <span>Subtotal:</span>
                        <span className="font-bold">${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Delivery Fee:</span>
                        <span className="font-bold">$5.00</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-blue-600">${(cartTotal + 5).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newOrder.pickup}
                        onChange={(e) => setNewOrder({...newOrder, pickup: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Pickup address"
                      />
                      <input
                        type="text"
                        value={newOrder.dropoff}
                        onChange={(e) => setNewOrder({...newOrder, dropoff: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Delivery address"
                      />
                      <textarea
                        value={newOrder.notes}
                        onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="2"
                        placeholder="Special instructions"
                      />
                      <button 
                        onClick={placeOrder} 
                        disabled={loading} 
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {loading ? 'Placing...' : 'Place Order'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Order History</h2>
            {orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No orders yet</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order._id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between mb-4">
                    <div>
                      <span className="font-semibold">Order #{order._id.slice(-6)}</span>
                      <span className="ml-2 px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{order.status.toUpperCase()}</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">${order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.qty}x {item.name}</span>
                        <span>${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// RIDER DASHBOARD COMPONENT
// ============================================
const RiderDashboard = ({ user, token, handleLogout, showSMS, showEmail }) => {
  const [activeTab, setActiveTab] = useState('available');
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAvailableOrders(data.data.orders.filter(o => o.status === 'pending'));
        setActiveOrders(data.data.orders.filter(o => o.status !== 'pending' && o.status !== 'delivered' && o.status !== 'cancelled'));
      }
    } catch (err) {
      console.error('Failed to fetch orders');
    }
  };

  const acceptOrder = async (orderId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showSMS(user.phone, `FastBite: You've accepted order #${orderId.slice(-6)}`);
        fetchOrders();
        setActiveTab('active');
      }
    } catch (err) {
      setError('Failed to accept order');
    } finally {
      setLoading(false);
    }
  };

  const pickupOrder = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/pickup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showSMS(user.phone, `FastBite: Order #${orderId.slice(-6)} picked up`);
        fetchOrders();
      }
    } catch (err) {
      setError('Failed to update order');
    }
  };

  const deliverOrder = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/deliver`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showSMS(user.phone, `FastBite: Order #${orderId.slice(-6)} delivered!`);
        fetchOrders();
      }
    } catch (err) {
      setError('Failed to update order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Package className="w-8 h-8" />
            <span className="text-xl font-bold">Rider Portal</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>{user?.name}</span>
            <button onClick={handleLogout} className="flex items-center space-x-2 hover:text-purple-200 transition">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab('available')}
            className={`pb-3 px-4 font-semibold ${activeTab === 'available' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
          >
            Available ({availableOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 px-4 font-semibold ${activeTab === 'active' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
          >
            Active ({activeOrders.length})
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
            <button onClick={() => setError('')} className="ml-auto">×</button>
          </div>
        )}

        {activeTab === 'available' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Available Deliveries</h2>
            {availableOrders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No orders available</p>
              </div>
            ) : (
              availableOrders.map(order => (
                <div key={order._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Order #{order._id.slice(-6)}</h3>
                      <p className="text-2xl font-bold text-purple-600 mt-1">${order.totalAmount.toFixed(2)}</p>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold h-fit">
                      {order.items.length} items
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Pickup</p>
                        <p className="font-medium">{order.pickup.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Dropoff</p>
                        <p className="font-medium">{order.dropoff.address}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => acceptOrder(order._id)}
                    disabled={loading}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                  >
                    Accept Order
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'active' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Active Orders</h2>
            {activeOrders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No active orders</p>
              </div>
            ) : (
              activeOrders.map(order => (
                <div key={order._id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Order #{order._id.slice(-6)}</h3>
                      <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Pickup</p>
                        <p className="font-medium">{order.pickup.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Dropoff</p>
                        <p className="font-medium">{order.dropoff.address}</p>
                      </div>
                    </div>
                  </div>
                  {order.status === 'accepted' && (
                    <button
                      onClick={() => pickupOrder(order._id)}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Mark as Picked Up
                    </button>
                  )}
                  {order.status === 'picked_up' && (
                    <button
                      onClick={() => deliverOrder(order._id)}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// ADMIN DASHBOARD COMPONENT
// ============================================
const AdminDashboard = ({ user, token, handleLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Burgers',
    restaurant: '',
    preparationTime: 15
  });

  useEffect(() => {
    fetchStats();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'menu') fetchMenuItems();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStats(data.data.stats);
    } catch (err) {
      setError('Failed to fetch stats');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setOrders(data.data.orders);
    } catch (err) {
      setError('Failed to fetch orders');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setUsers(data.data.users);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await fetch(`${API_URL}/menu`);
      const data = await res.json();
      if (data.success) setMenuItems(data.data.menuItems);
    } catch (err) {
      setError('Failed to fetch menu');
    }
  };

  const createMenuItem = async () => {
    if (!newMenuItem.name || !newMenuItem.price) {
      setError('Please fill required fields');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newMenuItem,
          price: parseFloat(newMenuItem.price)
        })
      });

      if (res.ok) {
        setNewMenuItem({ name: '', description: '', price: '', category: 'Burgers', restaurant: '', preparationTime: 15 });
        fetchMenuItems();
      }
    } catch (err) {
      setError('Failed to create item');
    }
  };

  const deleteMenuItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await fetch(`${API_URL}/menu/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMenuItems();
    } catch (err) {
      setError('Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Package className="w-8 h-8" />
            <span className="text-xl font-bold">Admin Portal</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>{user?.name}</span>
            <button onClick={handleLogout} className="flex items-center space-x-2 hover:text-blue-100 transition">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex space-x-4 border-b overflow-x-auto pb-2">
          {['dashboard', 'orders', 'users', 'menu'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 font-semibold whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
            <button onClick={() => setError('')} className="ml-auto text-xl">×</button>
          </div>
        )}

        {activeTab === 'dashboard' && stats && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <ShoppingBag className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-3xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Active Orders</p>
                  <Activity className="w-8 h-8 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-yellow-600">{stats.activeOrders}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-600">${stats.totalRevenue}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Active Riders</p>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-purple-600">{stats.activeRiders}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">All Orders</h2>
            {orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No orders found</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order._id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-lg">Order #{order._id.slice(-6)}</span>
                      <span className="ml-3 px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-semibold">
                        {order.status.toUpperCase()}
                      </span>
                      <p className="text-sm text-gray-600 mt-2">Customer: {order.customer?.name}</p>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">User Management</h2>
            {users.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No users found</p>
              </div>
            ) : (
              users.map(u => (
                <div key={u._id} className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-lg">{u.name}</p>
                    <p className="text-sm text-gray-600">{u.email}</p>
                    <p className="text-sm text-gray-500 mt-1">{u.phone}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    u.role === 'rider' ? 'bg-blue-100 text-blue-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {u.role.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'menu' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Menu Management</h2>
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="font-bold text-lg mb-4">Add New Menu Item</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={newMenuItem.name}
                  onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={newMenuItem.price}
                  onChange={(e) => setNewMenuItem({...newMenuItem, price: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newMenuItem.description}
                  onChange={(e) => setNewMenuItem({...newMenuItem, description: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:col-span-2"
                />
                <select
                  value={newMenuItem.category}
                  onChange={(e) => setNewMenuItem({...newMenuItem, category: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Burgers">Burgers</option>
                  <option value="Pizza">Pizza</option>
                  <option value="Pasta">Pasta</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Desserts">Desserts</option>
                </select>
                <button 
                  onClick={createMenuItem} 
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map(item => (
                <div key={item._id} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {item.category}
                      </span>
                      <p className="text-xl font-bold text-blue-600 mt-2">${item.price.toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => deleteMenuItem(item._id)} 
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;