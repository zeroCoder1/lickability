import React, { useMemo, useState } from "react";

/**
 * Lickable Periodic Table — read-only, prefilled
 * Categories match the screenshot:
 *  - green  = Sure, go for it
 *  - yellow = Maybe not the best idea
 *  - red    = Please don’t do that
 *  - purple = See you on the other side
 *
 * This is for humor only. Do not lick elements in real life.
 */

// ---------------- Periodic layout ----------------
const PERIOD_ROWS = [
  ["H",  null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "He"],
  ["Li", "Be", null, null, null, null, null, null, null, null, null, null, "B",  "C",  "N",  "O",  "F",  "Ne"],
  ["Na", "Mg", null, null, null, null, null, null, null, null, null, null, "Al", "Si", "P",  "S",  "Cl", "Ar"],
  ["K",  "Ca", "Sc", "Ti", "V",  "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr"],
  ["Rb", "Sr", "Y",  "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I",  "Xe"],
  ["Cs", "Ba", "La", "Hf", "Ta", "W",  "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn"],
  ["Fr", "Ra", "Ac", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"],
];

const F_BLOCK_ROWS = [
  // lanthanoids (La shown above as purple placeholder at group 3)
  ["Ce","Pr","Nd","Pm","Sm","Eu","Gd","Tb","Dy","Ho","Er","Tm","Yb","Lu"],
  // actinoids (Ac shown above as purple placeholder at group 3)
  ["Th","Pa","U","Np","Pu","Am","Cm","Bk","Cf","Es","Fm","Md","No","Lr"],
];

const NAMES = {
  H:"Hydrogen", He:"Helium",
  Li:"Lithium", Be:"Beryllium", B:"Boron", C:"Carbon", N:"Nitrogen", O:"Oxygen", F:"Fluorine", Ne:"Neon",
  Na:"Sodium", Mg:"Magnesium", Al:"Aluminium", Si:"Silicon", P:"Phosphorus", S:"Sulfur", Cl:"Chlorine", Ar:"Argon",
  K:"Potassium", Ca:"Calcium", Sc:"Scandium", Ti:"Titanium", V:"Vanadium", Cr:"Chromium", Mn:"Manganese", Fe:"Iron",
  Co:"Cobalt", Ni:"Nickel", Cu:"Copper", Zn:"Zinc", Ga:"Gallium", Ge:"Germanium", As:"Arsenic", Se:"Selenium", Br:"Bromine", Kr:"Krypton",
  Rb:"Rubidium", Sr:"Strontium", Y:"Yttrium", Zr:"Zirconium", Nb:"Niobium", Mo:"Molybdenum", Tc:"Technetium", Ru:"Ruthenium",
  Rh:"Rhodium", Pd:"Palladium", Ag:"Silver", Cd:"Cadmium", In:"Indium", Sn:"Tin", Sb:"Antimony", Te:"Tellurium", I:"Iodine", Xe:"Xenon",
  Cs:"Caesium", Ba:"Barium", La:"Lanthanum", Hf:"Hafnium", Ta:"Tantalum", W:"Tungsten", Re:"Rhenium", Os:"Osmium", Ir:"Iridium",
  Pt:"Platinum", Au:"Gold", Hg:"Mercury", Tl:"Thallium", Pb:"Lead", Bi:"Bismuth", Po:"Polonium", At:"Astatine", Rn:"Radon",
  Fr:"Francium", Ra:"Radium", Ac:"Actinium", Rf:"Rutherfordium", Db:"Dubnium", Sg:"Seaborgium", Bh:"Bohrium", Hs:"Hassium",
  Mt:"Meitnerium", Ds:"Darmstadtium", Rg:"Roentgenium", Cn:"Copernicium", Nh:"Nihonium", Fl:"Flerovium", Mc:"Moscovium",
  Lv:"Livermorium", Ts:"Tennessine", Og:"Oganesson",
  Ce:"Cerium", Pr:"Praseodymium", Nd:"Neodymium", Pm:"Promethium", Sm:"Samarium", Eu:"Europium", Gd:"Gadolinium",
  Tb:"Terbium", Dy:"Dysprosium", Ho:"Holmium", Er:"Erbium", Tm:"Thulium", Yb:"Ytterbium", Lu:"Lutetium",
  Th:"Thorium", Pa:"Protactinium", U:"Uranium", Np:"Neptunium", Pu:"Plutonium", Am:"Americium", Cm:"Curium",
  Bk:"Berkelium", Cf:"Californium", Es:"Einsteinium", Fm:"Fermium", Md:"Mendelevium", No:"Nobelium", Lr:"Lawrencium",
};

// Atomic weights (rounded to 3 decimal places)
const ATOMIC_WEIGHTS = {
  H:1.008, He:4.003, Li:6.941, Be:9.012, B:10.811, C:12.011, N:14.007, O:15.999, F:18.998, Ne:20.180,
  Na:22.990, Mg:24.305, Al:26.982, Si:28.086, P:30.974, S:32.065, Cl:35.453, Ar:39.948,
  K:39.098, Ca:40.078, Sc:44.956, Ti:47.867, V:50.942, Cr:51.996, Mn:54.938, Fe:55.845, Co:58.933, Ni:58.693, Cu:63.546, Zn:65.380,
  Ga:69.723, Ge:72.640, As:74.922, Se:78.960, Br:79.904, Kr:83.798,
  Rb:85.468, Sr:87.620, Y:88.906, Zr:91.224, Nb:92.906, Mo:95.960, Tc:98.000, Ru:101.070, Rh:102.906, Pd:106.420, Ag:107.868, Cd:112.411,
  In:114.818, Sn:118.710, Sb:121.760, Te:127.600, I:126.904, Xe:131.293,
  Cs:132.905, Ba:137.327, La:138.905, Hf:178.490, Ta:180.948, W:183.840, Re:186.207, Os:190.230, Ir:192.217, Pt:195.084, Au:196.967, Hg:200.590,
  Tl:204.383, Pb:207.200, Bi:208.980, Po:209.000, At:210.000, Rn:222.000,
  Fr:223.000, Ra:226.000, Ac:227.000, Rf:267.000, Db:268.000, Sg:271.000, Bh:272.000, Hs:277.000, Mt:276.000, Ds:281.000,
  Rg:280.000, Cn:285.000, Nh:284.000, Fl:289.000, Mc:288.000, Lv:293.000, Ts:292.000, Og:294.000,
  Ce:140.116, Pr:140.908, Nd:144.242, Pm:145.000, Sm:150.360, Eu:151.964, Gd:157.250, Tb:158.925, Dy:162.500, Ho:164.930, Er:167.259, Tm:168.934, Yb:173.054, Lu:174.967,
  Th:232.038, Pa:231.036, U:238.029, Np:237.000, Pu:244.000, Am:243.000, Cm:247.000, Bk:247.000, Cf:251.000, Es:252.000, Fm:257.000, Md:258.000, No:259.000, Lr:262.000,
};

// Discoverers and years
const DISCOVERY_INFO = {
  H:{discoverer:"Henry Cavendish", year:1766}, He:{discoverer:"Pierre Janssen", year:1868},
  Li:{discoverer:"Johan August Arfwedson", year:1817}, Be:{discoverer:"Louis Nicolas Vauquelin", year:1798}, B:{discoverer:"Joseph Louis Gay-Lussac", year:1808}, C:{discoverer:"Ancient times", year:"Prehistoric"}, N:{discoverer:"Daniel Rutherford", year:1772}, O:{discoverer:"Joseph Priestley", year:1774}, F:{discoverer:"André-Marie Ampère", year:1810}, Ne:{discoverer:"William Ramsay", year:1898},
  Na:{discoverer:"Humphry Davy", year:1807}, Mg:{discoverer:"Joseph Black", year:1755}, Al:{discoverer:"Hans Christian Ørsted", year:1825}, Si:{discoverer:"Jöns Jacob Berzelius", year:1824}, P:{discoverer:"Hennig Brand", year:1669}, S:{discoverer:"Ancient times", year:"Prehistoric"}, Cl:{discoverer:"Carl Wilhelm Scheele", year:1774}, Ar:{discoverer:"Lord Rayleigh", year:1894},
  K:{discoverer:"Humphry Davy", year:1807}, Ca:{discoverer:"Humphry Davy", year:1808}, Sc:{discoverer:"Lars Fredrik Nilson", year:1879}, Ti:{discoverer:"William Gregor", year:1791}, V:{discoverer:"Andrés Manuel del Río", year:1801}, Cr:{discoverer:"Louis Nicolas Vauquelin", year:1797}, Mn:{discoverer:"Johan Gottlieb Gahn", year:1774}, Fe:{discoverer:"Ancient times", year:"Prehistoric"}, Co:{discoverer:"Georg Brandt", year:1735}, Ni:{discoverer:"Axel Fredrik Cronstedt", year:1751}, Cu:{discoverer:"Ancient times", year:"Prehistoric"}, Zn:{discoverer:"Andreas Sigismund Marggraf", year:1746},
  Ga:{discoverer:"Paul-Émile Lecoq de Boisbaudran", year:1875}, Ge:{discoverer:"Clemens Winkler", year:1886}, As:{discoverer:"Albertus Magnus", year:1250}, Se:{discoverer:"Jöns Jacob Berzelius", year:1817}, Br:{discoverer:"Antoine Jérôme Balard", year:1826}, Kr:{discoverer:"William Ramsay", year:1898},
  Rb:{discoverer:"Robert Bunsen", year:1861}, Sr:{discoverer:"Adair Crawford", year:1790}, Y:{discoverer:"Johan Gadolin", year:1789}, Zr:{discoverer:"Martin Heinrich Klaproth", year:1789}, Nb:{discoverer:"Charles Hatchett", year:1801}, Mo:{discoverer:"Carl Wilhelm Scheele", year:1778}, Tc:{discoverer:"Emilio Segrè", year:1937}, Ru:{discoverer:"Karl Ernst Claus", year:1844}, Rh:{discoverer:"William Hyde Wollaston", year:1803}, Pd:{discoverer:"William Hyde Wollaston", year:1803}, Ag:{discoverer:"Ancient times", year:"Prehistoric"}, Cd:{discoverer:"Karl Samuel Leberecht Hermann", year:1817},
  In:{discoverer:"Ferdinand Reich", year:1863}, Sn:{discoverer:"Ancient times", year:"Prehistoric"}, Sb:{discoverer:"Ancient times", year:"Prehistoric"}, Te:{discoverer:"Franz-Joseph Müller von Reichenstein", year:1782}, I:{discoverer:"Bernard Courtois", year:1811}, Xe:{discoverer:"William Ramsay", year:1898},
  Cs:{discoverer:"Robert Bunsen", year:1860}, Ba:{discoverer:"Carl Wilhelm Scheele", year:1772}, La:{discoverer:"Carl Gustaf Mosander", year:1839}, Hf:{discoverer:"Dirk Coster", year:1923}, Ta:{discoverer:"Anders Gustaf Ekeberg", year:1802}, W:{discoverer:"Juan José Elhuyar", year:1783}, Re:{discoverer:"Ida Noddack", year:1925}, Os:{discoverer:"Smithson Tennant", year:1803}, Ir:{discoverer:"Smithson Tennant", year:1803}, Pt:{discoverer:"Antonio de Ulloa", year:1735}, Au:{discoverer:"Ancient times", year:"Prehistoric"}, Hg:{discoverer:"Ancient times", year:"Prehistoric"},
  Tl:{discoverer:"William Crookes", year:1861}, Pb:{discoverer:"Ancient times", year:"Prehistoric"}, Bi:{discoverer:"Claude François Geoffroy", year:1753}, Po:{discoverer:"Marie Curie", year:1898}, At:{discoverer:"Dale R. Corson", year:1940}, Rn:{discoverer:"Friedrich Ernst Dorn", year:1900},
  Fr:{discoverer:"Marguerite Perey", year:1939}, Ra:{discoverer:"Marie Curie", year:1898}, Ac:{discoverer:"André-Louis Debierne", year:1899}, Rf:{discoverer:"Soviet scientists", year:1964}, Db:{discoverer:"Soviet scientists", year:1967}, Sg:{discoverer:"Soviet scientists", year:1974}, Bh:{discoverer:"GSI Darmstadt", year:1981}, Hs:{discoverer:"GSI Darmstadt", year:1984}, Mt:{discoverer:"GSI Darmstadt", year:1982}, Ds:{discoverer:"GSI Darmstadt", year:1994},
  Rg:{discoverer:"GSI Darmstadt", year:1994}, Cn:{discoverer:"GSI Darmstadt", year:1996}, Nh:{discoverer:"RIKEN", year:2004}, Fl:{discoverer:"Joint team", year:1999}, Mc:{discoverer:"Joint team", year:2003}, Lv:{discoverer:"Joint team", year:2000}, Ts:{discoverer:"Joint team", year:2010}, Og:{discoverer:"Joint team", year:2002},
  Ce:{discoverer:"Jöns Jacob Berzelius", year:1803}, Pr:{discoverer:"Carl Auer von Welsbach", year:1885}, Nd:{discoverer:"Carl Auer von Welsbach", year:1885}, Pm:{discoverer:"Charles D. Coryell", year:1945}, Sm:{discoverer:"Paul-Émile Lecoq de Boisbaudran", year:1879}, Eu:{discoverer:"Eugène-Anatole Demarçay", year:1901}, Gd:{discoverer:"Jean Charles Galissard de Marignac", year:1880}, Tb:{discoverer:"Carl Gustaf Mosander", year:1843}, Dy:{discoverer:"Paul-Émile Lecoq de Boisbaudran", year:1886}, Ho:{discoverer:"Per Teodor Cleve", year:1879}, Er:{discoverer:"Carl Gustaf Mosander", year:1843}, Tm:{discoverer:"Per Teodor Cleve", year:1879}, Yb:{discoverer:"Jean Charles Galissard de Marignac", year:1878}, Lu:{discoverer:"Carl Auer von Welsbach", year:1907},
  Th:{discoverer:"Jöns Jacob Berzelius", year:1829}, Pa:{discoverer:"Kasimir Fajans", year:1913}, U:{discoverer:"Martin Heinrich Klaproth", year:1789}, Np:{discoverer:"Edwin McMillan", year:1940}, Pu:{discoverer:"Glenn T. Seaborg", year:1940}, Am:{discoverer:"Glenn T. Seaborg", year:1944}, Cm:{discoverer:"Glenn T. Seaborg", year:1944}, Bk:{discoverer:"Glenn T. Seaborg", year:1949}, Cf:{discoverer:"Glenn T. Seaborg", year:1950}, Es:{discoverer:"Albert Ghiorso", year:1952}, Fm:{discoverer:"Albert Ghiorso", year:1952}, Md:{discoverer:"Albert Ghiorso", year:1955}, No:{discoverer:"Albert Ghiorso", year:1957}, Lr:{discoverer:"Albert Ghiorso", year:1961},
};

// atomic numbers from the layout order
function computeAtomicNumbers() {
  const mapping = {};
  let n = 0;
  const push = (sym) => { if (sym) { n += 1; mapping[sym] = n; } };
  for (const r of PERIOD_ROWS) r.forEach(push);
  for (const r of F_BLOCK_ROWS) r.forEach(push);
  return mapping;
}
const Z = computeAtomicNumbers();

// ---------------- Categories (Tailwind classes) ----------------
const CATEGORIES = [
  { id: "ok",    label: "Sure, go for it",             bg: "bg-green-500",  ring: "ring-green-600"  },
  { id: "maybe", label: "Maybe not the best idea",     bg: "bg-amber-500", ring: "ring-amber-600" },
  { id: "no",    label: "Please don't do that",        bg: "bg-red-500",    ring: "ring-red-700"    },
  { id: "rip",   label: "See you on the other side",   bg: "bg-purple-600", ring: "ring-purple-800" },
];

// ---------------- Prefilled map from the screenshot ----------------
// (Green/Yellow/Red/Purple exactly as shown)
const LICK_MAP = {
  // Period 1–3
  H:"ok", He:"ok",
  Li:"maybe", Be:"no", B:"ok", C:"ok", N:"ok", O:"ok", F:"no", Ne:"ok",
  Na:"no", Mg:"ok", Al:"ok", Si:"ok", P:"maybe", S:"ok", Cl:"no", Ar:"ok",
  // Period 4
  K:"no", Ca:"ok", Sc:"ok", Ti:"ok", V:"ok", Cr:"ok", Mn:"ok", Fe:"ok", Co:"ok", Ni:"ok", Cu:"ok", Zn:"ok",
  Ga:"ok", Ge:"ok", As:"no", Se:"maybe", Br:"no", Kr:"ok",
  // Period 5
  Rb:"no", Sr:"no", Y:"ok", Zr:"ok", Nb:"ok", Mo:"ok", Tc:"no", Ru:"ok", Rh:"ok", Pd:"ok", Ag:"ok", Cd:"no",
  In:"ok", Sn:"ok", Sb:"maybe", Te:"maybe", I:"no", Xe:"ok",
  // Period 6 (La purple in main), Os yellow, Hg/Tl red, Pb yellow, Po/At/Rn purple
  Cs:"no", Ba:"no", La:"rip", Hf:"ok", Ta:"ok", W:"ok", Re:"ok", Os:"maybe", Ir:"ok", Pt:"ok", Au:"ok", Hg:"no",
  Tl:"no", Pb:"maybe", Bi:"ok", Po:"rip", At:"rip", Rn:"rip",
  // Period 7 (mostly purple row)
  Fr:"rip", Ra:"rip", Ac:"rip", Rf:"rip", Db:"rip", Sg:"rip", Bh:"rip", Hs:"rip", Mt:"rip", Ds:"rip",
  Rg:"rip", Cn:"rip", Nh:"rip", Fl:"rip", Mc:"rip", Lv:"rip", Ts:"rip", Og:"rip",
  // Lanthanoids row (Pm red; rest green)
  Ce:"ok", Pr:"ok", Nd:"ok", Pm:"no", Sm:"ok", Eu:"ok", Gd:"ok", Tb:"ok", Dy:"ok", Ho:"ok", Er:"ok", Tm:"ok", Yb:"ok", Lu:"ok",
  // Actinoids row (Th/Pa/U yellow; 93+ purple)
  Th:"maybe", Pa:"rip", U:"maybe",
  Np:"rip", Pu:"rip", Am:"rip", Cm:"rip", Bk:"rip", Cf:"rip", Es:"rip", Fm:"rip", Md:"rip", No:"rip", Lr:"rip",
};

// ---------------- Helpers ----------------
const Badge = ({ className = "", children }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>
    {children}
  </span>
);

const Legend = () => (
  <div className="flex flex-wrap gap-2">
    {CATEGORIES.map((c) => (
      <Badge key={c.id} className={`${c.bg} ${c.ring} text-white`}>{c.label}</Badge>
    ))}
  </div>
);

const Tip = ({ text }) => (
  <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100">
    {text}
  </span>
);

// build flat list with coords (for sorting and search)
function useElements() {
  return useMemo(() => {
    const cells = [];
    PERIOD_ROWS.forEach((row, r) =>
      row.forEach((sym, c) => sym && cells.push({ symbol: sym, name: NAMES[sym] || sym, z: Z[sym], r: r + 1, c: c + 1, region: "main" }))
    );
    F_BLOCK_ROWS[0].forEach((sym, i) => cells.push({ symbol: sym, name: NAMES[sym] || sym, z: Z[sym], r: 8, c: i + 4, region: "lan" }));
    F_BLOCK_ROWS[1].forEach((sym, i) => cells.push({ symbol: sym, name: NAMES[sym] || sym, z: Z[sym], r: 9, c: i + 4, region: "act" }));
    return cells.sort((a, b) => a.z - b.z);
  }, []);
}

// ---------------- Main ----------------
export default function LickablePeriodicTable() {
  const elements = useElements();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const selectedEl = elements.find((e) => e.symbol === selected) || null;

  const filtered = elements.filter((e) => {
    const cat = LICK_MAP[e.symbol] || "maybe";
    if (query) {
      const q = query.toLowerCase();
      if (!(`${e.symbol}`.toLowerCase().includes(q) || `${e.name}`.toLowerCase().includes(q))) return false;
    }
    if (filter !== "all" && cat !== filter) return false;
    return true;
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-zinc-50 to-white text-zinc-900 dark:from-zinc-950 dark:to-black dark:text-zinc-100">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <header className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Can I lick it? 🧪👅</h1>
            <p className="mt-1 max-w-prose text-sm text-zinc-600 dark:text-zinc-400">
            </p>
          </div>
          <Legend />
        </header>


        {/* Main grid */}
        <div className="grid grid-cols-18 gap-1 overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-100 p-2 shadow-inner dark:border-zinc-800 dark:bg-zinc-900">
          {PERIOD_ROWS.map((row, rIdx) => (
            <React.Fragment key={rIdx}>
              {row.map((sym, cIdx) => (
                <div key={`${rIdx}-${cIdx}`} className="aspect-square w-12 min-w-12 sm:w-14 sm:min-w-14 lg:w-16 lg:min-w-16">
                  {sym ? (
                    <ElementCell
                      sym={sym}
                      name={NAMES[sym] || sym}
                      z={Z[sym]}
                      cat={CATEGORIES.find((c) => c.id === (LICK_MAP[sym] || "maybe"))}
                      onClick={() => setSelected(sym)}
                    />
                  ) : <div className="h-full w-full" />}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>

        {/* f-block */}
        <div className="mt-3 overflow-x-auto">
          {["Lanthanoid series", "Actinoid series"].map((label, i) => (
            <div key={label} className="mb-4">
              <div className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
              <div className="grid grid-cols-18 gap-1">
                {[...Array(3)].map((_, j) => <div key={j} className="aspect-square w-12 min-w-12 sm:w-14 sm:min-w-14 lg:w-16 lg:min-w-16" />)}
                {F_BLOCK_ROWS[i].map((sym) => (
                  <div key={sym} className="aspect-square w-12 min-w-12 sm:w-14 sm:min-w-14 lg:w-16 lg:min-w-16">
                    <ElementCell
                      sym={sym}
                      name={NAMES[sym] || sym}
                      z={Z[sym]}
                      cat={CATEGORIES.find((c) => c.id === (LICK_MAP[sym] || "maybe"))}
                      onClick={() => setSelected(sym)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info modal (read-only) */}
        {selectedEl && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-4 sm:items-center sm:justify-center" onClick={() => setSelected(null)}>
            <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-lg font-bold dark:bg-zinc-800">{selectedEl.symbol}</div>
                  <div>
                    <div className="text-lg font-semibold">
                      {selectedEl.name} <span className="text-zinc-400">({selectedEl.symbol})</span>
                    </div>
                    <div className="text-xs text-zinc-500">Atomic # {selectedEl.z}</div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-full border border-zinc-300 bg-white px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">Close</button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                {(() => {
                  const c = CATEGORIES.find(x => x.id === (LICK_MAP[selectedEl.symbol] || "maybe"));
                  return <Badge className={`${c.bg} ${c.ring} text-white`}>{c.label}</Badge>;
                })()}
              </div>

              {/* Element properties */}
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Atomic Weight</div>
                    <div className="font-medium">{ATOMIC_WEIGHTS[selectedEl.symbol] || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Discovered</div>
                    <div className="font-medium">{DISCOVERY_INFO[selectedEl.symbol]?.year || 'Unknown'}</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Discoverer</div>
                  <div className="font-medium">{DISCOVERY_INFO[selectedEl.symbol]?.discoverer || 'Unknown'}</div>
                </div>
              </div>

              <p className="mt-4 text-xs text-zinc-600 dark:text-zinc-400">
                Please don't actually lick chemical elements.
              </p>
            </div>
          </div>
        )}

        <footer className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Built for laughs by Supr.design © {new Date().getFullYear()}
        </footer>
      </div>

      {/* 18-col utility */}
      <style>{`.grid-cols-18 { grid-template-columns: repeat(18, theme(spacing.16)); }`}</style>
    </div>
  );
}

// element tile
function ElementCell({ sym, name, z, cat, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex h-full w-full select-none flex-col items-center justify-between rounded-lg ${cat.bg} ${cat.ring} p-1 text-white ring-1 shadow-sm transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50`}
      title={`${name} (${sym}) — ${cat.label}`}
    >
      <Tip text={`#${z} · ${name}`} />
      <span className="text-[8px] sm:text-[10px] opacity-80">{z}</span>
      <span className="text-xs sm:text-sm font-semibold leading-none">{sym}</span>
      <span className="mb-0.5 line-clamp-1 text-[8px] sm:text-[10px] opacity-90">{name}</span>
    </button>
  );
}
