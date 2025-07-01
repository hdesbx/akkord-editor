import React, { useState } from 'react';
import './App.css';



function App() {
  const [content, setContent] = useState(
    "[00:16.51]    E7          A\n" +
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

  //Herzfunktion zum Darstellen der Lyrics
  const toggleDisplayMode = () => {
    if (inlineMode) {   // Wenn der Inline-Modus eingeschaltet ist
      console.log("Inline-Modus")
      // schaltet: Inline -> Zweizeilig

      const lines = preparedContent.split("\n");  //Text in Zeilen-Array aufteilen
      const converted = [];

      // START alle Zeilen durchgehen mit verschiedenen Prüfungen
      for (const line of lines) {   
        let chordLine = "";
        let textAusChordline = "";
        let textLine = "";
        let inChord = false;   // gibt an, ob Inline (true) oder 2-zeilig (false)
        let chordBuffer = "";
        let akkordLaenge = 0;
        let keineLeerzeichen = 1
        let kl = 1
        let i = 0;

        //Alle Zeichen einer Zeile durchgehen zur Prüfung des Zeilen-Modus
        while (i < line.length) {
          const char = line[i];
  
          // Zeitstempel direkt übernehmen
          if (char === "[" && isTimestamp(line.substring(i, i + 10))) {
            const ts = line.substring(i, i + 10);  // Zeitstempel an ts zuweisen.
            chordLine += ts;   // Aufbau der Akkordlinie
            textLine += ts;    // Aufbau der Testlinie
            textAusChordline += ts;  //falls keine Akkordzeile

            i += 10;   // i um die Länge des Zeitstempels nach vorne schieben
            continue;
          }

          if (char === "(") {   //Wenn in einer Zeile das Zeichen Akkordstart "(" gefunden wird,
            inChord = true;     // wird die Akkordebehandlung auf true.
            chordBuffer = "";   // dient als Akkordpuffer, nimmt also die gesamte Akkordbezeichnung auf, z. B. Amaj7
            keineLeerzeichen = 1
            i++;
            continue;
          }
  
          if (char === ")") {           //Wenn in einer Zeile das Zeichen Akkordende ")" gefunden wird.
            inChord = false;            // wird inChord auf false gesetzt und damit die Akkordbehandlung beendet.
            chordLine += chordBuffer;   // Akkord (Puffer) in die Akkordzeile einfügen.
            akkordLaenge = chordBuffer.length

            let lookahead = i + 1;      // Was kommt als nächstes Zeichen?
            let attached = false;
console.log("*****akkordLaenge: ", akkordLaenge)
            while (lookahead < line.length && line[lookahead] === " ") lookahead++; // lookahead auf nächstes Nicht-Leerzeichen schieben.
            
            if (
              lookahead < line.length &&
              line[lookahead] !== "(" &&
              line[lookahead] !== "[" &&
              line[lookahead] !== "]"
            ) {
              textLine += line[lookahead];  //textLine erweitern mit dem Akkord
              i = lookahead;  // i vorschieben zur aktuellen Teststellen
              attached = true;
            }

            if (!attached) {    // Wenn 
              textLine += " ".repeat(chordBuffer.length);
            }

            console.log("chordBuffer-Länge: ", chordBuffer.length)
            chordBuffer = ""; // Akkordpuffer zurücksetzen
            i++;
            continue;

          }

          if (inChord) {          // Wenn die Akkord-Behandlung läuft
            chordBuffer += char;  // wird der der Puffer um die Akkordzeichens des Akkordes erweitert.
            console.log("********chordBuffer", chordBuffer, " ", chordBuffer.length)
            kl++
            keineLeerzeichen++            
          } else {
            console.log("Bedingung für Leerzeichen: ", chordBuffer.length, keineLeerzeichen, akkordLaenge)
            if(chordBuffer.length == 0 || (chordBuffer.length > 0 && keineLeerzeichen == akkordLaenge)){
              chordLine += " "
            }


            textLine += char;
            console.log("chordLine", chordLine)
            kl = 0
          }
          
          textAusChordline += line[i]
          //console.log("textAusChordline: ", textAusChordline)
          i++;
        }

        if (isLikelyChordLine(chordLine)) {
          console.log("Akkord-Zeile erkannt wegen Funktion");
          while (chordLine.length < textLine.length) { // Akkordzeile mit Leerzeichen auffüllen bis die Länge der Textzeile erreicht ist.
            chordLine += " ";
          }  
          converted.push(chordLine, textLine);        
        } else {
          console.log("keine Akkordzeile -> wird als Text behandelt") // ----------------------------- 
          console.log("falsche Akkordzeile: ", textAusChordline)      // ----------------------------- 
          //converted.push(textAusChordline);
          //break
        }

        console.log("textLine: ", textLine)

        console.log("converted")
        console.log(converted)
      }
      //ENDE alle Zeilen durchgehen

      setContent(converted.join("\n"));  // Lyrics für die Textarea im 2-Zeilen-Modus vorbereiten

    } else {
      console.log("2-Zeilen-Modus")
      // Zweizeilig -> Inline
      const lines = content.split("\n");    // Inhalt in eine Zeilen-Array verwandeln
      const converted = [];
      console.log("Zeilenlänge: ", lines.length)


      for (let i = 0; i < lines.length; i++) {     // Alle Zeilen durchlaufen.
        const chordLine = lines[i] || "";
        const textLine = lines[i + 1] || "x";

        console.log("TextLine: ", textLine)

        let isPaar = false  // liegt eine Akkord-Textzeilen-Paar vor?
        let result = "";
        let t = 0;

        //console.log("chordLine: ", chordLine,  "Index: ", i)
        //console.log("textLine: ", textLine,  "Index: ", i)

        // Prüfe, ob hier ein Akkord/Text-Zeilen-Paar vorliegt.
        
        if (isLikelyChordLine(lines[i]) && !isLikelyChordLine(lines[i+1]) && textLine != "x") {
          isPaar = true
          console.log("Index: ", i)
          i++ // i um 1 nach vorne schieben, damit die übernächste Zeile behandelt wird. i+1 war ja schon dran
          console.log("Akkord-Textzeilen-Paar erkannt", "neuer Index", i);
        } else {
          console.log("Kein korretes Akkord-Textzeilen-Paar erkannt");
          result += lines[i]
          console.log("result: ",result, "Index: ", i)
          isPaar = false
        }
        if (isPaar){
          //Maximale Länge aus Akkord- und Textzeile ermitteln und die kürzere der beiden mit Leerzeichen auffüllen.
          const maxLength = Math.max(chordLine.length, textLine.length);

          const paddedChordLine = chordLine.padEnd(maxLength, " ");
          const paddedTextLine = textLine.padEnd(maxLength, " ");

  //console.log("maxLength: ", maxLength)

          while (t < maxLength) {
            // Zeitstempel erkennen (10 Zeichen)
            if (paddedTextLine[t] === "[" && isTimestamp(paddedTextLine.substring(t, t + 10))) {
              result += paddedTextLine.substring(t, t + 10);
  //console.log("1. Result", result)
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
                paddedChordLine[k] !== "("
              ) {
                chord += paddedChordLine[k];
                k++;
              }

              if (chord) {
                result += `(${chord})`;
  //console.log("2. Result", result)
                // Erstes nicht-leeres Zeichen direkt unter dem Akkord anhängen
                for (let j = t; j < k; j++) {
                  if (paddedTextLine[j] !== " ") {
                    result += paddedTextLine[j];
                    //break; // Nur das erste Zeichen anhängen
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

  // Funktion zum einfügen geschützter Leerzeichen am Zeilenanfang bzw. nach dem Zeitstempel, um Akkordverschiebungen in der Anzeigesoftware zu verhndern
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

  // Funktion zum rendern der Zeilen als Vorbereitung für den HTML-Code
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
    //const chordRegex = /^[A-G](#|b)?(m|maj7|m7|7|sus4|dim|aug|add\d*)?$/;
    const chordRegex = /^[A-G](#|b)?(m|maj7|m7|7|sus4|dim|aug|add\d*)?(\/[A-G](#|b)?)?$/;

    const chordCount = tokens.filter(token => chordRegex.test(token)).length;

    return chordCount >= 1 && chordCount / tokens.length > 0.5;
  }
  // Rückgabe des HTML-Codes
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


// Hilfsfunktionen für Zeitstempel
const isTimestamp = (str) => {
  return /^\[\d{2}:\d{2}\.\d{2}\]$/.test(str);  
}

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

export default App;


