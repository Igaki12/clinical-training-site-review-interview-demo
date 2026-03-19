import { useEffect, useMemo, useState } from "react";
import { FaHospital } from "react-icons/fa6";
import { hospitals, interviewQuestions } from "./data";
import type { Hospital, InterviewQuestion, ReviewCategory } from "./types";

const API_KEY_STORAGE = "openai-demo-api-key";
const MS_IN_DAY = 1000 * 60 * 60 * 24;

const formatDate = (date: string) => {
  if (!date) {
    return "未更新";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

const daysSince = (date: string) => {
  if (!date) {
    return Number.POSITIVE_INFINITY;
  }

  const diff = Date.now() - new Date(date).getTime();
  return Math.floor(diff / MS_IN_DAY);
};

const isStale = (date: string) => daysSince(date) >= 730;

const categoryStatus = (category: ReviewCategory) => {
  const missingCount = category.fields.filter((field) => field.value === "未入力").length;
  const staleCount = category.fields.filter((field) => isStale(field.updatedAt)).length;

  if (missingCount === category.fields.length) {
    return "empty";
  }
  if (missingCount > 0) {
    return "partial";
  }
  if (staleCount > 0) {
    return "stale";
  }
  return "complete";
};

const interviewPriorityLabel = (question: InterviewQuestion, hospital: Hospital) => {
  const category = hospital.categories.find((item) => item.key === question.category);
  if (!category) {
    return "補完";
  }

  const status = categoryStatus(category);
  if (status === "empty" || status === "partial") {
    return "不足情報";
  }
  if (status === "stale") {
    return "古い情報";
  }
  return "回答数強化";
};

const getHospitalFreshness = (hospital: Hospital) => {
  let missing = 0;
  let stale = 0;
  let populated = 0;

  hospital.categories.forEach((category) => {
    category.fields.forEach((field) => {
      if (field.value === "未入力") {
        missing += 1;
        return;
      }

      populated += 1;
      if (isStale(field.updatedAt)) {
        stale += 1;
      }
    });
  });

  return { missing, stale, populated };
};

const getHospitalQuestions = (hospitalId: string) =>
  interviewQuestions.filter((question) => question.hospitalId === hospitalId);

export default function App() {
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(true);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [savedApiKey, setSavedApiKey] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const storedKey = window.localStorage.getItem(API_KEY_STORAGE) ?? "";
    setSavedApiKey(storedKey);
    setApiKeyInput(storedKey);
    setShowApiKeyModal(true);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 719px)");
    const syncLayout = (event?: MediaQueryListEvent) => {
      setIsMobileLayout(event ? event.matches : mediaQuery.matches);
    };

    syncLayout();
    mediaQuery.addEventListener("change", syncLayout);

    return () => {
      mediaQuery.removeEventListener("change", syncLayout);
    };
  }, []);

  useEffect(() => {
    const shouldLockScroll =
      showApiKeyModal || showInterviewModal || (isMobileLayout && selectedHospitalId !== null);

    const previousOverflow = document.body.style.overflow;

    if (shouldLockScroll) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileLayout, selectedHospitalId, showApiKeyModal, showInterviewModal]);

  const selectedHospital = useMemo(
    () => hospitals.find((hospital) => hospital.id === selectedHospitalId) ?? null,
    [selectedHospitalId],
  );

  const sortedHospitals = useMemo(() => {
    return [...hospitals].sort((left, right) => {
      const leftIsNA = left.rating === 0;
      const rightIsNA = right.rating === 0;

      if (leftIsNA && rightIsNA) {
        return left.name.localeCompare(right.name, "ja");
      }
      if (leftIsNA) {
        return 1;
      }
      if (rightIsNA) {
        return -1;
      }

      return right.rating - left.rating;
    });
  }, []);

  const prioritizedQuestions = useMemo(() => {
    return hospitals
      .flatMap((hospital) =>
        getHospitalQuestions(hospital.id).map((question) => ({
          hospital,
          question,
          priority: interviewPriorityLabel(question, hospital),
        })),
      )
      .sort((left, right) => {
        const rank = (label: string) => {
          switch (label) {
            case "不足情報":
              return 0;
            case "回答数強化":
              return 1;
            case "古い情報":
              return 2;
            default:
              return 3;
          }
        };

        return rank(left.priority) - rank(right.priority);
      });
  }, []);

  const activeInterview = prioritizedQuestions.find((entry) => !answers[entry.question.id]) ?? prioritizedQuestions[0];

  const handleSaveApiKey = () => {
    window.localStorage.setItem(API_KEY_STORAGE, apiKeyInput.trim());
    setSavedApiKey(apiKeyInput.trim());
    setShowApiKeyModal(false);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: answer,
    }));
  };

  const answeredCount = Object.keys(answers).length;
  const progressValue = Math.min(answeredCount, prioritizedQuestions.length);
  const freshness = selectedHospital ? getHospitalFreshness(selectedHospital) : null;
  const selectedHospitalContent =
    selectedHospital && freshness ? (
      <>
        <section className="panel detail-hero">
          <div className="panel-header">
            <div>
              <p className="section-label">Review Summary</p>
              <h2>{selectedHospital.name}</h2>
              <p className="detail-subtitle">
                {selectedHospital.area} / {selectedHospital.nearest}
              </p>
            </div>
            <div className="detail-score-wrap">
              <span className="detail-score-label">総合評価</span>
              <strong>{selectedHospital.rating === 0 ? "未集計" : selectedHospital.rating.toFixed(1)}</strong>
            </div>
          </div>
          <div key={selectedHospital.id} className="callout gradient-wave">
            <span className="callout-label">AI Summary</span>
            <p>{selectedHospital.aiSummary}</p>
          </div>
          <div className="detail-stats">
            <div>
              <span>レビュー数</span>
              <strong>{selectedHospital.reviewCount}</strong>
            </div>
            <div>
              <span>不足項目</span>
              <strong>{freshness.missing}</strong>
            </div>
            <div>
              <span>古い項目</span>
              <strong>{freshness.stale}</strong>
            </div>
            <div>
              <span>入力済み</span>
              <strong>{freshness.populated}</strong>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="section-label">Structured Review</p>
              <h2>構造化データ</h2>
            </div>
            <button className="ghost-button" onClick={() => setShowInterviewModal(true)}>
              補完インタビューを開く
            </button>
          </div>
          <div className="category-grid">
            {selectedHospital.categories.map((category) => {
              const status = categoryStatus(category);
              return (
                <article key={category.key} className="category-card">
                  <div className="category-card-header">
                    <h3>{category.title}</h3>
                    <span className={`pill ${status}`}>
                      {status === "empty"
                        ? "未入力"
                        : status === "partial"
                          ? "一部不足"
                          : status === "stale"
                            ? "更新対象"
                            : "充足"}
                    </span>
                  </div>
                  <div className="field-list">
                    {category.fields.map((field) => (
                      <div key={field.label} className="field-item">
                        <div>
                          <span className="field-label">{field.label}</span>
                          <strong className={field.value === "未入力" ? "muted" : ""}>{field.value}</strong>
                        </div>
                        <div className="field-meta">
                          <span>{formatDate(field.updatedAt)}</span>
                          <span>{field.responses}件</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="section-label">Free Reviews</p>
              <h2>自由記述レビュー</h2>
            </div>
            <span className="pill neutral">{selectedHospital.freeReviews.length} entries</span>
          </div>
          <div className="review-list">
            {selectedHospital.freeReviews.length > 0 ? (
              selectedHospital.freeReviews.map((review) => (
                <article key={`${review.author}-${review.postedAt}`} className="review-card">
                  <div className="review-card-header">
                    <strong>{review.author}</strong>
                    <span>{formatDate(review.postedAt)}</span>
                  </div>
                  <p>{review.body}</p>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <h3>まだレビューがありません</h3>
                <p>初回レビューとインタビュー回答が集まると、この病院の詳細が表示されます。</p>
              </div>
            )}
          </div>
        </section>
      </>
    ) : null;

  return (
    <div className="app-shell">
      <div className="backdrop" />
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Clinical Training Review Demo</p>
          <h1>実習先レビューを、投稿型ではなく更新型にする。</h1>
          <p className="hero-text">
            自由記述レビューに加えて、ログイン時インタビューで不足情報と古い情報を補完する
            GitHub Pages 向けのデモです。
          </p>
        </div>
        <div className="hero-panel">
          <div className="hero-stat">
            <span>登録実習先</span>
            <strong>{hospitals.length}</strong>
          </div>
          <div className="hero-stat">
            <span>補完待ち質問</span>
            <strong>{prioritizedQuestions.length - answeredCount}</strong>
          </div>
          <div className="hero-stat hero-stat-wide">
            <span>ローカル保存キー</span>
            <strong>{savedApiKey ? "設定済み" : "未設定"}</strong>
          </div>
          <button className="secondary-button" onClick={() => setShowApiKeyModal(true)}>
            OpenAI API Key を設定
          </button>
        </div>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <div className="panel panel-tight">
            <div className="panel-header">
              <div>
                <p className="section-label">Search</p>
                <h2>実習先一覧</h2>
              </div>
              <span className="pill neutral">3 Hospitals</span>
            </div>
            <input
              className="search-input"
              type="text"
              value="教育熱心 / 駅近 / レビュー充実"
              readOnly
              aria-label="検索キーワード"
            />
            <div className="tag-row">
              <span className="filter-chip active">全件</span>
              <span className="filter-chip">不足情報あり</span>
              <span className="filter-chip">更新対象あり</span>
            </div>
          </div>

          <div className="hospital-list">
            {sortedHospitals.map((hospital) => {
              const info = getHospitalFreshness(hospital);
              const selected = hospital.id === selectedHospital?.id;
              return (
                <button
                  key={hospital.id}
                  className={`hospital-card ${selected ? "selected" : ""}`}
                  onClick={() => setSelectedHospitalId(hospital.id)}
                >
                  <div className="hospital-card-top">
                    <div className="hospital-title-wrap">
                      <span className="hospital-icon" aria-hidden="true">
                        <FaHospital />
                      </span>
                      <div>
                        <p className="hospital-area">{hospital.area}</p>
                        <h3>{hospital.name}</h3>
                      </div>
                    </div>
                    <span className={`score-badge ${hospital.rating === 0 ? "empty" : ""}`}>
                      {hospital.rating === 0 ? "N/A" : hospital.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="hospital-meta">{hospital.nearest}</p>
                  <div className="tag-row compact">
                    {hospital.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="summary-snippet">{hospital.aiSummary}</p>
                  <div className="metrics-row">
                    <span>不足 {info.missing}</span>
                    <span>古い {info.stale}</span>
                    <span>回答 {hospital.reviewCount}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {!isMobileLayout ? (
          <section className="content">
            <div className="content-grid">
              {selectedHospitalContent ?? (
                <section className="panel detail-hero empty-selection">
                  <p className="section-label">Getting Started</p>
                  <h2>実習先を選択して、詳細を確認しよう</h2>
                  <p className="detail-subtitle">
                    左の一覧から病院を選ぶと、構造化レビュー、AI要約、自由記述レビューを表示します。
                  </p>
                </section>
              )}
            </div>
          </section>
        ) : null}
      </main>

      {isMobileLayout && selectedHospital && freshness ? (
        <div className="modal-scrim detail-modal-scrim" role="presentation">
          <div
            className="modal detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-modal-title"
          >
            <div className="modal-header">
              <div>
                <p className="section-label">Hospital Detail</p>
                <h2 id="detail-modal-title">{selectedHospital.name}</h2>
              </div>
              <button className="close-button" onClick={() => setSelectedHospitalId(null)} aria-label="閉じる">
                ×
              </button>
            </div>
            <div className="content-grid detail-modal-content">{selectedHospitalContent}</div>
          </div>
        </div>
      ) : null}

      {showInterviewModal && activeInterview ? (
        <div className="modal-scrim" role="presentation">
          <div className="modal interview-modal" role="dialog" aria-modal="true" aria-labelledby="interview-title">
            <div className="modal-header">
              <div>
                <p className="section-label">Interview Gate</p>
                <h2 id="interview-title">レビューを見る前に、30秒だけ協力してください</h2>
              </div>
              <button className="close-button" onClick={() => setShowInterviewModal(false)} aria-label="閉じる">
                ×
              </button>
            </div>
            <div className="progress-row">
              <span>{progressValue} / {prioritizedQuestions.length}</span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(progressValue / prioritizedQuestions.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="interview-meta">
              <span className="pill warning">{activeInterview.priority}</span>
              <strong>{activeInterview.hospital.name}</strong>
            </div>
            <h3 className="question-text">{activeInterview.question.prompt}</h3>
            <p className="question-help">{activeInterview.question.helpText}</p>
            <div className="option-grid">
              {activeInterview.question.options.map((option) => (
                <button
                  key={option}
                  className={`option-button ${answers[activeInterview.question.id] === option ? "selected" : ""}`}
                  onClick={() => handleAnswer(activeInterview.question.id, option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="modal-footer">
              <p>回答するとレビュー閲覧できます</p>
              <div className="modal-actions">
                <button className="primary-button" onClick={() => setShowInterviewModal(false)}>
                  回答してレビューを見る
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showApiKeyModal ? (
        <div className="modal-scrim" role="presentation">
          <div className="modal api-modal" role="dialog" aria-modal="true" aria-labelledby="api-title">
            <div className="modal-header">
              <div>
                <p className="section-label">Local Key Storage</p>
                <h2 id="api-title">OpenAI API Key</h2>
              </div>
            </div>
            <p className="modal-copy">
              この demo では API キーをブラウザの `localStorage` にのみ保存します。キーはこの画面から自動でネットワーク送信されません。
            </p>
            <label className="input-label" htmlFor="api-key-input">
              キーを保存
            </label>
            <input
              id="api-key-input"
              className="text-input"
              type="password"
              value={apiKeyInput}
              onChange={(event) => setApiKeyInput(event.target.value)}
              placeholder="sk-..."
            />
            <div className="saved-key-row">
              <span>現在の保存状態</span>
              <strong>{savedApiKey ? "この端末に保存済み" : "未保存"}</strong>
            </div>
            <div className="modal-footer">
              <div className="modal-actions">
                <button className="ghost-button" onClick={() => setShowApiKeyModal(false)}>
                  あとで設定
                </button>
                <button className="primary-button" onClick={handleSaveApiKey}>
                  保存する
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
