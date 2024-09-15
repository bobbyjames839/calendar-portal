import '../styles/PendingBookings.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { db } from '../config/Firebase.js'; // Ensure you have Firebase initialized here
import { collection, getDocs } from 'firebase/firestore';

export const PendingBookings = ({ setPendingBookings }) => {
    const [pendingBookings, setPendingBookingsState] = useState([]);
    const [allBookings, setAllBookings] = useState([]);

    const formatTime = (decimalTime) => {
        const hours = Math.floor(decimalTime);
        const minutes = Math.round((decimalTime - hours) * 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    // Fetch pending bookings and confirmed bookings
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const pendingSnapshot = await getDocs(collection(db, 'pendingBookings'));
                const bookingsSnapshot = await getDocs(collection(db, 'bookings'));

                const pendingList = pendingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const bookingsList = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                setPendingBookingsState(pendingList);
                setAllBookings(bookingsList);
            } catch (error) {
                console.error("Error fetching bookings: ", error);
            }
        };

        fetchBookings();
    }, []);

    // Check for time overlap
    const isOverlapping = (pendingBooking) => {
        return allBookings.some(booking => {
            // Check for same employee and same date
            if (booking.employee === pendingBooking.employee && booking.date === pendingBooking.date) {
                const bookingStart = booking.startTime;
                const bookingEnd = booking.endTime;
                const pendingStart = pendingBooking.startTime;
                const pendingEnd = pendingBooking.endTime;

                // Check if there is a time overlap
                return (
                    (pendingStart >= bookingStart && pendingStart < bookingEnd) || // Pending start time is during an existing booking
                    (pendingEnd > bookingStart && pendingEnd <= bookingEnd) ||    // Pending end time is during an existing booking
                    (pendingStart <= bookingStart && pendingEnd >= bookingEnd)    // Pending booking fully contains an existing booking
                );
            }
            return false;
        });
    };

    return (
        <div className="pending_bookings">
            <div className="pending_bookings_inner">
                <FontAwesomeIcon 
                    icon={faTimes} 
                    className='pending_bookings_close' 
                    onClick={() => setPendingBookings(false)}
                />
                <h3 className='pending_bookings_title'>Pending Bookings</h3>
                <p className='pending_bookings_subtitle'>Here is a list of your bookings that have been removed from your calendar.</p>

                <div className='pending_bookings_list'>
                    {pendingBookings.length > 0 ? (
                        pendingBookings.map((booking) => (
                            <div key={booking.id} className='pending_booking_item'>
                                <div className='pb_timing'>
                                    <span className='pb_item_inner'>{booking.date}</span>
                                    <span className='pb_item_inner'>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                                </div>

                                <div className='pb_div'>
                                    <p className='pb_item_header'>Customer Info</p>
                                    <span className='pb_item_span'>{booking.firstName} {booking.lastName}</span>
                                    <span className='pb_item_span'>{booking.email}</span>
                                    <span className='pb_item_span'>{booking.phoneNumber}</span>
                                </div>

                                <div className='pb_div'>
                                    <p className='pb_item_header'>Booking Info</p>
                                    <span className='pb_item_span'>{booking.employee}</span>
                                    <span className='pb_item_span'>{booking.service}</span>
                                    <span className='pb_item_span'>{booking.price}</span>
                                </div>

                                <div className='pb_item_buttons'>
                                    <button className='pb_action_button'>Email</button>
                                    {/* Only show restore button if no time overlap */}
                                    {!isOverlapping(booking) && (
                                        <button className='pb_action_button' onClick={() => { /* Restore logic here */ }}>
                                            Restore
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No pending bookings available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
