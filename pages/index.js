import { useEffect, useRef, useState } from "react";
import {
  CATS,
  buildExamIds,
  buildExamQuestions,
  reviewChunkIds,
  passThreshold,
} from "../lib/questions";
import {
  BLUE,
  GREEN,
  RED,
  AMBER,
  fmtTime,
  doneExamsSorted,
  computeAvg,
  computeTrend,
  aggregateTopicStats,
  singleExamTopicStats,
  barHeight,
} from "../lib/derive";

const LIMIT_SECONDS = 30 * 60; // 30 minutos, como en la DGT
const MAX_ERRORS = 3;

const EMPTY_STATE = {
  hasSeenSplash: false,
  examResults: {},
  failedIds: [],
  inProgress: {},
};

/* =========================================================
   Iconos SVG en línea
   ========================================================= */
const IconWheel = ({ size = 34, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
    <circle cx="12" cy="12" r="2.4" stroke={color} strokeWidth="1.8" />
    <path d="M12 3v6.6M12 14.4V21M4.2 8l5.7 3.3M20 16l-5.7-3.3M4.2 16l5.7-3.3M20 8l-5.7 3.3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const IconTrendUp = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="M4 17l6-6 4 4 6-7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconAlertTriangle = ({ color = "#fff", size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 4l9 16H3L12 4z" stroke={color} strokeWidth="1.9" strokeLinejoin="round" />
    <path d="M12 10v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="17" r="1" fill={color} />
  </svg>
);
const IconChevronRight = ({ color = "#b07b2a", size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 6l6 6-6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconArrowLeft = ({ color = "#475467", size = 16, strokeWidth = 2.3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M15 6l-6 6 6 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconClock = ({ size = 13, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <path d="M12 7v5l3.5 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconFlag = ({ color = "currentColor", size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 3v18M6 4h11l-2.2 4.2L17 12H6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconX = ({ color = "currentColor", size = 14, strokeWidth = 3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);
const IconCheck = ({ color = "currentColor", size = 14, strokeWidth = 3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 13l4 4L19 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* =========================================================
   Estilos reutilizables (fieles al prototipo)
   ========================================================= */
const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e8ebf2",
  borderRadius: 22,
  padding: 18,
  boxShadow: "0 1px 2px rgba(16,24,40,0.04), 0 8px 24px rgba(16,24,40,0.05)",
};
const sectionTitleStyle = {
  fontFamily: "Manrope, sans-serif",
  fontWeight: 800,
  fontSize: 13,
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  color: "#98a2b3",
  margin: "26px 0 12px",
};
function SectionTitle({ children }) {
  return <div style={sectionTitleStyle}>{children}</div>;
}

/* =========================================================
   Componente raíz
   ========================================================= */
export default function AutoescolaApp() {
  const [state, setState] = useState(null);
  const [saveOk, setSaveOk] = useState(true);
  const [screen, setScreen] = useState({ name: "loading" });
  const stateRef = useRef(null);
  stateRef.current = state;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/state");
        const json = await res.json();
        const data = json.data || EMPTY_STATE;
        setState(data);
        setScreen({ name: data.hasSeenSplash ? "home" : "splash" });
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
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#98a2b3", fontSize: 14 }}>
          Cargando…
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
            setScreen({ name: "home" });
          }}
        />
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
        />
      </Shell>
    );
  }

  if (screen.name === "exam") {
    return (
      <Shell>
        <ExamScreen
          screen={screen}
          setScreen={setScreen}
          state={state}
          persist={persist}
        />
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
          onRepeat={() => setScreen(startExamScreen(screen.examNum))}
        />
      </Shell>
    );
  }

  return null;
}

function Shell({ children }) {
  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#f6f7fb", position: "relative", overflow: "hidden" }}>
      {children}
    </div>
  );
}

/* =========================================================
   Construcción / transición de pantallas de examen
   ========================================================= */
function startExamScreen(examNum) {
  const ids = buildExamIds(examNum);
  const exam = buildExamQuestions(ids, examNum);
  return {
    name: "exam",
    key: String(examNum),
    examNum,
    ids,
    title: `Examen ${String(examNum).padStart(2, "0")}`,
    exam,
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
  const exam = buildExamQuestions(ids, 9000 + chunkIndex);
  return {
    name: "exam",
    key: "review",
    examNum: null,
    ids,
    title: "Repàs de fallades",
    exam,
    qIndex: 0,
    answers: {},
    flags: {},
    startedAt: Date.now(),
    pausedElapsed: 0,
  };
}

function resumeScreen(state, key) {
  const saved = state.inProgress[key];
  const exam = buildExamQuestions(saved.ids, key === "review" ? 9000 : saved.examNum);
  return {
    name: "exam",
    key,
    examNum: saved.examNum,
    ids: saved.ids,
    title: saved.title,
    exam,
    qIndex: saved.qIndex || 0,
    answers: saved.answers || {},
    flags: saved.flags || {},
    startedAt: Date.now(),
    pausedElapsed: saved.elapsedSeconds || 0,
  };
}

/* =========================================================
   PANTALLA 1 · SPLASH
   ========================================================= */
function SplashScreen({ onEnter }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "0 26px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 26,
        background: "linear-gradient(178deg,#0b3fb8 0%,#155dfc 55%,#3b7bff 100%)",
        color: "#ffffff",
      }}
    >
      <div style={{ width: 64, height: 64, borderRadius: 22, background: "rgba(255,255,255,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <IconWheel />
      </div>
      <div>
        <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.72 }}>
          Autoescola Manel
        </div>
        <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 42, lineHeight: 1.04, letterSpacing: "-0.03em", marginTop: 12 }}>
          Hola, Ares.
          <br />
          Has dit que estaves preparada.
        </div>
        <div style={{ fontSize: 16, lineHeight: 1.5, opacity: 0.85, marginTop: 16, maxWidth: 330 }}>
          Deu examens de 30 preguntes, 30 minuts, 3 errors permesos. Exactament com el de la DGT. Ni una pista fins al final.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          onClick={onEnter}
          style={{ background: "#ffffff", color: "#0b3fb8", borderRadius: 18, padding: 19, textAlign: "center", fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 17, cursor: "pointer", boxShadow: "0 12px 30px rgba(6,24,68,0.28)" }}
        >
          Comencem
        </div>
        <div style={{ textAlign: "center", fontSize: 13, opacity: 0.7 }}>Sort, Suricata 🦡</div>
      </div>
    </div>
  );
}

/* =========================================================
   PANTALLA 2 · HOME
   ========================================================= */
function HomeScreen({ state, saveOk, onStart, onResume, onStartReview }) {
  const total = 10;
  const examResults = state.examResults || {};
  const failedIds = state.failedIds || [];
  const inProgress = state.inProgress || {};

  const avg = computeAvg(examResults);
  const trend = computeTrend(examResults);
  const done = doneExamsSorted(examResults);
  const passedCount = done.filter((r) => r.pass).length;
  const doneCount = done.length;
  const failedCount = failedIds.length;
  const weakTopics = aggregateTopicStats(examResults, { minAnswered: 3, limit: 4 });
  const reviewInProgress = inProgress["review"];

  return (
    <div style={{ padding: "22px 18px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em" }}>Teòric B</div>
          <div style={{ fontSize: 13, color: "#667085", marginTop: 2 }}>Autoescola Manel · per l&apos;Ares</div>
        </div>
        <div style={{ width: 42, height: 42, borderRadius: 14, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Manrope, sans-serif", fontWeight: 800, color: "#fff", fontSize: 15 }}>
          A
        </div>
      </div>

      {avg === null ? (
        <div style={{ ...cardStyle, textAlign: "center", padding: "26px 20px" }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: "#e8f0ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <IconWheel size={22} color={BLUE} />
          </div>
          <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 16 }}>Encara no has fet cap examen</div>
          <div style={{ fontSize: 13, color: "#667085", marginTop: 6, lineHeight: 1.45 }}>
            Comença el primer per veure aquí la teva nota mitjana i com evoluciones.
          </div>
        </div>
      ) : (
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#98a2b3" }}>Nota mitjana</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
                <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 38, lineHeight: 1, letterSpacing: "-0.02em" }}>{avg}</div>
                <div style={{ fontSize: 15, color: "#98a2b3", fontWeight: 600 }}>/ 30</div>
              </div>
            </div>
            {trend && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#e7f9f1", color: "#087443", borderRadius: 99, padding: "6px 11px", fontSize: 12.5, fontWeight: 700 }}>
                <IconTrendUp /> {trend}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height: 76, marginTop: 18 }}>
            {done.map((r) => (
              <div key={r.num} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, justifyContent: "flex-end", height: "100%" }}>
                <div style={{ width: "100%", height: barHeight(r.score, 30, 52), borderRadius: 6, background: r.pass ? GREEN : "#c7d5f7", transition: "height .4s ease" }} />
                <div style={{ fontSize: 10, color: "#b3bac8", fontWeight: 600 }}>{String(r.num).padStart(2, "0")}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 14, marginTop: 16, paddingTop: 15, borderTop: "1px solid #eef1f7" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 19 }}>{passedCount}/{total}</div>
              <div style={{ fontSize: 11.5, color: "#98a2b3", fontWeight: 600 }}>Aprovats</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 19 }}>{doneCount}/{total}</div>
              <div style={{ fontSize: 11.5, color: "#98a2b3", fontWeight: 600 }}>Realitzats</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 19, color: AMBER }}>{failedCount}</div>
              <div style={{ fontSize: 11.5, color: "#98a2b3", fontWeight: 600 }}>En repàs</div>
            </div>
          </div>
        </div>
      )}

      {weakTopics.length > 0 && (
        <>
          <SectionTitle>On flaqueges</SectionTitle>
          <div style={{ ...cardStyle, padding: "6px 18px 14px" }}>
            {weakTopics.map((t) => (
              <TopicRow key={t.name} t={t} />
            ))}
          </div>
        </>
      )}

      <SectionTitle>Examens</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
          const r = examResults[n];
          const prog = inProgress[String(n)];
          let st = "pending";
          if (prog) st = "progress";
          else if (r && r.done) st = r.pass ? "pass" : "fail";
          const color = st === "pass" ? GREEN : st === "fail" ? RED : st === "progress" ? AMBER : "#d0d5dd";
          const label =
            st === "pass"
              ? `Aprovat · ${r.score}/30`
              : st === "fail"
              ? `Suspès · ${r.score}/30`
              : st === "progress"
              ? `Pregunta ${prog.qIndex + 1}/30`
              : "Pendent";
          return (
            <div
              key={n}
              onClick={() => (prog ? onResume(String(n)) : onStart(n))}
              style={{ position: "relative", background: "#ffffff", border: "1px solid #e8ebf2", borderRadius: 20, padding: "15px 15px 14px", cursor: "pointer", boxShadow: "0 1px 2px rgba(16,24,40,0.04)" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", color: "#101828" }}>
                  {String(n).padStart(2, "0")}
                </div>
                <div style={{ width: 22, height: 22, borderRadius: 99, background: st === "pending" ? "#f2f4f9" : color, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {st === "pass" && <IconCheck size={11} />}
                  {st === "fail" && <IconX size={11} />}
                  {st === "progress" && <IconClock size={11} color="#fff" />}
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: "#98a2b3", fontWeight: 600, marginTop: 10 }}>Examen</div>
              <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 13, marginTop: 2, color: st === "pending" ? "#98a2b3" : color }}>{label}</div>
            </div>
          );
        })}
      </div>

      <div
        onClick={() => (reviewInProgress ? onResume("review") : failedCount > 0 ? onStartReview() : null)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginTop: 14,
          background: "#fff8ef",
          border: "1px solid #f7dfba",
          borderRadius: 20,
          padding: 17,
          cursor: reviewInProgress || failedCount > 0 ? "pointer" : "default",
          opacity: reviewInProgress || failedCount > 0 ? 1 : 0.6,
        }}
      >
        <div style={{ flex: "0 0 40px", height: 40, borderRadius: 14, background: AMBER, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconAlertTriangle />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 15, color: "#7a4a06" }}>
            {reviewInProgress ? "Repàs en curs" : "Repàs de fallades"}
          </div>
          <div style={{ fontSize: 12.5, color: "#9a6a2a", marginTop: 2 }}>
            {reviewInProgress
              ? `Pregunta ${reviewInProgress.qIndex + 1}/${reviewInProgress.ids.length} · continua on ho vas deixar`
              : failedCount > 0
              ? `${failedCount} preguntes pendents de dominar`
              : "Encara no tens cap pregunta fallada"}
          </div>
        </div>
        {(reviewInProgress || failedCount > 0) && <IconChevronRight />}
      </div>

      <div style={{ textAlign: "center", fontSize: 11.5, color: saveOk ? "#b3bac8" : RED, marginTop: 26 }}>
        {saveOk ? "El teu progrés es desa automàticament." : "Avís: no s'ha pogut desar el progrés. Comprova la connexió."}
      </div>
    </div>
  );
}

