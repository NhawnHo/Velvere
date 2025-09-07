import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './component/Header';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Product from './pages/Product';
import User from './component/User';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Footer from './component/Footer';
import Signup from './login/Signup';
import Signin from './login/Signin';
import ScrollToTop from './component/ScrollToTop';
import ProductPage from './pages/ProductPage';
import { CartProvider } from './context/CartContext';
import ProductSearch from './pages/ProductSearch';
import AddProduct from './pages/AddProduct';
import RevenuePage from './pages/dashboard/revenue/RevenuePage';
import BestSellingPage from './pages/dashboard/best-selling/BestSellingPage';

import AppointmentPage from './pages/AppointmentPage';

// Admin routes
import OrderList from './pages/admin/orders/OrderList';
import OrderApproval from './pages/admin/orders/OrderApproval';
import OrderDetail from './pages/admin/orders/OrderDetail';
import UserList from './pages/admin/users/UserList';
import EditUser from './pages/admin/users/EditUser';
import UserProfile from './pages/UserProfile';

function App() {
    return (
        <CartProvider>

                <Router>
                    <ScrollToTop />
                    <Header />
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/products" element={<Product />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/productPage" element={<ProductPage />} />
                        <Route path="/products" element={<ProductSearch />} />
                        <Route path="/appointmentPage" element={<AppointmentPage />} />
                        
                        {/* Auth routes */}
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/signin" element={<Signin />} />
                        <Route path="/user" element={<User />} />
                        <Route path="/userProfile" element={<UserProfile />} />
                        
                        {/* Admin routes */}
                        <Route path="/admin/revenuePage" element={<RevenuePage />} />
                        <Route path="/admin/bestSellingPage" element={<BestSellingPage />} />
                        
                        {/* Admin product management */}
                        <Route path="/admin/products/add" element={<AddProduct />} />
                        <Route path="/admin/products/update/:id" element={<AddProduct />} />
                        <Route path="/admin/productPage" element={<ProductPage />} />
                        
                        {/* Admin order management */}
                        <Route path="/admin/orders" element={<OrderList />} />
                        <Route path="/admin/orders/:id" element={<OrderDetail />} />
                        <Route path="/admin/orders/approval" element={<OrderApproval />} />
                        
                        {/* Admin user management */}
                        <Route path="/admin/users" element={<UserList />} />
                        <Route path="/admin/users/edit/:userId" element={<EditUser />} />
                    </Routes>

                    <Footer />
                    <ToastContainer />
                </Router>
        </CartProvider>
    );
}
export default App;
