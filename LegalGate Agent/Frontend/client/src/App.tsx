import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import AgentTimeline from "./components/AgentTimeline";
import OverallRiskCard from "./components/OverallRiskCard";
import RevisionSuggestions from "./components/RevisionSuggestions";
import ApprovalFlowCard from "./components/ApprovalFlowCard";
import EmptyState from "./components/EmptyState";
import LoadingOverlay from "./components/LoadingOverlay";
import {
  analyzeDriveDemo,
  analyzeFile,
  analyzeSample,
  approveAnalysis,
  fetchAnalyses
} from "./services/apiClient";
import type {
  AgentStep,
  AnalysisResult,
  AnalysisStatus,
  RiskLevel
} from "./types";

const AGENT_STEP_LABELS = [
  "ファイルを受け付けています",
  "契約書の本文を読み取っています",
  "Gemini APIでリスクを分析しています",
  "社内ルールと照合しています",
  "リスクレベルを判定しています",
  "改善案を整理しています",
  "Firestoreに分析結果を保存しています",
  "画面表示用の結果を準備しています",
  "解析が完了しました"
];

const STEP_INTERVAL_MS = 650;

function initialSteps(): AgentStep[] {
  return AGENT_STEP_LABELS.map((label, i) => ({
    label,
    status: i === 0 ? "running" : "waiting"
  }));
}

function mergeHistory(current: AnalysisResult[], next: AnalysisResult): AnalysisResult[] {
  return [next, ...current.filter((item) => item.id !== next.id)].slice(0, 20);
}

export default function App() {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [approving, setApproving] = useState(false);

  const timerRef = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const loadHistory = useCallback(async () => {
    const items = await fetchAnalyses();
    console.log("[app] history loaded", {
      count: items.length,
      ids: items.map((item) => item.analysisId || item.id)
    });
    setHistory(items);
    setHistoryError(null);
    return items;
  }, []);

  const startTimeline = useCallback(() => {
    stopTimer();
    setSteps(initialSteps());
    let current = 0;
    timerRef.current = window.setInterval(() => {
      current += 1;
      if (current > AGENT_STEP_LABELS.length - 2) {
        stopTimer();
        return;
      }
      setSteps((prev) =>
        prev.map((step, i) => {
          if (i < current) return { ...step, status: "completed" };
          if (i === current) return { ...step, status: "running" };
          return step;
        })
      );
    }, STEP_INTERVAL_MS);
  }, [stopTimer]);

  useEffect(() => {
    let active = true;

    loadHistory().catch((err) => {
      console.error("Failed to load analysis history", err);
      if (!active) return;
      setHistoryError(
        err instanceof Error ? err.message : "過去の分析履歴を取得できませんでした。"
      );
    });

    return () => {
      active = false;
      stopTimer();
    };
  }, [loadHistory, stopTimer]);

  const runAnalysis = useCallback(
    async (runner: () => Promise<AnalysisResult>) => {
      setError(null);
      setApproving(false);
      setResult(null);
      setStatus("analyzing");
      startTimeline();

      try {
        const data = await runner();
        stopTimer();
        setSteps([]);
        setResult(data);
        setStatus("completed");

        try {
          await loadHistory();
        } catch (historyErr) {
          console.error("Failed to refresh analysis history", historyErr);
          setHistory((prev) => mergeHistory(prev, data));
          setHistoryError(
            historyErr instanceof Error
              ? historyErr.message
              : "過去の分析履歴を更新できませんでした。"
          );
        }
      } catch (err) {
        console.error("Analysis failed", err);
        stopTimer();
        setSteps([]);
        setResult(null);
        setStatus("error");
        setError(
          err instanceof Error
            ? err.message
            : "解析に失敗しました。APIキー、利用上限、通信状態を確認してください。"
        );
      }
    },
    [loadHistory, startTimeline, stopTimer]
  );

  const handleAnalyzeFile = useCallback(
    (file: File) => runAnalysis(() => analyzeFile(file)),
    [runAnalysis]
  );

  const handleSample = useCallback(
    (level: RiskLevel) => runAnalysis(() => analyzeSample(level)),
    [runAnalysis]
  );

  const handleDriveDemo = useCallback(
    () => runAnalysis(() => analyzeDriveDemo()),
    [runAnalysis]
  );

  const handleSelectHistory = useCallback(
    (id: string) => {
      const entry = history.find((h) => h.id === id);
      if (!entry) return;
      stopTimer();
      setError(null);
      setApproving(false);
      setResult(entry);
      setSteps([]);
      setStatus("completed");
    },
    [history, stopTimer]
  );

  const handleApprove = useCallback(async () => {
    if (!result?.analysisId || approving) return;

    setApproving(true);
    setError(null);

    try {
      const approved = await approveAnalysis(result.analysisId);
      const updateStatus = (item: AnalysisResult): AnalysisResult =>
        item.id === result.id || item.analysisId === approved.analysisId
          ? { ...item, saveStatus: approved.status }
          : item;

      setResult((current) => (current ? updateStatus(current) : current));
      setHistory((prev) => prev.map(updateStatus));
      await loadHistory();
    } catch (err) {
      console.error("Failed to approve analysis", err);
      setError(
        err instanceof Error ? err.message : "分析結果の承認に失敗しました。"
      );
    } finally {
      setApproving(false);
    }
  }, [approving, loadHistory, result]);

  const isAnalyzing = status === "analyzing";

  return (
    <div className="app">
      <Header status={status} overallRisk={result?.overallRisk} />

      <div className="layout">
        <Sidebar
          disabled={isAnalyzing}
          history={history}
          historyError={historyError}
          activeId={result?.id}
          onAnalyzeFile={handleAnalyzeFile}
          onSample={handleSample}
          onDriveDemo={handleDriveDemo}
          onSelectHistory={handleSelectHistory}
        />

        <main className="main">
          {status === "idle" && <EmptyState />}

          {status === "error" && (
            <section className="card error-card">
              <div className="error-card__icon" aria-hidden>
                !
              </div>
              <div>
                <h2 className="error-card__title">解析に失敗しました</h2>
                <p className="error-card__text">{error}</p>
              </div>
            </section>
          )}

          {isAnalyzing && steps.length > 0 && <AgentTimeline steps={steps} />}

          {status === "completed" && result && (
            <>
              {result.saved && (
                <div className="saved-notice">
                  Firestoreに保存済み
                  {result.saveStatus ? `（ステータス: ${result.saveStatus}）` : ""}
                </div>
              )}
              <OverallRiskCard result={result} />
              <RevisionSuggestions suggestions={result.revisionSuggestions} />
              <ApprovalFlowCard
                approvalFlow={result.approvalFlow}
                status={result.saveStatus}
                approving={approving}
                onApprove={result.analysisId ? handleApprove : undefined}
              />
            </>
          )}

          <p className="disclaimer">
            本判定はAIによる一次チェックです。最終判断は法務担当者または承認者が行ってください。
          </p>
        </main>
      </div>

      <LoadingOverlay visible={isAnalyzing} />
    </div>
  );
}
