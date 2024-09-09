import '../styles/Nav.css' 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'; 

export const Nav = () => {
    return (
        <div className="nav">
            <div className='nav_left'>
                <FontAwesomeIcon icon={faBars} className='nav_icon' />
            </div>
            <div className='nav_right'>
                <FontAwesomeIcon icon={faSignOutAlt} className='nav_icon' />
            </div>
        </div>
    )
}