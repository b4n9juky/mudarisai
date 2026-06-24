import { useState } from 'react';
import { usePipeline } from '../stores/pipelineStore';
import { motion } from 'motion/react';
import { ClipboardList, Sparkles, ChevronRight, ChevronDown, RotateCw } from 'lucide-react';
import LoadingProgress from '../components/LoadingProgress';
import DocumentViewer from '../components/DocumentViewer';

const FOKUS_OPTIONS = [
  { value: 'Proses & Eksplorasi', label: 'Proses & Eksplorasi (60% proses, 40% hasil)' },
  { value: 'Kedalaman Pemahaman & Analisis', label: 'Kedalaman Pemahaman & Analisis (60% argumen/refleksi, 40% penyajian)' },
  { value: 'Keterampilan Teknis & Akurasi', label: 'Keterampilan Teknis & Akurasi (60% akurasi/teknik, 40% ide)' },
];

export default function StepAssessmentRubrik() {
  const { state, generateModules, setFokusPenilaian, resetPipeline } = usePipeline();
  const [openPertemuan, setOpenPertemuan] = useState<number | null>(null);

  const renderAssessment = () => {
    const assessments = state.lessonAssessments;
    if (!assessments || assessments.length === 0) return null;

    const rawText = assessments.map(a => [
      `ASESMEN — Pertemuan ${a.pertemuanKe}: ${a.topik}`,
      `Fokus Penilaian: ${a.fokusPenilaian}`,
      ...(a.rubrik || []).map(r => `  ${r.aspek}: 4="${r.skor4}" | 3="${r.skor3}" | 2="${r.skor2}" | 1="${r.skor1}"`),
      '',
    ].join('\n')).join('\n');

    return (
      <DocumentViewer title="Rubrik Asesmen Per Pertemuan" icon={<ClipboardList className="w-4 h-4 text-emerald-600" />} rawText={rawText}>
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-800 text-center mb-4">RUBRIK ASESMEN PER PERTEMUAN (SKALA 1-4)</h3>
          {assessments.map((a) => (
            <motion.div
              key={a.pertemuanKe}
              className="border border-slate-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenPertemuan(openPertemuan === a.pertemuanKe ? null : a.pertemuanKe)}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700">
                    {a.pertemuanKe}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Pertemuan {a.pertemuanKe}: {a.topik}</p>
                    <p className="text-[10px] text-slate-400">Fokus: {a.fokusPenilaian}</p>
                  </div>
                </div>
                {openPertemuan === a.pertemuanKe ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {openPertemuan === a.pertemuanKe && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="p-4 border-t border-slate-200"
                >
                  {(a.rubrik || []).length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-200 p-2 text-left w-1/5">Aspek Penilaian</th>
                            <th className="border border-slate-200 p-2 w-1/5">4 — Sangat Baik</th>
                            <th className="border border-slate-200 p-2 w-1/5">3 — Baik</th>
                            <th className="border border-slate-200 p-2 w-1/5">2 — Cukup</th>
                            <th className="border border-slate-200 p-2 w-1/5">1 — Perlu Bimbingan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(a.rubrik || []).map((r, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                              <td className="border border-slate-200 p-2 font-semibold text-slate-700">{r.aspek}</td>
                              <td className="border border-slate-200 p-2 text-slate-600">{r.skor4}</td>
                              <td className="border border-slate-200 p-2 text-slate-600">{r.skor3}</td>
                              <td className="border border-slate-200 p-2 text-slate-600">{r.skor2}</td>
                              <td className="border border-slate-200 p-2 text-slate-600">{r.skor1}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">Belum ada rubrik untuk pertemuan ini.</p>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </DocumentViewer>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {state.loading && <LoadingProgress currentStep={7} loadingStep={state.loadingStep} />}
      {state.error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{state.error}</div>}

      {(state.lessonAssessments.length > 0 || state.asesmenRubrik) ? (
        <>
          {state.lessonAssessments.length > 0 ? (
            renderAssessment()
          ) : (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center">
              <p className="text-sm text-slate-500">Data asesmen per pertemuan tidak tersedia. Generate ulang dari halaman LKPD.</p>
            </div>
          )}
          <div className="flex items-center gap-3 no-print">
            <button
              onClick={() => {
                resetPipeline();
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              Buat Baru
            </button>
            <p className="text-xs text-emerald-600 font-semibold">✓ Pipeline selesai! Semua dokumen telah di-generate per pertemuan.</p>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center no-print">
          <p className="text-sm text-slate-500 mb-4">Rubrik Asesmen per pertemuan belum di-generate</p>

          <div className="text-left mb-4 max-w-md mx-auto">
            <label className="block text-xs font-semibold text-slate-600 mb-2">Fokus Penilaian (Rubrik Analitik Skala 1-4):</label>
            <select
              value={state.fokusPenilaian}
              onChange={e => setFokusPenilaian(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
            >
              {FOKUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1 italic">Rubrik akan disesuaikan per pertemuan berdasarkan fokus ini</p>
          </div>

          <button
            onClick={generateModules}
            disabled={state.loading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-4 h-4" />
            Generate Rubrik Asesmen Per Pertemuan
          </button>
        </div>
      )}
    </div>
  );
}
