import '../styles/PendingBookings.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { db } from '../config/Firebase.js'; 
import { collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';

export const PendingBookings = ({ setPendingBookings, setNotif, setNotifText, handleCalendarUpdate }) => {
    const [pendingBookings, setPendingBookingsState] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [removeConfirmId, setRemoveConfirmId] = useState(null); 
    const [emailConfirmation, setEmailConfirmation] = useState(null); 

    const formatTime = (decimalTime) => {
        const hours = Math.floor(decimalTime);
        const minutes = Math.round((decimalTime - hours) * 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const pendingSnapshot = await getDocs(collection(db, 'pendingBookings'));
                const bookingsSnapshot = await getDocs(collection(db, 'bookings'));

                const pendingList = pendingSnapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() }));
                const bookingsList = bookingsSnapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() }));

                setPendingBookingsState(pendingList);
                setAllBookings(bookingsList);
            } catch (error) {
                console.error("Error fetching bookings: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
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

    const handleRemoveConfirm = (bookingId) => {
        setRemoveConfirmId(bookingId);
    };

    const handleCancelRemove = () => {
        setRemoveConfirmId(null);
    };

    const handleRemoveBooking = async (booking, sendEmail) => {
        try {
            await deleteDoc(doc(db, 'pendingBookings', booking.firestoreId));
            setPendingBookingsState(prev => prev.filter(b => b.firestoreId !== booking.firestoreId));

            setNotifText('Booking successfully removed!');
            setNotif(true);
            setTimeout(() => setNotif(false), 3000);

            if (sendEmail) {
                console.log('Sending cancellation confirmation email...');
            }

        } catch (error) {
            console.error('Error removing booking: ', error);
        }
        setRemoveConfirmId(null);
        setEmailConfirmation(null); 
    };

    const handleRestoreBooking = async (booking) => {
        try {
            if (!booking.firestoreId) {
                throw new Error('Invalid booking ID');
            }
    
            const { firestoreId, ...bookingDataWithoutId } = booking;
    
            await addDoc(collection(db, 'bookings'), bookingDataWithoutId);
            await deleteDoc(doc(db, 'pendingBookings', booking.firestoreId));

            setPendingBookingsState(prev => prev.filter(b => b.firestoreId !== booking.firestoreId));
            setAllBookings(prev => [...prev, bookingDataWithoutId]);
    
            handleCalendarUpdate();
    
            setNotifText('Booking successfully restored!');
            setNotif(true);
            setTimeout(() => setNotif(false), 3000);
    
            console.log('Booking successfully restored!');
        } catch (error) {
            console.error('Error restoring booking: ', error);
        }
    };

    const handleEmailConfirmation = (booking) => {
        setEmailConfirmation(booking.firestoreId); 
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
                    {loading ? (
                        <div className="loading_spinner_pb">
                            <FontAwesomeIcon icon={faSpinner} spin size="5x" />
                        </div>
                    ) : (
                        pendingBookings.length > 0 ? (
                            pendingBookings.map((booking) => (
                                <div key={booking.firestoreId} className='pending_booking_item'>
                                    {removeConfirmId === booking.firestoreId ? (
                                        emailConfirmation === booking.firestoreId ? (
                                            <div className='pb_email_confirmation'>
                                                <p>Would you like us to send a cancellation confirmation email for you?</p>
                                                <div className='pb_remove_buttons'>
                                                    <button 
                                                        className='pb_action_button'
                                                        onClick={() => handleRemoveBooking(booking, true)}
                                                    >
                                                        Yes
                                                    </button>
                                                    <button 
                                                        className='pb_action_button'
                                                        onClick={() => handleRemoveBooking(booking, false)}
                                                    >
                                                        No
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className='pb_remove_confirmation'>
                                                <p>Are you sure you want to remove this booking? The customer will not be notified and this will be removed from all records.</p>
                                                <div className='pb_remove_buttons'>
                                                    <button 
                                                        className='pb_action_button'
                                                        onClick={() => handleEmailConfirmation(booking)}
                                                    >
                                                        Yes
                                                    </button>
                                                    <button 
                                                        className='pb_action_button' 
                                                        onClick={handleCancelRemove}
                                                    >
                                                        No
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <>
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
                                                <button 
                                                    className='pb_action_button' 
                                                    onClick={() => handleRemoveConfirm(booking.firestoreId)}
                                                >
                                                    Remove
                                                </button>
                                                {!isOverlapping(booking) && (
                                                    <button 
                                                        className='pb_action_button' 
                                                        onClick={() => handleRestoreBooking(booking)}
                                                    >
                                                        Restore
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No pending bookings available.</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
