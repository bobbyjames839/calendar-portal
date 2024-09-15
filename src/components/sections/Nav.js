import '../styles/Nav.css' 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'; 

export const Nav = () => {
    return (
        <div className="nav">
            <div className='nav_left'>
                <p className='nav_left_text'>BT Bookings Portal</p>
            </div>
            <div className='nav_right'>
                <FontAwesomeIcon icon={faSignOutAlt} className='nav_icon' />
            </div>
        </div>
    )
}