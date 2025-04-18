import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './component/Header';
// import Contact from './component/Contact';
import Footer from './component/Footer';
import Product from './component/Product';
import ProductDetail from './pages/ProductDetail';
// import Signup from './login/Signup';
// import User from './component/User';
// import NewBagsSection from './component/NewBagsSection';

function App() {
    return (
        <>
            <Header />
            {/* <Contact />
            <NewBagsSection /> */}
            {/* <Product /> */}
            <Router>
                <Routes>
                    <Route path="/" element={<Product />} />
                    <Route path="/product/:id" element={<ProductDetail/>} />
                </Routes>
            </Router>
        {/* <User /> */}
        {/* <Signup/> */}
            <Footer />
        </>
    );
}

export default App;
