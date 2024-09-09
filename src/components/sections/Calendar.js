import React, { useEffect, useRef } from 'react';
import '../styles/Calendar.css';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/Firebase.js';

export const Calendar = ({ currentDate, setBooking, previewItem }) => {
    const employees = ['Bobby', 'Tommy', 'Jasmine', 'Harry'];
    const queryIdRef = useRef(0);

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

    const colorTimeSlots = (startTime, endTime, employee, firstName, lastName, email, number, note, price, service, date) => {
        const totalSlots = (endTime - startTime) * 4;
    
        for (let i = 0; i < totalSlots; i++) {
            const time = (startTime + i * 0.25).toFixed(2);
            const slotId = `${time}-${employee}`;
            const slotElement = document.getElementById(slotId);
    
            if (slotElement) {
                slotElement.classList.add(`booked-${employee}`);
    
                const bookingDetails = {
                    date, email, number, employee, price, service, note,
                    time: `${formatTime(startTime)} - ${formatTime(endTime)}`,
                    customer: `${firstName} ${lastName}`
                };
    
                slotElement.onclick = () => handleSlotClick(bookingDetails);
    
                if (i === 0) {
                    // Display different preview based on selected item (previewItem)
                    let bookingInfo = '';
                    if (previewItem === 'Name') {
                        bookingInfo = `${firstName} ${lastName}`;
                    } else if (previewItem === 'Email') {
                        bookingInfo = email;
                    } else if (previewItem === 'Phone Number') {
                        bookingInfo = number;
                    } else if (previewItem === 'Service') {
                        bookingInfo = service;
                    } else if (previewItem === 'Price') {
                        bookingInfo = price;
                    } else if (previewItem === 'Time') {
                        bookingInfo = `${formatTime(startTime)} - ${formatTime(endTime)}`;
                    }
    
                    // If there's a note, append the note indicator
                    if (note !== '') {
                        bookingInfo += `<span class='note_indicator'></span>`;
                    }
    
                    slotElement.innerHTML = bookingInfo;
    
                    // Add a tooltip with the booking details
                    slotElement.setAttribute('title', `Booking: ${firstName} ${lastName}`);
                }
    
                if (totalSlots === 1) {
                    continue;
                } else if (totalSlots === 2) {
                    slotElement.classList.add(i === 0 ? 'booked_top' : 'booked_bottom');
                } else if (totalSlots === 3) {
                    if (i === 0) {
                        slotElement.classList.add('booked_top');
                    } else if (i === totalSlots - 1) {
                        slotElement.classList.add('booked_bottom');
                    } else {
                        slotElement.classList.add('booked_middle');
                    }
                } else if (totalSlots >= 4) {
                    if (i === 0) {
                        slotElement.classList.add('booked_top');
                    } else if (i === totalSlots - 1) {
                        slotElement.classList.add('booked_bottom');
                    } else {
                        slotElement.classList.add('booked_middle');
                    }
                }
            }
        }
    };
    

    const handleSlotClick = (bookingDetails) => {
        setBooking(bookingDetails);
    };

    useEffect(() => {
        const fetchBookingsForSelectedDate = async () => {
            const selectedDateString = getFormattedDateString(currentDate);

            const currentQueryId = ++queryIdRef.current;
            clearTimeSlots();

            for (let employee of employees) {
                try {
                    const q = query(collection(db, 'bookings'), where('date', '==', selectedDateString), where('employee', '==', employee));
                    const querySnapshot = await getDocs(q);

                    if (queryIdRef.current !== currentQueryId) {
                        return;
                    }

                    if (!querySnapshot.empty) {
                        querySnapshot.forEach((doc) => {
                            const booking = doc.data();
                            const email = booking.email;
                            const number = booking.phoneNumber;
                            const startTime = booking.startTime;
                            const endTime = booking.endTime;
                            const firstName = booking.firstName;
                            const lastName = booking.lastName;
                            const note = booking.appointmentNote;
                            const date = booking.date;
                            const price = booking.price;
                            const service = booking.service;
                            colorTimeSlots(startTime, endTime, employee, firstName, lastName, email, number, note, price, service, date);
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching bookings for ${employee}: `, error);
                }
            }
        };

        fetchBookingsForSelectedDate();
    }, [currentDate, previewItem]);

    const generateTimeSlotId = (slotIndex, employee) => {
        const baseTime = 9; // Starting at 9 AM
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
        <div className="calendar">
            <div className="calendar_times">
                {['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
                    <p className="calendar_time_text" key={time}>{time}</p>
                ))}
            </div>

            <div className='calendar_main'>
                {employees.map(employee => (
                    <div className='calendar_section' key={employee}>
                        {renderCalendarSection(employee)}
                    </div>
                ))}
            </div>
        </div>
    );
};
