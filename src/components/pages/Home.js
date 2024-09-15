import { useState } from 'react';
import { Calendar } from '../sections/Calendar';
import { CalendarNav } from '../sections/CalendarNav';
import { Nav } from '../sections/Nav';
import { Profiles } from '../sections/Profiles';
import '../styles/Home.css';
import { CalendarDropdown } from '../sections/CalendarDropdown';
import { PendingBookings } from '../sections/PendingBookings';
import { Notif } from '../sections/Notif';

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
    const [previewItem, setPreviewItem] = useState('Name');
    const [currentDate, setCurrentDate] = useState(getInitialDate);
    const [calendarDropdown, setCalendarDropdown] = useState(false);
    const [pendingBookings, setPendingBookings] = useState(false);
    const [notif, setNotif] = useState(false);
    const [notifText, setNotifText] = useState('');
    const [calendarUpdateTrigger, setCalendarUpdateTrigger] = useState(false); 

    const handleCalendarUpdate = () => {
        setCalendarUpdateTrigger(prev => !prev); // Toggle the trigger state
    };

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

            {pendingBookings && (
                <PendingBookings 
                    setPendingBookings={setPendingBookings} 
                    setNotif={setNotif} 
                    setNotifText={setNotifText} 
                    handleCalendarUpdate={handleCalendarUpdate} 
                />
            )}

            {notif && <Notif notifText={notifText}/>}

            <Profiles />

            <Calendar 
                currentDate={currentDate} 
                previewItem={previewItem}
                calendarUpdateTrigger={calendarUpdateTrigger} 
                handleCalendarUpdate={handleCalendarUpdate}
            />

            {calendarDropdown && (
                <CalendarDropdown 
                    currentDate={currentDate} 
                    setCurrentDate={setCurrentDate} 
                    setCalendarDropdown={setCalendarDropdown} 
                />
            )}
        </div>
    );
};
