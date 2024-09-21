import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import '../../styles/home/Calendar.css';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/Firebase.js';
import { Booking } from './Booking.js';
import ReactDOM from 'react-dom';

export const Calendar = ({ currentDate, previewItem, calendarUpdateTrigger, handleCalendarUpdate, viewState }) => {
    const employees = useMemo(() => ['Bobby', 'Tommy', 'Jasmine', 'Harry'], []);
    const queryIdRef = useRef(0);
    const [bookings, setBookings] = useState({});
    const [selectedBooking, setSelectedBooking] = useState(null);  
    const [loading, setLoading] = useState(false);

    const handleBookingClick = useCallback((bookingDetails) => {
        if (selectedBooking && selectedBooking.firestoreId === bookingDetails.firestoreId) {
            setSelectedBooking(null);
        } else {
            setSelectedBooking(bookingDetails); 
        }
    }, [selectedBooking]);

    const formatTime = (time) => {
        const hours = Math.floor(time);
        const minutesDecimal = time % 1;
        const minutes = minutesDecimal === 0.25 ? '15' : minutesDecimal === 0.5 ? '30' : minutesDecimal === 0.75 ? '45' : '00';
        return `${hours}:${minutes}`;
    };

    const renderBookings = useCallback((bookingDetails) => {
        const calendarHeight = 880; 
        const hoursInDay = 8;  
        const startHour = bookingDetails.startTime - 9;  
        const topOffset = 3.5;  
        const top = (startHour / hoursInDay) * calendarHeight + topOffset;

        const duration = bookingDetails.endTime - bookingDetails.startTime;
        const bookingClass = duration === 0.25 ? 'booking_small_size' : duration === 0.5 ? 'booking_medium_size' : 'booking_large_size';

        let bookingSpan = document.getElementById(`booking-${bookingDetails.firestoreId}`);
        if (!bookingSpan) {
            bookingSpan = document.createElement('span');
            bookingSpan.id = `booking-${bookingDetails.firestoreId}`;
            bookingSpan.classList.add('calendar_booking', bookingClass, `booked-${bookingDetails.employee}`);
            if (bookingDetails.business === true) {
                bookingSpan.classList.add('business_booking');
            }
            bookingSpan.style.top = `${top}px`;  

            const calendarSection = document.querySelector(`.calendar_section_${bookingDetails.employee.toLowerCase()}`);
            calendarSection.appendChild(bookingSpan);

            bookingSpan.addEventListener('click', () => handleBookingClick(bookingDetails));
        }

        bookingSpan.innerHTML = '';  

        if (!selectedBooking || selectedBooking.firestoreId !== bookingDetails.firestoreId) {
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
                bookingSpan.innerHTML = `<span class="booking_info">${bookingInfo}</span><span class="note_indicator"></span>`;
            } else {
                bookingSpan.innerHTML = `<span class="booking_info">${bookingInfo}</span>`;
            }
            bookingSpan.setAttribute('title', `Booking: ${bookingDetails.firstName} ${bookingDetails.lastName}`);
        }

        if (selectedBooking && selectedBooking.firestoreId === bookingDetails.firestoreId) {
            bookingSpan.classList.add('expanded_booking');
            ReactDOM.render(
                <Booking 
                    setLoading={setLoading}
                    booking={bookingDetails} 
                    setBooking={setSelectedBooking} 
                    handleCalendarUpdate={handleCalendarUpdate} 
                />,
                bookingSpan
            );
        } else {
            bookingSpan.classList.remove('expanded_booking');  
        }
    }, [previewItem, selectedBooking, handleCalendarUpdate, handleBookingClick]);

    useEffect(() => {
        const fetchBookingsForSelectedDate = async () => {
            setLoading(true); 
            const selectedDateString = currentDate.toDateString(); 
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
            setLoading(false);
        };

        fetchBookingsForSelectedDate();
    }, [currentDate, calendarUpdateTrigger, employees]);

    useEffect(() => {
        const clearCalendarSections = () => {
            employees.forEach(employee => {
                const section = document.querySelector(`.calendar_section_${employee.toLowerCase()}`);
                if (section) {
                    section.innerHTML = '';
                }
            });
        };

        clearCalendarSections(); 
        employees.forEach((employee, index) => {
            if (viewState[index] && bookings[employee]) {
                bookings[employee].forEach((bookingDetails) => {
                    renderBookings(bookingDetails);
                });
            }
        });
    }, [bookings, viewState, renderBookings, employees]);

    return (
        <div className="calendar" style={{ position: 'relative' }}>
            <div className="calendar_times">
                {['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
                    <p className="calendar_time_text" key={time}>{time}</p>
                ))}
            </div>

            <div className='calendar_main'>
                <span className='hour_span' style={{top: '109.5px'}}></span>
                <span className='hour_span' style={{top: '219.5px'}}></span>
                <span className='hour_span' style={{top: '329.5px'}}></span>
                <span className='hour_span' style={{top: '439.5px'}}></span>
                <span className='hour_span' style={{top: '549.5px'}}></span>
                <span className='hour_span' style={{top: '659.5px'}}></span>
                <span className='hour_span' style={{top: '769.5px'}}></span>

                {loading && <div className="calendar_loading"><span className='loading_calendar_span'></span></div>}

                {employees.map((employee, index) => viewState[index] && (
                    <div className={`calendar_section calendar_section_${employee.toLowerCase()}`} key={employee}></div>
                ))}

            </div>
        </div>
    );
};
