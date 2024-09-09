import '../styles/CalendarDropdown.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';

export const CalendarDropdown = ({ currentDate, setCurrentDate, setCalendarDropdown }) => {
    const [month1, setMonth1] = useState(true); 
    const [calendarClosing, setCalendarClosing] = useState(false);

    const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    const daysInMonth1 = ['', '', '', '', '', '', '1', '2', '3', '4',  '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'];
    const daysInMonth2 = ['', '1', '2', '3', '4',  '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];

    const closedDaysMonth1 = ['1', '7', '8', '14', '15', '21', '22', '28', '29'];
    const closedDaysMonth2 = ['5', '6', '12', '13', '19', '20', '26', '27'];

    const today = new Date();
    const currentDay = today.getDate();

    useEffect(() => {
        const currentMonth = currentDate.getMonth(); 
        if (currentMonth === 9) {
            setMonth1(false);
        }
    }, [currentDate]);

    const isDayDisabled = (day) => {
        const isEmptyDay = day === '';
        const isPastDay = day && parseInt(day) < currentDay && month1;
        const isClosedDay = month1 
            ? closedDaysMonth1.includes(day) 
            : closedDaysMonth2.includes(day);
        return isEmptyDay || isPastDay || isClosedDay;
    };

    const isCurrentDay = (day) => {
        const selectedMonth = month1 ? 8 : 9;
        return currentDate.getDate() === parseInt(day) && currentDate.getMonth() === selectedMonth;
    };

    const closeCalendarDropdown = () => {
        setCalendarClosing(true)
        setTimeout(() => {
            setCalendarClosing(false);             
            setCalendarDropdown(false);
        }, 300);
    }

    const handleDayClick = (day) => {
        if (!isDayDisabled(day) && day) {
            const selectedMonth = month1 ? 8 : 9; 
            const selectedDate = new Date(today.getFullYear(), selectedMonth, day);

            setCurrentDate(selectedDate);
            closeCalendarDropdown();
        }
    };

    const handlePreviousMonth = () => setMonth1(true);
    const handleNextMonth = () => setMonth1(false);

    return (
        <div className={`calendar_dropdown ${calendarClosing && 'calendar_dropdown_closing'}`}>
            <div className='calendar_dropdown_inner'>
                <div className='calendar_dropdown_top'>
                    <h1 className='calendar_dropdown_month'>{month1 ? 'Sep 2024' : 'Oct 2024'}</h1>
                    <div className='calendar_dropdown_toggle_month_buttons'>
                        <FontAwesomeIcon 
                            icon={faArrowLeft} 
                            className={`calendar_dropdown_toggle_month_button ${month1 && 'calendar_dropdown_toggle_month_button_lighter'}`} 
                            onClick={handlePreviousMonth}
                        />
                        <FontAwesomeIcon 
                            icon={faArrowRight} 
                            className={`calendar_dropdown_toggle_month_button ${!month1 && 'calendar_dropdown_toggle_month_button_lighter'}`} 
                            onClick={handleNextMonth}
                        />
                        <FontAwesomeIcon icon={faTimes} className='calendar_dropdown_toggle_month_button' 
                        onClick={closeCalendarDropdown}/>
                    </div>
                </div>

                <div className='calendar_dropdown_days_of_week'>
                    {daysOfWeek.map((day, index) => (
                        <div key={index} className='calendar_dropdown_day_of_week'>{day}</div>
                    ))}
                </div>

                <div className='calendar_dropdown_main'>
                    {month1 ? 
                        daysInMonth1.map((day, index) => (
                            <div key={index} className='calendar_dropdown_section'>
                                <p 
                                    className={`calendar_dropdown_day 
                                                ${isDayDisabled(day) ? 'past_dropdown_day' : ''} 
                                                ${isCurrentDay(day) ? 'current_dropdown_day' : ''}`}
                                    onClick={() => handleDayClick(day)}
                                >
                                    {day}
                                </p>
                            </div>
                        )) :
                        daysInMonth2.map((day, index) => (
                            <div key={index} className='calendar_dropdown_section'>
                                <p 
                                    className={`calendar_dropdown_day 
                                                ${isDayDisabled(day) ? 'past_dropdown_day' : ''} 
                                                ${isCurrentDay(day) ? 'current_dropdown_day' : ''}`}
                                    onClick={() => handleDayClick(day)}
                                >
                                    {day}
                                </p>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};
