// frontend/src/main.jsx

import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider }         from './context/AuthContext.jsx'
import { CartProvider }         from "./context/CartContext";
import { WishlistProvider }     from "./context/WishlistContext";
import { NotificationProvider } from "./context/NotificationContext";  // ← NEW
import './index.css'; 

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <CartProvider>
      <WishlistProvider>
        <NotificationProvider>   {/* ← NEW — wraps App so Navbar + any page can use notifications */}
          <App />
        </NotificationProvider>
      </WishlistProvider>
    </CartProvider>
  </AuthProvider>
)