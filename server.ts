import express from 'express';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON payload limit to handle base64 images
app.use(express.json({ limit: '15mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// AI Syllabus Parsing Route
app.post('/api/analyze-syllabus', async (req, res) => {
  try {
    const { image, mimeType, textContent } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in the environment variables.',
      });
    }

    if (!image && !textContent) {
      return res.status(400).json({
        error: 'Please provide either a syllabus image or syllabus text content.',
      });
    }

    const now = new Date();
    const currentLocalTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const systemPrompt = `You are an elite academic assistant and productivity scheduler. 
Your goal is to parse a class syllabus (provided either as an image, text document, or both) and extract all structural course info, assessments, and grade weightings.
Then, you must automatically create a sequential, smart work schedule (milestones) leading up to each assignment's due date so that students never miss a deadline.

IMPORTANT DEADLINE RESOLUTION RULES:
- Today's date is strictly ${currentLocalTime}.
- Assume all extracted due dates are in the future or present (${currentLocalTime} onwards).
- Convert all dates strictly into 'YYYY-MM-DD' format. If a syllabus mentions "Oct 30", return "2026-10-30". If it mentions an upcoming month, calculate based on the current year 2026.
- If only a week number is given (e.g., "Week 4 Assignment"), calculate a realistic date starting from today (${currentLocalTime}).

MILESTONE CREATION RULES:
- For every assignment, quiz, exam, or project, generate 2 to 4 actionable, bite-sized "milestones" (study sessions or draft goals) that lead up to the due date.
- Each milestone must have an estimated 'durationHours' (how long the study session is, e.g., 1.5, 2.0, 3.0) and 'daysBeforeDue' (e.g., 7 days before, 4 days before, 1 day before).
- Make sure milestones are logically ordered (e.g., researching comes before drafting, draft comes before proofreading, studying content comes before final mock exams).
- For very minor items (e.g., low-weight homework of 1-2%), 1 simple milestone (e.g., "Complete exercise sheet" 2 days before) is enough.
- For high-priority projects/exams (e.g., 15%+ weight), design 3 or 4 milestones with generous time buffers.`;

    const contents: any[] = [];

    if (image && mimeType) {
      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: image,
        },
      });
    }

    const userPrompt = textContent
      ? `Here is the text content of the syllabus:\n\n${textContent}\n\nAnalyze this syllabus, extract course info and assignments, and schedule out work milestones.`
      : `Analyze this syllabus image, extract course info and assignments, and schedule out work milestones.`;

    contents.push({ text: userPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: contents },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            courseName: {
              type: Type.STRING,
              description: 'The full official name of the course (e.g., "Organic Chemistry I", "History of Modern Art")',
            },
            courseCode: {
              type: Type.STRING,
              description: 'The department code and course number if present (e.g., "CHEM 2301", "HIST-105"). Default to empty string if none.',
            },
            assignments: {
              type: Type.ARRAY,
              description: 'All deliverables, exams, quizzes, essays, and projects found in the syllabus.',
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: 'Specific and clean name of the assignment/exam (e.g., "Midterm Exam 1", "Research Paper Draft")',
                  },
                  dueDate: {
                    type: Type.STRING,
                    description: 'The due date formatted strictly as YYYY-MM-DD. Calculate/estimate if relative.',
                  },
                  description: {
                    type: Type.STRING,
                    description: 'Short summary of guidelines, topics covered, or submission requirements.',
                  },
                  weight: {
                    type: Type.STRING,
                    description: 'The percentage of final grade or points (e.g., "15%", "100 points"). Default to "N/A" if unknown.',
                  },
                  priority: {
                    type: Type.STRING,
                    description: 'Priority ranking based on academic weight and prep required: "high", "medium", or "low"',
                  },
                  milestones: {
                    type: Type.ARRAY,
                    description: 'Step-by-step preparatory sub-tasks leading up to the deadline.',
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: {
                          type: Type.STRING,
                          description: 'What the student will do (e.g., "Outline paper", "Revise lecture notes chapters 1-4", "Final review & proofread")',
                        },
                        description: {
                          type: Type.STRING,
                          description: 'Actionable detail on what this step entails.',
                        },
                        durationHours: {
                          type: Type.NUMBER,
                          description: 'Realistic estimate of time in hours (e.g., 1.5, 2, 4)',
                        },
                        daysBeforeDue: {
                          type: Type.INTEGER,
                          description: 'How many days before the assignment is due to complete this milestone (e.g., 7 means study 1 week before; 1 means study the day before)',
                        },
                      },
                      required: ['title', 'description', 'durationHours', 'daysBeforeDue'],
                    },
                  },
                },
                required: ['title', 'dueDate', 'description', 'weight', 'priority', 'milestones'],
              },
            },
          },
          required: ['courseName', 'courseCode', 'assignments'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error analyzing syllabus:', error);
    return res.status(500).json({
      error: 'Failed to analyze syllabus. Please try again with a clearer image or text.',
      details: error.message || error,
    });
  }
});

// Configure Vite or Static files depending on Environment
async function start() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
          overlay: false,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite Dev Server loaded with attached HTTP server.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production Static serving active.');
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

start();
