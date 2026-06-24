import { useState } from 'react';
import { usePipeline } from '../stores/pipelineStore';
import { motion } from 'motion/react';
import { Sparkles, School, User, BookOpen, ChevronRight } from 'lucide-react';

const FASE_OPTIONS = [
  'Fase A / Kelas 1-2 / SD/MI',
  'Fase B / Kelas 3-4 / SD/MI',
  'Fase C / Kelas 5-6 / SD/MI',
  'Fase D / Kelas 7-9 / SMP/MTs',
  'Fase E / Kelas 10 / SMA/MA',
  'Fase F / Kelas 11-12 / SMA/MA',
];

export default function StepInput({ onStartNew }: { onStartNew?: () => void }) {
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
