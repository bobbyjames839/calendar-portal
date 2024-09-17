import { useEffect, useState } from 'react';
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

    const [viewState, setViewState] = useState([true, true, true, true]);

    const handleCalendarUpdate = () => {
        setCalendarUpdateTrigger(prev => !prev); 
    };

    const handleResize = () => {
        const width = window.innerWidth;
        if (width < 550) {
            setViewState([true, false, false, false]);  
        } else if (width < 850) {
            setViewState([true, true, false, false]);  
        } else if (width < 1100) {
            setViewState([true, true, true, false]); 
        } else {
            setViewState([true, true, true, true]); 
        }
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const shiftRight = () => {
        setViewState(prevState => {
            return [prevState[prevState.length - 1], ...prevState.slice(0, prevState.length - 1)];
        });
    };

    const shiftLeft = () => {
        setViewState(prevState => {
            return [...prevState.slice(1), prevState[0]];
        });
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

            <Profiles 
                shiftLeft={shiftLeft}
                shiftRight={shiftRight}
                viewState={viewState} 
            />

            <Calendar 
                currentDate={currentDate} 
                previewItem={previewItem}
                calendarUpdateTrigger={calendarUpdateTrigger} 
                handleCalendarUpdate={handleCalendarUpdate}
                viewState={viewState} 
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
