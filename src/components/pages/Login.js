import { useState } from 'react';
import '../styles/Login.css';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/main');
    }

    return (
        <div className='login'>
            <div className='login_inner'>
                <h1 className='login_title'>Login</h1>
                <input className='login_input' type='email' placeholder='Email' />
                <input className='login_input' type='password' placeholder='Password' />
                <button className='submit_login' onClick={handleLogin}>Submit</button>
            </div>
            <p className='logo'>BT Bookings</p>
        </div>
    );
};



