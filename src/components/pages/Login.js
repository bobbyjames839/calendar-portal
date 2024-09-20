import { useState } from 'react';
import '../styles/login/Login.css';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // State to manage error message
    const navigate = useNavigate();

    const handleLogin = () => {
        if (username === 'bobbydavidson' && password === 'bobby') {
            navigate('/main');
        } else {
            setError('Invalid username or password');
        }
    }

    return (
        <div className='login'>
            <div className='login_inner'>
                <h1 className='login_title'>Login</h1>
                <input 
                    className='login_input' 
                    type='text' 
                    placeholder='Username' 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                />
                <input 
                    className='login_input' 
                    type='password' 
                    placeholder='Password' 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />
                <button className='submit_login' onClick={handleLogin}>Submit</button>
                {error && <p className='error_message_login'>{error}</p>} 
            </div>
            <p className='logo'>B&T Bookings</p>
        </div>
    );
};
