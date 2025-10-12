# 🍔 FastBite Frontend

React-based food delivery application with real-time updates and responsive design.

## 📦 Installation

### Prerequisites
- Node.js v16+
- npm or yarn
- Backend server running on port 5000

### Install Dependencies

```bash
npm install
```

### Required Packages

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.0"
  }
}
```

## 🚀 Running the Application

### Development Mode
```bash
npm start
```

Opens at: `http://localhost:3000`

### Production Build
```bash
npm run build
```

### Serve Production Build
```bash
npm install -g serve
serve -s build
```

## 📁 Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── App.jsx              # Main application component
│   ├── index.js             # Entry point
│   ├── index.css            # Tailwind CSS imports
│   └── components/          # (Optional) Future components
├── package.json
├── tailwind.config.js       # Tailwind configuration
└── README.md
```

## 🎨 Features

### Customer Portal
- **Menu Browsing**
  - Category filtering
  - Search functionality
  - Item details with pricing
  - Restaurant information

- **Shopping Cart**
  - Add/remove items
  - Quantity adjustment
  - Price calculation
  - Delivery fee display

- **Order Management**
  - Place orders
  - Pickup/delivery addresses
  - Special instructions
  - Order history
  - Real-time status updates

### Rider Portal
- **Order Dashboard**
  - Available orders list
  - Active deliveries
  - Order details (items, addresses)
  - Earnings tracking

- **Order Actions**
  - Accept orders
  - Mark as picked up
  - Mark as delivered
  - Auto-refresh every 5 seconds

### Admin Portal
- **Dashboard**
  - Total orders
  - Active orders
  - Revenue statistics
  - Active riders count

- **Menu Management**
  - Add new items
  - Edit existing items
  - Delete items
  - Sample data generator
  - Category management

- **User Management**
  - View all users
  - User roles
  - Contact information

- **Order Monitoring**
  - View all orders
  - Order status
  - Customer details

## 🔧 Configuration

### API Configuration

Update the API URL in `src/App.jsx`:

```javascript
const API_URL = 'http://localhost:5000/api';

// For production:
// const API_URL = 'https://your-api.com/api';
```

### Tailwind CSS Setup

**tailwind.config.js:**
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 🎯 Component Structure

### Main App Component
```
App
├── LandingPage (Login/Signup)
├── CustomerDashboard
│   ├── Menu Tab
│   │   ├── Category Filter
│   │   ├── Menu Items Grid
│   │   └── Cart Sidebar
│   └── Orders Tab
│       └── Order History
├── RiderDashboard
│   ├── Available Orders Tab
│   └── Active Orders Tab
└── AdminDashboard
    ├── Dashboard Tab
    ├── Orders Tab
    ├── Users Tab
    └── Menu Tab
```

## 🔐 Authentication Flow

### Login Process
1. User enters email, password, and role
2. Frontend sends POST to `/api/auth/login`
3. Receives JWT token and user data
4. Stores token in state
5. Navigates to role-specific dashboard

### Protected Actions
All API calls to protected endpoints include:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

## 📱 User Interface

### Color Scheme
- **Primary:** Blue (#2563EB)
- **Secondary:** Purple (#9333EA)
- **Success:** Green (#16A34A)
- **Warning:** Yellow (#EAB308)
- **Danger:** Red (#DC2626)
- **Customer Theme:** Blue
- **Rider Theme:** Purple
- **Admin Theme:** Blue-Purple Gradient

### Responsive Design
- **Mobile:** Full-width cards, stacked layout
- **Tablet:** 2-column grid
- **Desktop:** 3-column grid, sidebar layout

## 🔔 Real-time Features

### SMS/Email Notifications
```javascript
// Display modal when notification is triggered
showSMS(phone, message);
showEmail(email, subject, body);
```

### Modal Components
- **SMS Modal:** Blue theme, phone number display
- **Email Modal:** Red theme, subject and body

## 🛠 Development Guide

### Adding New Components

**Create component:**
```javascript
const MyComponent = ({ prop1, prop2 }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold">{prop1}</h2>
      <p>{prop2}</p>
    </div>
  );
};
```

### State Management

**Using useState:**
```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
```

**Fetching Data:**
```javascript
useEffect(() => {
  fetchData();
}, [dependency]);

const fetchData = async () => {
  setLoading(true);
  try {
    const res = await fetch(`${API_URL}/endpoint`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      setData(data.data);
    }
  } catch (err) {
    setError('Failed to fetch data');
  } finally {
    setLoading(false);
  }
};
```

## 🎨 Styling Guidelines

### Tailwind Classes

**Common Patterns:**
```javascript
// Card
className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"

// Button Primary
className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"

// Button Secondary
className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"

// Input Field
className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"

// Badge
className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold"
```

## 🔍 Key Features Implementation

### Category Filtering
```javascript
const categories = ['all', ...new Set(menuItems.map(item => item.category))];
const filteredMenuItems = selectedCategory === 'all' 
  ? menuItems 
  : menuItems.filter(item => item.category === selectedCategory);
```

### Cart Management
```javascript
// Add to cart
const addToCart = (item) => {
  const existing = cart.find(i => i.menuItemId === item._id);
  if (existing) {
    setCart(cart.map(i => 
      i.menuItemId === item._id 
        ? { ...i, qty: i.qty + 1 } 
        : i
    ));
  } else {
    setCart([...cart, { 
      menuItemId: item._id, 
      name: item.name, 
      price: item.price, 
      qty: 1 
    }]);
  }
};

