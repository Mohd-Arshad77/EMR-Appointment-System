import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { LogOut, UserPlus, Users, CalendarCheck, CalendarPlus, Stethoscope, Edit, Trash2, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'doctors';
  const setActiveTab = (tab) => setSearchParams({ tab });

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [docName, setDocName] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docPassword, setDocPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [editingDoctorId, setEditingDoctorId] = useState(null);

  const [receptionists, setReceptionists] = useState([]);
  const [loadingReceptionists, setLoadingReceptionists] = useState(true);
  const [recName, setRecName] = useState('');
  const [recEmail, setRecEmail] = useState('');
  const [recPassword, setRecPassword] = useState('');
  const [editingReceptionistId, setEditingReceptionistId] = useState(null);

  const departments = ["Cardiology", "Orthopedics", "Neurology", "Dermatology", "ENT", "General Medicine"];

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const { data } = await api.get('/doctors');
      setDoctors(data);
    } catch (error) {
      toast.error('Failed to fetch doctors');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchReceptionists = async () => {
    try {
      setLoadingReceptionists(true);
      const { data } = await api.get('/receptionists');
      setReceptionists(data);
    } catch (error) {
      toast.error('Failed to fetch receptionists');
    } finally {
      setLoadingReceptionists(false);
    }
  };

  useEffect(() => { fetchDoctors(); fetchReceptionists(); }, []);

  const handleCreateOrUpdateDoctor = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: docName, email: docEmail, department,
        workingHours: { start: startTime, end: endTime },
        slotDuration: Number(slotDuration)
      };
      if (!editingDoctorId) payload.password = docPassword;

      if (editingDoctorId) {
        const { data } = await api.put(`/doctors/${editingDoctorId}`, payload);
        setDoctors(prev => prev.map(doc => doc._id === editingDoctorId ? data : doc));
        toast.success("Doctor updated successfully");
      } else {
        const { data } = await api.post('/doctors', payload);
        setDoctors(prev => [...prev, data]);
        toast.success("Doctor created successfully");
      }
      resetDoctorForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving doctor");
    }
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctorId(doctor._id);
    setDocName(doctor.name);
    setDocEmail(doctor.userId?.email || '');
    setDepartment(doctor.department);
    setStartTime(doctor.workingHours.start);
    setEndTime(doctor.workingHours.end);
    setSlotDuration(doctor.slotDuration);
    setDocPassword('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDoctor = async (id) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        await api.delete(`/doctors/${id}`);
        setDoctors(prev => prev.filter(doc => doc._id !== id));
        toast.success("Doctor deleted successfully");
      } catch (error) {
        toast.error(error.response?.data?.message || "Error deleting doctor");
      }
    }
  };

  const resetDoctorForm = () => {
    setEditingDoctorId(null);
    setDocName(''); setDocEmail(''); setDocPassword('');
    setDepartment(''); setStartTime('09:00'); setEndTime('17:00'); setSlotDuration(30);
  };

  const handleCreateOrUpdateReceptionist = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: recName, email: recEmail };
      if (!editingReceptionistId) {
        payload.password = recPassword;
      } else if (recPassword) {
        payload.password = recPassword;
      }

      if (editingReceptionistId) {
        const { data } = await api.put(`/receptionists/${editingReceptionistId}`, payload);
        setReceptionists(prev => prev.map(r => r._id === editingReceptionistId ? data : r));
        toast.success("Receptionist updated successfully");
      } else {
        const { data } = await api.post('/receptionists', payload);
        setReceptionists(prev => [...prev, data]);
        toast.success("Receptionist created successfully");
      }
      resetReceptionistForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving receptionist");
    }
  };

  const handleEditReceptionist = (rec) => {
    setEditingReceptionistId(rec._id);
    setRecName(rec.name); setRecEmail(rec.email); setRecPassword('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteReceptionist = async (id) => {
    if (window.confirm("Are you sure you want to delete this receptionist?")) {
      try {
        await api.delete(`/receptionists/${id}`);
        setReceptionists(prev => prev.filter(r => r._id !== id));
        toast.success("Receptionist deleted successfully");
      } catch (error) {
        toast.error(error.response?.data?.message || "Error deleting receptionist");
      }
    }
  };

  const resetReceptionistForm = () => {
    setEditingReceptionistId(null);
    setRecName(''); setRecEmail(''); setRecPassword('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-blue-400">EMR Admin</h2>
          <p className="text-sm text-slate-400 mt-1">Super Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('doctors')}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'doctors' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Stethoscope size={20} /> Doctors
          </button>
          <button onClick={() => setActiveTab('receptionists')}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'receptionists' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Users size={20} /> Receptionists
          </button>
          <Link to="/admin/appointments" className="flex items-center gap-3 hover:bg-slate-800 text-slate-300 px-4 py-3 rounded-lg transition-colors">
            <CalendarCheck size={20} /> All Appointments
          </Link>
          <Link to="/receptionist" className="flex items-center gap-3 hover:bg-slate-800 text-slate-300 px-4 py-3 rounded-lg transition-colors">
            <CalendarPlus size={20} /> Book Appointment
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold">{user?.name?.charAt(0)}</div>
            <div className="text-sm">
              <p className="font-medium">{user?.name}</p>
              <p className="text-slate-400 text-xs">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 w-full px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-500 mt-1">Manage system personnel and settings</p>
          </div>
          <button onClick={logout} className="md:hidden flex items-center gap-2 p-2 text-gray-600 hover:text-red-500 rounded-lg">
            <LogOut size={20} />
          </button>
        </header>

        {activeTab === 'doctors' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-800">{editingDoctorId ? 'Edit Doctor Profile' : 'Add New Doctor'}</h2>
                </div>
                {editingDoctorId && <button onClick={resetDoctorForm} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>}
              </div>
              <form onSubmit={handleCreateOrUpdateDoctor} className="space-y-4">
                <input type="text" placeholder="Full Name" required value={docName} onChange={e => setDocName(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <input type="email" placeholder="Email" required value={docEmail} onChange={e => setDocEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <input type="password" placeholder={editingDoctorId ? "Leave blank to keep current" : "Password"} required={!editingDoctorId} value={docPassword} onChange={e => setDocPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <select required value={department} onChange={e => setDepartment(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Department</option>
                  {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full border px-4 py-2 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Time</label>
                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full border px-4 py-2 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Slot Duration (minutes)</label>
                  <input type="number" value={slotDuration} onChange={e => setSlotDuration(Number(e.target.value))} className="w-full border px-4 py-2 rounded-lg" />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  {editingDoctorId ? 'Save Changes' : 'Create Doctor'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b"><h2 className="text-xl font-semibold">Registered Doctors ({doctors.length})</h2></div>
              {loadingDoctors ? (
                <p className="p-6 text-center text-gray-500">Loading...</p>
              ) : doctors.length === 0 ? (
                <p className="p-6 text-center text-gray-500">No doctors registered yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Name</th>
                        <th className="px-4 py-3 text-left font-medium">Department</th>
                        <th className="px-4 py-3 text-left font-medium">Hours</th>
                        <th className="px-4 py-3 text-left font-medium">Slot</th>
                        <th className="px-4 py-3 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {doctors.map(doc => (
                        <tr key={doc._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3"><p className="font-medium text-gray-900">Dr. {doc.name}</p><p className="text-xs text-gray-500">{doc.userId?.email}</p></td>
                          <td className="px-4 py-3"><span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-xs font-medium">{doc.department}</span></td>
                          <td className="px-4 py-3 text-gray-600">{doc.workingHours.start} - {doc.workingHours.end}</td>
                          <td className="px-4 py-3 text-gray-600">{doc.slotDuration} mins</td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleEditDoctor(doc)} className="text-blue-600 hover:text-blue-800 mr-3"><Edit size={16} /></button>
                            <button onClick={() => handleDeleteDoctor(doc._id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'receptionists' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-800">{editingReceptionistId ? 'Edit Receptionist' : 'Add New Receptionist'}</h2>
                </div>
                {editingReceptionistId && <button onClick={resetReceptionistForm} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>}
              </div>
              <form onSubmit={handleCreateOrUpdateReceptionist} className="space-y-4">
                <input type="text" placeholder="Full Name" required value={recName} onChange={e => setRecName(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <input type="email" placeholder="Email" required value={recEmail} onChange={e => setRecEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <input type="password" placeholder={editingReceptionistId ? "Leave blank to keep current" : "Password"} required={!editingReceptionistId} value={recPassword} onChange={e => setRecPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  {editingReceptionistId ? 'Save Changes' : 'Create Receptionist'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b"><h2 className="text-xl font-semibold">Receptionists ({receptionists.length})</h2></div>
              {loadingReceptionists ? (
                <p className="p-6 text-center text-gray-500">Loading...</p>
              ) : receptionists.length === 0 ? (
                <p className="p-6 text-center text-gray-500">No receptionists registered yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Name</th>
                        <th className="px-4 py-3 text-left font-medium">Email</th>
                        <th className="px-4 py-3 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {receptionists.map(rec => (
                        <tr key={rec._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900">{rec.name}</td>
                          <td className="px-4 py-3 text-gray-600">{rec.email}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleEditReceptionist(rec)} className="text-blue-600 hover:text-blue-800 mr-3"><Edit size={16} /></button>
                            <button onClick={() => handleDeleteReceptionist(rec._id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;