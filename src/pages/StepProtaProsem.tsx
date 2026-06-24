import { useState } from 'react';
import { usePipeline } from '../stores/pipelineStore';
import { motion } from 'motion/react';
import { Award, Sparkles, ChevronRight, Calendar } from 'lucide-react';
import LoadingProgress from '../components/LoadingProgress';
import DocumentViewer from '../components/DocumentViewer';

export default function StepProtaProsem() {
  const { state, generateProtaProsem, setKalender, dispatch } = usePipeline();
  const [localGanjil, setLocalGanjil] = useState(state.mingguEfektifGanjil);
  const [localGenap, setLocalGenap] = useState(state.mingguEfektifGenap);
  const [localCatatan, setLocalCatatan] = useState(state.catatanKalender);

  const renderProta = () => {
    if (!state.protaProsem) return null;
    const p = state.protaProsem;

    const rawText = [
      `PROGRAM TAHUNAN (PROTA)`,
      `Madrasah: ${p.header.namaMadrasah}`,
      `Guru: ${p.header.namaGuru}`,
      `Mapel: ${p.header.mapel}`,
      `Fase/Kelas/Smt: ${p.header.faseKelasSmt}`,
      ``,
      `=== SEMESTER GANJIL ===`,
      ...p.prota.semesterGanjil.map(r => `${r.no}. ${r.babMateri} | ${r.tujuanDanAlurPembelajaran} | ${r.alokasiWaktu}`),
      ``,
      `=== SEMESTER GENAP ===`,
      ...p.prota.semesterGenap.map(r => `${r.no}. ${r.babMateri} | ${r.tujuanDanAlurPembelajaran} | ${r.alokasiWaktu}`),
      ``,
      `Total Alokasi Waktu: ${p.prota.totalAlokasiWaktu}`,
    ].join('\n');

    return (
      <DocumentViewer title="Program Tahunan (PROTA) & Program Semester (PROSEM)" icon={<Award className="w-4 h-4 text-emerald-600" />} rawText={rawText}>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3">Program Tahunan (PROTA)</h4>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-200 p-2 text-left">No</th>
                  <th className="border border-slate-200 p-2 text-left">Bab/Materi</th>
                  <th className="border border-slate-200 p-2 text-left">Tujuan & Alur</th>
                  <th className="border border-slate-200 p-2 text-left">Alokasi</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-emerald-50/50"><td colSpan={4} className="p-2 text-xs font-bold text-emerald-700">Semester Ganjil</td></tr>
                {p.prota.semesterGanjil.map(r => (
                  <tr key={r.no}>
                    <td className="border border-slate-200 p-2">{r.no}</td>
                    <td className="border border-slate-200 p-2">{r.babMateri}</td>
                    <td className="border border-slate-200 p-2 text-slate-500">{r.tujuanDanAlurPembelajaran}</td>
                    <td className="border border-slate-200 p-2 font-semibold">{r.alokasiWaktu}</td>
                  </tr>
                ))}
                <tr className="bg-sky-50/50"><td colSpan={4} className="p-2 text-xs font-bold text-sky-700">Semester Genap</td></tr>
                {p.prota.semesterGenap.map(r => (
                  <tr key={r.no}>
                    <td className="border border-slate-200 p-2">{r.no}</td>
                    <td className="border border-slate-200 p-2">{r.babMateri}</td>
                    <td className="border border-slate-200 p-2 text-slate-500">{r.tujuanDanAlurPembelajaran}</td>
                    <td className="border border-slate-200 p-2 font-semibold">{r.alokasiWaktu}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold">
                  <td colSpan={3} className="border border-slate-200 p-2 text-right">Total:</td>
                  <td className="border border-slate-200 p-2">{p.prota.totalAlokasiWaktu}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3">Program Semester (PROSEM) — Ganjil</h4>
            <p className="text-xs text-slate-500 mb-2">Bulan: {p.prosemGanjil.bulan.join(', ')}</p>
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-200 p-1 text-left">No</th>
                  <th className="border border-slate-200 p-1 text-left">Bab</th>
                  <th className="border border-slate-200 p-1 text-left">JP</th>
                  {p.prosemGanjil.materiRows[0]?.mingguMaping.map((_, w) => (
                    <th key={w} className="border border-slate-200 p-1 w-6 text-[8px]">{'M' + (w + 1)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {p.prosemGanjil.materiRows.map(r => (
                  <tr key={r.no}>
                    <td className="border border-slate-200 p-1">{r.no}</td>
                    <td className="border border-slate-200 p-1">{r.babMateri}</td>
                    <td className="border border-slate-200 p-1 font-semibold">{r.alokasiWaktu}</td>
                    {r.mingguMaping.map((val, w) => (
                      <td key={w} className={`border border-slate-200 p-1 text-center ${val ? 'bg-emerald-100 text-emerald-700 font-bold' : 'text-slate-300'}`}>{val || '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3">Program Semester (PROSEM) — Genap</h4>
            <p className="text-xs text-slate-500 mb-2">Bulan: {p.prosemGenap.bulan.join(', ')}</p>
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-200 p-1 text-left">No</th>
                  <th className="border border-slate-200 p-1 text-left">Bab</th>
                  <th className="border border-slate-200 p-1 text-left">JP</th>
                  {p.prosemGenap.materiRows[0]?.mingguMaping.map((_, w) => (
                    <th key={w} className="border border-slate-200 p-1 w-6 text-[8px]">{'M' + (w + 1)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {p.prosemGenap.materiRows.map(r => (
                  <tr key={r.no}>
                    <td className="border border-slate-200 p-1">{r.no}</td>
                    <td className="border border-slate-200 p-1">{r.babMateri}</td>
                    <td className="border border-slate-200 p-1 font-semibold">{r.alokasiWaktu}</td>
                    {r.mingguMaping.map((val, w) => (
                      <td key={w} className={`border border-slate-200 p-1 text-center ${val ? 'bg-sky-100 text-sky-700 font-bold' : 'text-slate-300'}`}>{val || '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 rounded-lg p-3">
            <h4 className="text-sm font-bold text-slate-700 mb-1">Analisis Minggu Efektif</h4>
            <p className="text-xs text-slate-600">Ganjil: {p.analisisMingguEfektif.totalMingguEfektifGanjil}</p>
            <p className="text-xs text-slate-600">Genap: {p.analisisMingguEfektif.totalMingguEfektifGenap}</p>
            <p className="text-xs text-slate-500 mt-1">{p.analisisMingguEfektif.keteranganEfektifitas}</p>
          </div>
        </div>
      </DocumentViewer>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {state.loading && <LoadingProgress currentStep={4} loadingStep={state.loadingStep} />}
      {state.error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{state.error}</div>}

      {state.protaProsem ? (
        <>
          {renderProta()}
          <button
            onClick={() => dispatch({ type: 'SET_STEP', payload: 3 })}
            className="self-start px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 no-print"
          >
            Lanjut ke Modul Ajar <ChevronRight className="w-4 h-4" />
          </button>
        </>
      ) : (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm no-print">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-700">Kalender Pendidikan & Minggu Efektif</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Minggu Efektif Semester Ganjil
              </label>
              <input
                type="number"
                min={8}
                max={24}
                value={localGanjil}
                onChange={e => setLocalGanjil(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Minggu Efektif Semester Genap
              </label>
              <input
                type="number"
                min={8}
                max={24}
                value={localGenap}
                onChange={e => setLocalGenap(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Catatan Libur / Hari Besar / Kegiatan Sekolah
            </label>
            <textarea
              rows={3}
              value={localCatatan}
              onChange={e => setLocalCatatan(e.target.value)}
              placeholder="Contoh: Libur Ramadhan 2 minggu, Libur Idul Fitri 1 minggu, UTS 1 minggu, UAS 1 minggu"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
            />
          </div>

          <p className="text-xs text-slate-500 mb-3 text-center">
            Prota & Prosem akan disusun berdasarkan jumlah minggu efektif di atas
          </p>

          <button
            onClick={() => {
              setKalender({ mingguEfektifGanjil: localGanjil, mingguEfektifGenap: localGenap, catatanKalender: localCatatan });
              generateProtaProsem();
            }}
            disabled={state.loading || localGanjil < 8 || localGenap < 8}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-4 h-4" />
            Generate Prota + Prosem
          </button>
        </div>
      )}
    </div>
  );
}
