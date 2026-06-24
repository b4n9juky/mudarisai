import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import type {
  PipelineState, PipelineInput, AnalisisCPData, TPData, ATPData,
  ProtaProsemData, ModulAjarData, LKPDData, AsesmenRubrikData,
  LessonLKPD, LessonAssessment,
  PipelineStep, SubStep,
} from '../types/pipeline';
import { pipelineApi } from '../lib/api';

const initialState: PipelineState = {
  id: null,
  input: { namaMadrasah: '', namaGuru: '', mapel: '', kelasFase: '', semester: '' },
  analisisCP: null,
  tp: null,
  atp: null,
  protaProsem: null,
  modulAjar: null,
  lkpd: null,
  asesmenRubrik: null,
  lessonLkpds: [],
  lessonAssessments: [],
  currentStep: 0,
  subStep: 0,
  loading: false,
  loadingStep: 0,
  error: '',
  mingguEfektifGanjil: 18,
  mingguEfektifGenap: 16,
  catatanKalender: '',
  fokusPenilaian: 'Proses & Eksplorasi',
};

type PipelineAction =
  | { type: 'SET_INPUT'; payload: PipelineInput }
  | { type: 'SET_STEP'; payload: PipelineStep }
  | { type: 'SET_SUB_STEP'; payload: SubStep }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_STEP'; payload: number }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CREATE_PIPELINE'; payload: { id: number; input: PipelineInput } }
  | { type: 'SET_ANALISIS_CP'; payload: AnalisisCPData }
  | { type: 'SET_TP'; payload: TPData }
  | { type: 'SET_ATP'; payload: ATPData }
  | { type: 'SET_PROTA_PROSEM'; payload: ProtaProsemData }
  | { type: 'SET_MODUL_AJAR'; payload: ModulAjarData }
  | { type: 'SET_LKPD'; payload: LKPDData }
  | { type: 'SET_ASESMEN_RUBRIK'; payload: AsesmenRubrikData }
  | { type: 'SET_LESSON_LKPDS'; payload: LessonLKPD[] }
  | { type: 'SET_LESSON_ASSESSMENTS'; payload: LessonAssessment[] }
  | { type: 'SET_KALENDER'; payload: { mingguEfektifGanjil: number; mingguEfektifGenap: number; catatanKalender: string } }
  | { type: 'SET_FOKUS_PENILAIAN'; payload: string }
  | { type: 'LOAD_PIPELINE'; payload: Partial<PipelineState> }
  | { type: 'RESET' };

function pipelineReducer(state: PipelineState, action: PipelineAction): PipelineState {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, input: action.payload };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_SUB_STEP':
      return { ...state, subStep: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_LOADING_STEP':
      return { ...state, loadingStep: action.payload };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: '' };
    case 'CREATE_PIPELINE':
      return { ...state, id: action.payload.id, input: action.payload.input };
    case 'SET_ANALISIS_CP':
      return { ...state, analisisCP: action.payload, loading: false };
    case 'SET_TP':
      return { ...state, tp: action.payload, loading: false };
    case 'SET_ATP':
      return { ...state, atp: action.payload, loading: false };
    case 'SET_PROTA_PROSEM':
      return { ...state, protaProsem: action.payload, loading: false };
    case 'SET_MODUL_AJAR':
      return { ...state, modulAjar: action.payload, loading: false };
    case 'SET_LKPD':
      return { ...state, lkpd: action.payload, loading: false };
    case 'SET_ASESMEN_RUBRIK':
      return { ...state, asesmenRubrik: action.payload, loading: false };
    case 'SET_KALENDER':
      return { ...state, ...action.payload };
    case 'SET_FOKUS_PENILAIAN':
      return { ...state, fokusPenilaian: action.payload };
    case 'SET_LESSON_LKPDS':
      return { ...state, lessonLkpds: action.payload, loading: false };
    case 'SET_LESSON_ASSESSMENTS':
      return { ...state, lessonAssessments: action.payload, loading: false };
    case 'LOAD_PIPELINE':
      return { ...state, ...action.payload, loading: false };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

