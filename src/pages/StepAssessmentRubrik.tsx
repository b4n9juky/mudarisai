import { usePipeline } from '../stores/pipelineStore';
import { ClipboardList, Sparkles, RotateCw } from 'lucide-react';
import LoadingProgress from '../components/LoadingProgress';
import DocumentViewer from '../components/DocumentViewer';

const FOKUS_OPTIONS = [
  { value: 'Proses & Eksplorasi', label: 'Proses & Eksplorasi (60% proses, 40% hasil)' },
  { value: 'Kedalaman Pemahaman & Analisis', label: 'Kedalaman Pemahaman & Analisis (60% argumen/refleksi, 40% penyajian)' },
  { value: 'Keterampilan Teknis & Akurasi', label: 'Keterampilan Teknis & Akurasi (60% akurasi/teknik, 40% ide)' },
];

export default function StepAssessmentRubrik() {
  const { state, generateAssessmentRubrik, setFokusPenilaian, resetPipeline } = usePipeline();

  const renderAssessment = () => {
    if (!state.asesmenRubrik) return null;
    const a = state.asesmenRubrik;
    const h = a.header || {} as any;
    const diag = a.asesmenDiagnostik || {} as any;
    const formatif = a.asesmenFormatif || {} as any;
    const sumatif = a.asesmenSumatif || {} as any;

    const rawText = [
      `INSTRUMEN ASESMEN DAN RUBRIK PENILAIAN`,
      `Madrasah: ${h.namaMadrasah || '-'}`,
      `Mapel: ${h.mapel || '-'}`,
      `Materi: ${h.materi || '-'}`,
      `TP: ${h.tujuanPembelajaran || '-'}`,
    ].join('\n');

    return (
      <DocumentViewer title="Instrumen Asesmen & Rubrik Penilaian" icon={<ClipboardList className="w-4 h-4 text-emerald-600" />} rawText={rawText}>
        <div className="space-y-6 text-sm">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-base font-bold text-slate-800 text-center mb-3">PAKET INSTRUMEN ASESMEN & RUBRIK PENILAIAN</h3>
            <table className="w-full text-xs">
              <tbody>
                <tr><td className="font-semibold text-slate-600 p-1 w-40">Madrasah</td><td>: {h.namaMadrasah || '-'}</td></tr>
                <tr><td className="font-semibold text-slate-600 p-1">Guru</td><td>: {h.namaGuru || '-'}</td></tr>
                <tr><td className="font-semibold text-slate-600 p-1">Mapel</td><td>: {h.mapel || '-'}</td></tr>
                <tr><td className="font-semibold text-slate-600 p-1">Materi</td><td>: {h.materi || '-'}</td></tr>
                <tr><td className="font-semibold text-slate-600 p-1">TP</td><td>: {h.tujuanPembelajaran || '-'}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Diagnostik */}
          <div>
            <h4 className="font-bold text-emerald-700 mb-2">A. Asesmen Diagnostik</h4>
            <div className="mb-3">
              <p className="text-xs font-semibold text-slate-700 mb-1">Kognitif — {((diag.kognitif||{}).tujuan) || '-'}</p>
              <div className="space-y-2">
                {((diag.kognitif||{}).pertanyaan||[]).map((q, i) => (
                  <div key={i} className="border border-slate-200 rounded p-2">
                    <p className="text-xs text-slate-700"><span className="font-semibold">Q{q.no}:</span> {q.soal || '-'}</p>
                    <p className="text-[10px] text-slate-400 italic mt-0.5">Tindak Lanjut: {q.tindakLanjut || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">Non-Kognitif — {((diag.nonKognitif||{}).tujuan) || '-'}</p>
              <div className="space-y-2">
                {((diag.nonKognitif||{}).aspek||[]).map((q, i) => (
                  <div key={i} className="border border-slate-200 rounded p-2">
                    <p className="text-xs text-slate-700">{q.pertanyaan || '-'}</p>
                    <p className="text-[10px] text-slate-400 italic">Indikator: {q.indikator || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formatif */}
          <div>
            <h4 className="font-bold text-emerald-700 mb-2">B. Asesmen Formatif</h4>
            <div className="mb-3">
              <p className="text-xs font-semibold text-slate-700 mb-1">Observasi Sikap</p>
              <p className="text-xs text-slate-600 mb-2">{((formatif.observasiSikap||{}).instruksi) || '-'}</p>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5 mb-2">
                {((formatif.observasiSikap||{}).kriteria||[]).map((k, i) => <li key={i}>{k}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">Penilaian Diri</p>
              <p className="text-xs text-slate-600 mb-2">{((formatif.penilaianDiri||{}).instruksi) || '-'}</p>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                {((formatif.penilaianDiri||{}).pernyataan||[]).map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          </div>

          {/* Sumatif */}
          <div>
            <h4 className="font-bold text-emerald-700 mb-2">C. Asesmen Sumatif</h4>
            <p className="text-xs text-slate-600 mb-3">{sumatif.kisiKisi || '-'}</p>
            <div className="space-y-3">
              {(sumatif.soalPgDanEsai||[]).map((q, i) => (
                <div key={i} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-[10px] font-bold rounded">{q.tipe || '-'}</span>
                    <span className="text-[10px] text-slate-400">{q.tingkatKognitif || '-'}</span>
                  </div>
                  <p className="text-xs text-slate-700 mb-1">{q.no}. {q.pertanyaan || '-'}</p>
                  {q.opsi && (
                    <div className="grid grid-cols-2 gap-1 mb-1">
                      {q.opsi.map((o, j) => (
                        <p key={j} className="text-[10px] text-slate-500">{o}</p>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-emerald-600 font-semibold">Kunci: {q.kunciJawaban || '-'}</p>
                  <p className="text-[10px] text-slate-400 italic">{q.penjelasan || '-'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rubrik */}
          {(a.rubrikPenilaian||[]).length > 0 && (
            <div>
              <h4 className="font-bold text-emerald-700 mb-2">D. Rubrik Penilaian</h4>
              <div className="space-y-3">
                {(a.rubrikPenilaian||[]).map((r, i) => (
                  <div key={i} className="border border-slate-200 rounded-lg p-3">
                    <p className="text-xs font-bold text-slate-700 mb-1">{r.aspek || '-'}</p>
                    <p className="text-[10px] text-slate-500 mb-1">Skor Maks: {r.skorMaks || '-'}</p>
                    <ul className="list-disc list-inside text-[10px] text-slate-600 space-y-0.5">
                      {(r.kriteria||[]).map((k, j) => <li key={j}>{k}</li>)}
                    </ul>
                    <p className="text-[10px] text-slate-400 italic mt-1">{r.deskriptor || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DocumentViewer>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {state.loading && <LoadingProgress currentStep={7} loadingStep={state.loadingStep} />}
      {state.error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{state.error}</div>}

      {state.asesmenRubrik ? (
        <>
          {renderAssessment()}
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
            <p className="text-xs text-emerald-600 font-semibold">✓ Pipeline selesai! Semua dokumen telah di-generate.</p>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center no-print">
          <p className="text-sm text-slate-500 mb-4">Instrumen Asesmen & Rubrik belum di-generate</p>

          {/* Fokus Penilaian Selector */}
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
            <p className="text-[10px] text-slate-400 mt-1 italic">Bobot penilaian akan disesuaikan dengan fokus yang dipilih</p>
          </div>

          <button
            onClick={generateAssessmentRubrik}
            disabled={state.loading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-4 h-4" />
            Generate Asesmen + Rubrik
          </button>
        </div>
      )}
    </div>
  );
}
