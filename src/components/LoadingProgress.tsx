import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

const loadingStepTexts: Record<number, string[]> = {
  1: [
    'Menganalisis Capaian Pembelajaran...',
    'Mengidentifikasi kompetensi inti...',
    'Merumuskan karakteristik mata pelajaran...',
    'Menyusun rekomendasi pendekatan pembelajaran...',
  ],
  2: [
    'Merumuskan Tujuan Pembelajaran...',
    'Menyusun rasional tujuan...',
    'Mengidentifikasi kata kunci operasional...',
  ],
  3: [
    'Menyusun Alur Tujuan Pembelajaran...',
    'Memetakan TP ke dalam bab...',
    'Menghitung alokasi waktu per bab...',
  ],
  4: [
    'Menyusun Program Tahunan (PROTA)...',
    'Menyusun Program Semester (PROSEM)...',
    'Menganalisis minggu efektif...',
  ],
  5: [
    'Merancang Modul Ajar...',
    'Menyusun identifikasi dan desain pembelajaran...',
    'Merancang pengalaman belajar...',
    'Menyusun rubrik penilaian...',
  ],
  6: [
    'Menyusun Lembar Kerja Peserta Didik...',
    'Merancang stimulus kontekstual...',
    'Menyusun pertanyaan berjenjang C1-C6...',
    'Menyusun rubrik penilaian LKPD...',
  ],
  7: [
    'Menyusun Instrumen Asesmen...',
    'Merancang asesmen diagnostik...',
    'Merancang asesmen formatif...',
    'Merancang asesmen sumatif...',
    'Menyusun Rubrik Penilaian...',
  ],
};

interface Props {
  currentStep: number;
  loadingStep: number;
  message?: string;
}

export default function LoadingProgress({ currentStep, loadingStep, message }: Props) {
  const steps = loadingStepTexts[currentStep] || ['Memproses...'];
  const progress = ((loadingStep + 1) / steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="col-span-12 bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col items-center gap-4"
    >
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        >
          <Sparkles className="w-5 h-5 text-emerald-600" />
        </motion.div>
        <p className="text-sm font-semibold text-slate-700">
          {message || 'Mesin Kurikulum Deep Learning sedang bekerja...'}
        </p>
      </div>

      <div className="w-full max-w-md bg-slate-100 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <p className="text-xs text-slate-400 italic">
        {steps[loadingStep] || steps[0]}
      </p>
    </motion.div>
  );
}
