import { usePipeline } from '../stores/pipelineStore';
import { CheckSquare, Sparkles, ChevronRight } from 'lucide-react';
import LoadingProgress from '../components/LoadingProgress';
import DocumentViewer from '../components/DocumentViewer';

export default function StepLKPD() {
  const { state, generateLKPD, dispatch } = usePipeline();

  const renderLKPD = () => {
    if (!state.lkpd) return null;
    const l = state.lkpd;

    const rawText = [
      `LEMBAR KERJA PESERTA DIDIK (LKPD)`,
      `Madrasah: ${l.header.namaMadrasah}`,
      `Mapel: ${l.header.mapel}`,
      `Materi: ${l.header.materi}`,
      `TP: ${l.header.tujuanPembelajaran}`,
      ``,
      `STIMULUS: ${l.stimulusKontekstual.judul}`,
      l.stimulusKontekstual.narasi,
      ``,
      ...l.pertanyaanC1C6.map(q => `${q.level}: ${q.pertanyaan}`),
    ].join('\n');

    return (
      <DocumentViewer title="Lembar Kerja Peserta Didik (LKPD)" icon={<CheckSquare className="w-4 h-4 text-emerald-600" />} rawText={rawText}>
        <div className="space-y-6 text-sm">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-base font-bold text-slate-800 text-center mb-3">LEMBAR KERJA PESERTA DIDIK (LKPD)</h3>
            <table className="w-full text-xs">
              <tbody>
                <tr><td className="font-semibold text-slate-600 p-1 w-40">Madrasah</td><td>: {l.header.namaMadrasah}</td></tr>
                <tr><td className="font-semibold text-slate-600 p-1">Mapel</td><td>: {l.header.mapel}</td></tr>
                <tr><td className="font-semibold text-slate-600 p-1">Materi</td><td>: {l.header.materi}</td></tr>
                <tr><td className="font-semibold text-slate-600 p-1">Alokasi Waktu</td><td>: {l.header.alokasiWaktu}</td></tr>
                <tr><td className="font-semibold text-slate-600 p-1">TP</td><td>: {l.header.tujuanPembelajaran}</td></tr>
              </tbody>
            </table>
          </div>

          <div>
            <h4 className="font-bold text-emerald-700 mb-2">Petunjuk Kerja</h4>
            <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1">
              {l.petunjukKerja.map((p, i) => <li key={i}>{p}</li>)}
            </ol>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-bold text-emerald-700 mb-2">Stimulus Kontekstual</h4>
            <p className="text-xs font-semibold text-slate-700 mb-1">{l.stimulusKontekstual.judul}</p>
            <p className="text-xs text-slate-600 leading-relaxed">{l.stimulusKontekstual.narasi}</p>
          </div>

          <div>
            <h4 className="font-bold text-emerald-700 mb-2">Aktivitas</h4>
            <p className="text-xs text-slate-600 mb-1"><span className="font-semibold">Jenis:</span> {l.aktivitas.jenis}</p>
            <p className="text-xs text-slate-600 mb-1"><span className="font-semibold">Aktivitas:</span> {l.aktivitas.namaAktivitas}</p>
            <ol className="list-decimal list-inside text-xs text-slate-600 space-y-0.5">
              {l.aktivitas.panduanLangkah.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>

          <div>
            <h4 className="font-bold text-emerald-700 mb-2">Pertanyaan Berjenjang C1-C6</h4>
            <div className="space-y-3">
              {l.pertanyaanC1C6.map((q, i) => (
                <div key={i} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">{q.level}</span>
                  </div>
                  <p className="text-xs text-slate-700 mb-1">{q.pertanyaan}</p>
                  <p className="text-[10px] text-slate-400 italic">Petunjuk: {q.petunjukJawaban}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-emerald-700 mb-2">Kesimpulan</h4>
            <p className="text-xs text-slate-600">{l.kesimpulan}</p>
          </div>

          {l.refleksi && (
            <div>
              <h4 className="font-bold text-emerald-700 mb-2">Refleksi</h4>
              <p className="text-xs text-slate-600 mb-2">{l.refleksi.instruksi}</p>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                {l.refleksi.pertanyaan.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
        </div>
      </DocumentViewer>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {state.loading && <LoadingProgress currentStep={6} loadingStep={state.loadingStep} />}
      {state.error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{state.error}</div>}

      {state.lkpd ? (
        <>
          {renderLKPD()}
          <button
            onClick={() => dispatch({ type: 'SET_STEP', payload: 5 })}
            className="self-start px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 no-print"
          >
            Lanjut ke Asesmen + Rubrik <ChevronRight className="w-4 h-4" />
          </button>
        </>
      ) : (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center no-print">
          <p className="text-sm text-slate-500 mb-3">LKPD belum di-generate</p>
          <button
            onClick={generateLKPD}
            disabled={state.loading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-4 h-4" />
            Generate LKPD
          </button>
        </div>
      )}
    </div>
  );
}
