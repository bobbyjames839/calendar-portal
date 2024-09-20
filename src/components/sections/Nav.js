import '../styles/Nav.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSignOutAlt, faTimes } from '@fortawesome/free-solid-svg-icons'; 
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const Nav = () => {
    const [navDropdown, setNavDropdown] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();  

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        if (navDropdown) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [navDropdown]);

    // Handle navigation and dropdown closure
    const handleNavClick = (path) => {
        setNavDropdown(false); // Close the dropdown first
        navigate(path); // Then navigate to the desired path
    };

    // Function to display the current page based on the path
    const getCurrentPage = () => {
        switch (location.pathname) {
            case '/main':
                return 'B&T Bookings Portal';
            case '/manage':
                return 'Manage Availability';
            case '/pending':
                return 'Pending Bookings';
            default:
                return 'B&T Bookings';
        }
    };

    return (
        <div className="nav">
            <div className='nav_left'>
                <FontAwesomeIcon icon={faSignOutAlt} className='nav_icon' onClick={() => handleNavClick('/')}/>
                <Link to="/main" className={`nav_link ${isActive('/main') && 'active_nav'}`}>
                    B&T Bookings Portal
                </Link>
            </div>
            <div className='nav_right'>
                <Link to="/manage" className={`nav_link ${isActive('/manage') && 'active_nav'}`}>
                    Manage Availability
                </Link>
                <Link to="/pending" className={`nav_link ${isActive('/pending') && 'active_nav'}`}>
                    Pending Bookings
                </Link>
            </div>

            {/* Dynamically display the current page in the logo */}
            <p className='nav_logo'>{getCurrentPage()}</p>
            
            <FontAwesomeIcon icon={faBars} onClick={() => setNavDropdown(true)} className='show_nav_dropdown'/>

            {navDropdown && <div className='nav_dropdown'>
                <FontAwesomeIcon icon={faTimes} className='nav_dropdown_close' onClick={() => setNavDropdown(false)}/>
                <FontAwesomeIcon icon={faSignOutAlt} className='nav_dropdown_icon' onClick={() => handleNavClick('/')}/>
                <h1 className='nav_dropdown_title'>B&T Bookings</h1> 
                <p onClick={() => handleNavClick('/main')} className='nav_dropdown_link'>B&T Bookings Portal</p>
                <p onClick={() => handleNavClick('/manage')} className='nav_dropdown_link ndl_middle'>Manage Availability</p>
                <p onClick={() => handleNavClick('/pending')} className='nav_dropdown_link'>Pending Bookings</p>   
            </div>}
        </div>
    );
};
