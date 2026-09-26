import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(apiKey) });
});

// AI Weekly Performance Synthesis Route
app.post('/api/ai/weekly-review', async (req: Request, res: Response) => {
  try {
    const { weekStats, habits } = req.body;

    if (!ai) {
      const consistencyRate = Math.round(
        ((weekStats?.habitsDone || 0) / (weekStats?.habitsTotal || 1)) * 100
      );
      return res.json({
        analysis: `Wochen-Debrief: Dein durchschnittlicher Lock-In Score lag bei ${weekStats?.avgScore || 78}/100 mit ${consistencyRate}% Habit-Erfüllung. Dein produktivster Tag war ${weekStats?.bestDayName || 'Donnerstag'}. Empfehlung: Behalte die ${weekStats?.deepWorkFormatted || '8h'} Deep Work bei und setze das erste Habit direkt vor 09:00 Uhr um.`,
      });
    }

    const prompt = `Du bist JARVIS, der persönliche Performance- und Disziplin-Coach für Niklas (17 Jahre, 12. Klasse Abitur, Golf-Leistungssportler, Krafttraining & Regeneration).
Analysiere die Performance-Daten dieser Woche nüchtern, präzise, direkt und datenbasiert.
Kein langes Geschwafel, keine oberflächlichen Motivationsfloskeln. Maximal 3-4 Sätze.

Wochendaten:
- Durchschnittlicher Lock-In Score: ${weekStats?.avgScore || 0} / 100
- Erledigte Habits: ${weekStats?.habitsDone || 0} von ${weekStats?.habitsTotal || 0}
- Deep Work / Fokuszeit: ${weekStats?.deepWorkFormatted || '0h'}
- Bester Tag: ${weekStats?.bestDayName || 'Unbekannt'} (Score: ${weekStats?.bestDayScore || 0})
- Verfolgte Habits: ${Array.isArray(habits) ? habits.join(', ') : 'Gym, Golf, Abitur, Sauna'}

Struktur:
1. Kurze, ungeschönte Einordnung der Disziplin & Konstanz.
2. Identifiziertes Muster (z.B. Starker Start, Peak am besten Tag).
3. Eine konkrete taktische Vorgabe für die kommende Woche.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const analysisText = response.text || '';
    res.json({ analysis: analysisText.trim() });
  } catch (error) {
    console.error('Error generating AI review:', error);
    res.status(500).json({
      error: 'Fehler bei der KI-Analyse',
      fallback: 'Wochenanalyse: Starke Leistung mit Raum für noch frühere Habit-Erledigung.',
    });
  }
});

// JARVIS AI Coach Endpoint: Personal Operating Assistant for Niklas
app.post('/api/ai/jarvis', async (req: Request, res: Response) => {
  try {
    const { mode, context, question } = req.body;
    // context contains: userName, todayScore, streak, habits (planned vs completed), weeklyProgress (Gym, Golf, Sauna, School), checkIn

    if (!ai) {
      // Deterministic realistic offline fallback for Niklas
      if (mode === 'briefing') {
        return res.json({
          reply: `Guten Morgen, Niklas. Schule und Abitur-Vorbereitung bilden heute das Fundament. Danach steht dein Golftraining auf der Range an (Wochenziel: 2/3 erreicht). Gym liegt bei 3/4 Sessions. Konzentriere dich heute auf sauberen Schulabschluss und präzises Kurzspiel.`,
        });
      }
      if (mode === 'evening') {
        return res.json({
          reply: `Tagesabschluss: Mit ${context?.todayScore || 84}% Lock-In Score hast du heute ein starkes Fundament gelegt. Schule, Golf und Gym sind abgehakt. Schließe jetzt noch die 3 Fragen im Journal ab, um den Tag sauber abzuhaken.`,
        });
      }
      return res.json({
        reply: `Statusbericht für Niklas: Dein Lock-In Score liegt bei ${context?.todayScore || 84} Punkten (${context?.streak || 7} Tage Streak). Deine Wochenziele für Golf (2/3) und Gym (3/4) sind voll im Soll. Fokus heute: Ausreichend Schlaf für die Regeneration sichern.`,
      });
    }

    const systemPrompt = `Du bist JARVIS — der persönliche, hochintelligente KI-Coach und Lebensassistent von Niklas.
Über Niklas:
- 17 Jahre alt, Schüler der 12. Klasse kurz vor dem Abitur.
- Leistungsportler im Golf (Ambition, Turniere, Handicap-Verbesserung, Fokus auf Driving Range, Kurzspiel, Putting).
- Kraftsport / Gym (4x pro Woche Hypertrophie & Athletik).
- Regeneration (Sauna 2x pro Woche, Kälte, Schlaf).
- Philosophie: „Jeden Tag ein Stück besser werden. Build proof.“

Deine Persönlichkeit:
- Extrem intelligent, ruhig, direkt, analytisch, loyal.
- Gelegentlich feiner, trockener Humor.
- Niemals billige Motivationssprüche, keine oberflächlichen Flammen-Emojis, keine leeren Floskeln.
- Sprich Niklas direkt mit Vornamen an.
- Fokussiere dich auf Fakten, Daten, Verhältnisse (z.B. Gym 3/4, Golf 2/3) und handlungsorientierte Empfehlungen.
- Halte deine Antworten prägnant (2 bis 4 Sätze).

Aktueller Status von Niklas:
- Heutiges Datum: ${context?.date || 'Heute'}
- Lock-In Score heute: ${context?.todayScore || 0}%
- Aktiver Streak: ${context?.streak || 0} Tage
- Heutige geplante Aufgaben: ${context?.todayHabitsSummary || 'Gym, Golf, Schule, Schritte'}
- Wochenfortschritt:
  * GYM: ${context?.weeklyProgress?.gym || '3/4'}
  * GOLF: ${context?.weeklyProgress?.golf || '2/3'}
  * SAUNA: ${context?.weeklyProgress?.sauna || '1/2'}
  * ABITUR / SCHULE: ${context?.weeklyProgress?.school || '4/5'}
- Heutiger Check-In: Energie ${context?.checkIn?.energy || 8}/10, Fokus ${context?.checkIn?.focus || 9}/10. Ziel: „${context?.checkIn?.mainGoal || 'Fokus'}“
`;

    let userPrompt = '';
    if (mode === 'briefing') {
      userPrompt = 'Gib Niklas ein kurzes, präzises Morning Briefing für den heutigen Tag. Was hat Priorität? Wie steht die Woche?';
    } else if (mode === 'evening') {
      userPrompt = 'Gib Niklas einen prägnanten Abend-Review. Wie war der Tag anhand der Zahlen? Was fehlt noch vor dem Schlafen?';
    } else if (mode === 'chat' && question) {
      userPrompt = `Frage von Niklas: „${question}“. Antworte präzise, datengestützt und fokussiert als JARVIS.`;
    } else {
      userPrompt = 'Analysiere kurz den aktuellen Zustand und gib Niklas eine konkrete, taktische Empfehlung für die nächste Aktivität.';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${systemPrompt}\n\nAufgabe:\n${userPrompt}`,
    });

    const reply = response.text?.trim() || 'Systeme arbeiten im Normalbereich. Setze deine nächsten Prioritäten planmäßig um.';
    res.json({ reply });
  } catch (error) {
    console.error('Error in Jarvis endpoint:', error);
    res.json({
      reply: 'Verbindung zu den Sensordaten stabil. Halte deinen Fokus und arbeite deine geplanten Blöcke für Schule, Golf und Regeneration ab.',
    });
  }
});

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Lock-In Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
