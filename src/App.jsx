import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [content, setContent] = useState('');
  const [inlineMode, setInlineMode] = useState(true);
  
  // Initialdaten im richtigen Format laden
  useEffect(() => {
    // Beispielsong im Inline-Format
    setContent("Yo[D]u had me down, but I [A]got up already\n[G]Looking at my watch, I should [D]be there already");
  }, []);

  // Konvertierung zwischen den Modi
  const toggleDisplayMode = () => {
    if (inlineMode) {
      // Inline -> Zweizeilig
      const lines = content.split('\n');
      const convertedLines = lines.map(line => {
        const chordLine = [];
        const textLine = [];
        let inChord = false;
        let chord = '';
        
        for (let i = 0; i < line.length; i++) {
          if (line[i] === '[') {
            inChord = true;
            chord = '';
          } else if (line[i] === ']' && inChord) {
            inChord = false;
            chordLine.push(...' '.repeat(textLine.length - chordLine.length), ...chord);
          } else if (inChord) {
            chord += line[i];
          } else {
            textLine.push(line[i]);
            if (chordLine.length < textLine.length) {
              chordLine.push(' ');
            }
          }
        }
        
        return [chordLine.join(''), textLine.join('')].join('\n');
      });
      
      setContent(convertedLines.join('\n'));
    } else {
      // Zweizeilig -> Inline
      const lines = content.split('\n');
      const convertedLines = [];
      
      for (let i = 0; i < lines.length; i += 2) {
        const chordLine = lines[i] || '';
        const textLine = lines[i + 1] || '';
        let combined = '';
        let chordPos = 0;
        
        for (let j = 0; j < textLine.length; j++) {
          const chordChar = chordLine[j] || ' ';
          
          if (chordChar !== ' ' && (j === 0 || chordLine[j - 1] === ' ')) {
            // Neuer Akkord beginnt
            let chord = '';
            for (let k = j; k < chordLine.length; k++) {
              if (chordLine[k] === ' ') break;
              chord += chordLine[k];
            }
            combined += `[${chord}]`;
          }
          
          combined += textLine[j];
        }
        
        convertedLines.push(combined);
      }
      
      setContent(convertedLines.join('\n'));
    }
    
    setInlineMode(!inlineMode);
  };

  // Textänderungen verarbeiten
  const handleContentChange = (e) => {
    setContent(e.target.value);
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
      </div>

      <textarea
        value={content}
        onChange={handleContentChange}
        className="editor"
        placeholder="Songtext eingeben..."
        rows={10}
        spellCheck={false}
      />
      
      <div className="hint">
        {inlineMode ? (
          <p>
            <strong>Inline-Modus:</strong> Akkorde in eckigen Klammern eingeben, z.B.: "You [D]had me down"<br />
            Umbruch erfolgt automatisch am Zeilenende
          </p>
        ) : (
          <p>
            <strong>Zweizeilen-Modus:</strong> Erste Zeile = Akkorde, Zweite Zeile = Text<br />
            Positionierung mit Leerzeichen, z.B.: "   D        G7"
          </p>
        )}
      </div>
    </div>
  );
}

export default App;