import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Homepage from './pages/Homepage';
import Navbar from './components/Navbar.tsx';
import About from './pages/About.tsx';

const App: React.FC = () => {
  return (
    <div className='flex flex-col bg-gray-950 h-screen'>
      <Navbar />
      <div className='flex-1 overflow-hidden'>
        <Routes>
          <Route path='/signup' element={<Signup />} />
          <Route path='/signin' element={<Signin />} />
          <Route path='/' element={<Homepage />} />
          <Route path='/about' element={<About />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;