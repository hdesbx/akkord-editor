// src/utils.js

const notes = [
  "C", "C#", "D", "D#", "E", "F",
  "F#", "G", "G#", "A", "A#", "B",
];

export function transposeChord(chord, amount) {
  const match = chord.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return chord;
  const [, root, rest] = match;
  const index = notes.indexOf(root.replace("b", "#"));
  if (index === -1) return chord;

  const newIndex = (index + amount + 12) % 12;
  return notes[newIndex] + rest;
}

export function transposeChordLine(line, amount) {
  return line.replace(/\b([A-G][#b]?[^ \t|]*)\b/g, (match) =>
    transposeChord(match, amount)
  );
}

// Erkenne Zeile als Akkordzeile, wenn mindestens ein valider Akkord enthalten ist
export function detectChords(line) {
  const chordRegex = /\b([A-G](#|b)?(m|maj7|sus4|dim|aug|7|6|9)?(\/[A-G](#|b)?)?)\b/g;
  const matches = line.match(chordRegex);
  return matches && matches.length > 0;
}

export function mergeChordsIntoLyrics(chordLine, lyricLine) {
  const words = lyricLine.split(/(\s+)/); // Trennt auch Leerzeichen als eigene Elemente
  const chords = chordLine.trim().split(/\s+/);
  let result = [];
  let chordIndex = 0;

  const isTimeStamp = (word) => /^\[\d{1,2}:\d{2}.\d{2}\]$/.test(word);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    if (isTimeStamp(word)) {
      // Zeitstempel bleibt unangetastet
      result.push(
        <span key={`t-${i}`} className="timestamp">{word}</span>
      );
      continue;
    }

    if (word.trim()) {
      const chord = chords[chordIndex++] || "";
      result.push(
        <span key={i}>
          {chord && <span className="chord-inline">[{chord}]</span>}
          {word}
        </span>
      );
    } else {
      // Leerzeichen beibehalten
      result.push(<span key={i}>{word}</span>);
    }
  }

  return result;
}

const NBSP = '\u00A0'; // geschütztes Leerzeichen

export function generateSeparatedChordLyricsPreview(lines, transposeSteps = 0) {
  const timePattern = /^\[(\d{1,2}:\d{2}\.\d{2})\]/;
  const NBSP = '\u00A0';
  const result = [];
  let lastChordLine = null;

  const isChordLine = (line) => {
    const content = line.replace(timePattern, '').trim();
    return /^[A-G][b#]?(m|maj7|m7|sus\d*|dim|aug|add\d*)?([\/][A-G][b#]?)?(\s+[A-G][b#]?(m|maj7|m7|sus\d*|dim|aug|add\d*)?([\/][A-G][b#]?)?)*$/.test(content);
  };

  const transposeChord = (chord, steps) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

    const getIndex = (note) => notes.indexOf(note) !== -1 ? notes.indexOf(note) : flatNotes.indexOf(note);
    const transposeNote = (note, steps) => {
      const idx = getIndex(note);
      if (idx === -1) return note;
      const newIndex = (idx + steps + 12) % 12;
      return note.includes('b') ? flatNotes[newIndex] : notes[newIndex];
    };

    return chord.replace(/^([A-G][b#]?)(.*)$/, (_, root, suffix) => {
      return transposeNote(root, steps) + suffix;
    });
  };

  const transposeChordLinePreserveSpacing = (line, steps) => {
    const content = line.replace(timePattern, '');
    return content.replace(/([A-G][b#]?(?:m|maj7|m7|sus\d*|dim|aug|add\d*)?(?:\/[A-G][b#]?)?)/g, (match) => {
      return transposeChord(match, steps);
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(timePattern);
    if (!match) continue;

    const timestamp = match[0];
    const content = line.slice(timestamp.length);

    if (isChordLine(line)) {
      const transposed = transposeChordLinePreserveSpacing(line, transposeSteps);

      // Ersetze alle normalen Leerzeichen durch NBSP für sauberes Alignment
      const padded = '.' + transposed.replace(/ /g, NBSP);
      lastChordLine = `${timestamp}${padded}`;
    } else {
      if (lastChordLine) {
        result.push(lastChordLine);
        lastChordLine = null;
      }
      result.push(line);
    }
  }

  return result.join('\n');
}