function TopicRow({ t }) {
  return (
    <div style={{ padding: "12px 0", borderBottom: "1px solid #f2f4f9" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25 }}>{t.name}</div>
        <div style={{ flex: "0 0 auto", fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 13, color: t.color }}>{t.pct}%</div>
      </div>
      <div style={{ height: 7, borderRadius: 99, background: "#f2f4f9", overflow: "hidden" }}>
        <div style={{ width: `${t.pct}%`, height: "100%", borderRadius: 99, background: t.color, transition: "width .5s ease" }} />
      </div>
    </div>
  );
}

/* =========================================================
   PANTALLA 3 · EXAMEN
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

  function update(patch) {
    setScreen({ ...screen, ...patch });
  }

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
    <div style={{ minHeight: "100vh", paddingBottom: 190 }}>
      <div style={{ position: "sticky", top: 0, zIndex: 5, background: "rgba(246,247,251,0.94)", backdropFilter: "blur(10px)", padding: "14px 18px 12px", borderBottom: "1px solid #e8ebf2" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div onClick={onQuit} title="Sortir i continuar més tard" style={{ width: 34, height: 34, borderRadius: 12, background: "#ffffff", border: "1px solid #e3e7ef", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <IconArrowLeft />
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em" }}>{screen.title}</div>
            <div style={{ fontSize: 11.5, color: "#98a2b3", fontWeight: 600 }}>Pregunta {screen.qIndex + 1} de {total}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 11px", borderRadius: 99, fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 13.5, fontVariantNumeric: "tabular-nums", background: low ? "#fdeceb" : "#ffffff", border: `1px solid ${low ? "#f7c7c3" : "#e3e7ef"}`, color: low ? "#c4271b" : "#344054" }}>
            <IconClock /> {fmtTime(secondsLeft)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 3, marginTop: 13 }}>
          {screen.exam.map((_, i) => {
            const cur = i === screen.qIndex;
            const ans = screen.answers[i] !== undefined;
            const fl = screen.flags[i];
            return (
              <div
                key={i}
                onClick={() => update({ qIndex: i })}
                style={{ flex: 1, height: cur ? 7 : 5, alignSelf: "center", borderRadius: 99, cursor: "pointer", transition: "all .18s ease", background: cur ? BLUE : fl ? AMBER : ans ? "#a9c3fb" : "#dfe4ee" }}
              />
            );
          })}
        </div>
      </div>

      <div style={{ padding: "20px 18px 0" }} key={"q" + screen.qIndex}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "inline-block", background: "#e8f0ff", color: "#0b3fb8", borderRadius: 99, padding: "6px 12px", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.02em" }}>
            {CATS[item.cat] || ""}
          </div>
          <div
            onClick={() => update({ flags: { ...screen.flags, [screen.qIndex]: !isFlagged } })}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 99, fontSize: 11.5, fontWeight: 700, cursor: "pointer", background: isFlagged ? "#fff8ef" : "#ffffff", border: `1px solid ${isFlagged ? "#f7dfba" : "#e3e7ef"}`, color: isFlagged ? "#b07b2a" : "#98a2b3" }}
          >
            <IconFlag /> Dubtosa
          </div>
        </div>

        {item.img && <SignalImage src={item.img} alt={item.imgAlt} />}

        <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 22, lineHeight: 1.28, letterSpacing: "-0.015em", marginTop: 18 }}>
          {item.text}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 20 }}>
          {item.options.map((opt, i) => {
            const selected = screen.answers[screen.qIndex] === i;
            return (
              <div
                key={i}
                onClick={() => update({ answers: { ...screen.answers, [screen.qIndex]: i } })}
                style={{ position: "relative", display: "flex", alignItems: "center", gap: 13, padding: "16px 15px", minHeight: 66, background: "#ffffff", border: "1.5px solid #e3e7ef", borderRadius: 18, cursor: "pointer", boxShadow: "0 1px 2px rgba(16,24,40,0.04)" }}
              >
                <div style={{ position: "absolute", inset: "-1.5px", borderRadius: 18, border: `2px solid ${BLUE}`, background: "rgba(21,93,252,0.045)", opacity: selected ? 1 : 0, transition: "opacity .16s ease", pointerEvents: "none" }} />
                <div style={{ position: "relative", flex: "0 0 34px", height: 34, borderRadius: 12, background: "#f2f4f9", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 14.5, color: "#667085" }}>
                  {"ABCD"[i]}
                  <div style={{ position: "absolute", inset: 0, borderRadius: 12, background: BLUE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", opacity: selected ? 1 : 0, transition: "opacity .16s ease" }}>
                    {"ABCD"[i]}
                  </div>
                </div>
                <div style={{ position: "relative", fontSize: 15.5, lineHeight: 1.34, fontWeight: 500, color: "#101828" }}>{opt}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ width: "100%", maxWidth: 430, padding: "14px 18px 20px", background: "linear-gradient(180deg, rgba(246,247,251,0) 0%, #f6f7fb 42%)", pointerEvents: "auto" }}>
          {flagCount > 0 && (
            <div
              onClick={() => {
                const flagged = Object.keys(screen.flags).filter((k) => screen.flags[k]).map(Number).sort((a, b) => a - b);
                if (flagged.length) update({ qIndex: flagged[0] });
              }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 10, fontSize: 12.5, fontWeight: 700, color: "#b07b2a", background: "#fff8ef", border: "1px solid #f7dfba", borderRadius: 99, padding: 8, cursor: "pointer" }}
            >
              Anar a les dubtoses ({flagCount})
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            {screen.qIndex > 0 && (
              <div
                onClick={() => update({ qIndex: screen.qIndex - 1 })}
                style={{ flex: "0 0 auto", padding: "17px 20px", background: "#ffffff", border: "1px solid #e3e7ef", borderRadius: 17, fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 15, color: "#475467", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
              >
                <IconArrowLeft size={15} strokeWidth={2.3} /> Enrere
              </div>
            )}
            <div
              onClick={onNext}
              style={{ flex: 1, padding: 17, borderRadius: 17, textAlign: "center", fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 16, cursor: "pointer", transition: "all .18s ease", background: answered ? BLUE : "#ffffff", color: answered ? "#ffffff" : "#98a2b3", border: `1px solid ${answered ? BLUE : "#e3e7ef"}`, boxShadow: answered ? "0 8px 22px rgba(21,93,252,0.24)" : "none" }}
            >
              {isLast ? "Finalitzar examen" : answered ? "Següent" : "Ometre per ara"}
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
      <div style={{ marginTop: 16, borderRadius: 20, border: "1px solid #e3e7ef", background: "repeating-linear-gradient(135deg, #f2f4f9 0 9px, #e9edf5 9px 18px)", height: 168, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 11, color: "#8d97a8", letterSpacing: "0.04em", textAlign: "center", padding: "0 20px" }}>
          {alt}
        </div>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 9.5, color: "#aeb6c4" }}>imagen pendiente de añadir</div>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || ""}
      onError={() => setErrored(true)}
      style={{ marginTop: 16, borderRadius: 20, border: "1px solid #e3e7ef", height: 168, width: "100%", objectFit: "contain", background: "#fff" }}
    />
  );
}

/* =========================================================
   Finalizar examen
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
  setScreen({
    name: "result",
    exam: ex,
    answers: screen.answers,
    examNum: screen.examNum,
    elapsedSeconds,
    perQuestion,
  });
}

/* =========================================================
   PANTALLA 4 · INFORME
   ========================================================= */
