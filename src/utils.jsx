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

// Neue Version
export function transposeChordLine(line, amount) {
  const chordRegex = /\b([A-G][#b]?[^ \t|]*)\b/g;
  const result = [];
  let lastIndex = 0;
  let match;

  while ((match = chordRegex.exec(line)) !== null) {
    const chord = match[0];
    const start = match.index;
    result.push(line.slice(lastIndex, start));
    result.push(transposeChord(chord, amount));
    lastIndex = start + chord.length;
  }

  result.push(line.slice(lastIndex));
  return result.join('');
}

export function detectChords(line) {
  const cleaned = line.trimEnd();
  if (cleaned.endsWith("~")) return true;

  const chordRegex = /\b([A-G](#|b)?(m|maj7|sus4|dim|aug|7|6|9)?(\/[A-G](#|b)?)?)\b/g;
  const matches = line.match(chordRegex);
  return matches && matches.length > 0;
}

export function mergeChordsIntoLyrics(chordLine, lyricLine) {
  const words = lyricLine.split(/(\s+)/);
  const chords = [];
  const positions = [];

  // Extrahiere Chords mit Position
  const chordRegex = /\b([A-G][#b]?[^ \t|]*)\b/g;
  let match;
  while ((match = chordRegex.exec(chordLine)) !== null) {
    chords.push(match[0]);
    positions.push(match.index);
  }

  let result = [];
  let charIndex = 0;
  let chordIndex = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    if (/^\[\d{1,2}:\d{2}\.\d{2}\]$/.test(word)) {
      result.push(
        <span key={`t-${i}`} className="timestamp">{word}</span>
      );
      charIndex += word.length;
      continue;
    }

    const chordHere = (chordIndex < positions.length && positions[chordIndex] <= charIndex);
    if (chordHere && word.trim()) {
      result.push(
        <span key={i}>
          <span className="chord-inline">[{chords[chordIndex++]}]</span>{word}
        </span>
      );
    } else {
      result.push(<span key={i}>{word}</span>);
    }
    charIndex += word.length;
  }

  return result;
}

const NBSP = '\u00A0';

export function generateSeparatedChordLyricsPreview(lines, transposeSteps = 0) {
  const timePattern = /^\[(\d{1,2}:\d{2}\.\d{2})\]/;
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
    const transposed = content.replace(/([A-G][b#]?(?:m|maj7|m7|sus\d*|dim|aug|add\d*)?(?:\/[A-G][b#]?)?)/g, (match) => {
      return transposeChord(match, steps);
    });
    return transposed + '~';
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(timePattern);
    if (!match) continue;

    const timestamp = match[0];
    const content = line.slice(timestamp.length);

    if (isChordLine(line)) {
      const transposed = transposeChordLinePreserveSpacing(line, transposeSteps);
      const padded = '.' + transposed.replace(/ /g, NBSP);
      lastChordLine = `${timestamp}${padded}`;
    } else {
      if (lastChordLine) {
        result.push(lastChordLine);
        lastChordLine = null;
      }
      result.push(`${timestamp}${content}`);
    }
  }

  if (lastChordLine) {
    result.push(lastChordLine);
  }

  return result.join("\n");
}

export function exportToFoobarFormat(lyrics) {
  if (!Array.isArray(lyrics)) return "";

  return lyrics
    .map(({ t, l }) => {
      const timestamp = formatTimeTag(t);
      const line = `${timestamp}\u00A0${l || ""}`; // Zeitstempel + geschütztes Leerzeichen + Text
      return line;
    })
    .join("\n");
}

function formatTimeTag(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  const hundredths = Math.floor((ms % 1000) / 10)
    .toString()
    .padStart(2, "0");
  return `[${minutes}:${seconds}.${hundredths}]`;
}