interface PipelineContextType {
  state: PipelineState;
  dispatch: React.Dispatch<PipelineAction>;
  createPipeline: (input: PipelineInput) => Promise<void>;
  generateAnalisisCP: () => Promise<void>;
  generateTP: () => Promise<void>;
  generateATP: () => Promise<void>;
  generateProtaProsem: () => Promise<void>;
  generateModulAjar: () => Promise<void>;
  generateLKPD: () => Promise<void>;
  generateAssessmentRubrik: () => Promise<void>;
  generateModules: () => Promise<void>;
  generateAll: (input: PipelineInput) => Promise<void>;
  setKalender: (data: { mingguEfektifGanjil: number; mingguEfektifGenap: number; catatanKalender: string }) => void;
  setFokusPenilaian: (fokus: string) => void;
  resetPipeline: () => void;
}

const PipelineContext = createContext<PipelineContextType | null>(null);

const loadingStepTexts: Record<number, string[]> = {
  1: ['Menganalisis Capaian Pembelajaran...', 'Mengidentifikasi kompetensi inti...', 'Merumuskan karakteristik mata pelajaran...', 'Menyusun rekomendasi pendekatan...'],
  2: ['Merumuskan Tujuan Pembelajaran...', 'Menyusun rasional tujuan...', 'Mengidentifikasi kata kunci operasional...'],
  3: ['Menyusun Alur Tujuan Pembelajaran...', 'Memetakan TP ke dalam bab...', 'Menghitung alokasi waktu per bab...'],
  4: ['Menyusun Program Tahunan...', 'Menyusun Program Semester...', 'Menganalisis minggu efektif...'],
  5: ['Merancang Modul Ajar...', 'Menyusun identifikasi dan desain...', 'Merancang pengalaman belajar...'],
  6: ['Menyusun LKPD...', 'Merancang stimulus kontekstual...', 'Menyusun pertanyaan C1-C6...'],
  7: ['Menyusun Asesmen...', 'Merancang diagnostik...', 'Merancang formatif...', 'Merancang sumatif...', 'Menyusun Rubrik...'],
  8: ['Menyiapkan LKPD per pertemuan...', 'Menyusun misi eksplorasi...', 'Membuat panduan refleksi...', 'Menyusun rubrik asesmen per pertemuan...'],
};

