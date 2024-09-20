import React, { useEffect, useState } from 'react';
import { Nav } from '../sections/Nav.js';
import { Notif } from '../sections/Notif.js';
import '../styles/pending/Pending.css';
import { getDocs, collection, doc, deleteDoc, addDoc } from 'firebase/firestore'; 
import { db } from '../config/Firebase.js'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faClock, faSliders, faUser } from '@fortawesome/free-solid-svg-icons'; 
import { Filters } from '../sections/pending/Filters.js';

export const Pending = ({ notif, setNotif, setNotifText, notifText }) => {
    const [pendingBookings, setPendingBookings] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingBooking, setCancellingBooking] = useState(null); 
    const [cancellingLoading, setCancellingLoading] = useState(false);
    const [filters, setFilters] = useState(false);
    const [customerInfo, setCustomerInfo] = useState(0);
    const [sort, setSort] = useState(0);
    const [isRestoring, setIsRestoring] = useState(false); // Added to handle restore button spam

    useEffect(() => {
        const fetchPendingBookings = async () => {
            try {
                const pendingSnapshot = await getDocs(collection(db, 'pendingBookings'));
                const bookingsSnapshot = await getDocs(collection(db, 'bookings'));

                const pendingList = pendingSnapshot.docs.map(doc => ({
                    firestoreId: doc.id,
                    ...doc.data(),
                }));

                const bookingsList = bookingsSnapshot.docs.map(doc => ({
                    firestoreId: doc.id,
                    ...doc.data(),
                }));

                pendingList.sort((a, b) => new Date(a.date) - new Date(b.date));

                setPendingBookings(pendingList);
                setAllBookings(bookingsList);
            } catch (error) {
                console.error("Error fetching bookings: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPendingBookings();
    }, []);

    // Function to check if a pending booking overlaps with any existing bookings
    const isOverlapping = (pendingBooking) => {
        return allBookings.some(booking => {
            if (booking.employee === pendingBooking.employee && booking.date === pendingBooking.date) {
                const bookingStart = booking.startTime;
                const bookingEnd = booking.endTime;
                const pendingStart = pendingBooking.startTime;
                const pendingEnd = pendingBooking.endTime;

                return (
                    (pendingStart >= bookingStart && pendingStart < bookingEnd) || 
                    (pendingEnd > bookingStart && pendingEnd <= bookingEnd) ||    
                    (pendingStart <= bookingStart && pendingEnd >= bookingEnd)
                );
            }
            return false;
        });
    };

    // Restore a booking and prevent spam clicking
    const restoreBooking = async (booking) => {
        if (isRestoring) return; // Prevent restore if it's already in progress
        try {
            setIsRestoring(true); // Set restoring state to true
            setLoading(true);

            const { firestoreId, ...bookingData } = booking;
            await addDoc(collection(db, 'bookings'), bookingData);
            await deleteDoc(doc(db, 'pendingBookings', firestoreId));

            setPendingBookings(prevBookings => prevBookings.filter(b => b.firestoreId !== firestoreId));
        } catch (error) {
            console.error('Error restoring booking:', error);
        } finally {
            setLoading(false);
            setIsRestoring(false); // Reset restoring state
            setNotifText('Booking restored successfully.');
            setNotif(true);
            setTimeout(() => setNotif(false), 3000);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });

        const daySuffix = (day) => {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };

        return `${day}${daySuffix(day)} ${month}`;
    };

    const formatTime = (decimalTime) => {
        const hours = Math.floor(decimalTime);
        const minutes = Math.round((decimalTime - hours) * 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const groupBookings = (bookings, groupBy) => {
        return bookings.reduce((grouped, booking) => {
            const groupKey = booking[groupBy];
            if (!grouped[groupKey]) {
                grouped[groupKey] = [];
            }
            grouped[groupKey].push(booking);
            return grouped;
        }, {});
    };

    const groupedBookings = groupBookings(pendingBookings, sort === 0 ? 'date' : 'employee');

    const cancelBooking = async () => {
        try {
            setCancellingLoading(true);
            await deleteDoc(doc(db, 'pendingBookings', cancellingBooking.firestoreId));
            setPendingBookings(prevBookings => prevBookings.filter(b => b.firestoreId !== cancellingBooking.firestoreId));
        } catch (error) {
            console.error('Error cancelling booking:', error);
        } finally {
            setCancellingLoading(false);
            setCancellingBooking(null);
            setNotifText('Booking cancelled successfully.');
            setNotif(true);
            setTimeout(() => setNotif(false), 3000);
        }
    };

    return (
        <div className="pending">
            {cancellingBooking && (
                <div className="pending_cancelling">
                    <div className='pending_cancelling_inner'>
                        {cancellingLoading && 
                        <div className='pending_cancelling_loading_div'>
                            <span className='pending_cancelling_loading'></span>
                        </div>}
                        <p className='pending_cancelling_title'>Cancelling Appointment {`${String(cancellingBooking.bookingId).substring(0, 3)}...`}</p>
                        <p className='pending_cancelling_text'>Are you sure you want to cancel this appointment? This will be removed from your portal. We will send an email confirmation to the customer.</p>
                        <div className='pending_cancelling_buttons'>
                            <button className='pending_cancelling_button' onClick={cancelBooking}>Cancel Appointment</button>
                            <button className='pending_cancelling_button' onClick={() => setCancellingBooking(null)}>Go Back</button>
                        </div>
                    </div>
                </div>
            )}

            {notif && <Notif notifText={notifText} />}
            <Nav />

            {filters && <Filters customerInfo={customerInfo} setCustomerInfo={setCustomerInfo} setFilters={setFilters} sort={sort} setSort={setSort}/>}

            <div className="pending_content">
                <div className='pending_filter'>
                    <div className='pending_filter_left' onClick={() => setFilters(true)}>
                        <FontAwesomeIcon icon={faSliders} className='pending_filter_icon'/>
                        <p className='pending_filter_text'>Filters</p>
                    </div>
                </div>

                {loading && (
                    <div className="loading_pending_div">
                        <span className='loading_pending_icon'></span>
                    </div>
                )}

                {pendingBookings.length > 0 && <div className="pending_header">
                    <span className="pending_header_span">Time</span>
                    <span className="pending_header_span">Service</span>
                    <span className="pending_header_span">Customer</span>
                    <span className="pending_header_span">Reference No.</span>
                    <span className="pending_header_span">Action</span>
                </div>}

                {Object.keys(groupedBookings).length > 0 ? (
                    Object.keys(groupedBookings).map((groupKey) => (
                        <div key={groupKey} className="pending_section">
                            <div className='pending_section_title_outer'>
                                <FontAwesomeIcon icon={sort === 0 ? faCalendar : faUser} className='pending_section_title_icon'/>
                                <h3 className='pending_section_title'>{sort === 0 ? formatDate(groupKey) : groupKey}</h3>
                            </div>

                            {groupedBookings[groupKey].map((booking) => (
                                <div key={booking.bookingId} className="pending_booking">
                                    <div className='pending_booking_inner'>
                                        <FontAwesomeIcon icon={faClock} className='pending_booking_time_icon'/>
                                        <p className='pending_booking_text'>
                                            {sort === 1 && `${formatDate(booking.date)}, `}
                                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                        </p>
                                    </div>

                                    <div className='pending_booking_inner'>
                                        {sort === 0 && (
                                            <span className={`pending_booking_employee_initial ${booking.employee === 'Bobby' ? 'pbei_bobby' : ''} ${booking.employee === 'Tommy' ? 'pbei_tommy' : ''} ${booking.employee === 'Jasmine' ? 'pbei_jasmine' : ''} ${booking.employee === 'Harry' ? 'pbei_harry' : ''}`}>
                                                {booking.employee.charAt(0)} 
                                            </span>
                                        )}
                                        <p className='pending_booking_text'>{booking.service}</p>
                                    </div>

                                    <div className='pending_booking_inner'>
                                        <p className='pending_booking_text'>
                                            {customerInfo === 0 && `${booking.firstName} ${booking.lastName}`}
                                            {customerInfo === 1 && booking.email}
                                            {customerInfo === 2 && booking.phoneNumber}
                                        </p>
                                    </div>

                                    <div className='pending_booking_inner'>
                                        <p className='pending_booking_text'>
                                            {booking.bookingId ? `${String(booking.bookingId).substring(0, 3)}...` : 'No ID'}
                                        </p>
                                    </div>

                                    <div className='pending_booking_inner'>
                                        {!isOverlapping(booking) && (
                                            <button 
                                                className='pending_booking_button pbb_restore'
                                                onClick={() => restoreBooking(booking)}
                                                disabled={isRestoring} // Disable button while restoring
                                            >
                                                {isRestoring ? 'Restoring...' : 'Restore'}
                                            </button>
                                        )}
                                        <button 
                                            className='pending_booking_button pbb_cancel' 
                                            onClick={() => setCancellingBooking(booking)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <div className="pending_no_bookings">This page displays a list of bookings that have been removed from your calendar. You currently have none.</div>
                )}
            </div> 
        </div>
    );
};
