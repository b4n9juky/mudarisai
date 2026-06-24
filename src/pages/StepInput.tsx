import { useState, useEffect } from 'react';
import { usePipeline } from '../stores/pipelineStore';
import { motion } from 'motion/react';
import { Sparkles, School, User, BookOpen, ChevronRight, Database, Play, Trash2 } from 'lucide-react';
import { pipelineApi } from '../lib/api';

const FASE_OPTIONS = [
  'Fase A / Kelas 1-2 / SD/MI',
  'Fase B / Kelas 3-4 / SD/MI',
  'Fase C / Kelas 5-6 / SD/MI',
  'Fase D / Kelas 7-9 / SMP/MTs',
  'Fase E / Kelas 10 / SMA/MA',
  'Fase F / Kelas 11-12 / SMA/MA',
];

export default function StepInput() {
  const { state, dispatch, createPipeline, generateAnalisisCP, generateAll } = usePipeline();
  const [localInput, setLocalInput] = useState(state.input);
  const [localError, setLocalError] = useState('');

  const handleChange = (field: string, value: string) => {
    setLocalInput(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLocalError('');
    if (!localInput.namaMadrasah.trim()) { setLocalError('Nama Madrasah/Sekolah wajib diisi.'); return; }
    if (!localInput.namaGuru.trim()) { setLocalError('Nama Guru wajib diisi.'); return; }
    if (!localInput.mapel.trim()) { setLocalError('Mata Pelajaran wajib diisi.'); return; }
    if (!localInput.kelasFase.trim()) { setLocalError('Kelas/Fase wajib dipilih.'); return; }
    if (!localInput.semester.trim()) { setLocalError('Semester wajib dipilih.'); return; }

    dispatch({ type: 'SET_INPUT', payload: localInput });

    await createPipeline(localInput);
    const s = state.id;
    if (state.error) {
      setLocalError(state.error);
      return;
    }

    dispatch({ type: 'SET_STEP', payload: 1 });
  };

  const handleLoadPipeline = async (pipelineId: number) => {
    setLocalError('');
    try {
      const res = await pipelineApi.getPipeline(pipelineId);
      const data = res as any;
      const steps = [data.analisisCP, data.tp, data.atp, data.protaProsem, data.modulAjar, data.lkpd, data.asesmenRubrik];
      const lastStep = steps.reduce((acc: number, s: any, i: number) => s ? i + 1 : acc, 0);

      dispatch({
        type: 'LOAD_PIPELINE',
        payload: {
          id: data.pipeline.id,
          input: {
            namaMadrasah: data.pipeline.namaMadrasah || '',
            namaGuru: data.pipeline.namaGuru || '',
            mapel: data.pipeline.mapel || '',
            kelasFase: data.pipeline.kelasFase || '',
            semester: data.pipeline.semester || '',
          },
          analisisCP: data.analisisCP,
          tp: data.tp,
          atp: data.atp,
          protaProsem: data.protaProsem,
          modulAjar: data.modulAjar,
          lkpd: data.lkpd,
          asesmenRubrik: data.asesmenRubrik,
          currentStep: (lastStep > 0 ? lastStep : 0) as any,
          subStep: 0,
          error: '',
        },
      });
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  const handleGenerateAll = async () => {
    setLocalError('');
    if (!localInput.namaMadrasah.trim()) { setLocalError('Nama Madrasah/Sekolah wajib diisi.'); return; }
    if (!localInput.namaGuru.trim()) { setLocalError('Nama Guru wajib diisi.'); return; }
    if (!localInput.mapel.trim()) { setLocalError('Mata Pelajaran wajib diisi.'); return; }
    if (!localInput.kelasFase.trim()) { setLocalError('Kelas/Fase wajib dipilih.'); return; }
    if (!localInput.semester.trim()) { setLocalError('Semester wajib dipilih.'); return; }

    await generateAll(localInput);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
    >
      {/* Riwayat Pipeline Guru */}
      <GuruPipelineList onLoad={handleLoadPipeline} />

      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">1</div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Input Data Awal</h3>
          <p className="text-[10px] text-slate-400">Masukkan identitas madrasah dan mata pelajaran</p>
        </div>
      </div>

      {localError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{localError}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
            <School className="w-3.5 h-3.5 text-emerald-600" />
            Nama Madrasah / Sekolah
          </label>
          <input
            type="text"
            value={localInput.namaMadrasah}
            onChange={e => handleChange('namaMadrasah', e.target.value)}
            placeholder="Contoh: MA Mus'ab Bin Umair"
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            Nama Guru / Penyusun
          </label>
          <input
            type="text"
            value={localInput.namaGuru}
            onChange={e => handleChange('namaGuru', e.target.value)}
            placeholder="Contoh: Marzuki Bustan Sulaiman"
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            Mata Pelajaran
          </label>
          <input
            type="text"
            value={localInput.mapel}
            onChange={e => handleChange('mapel', e.target.value)}
            placeholder="Contoh: Akidah Akhlak, Matematika"
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
            Kelas / Fase
          </label>
          <select
            value={localInput.kelasFase}
            onChange={e => handleChange('kelasFase', e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
          >
            <option value="">-- Pilih Fase / Kelas --</option>
            {FASE_OPTIONS.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600">Semester</label>
          <div className="flex gap-2">
            {['Ganjil', 'Genap'].map(smt => (
              <button
                key={smt}
                type="button"
                onClick={() => handleChange('semester', smt)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold border transition-all ${
                  localInput.semester === smt
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                }`}
              >
                {smt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
        <button
          onClick={handleSubmit}
          disabled={state.loading}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
        >
          {state.loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Memproses...</>
          ) : (
            <>Analisis CP <ChevronRight className="w-4 h-4" /></>
          )}
        </button>

        <button
          onClick={handleGenerateAll}
          disabled={state.loading}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate Semua
        </button>
      </div>
    </motion.div>
  );
}

function GuruPipelineList({ onLoad }: { onLoad: (id: number) => void }) {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPipelines = () => {
    pipelineApi.listPipeline().then(res => {
      setPipelines(res.pipelines);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPipelines(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm(`Hapus pipeline ini? Data terkait akan ikut terhapus.`)) return;
    try {
      await pipelineApi.deletePipeline(id);
      fetchPipelines();
    } catch {} // ignore
  };

  if (loading) return null;
  if (pipelines.length === 0) return null;

  return (
    <div className="mb-6 pb-4 border-b border-slate-100">
      <div className="flex items-center gap-2 mb-3">
        <Database className="w-4 h-4 text-emerald-600" />
        <h4 className="text-xs font-bold text-slate-700">Riwayat Pipeline Saya</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-1.5 text-left border border-slate-200 text-slate-500 font-semibold">Mapel</th>
              <th className="p-1.5 text-left border border-slate-200 text-slate-500 font-semibold">Kelas/Fase</th>
              <th className="p-1.5 text-left border border-slate-200 text-slate-500 font-semibold">Semester</th>
              <th className="p-1.5 text-left border border-slate-200 text-slate-500 font-semibold">Tanggal</th>
              <th className="p-1.5 text-center border border-slate-200 text-slate-500 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pipelines.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-1.5 border border-slate-200 font-semibold">{p.mapel}</td>
                <td className="p-1.5 border border-slate-200">{p.kelas_fase}</td>
                <td className="p-1.5 border border-slate-200">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${p.semester === 'Ganjil' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
                    {p.semester}
                  </span>
                </td>
                <td className="p-1.5 border border-slate-200 text-slate-400">{new Date(p.created_at).toLocaleDateString('id-ID')}</td>
                <td className="p-1.5 border border-slate-200 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onLoad(p.id)}
                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200 transition-colors inline-flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      Lanjutkan
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
