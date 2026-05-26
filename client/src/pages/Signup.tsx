import React from 'react';

const Signup: React.FC = () => {
    return (
        <div className='flex justify-center items-center h-screen'>
            <form className='flex border border-white/10 text-white/90 flex-col p-10 gap-5' action="">
                <span className='flex flex-col'>
                    <label htmlFor="">Username</label>
                    <input className='py-3 px-5 border border-white/5' type="text" />
                </span>
                <span className='flex flex-col'>
                    <label htmlFor="">Name</label>
                    <input className='py-3 px-5 border border-white/5' type="text" />
                </span>
                <span className='flex flex-col'>
                    <label htmlFor="">Password</label>
                    <input className='py-3 px-5 border border-white/5' type="text" />
                </span>
            </form>
        </div>
    );
};

export default Signup;