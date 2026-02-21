import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, StockAnalysisInput, GroundingSource, ConsistencyResult } from "../types";

// Note: Client initialization is now handled dynamically inside the retry loop to ensure freshness.

const BROKER_KNOWLEDGE = `
[INTELLIGENCE DATABASE: IDX BROKER MAP]
MS: 'RICH', desc: 'Morgan Stanley: Asing US.' 
  UB: 'RICH', desc: 'UBS: Asing kuat.' 
  BK: 'RICH', desc: 'JP Morgan: Arus institusi.' 
  AK: 'RICH', desc: 'UBS Patungan.' 
  YP: 'RICH', desc: 'Mirae Asset: Top Ritel Pro & Institusi.' 
  ZP: 'RICH', desc: 'MNC Sekuritas: Institusi Lokal.' 
  HD: 'RICH', desc: 'KGI Sekuritas.' 
  RX: 'RICH', desc: 'RHB Sekuritas.' 
  DU: 'RICH', desc: 'Deutsche Sekuritas.' 
  CG: 'RICH', desc: 'CGS-CIMB.' 
  KZ: 'RICH', desc: 'CLSA Sekuritas.' 
  DR: 'RICH', desc: 'Danareksa (Institusi).' 
  LH: 'RICH', desc: 'Lautandhana.' 
  AH: 'RICH', desc: 'Andalan.' 
  GW: 'RICH', desc: 'Golden.' 
  RB: 'RICH', desc: 'RHB.' 
  TP: 'RICH', desc: 'Trimegah (Institusi).' 
  KK: 'RICH', desc: 'Kresna.' 
  LS: 'RICH', desc: 'Laurent.' 

  // --- KONGLO SPESIAL (Market Maker / Group) ---
  HP: 'KONGLO', desc: 'Henan Putihrai: Spesialis grup konglomerasi.' 
  DX: 'KONGLO', desc: 'Bahana (Kadang Institusi/Konglo).' 
  LG: 'KONGLO', desc: 'Trimegah (Akun Khusus).' 
  MU: 'KONGLO', desc: 'Minna Padi.' 
  ES: 'KONGLO', desc: 'Ekosistem Grup Tertentu.' 
  MG: 'KONGLO', desc: 'Semesta Indovest (Sering jadi MM).' 

  // --- AMPAS / RITEL (Crowd / Lemah) ---
  XL: 'AMPAS', desc: 'Stockbit: Ritel crowd, panic easy.' 
  XC: 'AMPAS', desc: 'Ajaib: Ritel pemula & mahasiswa.' 
  PD: 'AMPAS', desc: 'Indo Premier: Ritel massal.' 
  CC: 'AMPAS', desc: 'Mandiri Sekuritas (Akun Ritel).' 
  CP: 'AMPAS', desc: 'Valbury (Ritel).' 
  NI: 'AMPAS', desc: 'BNI Sekuritas (Ritel).' 
  IF: 'AMPAS', desc: 'Samuel Sekuritas (Ritel).' 
  BB: 'AMPAS', desc: 'Verdhana (Ritel).' 
  SS: 'AMPAS', desc: 'Ajaib (Kode lama/baru).' 
  BQ: 'AMPAS', desc: 'Korea Investment (Ritel).' 
  GR: 'AMPAS', desc: 'Panin (Ritel).' 
  SA: 'AMPAS', desc: 'Ritel Kecil.' 
  SC: 'AMPAS', desc: 'Ritel Kecil.' 
  SF: 'AMPAS', desc: 'Surya Fajar.' 
  SH: 'AMPAS', desc: 'Artha Sekuritas (Ritel).' 
  SQ: 'AMPAS', desc: 'BCA Sekuritas (Ritel).' 
  TF: 'AMPAS', desc: 'Universal.' 
  TS: 'AMPAS', desc: 'Tri Megah (Ritel).' 
  TX: 'AMPAS', desc: 'Ritel.' 
  XA: 'AMPAS', desc: 'Ritel.' 
  YB: 'AMPAS', desc: 'Mega Capital (Ritel).' 
  YJ: 'AMPAS', desc: 'Lotus (Ritel).' 
  YO: 'AMPAS', desc: 'Amantara.' 
  ZR: 'AMPAS', desc: 'Bumiputera.' 

  // --- CAMPUR (Mixed / Unknown / Tidak Signifikan) ---
  AD: 'CAMPUR', desc: 'Oso Sekuritas.' 
  AF: 'CAMPUR', desc: 'Harita.' 
  AG: 'CAMPUR', desc: 'Kiwoom.' 
  AI: 'CAMPUR', desc: 'UOB Kay Hian.' 
  AJ: 'CAMPUR', desc: 'Pillars.' 
  AN: 'CAMPUR', desc: 'Wanteg.' 
  AO: 'CAMPUR', desc: 'Erdikha.' 
  AP: 'CAMPUR', desc: 'Pacific.' 
  AR: 'CAMPUR', desc: 'Binaartha.' 
  AZ: 'CAMPUR', desc: 'Sucor (Campur Ritel/Institusi).' 
  BF: 'CAMPUR', desc: 'Inti Fikasa.' 
  BS: 'CAMPUR', desc: 'Equity.' 
  BZ: 'CAMPUR', desc: 'Batavia.' 
  DD: 'CAMPUR', desc: 'Makinta.' 
  DM: 'CAMPUR', desc: 'Masindo.' 
  DP: 'CAMPUR', desc: 'DBS Vickers.' 
  EL: 'CAMPUR', desc: 'Evergreen.' 
  FO: 'CAMPUR', desc: 'Forte.' 
  FS: 'CAMPUR', desc: 'Fasilitas.' 
  FZ: 'CAMPUR', desc: 'Waterfront.' 
  IC: 'CAMPUR', desc: 'BCA (Campur).' 
  ID: 'CAMPUR', desc: 'Anugerah.' 
  IH: 'CAMPUR', desc: 'Pacific 2000.' 
  II: 'CAMPUR', desc: 'Danatama.' 
  IN: 'CAMPUR', desc: 'Investindo.' 
  IT: 'CAMPUR', desc: 'Inti Teladan.' 
  IU: 'CAMPUR', desc: 'Indo Capital.' 
  JB: 'CAMPUR', desc: 'Jasa Utama.' 
  KI: 'CAMPUR', desc: 'Ciptadana.' 
  KS: 'CAMPUR', desc: 'Karta.' 
  MI: 'CAMPUR', desc: 'Victoria.' 
  MK: 'CAMPUR', desc: 'MNC (Campur).' 
  OD: 'CAMPUR', desc: 'Danareksa.' 
  OK: 'CAMPUR', desc: 'Nett.' 
  PC: 'CAMPUR', desc: 'Panca Global.' 
  PF: 'CAMPUR', desc: 'Danasakti.' 
  PG: 'CAMPUR', desc: 'Panca Global.' 
  PI: 'CAMPUR', desc: 'Pendanaan.' 
  PO: 'CAMPUR', desc: 'Pilar.' 
  PP: 'CAMPUR', desc: 'Aldiracita.' 
  PS: 'CAMPUR', desc: 'Paramitra.' 
  RG: 'CAMPUR', desc: 'Profindo.' 
  RO: 'CAMPUR', desc: 'NISP.' 
  RS: 'CAMPUR', desc: 'Yulie.' 
  YU: 'CAMPUR', desc: 'CIMB.' 
  KAF: 'CAMPUR', desc: 'KAF Sekuritas.'
`;

