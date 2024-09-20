import { useEffect, useState } from 'react';
import '../../styles/manage/AddAvailability.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faTimes } from '@fortawesome/free-solid-svg-icons';
import { collection, addDoc, where, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/Firebase.js'; 

export const AddAvailability = ({ refreshBookings, setAdding, employee, setNotif, setNotifText }) => {
    
    const getTomorrow = () => {
        const tomorrow = new Date();
        const todayDay = tomorrow.getDay(); 
        
        if (todayDay === 5) { 
            tomorrow.setDate(tomorrow.getDate() + 3);
        } else if (todayDay === 6) { 
            tomorrow.setDate(tomorrow.getDate() + 2);
        } else {
            tomorrow.setDate(tomorrow.getDate() + 1); 
        }
        
        return tomorrow;
    };
    

    const [availabilityType, setAvailabilityType] = useState(0);
    const [selectedDate, setSelectedDate] = useState(getTomorrow());
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const employeeList = ['Bobby', 'Harry', 'Jasmine', 'Tommy']; 

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // Helper functions
    const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    const convertTimeToDecimal = (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours + minutes / 60;
    };

    const calculateDuration = (startTime, endTime) => (convertTimeToDecimal(endTime) - convertTimeToDecimal(startTime)) * 60;

    const getNextWeekday = (date, direction = 1) => {
        const newDate = new Date(date);
        do {
            newDate.setDate(newDate.getDate() + direction);
        } while (newDate.getDay() === 0 || newDate.getDay() === 6); 
        return newDate;
    };

    const updateDate = (days) => setSelectedDate(getNextWeekday(selectedDate, days));

    const isTomorrow = (date) => date.toDateString() === getTomorrow().toDateString();

    const generateTimeOptions = () => {
        const options = [];
        for (let hour = 9; hour < 17; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                options.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
            }
        }
        return options;
    };

    const timeOptions = generateTimeOptions();

    // Booking logic
    const handleAddBooking = async () => {
        setLoading(true);
        let removedCount = 0; // To count removed bookings
        try {
            const startDecimal = convertTimeToDecimal(startTime);
            const endDecimal = convertTimeToDecimal(endTime);
            const duration = calculateDuration(startTime, endTime);
            const employeesToBook = employee === 'All Staff' ? employeeList : [employee];

            // Check for business booking conflicts
            const checkBusinessConflict = async (staffMember) => {
                const q = query(
                    collection(db, 'bookings'),
                    where('employee', '==', staffMember),
                    where('date', '==', selectedDate.toDateString()),
                    where('business', '==', true),
                    where('startTime', '<=', endDecimal),
                    where('endTime', '>=', startDecimal)
                );
                const querySnapshot = await getDocs(q);
                return querySnapshot.docs.length > 0;
            };

            const businessConflicts = await Promise.all(employeesToBook.map(checkBusinessConflict));

            if (businessConflicts.includes(true)) {
                setError('You have already booked time off during this time.');
                setTimeout(() => setError(''), 3000);
                setLoading(false);
                return;
            }

            const handleOverlaps = async (staffMember) => {
                const q = query(
                    collection(db, 'bookings'),
                    where('employee', '==', staffMember),
                    where('date', '==', selectedDate.toDateString()),
                    where('startTime', '<=', endDecimal),
                    where('endTime', '>=', startDecimal)
                );
                const querySnapshot = await getDocs(q);

                for (const docSnapshot of querySnapshot.docs) {
                    const booking = docSnapshot.data();
                    await addDoc(collection(db, 'pendingBookings'), booking);
                    await deleteDoc(doc(db, 'bookings', docSnapshot.id));
                    removedCount++;
                }
            };

            await Promise.all(employeesToBook.map(handleOverlaps));

            const createBooking = async (staffMember) => {
                const newBooking = {
                    bookingId: Math.floor(1000000000000000 + Math.random() * 9000000000000000),
                    employee: staffMember,
                    date: selectedDate.toDateString(),
                    startTime: startDecimal,
                    endTime: endDecimal,
                    duration,
                    price: 'Scheduled time off',
                    service: 'Scheduled time off',
                    firstName: 'Scheduled time off',
                    lastName: '',
                    email: 'Scheduled time off',
                    phoneNumber: 'Scheduled time off',
                    appointmentNote: '',
                    business: true,
                    createdAt: new Date().toISOString(),
                };
                await addDoc(collection(db, 'bookings'), newBooking);
            };

            await Promise.all(employeesToBook.map(createBooking));

            if (refreshBookings) refreshBookings();

            if (removedCount > 0) {
                console.log('yes')
                setNotifText(`Caution: you have removed ${removedCount} bookings from your calendar.`);
                setNotif(true);
                setTimeout(() => {setNotifText(''); setNotif(false)}, 3000);  
            }

            setAdding(false);
        } catch (error) {
            console.error('Error adding booking:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add_availability">
            <div className="add_availability_inner">
                {loading && <div className="add_availability_loading"><span className="add_availability_loading_span"></span></div>}
                <div className="add_availability_top">
                    <div className="add_availability_top_left">
                        <h4 className="add_availability_title">Add event</h4>
                        <p className="current_event_text">{employee}&nbsp;&nbsp;&nbsp;{formatDate(selectedDate)}&nbsp;&nbsp;&nbsp;{startTime} - {endTime}</p>
                    </div>
                    <FontAwesomeIcon icon={faTimes} className="add_availability_close" onClick={() => setAdding(false)} />
                </div>
                <p className="add_availability_subtitle">Select type of event</p>

                <div className="add_availability_buttons">
                    <button className={`aa_button ${availabilityType === 0 ? 'aa_button_selected' : ''}`} onClick={() => { setAvailabilityType(0); setEndTime('17:00'); setStartTime('09:00'); }}>Day</button>
                    <button className={`aa_button ${availabilityType === 1 && 'aa_button_selected'}`} onClick={() => setAvailabilityType(1)}>Selected Hours</button>
                </div>

                <div className="add_availability_timedate">
                    <div className="add_availability_date_outer">
                        <p className="add_availability_subtitle">Select Date</p>
                        <div className="add_availability_date">
                            <FontAwesomeIcon
                                icon={faChevronLeft}
                                className={`add_availability_date_arrow ${isTomorrow(selectedDate) && 'aada_disabled'}`}
                                onClick={() => updateDate(-1)}
                            />
                            <span className="add_availability_date_text">{formatDate(selectedDate)}</span>
                            <FontAwesomeIcon icon={faChevronRight} className="add_availability_date_arrow" onClick={() => updateDate(1)} />
                        </div>
                    </div>

                    {availabilityType === 1 && (
                        <div className="add_availability_time">
                            <p className="add_availability_subtitle">Select Time</p>
                            <div className="add_availability_time_inner">
                                <select className="add_availability_time_selector" value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                                    {timeOptions.map((time, index) => (
                                        <option key={index} value={time}>{time}</option>
                                    ))}
                                </select>
                                <p>&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;</p>
                                <select className="add_availability_time_selector" value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                                    {timeOptions.map((time, index) => (
                                        <option key={index} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <button className="add_availability_submit" onClick={handleAddBooking}>Confirm</button>
                <p className="add_availability_error">{error}</p>
            </div>
        </div>
    );
};
