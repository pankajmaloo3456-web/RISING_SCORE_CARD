// src/ScoringPage.js
import React from "react";
import "./App.css"; // styles for the scoring page

export default function ScoringPage() {
  return (
    <div className="scoring-root">
      <header className="scoring-header">
        <span className="logo-emoji">🏏</span>
        <div className="title">Cricket Scoring</div>
      </header>

      <main className="scoring-main">
        <section className="summary-grid">
          <div className="card">
            <h3 className="card-title">Runs</h3>
            <div className="card-value">0</div>
          </div>

          <div className="card">
            <h3 className="card-title">Wickets</h3>
            <div className="card-value">0</div>
          </div>

          <div className="card">
            <h3 className="card-title">Overs</h3>
            <div className="card-value">0.0</div>
          </div>
        </section>

        <section className="scoring-panel">
          <h3 className="panel-title">Scoring Panel</h3>
          <div className="runs-grid">
            <button className="run-btn">0</button>
            <button className="run-btn">1</button>
            <button className="run-btn">2</button>
            <button className="run-btn">3</button>
            <button className="run-btn">4</button>
            <button className="run-btn">6</button>
          </div>
        </section>
      </main>

      <footer className="scoring-footer">
        <small>Cricket Scoring • Minimal skeleton (plain CSS)</small>
      </footer>
    </div>
  );
}
