import { useEffect, useRef, useState } from "react";
import {
  CATS,
  buildExamIds,
  buildExamQuestions,
  reviewChunkIds,
  passThreshold,
} from "../lib/questions";

const EMPTY_STATE = {
  examResults: {}, // {1:{done:true,score:27,pass:true}, ...}
  failedIds: [], // ids únicos de preguntas falladas
  inProgress: {}, // {"3": {qIndex, answers}} o {"review": {ids, qIndex, answers}}
};

/* =========================================================
   Iconos (SVG en línea, sin dependencias externas)
   ========================================================= */
const IconWheel = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="2.4" stroke="white" strokeWidth="1.8" />
    <path d="M12 3v6.6M12 14.4V21M4.2 8l5.7 3.3M20 16l-5.7-3.3M4.2 16l5.7-3.3M20 8l-5.7 3.3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const IconCheck = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconX = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);
const IconClock = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconAlert = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3l10 18H2L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="17" r="1" fill="currentColor" />
  </svg>
);
const IconChevron = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconLogout = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Home() {
  const [state, setState] = useState(null); // null mientras carga
  const [saveOk, setSaveOk] = useState(true);
  const [screen, setScreen] = useState({ name: "home" });
  const stateRef = useRef(null);
  stateRef.current = state;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/state");
        const json = await res.json();
        setState(json.data || EMPTY_STATE);
      } catch (e) {
        console.error(e);
        setState(EMPTY_STATE);
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

  if (!state) {
    return (
      <div className="app">
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--ink-soft)" }}>
          Cargando la autoescuela…
        </div>
      </div>
    );
  }

  if (screen.name === "home") {
    return (
      <Home_
        state={state}
        saveOk={saveOk}
        onStart={(examNum) => setScreen(startExamScreen(state, examNum))}
        onResume={(key) => setScreen(resumeScreen(state, key))}
        onStartReview={(chunkIndex) => setScreen(startReviewScreen(state, chunkIndex))}
      />
    );
  }

  if (screen.name === "exam") {
    return (
      <ExamScreen
        screen={screen}
        onAnswer={(qIndex, optIndex) => {
          const next = { ...screen, answers: { ...screen.answers, [qIndex]: optIndex } };
          setScreen(next);
        }}
        onBack={() => setScreen({ ...screen, qIndex: screen.qIndex - 1 })}
        onNext={async () => {
          if (screen.qIndex < screen.exam.length - 1) {
            setScreen({ ...screen, qIndex: screen.qIndex + 1 });
          } else {
            await finishExam(screen, state, persist, setScreen);
          }
        }}
        onQuit={async () => {
          const next = { ...state };
          next.inProgress = { ...next.inProgress };
          next.inProgress[screen.key] = {
            examNum: screen.examNum,
            ids: screen.ids,
            title: screen.title,
            qIndex: screen.qIndex,
            answers: screen.answers,
          };
          await persist(next);
          setScreen({ name: "home" });
        }}
      />
    );
  }

  if (screen.name === "result") {
    return (
      <ResultScreen
        screen={screen}
        onHome={() => setScreen({ name: "home" })}
        onRepeat={() => setScreen(startExamScreen(state, screen.examNum))}
      />
    );
  }

  return null;
}

/* =========================================================
   Construcción de pantallas de examen
   ========================================================= */
function startExamScreen(state, examNum) {
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
  };
}

function startReviewScreen(state, chunkIndex) {
  const ids = reviewChunkIds(state.failedIds, chunkIndex);
  const exam = buildExamQuestions(ids, 9000 + chunkIndex);
  return {
    name: "exam",
    key: "review",
    examNum: null,
    ids,
    title: "Repaso de fallos",
    exam,
    qIndex: 0,
    answers: {},
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
    qIndex: saved.qIndex,
    answers: saved.answers,
  };
}

async function finishExam(screen, state, persist, setScreen) {
  const ex = screen.exam;
  const total = ex.length;
  let correct = 0;
  const next = {
    ...state,
    failedIds: [...state.failedIds],
    examResults: { ...state.examResults },
    inProgress: { ...state.inProgress },
  };
  ex.forEach((item, i) => {
    if (screen.answers[i] === item.correct) {
      correct++;
      const pos = next.failedIds.indexOf(item.idx);
      if (pos !== -1) next.failedIds.splice(pos, 1);
    } else if (!next.failedIds.includes(item.idx)) {
      next.failedIds.push(item.idx);
    }
  });
  const errors = total - correct;
  const pass = errors <= passThreshold(total);
  if (screen.examNum) {
    next.examResults[screen.examNum] = { done: true, score: correct, pass };
  }
  delete next.inProgress[screen.key];
  await persist(next);
  setScreen({ name: "result", exam: ex, answers: screen.answers, examNum: screen.examNum });
}