const SYSTEM_INSTRUCTION = `
System Role: Senior Quantitative Fund Manager & Forensic Market Auditor
(TradeLogic "The Ruthless" v9.1 – Institutional Grade).

MISSION:
Memberikan analisis saham Indonesia yang dingin, skeptis, dan berbasis risiko nyata.
Tujuan utama sistem ini adalah MEMISAHKAN:
- Saham yang TIDAK LAYAK DITRADE
- Saham yang LAYAK DIPANTAU
- Saham yang LAYAK DIEKSEKUSI

Sistem ini BUKAN mesin BUY.
Sistem ini adalah mesin FILTER, AUDIT, dan RISK CONTROL.

Cash adalah posisi valid.

LANGUAGE PROTOCOL:
STRICTLY BAHASA INDONESIA.
Gaya bahasa: Formal, tajam, institusional, tanpa narasi motivasional.
Data > opini.

${BROKER_KNOWLEDGE}

==============================
MANDATORY LOGIC EXECUTION TREE
==============================

1. SMART MONEY VERIFICATION (WHO + HOW FILTER)
   - Broker RICH/KONGLO dianggap VALID jika:
     a) Holding ≥ 3 hari
     b) Average cost naik
     c) Tidak ada distribusi paralel signifikan
   - Jika tidak terpenuhi:
     -> STATUS: NON-CONFIRMED FLOW
     -> Dampak: Edge DITURUNKAN, BUKAN AUTO REJECT

2. LOGIC CONFLICT DETECTOR (VALUE vs FLOW)
   - Jika Fundamental kuat tetapi Flow DISTRIBUTION:
     -> Label: LOGIC CONFLICT
     -> Penalti skor, BUKAN auto FORBIDDEN
     -> Default verdict: WAIT CONFIRMATION

3. MARKET STRUCTURE DECAY (PROGRESSIVE)
   - DISTRIBUTION + RETAIL DOMINANCE:
     -> Score decay bertahap
     -> Tidak boleh menghasilkan ACCUMULATE
     -> Masih boleh menghasilkan WAIT jika likuiditas cukup

4. RETAIL CHURNING DETECTOR
   - Volume tinggi + Net Accumulation flat/negatif:
     -> Volume dianggap noise
     -> Edge spekulatif boleh ada, tapi dengan confidence rendah

5. ORDER BOOK AUTHENTICITY
   - Offer > 2x Bid:
     -> Jika harga stagnan: CONTROLLED DISTRIBUTION
     -> Jika harga turun: HEAVY RESISTANCE
   - ABSORPTION hanya valid jika:
     Harga naik + VWAP naik + Inventory naik

6. FAILURE MODE (HARD ONLY IF UNTRADEABLE)
   - FORBIDDEN HANYA JIKA:
     a) Likuiditas tidak cukup untuk exit realistis
     b) Modal user > 1% ADTV
     c) Trading halt / vacuum ekstrem
   - Jika hanya risiko tinggi:
     -> Verdict: WAIT CONFIRMATION / NO EDGE

7. TIME HORIZON FILTER
   - Setup speculative:
     -> Tidak boleh ACCUMULATE
     -> Maksimal WAIT / POSSIBLE

8. TAIL RISK ANALYSIS
   - Kurtosis / CVaR tinggi:
     -> Kurangi skor
     -> Batasi sizing
     -> BUKAN auto reject

==============================
VERDICT HIERARCHY (WAJIB)
==============================

1. FORBIDDEN
   - Tidak bisa ditrade secara teknis atau likuiditas

2. AVOID
   - Bisa ditrade, tapi probabilitas negatif

3. NO EDGE / STAY FLAT
   - Tidak ada keunggulan statistik saat ini

4. WAIT CONFIRMATION
   - Ada aliran dana / struktur awal
   - Belum layak entry
   - Layak MASUK WATCHLIST

5. ACCUMULATE
   - Institusi valid
   - Struktur sehat
   - Valuasi tidak irasional

==============================
OUTPUT PHILOSOPHY
==============================

- Mayoritas saham HARUS berakhir di:
  AVOID / NO EDGE / WAIT

- ACCUMULATE adalah output LANGKA dan ELIT

- Jika ragu antara FORBIDDEN dan WAIT:
  Pilih WAIT kecuali ada bukti tidak bisa exit

- NEWS INTEGRATION (SKEPTICAL AUDIT):
  Setiap berita/corporate action WAJIB di-audit terhadap data keras (Flow & Fundamental). Data yang dimasukkan dianggap sebagai data lampau (After-Market).
  - AFTER-MARKET CATALYST: Berita positif setelah market tutup bisa menjadi pemicu Reversal.
  - Untuk MEDIUM (SWING): Berita positif bisa meng-offset Bandarmology negatif lampau JIKA fundamental solid. Label: "Speculative Reversal".
  - Untuk LONG (INVEST): FUNDAMENTAL ADALAH HARGA MATI. Berita sebagus apapun TIDAK BOLEH merubah status menjadi ACCUMULATE jika Fundamental busuk. Berita bagus pada saham fundamental jelek WAJIB dilabeli sebagai "Exit Liquidity Trap" (Umpan untuk ritel agar institusi bisa jualan di harga tinggi).
  - Hasil analisa berita WAJIB muncul di "fullAnalysis" (Forensic Log) dengan format: [NEWS AUDIT: (Link/Judul) -> (Verdict: Valid/Noise/Trap/Catalyst)].

- CONSISTENCY RULE:
  Jika status = FORBIDDEN, maka Entry, TP, dan SL harus diisi dengan "N/A" atau penjelasan singkat kenapa dilarang.
  Pastikan "verdict" di setiap trade plan selaras dengan "prediction.direction". Jika arah DOWN, verdict tidak boleh ACCUMULATE.

TONE:
Dingin. Skeptis. Institusional.
Tidak mencari pembenaran BUY.

`;

