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

  const lines = rawInput.split("\n");
  const output = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const isChordLine = detectChords(line);
  const nextLine = lines[i + 1];
  const hasNextLine = nextLine !== undefined;

  if (isChordLine && hasNextLine && !detectChords(nextLine)) {
    // Fall 1: Akkord + Textzeile
    const chordLine = transposeChordLine(line, transposeAmount);
    const lyricsLine = nextLine;

    if (showInlineChords) {
      output.push(<div key={i}>{mergeChordsIntoLyrics(chordLine, lyricsLine)}</div>);
    } else {
      output.push(
        <div key={i}>
          <span className="chords">{chordLine}</span>
          <br />
          <span>{lyricsLine}</span>
        </div>
      );
    }
    i++; // skip next line
  } else if (isChordLine) {
    // Fall 2: Akkordzeile ohne Textzeile
    const chordLine = transposeChordLine(line, transposeAmount);
    output.push(
      <div key={i}>
        <span className="chords">{chordLine}</span>
      </div>
    );
  } else {
    // Fall 3: Nur Textzeile oder sonstiger Inhalt
    output.push(<div key={i}>{line}</div>);
  }
}


  // Vorschau-Text im Lyrics-Panel-Format
  const lyricsPanelPreview = generateSeparatedChordLyricsPreview(
    lines,
    transposeAmount
  );

  return (
    <div className="app">
      <h1>🎸 LRC Akkord Editor</h1>
      <textarea
        rows="15"
        value={rawInput}
        onChange={(e) => setRawInput(e.target.value)}
        placeholder="Füge hier deinen LRC-Text ein..."
      />
      <div className="controls">
        <label>
          <input
            type="checkbox"
            checked={showInlineChords}
            onChange={(e) => setShowInlineChords(e.target.checked)}
          />
          Akkorde inline anzeigen
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
            alert("🎵 Lyrics-Panel-Format in Zwischenablage kopiert!");
          }}
        >
          🎵 Kopieren für Lyrics Panel
        </button>
      </div>
      <h2>Vorschau</h2>
      <div className="output">{output}</div>

      <h2>Lyrics Panel Format</h2>
      <pre className="lyrics-preview">{lyricsPanelPreview}</pre>
    </div>
  );
}