export function PipelineProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(pipelineReducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const startLoading = useCallback((stepKey: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const stopLoading = useCallback(() => {
    dispatch({ type: 'SET_LOADING', payload: false });
    dispatch({ type: 'SET_LOADING_STEP', payload: 0 });
  }, []);

  const advanceLoading = useCallback(async (stepKey: number) => {
    const steps = loadingStepTexts[stepKey] || ['Memproses...'];
    for (let i = 0; i < steps.length; i++) {
      dispatch({ type: 'SET_LOADING_STEP', payload: i });
      await new Promise(r => setTimeout(r, 1200));
    }
  }, []);

  const withLoading = useCallback(async (stepKey: number, fn: () => Promise<void>) => {
    startLoading(stepKey);
    const controller = new AbortController();
    const loadingPromise = advanceLoading(stepKey);
    try {
      await fn();
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Terjadi kesalahan' });
    } finally {
      controller.abort();
      stopLoading();
    }
  }, [startLoading, advanceLoading, stopLoading]);

  const createPipelineFn = useCallback(async (input: PipelineInput) => {
    await withLoading(1, async () => {
      const res = await pipelineApi.create(input);
      dispatch({ type: 'CREATE_PIPELINE', payload: { id: res.pipeline.id, input } });
    });
  }, [withLoading]);

  const generateAnalisisCP = useCallback(async () => {
    const s = stateRef.current;
    if (!s.id) return;
    await withLoading(1, async () => {
      const res = await pipelineApi.generateAnalisisCP(s.id!, s.input);
      dispatch({ type: 'SET_ANALISIS_CP', payload: res.analisisCP });
    });
  }, [withLoading]);

  const generateTP = useCallback(async () => {
    const s = stateRef.current;
    if (!s.id || !s.analisisCP) return;
    await withLoading(2, async () => {
      const res = await pipelineApi.generateTP(s.id!, s.analisisCP);
      dispatch({ type: 'SET_TP', payload: res.tp });
    });
  }, [withLoading]);

  const generateATP = useCallback(async () => {
    const s = stateRef.current;
    if (!s.id || !s.tp) return;
    await withLoading(3, async () => {
      const res = await pipelineApi.generateATP(s.id!, s.tp);
      dispatch({ type: 'SET_ATP', payload: res.atp });
    });
  }, [withLoading]);

  const generateProtaProsem = useCallback(async () => {
    const s = stateRef.current;
    if (!s.id || !s.atp) return;
    await withLoading(4, async () => {
      const res = await pipelineApi.generateProtaProsem(s.id!, {
        mapel: s.input.mapel,
        kelasFase: s.input.kelasFase,
        semester: s.input.semester,
        atp: s.atp,
        kalender: {
          mingguEfektifGanjil: s.mingguEfektifGanjil,
          mingguEfektifGenap: s.mingguEfektifGenap,
          catatanKalender: s.catatanKalender,
        },
      });
      dispatch({ type: 'SET_PROTA_PROSEM', payload: res.protaProsem });
    });
  }, [withLoading]);

  const generateModulAjar = useCallback(async () => {
    const s = stateRef.current;
    if (!s.id) return;
    await withLoading(5, async () => {
      const payload = { input: s.input, analisisCP: s.analisisCP, tp: s.tp, atp: s.atp };
      const res = await pipelineApi.generateModulAjar(s.id!, payload);
      dispatch({ type: 'SET_MODUL_AJAR', payload: res.modulAjar });
    });
  }, [withLoading]);

  const generateLKPD = useCallback(async () => {
    const s = stateRef.current;
    if (!s.id || !s.modulAjar) return;
    await withLoading(6, async () => {
      const res = await pipelineApi.generateLKPD(s.id!, { input: s.input, modulAjar: s.modulAjar });
      dispatch({ type: 'SET_LKPD', payload: res.lkpd });
    });
  }, [withLoading]);

  const generateAssessmentRubrik = useCallback(async () => {
    const s = stateRef.current;
    if (!s.id) return;
    await withLoading(7, async () => {
      const res = await pipelineApi.generateAssessmentRubrik(s.id!, { input: s.input, tp: s.tp, modulAjar: s.modulAjar, fokusPenilaian: s.fokusPenilaian });
      dispatch({ type: 'SET_ASESMEN_RUBRIK', payload: res.asesmenRubrik });
    });
  }, [withLoading]);

  const generateModules = useCallback(async () => {
    const s = stateRef.current;
    if (!s.id) return;
    await withLoading(8, async () => {
      const res = await pipelineApi.generateModules(s.id!, { fokusPenilaian: s.fokusPenilaian });
      dispatch({ type: 'SET_LESSON_LKPDS', payload: res.lessonLkpds });
      dispatch({ type: 'SET_LESSON_ASSESSMENTS', payload: res.lessonAssessments });
    });
  }, [withLoading]);

  const generateAll = useCallback(async (input: PipelineInput) => {
    // Step 1: create pipeline
    dispatch({ type: 'SET_INPUT', payload: input });
    startLoading(1);
    try {
      const res = await pipelineApi.create(input);
      dispatch({ type: 'CREATE_PIPELINE', payload: { id: res.pipeline.id, input } });
      dispatch({ type: 'SET_STEP', payload: 1 });
      dispatch({ type: 'SET_SUB_STEP', payload: 0 });
      stopLoading();

      // Now chain through all steps using fresh API calls
      const pid = res.pipeline.id;
      const inp = input;

      // Analisis CP
      startLoading(1);
      const acp = await pipelineApi.generateAnalisisCP(pid, inp);
      dispatch({ type: 'SET_ANALISIS_CP', payload: acp.analisisCP });
      dispatch({ type: 'SET_SUB_STEP', payload: 1 });
      stopLoading();

      // TP
      startLoading(2);
      const tp = await pipelineApi.generateTP(pid, acp.analisisCP);
      dispatch({ type: 'SET_TP', payload: tp.tp });
      dispatch({ type: 'SET_SUB_STEP', payload: 2 });
      stopLoading();

      // ATP
      startLoading(3);
      const atp = await pipelineApi.generateATP(pid, tp.tp);
      dispatch({ type: 'SET_ATP', payload: atp.atp });
      stopLoading();

      // Prota+Prosem
      dispatch({ type: 'SET_STEP', payload: 2 });
      startLoading(4);
      const kalender = { mingguEfektifGanjil: stateRef.current.mingguEfektifGanjil, mingguEfektifGenap: stateRef.current.mingguEfektifGenap, catatanKalender: stateRef.current.catatanKalender };
      const pp = await pipelineApi.generateProtaProsem(pid, { mapel: inp.mapel, kelasFase: inp.kelasFase, semester: inp.semester, atp: atp.atp, kalender });
      dispatch({ type: 'SET_PROTA_PROSEM', payload: pp.protaProsem });
      stopLoading();

      // Modul Ajar
      dispatch({ type: 'SET_STEP', payload: 3 });
      startLoading(5);
      const ma = await pipelineApi.generateModulAjar(pid, { input: inp, analisisCP: acp.analisisCP, tp: tp.tp, atp: atp.atp });
      dispatch({ type: 'SET_MODUL_AJAR', payload: ma.modulAjar });
      stopLoading();

      // LKPD
      dispatch({ type: 'SET_STEP', payload: 4 });
      startLoading(6);
      const lkpd = await pipelineApi.generateLKPD(pid, { input: inp, modulAjar: ma.modulAjar });
      dispatch({ type: 'SET_LKPD', payload: lkpd.lkpd });
      stopLoading();

      // Assessment + Rubrik
      dispatch({ type: 'SET_STEP', payload: 5 });
      startLoading(7);
      const ar = await pipelineApi.generateAssessmentRubrik(pid, { input: inp, tp: tp.tp, modulAjar: ma.modulAjar, fokusPenilaian: stateRef.current.fokusPenilaian });
      dispatch({ type: 'SET_ASESMEN_RUBRIK', payload: ar.asesmenRubrik });
      stopLoading();

      // Per-meeting Modules (LKPD + Assessment per pertemuan)
      startLoading(8);
      const modules = await pipelineApi.generateModules(pid, { fokusPenilaian: stateRef.current.fokusPenilaian });
      dispatch({ type: 'SET_LESSON_LKPDS', payload: modules.lessonLkpds });
      dispatch({ type: 'SET_LESSON_ASSESSMENTS', payload: modules.lessonAssessments });
      stopLoading();

    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Gagal generate seluruh pipeline' });
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  const setKalender = useCallback((data: { mingguEfektifGanjil: number; mingguEfektifGenap: number; catatanKalender: string }) => {
    dispatch({ type: 'SET_KALENDER', payload: data });
  }, []);

  const setFokusPenilaian = useCallback((fokus: string) => {
    dispatch({ type: 'SET_FOKUS_PENILAIAN', payload: fokus });
  }, []);

  const resetPipeline = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return (
    <PipelineContext.Provider value={{
      state, dispatch,
      createPipeline: createPipelineFn,
      generateAnalisisCP, generateTP, generateATP,
      generateProtaProsem, generateModulAjar, generateLKPD, generateAssessmentRubrik,
      generateModules,
      generateAll, setKalender, setFokusPenilaian, resetPipeline,
    }}>
      {children}
    </PipelineContext.Provider>
  );
}

export function usePipeline(): PipelineContextType {
  const ctx = useContext(PipelineContext);
  if (!ctx) throw new Error('usePipeline must be used within PipelineProvider');
  return ctx;
}
