import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './component/Header';
import Home from './pages/Home';
import Contact from './component/Contact';
import Product from './component/Product';
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
import { ChatProvider } from './context/ChatContext';
import ChatWidget from './component/ChatWidget';
import AdminChat from './component/AdminChat';

function App() {
  return (
    <CartProvider>
      <ChatProvider>
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
            <Route path="/admin/chat" element={<AdminChat />} />
          </Routes>
          {/* <ProductPage /> */}
          {/* <User /> */}
          <ChatWidget />
          <Footer />
        </Router>
      </ChatProvider>
    </CartProvider>
  );
}
export default App;
