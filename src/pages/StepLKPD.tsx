import { useState } from 'react';
import { usePipeline } from '../stores/pipelineStore';
import { motion } from 'motion/react';
import { CheckSquare, Sparkles, ChevronRight, ChevronDown, Image, Link, Edit3, Grid3x3, Camera } from 'lucide-react';
import LoadingProgress from '../components/LoadingProgress';
import DocumentViewer from '../components/DocumentViewer';

export default function StepLKPD() {
  const { state, generateModules, dispatch } = usePipeline();
  const [openPertemuan, setOpenPertemuan] = useState<number | null>(null);

  const renderLKPD = () => {
    const lkpds = state.lessonLkpds;
    if (!lkpds || lkpds.length === 0) return null;

    const rawText = lkpds.map(l => [
      `LKPD — Pertemuan ${l.pertemuanKe}: ${l.topik}`,
      `Instruksi Misi: ${l.instruksiMisi}`,
      `Kalimat Rumpang: ${(l.kalimatRumpang || []).join('; ')}`,
      `Input: ${l.tipeInput.sketsaGrid ? 'Sketsa Grid, ' : ''}${l.tipeInput.fotoCetak ? 'Foto Cetak, ' : ''}${l.tipeInput.tautanDigital || ''}`,
      '',
    ].join('\n')).join('\n');

    return (
      <DocumentViewer title="LKPD Per Pertemuan" icon={<CheckSquare className="w-4 h-4 text-emerald-600" />} rawText={rawText}>
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-800 text-center mb-4">LEMBAR KERJA PESERTA DIDIK (LKPD) PER PERTEMUAN</h3>
          {lkpds.map((l) => (
            <motion.div
              key={l.pertemuanKe}
              className="border border-slate-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenPertemuan(openPertemuan === l.pertemuanKe ? null : l.pertemuanKe)}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700">
                    {l.pertemuanKe}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Pertemuan {l.pertemuanKe}: {l.topik}</p>
                    <p className="text-[10px] text-slate-400">LKPD Spesifik untuk pertemuan ini</p>
                  </div>
                </div>
                {openPertemuan === l.pertemuanKe ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {openPertemuan === l.pertemuanKe && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="p-4 space-y-4 border-t border-slate-200"
                >
                  {/* Instruksi Misi */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">Instruksi Misi Eksplorasi</span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <p className="text-xs text-slate-700 whitespace-pre-line">{l.instruksiMisi}</p>
                    </div>
                  </div>

                  {/* Kalimat Rumpang Refleksi */}
                  {(l.kalimatRumpang || []).length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[10px] font-bold text-amber-700 uppercase">Panduan Refleksi — Kalimat Rumpang</span>
                      </div>
                      <div className="space-y-2">
                        {(l.kalimatRumpang || []).map((kr, i) => (
                          <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs text-slate-700 italic">
                              <span className="font-semibold">{i + 1}.</span> "{kr}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tipe Input — Ruang Karya */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Grid3x3 className="w-3.5 h-3.5 text-sky-600" />
                      <span className="text-[10px] font-bold text-sky-700 uppercase">Ruang Karya</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {l.tipeInput.sketsaGrid && (
                        <div className="border border-slate-200 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Grid3x3 className="w-3 h-3 text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-600 uppercase">Grid Sketsa Manual</span>
                          </div>
                          <div className="bg-white border border-dashed border-slate-300 rounded h-32 flex items-center justify-center">
                            <p className="text-[10px] text-slate-400 text-center">Area sketsa manual<br/>(cetak dan gambar)</p>
                          </div>
                        </div>
                      )}
                      {l.tipeInput.fotoCetak && (
                        <div className="border border-slate-200 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Camera className="w-3 h-3 text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-600 uppercase">Foto Cetak</span>
                          </div>
                          <div className="bg-white border border-dashed border-slate-300 rounded h-32 flex items-center justify-center">
                            <p className="text-[10px] text-slate-400 text-center">Tempel foto hasil<br/>eksplorasi di sini</p>
                          </div>
                        </div>
                      )}
                      {l.tipeInput.tautanDigital && (
                        <div className="border border-slate-200 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Link className="w-3 h-3 text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-600 uppercase">Tautan Digital</span>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] text-slate-500">Upload ke {l.tipeInput.tautanDigital}:</p>
                            <input
                              type="text"
                              placeholder={`Tempel tautan ${l.tipeInput.tautanDigital} di sini...`}
                              className="w-full px-2 py-1.5 text-[10px] border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500/20 bg-white"
                              readOnly
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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
      {state.loading && <LoadingProgress currentStep={6} loadingStep={state.loadingStep} />}
      {state.error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{state.error}</div>}

      {state.lessonLkpds.length > 0 ? (
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
          <p className="text-sm text-slate-500 mb-1">LKPD & Asesmen per pertemuan belum di-generate</p>
          <p className="text-xs text-slate-400 mb-4">Akan dibuatkan LKPD dan Rubrik Asesmen unik untuk setiap pertemuan</p>
          <button
            onClick={generateModules}
            disabled={state.loading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-4 h-4" />
            Generate LKPD & Asesmen Per Pertemuan
          </button>
        </div>
      )}
    </div>
  );
}
