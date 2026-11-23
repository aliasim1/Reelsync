import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

interface ChatMessageInput {
  role: 'user' | 'assistant';
  text: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  ur: 'Urdu (اردو script)',
  'roman-ur': 'Roman Urdu (Urdu written in English alphabet)',
  ar: 'Arabic (العربية)',
  es: 'Spanish (Español)',
  fr: 'French (Français)',
};

function sanitizeMessages(raw: unknown): ChatMessageInput[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(-14)
    .filter(
      (item): item is { role?: unknown; text?: unknown } =>
        Boolean(item) && typeof item === 'object'
    )
    .map((item) => ({
      role: (item.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      text: typeof item.text === 'string' ? item.text.trim().slice(0, 1500) : '',
    }))
    .filter((item) => item.text.length > 0);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/help-chat', async (req: Request, res: Response) => {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      res.status(503).json({
        error:
          'Assistant is temporarily unavailable because GEMINI_API_KEY is not configured in Settings > Secrets.',
      });
      return;
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const messages = sanitizeMessages(body.messages);
    if (messages.length === 0) {
      res.status(400).json({ error: 'Please enter a question to send.' });
      return;
    }

    const langCode =
      typeof body.language === 'string' && body.language in LANGUAGE_LABELS
        ? body.language
        : 'en';
    const currentView =
      typeof body.currentView === 'string'
        ? body.currentView.slice(0, 40)
        : 'dashboard';
    const isAdmin = Boolean(body.isAdmin);

    const systemInstruction = [
      'You are the ReelSync Help Assistant built into the ReelSync short-form video publishing studio.',
      `Always reply in ${LANGUAGE_LABELS[langCode]} unless the user explicitly asks you to switch languages.`,
      'Be warm, practical, concise, and step-by-step (use short numbered steps or brief paragraphs, <= 180 words).',
      `User context: current page="${currentView}", role=${isAdmin ? 'Owner Admin' : 'Standard User (Creator)'}.`,
      'What ReelSync does and how to troubleshoot common problems:',
      '1) Account & Access: Users sign in with their email via Google Sign-In and complete their profile (name + language). Admin controls (editing channel URLs, API credentials, team roles, support numbers) are locked exclusively to the workspace owner.',
      '2) Language & Theme: Users can change Language anytime from the top bar or welcome screen, and switch between Bright Green and Dark Green themes.',
      '3) Upload & Studio: Upload vertical 9:16 videos (MP4/MOV/WebM), pick a cover frame timestamp, write a shared caption or per-platform overrides for TikTok, Instagram Reels, YouTube Shorts, and Snapchat, then Publish Now, Schedule, or Save Draft.',
      '4) Queue & "Setup Needed" / "Needs API Setup": Standard users cannot edit API keys; if a platform shows Inactive or Setup Needed, ask the workspace admin or pick another connected channel, then click Retry.',
      '5) Support: Users can also contact support directly via the WhatsApp or Gmail buttons at the bottom-right corner.',
      'Security rule: Never fabricate private owner emails, phone numbers, API keys, or internal system details.',
    ].join('\n');

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contents = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const replyText = response.text?.trim();
      if (!replyText) {
        res.status(502).json({ error: 'The assistant returned an empty response. Please try again.' });
        return;
      }

      res.json({ reply: replyText });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Assistant request failed.';
      const status =
        msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')
          ? 429
          : msg.includes('403') || msg.includes('PERMISSION_DENIED') || msg.includes('API_KEY_INVALID')
          ? 403
          : 502;
      res.status(status).json({ error: msg });
    }
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ReelSync server listening on port ${PORT}`);
  });
}

void startServer();
