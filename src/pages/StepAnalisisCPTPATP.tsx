import { usePipeline } from '../stores/pipelineStore';
import { motion } from 'motion/react';
import { ChevronRight, Sparkles, CheckCircle, RotateCw } from 'lucide-react';
import LoadingProgress from '../components/LoadingProgress';
import DocumentViewer from '../components/DocumentViewer';

const SUB_STEPS = [
  { key: 0, label: 'Analisis CP' },
  { key: 1, label: 'Tujuan Pembelajaran (TP)' },
  { key: 2, label: 'Alur TP (ATP)' },
];

export default function StepAnalisisCPTPATP() {
  const { state, generateAnalisisCP, generateTP, generateATP, dispatch } = usePipeline();

  const renderAnalisisCP = () => {
    if (!state.analisisCP) return null;
    const cp = state.analisisCP;
    return (
      <DocumentViewer
        title="Analisis Capaian Pembelajaran (CP)"
        icon={<Sparkles className="w-4 h-4 text-emerald-600" />}
        rawText={[
          `CAPAIAN PEMBELAJARAN:\n${cp.capaianPembelajaran || '-'}`,
          `\nANALISIS KOMPETENSI:\n${cp.analisisKompetensi || '-'}`,
          `\nKARAKTERISTIK MATA PELAJARAN:\n${cp.karakteristikMapel || '-'}`,
          `\nREKOMENDASI PENDEKATAN:\n${cp.rekomendasiPendekatan || '-'}`,
        ].join('\n')}
      >
        <div className="space-y-4">
          <Section title="Capaian Pembelajaran" text={cp.capaianPembelajaran || '-'} />
          <Section title="Analisis Kompetensi" text={cp.analisisKompetensi || '-'} />
          <Section title="Karakteristik Mata Pelajaran" text={cp.karakteristikMapel || '-'} />
          <Section title="Rekomendasi Pendekatan" text={cp.rekomendasiPendekatan || '-'} />
        </div>
      </DocumentViewer>
    );
  };

  const renderTP = () => {
    if (!state.tp) return null;
    const tp = state.tp;
    const tujuanList = tp.tujuanList || [];
    const kataKunci = tp.kataKunci || [];
    return (
      <DocumentViewer
        title="Tujuan Pembelajaran (TP)"
        icon={<Sparkles className="w-4 h-4 text-emerald-600" />}
        rawText={[
          'TUJUAN PEMBELAJARAN:',
          ...tujuanList.map((t, i) => `${i + 1}. ${t}`),
          `\nRASIONAL:\n${tp.rasional || '-'}`,
          `\nKATA KUNCI:\n${kataKunci.join(', ') || '-'}`,
        ].join('\n')}
      >
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-2">Tujuan Pembelajaran</h4>
            <ol className="list-decimal list-inside space-y-2">
              {tujuanList.map((t, i) => (
                <li key={i} className="text-sm text-slate-600 leading-relaxed">{t}</li>
              ))}
            </ol>
          </div>
          <Section title="Rasional" text={tp.rasional || '-'} />
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-2">Kata Kunci Operasional</h4>
            <div className="flex flex-wrap gap-2">
              {kataKunci.map((k, i) => (
                <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold">{k}</span>
              ))}
            </div>
          </div>
        </div>
      </DocumentViewer>
    );
  };

  const renderATP = () => {
    if (!state.atp) return null;
    const atp = state.atp;
    const alur = atp.alur || [];
    return (
      <DocumentViewer
        title="Alur Tujuan Pembelajaran (ATP)"
        icon={<Sparkles className="w-4 h-4 text-emerald-600" />}
        rawText={[
          'ALUR TUJUAN PEMBELAJARAN:',
          ...alur.map(b => `${b.bab || '-'}: ${(b.tp||[]).join(', ')} (${b.alokasiWaktu || '-'}, ${b.minggu || '-'})`),
          `\nTotal Jam: ${atp.totalJam || '-'}`,
        ].join('\n')}
      >
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-700">Alur Tujuan Pembelajaran</h4>
          {alur.map((bab, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-bold text-emerald-700">{bab.bab || '-'}</h5>
                <span className="text-[10px] text-slate-400">{bab.minggu || '-'} | {bab.alokasiWaktu || '-'}</span>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {(bab.tp||[]).map((t, j) => (
                  <li key={j} className="text-xs text-slate-600">{t}</li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-xs text-slate-500 font-semibold">Total Jam: {atp.totalJam || '-'}</p>
        </div>
      </DocumentViewer>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Sub-stepper */}
      <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-slate-200 shadow-sm no-print">
        {SUB_STEPS.map((s, idx) => {
          const isActive = state.subStep === s.key;
          const isDone = state.subStep > s.key;
          return (
            <div key={s.key} className="flex items-center gap-2">
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
              <button
                onClick={() => {
                  if (s.key <= state.subStep) dispatch({ type: 'SET_SUB_STEP', payload: s.key as any });
                }}
                disabled={s.key > state.subStep}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5
                  ${isActive ? 'bg-emerald-600 text-white shadow-sm' : isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
              >
                {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[9px]">{idx + 1}</span>}
                {s.label}
              </button>
            </div>
          );
        })}
      </div>

      {/* Loading */}
      {state.loading && (
        <LoadingProgress currentStep={state.subStep === 0 ? 1 : state.subStep === 1 ? 2 : 3} loadingStep={state.loadingStep} />
      )}

      {/* Error */}
      {state.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{state.error}</div>
      )}

      {/* Content */}
      {state.subStep === 0 && (
        <>
          {state.analisisCP ? (
            <>
              {renderAnalisisCP()}
              <button
                onClick={async () => {
                  dispatch({ type: 'SET_SUB_STEP', payload: 1 });
                  await generateTP();
                }}
                className="self-start px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 no-print"
              >
                Lanjut ke TP <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center no-print">
              <p className="text-sm text-slate-500 mb-3">Analisis CP belum di-generate</p>
              <button
                onClick={generateAnalisisCP}
                disabled={state.loading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                Generate Analisis CP
              </button>
            </div>
          )}
        </>
      )}

      {state.subStep === 1 && (
        <>
          {state.tp ? (
            <>
              {renderTP()}
              <button
                onClick={async () => {
                  dispatch({ type: 'SET_SUB_STEP', payload: 2 });
                  await generateATP();
                }}
                className="self-start px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 no-print"
              >
                Lanjut ke ATP <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center no-print">
              <p className="text-sm text-slate-500 mb-3">TP belum di-generate</p>
              <button
                onClick={generateTP}
                disabled={state.loading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                Generate TP
              </button>
            </div>
          )}
        </>
      )}

      {state.subStep === 2 && (
        <>
          {state.atp ? (
            <>
              {renderATP()}
              <button
                onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}
                className="self-start px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 no-print"
              >
                Lanjut ke Prota + Prosem <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center no-print">
              <p className="text-sm text-slate-500 mb-3">ATP belum di-generate</p>
              <button
                onClick={generateATP}
                disabled={state.loading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                Generate ATP
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-slate-700 mb-1.5">{title}</h4>
      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{text}</p>
    </div>
  );
}
