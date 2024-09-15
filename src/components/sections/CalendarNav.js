import '../styles/CalendarNav.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faChevronDown, faChevronLeft, faChevronRight, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const CalendarNav = ({ currentDate, setCurrentDate, setCalendarDropdown, previewItem, setPreviewItem, setPendingBookings }) => {
    const [bookingPreview, setBookingPreview] = useState(false);
    const navigate = useNavigate();


    const isToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set the time to midnight to ensure date-only comparison
        const date = new Date(currentDate);
        date.setHours(0, 0, 0, 0);
        return today.getTime() === date.getTime();
    };

    const isWeekend = (date) => {
        const day = date.getDay();
        return day === 0 || day === 6; 
    };

    const skipToNextWeekday = (date) => {
        let newDate = new Date(date);
        if (newDate.getDay() === 6) {
            newDate.setDate(newDate.getDate() + 2);
        } else if (newDate.getDay() === 0) {
            newDate.setDate(newDate.getDate() + 1);
        }
        return newDate;
    };

    const skipToPreviousWeekday = (date) => {
        let newDate = new Date(date);
        if (newDate.getDay() === 1) {
            newDate.setDate(newDate.getDate() - 3);
        } else if (newDate.getDay() === 0) {
            newDate.setDate(newDate.getDate() - 2);
        } else if (newDate.getDay() === 6) {
            newDate.setDate(newDate.getDate() - 1);
        }
        return newDate;
    };

    const formatDate = (date) => {
        const options = { weekday: 'long', month: 'short', day: 'numeric' }; 
        return date.toLocaleDateString(undefined, options);
    };

    const handlePreviousDay = () => {
        let newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);
    
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        newDate.setHours(0, 0, 0, 0);

        if (newDate < today) {
            return;
        }

        if (isWeekend(newDate)) {
            newDate = skipToPreviousWeekday(newDate);
        }

        if (newDate >= today) {
            setCurrentDate(newDate);
        }
    };

    const handleNextDay = () => {
        let newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 1);

        if (isWeekend(newDate)) {
            newDate = skipToNextWeekday(newDate);
        }

        setCurrentDate(newDate);
    };

    const handleClick = (item) => {
        setPreviewItem(item); 
        setBookingPreview(false); // Close the dropdown after selecting an item
    };

    return (
        <div className='calendar_nav'>

            <span className='calendar_nav_button' onClick={() => (setPendingBookings(true))}>Pending Bookings</span>

            <span onClick={() => (navigate('/manage'))} className='calendar_nav_button'>Manage Availability</span>

            <div className={`select_preview ${bookingPreview && 'select_preview_expanded'}`}>
                <div className='select_preview_top'>
                    <p className='select_preview_text'>Select Booking Preview</p>
                    <FontAwesomeIcon icon={bookingPreview ? faChevronUp : faChevronDown} onClick={() => setBookingPreview(!bookingPreview)} className='select_preview_dropdown'/>
                </div>
                <div className='select_preview_main'>
                    <p className={`select_preview_text_bottom ${previewItem === 'Name' ? 'selected_ptb' : ''}`} onClick={() => handleClick('Name')}>Name</p>
                    <p className={`select_preview_text_bottom ${previewItem === 'Email' ? 'selected_ptb' : ''}`} onClick={() => handleClick('Email')}>Email</p>
                    <p className={`select_preview_text_bottom ${previewItem === 'Phone Number' ? 'selected_ptb' : ''}`} onClick={() => handleClick('Phone Number')}>Phone Number</p>
                    <p className={`select_preview_text_bottom ${previewItem === 'Service' ? 'selected_ptb' : ''}`} onClick={() => handleClick('Service')}>Service</p>
                    <p className={`select_preview_text_bottom ${previewItem === 'Price' ? 'selected_ptb' : ''}`} onClick={() => handleClick('Price')}>Price</p>
                    <p className={`select_preview_text_bottom ${previewItem === 'Time' ? 'selected_ptb' : ''}`} onClick={() => handleClick('Time')}>Time</p>
                </div>
            </div>

            <div className='select_day'>
                <span className={`select_day_button select_day_button_left ${isToday() ? 'disabled_chevron_left' : ''}`} onClick={handlePreviousDay}>
                    <FontAwesomeIcon icon={faChevronLeft}/>
                </span>

                <span className='selected_day'>{formatDate(currentDate)}</span>

                <span className='select_day_button select_day_button_right' onClick={handleNextDay}>
                    <FontAwesomeIcon icon={faChevronRight} />
                </span>
            </div>

            <span onClick={() => setCalendarDropdown(true)} className='view_calendar'>
                <FontAwesomeIcon icon={faCalendar}/>
            </span>

        </div>
    );
};
