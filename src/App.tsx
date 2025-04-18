import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './component/Header';
import NewBagsSection from './component/NewBagsSection';
import Contact from './component/Contact';
import Product from './component/Product';
import User from './component/User';

function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<NewBagsSection />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/product" element={<Product />} />
                <Route path="/user" element={<User />} />
            </Routes>
        </Router>
    );
}

export default App;
