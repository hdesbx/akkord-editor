import React, { useState } from "react";
import "./App.css";

function App() {
  const [content, setContent] = useState(
    "NC  E7         A\n" +
      "Ooh willkommen willkommen willkommen\n" +
      "    E       A\n" +
      "Sonnenschein",
  );

  const [inlineMode, setInlineMode] = useState(false);
  const [transposeAmount, setTransposeAmount] = useState(0);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  // -----------------------------
  // 🔁 TRANSPOSE
  // -----------------------------
  const transposeChords = (amount) => {
    const transposed = content.replace(/\(([^(]*)\)/g, (match, chord) => {
      if (chord === "NC") return match;
      return `(${transposeChord(chord, amount)})`;
    });

    setContent(transposed);
    setTransposeAmount(transposeAmount + amount);
  };

  // -----------------------------
  // 🔁 TOGGLE DISPLAY MODE
  // -----------------------------
  const toggleDisplayMode = () => {
    if (inlineMode) {
      const lines = content.split("\n");
      const converted = [];

      for (const line of lines) {
        if (line.includes("(")) {
          const [chordLine, textLine] = renderTwoLines(line);
          converted.push(chordLine, textLine);
        } else {
          converted.push(line);
        }
      }

      setContent(converted.join("\n"));
      setInlineMode(false);
      return;
    }

    // 2-Zeilen -> Inline
    const lines = content.split("\n");
    const converted = [];

    for (let i = 0; i < lines.length; i++) {
      const chordLine = lines[i] || "";
      const textLine = lines[i + 1] || "";

      if (isBarChordLine(chordLine)) {
        // 👉 NICHT anfassen
        converted.push(chordLine);
        continue;
      }

      if (isChordLine(chordLine) && textLine && !isBarChordLine(textLine)) {
        converted.push(renderInline(chordLine, textLine));
        i++;
      } else {
        converted.push(chordLine);
      }
    }

    setContent(converted.join("\n"));
    setInlineMode(true);
  };

  // -----------------------------
  // 🎯 CORE: INLINE RENDERING
  // -----------------------------
  function renderInline(chordLine, textLine) {
    const maxLength = Math.max(chordLine.length, textLine.length);

    const paddedChord = chordLine.padEnd(maxLength, " ");
    const paddedText = textLine.padEnd(maxLength, " ");

    let result = "";
    let textIndex = 0;

    for (let i = 0; i < maxLength; i++) {
      // 🔍 Start eines Akkords erkennen
      if (paddedChord[i] !== " " && (i === 0 || paddedChord[i - 1] === " ")) {
        let chord = "";
        let j = i;

        while (j < maxLength && paddedChord[j] !== " ") {
          chord += paddedChord[j];
          j++;
        }

        // 👉 Zielposition im Text suchen
        let insertPos = i;

        while (insertPos < maxLength && paddedText[insertPos] === " ") {
          insertPos++;
        }

        // 🔥 Falls kein Text kommt → einfach an Position bleiben
        if (insertPos >= maxLength) {
          insertPos = i;
        }

        // 👉 Text bis zur Einfügestelle übernehmen
        while (textIndex < insertPos) {
          result += paddedText[textIndex];
          textIndex++;
        }

        // 👉 Akkord einfügen
        if (chord === "NC") {
          result += "(NC)";
        } else {
          result += `(${chord})`;
        }

        i = j - 1;
        continue;
      }

      // 👉 normales Zeichen übernehmen
      if (textIndex < maxLength) {
        result += paddedText[textIndex];
        textIndex++;
      }
    }

    return result.trimEnd();
  }

  // -----------------------------
  // 🔎 CHORD LINE DETECTION
  // -----------------------------
  function isChordLine(line) {
    if (!line) return false;

    const tokens = line.trim().split(/\s+/);

    const chordRegex =
      /^(NC|[A-G](#|b)?(5|m|maj7|m7|7|sus2|sus4|dim|aug|add\d*)?(\/[A-G](#|b)?)?)$/;

    const chordCount = tokens.filter((token) => chordRegex.test(token)).length;

    return chordCount > 0 && chordCount / tokens.length > 0.5;
  }

  // -----------------------------
  // 🎼 TRANSPOSITION
  // -----------------------------
  function transposeChord(chord, amount) {
    const notes = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ];

    const match = chord.match(/^([A-G]#?b?)(.*)/);
    if (!match) return chord;

    const base = match[1];
    const rest = match[2];

    const index = notes.indexOf(base);
    if (index === -1) return chord;

    const newIndex = (index + amount + 12) % 12;
    return notes[newIndex] + rest;
  }

  // -----------------------------
  // 🖥 PREVIEW
  // -----------------------------
  function renderPreview(text) {
    return text
      .split("\n")
      .map((line, i) => `<div key=${i}>${line}</div>`)
      .join("");
  }

<<<<<<< HEAD
=======
  // Prüft, ob es sich um eine Akkordzeile handelt
  function isLikelyChordLine(line) {
    if (typeof line === 'undefined') {
      line = ""
      console.log('line ist undefined');
    }
    //console.log(line)
    // Zeitstempel entfernen, falls vorhanden
    const content = line.replace(/^\[\d{2}:\d{2}\.\d{2}\]/, '').trim();
    if (!content) return false;

    const tokens = content.split(/\s+/);
    //const chordRegex = /^[A-G](#|b)?(m|maj7|m7|7|sus4|dim|aug|add\d*)?$/;
    const chordRegex = /^[A-G](#|b)?(m|maj7|m7|9|7|5|sus4|dim|aug|add\d*)?(\/[A-G](#|b)?)?$/;

    const chordCount = tokens.filter(token => chordRegex.test(token)).length;

    return chordCount >= 1 && chordCount / tokens.length > 0.5;
  }
  // Rückgabe des HTML-Codes
>>>>>>> 80779ff778fd07e5c9c65d5e5b5ce972029069c0
  return (
    <div className="App">
      <h1>Akkord-Editor</h1>

      <div className="controls">
        <label>
          <input
            type="checkbox"
            checked={inlineMode}
            onChange={toggleDisplayMode}
          />
          Akkorde inline anzeigen
        </label>

        <div className="transpose-controls">
          <label>Transponieren:</label>
          <button onClick={() => transposeChords(-1)}>-1</button>
          <button onClick={() => transposeChords(1)}>+1</button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={handleContentChange}
        rows={10}
        style={{ width: "100%", fontFamily: "monospace" }}
      />

      <div
        className="preview"
        dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
      />
    </div>
  );
}

function renderTwoLines(inlineLine) {
  let chordLine = "";
  let textLine = "";

  let i = 0;

  while (i < inlineLine.length) {
    // 🎯 Akkord erkennen
    if (inlineLine[i] === "(") {
      let j = i + 1;
      let chord = "";

      while (j < inlineLine.length && inlineLine[j] !== ")") {
        chord += inlineLine[j];
        j++;
      }

      // Akkord soll über dem NÄCHSTEN Textzeichen stehen
      let insertPos = textLine.length;

      // chordLine bis dahin auffüllen
      chordLine = chordLine.padEnd(insertPos, " ");

      // Akkord einfügen
      chordLine += chord;

      i = j + 1;
      continue;
    }

    // normales Zeichen → direkt übernehmen (OHNE künstliche Spaces!)
    textLine += inlineLine[i];

    // chordLine nur soweit auffüllen wie nötig
    chordLine = chordLine.padEnd(textLine.length, " ");

    i++;
  }

  return [chordLine.trimEnd(), textLine.trimEnd()];
}

function isBarChordLine(line) {
  if (!line) return false;

  // Zeitstempel optional entfernen
  const cleaned = line.replace(/^\[\d{2}:\d{2}\.\d{2}\]/, "").trim();

  // Muss mit | beginnen und enden
  return /^\|.*\|$/.test(cleaned);
}

export default App;
