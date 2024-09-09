import { useState } from 'react';
import '../styles/Booking.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

export const Booking = ({ setBooking, bookingDetails }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleCloseSidebar = () => {
        setIsClosing(true);
        setTimeout(() => {
            setBooking(null);
        }, 500); 
    };

    const getEmployeeClass = (employee) => {
        switch (employee) {
            case 'Bobby': return 'bobby';
            case 'Tommy': return 'tommy';
            case 'Harry': return 'harry';
            case 'Jasmine': return 'jasmine';
            default: return '';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    };

    return (
        <div className={`booking ${isClosing ? 'booking_closing' : ''}`}>
            {bookingDetails && (
                <>
                <div className={`booking_top ${getEmployeeClass(bookingDetails.employee)}`}>
                    <FontAwesomeIcon icon={faTimes} className="close_booking" onClick={handleCloseSidebar} />
                    <p className='booking_time'><span className='booking_time_inner'>{bookingDetails.time}</span>{formatDate(bookingDetails.date)}</p> 
                </div>
                <div className="booking_middle">
                    <p className='client_info'>Client Information</p>
                    <p className='client_info_item'>{bookingDetails.customer}</p>
                    <p className='client_info_item'>{bookingDetails.email}</p>
                    <p className='client_info_item'>{bookingDetails.number}</p>
                    {bookingDetails.note !== '' && 
                    <>
                        <p className='client_info'>Appointment Note</p>
                        <p className='client_info_item client_info_item_note'>{bookingDetails.note}</p>
                    </>}
                </div>
                <div className={`booking_bottom ${getEmployeeClass(bookingDetails.employee)}`}>
                    <p className='booking_type'>{bookingDetails.service}</p>
                    <p className='booking_price'>{bookingDetails.price}</p>
                </div>
                </>
            )}
        </div>
    );
};
