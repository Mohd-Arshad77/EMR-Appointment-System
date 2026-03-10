import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, CalendarCheck, Search, Activity, CalendarPlus, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminAppointments = () => {
    const { user, logout } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        try {
            const { data } = await api.get('/appointments');
            setAppointments(data);
        } catch (error) {
            toast.error('Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const isPast = (dateStr, timeStr) => {
        try {
            const apptDate = new Date(dateStr);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (apptDate < today) return true;
            if (apptDate.getTime() === today.getTime()) {
                const startTime = timeStr.split('-')[0];
                const [hours, minutes] = startTime.split(':');
                const slotTime = new Date();
                slotTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
                if (slotTime < new Date()) {
                    return true;
                }
            }
            return false;
        } catch {
            return false;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-2xl font-bold text-blue-400">EMR Admin</h2>
                    <p className="text-sm text-slate-400 mt-1">Super Admin Panel</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/admin" className="flex items-center gap-3 hover:bg-slate-800 text-slate-300 px-4 py-3 rounded-lg transition-colors">
                        <Stethoscope size={20} /> Doctors
                    </Link>
                    <Link to="/admin?tab=receptionists" className="flex items-center gap-3 hover:bg-slate-800 text-slate-300 px-4 py-3 rounded-lg transition-colors">
                        <Users size={20} /> Receptionists
                    </Link>
                    <Link to="/admin/appointments" className="flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors">
                        <CalendarCheck size={20} /> All Appointments
                    </Link>
                    <Link to="/receptionist" className="flex items-center gap-3 hover:bg-slate-800 text-slate-300 px-4 py-3 rounded-lg transition-colors">
                        <CalendarPlus size={20} /> Book Appointment
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="text-sm">
                            <p className="font-medium">{user?.name}</p>
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

            <main className="flex-1 p-8 overflow-y-auto w-full">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">All Appointments</h1>
                        <p className="text-gray-500 mt-1">Global view of all system appointments</p>
                    </div>
                </header>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <CalendarCheck className="text-blue-600" size={20} /> Booking History
                        </h2>
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{appointments.length} Total</span>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
                            <Activity className="animate-spin mb-4 text-blue-500 w-8 h-8" />
                            Loading appointments...
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="p-16 text-center text-gray-500 bg-gray-50">
                            <Search size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-lg font-medium text-gray-600">No appointments found</p>
                            <p className="text-sm mt-1">Bookings made by receptionists will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Patient Name</th>
                                        <th className="px-6 py-4 font-medium">Doctor</th>
                                        <th className="px-6 py-4 font-medium">Department</th>
                                        <th className="px-6 py-4 font-medium">Date</th>
                                        <th className="px-6 py-4 font-medium">Time Slot</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {appointments.map(app => {
                                        const past = isPast(app.appointmentDate, app.timeSlot);
                                        return (
                                            <tr key={app._id} className={`hover:bg-gray-50/80 transition-colors ${past ? 'opacity-60' : ''}`}>
                                                <td className="px-6 py-4 font-medium text-gray-900 border-l-4 border-transparent hover:border-blue-500">
                                                    {app.patientName}
                                                </td>
                                                <td className="px-6 py-4">
                                                    Dr. {app.doctorId?.name || 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-medium border border-indigo-100">
                                                        {app.doctorId?.department || 'Unknown'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {new Date(app.appointmentDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-700">
                                                    {app.timeSlot}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                                        ${past ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}
                                                    >
                                                        {past ? 'Finished' : 'Upcoming'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminAppointments;
