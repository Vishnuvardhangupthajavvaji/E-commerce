// frontend/src/App.jsx

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import Products       from "./pages/Products";
import ProductDetail  from "./pages/ProductDetail";
import Home           from "./pages/Home";
import Cart           from "./pages/Cart";
import Wishlist       from "./pages/Wishlist";
import Profile        from "./pages/Profile";
import EditProfile    from "./pages/EditProfile";
import ChangePassword  from "./pages/ChangePassword";
import ResetPassword  from "./pages/ResetPassword";
import Checkout       from "./pages/Checkout";
import Orders         from "./pages/Orders";
import OrderDetail    from "./pages/OrderDetail";
import NavBar         from "./components/Navbar";
import Footer         from "./components/Footer";
import CategoryBar    from "./components/CategoryBar";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute     from "./routes/AdminRoute";

import AdminDashboard   from "./pages/admin/AdminDashboard";
import AdminOverview    from "./pages/admin/AdminOverview";
import AdminProducts    from "./pages/admin/AdminProducts";
import AdminAddProduct  from "./pages/admin/AdminAddProduct";
import AdminEditProduct from "./pages/admin/AdminEditProduct";
import AdminUsers       from "./pages/admin/AdminUsers";
import AdminOrders      from "./pages/admin/AdminOrders";

function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <NavBar />
        <CategoryBar />
        <main className="flex-grow-1">
          <Routes>
            {/* Public */}
            <Route path="/"             element={<Home />} />
            <Route path="/login"        element={<Login />} />
            <Route path="/register"          element={<Register />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/products"     element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />

            {/* Protected */}
            <Route path="/wishlist"        element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/cart"            element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/profile"         element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/edit"    element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path="/checkout"        element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders"          element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/orders/:id"      element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

            {/* Admin — nested under AdminDashboard layout */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
              <Route index                    element={<AdminOverview />} />
              <Route path="products"          element={<AdminProducts />} />
              <Route path="products/add"      element={<AdminAddProduct />} />
              <Route path="products/edit/:id" element={<AdminEditProduct />} />
              <Route path="users"             element={<AdminUsers />} />
              <Route path="orders"             element={<AdminOrders />} />
            </Route>

          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;