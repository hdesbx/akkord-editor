// Konfiguration
const songLengthSeconds = 180; // Songlänge in Sekunden, z.B. 3 min = 180
const bpm = 73;               // BPM
const taktProZeile = 1;        // wie viele Takte pro Zeile
const beatsPerTakt = 4;        // Standard 4/4-Takt
const startOffset = 21.29;         // Startzeit in Sekunden

// Berechnung
const taktDauer = (60 / bpm) * beatsPerTakt; // Dauer eines Taktes in Sekunden
const zeilenDauer = taktDauer * taktProZeile;

const zeilen = Math.ceil((songLengthSeconds - startOffset) / zeilenDauer);

// Generiere Zeitstempel
for (let i = 0; i < zeilen; i++) {
  const zeit = startOffset + i * zeilenDauer;
  const minuten = Math.floor(zeit / 60);
  const sekunden = (zeit % 60).toFixed(2).padStart(5, '0');
  console.log(`${i+1} [${minuten}:${sekunden}]`);
}