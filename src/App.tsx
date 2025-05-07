import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

// import AdminChat from './component/AdminChat';
import RevenuePage from './pages/dashboard/revenue/RevenuePage';
import BestSellingPage from './pages/dashboard/best-selling/BestSellingPage';

function App() {
    return (
        <CartProvider>
            <Router>
                <ScrollToTop />
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/products" element={<Product />} />
                    <Route path="/user" element={<User />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/signin" element={<Signin />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/productPage" element={<ProductPage />} />
                    <Route path="/products" element={<ProductSearch />} />
                    <Route
                        path="/admin/revenuePage"
                        element={<RevenuePage />}
                    />{' '}
                    <Route
                        path="/admin/bestSellingPage"
                        element={<BestSellingPage />}
                    />
                    {/* <Route path="/admin/chat" element={<AdminChat />} /> */}
                </Routes>

                <Footer />
            </Router>
        </CartProvider>
    );
}
export default App;
