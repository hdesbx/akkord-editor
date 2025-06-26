import React, { useState } from 'react';
import './App.css';

// Hilfsfunktionen für Zeitstempel
const isTimestamp = (str) => {

  return /^\[\d{2}:\d{2}\.\d{2}\]$/.test(str);
  
  }
//const convertToSafeTimestamp = (ts) => ts.replace(/^\[|\]$/g, '').replace(/:/g, ';');
//const convertFromSafeTimestamp = (ts) => `[${ts.replace(/;/g, ':')}]`;

// Transponierfunktion
function transposeChord(chord, amount) {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  if (!chord || chord.trim() === '') return chord;
  const match = chord.match(/^([A-G]#?b?)(.*)/);
  if (!match) return chord;
  
  const baseNote = match[1];
  const chordType = match[2];
  let noteIndex = notes.indexOf(baseNote);
  if (noteIndex === -1) return chord;
  
  const newIndex = (noteIndex + amount + 12) % 12;
  const newNote = notes[newIndex];
  return newNote + chordType;
}

function App() {
  const [content, setContent] = useState(
    "[00:16.51]    E           A\n" +
    "[00:16.51]Ooh willkommen willkommen willkommen\n" +
    "[00:18.30]    E       A\n" +
    "[00:18.30]Sonnenschein"
  );

  const [inlineMode, setInlineMode] = useState(false);
  const [transposeAmount, setTransposeAmount] = useState(0);
 

//const preparedContent = content.replace(/(^|\n)(?!\u00A0)/g, "$1" + nbsp); // geschützte Leerzeichen vor jede Zeile

//const preparedContent = content.replace(/(\])((?!"-"))/g, "]-"); // geschützte Leerzeichen vor jede Zeile
//console.log("contentLines:---------------------")
//for (const contentLine of content) {
//    console.log(contentLine)
//}

const preparedContent = content
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const transposeChords = (amount) => {
    if (inlineMode) {
      const transposedContent = content.replace(/§([^§]*)§/g, (match, chord) => {
        return `§${transposeChord(chord, amount)}§`;
      });
      setContent(transposedContent);
    } else {
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i += 2) {
        if (i >= lines.length) break;
        lines[i] = lines[i].replace(/\S+/g, chord => 
          chord.startsWith('[') ? chord : transposeChord(chord, amount)
        );
      }
      setContent(lines.join('\n'));
    }
    setTransposeAmount(transposeAmount + amount);
  };

const toggleDisplayMode = () => {
  if (inlineMode) {

    // Inline -> Zweizeilig

    const lines = preparedContent.split("\n");
    const converted = [];

    for (const line of lines) {
      let chordLine = "";
      let textLine = "";
      let inChord = false;
      let chordBuffer = "";
      let i = 0;

      while (i < line.length) {
        const char = line[i];

        // Zeitstempel direkt übernehmen
        if (char === "[" && isTimestamp(line.substring(i, i + 10))) {
          const ts = line.substring(i, i + 10);
          chordLine += ts;
          textLine += ts;

          i += 10;
          continue;
        }

        if (char === "(") {
          inChord = true;
          chordBuffer = "";
          i++;
          continue;
        }

        if (char === ")") {
          inChord = false;
          chordLine += chordBuffer;

          let lookahead = i + 1;
          let attached = false;

          while (lookahead < line.length && line[lookahead] === " ") lookahead++;
          if (
            lookahead < line.length &&
            line[lookahead] !== "(" &&
            line[lookahead] !== "[" &&
            line[lookahead] !== "]"
          ) {
            textLine += line[lookahead];
            i = lookahead;
            attached = true;
          }

          if (!attached) {
            textLine += " ".repeat(chordBuffer.length);
          }

          chordBuffer = "";
          i++;
          continue;
        }

        if (inChord) {
          chordBuffer += char;
        } else {
          chordLine += " ";
          textLine += char;
        }

        i++;
      }



      while (chordLine.length < textLine.length) {
        chordLine += " ";
      }


      converted.push(chordLine, textLine);
    }

    setContent(converted.join("\n"));
  } else {
    // Zweizeilig -> Inline
    const lines = content.split("\n");
    const converted = [];

    for (let i = 0; i < lines.length; i += 2) {
      const chordLine = lines[i] || "";
      const textLine = lines[i + 1] || "";
      let result = "";
      let t = 0;
//console.log(chordLine)
//console.log(textLine)
      //Maximale Länge aus Akkord- und Textzeile ermitteln und die kürzere der beiden mit Leerzeichen auffüllen.
      const maxLength = Math.max(chordLine.length, textLine.length);
      const paddedChordLine = chordLine.padEnd(maxLength, " ");
      const paddedTextLine = textLine.padEnd(maxLength, " ");

      while (t < maxLength) {
        // Zeitstempel erkennen (10 Zeichen)
        if (paddedTextLine[t] === "[" && isTimestamp(paddedTextLine.substring(t, t + 10))) {
          result += paddedTextLine.substring(t, t + 10);

          t += 10;
          continue;
        }

        // Akkord an aktueller Position?
        if (paddedChordLine[t] !== " " && paddedChordLine[t] !== undefined) {
          let chord = "";
          let k = t;
          while (
            k < paddedChordLine.length &&
            paddedChordLine[k] !== " " &&
            paddedChordLine[k] !== "["
          ) {
            chord += paddedChordLine[k];
            k++;
          }

          if (chord) {
            result += `(${chord})`;

            // Erstes nicht-leeres Zeichen direkt unter dem Akkord anhängen
            for (let j = t; j < k; j++) {
              if (paddedTextLine[j] !== " ") {
                result += paddedTextLine[j];
                break; // Nur das erste Zeichen anhängen
              }
            }
            t = k;
            continue;
          }
        }

        // Normales Textzeichen übernehmen
        result += paddedTextLine[t];
        t++;
      }

      //console.log("DEBUG Zweizeilig -> Inline:", result);

      converted.push(result.trimEnd());
    }

    setContent(converted.join("\n"));
  }

  setInlineMode(!inlineMode);
};

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
          <select 
            value={transposeAmount} 
            onChange={(e) => {
              const diff = parseInt(e.target.value, 10) - transposeAmount;
              transposeChords(diff);
            }}
          >
            {Array.from({ length: 13 }, (_, i) => i - 6).map((val) => (
              <option key={val} value={val}>
                {val > 0 ? `+${val}` : val}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="editor-container">
        <textarea
          value={preparedContent}
          onChange={handleContentChange}
          className="editor"
          placeholder="Songtext eingeben..."
          rows={10}
          spellCheck={false}
        />
      </div>
      
      <div className="hint">
        {inlineMode ? (
          <p>
            <strong>Inline-Modus:</strong> Akkorde mit §, Zeitstempel [mm:ss.ff]<br />
            Beispiel: [00:16.5] §E§Ooh §A§willkommen
          </p>
        ) : (
          <p>
            <strong>Zweizeilen-Modus:</strong> Zeitstempel in beiden Zeilen, Akkorde mit Leerzeichen positionieren<br />
            Beispiel: [00:16.52]    E       A
          </p>
        )}
      </div>
    </div>
  );
}

export default App;


