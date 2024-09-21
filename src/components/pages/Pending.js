import React, { useEffect, useState } from 'react';
import { Nav } from '../sections/Nav.js';
import { Notif } from '../sections/Notif.js';
import '../styles/pending/Pending.css';
import { getDocs, collection, doc, deleteDoc, addDoc } from 'firebase/firestore'; 
import { db } from '../config/Firebase.js'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faCancel, faClipboard, faClock, faConciergeBell, faEllipsisH, faHashtag, faSliders, faTasks, faTrashRestore, faUser, faUserCircle } from '@fortawesome/free-solid-svg-icons'; 
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
    const [isRestoring, setIsRestoring] = useState(false);
    const [isNarrowView, setIsNarrowView] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsNarrowView(window.innerWidth < 1100);
            setIsMobileView(window.innerWidth < 700);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

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

    const restoreBooking = async (booking) => {
        if (isRestoring) return;
        try {
            setIsRestoring(true); 
            setLoading(true);

            const { firestoreId, ...bookingData } = booking;
            await addDoc(collection(db, 'bookings'), bookingData);
            await deleteDoc(doc(db, 'pendingBookings', firestoreId));

            setPendingBookings(prevBookings => prevBookings.filter(b => b.firestoreId !== firestoreId));
        } catch (error) {
            console.error('Error restoring booking:', error);
        } finally {
            setLoading(false);
            setIsRestoring(false); 
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
                    <span className={`pending_header_span phs1 ${sort == 0 && 'phs_sorted1'}`}>Time</span>
                    <span className={`pending_header_span phs2 ${sort == 0 && 'phs_sorted2'}`}>Service</span>
                    <span className="pending_header_span phs3">Customer</span>
                    <span className="pending_header_span phs4">Ref.</span>
                    <span className="pending_header_span phs5">Action</span>
                </div>}

                {Object.keys(groupedBookings).length > 0 ? (
                    Object.keys(groupedBookings).map((groupKey) => (
                        <div key={groupKey} className="pending_section">
                            <div className='pending_section_title_outer'>
                                <FontAwesomeIcon icon={sort === 0 ? faCalendar : faUser} className='pending_section_title_icon'/>
                                <h3 className='pending_section_title'>{sort === 0 ? formatDate(groupKey) : groupKey}</h3>
                            </div>
                            <div className='pending_section_inner'>
                                {groupedBookings[groupKey].map((booking) => (
                                    <div key={booking.bookingId} className="pending_booking">
                                        <div className={`pending_booking_inner pbi1 ${sort == 0 && 'pbi_sorted1'}`}>
                                            <FontAwesomeIcon icon={faClock} className='pending_booking_time_icon'/>
                                            <p className='pending_booking_text'>
                                                {sort === 1 && `${formatDate(booking.date)}, `}
                                                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                            </p>
                                        </div>

                                        <div className={`pending_booking_inner pbi2 ${sort == 0 && 'pbi_sorted2'}`}>
                                            {isMobileView && <FontAwesomeIcon icon={faClipboard} className='pending_booking_mobile_icon'/>}
                                            {sort === 0 && (
                                                <span className={`pending_booking_employee_initial ${booking.employee === 'Bobby' ? 'pbei_bobby' : ''} ${booking.employee === 'Tommy' ? 'pbei_tommy' : ''} ${booking.employee === 'Jasmine' ? 'pbei_jasmine' : ''} ${booking.employee === 'Harry' ? 'pbei_harry' : ''}`}>
                                                    {booking.employee.charAt(0)} 
                                                </span>
                                            )}
                                            <p className='pending_booking_text'>{booking.service}</p>
                                        </div>

                                        <div className='pending_booking_inner pbi3'>
                                            <p className='pending_booking_text'>
                                                {isMobileView && <FontAwesomeIcon icon={faUser} className='pending_booking_mobile_icon'/>}
                                                {customerInfo === 0 && `${booking.firstName} ${booking.lastName}`}
                                                {customerInfo === 1 && booking.email}
                                                {customerInfo === 2 && booking.phoneNumber}
                                            </p>
                                        </div>

                                        <div className='pending_booking_inner pbi4'>
                                            <p className='pending_booking_text'>
                                                {isMobileView && <FontAwesomeIcon icon={faHashtag} className='pending_booking_mobile_icon'/>}
                                                {booking.bookingId ? `${String(booking.bookingId).substring(0, 3)}...` : 'No ID'}
                                            </p>
                                        </div>

                                        <div className='pending_booking_inner pbi5'>
                                            {isMobileView && <FontAwesomeIcon icon={faTasks} className='pending_booking_mobile_icon'/>}
                                            {!isOverlapping(booking) && (
                                                <button 
                                                    className='pending_booking_button pbb_restore'
                                                    onClick={() => restoreBooking(booking)}
                                                    disabled={isRestoring} // Disable button while restoring
                                                >
                                                    {isNarrowView ? <FontAwesomeIcon icon={faTrashRestore}/> : 'Restore'}
                                                </button>
                                            )}
                                            <button 
                                                className='pending_booking_button pbb_cancel' 
                                                onClick={() => setCancellingBooking(booking)}
                                            >
                                                {isNarrowView ? <FontAwesomeIcon icon={faCancel}/> : 'Cancel'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        ))
                    ) : (
                        <div className="pending_no_bookings">This page displays a list of bookings that have been removed from your calendar. You currently have none.</div>
                    )}
            </div> 
        </div>
    );
};
