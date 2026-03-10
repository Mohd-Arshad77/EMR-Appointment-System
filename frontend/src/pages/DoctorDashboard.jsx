import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { LogOut, Calendar, Clock, Activity, User as UserIcon } from 'lucide-react';

const DoctorDashboard = () => {
    const { user, logout } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const { data } = await api.get('/appointments/doctor');
                setAppointments(data);
            } catch (error) {
                toast.error('Failed to fetch appointments');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const formatDate = (dateString) => {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-2xl font-bold text-teal-400">MedCore</h2>
                    <p className="text-sm text-slate-400 mt-1">Doctor Portal</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a href="#" className="flex items-center gap-3 bg-teal-600 text-white px-4 py-3 rounded-lg transition-colors">
                        <Calendar size={20} /> My Schedule
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

            <main className="flex-1 p-8 overflow-y-auto w-full">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Welcome, Dr. {user?.name?.split(' ')[0]}</h1>
                        <p className="text-gray-500 mt-1">Here is your schedule for upcoming appointments.</p>
                    </div>
                    <button
                        onClick={logout}
                        className="md:hidden flex items-center gap-2 p-2 text-gray-600 hover:text-red-500 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                    </button>
                </header>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <Calendar className="text-teal-600" size={20} /> Active Appointments
                        </h2>
                        <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                            {appointments.length} Upcoming
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
                            <Activity className="animate-spin mb-2 text-teal-500" size={32} />
                            Loading schedule...
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="p-16 text-center text-gray-500">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar size={32} className="text-gray-400" />
                            </div>
                            <p className="text-xl font-medium text-gray-600">No appointments scheduled</p>
                            <p className="text-sm mt-2 text-gray-400">Enjoy your free time!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Patient Details</th>
                                        <th className="px-6 py-4 font-medium">Date & Time</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {appointments.map(apt => (
                                        <tr key={apt._id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                                                        {apt.patientName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{apt.patientName}</p>
                                                        <p className="text-xs text-gray-500">ID: {apt._id.slice(-6)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-900 font-medium">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {formatDate(apt.appointmentDate)}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500 mt-1">
                                                    <Clock size={14} className="text-gray-400" />
                                                    {apt.timeSlot}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${apt.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    apt.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                        'bg-gray-50 text-gray-700 border-gray-200'
                                                    }`}>
                                                    {apt.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DoctorDashboard;