function ResultScreen({ screen, state, onHome, onRepeat }) {
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

  const resultTopics = singleExamTopicStats(screen.perQuestion);

  const doneList = doneExamsSorted(state.examResults);
  const historyWithNow = doneList.map((r) => ({
    num: r.num,
    value: r.score,
    isNow: screen.examNum && r.num === screen.examNum,
    pass: r.pass,
  }));

  const subtitle = pass
    ? "Com a l'examen real: 3 errors permesos."
    : errors <= 5
    ? "Només es permeten 3 errors. T'has quedat a les portes."
    : errors <= 10
    ? "Només es permeten 3 errors. Repassa els temes de sota i torna."
    : "Només es permeten 3 errors. Toca tornar a la teoria abans de repetir.";

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ padding: "34px 18px 26px", background: pass ? "linear-gradient(170deg,#087443 0%,#12b76a 100%)" : "linear-gradient(170deg,#a62119 0%,#f04438 100%)" }}>
        <div style={{ position: "relative", width: 132, height: 132, margin: "0 auto" }}>
          <svg width="132" height="132" viewBox="0 0 132 132" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="66" cy="66" r={ringR} fill="none" stroke="rgba(255,255,255,0.24)" strokeWidth="11" />
            <circle cx="66" cy="66" r={ringR} fill="none" stroke="#ffffff" strokeWidth="11" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={ringOffset} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
            <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 40, lineHeight: 1, letterSpacing: "-0.03em" }}>{correct}</div>
            <div style={{ fontSize: 12.5, opacity: 0.82, fontWeight: 600 }}>de {total}</div>
          </div>
        </div>
        <div style={{ textAlign: "center", color: "#ffffff", marginTop: 18 }}>
          <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 30, letterSpacing: "-0.025em" }}>{pass ? "Aprovat!" : "Suspès"}</div>
          <div style={{ fontSize: 14, opacity: 0.85, marginTop: 5 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", gap: 9, marginTop: 22 }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.16)", borderRadius: 16, padding: 12, textAlign: "center", color: "#fff" }}>
            <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 19 }}>{errors}</div>
            <div style={{ fontSize: 11, opacity: 0.82, fontWeight: 600 }}>Fallades (màx. {allowed})</div>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.16)", borderRadius: 16, padding: 12, textAlign: "center", color: "#fff" }}>
            <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 19 }}>{fmtTime(screen.elapsedSeconds)}</div>
            <div style={{ fontSize: 11, opacity: 0.82, fontWeight: 600 }}>Temps utilitzat</div>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.16)", borderRadius: 16, padding: 12, textAlign: "center", color: "#fff" }}>
            <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 19 }}>{blank}</div>
            <div style={{ fontSize: 11, opacity: 0.82, fontWeight: 600 }}>Sense contestar</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "22px 18px 40px" }}>
        {resultTopics.length > 0 && (
          <>
            <SectionTitle>Per temes</SectionTitle>
            <div style={{ ...cardStyle, padding: "6px 18px 14px" }}>
              {resultTopics.map((t) => (
                <TopicRow key={t.name} t={t} />
              ))}
            </div>
          </>
        )}

        {historyWithNow.length > 0 && (
          <>
            <SectionTitle>La teva evolució</SectionTitle>
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height: 92 }}>
                {historyWithNow.map((h) => (
                  <div key={h.num} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, justifyContent: "flex-end", height: "100%" }}>
                    <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 11, color: h.isNow ? (pass ? "#087443" : "#c4271b") : "#c3cad6" }}>{h.value}</div>
                    <div style={{ width: "100%", height: barHeight(h.value, total, 52), borderRadius: 6, background: h.isNow ? (pass ? GREEN : RED) : "#dfe4ee", transition: "height .4s ease" }} />
                    <div style={{ fontSize: 10, color: "#b3bac8", fontWeight: 600 }}>{String(h.num).padStart(2, "0")}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {wrong.length > 0 && (
          <>
            <SectionTitle>Repàs de les fallades</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {wrong.map((w, i) => (
                <div key={i} style={{ background: "#ffffff", border: "1px solid #e8ebf2", borderRadius: 20, padding: 17, boxShadow: "0 1px 2px rgba(16,24,40,0.04)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#98a2b3" }}>{w.cat}</div>
                  <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 16, lineHeight: 1.35, marginTop: 8 }}>{w.text}</div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 13, background: "#fdeceb", borderRadius: 13, padding: "11px 12px" }}>
                    <IconX color="#c4271b" size={14} strokeWidth={3} />
                    <div style={{ fontSize: 13.5, lineHeight: 1.35, color: "#a62119" }}>
                      <b>La teva:</b> {w.given}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 8, background: "#e7f9f1", borderRadius: 13, padding: "11px 12px" }}>
                    <IconCheck color="#087443" size={14} strokeWidth={3} />
                    <div style={{ fontSize: 13.5, lineHeight: 1.35, color: "#06623a" }}>
                      <b>Correcta:</b> {w.right}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: "#475467", marginTop: 12, paddingLeft: 11, borderLeft: "2px solid #e3e7ef" }}>{w.exp}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
          {screen.examNum && (
            <div onClick={onRepeat} style={{ background: BLUE, color: "#ffffff", borderRadius: 17, padding: 18, textAlign: "center", fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 8px 22px rgba(21,93,252,0.24)" }}>
              Repetir aquest examen
            </div>
          )}
          <div onClick={onHome} style={{ background: "#ffffff", border: "1px solid #e3e7ef", color: "#475467", borderRadius: 17, padding: 18, textAlign: "center", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
            Tornar al menú
          </div>
        </div>
      </div>
    </div>
  );
}
