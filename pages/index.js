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
  failedIds: [], // ids únics de preguntes fallades
  inProgress: {}, // {"3": {qIndex, answers}} o {"review": {ids, qIndex, answers}}
};

export default function Home() {
  const [state, setState] = useState(null); // null mentre carrega
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
        <div style={{ padding: "60px 0", textAlign: "center", color: "#5b6a86" }}>
          Carregant l&apos;autoescola…
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
          // Desa el punt exacte on estava (pregunta actual i respostes donades)
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
   Construcció de pantalles d'examen
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
    title: "Repàs de falles",
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
        <div className="badge">
          <div className="top">AUTOESCOLA</div>
          <div className="mid">MANEL</div>
          <div className="sub">TEÒRIC B</div>
        </div>
        <div className="welcome">
          Hola, <strong>Ares</strong> <span className="nickname">Suricata</span> — has dit que ja
          estàs preparada, doncs som-hi. Deu examens de 30 preguntes, com el de veritat: no sabràs
          si has aprovat fins que no l&apos;acabis.
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="n">
            {passed}/{total}
          </div>
          <div className="l">Examens aprovats</div>
        </div>
        <div className="stat">
          <div className="n">
            {done}/{total}
          </div>
          <div className="l">Examens fets</div>
        </div>
        <div className="stat">
          <div className="n">{failedCount}</div>
          <div className="l">Preguntes al repàs</div>
        </div>
      </div>

      <div className="section-title">Examens</div>
      <div className="tiles">
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
          const r = state.examResults[n];
          const inProg = state.inProgress && state.inProgress[String(n)];
          let cls = "pending",
            label = "Pendent";
          if (inProg) {
            cls = "progress";
            label = `En curs · ${inProg.qIndex + 1}/30`;
          } else if (r && r.done) {
            cls = r.pass ? "pass" : "fail";
            label = r.pass ? `Aprovat · ${r.score}/30` : `Suspès · ${r.score}/30`;
          }
          return (
            <div
              key={n}
              className={`tile ${cls}`}
              onClick={() => (inProg ? onResume(String(n)) : onStart(n))}
            >
              <div className="num">{String(n).padStart(2, "0")}</div>
              <div className="lbl">Examen</div>
              <div className={`st ${cls}`}>{label}</div>
            </div>
          );
        })}
      </div>

      <div className="section-title">Repàs de falles</div>
      <div className="repas-box">
        {failedCount === 0 && !reviewInProgress && (
          <button className="repas-btn" disabled>
            <span className="tri"></span>
            <span className="txt">
              <strong>Repàs de preguntes fallades</strong>
              <span>Encara no tens cap pregunta fallada. Comença un examen!</span>
            </span>
          </button>
        )}
        {reviewInProgress && (
          <button className="repas-btn" onClick={() => onResume("review")}>
            <span className="tri"></span>
            <span className="txt">
              <strong>Repàs en curs · {reviewInProgress.qIndex + 1}/{reviewInProgress.ids.length}</strong>
              <span>Continua per on ho vas deixar</span>
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
                <span className="tri"></span>
                <span className="txt">
                  <strong>
                    Repàs {reviewChunks > 1 ? `${c + 1} · ` : ""}
                    {n} preguntes fallades
                  </strong>
                  <span>Preguntes que has fallat en examens anteriors</span>
                </span>
              </button>
            );
          })}
      </div>

      <footer>
        {saveOk
          ? "El teu progrés es desa automàticament."
          : "Avís: no s'ha pogut desar el progrés ara mateix; comprova la connexió."}
      </footer>
    </div>
  );
}

/* =========================================================
   Pantalla d'examen
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
          Pregunta {screen.qIndex + 1}/{total}
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
              <span className="letter">{String.fromCharCode(65 + i)}</span>
              <span>{opt}</span>
            </div>
          ))}
        </div>
        <div className="exam-actions">
          <span className="quit" onClick={onQuit}>
            Sortir i continuar més tard
          </span>
          <div style={{ display: "flex", gap: "10px" }}>
            {screen.qIndex > 0 && (
              <button className="btn secondary" onClick={onBack}>
                ← Enrere
              </button>
            )}
            <button className="btn" disabled={!answered} onClick={onNext}>
              {screen.qIndex === total - 1 ? "Finalitzar examen" : "Següent →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Pantalla de resultat
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
        <div className={`stamp ${pass ? "pass" : "fail"}`}>{pass ? "APROVAT" : "SUSPÈS"}</div>
        <div className="score-line">
          <b>
            {correct}/{total}
          </b>{" "}
          respostes correctes
        </div>
        <div className="allowed-line">
          Es permeten fins a {allowed} {allowed === 1 ? "error" : "errors"} per aprovar (com al
          real).
        </div>
        <div className="result-actions">
          <button className="btn" onClick={onHome}>
            Tornar al menú
          </button>
          {screen.examNum && (
            <button className="btn secondary" onClick={onRepeat}>
              Repetir aquest examen
            </button>
          )}
        </div>
      </div>
      <div className="section-title">Repàs de la ronda</div>
      {wrongItems.length === 0 && <p style={{ color: "#5b6a86" }}>Cap error. Ronda perfecta! 🎯</p>}
      {wrongItems.map(({ item, given }, i) => (
        <div className="review-item" key={i}>
          <div className="rq">{item.text}</div>
          <div className="ra wrong">
            La teva resposta: {given !== undefined ? item.options[given] : "(sense contestar)"}
          </div>
          <div className="ra right">Resposta correcta: {item.options[item.correct]}</div>
          <div className="exp">{item.exp}</div>
        </div>
      ))}
    </div>
  );
}
