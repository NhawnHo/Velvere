import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './component/Header';
import NewBagsSection from './component/NewBagsSection';
import Contact from './component/Contact';
import Product from './component/Product';
import User from './component/User';
import ProductDetail from './pages/ProductDetail';
import Footer from './component/Footer';
import Signup from './login/Signup';

function App() {
    return (
        <Router>
            <Header />

            <Routes>
                <Route path="/" element={<NewBagsSection />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/products" element={<Product />} />
                <Route path="/user" element={<User />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/signup" element={<Signup />} />
            </Routes>

            <Footer />
        </Router>
    );
}

export default App;
