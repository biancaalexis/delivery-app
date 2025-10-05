import React, { useState, useEffect } from 'react';
import { Package, User, MapPin, Clock, CheckCircle, XCircle, LogOut, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [userType, setUserType] = useState(null);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      const role = JSON.parse(savedUser).role;
      setCurrentView(role === 'customer' ? 'customer-dashboard' : 'rider-dashboard');
    }
  }, []);

  const navigate = (view, type = null) => {
    setCurrentView(view);
    if (type) setUserType(type);
    setError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setCurrentView('landing');
  };

  return (
    <div>
      {currentView === 'landing' && <LandingPage navigate={navigate} />}
      {currentView === 'login' && <LoginPage navigate={navigate} userType={userType} setToken={setToken} setUser={setUser} error={error} setError={setError} />}
      {currentView === 'signup' && <SignupPage navigate={navigate} userType={userType} error={error} setError={setError} />}
      {currentView === 'customer-dashboard' && <CustomerDashboard navigate={navigate} token={token} user={user} handleLogout={handleLogout} />}
      {currentView === 'rider-dashboard' && <RiderDashboard navigate={navigate} token={token} user={user} handleLogout={handleLogout} />}
    </div>
  );
}

const LandingPage = ({ navigate }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
      <div className="text-center mb-8">
        <Package className="w-16 h-16 mx-auto text-blue-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">QuickDeliver</h1>
        <p className="text-gray-600">Fast, reliable delivery service</p>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={() => navigate('login', 'customer')}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Continue as Customer
        </button>
        <button
          onClick={() => navigate('login', 'rider')}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
        >
          Continue as Rider
        </button>
      </div>
    </div>
  </div>
);

const LoginPage = ({ navigate, userType, setToken, setUser, error, setError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: userType })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      setToken(data.data.token);
      setUser(data.data.user);

      const dashboard = userType === 'customer' ? 'customer-dashboard' : 'rider-dashboard';
      navigate(dashboard);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <User className={`w-12 h-12 mx-auto mb-4 ${userType === 'customer' ? 'text-blue-600' : 'text-purple-600'}`} />
          <h2 className="text-2xl font-bold text-gray-800 capitalize">{userType} Login</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition ${
              userType === 'customer' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('signup', userType)}
              className={`font-semibold ${userType === 'customer' ? 'text-blue-600' : 'text-purple-600'}`}
            >
              Sign up
            </button>
          </p>
          <button
            onClick={() => navigate('landing')}
            className="mt-4 text-gray-500 text-sm hover:text-gray-700"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

const SignupPage = ({ navigate, userType, error, setError }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: userType })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      navigate('login', userType);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <User className={`w-12 h-12 mx-auto mb-4 ${userType === 'customer' ? 'text-blue-600' : 'text-purple-600'}`} />
          <h2 className="text-2xl font-bold text-gray-800 capitalize">{userType} Sign Up</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              minLength="6"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition ${
              userType === 'customer' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('login', userType)}
              className={`font-semibold ${userType === 'customer' ? 'text-blue-600' : 'text-purple-600'}`}
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const CustomerDashboard = ({ navigate, token, user, handleLogout }) => {
  const [activeTab, setActiveTab] = useState('create');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newOrder, setNewOrder] = useState({
    pickup: '',
    dropoff: '',
    item: '',
    description: ''
  });

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data.data.orders);
      }
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!newOrder.pickup || !newOrder.dropoff || !newOrder.item) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newOrder)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      setNewOrder({ pickup: '', dropoff: '', item: '', description: '' });
      setActiveTab('orders');
      fetchOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-indigo-100 text-indigo-800';
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
            <Package className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">Customer Portal</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-3 px-4 font-semibold transition ${
              activeTab === 'create' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
            }`}
          >
            Create Order
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 font-semibold transition ${
              activeTab === 'orders' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
            }`}
          >
            My Orders
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Delivery</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={newOrder.pickup}
                    onChange={(e) => setNewOrder({...newOrder, pickup: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter pickup location"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Drop-off Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={newOrder.dropoff}
                    onChange={(e) => setNewOrder({...newOrder, dropoff: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter drop-off location"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Category *</label>
                <select
                  value={newOrder.item}
                  onChange={(e) => setNewOrder({...newOrder, item: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  <option value="Food">Food</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Documents">Documents</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={newOrder.description}
                  onChange={(e) => setNewOrder({...newOrder, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Add any special instructions"
                />
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating...' : 'Create Delivery Order'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Order History</h2>
            {loading ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto text-gray-400 animate-spin mb-4" />
                <p className="text-gray-600">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">No orders yet</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg font-semibold text-gray-800">Order #{order._id.slice(-6)}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    {order.rider && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Rider</p>
                        <p className="font-semibold text-gray-800">{order.rider.name}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pickup</p>
                      <p className="font-medium text-gray-800">{order.pickup.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Drop-off</p>
                      <p className="font-medium text-gray-800">{order.dropoff.address}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Item</p>
                      <p className="font-medium text-gray-800">{order.item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">${order.fare.toFixed(2)}</p>
                    </div>
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

const RiderDashboard = ({ navigate, token, user, handleLogout }) => {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const availableRes = await fetch(`${API_BASE_URL}/orders?status=available`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const availableData = await availableRes.json();
      if (availableRes.ok) {
        setAvailableOrders(availableData.data.orders);
      }

      const activeRes = await fetch(`${API_BASE_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const activeData = await activeRes.json();
      if (activeRes.ok) {
        setActiveOrders(activeData.data.orders.filter(o => o.status !== 'delivered'));
      }
    } catch (err) {
      console.error('Failed to fetch orders');
    }
  };

  const handleAccept = async (orderId) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      await fetchOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliver = async (orderId) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/deliver`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      await fetchOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 hover:bg-purple-700 px-4 py-2 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab('available')}
            className={`pb-3 px-4 font-semibold transition ${
              activeTab === 'available' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'
            }`}
          >
            Available Orders ({availableOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 px-4 font-semibold transition ${
              activeTab === 'active' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'
            }`}
          >
            My Active Orders ({activeOrders.length})
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {activeTab === 'available' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Deliveries</h2>
            {availableOrders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">No orders available at the moment</p>
              </div>
            ) : (
              availableOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">Order #{order._id.slice(-6)}</h3>
                      <p className="text-2xl font-bold text-purple-600">${order.fare.toFixed(2)}</p>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                      {order.item.category}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Pickup</p>
                        <p className="font-medium text-gray-800">{order.pickup.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Drop-off</p>
                        <p className="font-medium text-gray-800">{order.dropoff.address}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAccept(order._id)}
                    disabled={loading}
                    className={`w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center space-x-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Accept Order</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'active' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Active Deliveries</h2>
            {activeOrders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">No active deliveries</p>
              </div>
            ) : (
              activeOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-600">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">Order #{order._id.slice(-6)}</h3>
                      <p className="text-xl font-bold text-purple-600">${order.fare.toFixed(2)}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      IN PROGRESS
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Pickup</p>
                        <p className="font-medium text-gray-800">{order.pickup.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Drop-off</p>
                        <p className="font-medium text-gray-800">{order.dropoff.address}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600">Customer</p>
                      <p className="font-medium text-gray-800">{order.customer.name}</p>
                      <p className="text-sm text-gray-500">{order.customer.phone}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeliver(order._id)}
                    disabled={loading}
                    className={`w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center space-x-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Mark as Delivered</span>
                  </button>
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