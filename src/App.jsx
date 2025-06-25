// src/App.jsx
import { useState } from "react";
import {
  transposeChordLine,
  detectChords,
  mergeChordsIntoLyrics,
  generateSeparatedChordLyricsPreview,
} from "./utils";
import "./App.css";

export default function App() {
  const [rawInput, setRawInput] = useState("");
  const [showInlineChords, setShowInlineChords] = useState(false);
  const [transposeAmount, setTransposeAmount] = useState(0);
  const [useNbsp, setUseNbsp] = useState(false);

  const lines = rawInput.split("\n").map((line) =>
    useNbsp && line.trim() !== ""
      ? "\u00A0" + line.replace(/^\s+/, "")
      : line
  );

  const editorPreview = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isChordLine = detectChords(line);
    const nextLine = lines[i + 1] ?? "";
    const isNextLyric = !detectChords(nextLine);

    if (isChordLine && isNextLyric) {
      const chordLine = transposeChordLine(line, transposeAmount);
      const lyricsLine = nextLine;
      const output = showInlineChords
        ? mergeChordsIntoLyrics(chordLine, lyricsLine)
        : (
            <>
              <span className="chords">{chordLine}</span>
              <br />
              <span>{lyricsLine}</span>
            </>
          );

      editorPreview.push(<div key={`pair-${i}`}>{output}</div>);
      i++; // Skip next line
    } else if (isChordLine) {
      const chordLine = transposeChordLine(line, transposeAmount);
      editorPreview.push(
        <div key={`chord-${i}`}>
          <span className="chords">{chordLine}</span>
        </div>
      );
    } else {
      editorPreview.push(<div key={`line-${i}`}>{line}</div>);
    }
  }

  const lyricsPanelPreview = generateSeparatedChordLyricsPreview(
    lines,
    transposeAmount
  );

  return (
    <div className="app">
      <h1>🎸 LRC Akkord Editor</h1>

      <div className="controls">
        <label>
          <input
            type="checkbox"
            checked={showInlineChords}
            onChange={(e) => setShowInlineChords(e.target.checked)}
          />
          Akkorde inline anzeigen (im Editor)
        </label>

        <label>
          <input
            type="checkbox"
            checked={useNbsp}
            onChange={(e) => setUseNbsp(e.target.checked)}
          />
          NBSP am Zeilenanfang
        </label>

        <label>
          Transponieren:
          <select
            value={transposeAmount}
            onChange={(e) => setTransposeAmount(parseInt(e.target.value))}
          >
            {Array.from({ length: 13 }, (_, i) => i - 6).map((v) => (
              <option key={v} value={v}>
                {v > 0 ? "+" + v : v}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={() => {
            navigator.clipboard.writeText(lyricsPanelPreview);
            alert("🎵 Lyrics Panel Format kopiert!");
          }}
        >
          🎵 Kopieren für Lyrics Panel
        </button>
      </div>

      <h2>Editor</h2>
      <textarea
        rows="15"
        value={rawInput}
        onChange={(e) => setRawInput(e.target.value)}
        placeholder="Füge hier deinen LRC-Text ein..."
      />

      <h2>Vorschau</h2>
      <div className="output">{editorPreview}</div>

      <h2>Lyrics Panel Format</h2>
      <pre className="lyrics-preview">{lyricsPanelPreview}</pre>
    </div>
  );
}
