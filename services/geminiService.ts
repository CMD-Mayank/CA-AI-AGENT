import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

// Initializing the AI client with the environment variable injected by Netlify/Vite
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

interface FilePayload {
  mimeType: string;
  data: string;
}

export async function* runChatStream(prompt: string, file?: FilePayload): AsyncGenerator<string> {
  try {
    // Using gemini-3-pro-preview for advanced CA advisory tasks as per latest guidelines
    const model = 'gemini-3-pro-preview';

    let contents: any;

    if (file) {
      contents = {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: file.mimeType,
              data: file.data,
            },
          },
        ],
      };
    } else {
      contents = {
        parts: [{ text: prompt }]
      };
    }

    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    for await (const chunk of responseStream) {
        if (chunk.text) {
          yield chunk.text;
        }
    }

  } catch (error) {
    console.error("Error running chat stream with Gemini:", error);
    if (error instanceof Error) {
        yield `An error occurred while communicating with the AI. Details: ${error.message}`;
    } else {
        yield "An unknown error occurred while communicating with the AI.";
    }
  }
}