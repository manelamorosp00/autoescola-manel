import { useEffect, useRef, useState } from "react";
import {
  CATS,
  buildExamIds,
  buildExamQuestions,
  reviewChunkIds,
  passThreshold,
} from "../lib/questions";
import {
  PINK,
  CYAN,
  LIME,
  GOLD,
  CARD,
  SURFACE,
  MUTED,
  TEXT_SOFT,
  fmtTime,
  doneExamsSorted,
  computeAvg,
  computeTrend,
  computeStreak,
  countPassed,
  aggregateTopicStats,
  singleExamTopicStats,
  colorForPct,
  barHeight,
  evolutionNote,
} from "../lib/derive";

const LIMIT_SECONDS = 30 * 60; // 30 minuts, com a la DGT

const EMPTY_STATE = {
  hasSeenSplash: false,
  hasOnboarded: false,
  hasSeenTutorial: false,
  avatar: null, // emoji o dataURL de foto
  car: null, // id del cotxe escollit
  examResults: {},
  failedIds: [],
  inProgress: {},
};

const AVATARS = ["🦡", "🦋", "💅", "🖤", "🔥", "👑", "🍒", "🐍", "💎", "🌹"];

const CARS = [
  { id: "supra", name: "Toyota Supra MK4", tag: "Taronja, aleró i soroll", g: "linear-gradient(140deg,#ff7b3d,#ff2d87)" },
  { id: "r34", name: "Nissan Skyline R34", tag: "Blau baioneta", g: "linear-gradient(140deg,#29e7ff,#2d6bff)" },
  { id: "gti", name: "Golf GTI Mk2", tag: "Clàssic de barri", g: "linear-gradient(140deg,#c6ff3d,#12b76a)" },
  { id: "cupra", name: "Seat Ibiza Cupra", tag: "El de tota la vida", g: "linear-gradient(140deg,#ffd166,#ff7b3d)" },
  { id: "e46", name: "BMW E46 M3", tag: "Negre, vidres tintats", g: "linear-gradient(140deg,#8d85ad,#2b2740)" },
  { id: "s3", name: "Audi S3 8L", tag: "Gris nardo, llantes crom", g: "linear-gradient(140deg,#e9e5ff,#7b2dff)" },
];

const REWARDS = [
  { emoji: "🔦", label: "Neons sota el xassís" },
  { emoji: "💿", label: "Llantes cromades" },
  { emoji: "🔊", label: "Equip de so brutal" },
  { emoji: "🏁", label: "Vinils de competició" },
  { emoji: "🪽", label: "Aleró posterior" },
  { emoji: "🔑", label: "Les claus de veritat" },
];

/* Diapositives del tutorial inicial */
const TUTORIAL = [
  {
    emoji: "📋",
    accent: PINK,
    title: "Com és cada examen",
    body: "30 preguntes, 30 minuts i un màxim de 3 errors. Exactament les regles de la DGT.",
    points: [
      "El cronòmetre corre encara que surtis de l'app",
      "Si s'acaba el temps, es corregeix amb el que hi hagi",
      "No sabràs si has encertat fins al final",
    ],
  },
  {
    emoji: "🤔",
    accent: GOLD,
    title: "Si dubtes, marca-ho",
    body: "Toca «Dubtosa» i la pregunta queda senyalada en groc a la barra de dalt.",
    points: [
      "El botó «Anar a les dubtoses» t'hi porta de cop",
      "Pots tocar qualsevol punt de la barra per saltar-hi",
      "Amb «Enrere» pots canviar una resposta anterior",
    ],
  },
  {
    emoji: "⏭️",
    accent: CYAN,
    title: "Pots deixar-ne en blanc",
    body: "Si una pregunta se't resisteix, «Ometre per ara» i segueix. Millor això que encallar-te.",
    points: [
      "Les que deixis en blanc compten com a error",
      "Torna-hi abans de finalitzar si et sobra temps",
      "Pots sortir i continuar més tard on ho vas deixar",
    ],
  },
  {
    emoji: "🥊",
    accent: PINK,
    title: "El que falles, torna",
    body: "Cada pregunta fallada va a parar al repàs de fallades, i no en surt fins que l'encertes.",
    points: [
      "Es fan examens de repàs només amb les teves fallades",
      "Quan l'encertes, desapareix del repàs",
      "A «On flaqueges» veuràs els temes que et costen",
    ],
  },
  {
    emoji: "🏆",
    accent: LIME,
    title: "I guanyes coses",
    body: "Cada examen aprovat puja el teu nivell i desbloqueja una millora per al cotxe.",
    points: [
      "La ratxa 🔥 compta els aprovats seguits",
      "El progrés es desa sol, entris des d'on entris",
      "Pots reiniciar-ho tot des de la configuració",
    ],
  },
];

/* =========================================================
   Estils compartits
   ========================================================= */
const panelStyle = {
  borderRadius: 24,
  background: CARD,
  border: "1px solid rgba(255,255,255,0.08)",
};
const kickerStyle = {
  fontFamily: "Anton, sans-serif",
  fontSize: 14,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: MUTED,
  margin: "28px 0 12px",
};
function Kicker({ children, style }) {
  return <div style={{ ...kickerStyle, ...style }}>{children}</div>;
}

/* =========================================================
   Component arrel
   ========================================================= */
export default function AutoescolaApp() {
  const [state, setState] = useState(null);
  const [saveOk, setSaveOk] = useState(true);
  const [screen, setScreen] = useState({ name: "loading" });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/state");
        const json = await res.json();
        const data = { ...EMPTY_STATE, ...(json.data || {}) };
        setState(data);
        setScreen({
          name: !data.hasSeenSplash
            ? "splash"
            : !data.hasOnboarded
            ? "onboard"
            : !data.hasSeenTutorial
            ? "tutorial"
            : "home",
        });
      } catch (e) {
        console.error(e);
        setState(EMPTY_STATE);
        setScreen({ name: "splash" });
        setSaveOk(false);
      }
    })();
  }, []);

  async function persist(next) {
    setState(next);
    try {
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      setSaveOk(res.ok);
    } catch (e) {
      console.error(e);
      setSaveOk(false);
    }
  }

  if (!state || screen.name === "loading") {
    return (
      <Shell>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, fontSize: 14 }}>
          Carregant…
        </div>
      </Shell>
    );
  }

  if (screen.name === "splash") {
    return (
      <Shell>
        <SplashScreen
          onEnter={async () => {
            await persist({ ...state, hasSeenSplash: true });
            setScreen({
              name: !state.hasOnboarded ? "onboard" : !state.hasSeenTutorial ? "tutorial" : "home",
            });
          }}
        />
      </Shell>
    );
  }

  if (screen.name === "onboard") {
    return (
      <Shell>
        <OnboardScreen
          state={state}
          persist={persist}
          onDone={() =>
            setScreen({ name: state.hasSeenTutorial ? "home" : "tutorial" })
          }
        />
      </Shell>
    );
  }

  if (screen.name === "tutorial") {
    return (
      <Shell>
        <TutorialScreen state={state} persist={persist} onDone={() => setScreen({ name: "home" })} />
      </Shell>
    );
  }

  if (screen.name === "home") {
    return (
      <Shell>
        <HomeScreen
          state={state}
          saveOk={saveOk}
          onStart={(examNum) => setScreen(startExamScreen(examNum))}
          onResume={(key) => setScreen(resumeScreen(state, key))}
          onStartReview={() => {
            const scr = startReviewScreen(state, 0);
            if (scr) setScreen(scr);
          }}
          onOpenSettings={() => setScreen({ name: "settings" })}
        />
      </Shell>
    );
  }

  if (screen.name === "settings") {
    return (
      <Shell>
        <SettingsScreen
          state={state}
          persist={persist}
          onBack={() => setScreen({ name: "home" })}
          onResetDone={() => setScreen({ name: "splash" })}
          onShowTutorial={() => setScreen({ name: "tutorial" })}
        />
      </Shell>
    );
  }

  if (screen.name === "exam") {
    return (
      <Shell>
        <ExamScreen screen={screen} setScreen={setScreen} state={state} persist={persist} />
      </Shell>
    );
  }

  if (screen.name === "result") {
    return (
      <Shell>
        <ResultScreen
          screen={screen}
          state={state}
          onHome={() => setScreen({ name: "home" })}
          onRepeat={() => setScreen(startExamScreen(screen.nextExamNum || screen.examNum))}
        />
      </Shell>
    );
  }

  return null;
}

