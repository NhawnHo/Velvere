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

// import User from './component/User';
// import NewBagsSection from './component/NewBagsSection';

function App() {
  return (
      
   
        <Router>
            <Header />

            <Routes>
                <Route path="/" element={<NewBagsSection />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/product" element={<Product />} />
                <Route path="/user" element={<User />} />
                <Route path="/" element={<Product />} />
                <Route path="/product/:id" element={<ProductDetail/>} />
      </Routes>
      <Signup/>

            <Footer />
      </Router>
       

    );
}

export default App;
