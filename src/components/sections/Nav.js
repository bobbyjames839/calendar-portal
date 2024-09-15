import '../styles/Nav.css' 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'; 
import { useNavigate } from 'react-router-dom';

export const Nav = () => {

    const navigate = useNavigate();

    return (
        <div className="nav">
            <div className='nav_left'>
                <p className='nav_left_text'>BT Bookings Portal</p>
            </div>
            <div className='nav_right'>
                <FontAwesomeIcon icon={faSignOutAlt} className='nav_icon' onClick={() => (navigate('/'))}/>
            </div>
        </div>
    )
}