/* =========================================================
   Pantalla principal (menú)
   ========================================================= */
function Home_({ state, saveOk, onStart, onResume, onStartReview }) {
  const total = 10;
  let passed = 0,
    done = 0;
  for (let i = 1; i <= total; i++) {
    const r = state.examResults[i];
    if (r && r.done) {
      done++;
      if (r.pass) passed++;
    }
  }
  const failedCount = state.failedIds.length;
  const reviewChunks = Math.ceil(failedCount / 30) || 0;
  const reviewInProgress = state.inProgress && state.inProgress["review"];

  return (
    <div className="app">
      <div className="hero">
        <div className="hero-top">
          <div className="hero-icon">
            <IconWheel />
          </div>
          <div className="hero-brand">
            <div className="k">Autoescuela</div>
            <div className="v">Manel · Teórico B</div>
          </div>
        </div>
        <div className="hero-welcome">
          Hola, <strong>Ares</strong> <span className="nickname">Suricata</span> — has dicho que
          ya estás preparada, pues vamos allá. Diez exámenes de 30 preguntas, como el de verdad:
          no sabrás si has aprobado hasta que no lo termines.
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="n">
            {passed}/{total}
          </div>
          <div className="l">Aprobados</div>
        </div>
        <div className="stat">
          <div className="n">
            {done}/{total}
          </div>
          <div className="l">Realizados</div>
        </div>
        <div className="stat">
          <div className="n">{failedCount}</div>
          <div className="l">En repaso</div>
        </div>
      </div>

      <div className="section-title">Exámenes</div>
      <div className="tiles">
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
          const r = state.examResults[n];
          const inProg = state.inProgress && state.inProgress[String(n)];
          let cls = "pending",
            label = "Pendiente",
            icon = null;
          if (inProg) {
            cls = "progress";
            label = `Pregunta ${inProg.qIndex + 1}/30`;
            icon = <IconClock />;
          } else if (r && r.done) {
            cls = r.pass ? "pass" : "fail";
            label = r.pass ? `Aprobado · ${r.score}/30` : `Suspenso · ${r.score}/30`;
            icon = r.pass ? <IconCheck /> : <IconX />;
          }
          return (
            <div
              key={n}
              className={`tile ${cls}`}
              onClick={() => (inProg ? onResume(String(n)) : onStart(n))}
            >
              <div className="tile-top">
                <div className="num">{String(n).padStart(2, "0")}</div>
                <div className={`status-dot ${cls}`}>{icon}</div>
              </div>
              <div className="lbl">Examen</div>
              <div className="st">{label}</div>
            </div>
          );
        })}
      </div>

      <div className="section-title">Repaso de fallos</div>
      <div className="repas-box">
        {failedCount === 0 && !reviewInProgress && (
          <button className="repas-btn" disabled>
            <span className="repas-icon">
              <IconAlert />
            </span>
            <span className="txt">
              <strong>Repaso de preguntas falladas</strong>
              <span>Todavía no tienes ninguna pregunta fallada. ¡Empieza un examen!</span>
            </span>
          </button>
        )}
        {reviewInProgress && (
          <button className="repas-btn" onClick={() => onResume("review")}>
            <span className="repas-icon">
              <IconClock />
            </span>
            <span className="txt">
              <strong>
                Repaso en curso · {reviewInProgress.qIndex + 1}/{reviewInProgress.ids.length}
              </strong>
              <span>Continúa donde lo dejaste</span>
            </span>
            <span className="chev">
              <IconChevron />
            </span>
          </button>
        )}
        {!reviewInProgress &&
          failedCount > 0 &&
          Array.from({ length: reviewChunks }, (_, c) => c).map((c) => {
            const from = c * 30,
              to = Math.min(failedCount, from + 30);
            const n = to - from;
            return (
              <button className="repas-btn" key={c} onClick={() => onStartReview(c)}>
                <span className="repas-icon">
                  <IconAlert />
                </span>
                <span className="txt">
                  <strong>
                    Repaso {reviewChunks > 1 ? `${c + 1} · ` : ""}
                    {n} preguntas falladas
                  </strong>
                  <span>Preguntas que has fallado en exámenes anteriores</span>
                </span>
                <span className="chev">
                  <IconChevron />
                </span>
              </button>
            );
          })}
      </div>

      <footer>
        {saveOk
          ? "Tu progreso se guarda automáticamente."
          : "Aviso: no se ha podido guardar el progreso ahora mismo; comprueba la conexión."}
      </footer>
    </div>
  );
}