// Calculate total
const cartTotal = cart.reduce((sum, item) => 
  sum + (item.price * item.qty), 0
);
```

### Order Placement
```javascript
const placeOrder = async () => {
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
};
```

## 📊 Demo Accounts

### Quick Demo Feature
```javascript
const quickDemo = (role) => {
  const demoData = {
    customer: { 
      email: 'customer@fastbite.com', 
      password: 'demo123', 
      role: 'customer' 
    },
    rider: { 
      email: 'rider@fastbite.com', 
      password: 'demo123', 
      role: 'rider' 
    },
    admin: { 
      email: 'admin@fastbite.com', 
      password: 'admin123', 
      role: 'admin' 
    }
  };
  setFormData({ ...formData, ...demoData[role] });
  setIsLogin(true);
};
```

## 🐛 Debugging

### React Developer Tools
1. Install React DevTools extension
2. Inspect component hierarchy
3. View props and state
4. Track re-renders

### Console Logging
```javascript
console.log('Fetched menu items:', menuItems.length);
console.log('Cart contents:', cart);
console.log('API Response:', data);
```

### Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by XHR/Fetch
4. Check API requests/responses

## 🚀 Performance Optimization

### Lazy Loading
```javascript
import React, { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('./AdminDashboard'));

<Suspense fallback={<div>Loading...</div>}>
  <AdminDashboard />
</Suspense>
```

### Memoization
```javascript
import { useMemo } from 'react';

const filteredItems = useMemo(() => {
  return selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);
}, [menuItems, selectedCategory]);
```

### Debouncing Search
```javascript
import { useState, useEffect } from 'react';

const [searchTerm, setSearchTerm] = useState('');
const [debouncedTerm, setDebouncedTerm] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedTerm(searchTerm);
  }, 500);
  return () => clearTimeout(timer);
}, [searchTerm]);
```

## 🎯 Best Practices

### 1. Component Organization
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use meaningful variable names
- Add comments for complex logic

### 2. Error Handling
```javascript
try {
  // API call
} catch (err) {
  setError(err.message || 'An error occurred');
  console.error('Error:', err);
}
```

### 3. Loading States
```javascript
{loading ? (
  <div>Loading...</div>
) : error ? (
  <div className="text-red-600">{error}</div>
) : (
  <div>{/* Content */}</div>
)}
```

### 4. Empty States
```javascript
{items.length === 0 ? (
  <div className="text-center py-12">
    <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
    <p className="text-gray-600">No items found</p>
  </div>
) : (
  // Render items
)}
```

## 📦 Build & Deploy

### Production Build
```bash
npm run build
```

This creates an optimized build in the `build` folder.

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Environment Variables
Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Access in code:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Sign up new user
- [ ] Login existing user
- [ ] Quick demo buttons work
- [ ] Logout clears session

**Customer Flow:**
- [ ] View menu items
- [ ] Filter by category
- [ ] Add items to cart
- [ ] Update quantities
- [ ] Place order
- [ ] View order history

**Rider Flow:**
- [ ] View available orders
- [ ] Accept order
- [ ] Mark as picked up
- [ ] Mark as delivered

**Admin Flow:**
- [ ] View dashboard stats
- [ ] Add menu items
- [ ] Delete menu items
- [ ] Add sample items
- [ ] View all orders
- [ ] View all users

## 🔧 Troubleshooting

### Common Issues

#### 1. Blank Screen
**Solution:** Check browser console for errors
```bash
# Open DevTools
F12 or Cmd+Option+I
```

#### 2. API Connection Failed
**Solution:** Verify backend is running
```javascript
// Check API_URL in App.jsx
const API_URL = 'http://localhost:5000/api';
```

#### 3. Menu Items Not Showing
**Solution:** 
- Login as Admin
- Click "Add Sample Items"
- Refresh customer page

#### 4. CORS Errors
**Solution:** Check backend CORS settings
```javascript
// Backend should have:
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

#### 5. Cart Not Updating
**Solution:** Check state updates
```javascript
// Use spread operator for state updates
setCart([...cart, newItem]);
```

## 📱 Mobile Responsive

### Breakpoints
- **sm:** 640px
- **md:** 768px
- **lg:** 1024px
- **xl:** 1280px

### Mobile-First Approach
```javascript
className="w-full md:w-1/2 lg:w-1/3"
```

## 🎨 Icons

Using Lucide React:
```javascript
import { 
  Package, 
  User, 
  MapPin, 
  ShoppingBag,
  Plus,
  Trash2
} from 'lucide-react';

<Package className="w-6 h-6 text-blue-600" />
```

## 📝 Scripts Reference

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

## 🆘 Getting Help

**Resources:**
- React Documentation: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- Lucide Icons: https://lucide.dev

**Common Commands:**
```bash
# Clear cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for updates
npm outdated

# Update packages
npm update
```

## 🎓 Learning Resources

- React Tutorial: https://react.dev/learn
- JavaScript ES6: https://javascript.info
- Tailwind CSS Guide: https://tailwindcss.com/docs
- Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

---

**Happy Coding! 🚀**

Need help? Open an issue or contact support@fastbite.com