import '../styles/CalendarNav.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faCalendar, faChevronDown, faChevronLeft, faChevronRight, faChevronUp, faClipboardList, faCog } from '@fortawesome/free-solid-svg-icons'; 
import { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom'; 

export const CalendarNav = ({ currentDate, setCurrentDate, setCalendarDropdown, previewItem, setPreviewItem, setPendingBookings }) => {
    const [bookingPreview, setBookingPreview] = useState(false); 
    const navigate = useNavigate(); 
    const [isMobileView, setIsMobileView] = useState(false);
    const [isNarrowView, setIsNarrowView] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 900);
            setIsNarrowView(window.innerWidth < 800);
        };

        window.addEventListener('resize', handleResize);

        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

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

    // Modify formatDate to change based on screen width
    const formatDate = (date) => {
        const options = isNarrowView 
            ? { weekday: 'short', month: 'short', day: 'numeric' }  // For narrow view, use short weekday
            : { weekday: 'long', month: 'short', day: 'numeric' };  // Default format for larger screens
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
        setBookingPreview(false); 
    };

    return ( 
        <div className='calendar_nav'> 

            {isNarrowView ? (
                <span className='calendar_nav_button' onClick={() => navigate('/manage')}>
                    <FontAwesomeIcon icon={faCog} /> 
                </span>
            ) : (
                <span className='calendar_nav_button' onClick={() => navigate('/manage')}>Manage Availability</span>
            )}

            {isMobileView ? (
                <span className='calendar_nav_button' onClick={() => setPendingBookings(true)}> 
                    <FontAwesomeIcon icon={faClipboardList} /> 
                </span>
            ) : (
                <span className='calendar_nav_button' onClick={() => setPendingBookings(true)}>Pending Bookings</span>
            )}


            <div className={`select_preview ${bookingPreview && 'select_preview_expanded'}`}> 
                <div className='select_preview_top'> 
                    <p className='select_preview_text'>{isMobileView ? 'Edit Preview' : 'Select Booking Preview'}</p> 
                    <FontAwesomeIcon icon={bookingPreview ? faChevronUp : faChevronDown} onClick={() => setBookingPreview(!bookingPreview)} className='select_preview_dropdown' /> 
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
                    <FontAwesomeIcon icon={faChevronLeft} /> 
                </span> 

                <span className='selected_day'>{formatDate(currentDate)}</span> 

                <span className='select_day_button select_day_button_right' onClick={handleNextDay}> 
                    <FontAwesomeIcon icon={faChevronRight} /> 
                </span> 
            </div> 

            <span onClick={() => setCalendarDropdown(true)} className='view_calendar'> 
                <FontAwesomeIcon icon={faCalendar} /> 
            </span> 
        </div> 
    ); 
};
