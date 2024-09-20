import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { doc, deleteDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../config/Firebase.js'; 
import '../../styles/home/Booking.css';

export const Booking = ({ setBooking, booking, handleCalendarUpdate }) => {

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

    const removeBooking = async () => {
        try {
            const { firestoreId, position, width, ...bookingData } = booking; 
    
            const bookingRef = doc(db, 'bookings', firestoreId);
            const pendingBookingsRef = collection(db, 'pendingBookings');
    
            await addDoc(pendingBookingsRef, bookingData);
            await deleteDoc(bookingRef);

            handleCalendarUpdate(); 
            setBooking(null);
    
            console.log('Booking moved to pendingBookings and removed from bookings');
        } catch (error) {
            console.error('Error removing booking:', error);
        }
    };
    

    const getEmployeeClass = (employee) => {
        switch (employee) {
            case 'Bobby': return 'bobby';
            case 'Tommy': return 'tommy';
            case 'Harry': return 'harry';
            case 'Jasmine': return 'jasmine';
            default: return '';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    };

    if (!booking) return null;

    const { position, width } = booking; 

    return (
        <>
            <div className={`booking_top ${getEmployeeClass(booking.employee)}`}>
                <p className='booking_time'>
                    <span className='booking_time_inner'>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                    {formatDate(booking.date)}
                </p>
                <FontAwesomeIcon icon={faTimes} className="close_booking" onClick={() => setBooking(false)} />
            </div>

            <div className="booking_middle">
                <p className='client_info'>Client Information</p>
                <p className='client_info_item'>{booking.firstName} {booking.lastName}</p>
                <p className='client_info_item'>{booking.email}</p>
                <p className='client_info_item'>{booking.phoneNumber}</p>
                <p className='client_info'>Booking Information</p>
                <p className='client_info_item'>{booking.service}</p>
                <p className='client_info_item'>{booking.price}</p>
                {booking.appointmentNote !== '' && 
                <>
                    <p className='client_info'>Appointment Note</p>
                    <p className='client_info_item client_info_item_note'>{booking.appointmentNote}</p>
                </>}
            </div>

            <button 
                className={`remove_booking ${getEmployeeClass(booking.employee)}`} 
                onClick={removeBooking}
            >
                Remove
            </button>
        </>
    );
};
