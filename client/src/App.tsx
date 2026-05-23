import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Homepage from './pages/Homepage';
import Navbar from './components/Navbar.tsx';

const App: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className='flex justify-center items-center h-screen bg-gray-950'>
        <Routes>
          <Route path='/signup' element={<Signup />} />
          <Route path='/signin' element={<Signin />} />
          <Route path='/' element={<Homepage />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;