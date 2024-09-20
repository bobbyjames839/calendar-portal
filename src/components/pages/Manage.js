import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPlus, faTimes, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore'; 
import { db } from '../config/Firebase.js';
import '../styles/manage/Manage.css';
import img1 from '../images/image1.jpg';
import img2 from '../images/image2.jpg';
import img3 from '../images/image3.jpeg';
import img4 from '../images/image4.jpeg';
import { AddAvailability } from '../sections/manage/AddAvailability';
import { Nav } from '../sections/Nav.js';
import { Notif } from '../sections/Notif.js';

export const Manage = ({ notif, setNotif, setNotifText, notifText }) => {
    const [employee, setEmployee] = useState('All Staff');
    const [adding, setAdding] = useState(false);
    const [bookings, setBookings] = useState([]); 
    const [addingBack, setAddingBack] = useState(false);
    const [removingId, setRemovingId] = useState(null);
    const [loading, setLoading] = useState(false)

    const fetchBookings = useCallback(() => {
        const bookingsRef = collection(db, 'bookings');
        let bookingsQuery;
    
        if (employee === 'All Staff') {
            bookingsQuery = query(bookingsRef, where('business', '==', true));
        } else {
            bookingsQuery = query(bookingsRef, where('business', '==', true), where('employee', '==', employee));
        }
    
        const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
            const fetchedBookings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
    
            const sortedBookings = fetchedBookings.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA - dateB;
            });
    
            setBookings(sortedBookings);
        });
    
        return unsubscribe; 
    }, [employee]);
    

    
    useEffect(() => {
        const unsubscribe = fetchBookings();
        return () => unsubscribe(); 
    }, [fetchBookings]);

    const removeBooking = async () => {
        setLoading(true);
        try {
            if (removingId) {
                const bookingRef = doc(db, 'bookings', removingId);
                await deleteDoc(bookingRef);
                console.log(`Booking with ID ${removingId} has been removed.`);
                setAddingBack(false);
                setLoading(false);
            } else {
                console.error("No booking ID found.");
            }
        } catch (error) {
            console.error("Error removing booking: ", error);
        }
    };
    
    
    const formatTime = (decimalTime) => {
        const hours = Math.floor(decimalTime);
        const minutes = Math.round((decimalTime - hours) * 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    const EmployeePicker = ({ name, image, setEmployee, isFontAwesomeIcon }) => {
        return (
            <div 
            className={`manage_employee_picker_section meps_${name.toLowerCase()}`}
            onClick={() => setEmployee(name)}
            >
        
                {isFontAwesomeIcon ? (
                    <FontAwesomeIcon icon={faUsers} className='meps_icon meps_image' />
                ) : (
                    <img src={image} alt='Profile' className='meps_image' />
                )}
                <span className='meps_span'></span>
                <span className='meps_span_2'></span>
                <p className='meps_text'>{name}</p>
                {name === employee && <span className="extra_span_meps"></span>}
            </div>
        );
    };
    

    return (
        <>
        {addingBack && <div className='add_availability_back'>
            <div className='aab_inner'>
                {loading && <div className='add_back_loading'>
                    <span className='add_back_loading_span'></span>
                </div>}
                <p className='aab_text'>Are you sure you want to remove your time, customers will be able to book this time again.</p>
                <div className='aab_buttons'>
                    <button className='aab_button aab_button_cancel' onClick={removeBooking}>Confirm</button>
                    <button className='aab_button aab_button_confirm' onClick={() => setAddingBack(false)}>Cancel</button>
                </div>
            </div>
        </div>}

        <div className="manage_page">

            <Nav/>
            {notif && <Notif notifText={notifText} setNotif={setNotif} />}

            <div className='manage_employee_picker'>
                <EmployeePicker name="Bobby" image={img1} setEmployee={setEmployee} />
                <EmployeePicker name="Tommy" image={img2} setEmployee={setEmployee} />
                <EmployeePicker name="Jasmine" image={img3} setEmployee={setEmployee} />
                <EmployeePicker name="Harry" image={img4} setEmployee={setEmployee} />
                <EmployeePicker name="All Staff" setEmployee={setEmployee} isFontAwesomeIcon={true} />
            </div>

            <div className='manage_main'>
                <div className='manage_main_top'>
                    <h3 className='manage_main_title'>{employee} Upcoming Events</h3>
                    <FontAwesomeIcon onClick={() => setAdding(prev => !prev)} icon={adding ? faTimes : faPlus} className={`add_availability_button add_availability_${employee.toLowerCase()}`} />
                </div>

                {adding && <AddAvailability setNotif={setNotif} setNotifText={setNotifText} employee={employee} setAdding={setAdding} refreshBookings={fetchBookings} />}

                <div className='manage_main_header'>
                    <span className='manage_main_header_span'>Employee</span>
                    <span className='manage_main_header_span'>Date</span>
                    <span className='manage_main_header_span'>All Day</span>
                    <span className='manage_main_header_span'>Time</span>
                    <span className='manage_main_header_span'>Action</span>
                </div>

                <div className='manage_main_bookings'>
                    {bookings.length > 0 ? (
                        bookings.map((booking) => (
                            <div key={booking.id} className='manage_booking_item'>
                                <span className='manage_booking_span'>{booking.employee}</span>
                                <span className='manage_booking_span'>{booking.date}</span>
                                <span className='manage_booking_span'>
                                    {booking.startTime === 9 && booking.endTime === 17 ? <FontAwesomeIcon icon={faCheck} className='booking_tick_icon'/> : <FontAwesomeIcon icon={faTimes} className='booking_cross_icon'/>}
                                </span>
                                <span className='manage_booking_span'>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                                <span className='manage_booking_span'>
                                    <button onClick={() => {(setAddingBack(true)); setRemovingId(booking.id)}} className='mbs_remove'>Remove</button>
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className='no_bookings_text'>No upcoming bookings</p>
                    )}
                </div>

            </div>
        </div>
        </>
    );
};
