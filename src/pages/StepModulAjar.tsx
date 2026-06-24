import { useState } from 'react';
import { usePipeline } from '../stores/pipelineStore';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, ChevronRight, ChevronDown, Clock, Lightbulb, Users, User } from 'lucide-react';
import LoadingProgress from '../components/LoadingProgress';
import DocumentViewer from '../components/DocumentViewer';

export default function StepModulAjar() {
  const { state, generateModulAjar, dispatch } = usePipeline();
  const [openPertemuan, setOpenPertemuan] = useState<number | null>(null);

  const renderModulAjar = () => {
    if (!state.modulAjar) return null;
    const m = state.modulAjar;
    const h = m.header || {} as any;
    const pertemuan = (m.pengalaman||{}).pertemuan || [];
    const identifikasi = m.identifikasi || {} as any;
    const desain = m.desain || {} as any;
    const pengalaman = m.pengalaman || {} as any;

    const rawText = [
      `MODUL AJAR / RENCANA PELAKSANAAN PEMBELAJARAN`,
      `Nama Madrasah: ${h.namaMadrasah || '-'}`,
      `Nama Guru: ${h.namaGuru || '-'}`,
      `Mapel: ${h.mapel || '-'}`,
      `Fase/Kelas/Smt: ${h.faseKelasSmt || '-'}`,
      `Materi: ${h.materi || '-'}`,
      `Alokasi Waktu: ${h.alokasiWaktu || '-'}`,
      ``,
      ...pertemuan.flatMap(p => [
        `--- Pertemuan ${p.pertemuan}: ${p.topik || '-'} (${p.durasi || '-'}) ---`,
        `Pertanyaan Pemantik: ${p.pertanyaanPemantik || '-'}`,
        `Kegiatan Awal: ${p.kegiatanAwal || '-'}`,
        `Kegiatan Inti (Misi Eksplorasi):`,
        ...Object.entries(p.kegiatanIntiMenit || {}).map(([k, v]) => `  ${k}: ${v}`),
        `Opsi Kelompok: ${p.opsiKelompok || '-'}`,
        `Opsi Mandiri: ${p.opsiMandiri || '-'}`,
        `Kegiatan Penutup: ${p.kegiatanPenutup || '-'}`,
        '',
      ]),
    ].join('\n');

    return (
      <DocumentViewer title="Modul Ajar / RPP" icon={<BookOpen className="w-4 h-4 text-emerald-600" />} rawText={rawText}>
        <div className="space-y-6 text-sm">
          {/* Header */}
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-base font-bold text-slate-800 text-center mb-3">RENCANA PELAKSANAAN PEMBELAJARAN (RPP)</h3>
            <table className="w-full text-xs">
              <tbody>
                <tr><td className="font-semibold text-slate-600 p-1 w-40">Nama Madrasah</td><td>: {h.namaMadrasah || '-'}</td></tr>
                <tr><td className="font-semibold text-slate-600 p-1">Nama Guru</td><td>: {h.namaGuru || '-'}</td></tr>
                <tr><td className="font-semibold text-slate-600 p-1">Mata Pelajaran</td><td>: {h.mapel || '-'}</td></tr>
                <tr><td className="font-semibold text-slate-600 p-1">Fase/Kelas/Smt</td><td>: {h.faseKelasSmt || '-'}</td></tr>
                <tr><td className="font-semibold text-slate-600 p-1">Materi Pokok</td><td>: {h.materi || '-'}</td></tr>
                <tr><td className="font-semibold text-slate-600 p-1">Alokasi Waktu</td><td>: {h.alokasiWaktu || '-'}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Identifikasi */}
          <div>
            <h4 className="font-bold text-emerald-700 mb-2">A. Identifikasi</h4>
            <p className="text-xs text-slate-600 mb-2"><span className="font-semibold">Peserta Didik:</span> {identifikasi.pesertaDidikDetail || '-'}</p>
            <p className="text-xs text-slate-600 mb-2"><span className="font-semibold">Materi/CP:</span> {identifikasi.materiPelajaranCP || '-'}</p>
            <p className="text-xs text-slate-600"><span className="font-semibold">Dimensi Profil:</span> {(identifikasi.dimensiProfil||[]).join(', ') || '-'}</p>
            <p className="text-xs text-slate-600"><span className="font-semibold">Panca Cinta:</span> {(identifikasi.kurikulumPancaCinta||[]).join(', ') || '-'}</p>
          </div>

          {/* Desain */}
          <div>
            <h4 className="font-bold text-emerald-700 mb-2">B. Desain Pembelajaran</h4>
            <p className="text-xs text-slate-600 mb-2"><span className="font-semibold">Capaian Pembelajaran:</span> {desain.capaianPembelajaran || '-'}</p>
            <p className="text-xs text-slate-600 mb-2"><span className="font-semibold">Lintas Disiplin:</span> {desain.lintasDisiplinIlmu || '-'}</p>
            <div className="mb-2">
              <span className="font-semibold text-xs text-slate-600">Tujuan Pembelajaran:</span>
              <ol className="list-decimal list-inside text-xs text-slate-600 mt-1 space-y-1">
                {(desain.tujuanPembelajaran||[]).map((t, i) => <li key={i}>{t}</li>)}
              </ol>
            </div>
            <p className="text-xs text-slate-600 mb-1"><span className="font-semibold">Topik:</span> {desain.topikPembelajaran || '-'}</p>
            <p className="text-xs text-slate-600 mb-1"><span className="font-semibold">Praktik Pedagogis:</span> {desain.praktikPedagogis || '-'}</p>
            <p className="text-xs text-slate-600 mb-1"><span className="font-semibold">Kemitraan:</span> {desain.kemitraanPembelajaran || '-'}</p>
            <p className="text-xs text-slate-600 mb-1"><span className="font-semibold">Lingkungan:</span> {desain.lingkunganPembelajaran || '-'}</p>
            <p className="text-xs text-slate-600"><span className="font-semibold">Digital:</span> {desain.pemanfaatanDigital || '-'}</p>
          </div>

          {/* Accordion Per Pertemuan */}
          {pertemuan.length > 0 && (
            <div>
              <h4 className="font-bold text-emerald-700 mb-3">C. Breakdown Per Pertemuan</h4>
              <div className="space-y-2">
                {pertemuan.map((p) => (
                  <motion.div
                    key={p.pertemuan}
                    className="border border-slate-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenPertemuan(openPertemuan === p.pertemuan ? null : p.pertemuan)}
                      className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700">
                          {p.pertemuan}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">Pertemuan {p.pertemuan}: {p.topik || '-'}</p>
                          <p className="text-[10px] text-slate-400">{p.durasi || '-'}</p>
                        </div>
                      </div>
                      {openPertemuan === p.pertemuan ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {openPertemuan === p.pertemuan && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="p-4 space-y-3 border-t border-slate-200"
                      >
                        {/* Pertanyaan Pemantik */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-[10px] font-bold text-amber-700 uppercase">Pertanyaan Pemantik</span>
                          </div>
                          <p className="text-xs text-slate-700">{p.pertanyaanPemantik || '-'}</p>
                        </div>

                        {/* Kegiatan Awal */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="w-3.5 h-3.5 text-sky-600" />
                            <span className="text-[10px] font-bold text-sky-700 uppercase">Kegiatan Awal (10-15 Menit)</span>
                          </div>
                          <p className="text-xs text-slate-600 ml-5">{p.kegiatanAwal || '-'}</p>
                        </div>

                        {/* Kegiatan Inti - Misi Eksplorasi */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Users className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[10px] font-bold text-emerald-700 uppercase">Misi Eksplorasi 15 Menit</span>
                          </div>
                          <div className="ml-5 bg-slate-50 rounded-lg p-3 space-y-1">
                            {Object.entries(p.kegiatanIntiMenit || {}).map(([key, val]) => (
                              <p key={key} className="text-xs text-slate-600">
                                <span className="font-semibold text-slate-700">{key}:</span> {val}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* Opsi Tindak Lanjut */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Users className="w-3 h-3 text-indigo-600" />
                              <span className="text-[10px] font-bold text-indigo-700 uppercase">Opsi Kelompok</span>
                            </div>
                            <p className="text-xs text-slate-600">{p.opsiKelompok || '-'}</p>
                          </div>
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <User className="w-3 h-3 text-purple-600" />
                              <span className="text-[10px] font-bold text-purple-700 uppercase">Opsi Mandiri</span>
                            </div>
                            <p className="text-xs text-slate-600">{p.opsiMandiri || '-'}</p>
                          </div>
                        </div>

                        {/* Kegiatan Penutup */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="w-3.5 h-3.5 text-sky-600" />
                            <span className="text-[10px] font-bold text-sky-700 uppercase">Kegiatan Penutup (10-15 Menit)</span>
                          </div>
                          <p className="text-xs text-slate-600 ml-5">{p.kegiatanPenutup || '-'}</p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Prinsip Pembelajaran */}
          <div>
            <h4 className="font-bold text-emerald-700 mb-2">D. Prinsip Pembelajaran</h4>
            <p className="text-xs text-slate-600">{pengalaman.prinsipPembelajaran || '-'}</p>
          </div>

          {/* Asesmen */}
          <div>
            <h4 className="font-bold text-emerald-700 mb-2">E. Asesmen Pembelajaran</h4>
            <p className="text-xs text-slate-600 mb-1"><span className="font-semibold">Awal:</span> {((pengalaman.asesmenPembelajaran||{}).awal) || '-'}</p>
            <p className="text-xs text-slate-600 mb-1"><span className="font-semibold">Proses:</span> {((pengalaman.asesmenPembelajaran||{}).proses) || '-'}</p>
            <p className="text-xs text-slate-600"><span className="font-semibold">Akhir:</span> {((pengalaman.asesmenPembelajaran||{}).akhir) || '-'}</p>
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
