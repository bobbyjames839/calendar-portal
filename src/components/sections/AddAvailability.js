import { useState } from 'react';
import '../styles/AddAvailability.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faTimes } from '@fortawesome/free-solid-svg-icons';
import { collection, addDoc, where, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/Firebase.js';

const formatDate = (date) => {
    return date.toDateString();
};

const getNextWeekday = (date, direction = 1) => {
    const newDate = new Date(date);
    do {
        newDate.setDate(newDate.getDate() + direction);
    } while (newDate.getDay() === 0 || newDate.getDay() === 6); 
    return newDate;
};

const generateTimeOptions = () => {
    const times = [];
    let current = new Date();
    current.setHours(9, 0, 0, 0);

    const end = new Date();
    end.setHours(17, 0, 0, 0); 

    while (current <= end) {
        const timeString = current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        times.push(timeString);
        current.setMinutes(current.getMinutes() + 15);
    }

    return times;
};

const convertTimeToDecimal = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours + minutes / 60;
};

const calculateDuration = (startTime, endTime) => {
    const startDecimal = convertTimeToDecimal(startTime);
    const endDecimal = convertTimeToDecimal(endTime);
    return (endDecimal - startDecimal) * 60; 
};

export const AddAvailability = ({ employee, setAdding, refreshBookings }) => {
    const [addingSection, setAddingSection] = useState(0);
    const [allDay, setAllDay] = useState(null);
    const [selectedStartTime, setSelectedStartTime] = useState("");
    const [selectedEndTime, setSelectedEndTime] = useState("");
    const defaultDate = getNextWeekday(new Date());
    const [selectedDate, setSelectedDate] = useState(defaultDate);

    const generateBookingId = () => {
        return Math.floor(1000000000000000 + Math.random() * 9000000000000000);
    };

    const handleMakeBooking = async () => {
        setAddingSection(5);
        try {
            const duration = calculateDuration(selectedStartTime, selectedEndTime);
            const staffList = ['Bobby', 'Tommy', 'Jasmine', 'Harry'];
            const employeesToCheck = employee === 'All Staff' ? staffList : [employee];
            const startDecimal = convertTimeToDecimal(selectedStartTime);
            const endDecimal = convertTimeToDecimal(selectedEndTime);

            // Function to check for business=true conflicts
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

            const businessConflictFound = await Promise.all(employeesToCheck.map(checkBusinessConflict));
            if (businessConflictFound.includes(true)) {
                setAdding(false);
                alert('A business booking already exists during the selected time. Please choose a different time.');
                return;
            }

            const checkAndHandleOverlaps = async (staffMember) => {
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
                }
            };

            await Promise.all(employeesToCheck.map(checkAndHandleOverlaps));

            const createBooking = async (staffMember) => {
                const bookingData = {
                    id: generateBookingId(), // Generate a random 8-digit ID
                    price: 'Scheduled time off',
                    service: 'Scheduled time off',
                    employee: staffMember,
                    date: selectedDate.toDateString(),
                    startTime: startDecimal,
                    endTime: endDecimal,
                    duration: duration,
                    firstName: 'Scheduled time off',
                    lastName: '',
                    email: 'Scheduled time off',
                    phoneNumber: 'Scheduled time off',
                    appointmentNote: '',
                    business: true,
                    createdAt: new Date().toISOString(),
                };

                await addDoc(collection(db, 'bookings'), bookingData);
            };

            if (employee === 'All Staff') {
                await Promise.all(staffList.map(createBooking));
            } else {
                await createBooking(employee);
            }

            if (refreshBookings) refreshBookings();

            setAdding(false);
        } catch (error) {
            console.error('Error making booking:', error);
            setAddingSection(3);
        }
    };    

    const updateDate = (days) => {
        const newDate = new Date(selectedDate);
        let updatedDate = getNextWeekday(newDate, days >= 0 ? 1 : -1);
        while (Math.abs(days) > 1) {
            updatedDate = getNextWeekday(updatedDate, days >= 0 ? 1 : -1);
            days += days >= 0 ? -1 : 1;
        }

        const tomorrow = getNextWeekday(new Date());
        if (updatedDate >= tomorrow) {
            setSelectedDate(updatedDate);
        } else {
            setSelectedDate(tomorrow); 
        }
    };

    const handleBackButton = () => {
        if (addingSection === 3 && allDay === true) {
            setAddingSection(1); 
        } else {
            setAddingSection((prev) => prev - 1); 
        }
    };

    const timeOptions = generateTimeOptions();

    return (
        <div className='add_availability_section'>
            <div className='aas_inner'>
                <div className='aas_top'>
                    <div className='aas_top_left'>
                        {addingSection !== 0 && (
                            <FontAwesomeIcon
                                icon={faChevronLeft}
                                className='aas_back'
                                onClick={handleBackButton}
                            />
                        )}
                        <p className='aas_title'>{employee}</p>
                    </div>
                    <FontAwesomeIcon
                        onClick={() => setAdding(false)}
                        icon={faTimes}
                        className='aas_icon'
                    />
                </div>

                {addingSection === 0 && (
                    <div className='aas_section'>
                        <p className='aas_section_title'>Select type of availability management</p>
                        <div className='aas_one_buttons'>
                            <button
                                className={`aas_one_button ${allDay && 'aas_one_button_selected'}`}
                                onClick={() => setAllDay(true)}
                            >
                                All day
                            </button>
                            <button
                                className={`aas_one_button ${allDay === false && 'aas_one_button_selected'}`}
                                onClick={() => setAllDay(false)}
                            >
                                Selected Hours
                            </button>
                        </div>
                        {allDay !== null && (
                            <button className='aas_continue' onClick={() => setAddingSection(1)}>
                                Next
                            </button>
                        )}
                    </div>
                )}

                {addingSection === 1 && (
                    <div className='aas_section'>
                        <p className='aas_section_title'>Select day</p>
                        <div className='aas_two_selector'>
                            <FontAwesomeIcon
                                icon={faChevronLeft}
                                className='aas_two_arrow'
                                onClick={() => updateDate(-1)}
                            />
                            <span className='aas_day'>{formatDate(selectedDate)}</span>
                            <FontAwesomeIcon
                                icon={faChevronRight}
                                className='aas_two_arrow'
                                onClick={() => updateDate(1)}
                            />
                        </div>
                        <button
                            className='aas_continue'
                            onClick={() => {
                                if (allDay === false) {
                                    setAddingSection(2); 
                                    setSelectedStartTime("");
                                    setSelectedEndTime("");
                                } else {
                                    setAddingSection(3); 
                                    setSelectedStartTime("09:00");
                                    setSelectedEndTime("17:00");
                                }
                            }}
                        >
                            Next
                        </button>
                    </div>
                )}

                {addingSection === 2 && !allDay && (
                    <div className='aas_section'>

                        <p className='aas_section_title'>Select Time</p>
                        <div className='aas_three_selector'>
                            <label className='aas_time_label'>Start Time:</label>
                            <select
                                className='aas_time_selector'
                                value={selectedStartTime}
                                onChange={(e) => setSelectedStartTime(e.target.value)}
                                >
                                <option value="">Select Start Time</option>
                                {timeOptions.map((time, index) => (
                                    <option key={index} value={time}>
                                        {time}
                                    </option>
                                ))}
                            </select>

                            <label className='aas_time_label'>End Time:</label>
                            <select
                                className='aas_time_selector'
                                value={selectedEndTime}
                                onChange={(e) => setSelectedEndTime(e.target.value)}
                            >
                                <option value="">Select End Time</option>
                                {timeOptions.map((time, index) => (
                                    <option key={index} value={time}>
                                        {time}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedStartTime && selectedEndTime && (
                            <>
                                {selectedEndTime > selectedStartTime ? (
                                    <button className='aas_continue' onClick={() => setAddingSection(3)}>
                                        Next
                                    </button>
                                ) : (
                                    <p className="aas_error_message">End time must be after start time.</p>
                                )}
                            </>
                        )}
                    </div>
                )}

                {addingSection === 3 && (
                    <div className='aas_section'>
                        <p className='aas_section_title'>Confirm your scheduled time off</p>
                        <p className='aas_timedate'><strong>{formatDate(selectedDate)}&nbsp;&nbsp;</strong>{selectedStartTime} - {selectedEndTime}</p>
                        <button className='aas_continue' onClick={() => setAddingSection(4)}>
                                        Confirm
                        </button>
                    </div>
                )}

                {addingSection === 4 && (
                    <div className='aas_section'>
                        <p className='aas_section_title'>Are you sure you want to book space off during this time? You will have to cancel the appointments via your portal and send the user a cancellation email.</p>
                        <div className='aas_final_buttons'>
                            <button className='aas_continue' onClick={handleMakeBooking}>Yes, Confirm</button>
                            <button className='aas_continue' onClick={() => setAdding(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                {addingSection === 5 && (
                    <div className='aas_loading'></div>
                )}
            </div>
        </div>
    );
};
