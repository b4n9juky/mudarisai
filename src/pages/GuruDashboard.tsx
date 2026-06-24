import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Database, Play, Trash2, Sparkles, Plus, BookOpen, School, User } from 'lucide-react';
import { pipelineApi } from '../lib/api';
import { usePipeline } from '../stores/pipelineStore';

interface Props {
  onStartNew: () => void;
}

export default function GuruDashboard({ onStartNew }: Props) {
  const { dispatch } = usePipeline();
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const fetchPipelines = () => {
    setLoading(true);
    pipelineApi.listPipeline().then(res => {
      setPipelines(res.pipelines);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPipelines(); }, []);

  const handleContinue = async (pipelineId: number) => {
    setLoadError('');
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
          lessonLkpds: data.lessonLkpds || [],
          lessonAssessments: data.lessonAssessments || [],
          currentStep: (lastStep > 0 ? lastStep : 0) as any,
          subStep: 0,
          error: '',
        },
      });
    } catch (e: any) {
      setLoadError(e.message || 'Gagal memuat pipeline.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Hapus pipeline ini? Data terkait akan ikut terhapus.`)) return;
    try {
      await pipelineApi.deletePipeline(id);
      fetchPipelines();
    } catch {} // ignore
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Dashboard Pipeline</h3>
            <p className="text-[10px] text-slate-400">Riwayat dan kelola pipeline Anda</p>
          </div>
        </div>
        <button
          onClick={onStartNew}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Buat Baru
        </button>
      </div>

      {loadError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pipelines.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400 mb-1">Belum ada pipeline</p>
          <p className="text-[10px] text-slate-300 mb-4">Buat pipeline baru untuk memulai</p>
          <button
            onClick={onStartNew}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Buat Pipeline Baru
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2 text-left border border-slate-200">Mapel</th>
                <th className="p-2 text-left border border-slate-200">Kelas/Fase</th>
                <th className="p-2 text-left border border-slate-200">Semester</th>
                <th className="p-2 text-left border border-slate-200">Tanggal</th>
                <th className="p-2 text-left border border-slate-200">Progress</th>
                <th className="p-2 text-center border border-slate-200">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pipelines.map(p => {
                const progressLabels = ['Input', 'Analisis CP', 'TP & ATP', 'Prota+Prosem', 'Modul Ajar', 'LKPD', 'Asesmen'];
                const lastDone = [p.analisis_cp, p.tp, p.atp, p.prota_prosem, p.modul_ajar, p.lkpd, p.asesmen_rubrik]
                  .reduce((acc: number, s: any, i: number) => s ? i + 1 : acc, 0);
                const progressText = lastDone === 0 ? 'Baru' : `${progressLabels[lastDone]} ✅` ;

                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-2 border border-slate-200 font-semibold">{p.mapel}</td>
                    <td className="p-2 border border-slate-200">{p.kelas_fase}</td>
                    <td className="p-2 border border-slate-200">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.semester === 'Ganjil' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
                        {p.semester}
                      </span>
                    </td>
                    <td className="p-2 border border-slate-200 text-slate-400">{new Date(p.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="p-2 border border-slate-200">
                      <span className="text-[10px] text-slate-600">{progressText}</span>
                    </td>
                    <td className="p-2 border border-slate-200">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleContinue(p.id)}
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <div>
            <p className="text-[10px] text-slate-400">Total Pipeline</p>
            <p className="text-sm font-bold text-slate-700">{pipelines.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <School className="w-4 h-4 text-emerald-600" />
          <div>
            <p className="text-[10px] text-slate-400">Madrasah</p>
            <p className="text-sm font-bold text-slate-700">{pipelines[0]?.nama_madrasah || '-'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <User className="w-4 h-4 text-emerald-600" />
          <div>
            <p className="text-[10px] text-slate-400">Guru</p>
            <p className="text-sm font-bold text-slate-700">{pipelines[0]?.nama_guru || '-'}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