const tradePlanSchema = {
  type: Type.OBJECT,
  properties: {
    verdict: { type: Type.STRING },
    entry: { type: Type.STRING },
    tp: { type: Type.STRING },
    sl: { type: Type.STRING },
    reasoning: { type: Type.STRING, description: "WAJIB berisi: (1) alasan teknis keputusan status, " +
    "(2) konsekuensi risiko utama, dan " +
    "(3) aturan alokasi modal (jika status ≠ FORBIDDEN). " +
    "Jika status = FORBIDDEN, reasoning WAJIB menjelaskan kenapa TIDAK BOLEH TRADE. " +
    "Bahasa Indonesia, tanpa motivasi." },
   status: {
  type: Type.STRING,
  enum: ["RECOMMENDED", "POSSIBLE", "WAIT & SEE", "FORBIDDEN"],
  description:
    "RECOMMENDED = Edge statistik jelas, layak eksekusi.\n" +
    "POSSIBLE = Edge lemah, hanya untuk size kecil & cepat.\n" +
    "WAIT & SEE = Tidak ada edge, observasi saja.\n" +
    "FORBIDDEN = Risiko struktural / likuiditas / distribusi. DILARANG TRADE."}
  }
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    ticker: { type: Type.STRING },
    priceInfo: {
      type: Type.OBJECT,
      properties: {
        current: { type: Type.STRING },
        bandarAvg: { type: Type.STRING },
        diffPercent: { type: Type.NUMBER },
        status: { type: Type.STRING },
      }
    },
    marketCapAnalysis: {
      type: Type.OBJECT,
      properties: {
        category: { type: Type.STRING, enum: ["Small Cap", "Mid Cap", "Big Cap", "UNKNOWN"] },
        behavior: { type: Type.STRING },
      }
    },
    supplyDemand: {
        type: Type.OBJECT,
        properties: {
            bidStrength: {
      type: Type.NUMBER,
      description: 
        "Skor kekuatan BID riil (0–100). " +
        "0–30 = Lemah / Spoofing. " +
        "31–60 = Netral. " +
        "61–100 = Aktif & konsisten."
    },
            offerStrength: {
      type: Type.NUMBER,
      description: 
        "Skor tekanan OFFER (0–100). " +
        "0–30 = Supply tipis. " +
        "31–60 = Normal. " +
        "61–100 = Distribusi aktif."
    },
            verdict: {
      type: Type.STRING,
      enum: [
        "ABSORPTION_VALID",
        "CONTROLLED_DISTRIBUTION",
        "FAKE_LIQUIDITY",
        "BALANCED_FLOW",
        "NO_DEMAND"
      ],
      description:
        "Kesimpulan WAJIB dipilih dari enum. " +
        "Tidak boleh narasi bebas." }
        }
    },
    prediction: {
      type: Type.OBJECT,
      properties: {
        direction: { type: Type.STRING, enum: ["UP", "DOWN", "CONSOLIDATE", "UNKNOWN"] },
        probability: { type: Type.NUMBER },
        reasoning: { type: Type.STRING, description: "MUST BE IN INDONESIAN." },
      }
    },
    stressTest: {
      type: Type.OBJECT,
      properties: {
        passed: { type: Type.BOOLEAN },
       score: {
  type: Type.NUMBER,
  description:
    "Final Risk-Adjusted Conviction Score (0–100) " +
    "SETELAH semua penalty diterapkan. " +
    "0–39 = FORBIDDEN, 40–54 = NO EDGE, 55–69 = SPECULATIVE, ≥70 = CONVICTION."},
        details: { type: Type.STRING, description: "MUST BE IN INDONESIAN." },
      }
    },
    brokerAnalysis: {
      type: Type.OBJECT,
      properties: {
        classification: { type: Type.STRING },
        insight: { type: Type.STRING, description: "Mention if 'Retail Churning' or 'Smart Money' is detected. MUST BE IN INDONESIAN." },
      }
    },
    summary: { type: Type.STRING, description: "MUST BE IN INDONESIAN." },
    bearCase: { type: Type.STRING, description: "MUST BE IN INDONESIAN." },
    strategy: {
      type: Type.OBJECT,
      properties: {
        bestTimeframe: { type: Type.STRING, enum: ["SHORT", "MEDIUM", "LONG"] },
        shortTerm: tradePlanSchema,
        mediumTerm: tradePlanSchema,
        longTerm: tradePlanSchema
      }
    },
    fullAnalysis: { type: Type.STRING, description: "Analisa mendalam (Forensic Log). WAJIB menyertakan section: (1) Flow Audit, (2) Fundamental Audit, (3) NEWS & CORPORATE ACTION CORRELATION. MUST BE IN INDONESIAN." }
  },
  required: ["ticker", "priceInfo", "marketCapAnalysis", "supplyDemand", "prediction", "stressTest", "brokerAnalysis", "summary", "bearCase", "strategy", "fullAnalysis"]
};

