
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Use the API key directly in development - in production this should be stored securely
const API_KEY = "AIzaSyBRYjNcqTWcajbDT6wSa0g_3uPLSLXjy48";
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 2048,
  responseMimeType: "text/plain",
};

export type ChatSession = Awaited<ReturnType<typeof model.startChat>>;

// Start a new chat session
export const startChatSession = () => {
  return model.startChat({
    generationConfig,
    history: [],
  });
};

// Get text suggestions based on current content
export const getSuggestions = async (content: string): Promise<string> => {
  try {
    const prompt = `Based on the following note content, suggest what might come next. Keep suggestions concise, relevant, and helpful. Only provide the suggestion, no explanations. Note content: "${content}"`;
    
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error getting suggestions:", error);
    return "";
  }
};

// Check grammar and suggest improvements with a cleaner format
export const checkGrammar = async (text: string): Promise<string> => {
  try {
    if (!text || text.length < 10) return "";
    
    const prompt = `Review the following text for grammar and style issues. For each issue, provide clear feedback in this format:
    
    "Issue: [describe the grammar issue simply]
    Correction: [provide the corrected version]"
    
    Keep feedback concise and focus only on actual grammar problems. Text to check: "${text}"`;
    
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error checking grammar:", error);
    return "";
  }
};

// Analyze note content and provide insights
export const analyzeContent = async (content: string): Promise<string> => {
  try {
    if (content.length < 50) return "";
    
    const prompt = `Analyze this note content and provide a brief insight (key concepts, main ideas, etc). Be very concise: "${content}"`;
    
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error analyzing content:", error);
    return "";
  }
};
