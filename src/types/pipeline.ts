// ============================================================
// PIPELINE TYPES — data flow antar step
// ============================================================

export interface PipelineInput {
  namaMadrasah: string;
  namaGuru: string;
  mapel: string;
  kelasFase: string;
  semester: string;
}

export interface AnalisisCPData {
  capaianPembelajaran: string;
  analisisKompetensi: string;
  karakteristikMapel: string;
  rekomendasiPendekatan: string;
}

export interface TPData {
  tujuanList: string[];
  rasional: string;
  kataKunci: string[];
}

export interface ATPBab {
  bab: string;
  tp: string[];
  minggu: string;
  alokasiWaktu: string;
}

export interface ATPData {
  alur: ATPBab[];
  totalJam: string;
}

export interface ProtaProsemData {
  header: {
    namaMadrasah: string;
    namaGuru: string;
    mapel: string;
    faseKelasSmt: string;
    kalenderInfo: string;
  };
  prota: {
    semesterGanjil: {
      no: string;
      babMateri: string;
      tujuanDanAlurPembelajaran: string;
      alokasiWaktu: string;
    }[];
    semesterGenap: {
      no: string;
      babMateri: string;
      tujuanDanAlurPembelajaran: string;
      alokasiWaktu: string;
    }[];
    totalAlokasiWaktu: string;
  };
  prosemGanjil: {
    bulan: string[];
    materiRows: {
      no: string;
      babMateri: string;
      alokasiWaktu: string;
      mingguMaping: string[];
    }[];
  };
  prosemGenap: {
    bulan: string[];
    materiRows: {
      no: string;
      babMateri: string;
      alokasiWaktu: string;
      mingguMaping: string[];
    }[];
  };
  analisisMingguEfektif: {
    totalMingguEfektifGanjil: string;
    totalMingguEfektifGenap: string;
    keteranganEfektifitas: string;
  };
}

export interface ModulAjarData {
  header: {
    namaMadrasah: string;
    namaGuru: string;
    mapel: string;
    faseKelasSmt: string;
    materi: string;
    alokasiWaktu: string;
  };
  identifikasi: {
    pesertaDidikDetail: string;
    materiPelajaranCP: string;
    dimensiProfil: string[];
    kurikulumPancaCinta: string[];
  };
  desain: {
    capaianPembelajaran: string;
    lintasDisiplinIlmu: string;
    tujuanPembelajaran: string[];
    topikPembelajaran: string;
    praktikPedagogis: string;
    kemitraanPembelajaran: string;
    lingkunganPembelajaran: string;
    pemanfaatanDigital: string;
  };
  pengalaman: {
    prinsipPembelajaran: string;
    langkahPembelajaran: {
      memahami: string[];
      mengaplikasi: string[];
      merefleksi: string[];
    };
    asesmenPembelajaran: {
      awal: string;
      proses: string;
      akhir: string;
    };
    rubrikPenilaian: {
      aspek: string;
      kriteriaSangatBaik: string;
      kriteriaBaik: string;
      kriteriaCukup: string;
      kriteriaPerluBimbingan: string;
    }[];
    refleksiSiswa: string[];
    refleksiGuru: string[];
  };
}

export interface LKPDData {
  header: {
    namaMadrasah: string;
    namaGuru: string;
    mapel: string;
    faseKelasSmt: string;
    materi: string;
    alokasiWaktu: string;
    tujuanPembelajaran: string;
  };
  petunjukKerja: string[];
  stimulusKontekstual: {
    judul: string;
    narasi: string;
  };
  aktivitas: {
    jenis: string;
    namaAktivitas: string;
    panduanLangkah: string[];
  };
  pertanyaanC1C6: {
    level: string;
    pertanyaan: string;
    petunjukJawaban: string;
  }[];
  kesimpulan: string;
  refleksi: {
    instruksi: string;
    pertanyaan: string[];
  };
  rubrikPenilaian: {
    kriteria: string;
    skor4: string;
    skor3: string;
    skor2: string;
    skor1: string;
  }[];
}

export interface AsesmenRubrikData {
  header: {
    namaMadrasah: string;
    namaGuru: string;
    mapel: string;
    faseKelasSmt: string;
    materi: string;
    alokasiWaktu: string;
    tujuanPembelajaran: string;
  };
  asesmenDiagnostik: {
    kognitif: {
      tujuan: string;
      pertanyaan: { no: string; soal: string; tindakLanjut: string }[];
    };
    nonKognitif: {
      tujuan: string;
      aspek: { pertanyaan: string; indikator: string }[];
    };
  };
  asesmenFormatif: {
    observasiSikap: {
      instruksi: string;
      kriteria: string[];
      rubrik: { skor4: string; skor3: string; skor2: string; skor1: string }[];
    };
    penilaianDiri: {
      instruksi: string;
      pernyataan: string[];
    };
  };
  asesmenSumatif: {
    kisiKisi: string;
    soalPgDanEsai: {
      no: string;
      tipe: string;
      tingkatKognitif: string;
      pertanyaan: string;
      opsi?: string[];
      kunciJawaban: string;
      penjelasan: string;
    }[];
    rubrikPenilaianSumatif: {
      kriteria: string;
      deskripsiSkor: string[];
    }[];
  };
  rubrikPenilaian: {
    aspek: string;
    kriteria: string[];
    skorMaks: number;
    deskriptor: string;
  }[];
}

export interface KalenderConfig {
  mingguEfektifGanjil: number;
  mingguEfektifGenap: number;
  catatanKalender: string;
}

// Pipeline state untuk frontend
export type PipelineStep = 0 | 1 | 2 | 3 | 4 | 5;
export type SubStep = 0 | 1 | 2; // 0=AnalisisCP, 1=TP, 2=ATP

export interface PipelineState {
  id: number | null;
  input: PipelineInput;
  analisisCP: AnalisisCPData | null;
  tp: TPData | null;
  atp: ATPData | null;
  protaProsem: ProtaProsemData | null;
  modulAjar: ModulAjarData | null;
  lkpd: LKPDData | null;
  asesmenRubrik: AsesmenRubrikData | null;
  currentStep: PipelineStep;
  subStep: SubStep;
  loading: boolean;
  loadingStep: number;
  error: string;
  // Kalender / minggu efektif
  mingguEfektifGanjil: number;
  mingguEfektifGenap: number;
  catatanKalender: string;
  // Fokus penilaian untuk Asesmen + Rubrik
  fokusPenilaian: string;
}
