import { useState } from 'react';
import { Calendar } from '../sections/Calendar';
import { CalendarNav } from '../sections/CalendarNav';
import { Nav } from '../sections/Nav';
import { Profiles } from '../sections/Profiles';
import '../styles/Home.css';
import { Booking } from '../sections/Booking';
import { CalendarDropdown } from '../sections/CalendarDropdown';
import { PendingBookings } from '../sections/PendingBookings';

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
    const [pendingBookings, setPendingBookings] = useState(true);

    return (
        <div className='home'>
            <Nav />

            <CalendarNav 
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                setCalendarDropdown={setCalendarDropdown}
                setPreviewItem={setPreviewItem}
                previewItem={previewItem}
                setPendingBookings={setPendingBookings}
            />

            {pendingBookings && <PendingBookings setPendingBookings={setPendingBookings}/>}

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
