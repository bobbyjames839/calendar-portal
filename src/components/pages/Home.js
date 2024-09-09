import { useState } from 'react';
import { Calendar } from '../sections/Calendar';
import { CalendarNav } from '../sections/CalendarNav';
import { Nav } from '../sections/Nav';
import { Profiles } from '../sections/Profiles';
import '../styles/Home.css';
import { Booking } from '../sections/Booking';
import { CalendarDropdown } from '../sections/CalendarDropdown';

const getInitialDate = () => {
    let initialDate = new Date();
    const dayOfWeek = initialDate.getDay();
    
    if (dayOfWeek === 6) {
        initialDate.setDate(initialDate.getDate() + 2); 
    } else if (dayOfWeek === 0) {
        initialDate.setDate(initialDate.getDate() + 1); 
    }
    
    return initialDate;
};

export const Home = () => {
    const [previewItem, setPreviewItem] = useState('Name'); // Track preview item
    const [currentDate, setCurrentDate] = useState(getInitialDate);
    const [booking, setBooking] = useState(null); 
    const [calendarDropdown, setCalendarDropdown] = useState(false);

    return (
        <div className='home'>
            <Nav />

            <CalendarNav 
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                setCalendarDropdown={setCalendarDropdown}
                setPreviewItem={setPreviewItem}
                previewItem={previewItem}
            />

            <Profiles />

            <Calendar 
                currentDate={currentDate} 
                setBooking={setBooking}
                previewItem={previewItem}
            />

            {booking && <Booking setBooking={setBooking} bookingDetails={booking}/>}

            {calendarDropdown && <CalendarDropdown currentDate={currentDate} setCurrentDate={setCurrentDate} setCalendarDropdown={setCalendarDropdown} />}

        </div>
    );
};
