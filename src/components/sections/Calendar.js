import React, { useEffect, useRef, useState } from 'react';
import '../styles/Calendar.css';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/Firebase.js';
import { Booking } from './Booking.js';

export const Calendar = ({ currentDate, previewItem, calendarUpdateTrigger, handleCalendarUpdate, viewState,  }) => {
    const employees = ['Bobby', 'Tommy', 'Jasmine', 'Harry'];
    const queryIdRef = useRef(0);
    const [bookings, setBookings] = useState({});
    const [booking, setBooking] = useState(null) // Store bookings by employee and date

    const getFormattedDateString = (date) => {
        return date.toDateString();
    };

    const clearTimeSlots = () => {
        employees.forEach(employee => {
            const bookedSlots = document.querySelectorAll(`.booked-${employee}, .booked_top, .booked_middle, .booked_bottom`);
            bookedSlots.forEach(slot => {
                slot.classList.remove(`booked-${employee}`);
                slot.classList.remove('booked_top');
                slot.classList.remove('booked_middle');
                slot.classList.remove('business_booked');
                slot.classList.remove('booked_bottom');
                slot.innerText = '';
                slot.removeAttribute('title');
                slot.onclick = null;
            });
        });
    };

    const formatTime = (time) => {
        const hours = Math.floor(time);
        const minutesDecimal = time % 1;

        let minutes;
        if (minutesDecimal === 0.25) {
            minutes = '15';
        } else if (minutesDecimal === 0.5) {
            minutes = '30';
        } else if (minutesDecimal === 0.75) {
            minutes = '45';
        } else {
            minutes = '00';
        }

        return `${hours}:${minutes}`;
    };

    const colorTimeSlots = (bookingDetails) => {
        const totalSlots = (bookingDetails.endTime - bookingDetails.startTime) * 4;

        for (let i = 0; i < totalSlots; i++) {
            const time = (bookingDetails.startTime + i * 0.25).toFixed(2);
            const slotId = `${time}-${bookingDetails.employee}`;
            const slotElement = document.getElementById(slotId);

            if (slotElement) {
                slotElement.classList.add(`booked-${bookingDetails.employee}`);

                if (bookingDetails.business === true) {
                    slotElement.classList.add('business_booked');
                }

                slotElement.onclick = () => handleSlotClick(bookingDetails);

                if (i === 0) {
                    let bookingInfo = '';
                    if (previewItem === 'Name') {
                        bookingInfo = `${bookingDetails.firstName} ${bookingDetails.lastName}`;
                    } else if (previewItem === 'Email') {
                        bookingInfo = bookingDetails.email;
                    } else if (previewItem === 'Phone Number') {
                        bookingInfo = bookingDetails.phoneNumber;
                    } else if (previewItem === 'Service') {
                        bookingInfo = bookingDetails.service;
                    } else if (previewItem === 'Price') {
                        bookingInfo = bookingDetails.price;
                    } else if (previewItem === 'Time') {
                        bookingInfo = `${formatTime(bookingDetails.startTime)} - ${formatTime(bookingDetails.endTime)}`;
                    }

                    if (bookingDetails.appointmentNote !== '') {
                        bookingInfo += `<span class='note_indicator'></span>`;
                    }

                    slotElement.innerHTML = bookingInfo;
                    slotElement.setAttribute('title', `Booking: ${bookingDetails.firstName} ${bookingDetails.lastName}`);
                }

                if (totalSlots === 1) continue;
                else if (totalSlots === 2) {
                    slotElement.classList.add(i === 0 ? 'booked_top' : 'booked_bottom');
                } else if (totalSlots === 3) {
                    if (i === 0) slotElement.classList.add('booked_top');
                    else if (i === totalSlots - 1) slotElement.classList.add('booked_bottom');
                    else slotElement.classList.add('booked_middle');
                } else if (totalSlots >= 4) {
                    if (i === 0) slotElement.classList.add('booked_top');
                    else if (i === totalSlots - 1) slotElement.classList.add('booked_bottom');
                    else slotElement.classList.add('booked_middle');
                }
            }
        }
    };

    const handleSlotClick = (bookingDetails) => {
        const startTime = bookingDetails.startTime;
        const endTime = bookingDetails.endTime;

        const bookingSlots = document.querySelectorAll(`.booked-${bookingDetails.employee}`);
        const slotElements = Array.from(bookingSlots).filter(slot => {
            const timeSlot = parseFloat(slot.id.split('-')[0]);
            return timeSlot >= startTime && timeSlot < endTime;
        });
    
        const firstSlot = slotElements[0];
        const firstSlotRect = firstSlot.getBoundingClientRect();
        const calendarContainer = document.querySelector('.calendar');
        const calendarRect = calendarContainer.getBoundingClientRect();
        const calendarTimes = document.querySelector('.calendar_times');
        const calendarTimesWidth = calendarTimes ? calendarTimes.offsetWidth : 0;
    
        const position = {
            top: firstSlotRect.top - calendarRect.top - 10, 
            left: firstSlotRect.left - calendarRect.left - calendarTimesWidth - 0.5, 
        };
    
        const slotWidth = firstSlot.offsetWidth;
        setBooking({ ...bookingDetails, position, width: slotWidth });
    };

    // Only fetch bookings when date or calendarUpdateTrigger changes
    useEffect(() => {
        const fetchBookingsForSelectedDate = async () => {
            const selectedDateString = getFormattedDateString(currentDate);
            const currentQueryId = ++queryIdRef.current;

            const newBookings = {};
            for (let employee of employees) {
                try {
                    const q = query(collection(db, 'bookings'), where('date', '==', selectedDateString), where('employee', '==', employee));
                    const querySnapshot = await getDocs(q);
    
                    if (queryIdRef.current !== currentQueryId) {
                        return;
                    }

                    const employeeBookings = [];
                    if (!querySnapshot.empty) {
                        querySnapshot.forEach((doc) => {
                            employeeBookings.push({ firestoreId: doc.id, ...doc.data() });
                        });
                    }

                    newBookings[employee] = employeeBookings;
                } catch (error) {
                    console.error(`Error fetching bookings for ${employee}: `, error);
                }
            }

            setBookings(newBookings);
        };

        fetchBookingsForSelectedDate();
    }, [currentDate, calendarUpdateTrigger, employees]);

    // Clear and color time slots when bookings or viewState changes
    useEffect(() => {
        clearTimeSlots();

        employees.forEach((employee, index) => {
            if (viewState[index] && bookings[employee]) {
                bookings[employee].forEach((bookingDetails) => {
                    colorTimeSlots(bookingDetails);
                });
            }
        });
    }, [bookings, viewState, clearTimeSlots]);

    const generateTimeSlotId = (slotIndex, employee) => {
        const baseTime = 9; 
        const time = baseTime + (slotIndex * 0.25);
        return `${time.toFixed(2)}-${employee}`;
    };

    const renderCalendarSection = (employee) => (
        Array(32).fill().map((_, slotIndex) => (
            <span
                className='calendar_time_inner'
                key={slotIndex}
                id={generateTimeSlotId(slotIndex, employee)}
            ></span>
        ))
    );

    return (
        <div className="calendar" style={{ position: 'relative' }}>
            <div className="calendar_times">
                {['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
                    <p className="calendar_time_text" key={time}>{time}</p>
                ))}
            </div>
    
            <div className='calendar_main'>
                <Booking booking={booking} setBooking={setBooking} handleCalendarUpdate={handleCalendarUpdate} />
                <span className='hour_span' style={{ top: '99.5px' }}></span>
                <span className='hour_span' style={{ top: '199.5px' }}></span>
                <span className='hour_span' style={{ top: '299.5px' }}></span>
                <span className='hour_span' style={{ top: '399.5px' }}></span>
                <span className='hour_span' style={{ top: '499.5px' }}></span>
                <span className='hour_span' style={{ top: '599.5px' }}></span>
                <span className='hour_span' style={{ top: '699.5px' }}></span>
    
                {viewState[0] && <div className={`calendar_section calendar_section_${employees[0].toLowerCase()}`} key={employees[0]}>
                    {renderCalendarSection(employees[0])}
                </div>}

                {viewState[1] && <div className={`calendar_section calendar_section_${employees[1].toLowerCase()}`} key={employees[1]}>
                    {renderCalendarSection(employees[1])}
                </div>}

                {viewState[2] && <div className={`calendar_section calendar_section_${employees[2].toLowerCase()}`} key={employees[2]}>
                    {renderCalendarSection(employees[2])}
                </div>}

                {viewState[3] && <div className={`calendar_section calendar_section_${employees[3].toLowerCase()}`} key={employees[3]}>
                    {renderCalendarSection(employees[3])}
                </div>}
            </div>
        </div>
    );
};
