import React from 'react';

const Signup: React.FC = () => {
    return (
        <div className='flex justify-center items-center h-screen animate-blur-fade-in'>
            <form className='flex border border-border text-foreground bg-card rounded-none flex-col p-10 gap-5' action="">
                <span className='flex flex-col gap-1'>
                    <label className="text-sm font-medium" htmlFor="username">Username</label>
                    <input id="username" className='py-2 px-3 border border-input bg-background rounded-none text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring' type="text" />
                </span>
                <span className='flex flex-col gap-1'>
                    <label className="text-sm font-medium" htmlFor="name">Name</label>
                    <input id="name" className='py-2 px-3 border border-input bg-background rounded-none text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring' type="text" />
                </span>
                <span className='flex flex-col gap-1'>
                    <label className="text-sm font-medium" htmlFor="password">Password</label>
                    <input id="password" className='py-2 px-3 border border-input bg-background rounded-none text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring' type="password" />
                </span>
            </form>
        </div>
    );
};

export default Signup;