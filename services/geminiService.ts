import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

interface FilePayload {
  mimeType: string;
  data: string;
}

export async function* runChatStream(prompt: string, file?: FilePayload): AsyncGenerator<string> {
  try {
    const model = 'gemini-2.5-pro';

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
      contents = prompt;
    }

    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    for await (const chunk of responseStream) {
        yield chunk.text;
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