function Shell({ children }) {
  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#05040a", position: "relative", overflow: "hidden" }}>
      {children}
    </div>
  );
}

/* =========================================================
   Transicions d'examen
   ========================================================= */
function startExamScreen(examNum) {
  const ids = buildExamIds(examNum);
  return {
    name: "exam",
    key: String(examNum),
    examNum,
    ids,
    title: `Examen ${String(examNum).padStart(2, "0")}`,
    exam: buildExamQuestions(ids, examNum),
    qIndex: 0,
    answers: {},
    flags: {},
    startedAt: Date.now(),
    pausedElapsed: 0,
  };
}

function startReviewScreen(state, chunkIndex) {
  const ids = reviewChunkIds(state.failedIds, chunkIndex);
  if (!ids.length) return null;
  return {
    name: "exam",
    key: "review",
    examNum: null,
    ids,
    title: "Repàs de fallades",
    exam: buildExamQuestions(ids, 9000 + chunkIndex),
    qIndex: 0,
    answers: {},
    flags: {},
    startedAt: Date.now(),
    pausedElapsed: 0,
  };
}

function resumeScreen(state, key) {
  const saved = state.inProgress[key];
  return {
    name: "exam",
    key,
    examNum: saved.examNum,
    ids: saved.ids,
    title: saved.title,
    exam: buildExamQuestions(saved.ids, key === "review" ? 9000 : saved.examNum),
    qIndex: saved.qIndex || 0,
    answers: saved.answers || {},
    flags: saved.flags || {},
    startedAt: Date.now(),
    pausedElapsed: saved.elapsedSeconds || 0,
  };
}

/* =========================================================
   1 · SPLASH
   ========================================================= */
