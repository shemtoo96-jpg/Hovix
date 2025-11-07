
import { GoogleGenAI, Type } from "@google/genai";
import type { MoodEntry, Mood, MovieSuggestion, PlaylistSuggestion } from '../types';
import { MOODS } from '../constants';

let ai: GoogleGenAI | null = null;
const isOffline = () => !navigator.onLine;

const getAI = () => {
  if (!ai) {
    if (!process.env.API_KEY) {
      // In a real app, you would handle this more gracefully.
      // For this context, we alert and throw an error.
      alert("API_KEY environment variable not set. AI features will be disabled.");
      throw new Error("API_KEY not set.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

const stripHtml = (html: string): string => {
    if (typeof document === 'undefined') {
      // Fallback for non-browser environments if needed
      return html.replace(/<[^>]*>?/gm, '');
    }
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
};


export const getAIEmoCoachFeedback = async (mood: Mood, journalText: string): Promise<string | null> => {
  if (isOffline()) return null;
  try {
    const ai = getAI();
    const cleanJournalText = stripHtml(journalText);
    const prompt = `Act as an empathetic and insightful AI emotion coach named 'Aura'. A user is feeling "${mood.name}" and wrote the following journal entry: "${cleanJournalText}". 
    Provide a short (under 60 words), supportive, and uplifting response. Start with a sentence that acknowledges their feeling. You can suggest a simple mindfulness exercise, an uplifting quote, or a gentle affirmation that is relevant to their mood. Do not ask questions. Your tone should be soft, calm, and emotional.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    // FIX: The .text accessor from the response is a property, not a function.
    return response.text;
  } catch (error) {
    console.error("Error getting AI coach feedback:", error);
    return "I'm here for you. Remember to be kind to yourself today.";
  }
};

// FIX: Renamed function from `getAI MoodInsights` to `getAIMoodInsights` to fix a syntax error.
export const getAIMoodInsights = async (moodEntries: MoodEntry[]): Promise<string> => {
  if (isOffline()) return "AI insights are unavailable while you're offline.";
  if (moodEntries.length < 5) {
    return "Keep logging your moods for a few more days to unlock your first AI insight!";
  }
  try {
    const ai = getAI();
    const formattedEntries = moodEntries.map(e => ({ date: new Date(e.date).toLocaleDateString(), mood: e.mood.name }));
    const prompt = `As an AI data analyst named 'Aura', analyze the following mood data from a user's journal: ${JSON.stringify(formattedEntries)}.
    Identify one or two interesting patterns or insights. For example, mention if they seem happier on weekends, if certain moods cluster together, or if there's a trend.
    Present this as a short, friendly observation in under 40 words. Start with "Here's a little insight for you...".`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    // FIX: The .text accessor from the response is a property, not a a function.
    return response.text;
  } catch (error) {
    console.error("Error getting AI mood insights:", error);
    return "Could not generate insights at this time. Please try again later.";
  }
};

export const getAICopingTip = async (): Promise<string> => {
    if (isOffline()) return "Coping tips are unavailable while you're offline.";
    try {
      const ai = getAI();
      const prompt = `Act as a compassionate mental well-being coach named 'Aura'. Provide one short, simple, and actionable coping strategy for someone feeling anxious, sad, or stressed. The tip should be under 40 words and easy to do right now. Examples: a grounding technique, a mindfulness exercise, a quick physical action. The response should be the tip itself, without any introductory text.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      // FIX: The .text accessor from the response is a property, not a function.
      return response.text;
    } catch (error) {
      console.error("Error getting AI coping tip:", error);
      return "Take a deep breath, hold for a moment, and exhale slowly. You are in control.";
    }
  };


export const getAIMorningQuote = async (): Promise<string> => {
    if (isOffline()) return "Today is a new beginning.";
    try {
        const ai = getAI();
        const prompt = `Act as Aura, a gentle and inspiring AI friend. Provide one short, positive, and motivational quote for the morning. The quote should be under 25 words. Do not include any introductory text like 'Here is your quote'.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        // FIX: The .text accessor from the response is a property, not a function.
        return response.text;
    } catch (error) {
        console.error("Error getting AI morning quote:", error);
        return "The best way to predict the future is to create it.";
    }
};

export const getAIEveningReflection = async (): Promise<string> => {
    if (isOffline()) return "What was a moment of peace you found today?";
    try {
        const ai = getAI();
        const prompt = `Act as Aura, a gentle and insightful AI friend. Provide one short, simple, and calming question for evening reflection. The question should be under 20 words and encourage a moment of peace or gratitude. Do not include any introductory text.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        // FIX: The .text accessor from the response is a property, not a function.
        return response.text;
    } catch (error) {
        console.error("Error getting AI evening reflection:", error);
        return "What is one small thing that brought you comfort today?";
    }
};

export interface EmotionScanResult {
  emotion: string; // e.g., "Happy", "Sad"
  intensity: number; // From 0.1 to 1.0
  suggestion: string;
}

export const getEmotionFromImage = async (base64Image: string): Promise<EmotionScanResult | null> => {
  if (isOffline()) return null;
  try {
    const ai = getAI();
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };
    const textPart = {
      text: `Analyze the dominant emotion of the person in this image. Respond in JSON format. The JSON object should have three keys: "emotion" (one of: ${MOODS.map(m => m.name).join(', ')}), "intensity" (a number from 0.1 to 1.0 representing how strongly this emotion is expressed), and "suggestion" (a short, gentle activity suggestion under 20 words based on the emotion).`
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emotion: { type: Type.STRING },
            intensity: { type: Type.NUMBER },
            suggestion: { type: Type.STRING },
          }
        }
      }
    });
    
    // FIX: The .text accessor from the response is a property, not a function.
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText) as EmotionScanResult;

    // Validate the emotion and intensity
    if (MOODS.find(m => m.name.toLowerCase() === result.emotion.toLowerCase()) && result.intensity >= 0.1 && result.intensity <= 1.0) {
        return result;
    }
    console.warn("AI returned an unrecognized emotion or invalid intensity:", result);
    return null;

  } catch (error) {
    console.error("Error getting emotion from image:", error);
    return null;
  }
};