/* =========================================================
   Pantalla de examen
   ========================================================= */
function ExamScreen({ screen, onAnswer, onBack, onNext, onQuit }) {
  const item = screen.exam[screen.qIndex];
  const total = screen.exam.length;
  const answered = screen.answers[screen.qIndex] !== undefined;
  const pct = Math.round((screen.qIndex / total) * 100);

  return (
    <div className="app">
      <div className="exam-topbar">
        <div className="title">{screen.title}</div>
        <div className="prog">
          {screen.qIndex + 1}/{total}
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: pct + "%" }}></div>
      </div>
      <div className="exam-body">
        <div className="cat-tag">{CATS[item.cat] || ""}</div>
        <div className="question-text">{item.text}</div>
        <div className="options">
          {item.options.map((opt, i) => (
            <div
              key={i}
              className={`opt ${screen.answers[screen.qIndex] === i ? "selected" : ""}`}
              onClick={() => onAnswer(screen.qIndex, i)}
            >
              <span className="radio"></span>
              <span>{opt}</span>
            </div>
          ))}
        </div>
        <div className="exam-actions">
          <span className="quit" onClick={onQuit}>
            <IconLogout /> Salir y continuar más tarde
          </span>
          <div className="right-actions">
            {screen.qIndex > 0 && (
              <button className="btn secondary" onClick={onBack}>
                <IconArrowLeft /> Atrás
              </button>
            )}
            <button className="btn" disabled={!answered} onClick={onNext}>
              {screen.qIndex === total - 1 ? "Finalizar examen" : "Siguiente"}
              {screen.qIndex !== total - 1 && <IconChevron />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Pantalla de resultado
   ========================================================= */
function ResultScreen({ screen, onHome, onRepeat }) {
  const ex = screen.exam;
  const total = ex.length;
  let correct = 0;
  const wrongItems = [];
  ex.forEach((item, i) => {
    if (screen.answers[i] === item.correct) correct++;
    else wrongItems.push({ item, given: screen.answers[i] });
  });
  const errors = total - correct;
  const allowed = passThreshold(total);
  const pass = errors <= allowed;

  return (
    <div className="app">
      <div className="result-wrap">
        <div className={`result-badge ${pass ? "pass" : "fail"}`}>
          {pass ? <IconCheck size={40} /> : <IconX size={40} />}
        </div>
        <div className={`result-title ${pass ? "pass" : "fail"}`}>
          {pass ? "¡Aprobado!" : "Suspenso"}
        </div>
        <div className="score-line">
          <b>
            {correct}/{total}
          </b>{" "}
          respuestas correctas
        </div>
        <div className="allowed-line">
          Se permiten hasta {allowed} {allowed === 1 ? "error" : "errores"} para aprobar (como en
          el real).
        </div>
        <div className="result-actions">
          <button className="btn" onClick={onHome}>
            Volver al menú
          </button>
          {screen.examNum && (
            <button className="btn secondary" onClick={onRepeat}>
              Repetir este examen
            </button>
          )}
        </div>
      </div>
      <div className="section-title">Repaso de la ronda</div>
      {wrongItems.length === 0 && (
        <p style={{ color: "var(--ink-soft)" }}>Ningún error. ¡Ronda perfecta! 🎯</p>
      )}
      {wrongItems.map(({ item, given }, i) => (
        <div className="review-item" key={i}>
          <div className="rq">{item.text}</div>
          <div className="ra wrong">
            <IconX size={13} /> Tu respuesta:{" "}
            {given !== undefined ? item.options[given] : "(sin contestar)"}
          </div>
          <div className="ra right">
            <IconCheck size={13} /> Respuesta correcta: {item.options[item.correct]}
          </div>
          <div className="exp">{item.exp}</div>
        </div>
      ))}
    </div>
  );
}