function SplashScreen({ onEnter }) {
  return (
    <div style={{ position: "relative", minHeight: "100vh", padding: "0 24px", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 28, background: "radial-gradient(120% 80% at 15% 0%,#3b0d4d 0%,#0a0616 55%,#05040a 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -90, right: -70, width: 280, height: 280, borderRadius: 99, background: "radial-gradient(circle,#ff2d87 0%,rgba(255,45,135,0) 70%)", filter: "blur(10px)", animation: "glowPulse 4s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: 180, left: -90, width: 240, height: 240, borderRadius: 99, background: "radial-gradient(circle,#29e7ff 0%,rgba(41,231,255,0) 70%)", filter: "blur(12px)", animation: "glowPulse 5.5s ease-in-out infinite" }} />

      <div style={{ position: "relative", paddingBottom: 8, animation: "floatUp .6s ease both" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid rgba(255,255,255,0.16)", borderRadius: 99, padding: "7px 13px", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#c9c2e8" }}>
          Autoescola Manel · Teòric B
        </div>
        <div style={{ fontFamily: "Anton, sans-serif", fontSize: 74, lineHeight: 0.86, letterSpacing: "-0.02em", textTransform: "uppercase", marginTop: 20, background: "linear-gradient(100deg,#ffffff 0%,#ff2d87 38%,#29e7ff 68%,#ffffff 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", animation: "shine 6s linear infinite" }}>
          Ares
          <br />
          al
          <br />
          volant
        </div>
        <div style={{ fontSize: 16.5, lineHeight: 1.45, color: "#b8b0d8", marginTop: 20, maxWidth: 330 }}>
          Vas dir que estaves preparada. 30 preguntes, 30 minuts, 3 errors i fora. Sense pistes, sense ajudes, sense excuses.
        </div>
      </div>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 11, paddingBottom: 34, animation: "floatUp .6s .12s ease both" }}>
        <div onClick={onEnter} style={{ background: "linear-gradient(95deg,#ff2d87,#ff7b3d)", color: "#0b0212", borderRadius: 20, padding: 20, textAlign: "center", fontFamily: "Anton, sans-serif", fontSize: 21, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 14px 40px rgba(255,45,135,0.38)" }}>
          Arrenquem
        </div>
        <div style={{ textAlign: "center", fontSize: 12.5, color: MUTED }}>Fet per a tu, amb paciència infinita 🖤</div>
      </div>
    </div>
  );
}

/* =========================================================
   2 · ONBOARDING (cara + cotxe)
   ========================================================= */
function OnboardScreen({ state, persist, onDone }) {
  const [avatar, setAvatar] = useState(state.avatar || null);
  const [car, setCar] = useState(state.car || null);
  const [busy, setBusy] = useState(false);
  const ready = !!avatar && !!car;

  async function finish() {
    if (!ready || busy) return;
    setBusy(true);
    await persist({ ...state, avatar, car, hasOnboarded: true });
    setBusy(false);
    onDone();
  }

  return (
    <div style={{ minHeight: "100vh", padding: "30px 22px 130px", background: "radial-gradient(110% 60% at 90% 0%,#1b0b3a 0%,#05040a 70%)", animation: "popIn .3s ease both" }}>
      <div style={{ fontFamily: "Anton, sans-serif", fontSize: 34, lineHeight: 0.95, letterSpacing: "-0.01em", textTransform: "uppercase", color: "#fff" }}>
        Abans d&apos;
        <br />
        arrencar
      </div>
      <div style={{ fontSize: 14.5, color: TEXT_SOFT, marginTop: 10 }}>
        Tria la teva cara i el teu cotxe. Sortiran al teu perfil i a cada examen que aprovis.
      </div>

      <Kicker style={{ color: PINK }}>1 · La teva cara</Kicker>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 9 }}>
        {AVATARS.map((emoji) => {
          const on = avatar === emoji;
          return (
            <div
              key={emoji}
              onClick={() => setAvatar(emoji)}
              style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, borderRadius: 16, cursor: "pointer", transition: "all .16s ease", background: on ? "linear-gradient(140deg,#ff2d87,#7b2dff)" : SURFACE, border: `1px solid ${on ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.09)"}`, transform: on ? "scale(1.06)" : "none", boxShadow: on ? "0 8px 22px rgba(255,45,135,0.4)" : "none" }}
            >
              {emoji}
            </div>
          );
        })}
      </div>

      <Kicker style={{ color: CYAN }}>2 · El teu cotxe</Kicker>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {CARS.map((c) => {
          const on = car === c.id;
          return (
            <div
              key={c.id}
              onClick={() => setCar(c.id)}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, borderRadius: 20, cursor: "pointer", transition: "all .16s ease", background: on ? "rgba(41,231,255,0.09)" : CARD, border: `1px solid ${on ? "rgba(41,231,255,0.55)" : "rgba(255,255,255,0.08)"}`, boxShadow: on ? "0 10px 28px rgba(41,231,255,0.16)" : "none" }}
            >
              <div style={{ flex: "0 0 52px", height: 40, borderRadius: 13, background: c.g }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "Anton, sans-serif", fontSize: 19, letterSpacing: "0.01em", textTransform: "uppercase", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {c.name}
                </div>
                <div style={{ fontSize: 12.5, color: TEXT_SOFT, marginTop: 2 }}>{c.tag}</div>
              </div>
              <div style={{ flex: "0 0 26px", height: 26, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: on ? "#05040a" : "transparent", background: on ? CYAN : "rgba(255,255,255,0.06)" }}>
                ✓
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ width: "100%", maxWidth: 430, padding: "18px 22px 26px", background: "linear-gradient(180deg,rgba(5,4,10,0) 0%,#05040a 45%)", pointerEvents: "auto" }}>
          <div
            onClick={finish}
            style={{ borderRadius: 20, padding: 20, textAlign: "center", fontFamily: "Anton, sans-serif", fontSize: 20, letterSpacing: "0.06em", textTransform: "uppercase", cursor: ready ? "pointer" : "default", transition: "all .2s ease", background: ready ? "linear-gradient(95deg,#ff2d87,#ff7b3d)" : SURFACE, color: ready ? "#0b0212" : MUTED, border: `1px solid ${ready ? "transparent" : "rgba(255,255,255,0.1)"}`, boxShadow: ready ? "0 14px 36px rgba(255,45,135,0.34)" : "none" }}
          >
            {ready ? "Llesta, al lio" : "Tria cara i cotxe"}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   3 · TUTORIAL (següent, següent, preparada)
   ========================================================= */
function TutorialScreen({ state, persist, onDone }) {
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const step = TUTORIAL[i];
  const isLast = i === TUTORIAL.length - 1;

  async function finish() {
    if (busy) return;
    setBusy(true);
    await persist({ ...state, hasSeenTutorial: true });
    setBusy(false);
    onDone();
  }

  return (
    <div style={{ minHeight: "100vh", padding: "26px 22px 150px", background: "radial-gradient(110% 55% at 15% 0%,#1b0b3a 0%,#05040a 70%)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED }}>
          Com funciona · {i + 1} de {TUTORIAL.length}
        </div>
        {!isLast && (
          <div onClick={finish} style={{ fontSize: 12.5, fontWeight: 600, color: MUTED, cursor: "pointer", padding: "6px 4px" }}>
            Ometre
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 5, marginTop: 14 }}>
        {TUTORIAL.map((s, n) => (
          <div
            key={n}
            onClick={() => setI(n)}
            style={{ flex: 1, height: n === i ? 7 : 4, alignSelf: "center", borderRadius: 99, cursor: "pointer", transition: "all .2s ease", background: n === i ? step.accent : n < i ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.12)", boxShadow: n === i ? `0 0 12px ${step.accent}` : "none" }}
          />
        ))}
      </div>

      <div key={i} style={{ animation: "popIn .28s ease both", marginTop: 34 }}>
        <div style={{ width: 82, height: 82, borderRadius: 26, background: `${step.accent}1f`, border: `1px solid ${step.accent}59`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, boxShadow: `0 12px 34px ${step.accent}2e` }}>
          {step.emoji}
        </div>

        <div style={{ fontFamily: "Anton, sans-serif", fontSize: 38, lineHeight: 0.98, letterSpacing: "-0.01em", textTransform: "uppercase", color: "#fff", marginTop: 22 }}>
          {step.title}
        </div>
        <div style={{ fontSize: 15.5, lineHeight: 1.5, color: "#b8b0d8", marginTop: 12 }}>{step.body}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
          {step.points.map((p, n) => (
            <div key={n} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: CARD, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "14px 15px" }}>
              <div style={{ flex: "0 0 20px", height: 20, borderRadius: 99, background: `${step.accent}26`, color: step.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, marginTop: 1 }}>
                {n + 1}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.4, color: "#d9d4f0" }}>{p}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ width: "100%", maxWidth: 430, padding: "18px 22px 26px", background: "linear-gradient(180deg,rgba(5,4,10,0) 0%,#05040a 45%)", pointerEvents: "auto", display: "flex", gap: 10 }}>
          {i > 0 && (
            <div
              onClick={() => setI(i - 1)}
              style={{ flex: "0 0 auto", padding: "19px 22px", background: SURFACE, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 19, fontFamily: "Anton, sans-serif", fontSize: 16, letterSpacing: "0.05em", textTransform: "uppercase", color: TEXT_SOFT, cursor: "pointer" }}
            >
              Enrere
            </div>
          )}
          <div
            onClick={() => (isLast ? finish() : setI(i + 1))}
            style={{ flex: 1, borderRadius: 19, padding: 19, textAlign: "center", fontFamily: "Anton, sans-serif", fontSize: 19, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", background: isLast ? "linear-gradient(95deg,#c6ff3d,#12b76a)" : "linear-gradient(95deg,#ff2d87,#ff7b3d)", color: "#0b0212", boxShadow: isLast ? "0 14px 36px rgba(198,255,61,0.3)" : "0 14px 36px rgba(255,45,135,0.32)" }}
          >
            {isLast ? "Preparada 🏁" : "Següent"}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Avatar reutilitzable (emoji o foto)
   ========================================================= */
function AvatarBadge({ avatar, size = 52, radius = 18, fontSize }) {
  const isPhoto = typeof avatar === "string" && avatar.startsWith("data:");
  if (isPhoto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatar} alt="Perfil" style={{ flex: `0 0 ${size}px`, width: size, height: size, borderRadius: radius, objectFit: "cover", border: "1px solid rgba(255,255,255,0.18)", display: "block" }} />
    );
  }
  return (
    <div style={{ flex: `0 0 ${size}px`, height: size, borderRadius: radius, background: "linear-gradient(140deg,#ff2d87,#7b2dff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: fontSize || size * 0.5, boxShadow: "0 8px 24px rgba(255,45,135,0.3)" }}>
      {avatar || "🦡"}
    </div>
  );
}

/* =========================================================
   3 · HOME
   ========================================================= */
function HomeScreen({ state, saveOk, onStart, onResume, onStartReview, onOpenSettings }) {
  const TOTAL_EXAMS = 10;
  const QTOTAL = 30;
  const examResults = state.examResults || {};
  const failedIds = state.failedIds || [];
  const inProgress = state.inProgress || {};

  const done = doneExamsSorted(examResults);
  const avg = computeAvg(examResults);
  const trend = computeTrend(examResults);
  const streak = computeStreak(examResults);
  const passedCount = countPassed(examResults);
  const failedCount = failedIds.length;
  const weakTopics = aggregateTopicStats(examResults, { minAnswered: 3, limit: 4 });
  const reviewInProgress = inProgress["review"];
  const car = CARS.find((c) => c.id === state.car);

  // Primer examen que encara no s'ha fet ni començat → "Et toca"
  let nextExam = null;
  for (let n = 1; n <= TOTAL_EXAMS; n++) {
    if (!examResults[n] && !inProgress[String(n)]) {
      nextExam = n;
      break;
    }
  }

  const up = trend !== null && trend >= 0;

  return (
    <div style={{ padding: "24px 18px 44px", background: "radial-gradient(90% 40% at 100% 0%,#1b0b3a 0%,#05040a 60%)", animation: "popIn .3s ease both" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 22 }}>
        <AvatarBadge avatar={state.avatar} size={52} radius={18} fontSize={26} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "Anton, sans-serif", fontSize: 24, lineHeight: 1, letterSpacing: "0.01em", textTransform: "uppercase", color: "#fff" }}>Ares</div>
          <div style={{ fontSize: 12.5, color: "#8d85ad", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {car ? car.name : "Sense cotxe encara"} · nivell {passedCount + 1}
          </div>
        </div>
        {streak > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, border: "1px solid rgba(255,209,102,0.35)", background: "rgba(255,209,102,0.1)", borderRadius: 99, padding: "8px 12px", fontFamily: "Anton, sans-serif", fontSize: 14, letterSpacing: "0.06em", color: GOLD }}>
            🔥 {streak}
          </div>
        )}
        <div
          onClick={onOpenSettings}
          title="Configuració"
          style={{ flex: "0 0 40px", height: 40, borderRadius: 14, background: SURFACE, border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 17, color: TEXT_SOFT }}
        >
          ⚙
        </div>
      </div>

      {avg === null ? (
        <div style={{ position: "relative", borderRadius: 26, padding: 24, background: "linear-gradient(150deg,rgba(255,45,135,0.14),rgba(41,231,255,0.08))", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
          <div style={{ fontSize: 34 }}>🏁</div>
          <div style={{ fontFamily: "Anton, sans-serif", fontSize: 24, textTransform: "uppercase", color: "#fff", marginTop: 10 }}>
            Encara no has fet cap examen
          </div>
          <div style={{ fontSize: 13.5, color: TEXT_SOFT, marginTop: 8, lineHeight: 1.45 }}>
            Comença el primer i aquí veuràs la teva nota mitjana, la ratxa i on flaqueges.
          </div>
        </div>
      ) : (
        <div style={{ position: "relative", borderRadius: 26, padding: 20, background: "linear-gradient(150deg,rgba(255,45,135,0.14),rgba(41,231,255,0.08))", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: TEXT_SOFT }}>Nota mitjana</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
                <div style={{ fontFamily: "Anton, sans-serif", fontSize: 52, lineHeight: 0.82, letterSpacing: "-0.02em", color: "#fff" }}>{avg}</div>
                <div style={{ fontSize: 15, color: "#8d85ad", fontWeight: 600 }}>/ {QTOTAL}</div>
              </div>
            </div>
            {trend !== null && (
              <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 5, borderRadius: 99, padding: "8px 12px", fontFamily: "Anton, sans-serif", fontSize: 13, letterSpacing: "0.04em", background: up ? "rgba(198,255,61,0.12)" : "rgba(255,45,135,0.14)", border: `1px solid ${up ? "rgba(198,255,61,0.35)" : "rgba(255,45,135,0.35)"}`, color: up ? LIME : PINK }}>
                {up ? `▲ +${trend}` : `▼ ${trend}`} vs. anterior
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80, marginTop: 20 }}>
            {done.map((r) => (
              <div key={r.num} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, justifyContent: "flex-end", height: "100%" }}>
                <div style={{ width: "100%", height: barHeight(r.score, QTOTAL, 54), borderRadius: 6, background: r.pass ? "linear-gradient(180deg,#c6ff3d,#12b76a)" : "linear-gradient(180deg,#ff2d87,#7b2dff)", transition: "height .45s ease" }} />
                <div style={{ fontSize: 10, color: MUTED, fontWeight: 600 }}>{String(r.num).padStart(2, "0")}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.09)" }}>
            <StatCell value={`${passedCount}/${TOTAL_EXAMS}`} label="Aprovats" color={LIME} />
            <StatCell value={`${done.length}/${TOTAL_EXAMS}`} label="Fets" color="#fff" />
            <StatCell value={String(failedCount)} label="En repàs" color={PINK} />
          </div>
        </div>
      )}

      {weakTopics.length > 0 && (
        <>
          <Kicker>On flaqueges</Kicker>
          <div style={{ ...panelStyle, padding: "6px 18px 14px" }}>
            {weakTopics.map((t) => (
              <TopicRow key={t.name} t={t} />
            ))}
          </div>
        </>
      )}

      <Kicker>Examens</Kicker>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
        {Array.from({ length: TOTAL_EXAMS }, (_, i) => i + 1).map((n) => {
          const r = examResults[n];
          const prog = inProgress[String(n)];
          let st = "pending";
          if (prog) st = "progress";
          else if (r && r.done) st = r.pass ? "pass" : "fail";
          else if (n === nextExam) st = "next";

          const color = st === "pass" ? LIME : st === "fail" ? PINK : st === "progress" ? GOLD : st === "next" ? CYAN : "#3a3455";
          const label =
            st === "pass"
              ? `Aprovat · ${r.score}/${QTOTAL}`
              : st === "fail"
              ? `Suspès · ${r.score}/${QTOTAL}`
              : st === "progress"
              ? `Anaves per la ${prog.qIndex + 1}`
              : st === "next"
              ? "Et toca"
              : "Pendent";
          const icon = st === "pass" ? "✓" : st === "fail" ? "✕" : st === "progress" ? "⏱" : "";

          return (
            <div
              key={n}
              onClick={() => (prog ? onResume(String(n)) : onStart(n))}
              style={{ position: "relative", background: st === "next" ? "rgba(41,231,255,0.08)" : CARD, border: `1px solid ${st === "next" ? "rgba(41,231,255,0.45)" : "rgba(255,255,255,0.08)"}`, borderRadius: 22, padding: 16, cursor: "pointer", transition: "transform .12s ease" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "Anton, sans-serif", fontSize: 30, lineHeight: 0.9, letterSpacing: "-0.01em", color: "#fff" }}>
                  {String(n).padStart(2, "0")}
                </div>
                <div style={{ width: 24, height: 24, borderRadius: 99, background: st === "pending" ? "rgba(255,255,255,0.06)" : color, color: "#05040a", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: st === "pending" ? "none" : `0 0 14px ${color}70` }}>
                  {icon}
                </div>
              </div>
              <div style={{ fontSize: 10.5, color: MUTED, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 12 }}>Examen</div>
              <div style={{ fontFamily: "Anton, sans-serif", fontSize: 14, letterSpacing: "0.03em", marginTop: 3, color: st === "pending" ? MUTED : color }}>{label}</div>
            </div>
          );
        })}
      </div>

      <div
        onClick={() => (reviewInProgress ? onResume("review") : failedCount > 0 ? onStartReview() : null)}
        style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 13, background: "linear-gradient(100deg,rgba(255,45,135,0.16),rgba(255,123,61,0.08))", border: "1px solid rgba(255,45,135,0.3)", borderRadius: 22, padding: 18, cursor: reviewInProgress || failedCount > 0 ? "pointer" : "default", opacity: reviewInProgress || failedCount > 0 ? 1 : 0.55 }}
      >
        <div style={{ flex: "0 0 44px", height: 44, borderRadius: 15, background: "linear-gradient(140deg,#ff2d87,#ff7b3d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
          🥊
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Anton, sans-serif", fontSize: 18, letterSpacing: "0.02em", textTransform: "uppercase", color: "#fff" }}>
            {reviewInProgress ? "Repàs en curs" : "Repàs de fallades"}
          </div>
          <div style={{ fontSize: 12.5, color: "#c6a8c8", marginTop: 2 }}>
            {reviewInProgress
              ? `Anaves per la ${reviewInProgress.qIndex + 1} de ${reviewInProgress.ids.length}`
              : failedCount > 0
              ? `${failedCount} preguntes que encara et poden`
              : "Encara no tens cap pregunta fallada"}
          </div>
        </div>
        {(reviewInProgress || failedCount > 0) && <div style={{ fontSize: 18, color: PINK }}>›</div>}
      </div>

      <div style={{ textAlign: "center", fontSize: 11.5, color: saveOk ? "#4e4870" : PINK, marginTop: 26 }}>
        {saveOk ? "El teu progrés es desa sol." : "Avís: no s'ha pogut desar el progrés. Comprova la connexió."}
      </div>
    </div>
  );
}

function StatCell({ value, label, color }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: "Anton, sans-serif", fontSize: 22, color }}>{value}</div>
      <div style={{ fontSize: 11, color: "#8d85ad", fontWeight: 600, letterSpacing: "0.04em" }}>{label}</div>
    </div>
  );
}

function TopicRow({ t }) {
  return (
    <div style={{ padding: "13px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 9 }}>
        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25, color: "#e9e5ff" }}>{t.name}</div>
        <div style={{ flex: "0 0 auto", fontFamily: "Anton, sans-serif", fontSize: 16, letterSpacing: "0.02em", color: t.color }}>{t.pct}%</div>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
        <div style={{ width: `${t.pct}%`, height: "100%", borderRadius: 99, background: t.color, boxShadow: `0 0 12px ${t.color}80`, transition: "width .5s ease" }} />
      </div>
    </div>
  );
}

/* =========================================================
   4 · CONFIGURACIÓ
   ========================================================= */
function fileToAvatarDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No s'ha pogut llegir el fitxer"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("El fitxer no sembla una imatge"));
      img.onload = () => {
        const S = 256;
        const canvas = document.createElement("canvas");
        canvas.width = S;
        canvas.height = S;
        const ctx = canvas.getContext("2d");
        const min = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, S, S);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function SettingsScreen({ state, persist, onBack, onResetDone, onShowTutorial }) {
  const fileRef = useRef(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const doneCount = doneExamsSorted(state.examResults).length;
  const failedCount = (state.failedIds || []).length;
  const inProgressCount = Object.keys(state.inProgress || {}).length;

  async function onPickFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      await persist({ ...state, avatar: dataUrl });
      setMsg({ ok: true, text: "Foto de perfil actualitzada." });
    } catch (err) {
      console.error(err);
      setMsg({ ok: false, text: "No s'ha pogut carregar la imatge." });
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onReset() {
    setBusy(true);
    // Torna a l'estat inicial de tot: benvinguda i tria de cara/cotxe incloses.
    // La cara i el cotxe actuals es mantenen com a preselecció a l'onboarding.
    await persist({
      ...EMPTY_STATE,
      avatar: state.avatar,
      car: state.car,
    });
    setBusy(false);
    setConfirming(false);
    onResetDone();
  }

  return (
    <div style={{ minHeight: "100vh", padding: "24px 18px 44px", background: "radial-gradient(90% 40% at 0% 0%,#1b0b3a 0%,#05040a 60%)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 13, background: SURFACE, border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: TEXT_SOFT, fontSize: 17 }}>
          ‹
        </div>
        <div style={{ fontFamily: "Anton, sans-serif", fontSize: 28, letterSpacing: "0.02em", textTransform: "uppercase", color: "#fff" }}>Configuració</div>
      </div>

      <Kicker>El teu perfil</Kicker>
      <div style={{ ...panelStyle, padding: 18, display: "flex", alignItems: "center", gap: 16 }}>
        <AvatarBadge avatar={state.avatar} size={70} radius={22} fontSize={34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "Anton, sans-serif", fontSize: 22, textTransform: "uppercase", color: "#fff" }}>Ares</div>
          <div style={{ fontSize: 12.5, color: TEXT_SOFT, marginTop: 2 }}>
            {(CARS.find((c) => c.id === state.car) || {}).name || "Sense cotxe"}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 9, marginTop: 12 }}>
        {AVATARS.map((emoji) => {
          const on = state.avatar === emoji;
          return (
            <div
              key={emoji}
              onClick={() => !busy && persist({ ...state, avatar: emoji })}
              style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, borderRadius: 15, cursor: "pointer", transition: "all .16s ease", background: on ? "linear-gradient(140deg,#ff2d87,#7b2dff)" : SURFACE, border: `1px solid ${on ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.09)"}`, transform: on ? "scale(1.06)" : "none" }}
            >
              {emoji}
            </div>
          );
        })}
      </div>
      <div
        onClick={() => !busy && fileRef.current && fileRef.current.click()}
        style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, borderRadius: 16, background: SURFACE, border: "1px solid rgba(41,231,255,0.35)", color: CYAN, fontFamily: "Anton, sans-serif", fontSize: 15, letterSpacing: "0.05em", textTransform: "uppercase", cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}
      >
        📷 {typeof state.avatar === "string" && state.avatar.startsWith("data:") ? "Canviar la foto" : "Fer servir una foto teva"}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} style={{ display: "none" }} />

      <Kicker>El teu cotxe</Kicker>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {CARS.map((c) => {
          const on = state.car === c.id;
          return (
            <div
              key={c.id}
              onClick={() => !busy && persist({ ...state, car: c.id })}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: 13, borderRadius: 18, cursor: "pointer", background: on ? "rgba(41,231,255,0.09)" : CARD, border: `1px solid ${on ? "rgba(41,231,255,0.55)" : "rgba(255,255,255,0.08)"}` }}
            >
              <div style={{ flex: "0 0 44px", height: 34, borderRadius: 11, background: c.g }} />
              <div style={{ flex: 1, minWidth: 0, fontFamily: "Anton, sans-serif", fontSize: 17, textTransform: "uppercase", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {c.name}
              </div>
              <div style={{ flex: "0 0 24px", height: 24, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: on ? "#05040a" : "transparent", background: on ? CYAN : "rgba(255,255,255,0.06)" }}>
                ✓
              </div>
            </div>
          );
        })}
      </div>

      <Kicker>El teu progrés</Kicker>
      <div style={{ ...panelStyle, padding: "4px 18px 10px" }}>
        <SettingRow label="Examens finalitzats" value={String(doneCount)} />
        <SettingRow label="Començats sense acabar" value={String(inProgressCount)} />
        <SettingRow label="Preguntes al repàs" value={String(failedCount)} last />
      </div>

      <div
        onClick={() => !busy && onShowTutorial()}
        style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12, background: CARD, border: "1px solid rgba(41,231,255,0.3)", borderRadius: 20, padding: 16, cursor: "pointer" }}
      >
        <div style={{ flex: "0 0 40px", height: 40, borderRadius: 14, background: "rgba(41,231,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>
          💡
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Anton, sans-serif", fontSize: 17, textTransform: "uppercase", color: "#fff" }}>Com funciona</div>
          <div style={{ fontSize: 12.5, color: TEXT_SOFT, marginTop: 2 }}>Torna a veure el tutorial</div>
        </div>
        <div style={{ fontSize: 18, color: CYAN }}>›</div>
      </div>

      <Kicker style={{ color: PINK }}>Zona perillosa</Kicker>
      {!confirming ? (
        <div
          onClick={() => !busy && setConfirming(true)}
          style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,45,135,0.08)", border: "1px solid rgba(255,45,135,0.35)", borderRadius: 22, padding: 18, cursor: "pointer" }}
        >
          <div style={{ flex: "0 0 44px", height: 44, borderRadius: 15, background: "rgba(255,45,135,0.16)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            🗑️
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "Anton, sans-serif", fontSize: 18, textTransform: "uppercase", color: PINK }}>Reiniciar el progrés</div>
            <div style={{ fontSize: 12.5, color: TEXT_SOFT, marginTop: 2 }}>Esborra notes, estadístiques i fallades</div>
          </div>
          <div style={{ fontSize: 18, color: PINK }}>›</div>
        </div>
      ) : (
        <div style={{ background: CARD, border: "1px solid rgba(255,45,135,0.4)", borderRadius: 22, padding: 18 }}>
          <div style={{ fontSize: 13.5, lineHeight: 1.45, color: "#ffbfd8" }}>
            S&apos;esborraran <b>tots</b> els resultats, les estadístiques i el repàs de fallades, i tornaràs a la pantalla inicial per començar de zero. No es pot desfer. La cara i el cotxe que tens ara quedaran preseleccionats.
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <div
              onClick={() => !busy && setConfirming(false)}
              style={{ flex: 1, padding: 15, minHeight: 48, borderRadius: 16, textAlign: "center", background: SURFACE, border: "1px solid rgba(255,255,255,0.1)", color: TEXT_SOFT, fontFamily: "Anton, sans-serif", fontSize: 15, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer" }}
            >
              Cancel·lar
            </div>
            <div
              onClick={() => !busy && onReset()}
              style={{ flex: 1, padding: 15, minHeight: 48, borderRadius: 16, textAlign: "center", background: "linear-gradient(95deg,#ff2d87,#ff7b3d)", color: "#0b0212", fontFamily: "Anton, sans-serif", fontSize: 15, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", opacity: busy ? 0.6 : 1 }}
            >
              {busy ? "Esborrant…" : "Esborra-ho tot"}
            </div>
          </div>
        </div>
      )}

      {msg && (
        <div style={{ marginTop: 14, padding: "13px 15px", borderRadius: 15, fontSize: 13, background: msg.ok ? "rgba(198,255,61,0.1)" : "rgba(255,45,135,0.12)", border: `1px solid ${msg.ok ? "rgba(198,255,61,0.3)" : "rgba(255,45,135,0.3)"}`, color: msg.ok ? "#ddf7a5" : "#ffbfd8" }}>
          {msg.text}
        </div>
      )}
    </div>
  );
}

function SettingRow({ label, value, last }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: 14, color: "#c9c2e8" }}>{label}</div>
      <div style={{ fontFamily: "Anton, sans-serif", fontSize: 18, color: "#fff" }}>{value}</div>
    </div>
  );
}

