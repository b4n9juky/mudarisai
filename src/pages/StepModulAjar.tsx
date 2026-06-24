import { usePipeline } from '../stores/pipelineStore';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, ChevronRight } from 'lucide-react';
import LoadingProgress from '../components/LoadingProgress';
import DocumentViewer from '../components/DocumentViewer';

export default function StepModulAjar() {
  const { state, generateModulAjar, dispatch } = usePipeline();

  const renderModulAjar = () => {
    if (!state.modulAjar) return null;
    const m = state.modulAjar;

    const rawText = [
      `MODUL AJAR / RENCANA PELAKSANAAN PEMBELAJARAN`,
      `Nama Madrasah: ${m.header.namaMadrasah}`,
      `Nama Guru: ${m.header.namaGuru}`,
      `Mapel: ${m.header.mapel}`,
      `Fase/Kelas/Smt: ${m.header.faseKelasSmt}`,
      `Materi: ${m.header.materi}`,
      `Alokasi Waktu: ${m.header.alokasiWaktu}`,
      ``,
      `CAPAIAN PEMBELAJARAN:`,
      m.desain.capaianPembelajaran,
      ``,
      `TUJUAN PEMBELAJARAN:`,
      ...m.desain.tujuanPembelajaran.map((t, i) => `${i + 1}. ${t}`),
    ].join('\n');

    return (
      <DocumentViewer title="Modul Ajar / RPP" icon={<BookOpen className="w-4 h-4 text-emerald-600" />} rawText={rawText}>
        <div className="space-y-6 text-sm">
          {/* Header */}
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-base font-bold text-slate-800 text-center mb-3">RENCANA PELAKSANAAN PEMBELAJARAN (RPP)</h3>
            <table className="w-full text-xs">
              <tbody>
                <tr><td className="font-semibold text-slate-600 p-1 w-40">Nama Madrasah</td><td>: {m.header.namaMadrasah}</td></tr>
                <tr><td className="font-semibold text-slate-600 p-1">Nama Guru</td><td>: {m.header.namaGuru}</td></tr>
                <tr><td className="font-semibold text-slate-600 p-1">Mata Pelajaran</td><td>: {m.header.mapel}</td></tr>
                <tr><td className="font-semibold text-slate-600 p-1">Fase/Kelas/Smt</td><td>: {m.header.faseKelasSmt}</td></tr>
                <tr><td className="font-semibold text-slate-600 p-1">Materi Pokok</td><td>: {m.header.materi}</td></tr>
                <tr><td className="font-semibold text-slate-600 p-1">Alokasi Waktu</td><td>: {m.header.alokasiWaktu}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Identifikasi */}
          <div>
            <h4 className="font-bold text-emerald-700 mb-2">A. Identifikasi</h4>
            <p className="text-xs text-slate-600 mb-2"><span className="font-semibold">Peserta Didik:</span> {m.identifikasi.pesertaDidikDetail}</p>
            <p className="text-xs text-slate-600 mb-2"><span className="font-semibold">Materi/CP:</span> {m.identifikasi.materiPelajaranCP}</p>
            <p className="text-xs text-slate-600"><span className="font-semibold">Dimensi Profil:</span> {m.identifikasi.dimensiProfil.join(', ')}</p>
            <p className="text-xs text-slate-600"><span className="font-semibold">Panca Cinta:</span> {m.identifikasi.kurikulumPancaCinta.join(', ')}</p>
          </div>

          {/* Desain */}
          <div>
            <h4 className="font-bold text-emerald-700 mb-2">B. Desain Pembelajaran</h4>
            <p className="text-xs text-slate-600 mb-2"><span className="font-semibold">Capaian Pembelajaran:</span> {m.desain.capaianPembelajaran}</p>
            <p className="text-xs text-slate-600 mb-2"><span className="font-semibold">Lintas Disiplin:</span> {m.desain.lintasDisiplinIlmu}</p>
            <div className="mb-2">
              <span className="font-semibold text-xs text-slate-600">Tujuan Pembelajaran:</span>
              <ol className="list-decimal list-inside text-xs text-slate-600 mt-1 space-y-1">
                {m.desain.tujuanPembelajaran.map((t, i) => <li key={i}>{t}</li>)}
              </ol>
            </div>
            <p className="text-xs text-slate-600 mb-1"><span className="font-semibold">Topik:</span> {m.desain.topikPembelajaran}</p>
            <p className="text-xs text-slate-600 mb-1"><span className="font-semibold">Praktik Pedagogis:</span> {m.desain.praktikPedagogis}</p>
            <p className="text-xs text-slate-600 mb-1"><span className="font-semibold">Kemitraan:</span> {m.desain.kemitraanPembelajaran}</p>
            <p className="text-xs text-slate-600 mb-1"><span className="font-semibold">Lingkungan:</span> {m.desain.lingkunganPembelajaran}</p>
            <p className="text-xs text-slate-600"><span className="font-semibold">Digital:</span> {m.desain.pemanfaatanDigital}</p>
          </div>

          {/* Pengalaman */}
          <div>
            <h4 className="font-bold text-emerald-700 mb-2">C. Pengalaman Belajar</h4>
            <p className="text-xs text-slate-600 mb-2"><span className="font-semibold">Prinsip:</span> {m.pengalaman.prinsipPembelajaran}</p>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1">Memahami (Build Understanding):</p>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                  {m.pengalaman.langkahPembelajaran.memahami.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1">Mengaplikasi (Apply & Construct):</p>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                  {m.pengalaman.langkahPembelajaran.mengaplikasi.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1">Merefleksi (Reflect & Internalize):</p>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                  {m.pengalaman.langkahPembelajaran.merefleksi.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DocumentViewer>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {state.loading && <LoadingProgress currentStep={5} loadingStep={state.loadingStep} />}
      {state.error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{state.error}</div>}

      {state.modulAjar ? (
        <>
          {renderModulAjar()}
          <button
            onClick={() => dispatch({ type: 'SET_STEP', payload: 4 })}
            className="self-start px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 no-print"
          >
            Lanjut ke LKPD <ChevronRight className="w-4 h-4" />
          </button>
        </>
      ) : (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center no-print">
          <p className="text-sm text-slate-500 mb-3">Modul Ajar belum di-generate</p>
          <button
            onClick={generateModulAjar}
            disabled={state.loading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-4 h-4" />
            Generate Modul Ajar
          </button>
        </div>
      )}
    </div>
  );
}
