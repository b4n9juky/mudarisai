import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Edit2, Trash2, X, Check, Shield, User as UserIcon, Database, Trash } from 'lucide-react';
import { usersApi, pipelineApi } from '../lib/api';

interface UserRecord {
  id: number;
  username: string;
  role: 'admin' | 'guru';
  guru_id: number | null;
  nama_guru: string | null;
  nama_madrasah: string | null;
  created_at: string;
}

interface FormData {
  username: string;
  password: string;
  role: 'admin' | 'guru';
  guruId: string;
}

const emptyForm: FormData = { username: '', password: '', role: 'guru', guruId: '' };

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.list();
      setUsers(res.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const openEdit = (user: UserRecord) => {
    setForm({
      username: user.username,
      password: '',
      role: user.role,
      guruId: user.guru_id ? String(user.guru_id) : '',
    });
    setEditingId(user.id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.username.trim()) { setError('Username wajib diisi.'); return; }
    if (!editingId && !form.password.trim()) { setError('Password wajib diisi.'); return; }

    try {
      if (editingId) {
        await usersApi.update(editingId, form);
        setSuccess('User berhasil diperbarui.');
      } else {
        await usersApi.create(form);
        setSuccess('User berhasil dibuat.');
      }
      resetForm();
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`Hapus user "${username}"?`)) return;
    try {
      await usersApi.delete(id);
      setSuccess(`User "${username}" berhasil dihapus.`);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-12 flex flex-col gap-4"
    >
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">Manajemen User</h3>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah User
          </button>
        </div>

        {error && <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>}
        {success && <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">{success}</div>}

        {/* Form */}
        {showForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            onSubmit={handleSubmit}
            className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700">{editingId ? 'Edit User' : 'Tambah User Baru'}</h4>
              <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Username</label>
                <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Password {editingId && <span className="text-slate-300">(kosongkan jika tidak diubah)</span>}</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option value="guru">Guru</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Guru ID (opsional, untuk role guru)</label>
                <input type="text" value={form.guruId} onChange={e => setForm(f => ({ ...f, guruId: e.target.value }))}
                  placeholder="Kosongkan jika tidak ada"
                  className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
            </div>
            <button type="submit"
              className="self-start px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors">
              {editingId ? 'Simpan Perubahan' : 'Buat User'}
            </button>
          </motion.form>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-2 text-left border border-slate-200">ID</th>
                  <th className="p-2 text-left border border-slate-200">Username</th>
                  <th className="p-2 text-left border border-slate-200">Role</th>
                  <th className="p-2 text-left border border-slate-200">Guru ID</th>
                  <th className="p-2 text-left border border-slate-200">Dibuat</th>
                  <th className="p-2 text-center border border-slate-200">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-2 border border-slate-200">{u.id}</td>
                    <td className="p-2 border border-slate-200 font-semibold">{u.username}</td>
                    <td className="p-2 border border-slate-200">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {u.role === 'admin' ? <Shield className="w-3 h-3 inline mr-0.5" /> : <UserIcon className="w-3 h-3 inline mr-0.5" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="p-2 border border-slate-200 text-slate-400">{u.guru_id || '-'}</td>
                    <td className="p-2 border border-slate-200 text-slate-400">{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="p-2 border border-slate-200">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(u)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(u.id, u.username)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pipeline List */}
      <PipelineTable />
    </motion.div>
  );
}

function PipelineTable() {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPipelines = async () => {
    setLoading(true);
    try {
      const res = await pipelineApi.listPipeline();
      setPipelines(res.pipelines);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPipelines(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm(`Hapus pipeline #${id}? Data terkait akan ikut terhapus.`)) return;
    try {
      await pipelineApi.deletePipeline(id);
      fetchPipelines();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-5 h-5 text-indigo-600" />
        <h3 className="text-sm font-bold text-slate-800">Daftar Pipeline</h3>
      </div>

      {error && <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pipelines.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">Belum ada pipeline.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2 text-left border border-slate-200">ID</th>
                <th className="p-2 text-left border border-slate-200">Mapel</th>
                <th className="p-2 text-left border border-slate-200">Guru</th>
                <th className="p-2 text-left border border-slate-200">Madrasah</th>
                <th className="p-2 text-left border border-slate-200">Fase/Kelas</th>
                <th className="p-2 text-left border border-slate-200">Semester</th>
                <th className="p-2 text-left border border-slate-200">Status</th>
                <th className="p-2 text-left border border-slate-200">Tanggal</th>
                <th className="p-2 text-center border border-slate-200">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pipelines.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-2 border border-slate-200">{p.id}</td>
                  <td className="p-2 border border-slate-200 font-semibold">{p.mapel}</td>
                  <td className="p-2 border border-slate-200">{p.nama_guru}</td>
                  <td className="p-2 border border-slate-200">{p.nama_madrasah}</td>
                  <td className="p-2 border border-slate-200">{p.kelas_fase}</td>
                  <td className="p-2 border border-slate-200">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.semester === 'Ganjil' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
                      {p.semester}
                    </span>
                  </td>
                  <td className="p-2 border border-slate-200">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">
                      {p.status || 'in_progress'}
                    </span>
                  </td>
                  <td className="p-2 border border-slate-200 text-slate-400">{new Date(p.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-2 border border-slate-200">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleDelete(p.id)} className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600">
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
