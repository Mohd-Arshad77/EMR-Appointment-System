import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { LogOut, CalendarPlus, Search, Clock, Users, ChevronDown, Stethoscope, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReceptionistBooking = () => {
    const { user, logout } = useAuth();
    const [doctors, setDoctors] = useState([]);

    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [patientName, setPatientName] = useState('');

    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [bookingSlot, setBookingSlot] = useState(null);

    const departments = [...new Set(doctors.map(d => d.department))].sort();

    const filteredDoctors = selectedDepartment
        ? doctors.filter(d => d.department === selectedDepartment)
        : doctors;

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const { data } = await api.get('/doctors');
                setDoctors(data);
                if (data.length > 0) {
                    setSelectedDoctor(data[0]._id);
                }
            } catch (error) {
                toast.error('Failed to fetch doctors');
            }
        };
        fetchDoctors();
    }, []);

    useEffect(() => {
        if (filteredDoctors.length > 0) {
            setSelectedDoctor(filteredDoctors[0]._id);
        } else {
            setSelectedDoctor('');
            setSlots([]);
        }
    }, [selectedDepartment, doctors]);

    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            fetchSlots();
        }
    }, [selectedDoctor, selectedDate]);

    const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
            const { data } = await api.get(`/appointments/slots?doctorId=${selectedDoctor}&date=${selectedDate}`);
            setSlots(data);
        } catch (error) {
            toast.error('Failed to fetch slots');
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleBook = async (timeSlot) => {
        if (!patientName.trim()) {
            toast.warning('Please enter a patient name first');
            document.getElementById('patient-name-input')?.focus();
            return;
        }

        setBookingSlot(timeSlot);
        try {
            await api.post('/appointments/book', {
                doctorId: selectedDoctor,
                patientName,
                appointmentDate: selectedDate,
                timeSlot
            });
            toast.success('Appointment booked successfully!');
            setPatientName('');
            fetchSlots();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error booking appointment');
        } finally {
            setBookingSlot(null);
        }
    };

    const docInfo = filteredDoctors.find(d => d._id === selectedDoctor);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
                <div className="p-6 border-b border-slate-800">
                    {user?.role === 'Super Admin' ? (
                        <>
                            <h2 className="text-2xl font-bold text-blue-400">EMR Admin</h2>
                            <p className="text-sm text-slate-400 mt-1">Super Admin Panel</p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-indigo-400">DeskPro</h2>
                            <p className="text-sm text-slate-400 mt-1">Reception Portal</p>
                        </>
                    )}
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {user?.role === 'Super Admin' && (
                        <>
                            <Link to="/admin" className="flex items-center gap-3 hover:bg-slate-800 text-slate-300 px-4 py-3 rounded-lg transition-colors">
                                <Stethoscope size={20} /> Doctors
                            </Link>
                            <Link to="/admin?tab=receptionists" className="flex items-center gap-3 hover:bg-slate-800 text-slate-300 px-4 py-3 rounded-lg transition-colors">
                                <Users size={20} /> Receptionists
                            </Link>
                            <Link to="/admin/appointments" className="flex items-center gap-3 hover:bg-slate-800 text-slate-300 px-4 py-3 rounded-lg transition-colors">
                                <CalendarCheck size={20} /> All Appointments
                            </Link>
                        </>
                    )}
                    <a href="#" className="flex items-center gap-3 bg-indigo-600 text-white px-4 py-3 rounded-lg transition-colors">
                        <CalendarPlus size={20} /> Book Appointment
                    </a>
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="text-sm">
                            <p className="font-medium truncate w-40">{user?.name}</p>
                            <p className="text-slate-400 text-xs">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Appointment Booking</h1>
                        <p className="text-gray-500 mt-1">Schedule patient visits with available doctors</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    <div className="xl:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
                                <Search size={18} className="text-indigo-600" /> Booking Details
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                                    <input
                                        id="patient-name-input"
                                        type="text"
                                        placeholder="E.g. John Doe"
                                        value={patientName}
                                        onChange={e => setPatientName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Department</label>
                                    <div className="relative">
                                        <select
                                            value={selectedDepartment}
                                            onChange={e => setSelectedDepartment(e.target.value)}
                                            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                                        >
                                            <option value="">All Departments</option>
                                            {departments.map(dep => (
                                                <option key={dep} value={dep}>{dep}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <ChevronDown size={16} className="text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
                                    <div className="relative">
                                        <select
                                            value={selectedDoctor}
                                            onChange={e => setSelectedDoctor(e.target.value)}
                                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                                        >
                                            {filteredDoctors.map(doc => (
                                                <option key={doc._id} value={doc._id}>Dr. {doc.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Users size={16} className="text-gray-400" />
                                        </div>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <ChevronDown size={16} className="text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={selectedDate}
                                        onChange={e => setSelectedDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {docInfo && (
                            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl shadow-sm border border-indigo-100">
                                <h3 className="font-semibold text-indigo-900 mb-3">Selected Doctor</h3>
                                <div className="space-y-2 text-sm text-indigo-800">
                                    <p><strong className="font-semibold">Name:</strong> Dr. {docInfo.name}</p>
                                    <p><strong className="font-semibold">Dept:</strong> {docInfo.department}</p>
                                    <p><strong className="font-semibold">Hours:</strong> {docInfo.workingHours.start} - {docInfo.workingHours.end}</p>
                                    <p><strong className="font-semibold">Slot:</strong> {docInfo.slotDuration} mins</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="xl:col-span-3 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Clock className="text-indigo-600" /> Time Slots
                            </h2>
                            <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <span>{new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                            </div>
                        </div>

                        {loadingSlots ? (
                            <div className="py-20 text-center text-gray-500 flex flex-col items-center">
                                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                Loading available slots...
                            </div>
                        ) : slots.length === 0 ? (
                            <div className="py-20 text-center text-gray-500 bg-gray-50 border border-dashed rounded-xl">
                                No slots configured or available for this date.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {slots.map((slot, index) => (
                                    <div key={index}
                                        className={`relative group p-4 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center text-center 
                                        ${slot.available
                                                ? 'border-blue-200 bg-blue-50 hover:border-blue-500 hover:shadow-md cursor-pointer hover:-translate-y-1'
                                                : slot.reason === 'Booked'
                                                    ? 'border-red-200 bg-red-50 opacity-90 cursor-not-allowed'
                                                    : 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed'}`}
                                    >
                                        <div className={`font-semibold mb-1 
                                            ${slot.available ? 'text-blue-900 group-hover:text-blue-700'
                                                : slot.reason === 'Booked' ? 'text-red-800 line-through'
                                                    : 'text-gray-500 line-through'}`}>
                                            {slot.time}
                                        </div>

                                        {!slot.available && (
                                            <div className={`text-[10px] uppercase font-bold tracking-wider ${slot.reason === 'Booked' ? 'text-red-500' : 'text-gray-500'}`}>
                                                {slot.reason}
                                            </div>
                                        )}

                                        {slot.available && (
                                            <button
                                                onClick={() => handleBook(slot.time)}
                                                disabled={bookingSlot === slot.time || !patientName}
                                                className={`mt-2 w-full py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors
                                                    ${patientName
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                        : 'bg-blue-200 text-blue-500 group-hover:bg-blue-300'}`}
                                            >
                                                {bookingSlot === slot.time ? 'Booking...' : 'Book'}
                                            </button>
                                        )}
                                        {slot.available && !patientName && (
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                                                Enter patient name first
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ReceptionistBooking;