export interface DashboardAIData {
  affirmation: string;
  playlists: PlaylistSuggestion[];
  movies: MovieSuggestion[];
  forecast: string;
}

export const getAIDashboardData = async (mood: Mood | null, moodEntries: MoodEntry[]): Promise<DashboardAIData> => {
  if (isOffline()) return {
    affirmation: "You are capable of amazing things.",
    playlists: [],
    movies: [],
    forecast: "AI forecast is unavailable while you're offline."
  };

  try {
    const ai = getAI();
    
    const moodContext = mood ? `The user is currently feeling "${mood.name}".` : "The user has not specified a mood yet.";
    const suggestionPrompt = mood ? `
      - A list of 3 creative and distinct playlist suggestions that would fit this mood. For each, provide a "title" and a short "description" (under 15 words).
      - A list of 2 well-known movie suggestions for this mood. For each, provide a "title", a "description" (under 20 words), and its release "year".
    ` : "";
    
    let forecastContext = "";
    let forecastPromptPart = `- A "forecast" which is a short, welcoming message encouraging the user to start logging their moods.`;
    
    if (moodEntries.length >= 7) {
        const formattedEntries = moodEntries.slice(0, 15).map(e => {
            const cleanJournal = stripHtml(e.journal);
            return {
                date: new Date(e.date).toLocaleDateString(undefined, { weekday: 'long' }),
                mood: e.mood.name,
                journal: cleanJournal.substring(0, 50) + (cleanJournal.length > 50 ? '...' : '')
            };
        });
        forecastContext = `User's recent mood history: ${JSON.stringify(formattedEntries)}.`;
        forecastPromptPart = `- A "forecast" with a gentle, proactive emotional trend based on the user's recent history. The forecast should be under 50 words in a friendly, supportive tone. If there's no clear pattern, offer general encouragement.`
    } else if (moodEntries.length > 0) {
        forecastContext = `User has started logging moods but has less than 7 days of data.`;
        forecastPromptPart = `- A "forecast" which is a simple encouraging message for the week ahead, as there isn't enough data for a full trend analysis.`;
    }

    const prompt = `Act as Aura, a gentle and inspiring AI friend. Provide the following content in a single JSON response:
      - One short, powerful, and positive daily "affirmation" (under 20 words, first person).
      ${suggestionPrompt}
      ${forecastPromptPart}
    
    Context for suggestions: ${moodContext}
    Context for forecast: ${forecastContext}
    `;

    const properties: any = {
      affirmation: { type: Type.STRING },
      forecast: { type: Type.STRING },
    };
    const requiredFields = ['affirmation', 'forecast'];
    
    if (mood) {
      properties.playlists = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ['title', 'description']
        }
      };
      properties.movies = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            year: { type: Type.INTEGER },
          },
          required: ['title', 'description', 'year']
        }
      };
      requiredFields.push('playlists', 'movies');
    }
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: properties,
          required: requiredFields,
        }
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    if (!mood) {
      result.playlists = [];
      result.movies = [];
    }
    
    return result as DashboardAIData;

  } catch (error) {
    console.error("Error getting AI dashboard data:", error);
    const fallbackPlaylists = mood ? [
      { title: `Music for feeling ${mood.name}`, description: "A collection of tracks for your mood." },
      { title: `${mood.name} Vibes`, description: "Songs to match how you feel." },
      { title: `Aura's ${mood.name} Mix`, description: "A special mix just for you." },
    ] : [];
    const fallbackMovies = mood ? [
      { title: 'An Uplifting Movie', description: 'A classic film to lift your spirits.', year: 2000 },
      { title: 'A Comforting Film', description: 'A gentle movie to soothe the soul.', year: 2010 },
    ] : [];
    return {
      affirmation: "I choose to be happy and to love myself today.",
      playlists: fallbackPlaylists,
      movies: fallbackMovies,
      forecast: "Could not generate a forecast right now. Let's focus on today.",
    };
  }
};


export const getAILearningContent = async (topic: string): Promise<string> => {
  if (isOffline()) return "Learning content is unavailable while you're offline. Please reconnect to access this feature.";
  try {
    const ai = getAI();
    const prompt = `Act as Aura, a friendly and accessible therapist. Explain the topic of "${topic}" in a simple, encouraging, and actionable way. The content should be around 250 words. Use markdown for formatting: use '#' for the main title, '##' for subheadings, '*' for bullet points, and '**' for bold text. Your goal is to provide a mini-article that is both informative and comforting. Include at least one practical tip or a simple exercise.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error(`Error getting AI learning content for topic "${topic}":`, error);
    return "I'm having a little trouble gathering my thoughts on this topic. Please try again in a moment.";
  }
};