// --- ROBUST RETRY LOGIC & FRESH CLIENT GENERATOR ---

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithRetry(params: any, retries = 3): Promise<any> {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key is missing. Please ensure API_KEY or GEMINI_API_KEY is set in environment variables.");

  for (let i = 0; i < retries; i++) {
    try {
      // "Ganti AI Jadi Baru": Create a new instance for every attempt to ensure freshness
      const ai = new GoogleGenAI({ apiKey });
      return await ai.models.generateContent(params);
    } catch (error: any) {
      // Handle 429 (Quota Exceeded) and 503 (Server Overload)
      const isQuotaError = error.status === 429 || error.code === 429 || (error.message && error.message.includes('429'));
      const isServerError = error.status === 503 || error.code === 503;

      if (isQuotaError || isServerError) {
        if (i === retries - 1) throw error; // Max retries reached, fail loudly

        // Exponential Backoff: 2s, 4s, 8s
        const delay = 2000 * Math.pow(2, i);
        console.warn(`⚠️ API Quota/Busy (Attempt ${i + 1}/${retries}). Retrying in ${delay}ms...`);
        await wait(delay);
        continue;
      }
      
      // If it's another error (like 400 Bad Request), throw immediately
      throw error;
    }
  }
}

export const analyzeStock = async (input: StockAnalysisInput): Promise<AnalysisResult> => {
  try {
    const riskInstruction =
  input.riskProfile === 'CONSERVATIVE'
    ? `
RISK PROFILE: CONSERVATIVE (HAWK)
- PBV > 5x: penalty -15
- PER TTM > 25x: penalty -15
- CFO TTM <= 0: penalty -20
- Current Ratio < 1: penalty -10
- Net Income Growth < 0: penalty -15
- Market Structure = DISTRIBUTION: score cap MAX 49
`
    : input.riskProfile === 'AGGRESSIVE'
    ? `
RISK PROFILE: AGGRESSIVE (BULL)
- PBV > 10x: penalty -5
- PER TTM > 40x: penalty -5
- Market Structure = DISTRIBUTION: penalty -10
- Retail Accumulation detected: score cap MAX 54
`
    : `
RISK PROFILE: BALANCED
- PBV > 7x: penalty -10
- PER TTM > 30x: penalty -10
- DER > 2: penalty -10
- Fundamental vs Flow conflict: penalty -15
`;

    // Logic: Use manual fundamentals if provided, otherwise use AI extracted text
    const hasManualFundamentals = input.fundamentals.roe !== '' || input.fundamentals.per_ttm !== '';
    const fundamentalContext = hasManualFundamentals 
      ? `
    [FUNDAMENTALS - MANUAL INPUT]
    PROFITABILITY:
    ROE: ${input.fundamentals.roe}% | ROA: ${input.fundamentals.roa}% | GPM: ${input.fundamentals.gpm}%
    OPM: ${input.fundamentals.opm}% | NPM: ${input.fundamentals.npm}% | EPS TTM: ${input.fundamentals.eps_ttm}
    
    GROWTH (YoY):
    Rev (Q/YTD/Ann): ${input.fundamentals.rev_q_yoy}% / ${input.fundamentals.rev_ytd_yoy}% / ${input.fundamentals.rev_ann_yoy}%
    NI (Q/YTD/Ann): ${input.fundamentals.ni_q_yoy}% / ${input.fundamentals.ni_ytd_yoy}% / ${input.fundamentals.ni_ann_yoy}%
    EPS (Q/YTD/Ann): ${input.fundamentals.eps_q_yoy}% / ${input.fundamentals.eps_ytd_yoy}% / ${input.fundamentals.eps_ann_yoy}%

    VALUATION:
    PER (TTM/Ann): ${input.fundamentals.per_ttm}x / ${input.fundamentals.per_ann}x | PBV: ${input.fundamentals.pbv}x
    EV/EBITDA: ${input.fundamentals.ev_ebitda}x | P/S: ${input.fundamentals.ps_ttm}x | P/CF: ${input.fundamentals.pcf_ttm}x
    Market Cap: ${input.fundamentals.market_cap} | Free Float: ${input.fundamentals.free_float}%

    BALANCE SHEET:
    Assets: ${input.fundamentals.total_assets} | Liabilities: ${input.fundamentals.total_liabilities}
    Debt: ${input.fundamentals.total_debt} | Net Debt: ${input.fundamentals.net_debt}
    DER: ${input.fundamentals.der}x | Current Ratio: ${input.fundamentals.current_ratio} | Quick Ratio: ${input.fundamentals.quick_ratio}

    CASH FLOW (TTM):
    CFO: ${input.fundamentals.cfo_ttm} | CFI: ${input.fundamentals.cfi_ttm} | CFF: ${input.fundamentals.cff_ttm}
    CapEx: ${input.fundamentals.capex_ttm} | FCF: ${input.fundamentals.fcf_ttm}

    PER SHARE:
    EPS Ann: ${input.fundamentals.eps_ann_ps} | Rev: ${input.fundamentals.rev_ps} | Cash: ${input.fundamentals.cash_ps}
    BVPS: ${input.fundamentals.bvps} | FCFPS: ${input.fundamentals.fcfps}
    `
      : `
    [FUNDAMENTALS - AI EXTRACTED FROM PHOTOS]
    ${input.aiExtractedFundamentals || 'TIDAK ADA DATA FUNDAMENTAL. ANALISA BERDASARKAN FLOW SAJA.'}
    `;

    const prompt = `
    RUTHLESS AUDIT REQUEST: ${input.ticker} @ ${input.price}
    MANDATE: ${input.riskProfile}
    CAPITAL: ${input.capital} IDR (Tier: ${input.capitalTier})
    LANGUAGE: INDONESIA ONLY.
    
    [LOGIC INJECTION]
    ${riskInstruction}

    ${fundamentalContext}
    
    [MARKET STRUCTURE & TAPE READING]
    Bandar Score: ${input.bandarmology.brokerSummaryVal} (0=Dist, 100=Acc)
    Top Brokers: ${input.bandarmology.topBrokers}
    Avg Cost Dominant: ${input.bandarmology.bandarAvgPrice}
    Duration: ${input.bandarmology.duration}
    
    ORDER BOOK (Analyze for Spoofing/Absorption):
    Bid Vol: ${input.bandarmology.orderBookBid}
    Ask Vol: ${input.bandarmology.orderBookAsk}
    
    TRADE BOOK (Analyze for Churning):
    HAKA (Buy Power): ${input.bandarmology.tradeBookAsk}
    HAKI (Sell Power): ${input.bandarmology.tradeBookBid}
    
    [INTELLIGENCE TEXT]
    ${input.rawIntelligenceData}

    [NEWS & CORPORATE ACTION AUDIT]
    ${input.newsData || 'TIDAK ADA DATA BERITA. Jika ada berita di masa depan, masukkan untuk korelasi fundamental.'}
    
    INSTRUCTION: 
    1. Jika ada URL/Link, gunakan 'urlContext'.
    2. Lakukan SKEPTICAL AUDIT: Data yang dimasukkan adalah data lampau (After-Market).
    3. Untuk SWING: Berita positif bisa menjadi 'Speculative Reversal Catalyst' jika fundamental solid.
    4. Untuk INVEST: FUNDAMENTAL ADALAH PRIORITAS UTAMA. Jika berita POSITIF tapi Fundamental BUSUK, tandai sebagai 'Exit Liquidity Trap'. Jangan berikan status ACCUMULATE hanya karena berita.
    5. Tampilkan hasil audit di Forensic Log dengan format [NEWS AUDIT: ...].
    `;

    // Use the robust retry wrapper
    const response = await generateWithRetry({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        tools: [{ urlContext: {} }],
        temperature: 0.0, // Strict Logic
        topK: 1, 
        topP: 0.1, 
        seed: 42069, 
      }
    });

    const data = JSON.parse(response.text) as AnalysisResult;
    return { ...data, id: crypto.randomUUID(), timestamp: Date.now(), sources: [] };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const runConsistencyCheck = async (history: AnalysisResult[]): Promise<ConsistencyResult> => {
  const sorted = history.sort((a, b) => a.timestamp - b.timestamp);
  const prompt = `Analisa tren konsistensi untuk ${sorted[0].ticker}. Data: ${JSON.stringify(sorted)}. Gunakan BAHASA INDONESIA profesional dan berikan outlook trend jangka panjang.`;
  
  const consistencySchema: Schema = {
    type: Type.OBJECT,
    properties: {
        ticker: { type: Type.STRING },
        dataPoints: { type: Type.NUMBER },
        trendVerdict: { type: Type.STRING, enum: ['IMPROVING', 'STABLE', 'DEGRADING', 'VOLATILE'] },
        consistencyScore: { type: Type.NUMBER },
        analysis: { type: Type.STRING, description: "MUST BE IN INDONESIAN." },
        actionItem: { type: Type.STRING, description: "MUST BE IN INDONESIAN." }
    }
  };

  // Use the robust retry wrapper
  const response = await generateWithRetry({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { 
        responseMimeType: "application/json", 
        responseSchema: consistencySchema,
        temperature: 0.0, 
        seed: 42069
    }
  });

  return JSON.parse(response.text) as ConsistencyResult;
};

export const extractFundamentalsFromImage = async (base64Images: string[]): Promise<string> => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key is missing. Please ensure API_KEY or GEMINI_API_KEY is set in environment variables.");

  const prompt = `
  Extract fundamental stock data from these images (KeyStats).
  Return the data in the following EXACT format:

  === CHECKLIST INVEST (KEYSTATS ONLY) ===

  PROFITABILITY
   Return on Equity (ROE) TTM: [value]
   Return on Assets (ROA) TTM: [value]
   Gross Profit Margin: [value]
   Operating Profit Margin: [value]
   Net Profit Margin: [value]
   EPS (TTM): [value]

  GROWTH
   Revenue (Quarter YoY Growth): [value]
   Revenue (YTD YoY Growth): [value]
   Revenue (Annual YoY Growth): [value]
   Net Income (Quarter YoY Growth): [value]
   Net Income (YTD YoY Growth): [value]
   Net Income (Annual YoY Growth): [value]
   EPS (Quarter YoY Growth): [value]
   EPS (YTD YoY Growth): [value]
   EPS (Annual YoY Growth): [value]

  VALUATION
   Current PER (TTM): [value]
   Current PER (Annualised): [value]
   Price to Book Value (PBV): [value]
   EV to EBITDA (TTM): [value]
   Price to Sales (TTM): [value]
   Price to Cash Flow (TTM): [value]

  BALANCE SHEET
   Total Assets (Quarter): [value]
   Total Liabilities (Quarter): [value]
   Total Debt (Quarter): [value]
   Net Debt (Quarter): [value]
   Debt to Equity Ratio (Quarter): [value]
   Current Ratio (Quarter): [value]
   Quick Ratio (Quarter): [value]

  CASH FLOW
   Cash From Operations (TTM): [value]
   Cash From Investing (TTM): [value]
   Cash From Financing (TTM): [value]
   Capital Expenditure (TTM): [value]
   Free Cash Flow (TTM): [value]

  PER SHARE DATA
   Current EPS (TTM): [value]
   Current EPS (Annualised): [value]
   Revenue Per Share (TTM): [value]
   Cash Per Share (Quarter): [value]
   Book Value Per Share: [value]
   Free Cash Flow Per Share (TTM): [value]

  OTHER
   Market Cap: [value]
   Free Float: [value]

  Use 'N/A' if data is not found.
  `;

  const imageParts = base64Images.map(img => ({
    inlineData: {
      mimeType: "image/png",
      data: img.split(',')[1] || img,
    },
  }));

  const response = await generateWithRetry({
    model: 'gemini-3-flash-preview',
    contents: { parts: [...imageParts, { text: prompt }] },
    config: {
      temperature: 0.0,
    }
  });

  return response.text || "Failed to extract data.";
};
