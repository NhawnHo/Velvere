import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './component/Header';
import NewBagsSection from './component/NewBagsSection';
import Contact from './component/Contact';
import Product from './component/Product';
import User from './component/User';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Footer from './component/Footer';
import Signup from './login/Signup';
import Signin from './login/Signin';
import { CartProvider } from './context/CartContext';

function App() {
    return (
        <CartProvider>
            <Router>
                <Header />

                <Routes>
                    <Route path="/" element={<NewBagsSection />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/products" element={<Product />} />
                    <Route path="/user" element={<User />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/signin" element={<Signin />} />
                </Routes>
                <User />
                <Footer />
            </Router>
        </CartProvider>
    );
}

export default App;
