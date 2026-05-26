import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
    return (
        <div className='bg-gray-950 text-white/90 border-b border-white/10 p-3 pl-10'>
            <div>
                <ul className='flex justify-between items-center'>
                    <div>
                        <Link to={'/'}><li className='font-bold text-2xl'>Layerzero</li></Link>
                    </div>
                    <div className='flex flex-row gap-15 pr-10 font-black'>
                        <Link to={'https://github.com/render-thevoid'} target='__blank'><li>Github</li></Link>
                        <Link to={'/about'}><li>About</li></Link>
                        <Link to={'/signup'}><li>Sign Up</li></Link>
                    </div>
                </ul>
            </div>
        </div>
    );
};

export default Navbar;
