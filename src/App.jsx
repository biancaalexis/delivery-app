import React, { useState, useEffect } from 'react';
import { Package, User, MapPin, Clock, CheckCircle, XCircle, LogOut, AlertCircle, Bell, TrendingUp, Users, DollarSign, Activity, ShoppingBag, Edit, Trash2, Plus, Upload, X, Mail, MessageSquare, Star, UserCheck, Navigation, ChefHat, Bike, Phone } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';
const WS_URL = 'ws://localhost:5000';


function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [smsModal, setSmsModal] = useState(null);
  const [emailModal, setEmailModal] = useState(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    if (token && user) {
      const websocket = new WebSocket(WS_URL);
      
      websocket.onopen = () => {
        console.log('WebSocket connected');
        websocket.send(JSON.stringify({ type: 'auth', token, userId: user._id }));
      };
      
      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);
      };
      
      websocket.onerror = (error) => {
        console.log('WebSocket error:', error);
      };
      
      setWs(websocket);
      
      return () => {
        if (websocket) websocket.close();
      };
    }
  }, [token, user]);

const navigate = (view, userData = null, authToken = null) => {
    setCurrentView(view);
    if (userData) {
      // CRITICAL FIX: Backend returns 'id' but we need '_id' throughout the app
      if (userData.id && !userData._id) {
        userData._id = userData.id;
      }
      setUser(userData);
      setToken(authToken);
    }
  };

  const handleLogout = () => {
    if (ws) ws.close();
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
      {smsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-8 h-8 text-blue-500" />
                <h3 className="text-2xl font-bold">SMS Notification</h3>
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

      {currentView === 'landing' && <LandingPage navigate={navigate} showSMS={showSMS} showEmail={showEmail} />}
      {currentView === 'customer' && <CustomerDashboard navigate={navigate} user={user} token={token} handleLogout={handleLogout} showSMS={showSMS} showEmail={showEmail} ws={ws} />}
      {currentView === 'rider' && <RiderDashboard navigate={navigate} user={user} token={token} handleLogout={handleLogout} showSMS={showSMS} showEmail={showEmail} ws={ws} />}
      {currentView === 'admin' && <AdminDashboard navigate={navigate} user={user} token={token} handleLogout={handleLogout} />}
    </div>
  );
}

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
          showEmail(user.email, 'Welcome to FastBite!', `Hi ${user.name}, welcome to FastBite! Your ${user.role} account has been created successfully.`);
          showSMS(user.phone, `FastBite: Welcome ${user.name}! Your ${user.role} account is ready. Start ordering now!`);
        } else {
          showSMS(user.phone, `FastBite: Welcome back ${user.name}! You're now logged in.`);
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">FastBite</h1>
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
      const res = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Ensure all orders have status field (fix for MongoDB not returning it)
        const ordersWithStatus = data.data.orders.map(order => ({
          ...order,
          status: order.status || 'pending' // Fallback if status is missing
        }));
        
        console.log('=== RIDER FETCH ORDERS DEBUG ===');
        console.log('📦 Total orders received:', ordersWithStatus.length);
        console.log('👤 My user ID:', user._id || user.id);
        console.log('\n🔍 Analyzing each order:');
        ordersWithStatus.forEach((o, idx) => {
          console.log(`\nOrder ${idx + 1}:`);
          console.log('  - Order ID:', o._id?.slice(-6));
          console.log('  - Status:', o.status);
          console.log('  - Rider field:', o.rider);
          console.log('  - Rider type:', typeof o.rider);
          if (o.rider) {
            const riderId = typeof o.rider === 'object' ? (o.rider._id || o.rider.id) : o.rider;
            console.log('  - Extracted Rider ID:', riderId);
            console.log('  - Match?', riderId === (user._id || user.id));
          }
        });
        setOrders(ordersWithStatus);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
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
    if (!newMenuItem.name || !newMenuItem.price || !newMenuItem.restaurant) {
      setError('Please fill required fields');
      return;
    }

    setLoading(true);
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
        setError('');
        await fetchMenuItems();
      }
    } catch (err) {
      setError('Failed to create item');
    } finally {
      setLoading(false);
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
                        {order.status.toUpperCase().replace('_', ' ')}
                      </span>
                      <p className="text-sm text-gray-600 mt-2">Customer: {order.customer?.name}</p>
                      {order.rider && (
                        <p className="text-sm text-gray-600">Rider: {order.rider.name}</p>
                      )}
                    </div>
                    <span className="text-2xl font-bold text-orange-600">${(order.totalAmount || 0).toFixed(2)}</span>
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
                  placeholder="Item Name *"
                  value={newMenuItem.name}
                  onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price *"
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
                <input
                  type="text"
                  placeholder="Restaurant Name *"
                  value={newMenuItem.restaurant}
                  onChange={(e) => setNewMenuItem({...newMenuItem, restaurant: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={newMenuItem.category}
                  onChange={(e) => setNewMenuItem({...newMenuItem, category: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Burgers">Burgers</option>
                  <option value="Pizza">Pizza</option>
                  <option value="Pasta">Pasta</option>
                  <option value="Appetizers">Appetizers</option>
                  <option value="Salads">Salads</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Mexican">Mexican</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Beverages">Beverages</option>
                </select>
                <button 
                  onClick={createMenuItem}
                  disabled={loading}
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                  <span>{loading ? 'Adding...' : 'Add Item'}</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.length === 0 ? (
                <div className="col-span-full bg-white rounded-xl shadow-md p-12 text-center">
                  <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">No menu items yet</p>
                </div>
              ) : (
                menuItems.map(item => (
                  <div key={item._id} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.restaurant}</p>
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
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CustomerDashboard = ({ user, token, handleLogout, showSMS, showEmail, ws }) => {
  const [activeTab, setActiveTab] = useState('menu');
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newOrder, setNewOrder] = useState({ pickup: '', dropoff: '', notes: '' });
  const [ratingModal, setRatingModal] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);

  useEffect(() => {
    fetchMenuItems();
    if (activeTab !== 'menu') {
      fetchOrders();
    }
    
    const interval = setInterval(() => {
      if (activeTab !== 'menu') {
        fetchOrders();
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'order-accepted') {
          fetchOrders();
          showSMS(user.phone, `FastBite: Rider ${data.riderName} accepted your order! They're heading to pickup.`);
        } else if (data.type === 'order-picked-up') {
          fetchOrders();
          showSMS(user.phone, `FastBite: Your order is picked up and on the way! ETA: 15-20 mins.`);
        } else if (data.type === 'order-delivered') {
          fetchOrders();
          showSMS(user.phone, `FastBite: Your order has been delivered! Enjoy your meal and please rate your experience.`);
        }
      };
    }
  }, [ws, user]);

  const fetchMenuItems = async () => {
    try {
      const res = await fetch(`${API_URL}/menu`);
      const data = await res.json();
      if (data.success) setMenuItems(data.data.menuItems);
    } catch (err) {
      setError('Failed to fetch menu');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setOrders(data.data.orders);
    } catch (err) {
      console.error('Failed to fetch orders');
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
        showEmail(user.email, 'Order Confirmed', `Your order has been placed successfully! Total: ${total.toFixed(2)}. We're finding a rider for you.`);
        showSMS(user.phone, `FastBite: Order #${data.data.order._id.slice(-6)} placed! Total: ${total.toFixed(2)}. Finding a rider...`);
        setCart([]);
        setNewOrder({ pickup: '', dropoff: '', notes: '' });
        setActiveTab('pending');
        fetchOrders();
      }
    } catch (err) {
      setError('Error placing order');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ reason: 'Customer requested cancellation' })
      });
      if (res.ok) {
        showSMS(user.phone, `FastBite: Order #${orderId.slice(-6)} cancelled. Refund will be processed within 3-5 business days.`);
        setCancelModal(null);
        fetchOrders();
      }
    } catch (err) {
      setError('Failed to cancel order');
    }
  };

  const submitRating = async (orderId, rating, comment) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });
      if (res.ok) {
        showSMS(user.phone, `FastBite: Thank you for your ${rating}-star rating! Your feedback helps us improve.`);
        setRatingModal(null);
        fetchOrders();
      }
    } catch (err) {
      setError('Failed to submit rating');
    }
  };

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];
  const filteredMenuItems = selectedCategory === 'all' ? menuItems : menuItems.filter(item => item.category === selectedCategory);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeOrders = orders.filter(o => ['accepted', 'picked_up'].includes(o.status));
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Package className="w-8 h-8 text-orange-600" />
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

      {ratingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Rate Your Order</h3>
            <RatingForm 
              onSubmit={(rating, comment) => submitRating(ratingModal, rating, comment)}
              onClose={() => setRatingModal(null)}
            />
          </div>
        </div>
      )}

      {cancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Cancel Order?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to cancel this order? Your refund will be processed within 3-5 business days.</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setCancelModal(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
              >
                Keep Order
              </button>
              <button 
                onClick={() => cancelOrder(cancelModal)}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex space-x-2 border-b overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('menu')}
            className={`pb-3 px-4 font-semibold whitespace-nowrap flex items-center space-x-1 ${activeTab === 'menu' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-600'}`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Order Food</span>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-4 font-semibold whitespace-nowrap flex items-center space-x-1 ${activeTab === 'pending' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-600'}`}
          >
            <Clock className="w-4 h-4" />
            <span>Pending ({pendingOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 px-4 font-semibold whitespace-nowrap flex items-center space-x-1 ${activeTab === 'active' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-600'}`}
          >
            <Bike className="w-4 h-4" />
            <span>Active ({activeOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('delivered')}
            className={`pb-3 px-4 font-semibold whitespace-nowrap flex items-center space-x-1 ${activeTab === 'delivered' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-600'}`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Delivered ({deliveredOrders.length})</span>
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
                    className={`px-4 py-2 rounded-full whitespace-nowrap ${selectedCategory === cat ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMenuItems.length === 0 ? (
                  <div className="col-span-full bg-white rounded-xl shadow-md p-12 text-center">
                    <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">No menu items available</p>
                  </div>
                ) : (
                  filteredMenuItems.map(item => (
                    <div key={item._id} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-xs text-gray-500 mb-1">{item.restaurant}</p>
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-orange-600">${item.price.toFixed(2)}</span>
                        <button onClick={() => addToCart(item)} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition">
                          Add
                        </button>
                      </div>
                    </div>
                  ))
                )}
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
                        <span className="text-orange-600">${(cartTotal + 5).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newOrder.pickup}
                        onChange={(e) => setNewOrder({...newOrder, pickup: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Pickup address"
                      />
                      <input
                        type="text"
                        value={newOrder.dropoff}
                        onChange={(e) => setNewOrder({...newOrder, dropoff: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Delivery address"
                      />
                      <textarea
                        value={newOrder.notes}
                        onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        rows="2"
                        placeholder="Special instructions"
                      />
                      <button 
                        onClick={placeOrder} 
                        disabled={loading} 
                        className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50"
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

        {activeTab === 'pending' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Pending Orders</h2>
            {pendingOrders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No pending orders</p>
                <p className="text-sm text-gray-500 mt-2">Your new orders will appear here</p>
              </div>
            ) : (
              pendingOrders.map(order => (
                <div key={order._id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between mb-4">
                    <div>
                      <span className="font-semibold">Order #{order._id.slice(-6)}</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        FINDING RIDER
                      </span>
                      <p className="text-sm text-gray-600 mt-2 flex items-center">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Placed {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">${order.totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-green-600 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Pickup</p>
                        <p className="text-sm font-medium">{order.pickup.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-red-600 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Delivery</p>
                        <p className="text-sm font-medium">{order.dropoff.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-3 mb-4">
                    <p className="text-sm font-semibold mb-2">Items:</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm mb-1">
                        <span>{item.qty}x {item.name}</span>
                        <span>${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg mb-3 flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-yellow-600 animate-pulse" />
                    <p className="text-sm text-yellow-800">Searching for available riders in your area...</p>
                  </div>

                  <button 
                    onClick={() => setCancelModal(order._id)}
                    className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    Cancel Order
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
                      <span className="font-semibold">Order #{order._id.slice(-6)}</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status === 'accepted' ? 'RIDER EN ROUTE TO PICKUP' : 'OUT FOR DELIVERY'}
                      </span>
                      {order.rider && (
                        <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <UserCheck className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-bold">Your Rider</span>
                          </div>
                          <p className="text-sm font-medium">{order.rider.name}</p>
                          <p className="text-xs text-gray-600">{order.rider.vehicleType}</p>
                          {order.rider.phone && (
                            <div className="flex items-center space-x-1 mt-2">
                              <Phone className="w-3 h-3 text-gray-500" />
                              <p className="text-xs text-gray-600">{order.rider.phone}</p>
                            </div>
                          )}
                          {order.rider.rating && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <p className="text-xs text-gray-600">{order.rider.rating} rating</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-2xl font-bold text-orange-600">${order.totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === 'accepted' ? 'bg-blue-500' : 'bg-green-500'}`}>
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Order Accepted</p>
                          <p className="text-xs text-gray-600">{new Date(order.acceptedAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === 'picked_up' ? 'bg-blue-500' : 'bg-gray-300'}`}>
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Picked Up</p>
                          <p className="text-xs text-gray-600">
                            {order.status === 'picked_up' && order.pickedUpAt ? new Date(order.pickedUpAt).toLocaleTimeString() : 'Heading to pickup'}
                          </p>
                        </div>
                      </div>
                      {order.status === 'picked_up' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-300">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Arriving Soon</p>
                          <p className="text-xs text-gray-600">Estimated 15-20 mins</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-green-600 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Pickup</p>
                        <p className="text-sm font-medium">{order.pickup.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-red-600 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Delivery</p>
                        <p className="text-sm font-medium">{order.dropoff.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-sm font-semibold mb-2">Items:</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm mb-1">
                        <span>{item.qty}x {item.name}</span>
                        <span>${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {order.status === 'picked_up' && (
                    <div className="mt-4 bg-green-50 p-3 rounded-lg flex items-center space-x-2">
                      <Bike className="w-5 h-5 text-green-600 animate-pulse" />
                      <p className="text-sm text-green-800 font-medium">Your order is on the way to you!</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'delivered' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Delivered Orders</h2>
            {deliveredOrders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No delivered orders yet</p>
              </div>
            ) : (
              deliveredOrders.map(order => (
                <div key={order._id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between mb-4">
                    <div>
                      <span className="font-semibold">Order #{order._id.slice(-6)}</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        DELIVERED
                      </span>
                      {order.rider && (
                        <p className="text-sm text-gray-600 mt-2 flex items-center">
                          <UserCheck className="w-4 h-4 inline mr-1" />
                          Delivered by: {order.rider.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.deliveredAt || order.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-green-600">${order.totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-green-600 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Delivered to</p>
                        <p className="text-sm font-medium">{order.dropoff.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-3 mb-4">
                    <p className="text-sm font-semibold mb-2">Items:</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm mb-1">
                        <span>{item.qty}x {item.name}</span>
                        <span>${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {!order.rating ? (
                    <button 
                      onClick={() => setRatingModal(order._id)}
                      className="w-full bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center justify-center space-x-2"
                    >
                      <Star className="w-4 h-4" />
                      <span>Rate This Order</span>
                    </button>
                  ) : (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold mb-2">Your Rating:</p>
                      <div className="flex items-center space-x-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-5 h-5 ${i < order.rating.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                        ))}
                        <span className="ml-2 font-bold text-gray-700">{order.rating.rating}/5</span>
                      </div>
                      {order.rating.comment && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{order.rating.comment}"</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">Thank you for your feedback!</p>
                    </div>
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

const RatingForm = ({ onSubmit, onClose }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div>
      <p className="text-center text-gray-600 mb-4">How was your delivery experience?</p>
      <div className="flex justify-center space-x-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star className={`w-10 h-10 ${star <= (hoveredRating || rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <p className="text-center text-sm text-gray-600 mb-4">
          {rating === 1 && "We're sorry to hear that. We'll do better."}
          {rating === 2 && "Thank you for your feedback."}
          {rating === 3 && "Good! We appreciate your feedback."}
          {rating === 4 && "Great! Thanks for your rating."}
          {rating === 5 && "Excellent! We're glad you loved it!"}
        </p>
      )}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 mb-4"
        rows="3"
        placeholder="Tell us more about your experience (optional)..."
      />
      <div className="flex space-x-3">
        <button 
          onClick={onClose}
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
        >
          Cancel
        </button>
        <button 
          onClick={() => onSubmit(rating, comment)}
          disabled={rating === 0}
          className="flex-1 bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50"
        >
          Submit Rating
        </button>
      </div>
    </div>
  );
};

const RiderDashboard = ({ user, token, handleLogout, showSMS, showEmail, ws }) => {
  const [activeTab, setActiveTab] = useState('available');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Rider received WebSocket message:', data);
        
        if (data.type === 'new-order-available') {
          showSMS(user.phone, `FastBite: New order available! Pickup: ${data.pickup.slice(0, 30)}... Earn: $${data.estimatedEarnings}`);
          setSuccessMessage('🔔 New order available!');
          setTimeout(() => setSuccessMessage(''), 3000);
          fetchOrders();
        } else if (data.type === 'order-accepted' && data.riderId === (user._id || user.id)) {
          setSuccessMessage('✅ Order accepted! Navigate to pickup location.');
          setTimeout(() => setSuccessMessage(''), 4000);
          fetchOrders();
          setActiveTab('active');
        } else if (data.type === 'order-picked-up' && data.riderId === (user._id || user.id)) {
          setSuccessMessage('📦 Order picked up! Now deliver to customer.');
          setTimeout(() => setSuccessMessage(''), 4000);
          fetchOrders();
        } else if (data.type === 'order-delivered' && data.riderId === (user._id || user.id)) {
          setSuccessMessage('🎉 Order delivered! Great job!');
          setTimeout(() => {
            setSuccessMessage('');
            setActiveTab('completed');
          }, 2000);
          fetchOrders();
        } else if (data.type === 'order-cancelled' && data.riderId === (user._id || user.id)) {
          setError('Order was cancelled by customer');
          setTimeout(() => setError(''), 4000);
          fetchOrders();
        }
      };
    }
  }, [ws, user]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const acceptOrder = async (orderId) => {
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const responseData = await res.json();
      
      if (res.ok && responseData.success) {
        const acceptedOrder = responseData.data.order;
        
        console.log('✅ Order accepted successfully!');
        console.log('Accepted order data:', acceptedOrder);
        
        showSMS(user.phone, `FastBite: Order #${orderId.slice(-6)} accepted! Navigate to: ${acceptedOrder.pickup.address}`);
        
        setActiveTab('active');
        setSuccessMessage('Order accepted! Loading your delivery...');
        
        setOrders(prevOrders => {
          const updated = prevOrders.map(o => o._id === orderId ? acceptedOrder : o);
          return updated;
        });
        
        setTimeout(async () => {
          await fetchOrders();
          setSuccessMessage('Order accepted! Check the details below.');
          setTimeout(() => setSuccessMessage(''), 3000);
        }, 500);
        
      } else {
        setError(responseData.message || 'Failed to accept order. It may have been taken by another rider.');
        setTimeout(() => setError(''), 4000);
      }
    } catch (err) {
      console.error('Accept order error:', err);
      setError('Failed to accept order');
      setTimeout(() => setError(''), 4000);
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
        const order = orders.find(o => o._id === orderId);
        showSMS(user.phone, `FastBite: Order #${orderId.slice(-6)} picked up! Deliver to: ${order?.dropoff.address}`);
        setSuccessMessage('Order picked up! Now deliver to customer.');
        setTimeout(() => setSuccessMessage(''), 3000);
        await fetchOrders();
      }
    } catch (err) {
      setError('Failed to update order');
      setTimeout(() => setError(''), 4000);
    }
  };

  const deliverOrder = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/deliver`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const order = orders.find(o => o._id === orderId);
        const earnings = ((order?.totalAmount || 0) * 0.2);
        showSMS(user.phone, `FastBite: Order #${orderId.slice(-6)} delivered! You earned $${earnings.toFixed(2)}. Great job!`);
        setSuccessMessage(`Delivery complete! You earned $${earnings.toFixed(2)}`);
        await fetchOrders();
        setTimeout(() => {
          setSuccessMessage('');
          setActiveTab('completed');
        }, 2000);
      }
    } catch (err) {
      setError('Failed to update order');
      setTimeout(() => setError(''), 4000);
    }
  };

  // Filter orders
  const availableOrders = orders.filter(o => o.status === 'pending' && !o.rider);
  
  const activeOrders = orders.filter(o => {
    if (!['accepted', 'picked_up'].includes(o.status)) return false;
    if (!o.rider) return false;
    
    const riderId = typeof o.rider === 'object' ? (o.rider._id || o.rider.id) : o.rider;
    const myId = user._id || user.id;
    return riderId === myId;
  });
  
  const completedOrders = orders.filter(o => {
    if (o.status !== 'delivered') return false;
    if (!o.rider) return false;
    
    const riderId = typeof o.rider === 'object' ? (o.rider._id || o.rider.id) : o.rider;
    const myId = user._id || user.id;
    return riderId === myId;
  });

  // Calculate statistics with STRICT safety checks
  const todayEarnings = completedOrders
    .filter(o => new Date(o.deliveredAt || o.updatedAt).toDateString() === new Date().toDateString())
    .reduce((sum, o) => {
      const amount = typeof o.totalAmount === 'number' ? o.totalAmount : 0;
      return sum + (amount * 0.2);
    }, 0);
  
  const totalEarnings = completedOrders.reduce((sum, o) => {
    const amount = typeof o.totalAmount === 'number' ? o.totalAmount : 0;
    return sum + (amount * 0.2);
  }, 0);
  
  const ratedOrders = completedOrders.filter(o => o.rating);
  const avgRating = ratedOrders.length > 0
    ? (ratedOrders.reduce((sum, o) => sum + (o.rating?.rating || 0), 0) / ratedOrders.length).toFixed(1)
    : 'N/A';

  // Debug: Log any orders with missing totalAmount
  completedOrders.forEach(o => {
    if (typeof o.totalAmount !== 'number') {
      console.error('⚠️ ORDER WITH INVALID totalAmount:', {
        orderId: o._id,
        totalAmount: o.totalAmount,
        type: typeof o.totalAmount,
        status: o.status,
        fullOrder: o
      });
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bike className="w-8 h-8" />
            <span className="text-xl font-bold">Rider Portal</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs opacity-90">{user?.vehicleType}</p>
            </div>
            <button onClick={handleLogout} className="flex items-center space-x-2 hover:text-purple-200 transition">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <span className="text-xs text-gray-500">Today</span>
            </div>
            <p className="text-2xl font-bold text-green-600">${todayEarnings.toFixed(2)}</p>
            <p className="text-xs text-gray-600">Earned Today</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-6 h-6 text-purple-500" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">${totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-gray-600">Total Earned</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-6 h-6 text-blue-500" />
              <span className="text-xs text-gray-500">Count</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{completedOrders.length}</p>
            <p className="text-xs text-gray-600">Deliveries</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-6 h-6 text-yellow-500" />
              <span className="text-xs text-gray-500">Rating</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600 flex items-center">
              {avgRating}
              {avgRating !== 'N/A' && <Star className="w-4 h-4 ml-1 fill-yellow-600" />}
            </p>
            <p className="text-xs text-gray-600">{ratedOrders.length} reviews</p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center animate-pulse">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-2xl leading-none">×</button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex space-x-2 border-b overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('available')}
            className={`pb-3 px-4 font-semibold whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'available' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Available</span>
            {availableOrders.length > 0 && (
              <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">
                {availableOrders.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 px-4 font-semibold whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'active' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Active</span>
            {activeOrders.length > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 animate-pulse">
                {activeOrders.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-3 px-4 font-semibold whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'completed' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Completed</span>
          </button>
        </div>

        {/* Available Orders Tab */}
        {activeTab === 'available' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Available Deliveries</h2>
              {availableOrders.length > 0 && (
                <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow">
                  {availableOrders.length} order{availableOrders.length !== 1 ? 's' : ''} available
                </span>
              )}
            </div>
            
            {availableOrders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg font-medium">No orders available</p>
                <p className="text-sm text-gray-500 mt-2">New orders will appear here automatically</p>
                <div className="mt-4 flex items-center justify-center space-x-2 text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span className="text-sm">Listening for new orders...</span>
                </div>
              </div>
            ) : (
              availableOrders.map(order => (
                <div key={order._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-2 border-transparent hover:border-purple-200">
                  <div className="flex justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-bold">Order #{order._id.slice(-6)}</h3>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold animate-pulse">
                          NEW
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                        <User className="w-4 h-4" />
                        <span>{order.customer?.name}</span>
                        {order.customer?.phone && (
                          <>
                            <Phone className="w-3 h-3 ml-2" />
                            <span className="text-xs">{order.customer.phone}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-3xl font-bold text-purple-600">${((order.totalAmount || 0)).toFixed(2)}</p>
                          <p className="text-xs text-gray-500">Order total</p>
                        </div>
                        <div className="h-12 w-px bg-gray-300"></div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">${(((order.totalAmount || 0)) * 0.2).toFixed(2)}</p>
                          <p className="text-xs text-gray-500">Your earnings</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </span>
                      <div className="text-right text-xs text-gray-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Posted {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  {/* Route Preview */}
                  <div className="bg-gradient-to-r from-green-50 to-red-50 rounded-lg p-4 mb-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div className="w-0.5 h-8 bg-gray-300 my-1"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-green-700 mb-1">PICKUP LOCATION</p>
                          <p className="font-medium text-sm">{order.pickup.address}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center py-1">
                        <Navigation className="w-4 h-4 text-blue-500" />
                        <span className="text-xs text-gray-600 ml-2 font-medium">Estimated: 2.5 km • 8 mins drive</span>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-red-700 mb-1">DELIVERY LOCATION</p>
                          <p className="font-medium text-sm">{order.dropoff.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold mb-3 text-gray-700">Order Items:</p>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                              {item.qty}
                            </span>
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <span className="text-gray-600">${((item.price || 0) * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    {order.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-semibold text-yellow-700 mb-1">Special Instructions:</p>
                        <p className="text-sm text-gray-700 italic">"{order.notes}"</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => acceptOrder(order._id)}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-6 h-6" />
                    <span>{loading ? 'Accepting...' : 'Accept Delivery'}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Active Orders Tab */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Active Deliveries</h2>
            {activeOrders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg font-medium">No active deliveries</p>
                <p className="text-sm text-gray-500 mt-2">Accept an order from the Available tab to get started</p>
              </div>
            ) : (
              activeOrders.map(order => (
                <div key={order._id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
                  <div className="flex justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold mb-2">Order #{order._id.slice(-6)}</h3>
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                        order.status === 'accepted' 
                          ? 'bg-blue-100 text-blue-800 animate-pulse' 
                          : 'bg-purple-100 text-purple-800 animate-pulse'
                      }`}>
                        {order.status === 'accepted' ? 'GO TO PICKUP' : 'DELIVER TO CUSTOMER'}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-purple-600">${((order.totalAmount || 0)).toFixed(2)}</p>
                      <p className="text-sm text-green-600 font-semibold mt-1">
                        You earn: ${(((order.totalAmount || 0)) * 0.2).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm font-bold text-blue-900 mb-2">Customer Information</p>
                    <p className="font-semibold text-lg">{order.customer?.name}</p>
                    {order.customer?.phone && (
                      <a href={`tel:${order.customer.phone}`} className="flex items-center space-x-2 mt-2 text-blue-600 hover:text-blue-800">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm font-medium">{order.customer.phone}</span>
                      </a>
                    )}
                  </div>

                  {/* Progress Tracker */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                    <p className="font-bold mb-4 text-gray-800">Delivery Progress</p>
                    
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-semibold text-sm">Order Accepted</p>
                        <p className="text-xs text-gray-600">{order.acceptedAt ? new Date(order.acceptedAt).toLocaleTimeString() : 'N/A'}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>

                    <div className="ml-5 w-0.5 h-8 bg-gray-300 mb-4"></div>
                    
                    <div className="flex items-center mb-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        order.status === 'picked_up' ? 'bg-blue-500' : 'bg-gray-300'
                      }`}>
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-semibold text-sm">Picked Up Food</p>
                        <p className="text-xs text-gray-600">
                          {order.status === 'picked_up' && order.pickedUpAt 
                            ? new Date(order.pickedUpAt).toLocaleTimeString()
                            : order.status === 'accepted' ? 'Go to pickup location' : 'Completed'}
                        </p>
                      </div>
                      {order.status === 'picked_up' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    </div>

                    <div className="ml-5 w-0.5 h-8 bg-gray-300 mb-4"></div>
                    
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-semibold text-sm">Deliver to Customer</p>
                        <p className="text-xs text-gray-600">
                          {order.status === 'picked_up' ? 'Navigate to delivery location' : 'Waiting...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
                    <div className="flex items-start space-x-3">
                      <MapPin className={`w-5 h-5 mt-1 flex-shrink-0 ${
                        order.status === 'accepted' ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-700">
                            Pickup {order.status !== 'accepted' && '✓'}
                          </p>
                          {order.status === 'accepted' && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-sm mt-1">{order.pickup.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <MapPin className={`w-5 h-5 mt-1 flex-shrink-0 ${
                        order.status === 'picked_up' ? 'text-red-600' : 'text-gray-400'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-700">Delivery</p>
                          {order.status === 'picked_up' && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-semibold animate-pulse">
                              DELIVER HERE
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-sm mt-1">{order.dropoff.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t pt-4 mb-6">
                    <p className="text-sm font-semibold mb-3 text-gray-700">Order Items:</p>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm bg-white p-2 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                              {item.qty}
                            </span>
                            <span>{item.name}</span>
                          </div>
                          <span className="text-gray-600 font-medium">${((item.price || 0) * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    {order.notes && (
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                        <p className="text-xs font-bold text-yellow-800 mb-1">Special Instructions:</p>
                        <p className="text-sm text-gray-700 italic">"{order.notes}"</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {order.status === 'accepted' && (
                    <div className="space-y-3">
                      <button
                        onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(order.pickup.address)}`, '_blank')}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2 shadow-lg"
                      >
                        <Navigation className="w-6 h-6" />
                        <span>Navigate to Pickup</span>
                      </button>
                      <button
                        onClick={() => pickupOrder(order._id)}
                        className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition flex items-center justify-center space-x-2 shadow-lg"
                      >
                        <Package className="w-6 h-6" />
                        <span>Mark as Picked Up</span>
                      </button>
                    </div>
                  )}
                  
                  {order.status === 'picked_up' && (
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-3 flex items-center space-x-3">
                        <Bike className="w-6 h-6 text-green-600 animate-pulse flex-shrink-0" />
                        <p className="text-sm text-green-800 font-semibold">
                          Order picked up! Now deliver to customer.
                        </p>
                      </div>
                      <button
                        onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(order.dropoff.address)}`, '_blank')}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2 shadow-lg"
                      >
                        <Navigation className="w-6 h-6" />
                        <span>Navigate to Customer</span>
                      </button>
                      <button
                        onClick={() => deliverOrder(order._id)}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center space-x-2 shadow-lg"
                      >
                        <CheckCircle className="w-6 h-6" />
                        <span>Mark as Delivered</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Completed Orders Tab */}
        {activeTab === 'completed' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Completed Deliveries</h2>
              {completedOrders.length > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedOrders.length}</p>
                </div>
              )}
            </div>
            
            {completedOrders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg font-medium">No completed deliveries yet</p>
                <p className="text-sm text-gray-500 mt-2">Your delivery history will appear here</p>
              </div>
            ) : (
              completedOrders.map(order => (
                <div key={order._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-bold">Order #{order._id.slice(-6)}</h3>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                          DELIVERED
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Customer: {order.customer?.name}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : new Date(order.updatedAt).toLocaleString()}
                      </p>
                      
                      {/* Rating Display */}
                      {order.rating ? (
                        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-yellow-800 mb-2">Customer Rating:</p>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-5 h-5 ${
                                  i < (order.rating?.rating || 0)
                                    ? 'text-yellow-500 fill-yellow-500' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                            <span className="ml-2 font-bold text-gray-700">{order.rating?.rating || 0}/5</span>
                          </div>
                          {order.rating?.comment && (
                            <div className="mt-2 pt-2 border-t border-yellow-200">
                              <p className="text-sm text-gray-700 italic">"{order.rating.comment}"</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="text-xs text-gray-600 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Waiting for customer rating...
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">${((order.totalAmount || 0)).toFixed(2)}</p>
                      <p className="text-sm text-gray-600 mt-1">Order Total</p>
                      <div className="mt-2 bg-green-100 rounded-lg p-2">
                        <p className="text-xs text-gray-600">You Earned</p>
                        <p className="text-lg font-bold text-green-700">
                          ${(((order.totalAmount || 0)) * 0.2).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Route Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-gray-600">From:</span>
                      <span className="font-medium flex-1">{order.pickup.address}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span className="text-gray-600">To:</span>
                      <span className="font-medium flex-1">{order.dropoff.address}</span>
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div className="mt-4 pt-4 border-t">
                    <details className="cursor-pointer">
                      <summary className="text-sm font-semibold text-gray-700 hover:text-gray-900">
                        View {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </summary>
                      <div className="mt-2 space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-600 flex justify-between">
                            <span>{item.qty}x {item.name}</span>
                            <span>${((item.price || 0) * item.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </details>
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

export default App;