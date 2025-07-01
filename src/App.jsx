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
  const [protectSpaces, setProtectSpaces] = useState(false);

  const preparedContent = content
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const transposeChords = (amount) => {
    if (inlineMode) {
      const transposedContent = content.replace(/\(([^(]*)\)/g, (match, chord) => {
        return `(${transposeChord(chord, amount)})`;
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
      let textAusChordline = "";
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
          textAusChordline += ts;  //falls keine Akkordzeile

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
        textAusChordline += line[i]
        i++;
      }

      console.log("chordLine xxx: ", chordLine)     //---------------------

      if (isLikelyChordLine(chordLine)) {
        console.log("Akkord-Zeile erkannt wegen Funktion");
        while (chordLine.length < textLine.length) {
          chordLine += " ";
        }  
        converted.push(chordLine, textLine);        
      } else {
        console.log("keine Akkordzeile -> wird als Text behandelt") // ----------------------------- 
        console.log("falsche Akkordzeile: ", textAusChordline)      // ----------------------------- 
        converted.push(textAusChordline);
        //break
      }



console.log("textLine: ", textLine)

      console.log("converted")
      console.log(converted)
    }

    setContent(converted.join("\n"));
  } else {
    // Zweizeilig -> Inline
    const lines = content.split("\n");
    const converted = [];
    console.log("Zeilenlänge: ", lines.length)

    let chordLine = ""
    let textLine = ""
    let isPaar = false  // liegt eine Akkord-Textzeilen-Paar vor? 
    let isChordLine = false
    let isNextChordLine = false

    for (let i = 0; i < lines.length; i++) {

      let result = "";
      let t = 0;

        isChordLine = isLikelyChordLine(lines[i])
        isNextChordLine = isLikelyChordLine(lines[i+1])
  
        if((isTimestamp(lines[i]) && length.line[i] == 10) ||(!isTimestamp(lines[i]) && length.line[i] == 0)){
                console.log("Resultat Leerzeile")
                console.log(result)
                converted.push(result.trimEnd());
                continue
        }


        if (isChordLine && !isNextChordLine)  {
          isPaar = true
          chordLine = lines[i]  || ""
          textLine = lines[i+1]  || ""
          console.log(("Indes: ", i))
          i++ // i um 1 nach vorne schieben, damit die übernächste Zeile behandelt wird. i+1 war ja schon dran
          console.log("Akkord-Textzeilen-Paar erkannt", isPaar, "neuer Index", i);
        } else {
          isPaar = false
          //Ansonsten muss der Index angepasst werden, weil das Standard-Inkrement 2 ist.
          console.log("Kein korretes Akkord-Textzeilen-Paar erkannt", "result: ",result, "Index: ", i);
          result += lines[i]
        }
        

      if (isPaar){
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
      } else {
        console.log("vor ChordLine")
        if(isLikelyChordLine(lines[i])){
          console.log("einsame Zeile ist eine: Chod-Line")
        } else {
          console.log("einsame Zeile ist eine: Text-Line")
        }

      }

      console.log("Resultat vor push")
      console.log(result)
      converted.push(result.trimEnd());
    }

    setContent(converted.join("\n"));
  }

  setInlineMode(!inlineMode);
};

const toggleProtectedSpaces = () => {
  const updatedLines = content.split("\n").map((line) => {
    return line.replace(/\[(\d{2}:\d{2}\.\d{2})\](\u00a0)?/g, (match, ts, space) => {
      return protectSpaces
        ? `[${ts}]`               // geschütztes Leerzeichen entfernen
        : `[${ts}]\u00a0`;        // geschütztes Leerzeichen hinzufügen
    });
  });

  setContent(updatedLines.join("\n"));
  setProtectSpaces(!protectSpaces);
};

function renderPreview(text) {
  const lines = text.split('\n');

  return lines.map((line, i) => {
    const highlighted = line.replace(/\u00a0/g, '<span class="nbsp">␣</span>');
    return `<div key=${i}>${highlighted}</div>`;
  }).join('');
}

// Prüft, ob es sich um eine Akkordzeile handelt
function isLikelyChordLine(line) {
  if (typeof line === 'undefined') {
    line = ""
  console.log('line ist undefined');
}
  console.log(line)
  // Zeitstempel entfernen, falls vorhanden
  const content = line.replace(/^\[\d{2}:\d{2}\.\d{2}\]/, '').trim();
  if (!content) return false;

  const tokens = content.split(/\s+/);
  const chordRegex = /^[A-G](#|b)?(m|maj7|m7|7|sus4|dim|aug|add\d*)?$/;

  const chordCount = tokens.filter(token => chordRegex.test(token)).length;

  return chordCount >= 1 && chordCount / tokens.length > 0.5;
}

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
        <label>
          <input
            type="checkbox"
            checked={protectSpaces}
            onChange={toggleProtectedSpaces}
          />
          Geschütztes Leerzeichen nach Zeitstempel
        </label>
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

      <div className="preview" dangerouslySetInnerHTML={{ __html: renderPreview(content) }} />

    </div>



  );
}

export default App;