/* =========================================================
   5 · EXAMEN
   ========================================================= */
function ExamScreen({ screen, setScreen, state, persist }) {
  const [, forceTick] = useState(0);
  const finishedRef = useRef(false);

  useEffect(() => {
    finishedRef.current = false;
    const id = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [screen.key, screen.startedAt]);

  const elapsedSeconds = Math.min(
    LIMIT_SECONDS,
    screen.pausedElapsed + Math.floor((Date.now() - screen.startedAt) / 1000)
  );
  const secondsLeft = Math.max(0, LIMIT_SECONDS - elapsedSeconds);
  const low = secondsLeft < 300;

  useEffect(() => {
    if (secondsLeft === 0 && !finishedRef.current) {
      finishedRef.current = true;
      finishExam(screen, state, persist, setScreen, elapsedSeconds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const total = screen.exam.length;
  const item = screen.exam[screen.qIndex];
  const answered = screen.answers[screen.qIndex] !== undefined;
  const isLast = screen.qIndex === total - 1;
  const flagCount = Object.values(screen.flags).filter(Boolean).length;
  const isFlagged = !!screen.flags[screen.qIndex];

  const update = (patch) => setScreen({ ...screen, ...patch });

  async function onQuit() {
    const next = { ...state, inProgress: { ...state.inProgress } };
    next.inProgress[screen.key] = {
      examNum: screen.examNum,
      ids: screen.ids,
      title: screen.title,
      qIndex: screen.qIndex,
      answers: screen.answers,
      flags: screen.flags,
      elapsedSeconds,
    };
    await persist(next);
    setScreen({ name: "home" });
  }

  function onNext() {
    if (isLast) {
      finishedRef.current = true;
      finishExam(screen, state, persist, setScreen, elapsedSeconds);
    } else {
      update({ qIndex: screen.qIndex + 1 });
    }
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 200, background: "#05040a" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 5, background: "rgba(5,4,10,0.9)", backdropFilter: "blur(14px)", padding: "16px 18px 13px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div onClick={onQuit} title="Sortir i continuar més tard" style={{ width: 36, height: 36, borderRadius: 13, background: SURFACE, border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: TEXT_SOFT, fontSize: 17 }}>
            ‹
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "Anton, sans-serif", fontSize: 17, letterSpacing: "0.05em", textTransform: "uppercase", color: "#fff" }}>{screen.title}</div>
            <div style={{ fontSize: 11.5, color: MUTED, fontWeight: 600 }}>Pregunta {screen.qIndex + 1} de {total}</div>
          </div>
          <div style={{ padding: "9px 13px", borderRadius: 99, fontFamily: "Anton, sans-serif", fontSize: 16, letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums", background: low ? "rgba(255,45,135,0.16)" : SURFACE, border: `1px solid ${low ? "rgba(255,45,135,0.5)" : "rgba(255,255,255,0.1)"}`, color: low ? "#ff6aa8" : "#e9e5ff", animation: low ? "glowPulse 1.4s ease-in-out infinite" : "none" }}>
            {fmtTime(secondsLeft)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 3, marginTop: 14 }}>
          {screen.exam.map((_, i) => {
            const cur = i === screen.qIndex;
            const ans = screen.answers[i] !== undefined;
            const fl = screen.flags[i];
            const color = cur ? PINK : fl ? GOLD : ans ? "#7b2dff" : "rgba(255,255,255,0.12)";
            return (
              <div
                key={i}
                onClick={() => update({ qIndex: i })}
                style={{ flex: 1, height: cur ? 8 : 5, alignSelf: "center", borderRadius: 99, cursor: "pointer", transition: "all .18s ease", background: color, boxShadow: cur ? `0 0 12px ${PINK}` : "none" }}
              />
            );
          })}
        </div>
      </div>

      <div style={{ padding: "20px 18px 0", animation: "popIn .24s ease both" }} key={"q" + screen.qIndex}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "inline-block", background: "rgba(41,231,255,0.12)", border: "1px solid rgba(41,231,255,0.3)", color: CYAN, borderRadius: 99, padding: "6px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {CATS[item.cat] || ""}
          </div>
          <div
            onClick={() => update({ flags: { ...screen.flags, [screen.qIndex]: !isFlagged } })}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", background: isFlagged ? "rgba(255,209,102,0.14)" : SURFACE, border: `1px solid ${isFlagged ? "rgba(255,209,102,0.45)" : "rgba(255,255,255,0.1)"}`, color: isFlagged ? GOLD : MUTED }}
          >
            ⚑ Dubtosa
          </div>
        </div>

        {item.img && <SignalImage src={item.img} alt={item.imgAlt} />}

        <div style={{ fontFamily: "Anton, sans-serif", fontSize: 27, lineHeight: 1.12, letterSpacing: "-0.005em", marginTop: 20, color: "#fff" }}>
          {item.text}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 22 }}>
          {item.options.map((opt, i) => {
            const on = screen.answers[screen.qIndex] === i;
            return (
              <div
                key={i}
                onClick={() => update({ answers: { ...screen.answers, [screen.qIndex]: i } })}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 15px", minHeight: 70, borderRadius: 20, cursor: "pointer", transition: "all .16s ease", background: on ? "rgba(255,45,135,0.1)" : CARD, border: `1.5px solid ${on ? PINK : "rgba(255,255,255,0.09)"}`, boxShadow: on ? "0 0 0 3px rgba(255,45,135,0.14), 0 12px 30px rgba(255,45,135,0.18)" : "none", WebkitTapHighlightColor: "transparent" }}
              >
                <div style={{ flex: "0 0 38px", height: 38, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Anton, sans-serif", fontSize: 17, transition: "all .16s ease", background: on ? "linear-gradient(140deg,#ff2d87,#ff7b3d)" : "rgba(255,255,255,0.06)", color: on ? "#0b0212" : "#8d85ad" }}>
                  {"ABCD"[i]}
                </div>
                <div style={{ fontSize: 15.5, lineHeight: 1.34, fontWeight: 500, color: on ? "#fff" : "#d9d4f0" }}>{opt}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ width: "100%", maxWidth: 430, padding: "14px 18px 22px", background: "linear-gradient(180deg,rgba(5,4,10,0) 0%,#05040a 40%)", pointerEvents: "auto" }}>
          {flagCount > 0 && (
            <div
              onClick={() => {
                const flagged = Object.keys(screen.flags).filter((k) => screen.flags[k]).map(Number).sort((a, b) => a - b);
                if (flagged.length) update({ qIndex: flagged[0] });
              }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 10, fontSize: 12.5, fontWeight: 700, color: GOLD, background: "rgba(255,209,102,0.1)", border: "1px solid rgba(255,209,102,0.3)", borderRadius: 99, padding: 9, cursor: "pointer" }}
            >
              Anar a les dubtoses ({flagCount})
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            {screen.qIndex > 0 && (
              <div
                onClick={() => update({ qIndex: screen.qIndex - 1 })}
                style={{ flex: "0 0 auto", padding: "18px 22px", background: SURFACE, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, fontFamily: "Anton, sans-serif", fontSize: 16, letterSpacing: "0.05em", textTransform: "uppercase", color: TEXT_SOFT, cursor: "pointer" }}
              >
                Enrere
              </div>
            )}
            <div
              onClick={onNext}
              style={{ flex: 1, padding: 18, borderRadius: 18, textAlign: "center", fontFamily: "Anton, sans-serif", fontSize: 18, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", transition: "all .18s ease", background: answered ? "linear-gradient(95deg,#ff2d87,#ff7b3d)" : SURFACE, color: answered ? "#0b0212" : MUTED, border: `1px solid ${answered ? "transparent" : "rgba(255,255,255,0.1)"}`, boxShadow: answered ? "0 12px 32px rgba(255,45,135,0.3)" : "none" }}
            >
              {isLast ? "Finalitzar" : answered ? "Següent" : "Ometre per ara"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignalImage({ src, alt }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div style={{ marginTop: 16, borderRadius: 22, border: "1px solid rgba(255,255,255,0.1)", background: "repeating-linear-gradient(135deg,#120f1e 0 9px,#171327 9px 18px)", height: 172, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 9 }}>
        <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 11, color: "#7d75a0", letterSpacing: "0.04em", textAlign: "center", padding: "0 22px" }}>
          {alt}
        </div>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 9.5, color: "#544d75" }}>imatge pendent</div>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || ""}
      onError={() => setErrored(true)}
      style={{ marginTop: 16, borderRadius: 22, border: "1px solid rgba(255,255,255,0.1)", background: "#fff", height: 172, width: "100%", objectFit: "contain", padding: 14, display: "block" }}
    />
  );
}

/* =========================================================
   Finalitzar examen
   ========================================================= */
async function finishExam(screen, state, persist, setScreen, elapsedSeconds) {
  const ex = screen.exam;
  const total = ex.length;
  let correct = 0;
  const perQuestion = [];
  const next = {
    ...state,
    failedIds: [...state.failedIds],
    examResults: { ...state.examResults },
    inProgress: { ...state.inProgress },
  };
  ex.forEach((item, i) => {
    const given = screen.answers[i];
    const ok = given === item.correct;
    if (ok) {
      correct++;
      const pos = next.failedIds.indexOf(item.idx);
      if (pos !== -1) next.failedIds.splice(pos, 1);
    } else if (!next.failedIds.includes(item.idx)) {
      next.failedIds.push(item.idx);
    }
    perQuestion.push({ idx: item.idx, cat: item.cat, ok, given });
  });
  const errors = total - correct;
  const pass = errors <= passThreshold(total);
  if (screen.examNum) {
    next.examResults[screen.examNum] = {
      done: true,
      score: correct,
      pass,
      finishedAt: Date.now(),
      elapsedSeconds,
      perQuestion,
    };
  }
  delete next.inProgress[screen.key];
  await persist(next);

  // Si ha aprovat, el botó principal proposa el següent examen pendent
  let nextExamNum = screen.examNum;
  if (pass && screen.examNum) {
    for (let n = 1; n <= 10; n++) {
      if (!next.examResults[n] && !next.inProgress[String(n)]) {
        nextExamNum = n;
        break;
      }
    }
  }

  setScreen({
    name: "result",
    exam: ex,
    answers: screen.answers,
    examNum: screen.examNum,
    nextExamNum,
    elapsedSeconds,
    perQuestion,
    stateAfter: next,
  });
}

/* =========================================================
   6 · INFORME
   ========================================================= */
function ResultScreen({ screen, state, onHome, onRepeat }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const ex = screen.exam;
  const total = ex.length;
  let correct = 0,
    blank = 0;
  const wrong = [];
  ex.forEach((it, i) => {
    const g = screen.answers[i];
    if (g === it.correct) correct++;
    else {
      if (g === undefined) blank++;
      wrong.push({
        cat: CATS[it.cat] || "",
        text: it.text,
        given: g === undefined ? "(sense contestar)" : it.options[g],
        right: it.options[it.correct],
        exp: it.exp,
      });
    }
  });
  const errors = total - correct;
  const allowed = passThreshold(total);
  const pass = errors <= allowed;

  const ringR = 52;
  const circumference = 2 * Math.PI * ringR;
  const ringOffset = Math.round(circumference - (correct / total) * circumference);

  const resultState = screen.stateAfter || state;
  const resultTopics = singleExamTopicStats(screen.perQuestion);
  const doneList = doneExamsSorted(resultState.examResults);
  const passedCount = countPassed(resultState.examResults);
  const note = evolutionNote(resultState.examResults, { pass, total });
  const reward = pass && passedCount > 0 ? REWARDS[(passedCount - 1) % REWARDS.length] : null;

  /* Confeti només si ha aprovat */
  useEffect(() => {
    if (!pass) return;
    const c = canvasRef.current;
    if (!c || !c.clientWidth) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = c.clientWidth,
      h = c.clientHeight;
    c.width = w * dpr;
    c.height = h * dpr;
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colors = [PINK, CYAN, LIME, GOLD, "#ffffff"];
    let parts = [],
      last = performance.now(),
      t = 0,
      nextBurst = 120;

    const burst = (x, y) => {
      const col = colors[Math.floor(Math.random() * colors.length)];
      const n = 42;
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.25;
        const sp = 55 + Math.random() * 130;
        parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, col, r: 1.4 + Math.random() * 1.8 });
      }
    };

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt * 1000;
      if (t > nextBurst && t < 4200) {
        burst(w * (0.18 + Math.random() * 0.64), h * (0.14 + Math.random() * 0.42));
        nextBurst = t + 320 + Math.random() * 260;
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(0,0,0,0.16)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      parts.forEach((p) => {
        p.life -= dt * 0.62;
        p.vy += 95 * dt;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.life <= 0) return;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (0.4 + p.life * 0.9), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      parts = parts.filter((p) => p.life > 0 && p.y < h + 40);
      if (t < 6200) rafRef.current = requestAnimationFrame(frame);
      else {
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, w, h);
      }
    };
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [pass]);

  const subtitle = pass
    ? "3 errors permesos i els has esquivat. Segueix així i el teòric és teu."
    : errors <= 5
    ? "Només es permeten 3 errors. T'has quedat a les portes, va de debò."
    : errors <= 10
    ? "Només es permeten 3 errors. Repassa els temes de sota i torna."
    : "Només es permeten 3 errors. Toca tornar a la teoria abans de repetir.";

  return (
    <div style={{ minHeight: "100vh", background: "#05040a", animation: "popIn .3s ease both" }}>
      <div style={{ position: "relative", overflow: "hidden", padding: "32px 18px 26px", background: pass ? "radial-gradient(110% 80% at 50% 0%,#1f7a3a 0%,#0d2a1c 55%,#05040a 100%)" : "radial-gradient(110% 80% at 50% 0%,#7a1140 0%,#2a0d1c 55%,#05040a 100%)" }}>
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
        {pass && (
          <div style={{ position: "relative", textAlign: "center", fontFamily: "Anton, sans-serif", fontSize: 15, letterSpacing: "0.28em", textTransform: "uppercase", color: LIME, marginBottom: 12 }}>
            La reina del volant
          </div>
        )}
        <div style={{ position: "relative", width: 150, height: 150, margin: "0 auto" }}>
          <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="75" cy="75" r={ringR} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="13" />
            <circle cx="75" cy="75" r={ringR} fill="none" stroke={pass ? LIME : "#ffffff"} strokeWidth="13" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={ringOffset} style={{ animation: "ringDraw 1.1s cubic-bezier(.2,.8,.2,1) both" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: "Anton, sans-serif", fontSize: 52, lineHeight: 0.82, letterSpacing: "-0.02em", color: "#fff" }}>{correct}</div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.72)", fontWeight: 600 }}>de {total}</div>
          </div>
        </div>
        <div style={{ position: "relative", textAlign: "center", marginTop: 16 }}>
          <div style={{ fontFamily: "Anton, sans-serif", fontSize: pass ? 50 : 44, lineHeight: 0.9, letterSpacing: "-0.01em", textTransform: "uppercase", color: "#fff", textShadow: pass ? "0 0 30px rgba(198,255,61,0.5)" : "none", animation: pass ? "slamIn .5s cubic-bezier(.2,.9,.2,1) both" : "none", display: "inline-block" }}>
            {pass ? "Aprovat!" : "Suspès"}
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.78)", marginTop: 8, padding: "0 12px" }}>{subtitle}</div>
        </div>

        {reward && (
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, marginTop: 20, background: "rgba(0,0,0,0.35)", border: "1px solid rgba(198,255,61,0.35)", borderRadius: 20, padding: 15 }}>
            <div style={{ fontSize: 26 }}>{reward.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "Anton, sans-serif", fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: LIME }}>Desbloquejat</div>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: "#fff", marginTop: 3 }}>{reward.label}</div>
            </div>
          </div>
        )}

        <div style={{ position: "relative", display: "flex", gap: 9, marginTop: 14 }}>
          <MetricCell value={String(errors)} label={`Fallades · màx ${allowed}`} />
          <MetricCell value={fmtTime(screen.elapsedSeconds)} label="Temps" />
          <MetricCell value={String(blank)} label="En blanc" />
        </div>
      </div>

      <div style={{ padding: "24px 18px 44px" }}>
        {resultTopics.length > 0 && (
          <>
            <Kicker style={{ margin: "0 0 12px" }}>Per temes</Kicker>
            <div style={{ ...panelStyle, padding: "6px 18px 14px" }}>
              {resultTopics.map((t) => (
                <TopicRow key={t.name} t={t} />
              ))}
            </div>
          </>
        )}

        {doneList.length > 0 && (
          <>
            <Kicker>La teva evolució</Kicker>
            <div style={{ ...panelStyle, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 96 }}>
                {doneList.map((h) => {
                  const isNow = screen.examNum && h.num === screen.examNum;
                  return (
                    <div key={h.num} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, justifyContent: "flex-end", height: "100%" }}>
                      <div style={{ fontFamily: "Anton, sans-serif", fontSize: 12, color: isNow ? (pass ? LIME : PINK) : "#544d75" }}>{h.score}</div>
                      <div style={{ width: "100%", height: barHeight(h.score, total, 56), borderRadius: 6, background: isNow ? (pass ? "linear-gradient(180deg,#c6ff3d,#12b76a)" : "linear-gradient(180deg,#ff2d87,#7b2dff)") : "rgba(255,255,255,0.12)", transition: "height .45s ease" }} />
                      <div style={{ fontSize: 10, color: MUTED, fontWeight: 600 }}>{String(h.num).padStart(2, "0")}</div>
                    </div>
                  );
                })}
              </div>
              {note && (
                <div style={{ fontSize: 12.5, color: TEXT_SOFT, marginTop: 15, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  {note}
                </div>
              )}
            </div>
          </>
        )}

        {wrong.length > 0 && (
          <>
            <Kicker>Repàs de les fallades</Kicker>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {wrong.map((w, i) => (
                <div key={i} style={{ ...panelStyle, borderRadius: 22, padding: 18 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED }}>{w.cat}</div>
                  <div style={{ fontFamily: "Anton, sans-serif", fontSize: 19, lineHeight: 1.2, marginTop: 9, color: "#fff" }}>{w.text}</div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 9, marginTop: 14, background: "rgba(255,45,135,0.12)", border: "1px solid rgba(255,45,135,0.25)", borderRadius: 14, padding: 12 }}>
                    <div style={{ color: "#ff5c9e", fontWeight: 700, fontSize: 13 }}>✕</div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.35, color: "#ffbfd8" }}>
                      <b>La teva:</b> {w.given}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 9, marginTop: 8, background: "rgba(198,255,61,0.1)", border: "1px solid rgba(198,255,61,0.28)", borderRadius: 14, padding: 12 }}>
                    <div style={{ color: LIME, fontWeight: 700, fontSize: 13 }}>✓</div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.35, color: "#ddf7a5" }}>
                      <b>Correcta:</b> {w.right}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: TEXT_SOFT, marginTop: 13, paddingLeft: 12, borderLeft: "2px solid rgba(255,255,255,0.12)" }}>{w.exp}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 26 }}>
          {screen.examNum && (
            <div onClick={onRepeat} style={{ background: "linear-gradient(95deg,#ff2d87,#ff7b3d)", color: "#0b0212", borderRadius: 19, padding: 19, textAlign: "center", fontFamily: "Anton, sans-serif", fontSize: 19, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 12px 34px rgba(255,45,135,0.32)" }}>
              {pass && screen.nextExamNum !== screen.examNum ? "Següent examen" : "Repetir examen"}
            </div>
          )}
          <div onClick={onHome} style={{ background: SURFACE, border: "1px solid rgba(255,255,255,0.1)", color: TEXT_SOFT, borderRadius: 19, padding: 19, textAlign: "center", fontFamily: "Anton, sans-serif", fontSize: 18, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer" }}>
            Tornar al menú
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCell({ value, label }) {
  return (
    <div style={{ flex: 1, background: "rgba(0,0,0,0.32)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 17, padding: 13, textAlign: "center" }}>
      <div style={{ fontFamily: "Anton, sans-serif", fontSize: 22, color: "#fff" }}>{value}</div>
      <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}
