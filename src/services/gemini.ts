import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env';
import { Cookbook, RecipeMatch } from '../types/cookbook';
import { ExtractedRecipe, GroceryItem, VideoExtractionResult } from '../types/recipe';

// ─── Types for new AI functions ───────────────────────────────────────

export interface AIRecipeSuggestion {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  ingredients: { name: string; quantity: string; category: string }[];
  instructions: string[];
  nutritionEstimate: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tags: string[];
  matchScore: number;
}

export interface NutritionInsight {
  summary: string;
  tips: string[];
  warnings: string[];
  dailyScore: number;
  macroBreakdown: { protein: number; carbs: number; fat: number; fiber: number };
  recommendations: string[];
}

/**
 * Extract JSON from a response that may contain markdown fences or extra text.
 */
function extractJSON(text: string): any {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {}
  // Try to extract from ```json ... ``` blocks
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {}
  }
  // Try to find first { or [ and match to last } or ]
  const start = text.search(/[{\[]/);
  const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(text.substring(start, end + 1));
    } catch {}
  }
  throw new Error('Could not parse JSON from AI response');
}

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

// ─── Cookbook Recipe Finder ────────────────────────────────────────────

/**
 * Given a list of user's cookbooks and available ingredients,
 * ask Gemini to suggest matching recipes from those cookbooks.
 */
export async function findRecipesFromCookbooks(
  cookbooks: Cookbook[],
  availableIngredients: string[],
  dietaryPreferences?: string[],
): Promise<RecipeMatch[]> {
  const cookbookList = cookbooks
    .map((c) => `- "${c.title}" by ${c.author}`)
    .join('\n');

  const ingredientList = availableIngredients.join(', ');

  const dietNote =
    dietaryPreferences && dietaryPreferences.length > 0
      ? `\nDietary preferences/restrictions: ${dietaryPreferences.join(', ')}`
      : '';

  const prompt = `You are a culinary expert and cookbook encyclopedist. A user has the following cookbooks in their collection:

${cookbookList}

They currently have these ingredients available in their kitchen:
${ingredientList}
${dietNote}

Based on your knowledge of these cookbooks and their recipes, suggest up to 6 recipes from these specific cookbooks that the user could make with the ingredients they have (or are close to having).

For each recipe, respond in this exact JSON format (as a JSON array):
[
  {
    "title": "Recipe Name",
    "cookbookTitle": "Exact Cookbook Title",
    "cookbookAuthor": "Author Name",
    "matchedIngredients": ["ingredient1", "ingredient2"],
    "missingIngredients": ["ingredient3"],
    "matchPercentage": 85,
    "description": "Brief appetizing description of the dish",
    "estimatedTime": "30 min",
    "pageNumber": "p. 142 (approximate)"
  }
]

Important:
- Only suggest recipes that actually exist in or are typical of these cookbooks
- matchPercentage should reflect how many of the recipe's ingredients the user already has
- Sort by matchPercentage descending (best matches first)
- Keep descriptions concise and appetizing
- Return ONLY the JSON array, no other text`;

  try {
    const response = await ai.models.generateContent({
      model: config.gemini.models.flash,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '[]';
    const parsed = JSON.parse(text) as Omit<RecipeMatch, 'id'>[];

    return parsed.map((r, i) => ({
      ...r,
      id: `match-${Date.now()}-${i}`,
    }));
  } catch (error) {
    console.error('Gemini cookbook search error:', error);
    throw new Error('Failed to find recipes. Please check your API key and try again.');
  }
}

// ─── Video / URL Recipe Extractor ─────────────────────────────────────

/**
 * Given a URL (video or recipe page), ask Gemini to analyze it
 * and extract a structured recipe + grocery list.
 */
export async function extractRecipeFromUrl(
  url: string,
): Promise<VideoExtractionResult> {
  const isYouTube = /youtu\.?be/.test(url);
  const sourceHint = isYouTube
    ? 'This is a YouTube cooking video. Analyze the video page, title, description, and any available transcript to extract the full recipe.'
    : 'Analyze this recipe page to extract the full recipe.';

  const prompt = `You are a professional chef and recipe analyst. A user wants to cook a recipe they found at this URL:

${url}

${sourceHint}

Extract the complete recipe and create a grocery shopping list.

You MUST respond with ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "recipe": {
    "title": "Recipe Name",
    "sourceUrl": "${url}",
    "sourceTitle": "Name of the channel/blog/creator",
    "description": "Brief description of the dish",
    "servings": 4,
    "prepTime": "15 min",
    "cookTime": "30 min",
    "totalTime": "45 min",
    "ingredients": [
      {
        "name": "Ingredient Name",
        "quantity": "2 cups",
        "category": "Produce",
        "notes": "diced"
      }
    ],
    "instructions": [
      "Step 1 description",
      "Step 2 description"
    ],
    "tips": ["Helpful tip 1"]
  },
  "groceryList": [
    {
      "name": "Item Name",
      "quantity": "2 lbs",
      "category": "Produce",
      "notes": "optional note"
    }
  ],
  "totalEstimatedCost": "$25-35"
}

Rules:
- Consolidate duplicate ingredients in the groceryList and use practical grocery quantities
- Categories must be one of: Produce, Meat & Seafood, Dairy & Eggs, Bakery, Pantry Staples, Spices & Seasonings, Frozen, Beverages, Other
- Be specific with quantities for grocery shopping
- Output ONLY the JSON object, nothing else`;

  try {
    // NOTE: responseMimeType and thinkingConfig are NOT compatible with tools,
    // so we ask for JSON in the prompt and parse manually.
    const response = await ai.models.generateContent({
      model: config.gemini.models.flash,
      contents: prompt,
      config: {
        tools: [{ urlContext: {} }],
      },
    });

    const text = response.text || '{}';
    const parsed = extractJSON(text);

    // Add IDs and defaults to items
    const recipe: ExtractedRecipe = {
      ...parsed.recipe,
      id: `recipe-${Date.now()}`,
      extractedAt: new Date().toISOString(),
      ingredients: (parsed.recipe.ingredients || []).map(
        (ing: any, i: number) => ({
          id: `ing-${Date.now()}-${i}`,
          name: ing.name,
          quantity: ing.quantity,
          category: ing.category || 'Other',
          isChecked: false,
          notes: ing.notes,
        })
      ),
    };

    const groceryList: GroceryItem[] = (parsed.groceryList || []).map(
      (item: any, i: number) => ({
        id: `grocery-${Date.now()}-${i}`,
        name: item.name,
        quantity: item.quantity,
        category: item.category || 'Other',
        isChecked: false,
        notes: item.notes,
      })
    );

    return {
      recipe,
      groceryList,
      totalEstimatedCost: parsed.totalEstimatedCost,
    };
  } catch (error) {
    console.error('Gemini URL extraction error:', error);
    throw new Error('Failed to extract recipe. Please check the URL and try again.');
  }
}

// ─── Multi-URL Grocery List Combiner ──────────────────────────────────

/**
 * Given multiple URLs, extract recipes and produce a
 * combined, deduplicated grocery list.
 */
export async function combineGroceryLists(
  urls: string[],
): Promise<{ recipes: ExtractedRecipe[]; combinedList: GroceryItem[]; totalEstimatedCost: string }> {
  const urlList = urls.map((u, i) => `${i + 1}. ${u}`).join('\n');

  const prompt = `You are a professional chef and meal-prep expert. A user wants to cook recipes from ALL of the following URLs this week:

${urlList}

Please analyze each URL (they may be YouTube cooking videos, food blogs, or recipe websites). Extract the recipes and create ONE COMBINED, DEDUPLICATED grocery shopping list that covers ALL recipes.

You MUST respond with ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "recipes": [
    {
      "title": "Recipe Name",
      "sourceUrl": "the url",
      "sourceTitle": "Creator name",
      "description": "Brief description",
      "servings": 4,
      "totalTime": "45 min"
    }
  ],
  "combinedList": [
    {
      "name": "Item Name",
      "quantity": "Combined quantity for all recipes",
      "category": "Produce",
      "notes": "Used in: Recipe 1, Recipe 3"
    }
  ],
  "totalEstimatedCost": "$50-70"
}

Rules:
- COMBINE duplicate ingredients (e.g., if two recipes need onions, add the amounts together)
- Use practical grocery store quantities
- In notes, indicate which recipes use this ingredient
- Categories: Produce, Meat & Seafood, Dairy & Eggs, Bakery, Pantry Staples, Spices & Seasonings, Frozen, Beverages, Other
- Output ONLY the JSON object, nothing else`;

  try {
    // NOTE: responseMimeType and thinkingConfig are NOT compatible with tools,
    // so we ask for JSON in the prompt and parse manually.
    const response = await ai.models.generateContent({
      model: config.gemini.models.flash,
      contents: prompt,
      config: {
        tools: [{ urlContext: {} }],
      },
    });

    const text = response.text || '{}';
    const parsed = extractJSON(text);

    const recipes: ExtractedRecipe[] = (parsed.recipes || []).map(
      (r: any, i: number) => ({
        ...r,
        id: `recipe-${Date.now()}-${i}`,
        ingredients: [],
        instructions: [],
        extractedAt: new Date().toISOString(),
      })
    );

    const combinedList: GroceryItem[] = (parsed.combinedList || []).map(
      (item: any, i: number) => ({
        id: `grocery-${Date.now()}-${i}`,
        name: item.name,
        quantity: item.quantity,
        category: item.category || 'Other',
        isChecked: false,
        notes: item.notes,
      })
    );

    return {
      recipes,
      combinedList,
      totalEstimatedCost: parsed.totalEstimatedCost || 'N/A',
    };
  } catch (error) {
    console.error('Gemini multi-URL error:', error);
    throw new Error('Failed to process recipe URLs. Please try again.');
  }
}

// ─── AI Recipe Search / Generation ────────────────────────────────────

/**
 * Generate recipe suggestions based on a user query, cuisine filter, and
 * optionally the ingredients they already have in their pantry.
 */
export async function generateRecipesFromQuery(
  query: string,
  cuisine?: string,
  pantryIngredients?: string[],
): Promise<AIRecipeSuggestion[]> {
  const pantryNote =
    pantryIngredients && pantryIngredients.length > 0
      ? `\nThe user already has these ingredients in their pantry: ${pantryIngredients.join(', ')}. Prefer recipes that use these.`
      : '';

  const cuisineNote =
    cuisine && cuisine !== 'All'
      ? `\nThe user prefers ${cuisine} cuisine.`
      : '';

  const prompt = `You are a world-class chef and recipe recommender. A user is searching for recipes.

User query: "${query}"
${cuisineNote}${pantryNote}

Suggest 4-6 recipes that match the query. For each recipe, provide complete details.

Respond with ONLY a JSON array in this exact format:
[
  {
    "title": "Recipe Name",
    "description": "A brief appetizing description",
    "cuisine": "Italian",
    "estimatedTime": "30 min",
    "difficulty": "Easy",
    "servings": 4,
    "ingredients": [
      { "name": "Ingredient", "quantity": "2 cups", "category": "Produce" }
    ],
    "instructions": ["Step 1", "Step 2"],
    "nutritionEstimate": { "calories": 450, "protein": 25, "carbs": 50, "fat": 15 },
    "tags": ["healthy", "quick", "one-pot"],
    "matchScore": 92
  }
]

Rules:
- matchScore (0-100) reflects how well the recipe matches the query and available ingredients
- difficulty: Easy, Medium, or Hard
- Categories: Produce, Meat & Seafood, Dairy & Eggs, Bakery, Pantry Staples, Spices & Seasonings, Frozen, Beverages, Other
- nutrition values in grams (except calories)
- Sort by matchScore descending
- Return ONLY the JSON array`;

  try {
    const response = await ai.models.generateContent({
      model: config.gemini.models.flash,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '[]';
    const parsed = JSON.parse(text) as Omit<AIRecipeSuggestion, 'id'>[];

    return parsed.map((r, i) => ({
      ...r,
      id: `ai-recipe-${Date.now()}-${i}`,
    }));
  } catch (error) {
    console.error('Gemini recipe search error:', error);
    throw new Error('Failed to generate recipes. Please try again.');
  }
}

// ─── Nutrition Insights ───────────────────────────────────────────────

/**
 * Analyze a user's recent meals / tracked nutrition and return AI-powered insights.
 */
export async function getNutritionInsights(
  recentMeals: { name: string; calories: number; protein: number; carbs: number; fat: number }[],
  userProfile?: { age?: number; weight?: number; height?: number; goal?: string; diet?: string },
): Promise<NutritionInsight> {
  const mealsList = recentMeals
    .map((m) => `- ${m.name}: ${m.calories} cal, ${m.protein}g protein, ${m.carbs}g carbs, ${m.fat}g fat`)
    .join('\n');

  const profileNote = userProfile
    ? `\nUser profile: ${userProfile.age ? `Age ${userProfile.age}` : ''} ${userProfile.weight ? `Weight ${userProfile.weight}kg` : ''} ${userProfile.height ? `Height ${userProfile.height}cm` : ''} ${userProfile.goal ? `Goal: ${userProfile.goal}` : ''} ${userProfile.diet ? `Diet: ${userProfile.diet}` : ''}`
    : '';

  const prompt = `You are a nutritionist. Analyze this user's recent meals and give personalized insights.

Recent meals:
${mealsList}
${profileNote}

Respond with ONLY valid JSON:
{
  "summary": "One sentence overall nutrition summary",
  "tips": ["Actionable tip 1", "Actionable tip 2", "Actionable tip 3"],
  "warnings": ["Any nutritional concerns"],
  "dailyScore": 75,
  "macroBreakdown": { "protein": 25, "carbs": 50, "fat": 20, "fiber": 5 },
  "recommendations": ["Specific meal/food recommendations"]
}

Rules:
- dailyScore is 0-100 (how healthy the overall intake is)
- macroBreakdown percentages should sum to 100
- Keep tips practical and actionable
- warnings only if there are genuine concerns (empty array otherwise)
- Return ONLY the JSON`;

  try {
    const response = await ai.models.generateContent({
      model: config.gemini.models.flash,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    return JSON.parse(text) as NutritionInsight;
  } catch (error) {
    console.error('Gemini nutrition insights error:', error);
    throw new Error('Failed to generate nutrition insights.');
  }
}

// ─── Quick Recipe from Pantry ─────────────────────────────────────────

/**
 * Suggest quick recipe ideas from what the user has in their pantry.
 */
export async function getQuickRecipeIdeas(
  pantryIngredients: string[],
): Promise<{ title: string; description: string; time: string; ingredients: string[] }[]> {
  const prompt = `You are a creative home chef. The user has these ingredients in their pantry:
${pantryIngredients.join(', ')}

Suggest 3 quick, easy recipes they can make RIGHT NOW with these ingredients (they may not need all of them).

Respond with ONLY a JSON array:
[
  {
    "title": "Recipe Name",
    "description": "Brief appetizing description",
    "time": "20 min",
    "ingredients": ["ingredient1", "ingredient2"]
  }
]`;

  try {
    const response = await ai.models.generateContent({
      model: config.gemini.models.flash,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '[]';
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini quick recipe error:', error);
    throw new Error('Failed to generate recipe ideas.');
  }
}

// ─── Recipe Image Generation ──────────────────────────────────────────

/**
 * Generate a photorealistic food image using Gemini's image generation model.
 * Returns a base64-encoded data URI string, or null on failure.
 */
export async function generateRecipeImage(
  recipeTitle: string,
  recipeDescription?: string,
): Promise<string | null> {
  const descHint = recipeDescription
    ? ` The dish is described as: ${recipeDescription}.`
    : '';

  const prompt = `A photorealistic, appetizing, top-down food photography shot of "${recipeTitle}" plated beautifully on a modern ceramic dish.${descHint} Soft natural lighting, shallow depth of field, warm tones, clean background, professional food photography style. No text or watermarks.`;

  try {
    const response = await ai.models.generateContent({
      model: config.gemini.models.image,
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: '1:1',
        },
      },
    });

    // Look for inline image data in the response parts
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
          const base64 = part.inlineData.data;
          const mimeType = part.inlineData.mimeType;
          return `data:${mimeType};base64,${base64}`;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Gemini image generation error:', error);
    return null;
  }
}

// ─── Audio Transcription (Speech-to-Text) ─────────────────────────────

/**
 * Transcribe audio using Gemini's audio understanding capabilities.
 * Accepts a base64-encoded audio string and returns the transcribed text.
 */
export async function transcribeAudio(
  base64Audio: string,
  mimeType: string = 'audio/mp4',
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: config.gemini.models.flash,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Audio,
              },
            },
            {
              text: 'Transcribe this audio clip. Return ONLY the spoken text, nothing else. If the audio is about food or cooking, keep the exact words. If no speech is detected, return an empty string.',
            },
          ],
        },
      ],
    });

    const text = response.text?.trim() || '';
    return text;
  } catch (error) {
    console.error('Gemini audio transcription error:', error);
    throw new Error('Failed to transcribe audio. Please try again.');
  }
}

// ─── Chatbot Conversational AI ────────────────────────────────────────

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

/**
 * Send a conversational message to Gemini with full chat history.
 * Returns the bot's text reply.
 */
export async function chatWithGemini(
  userMessage: string,
  history: ChatTurn[] = [],
  pantryContext?: string,
): Promise<string> {
  let systemInstruction = `You are CulinaMind AI — a friendly, knowledgeable cooking and food assistant inside a mobile recipe app. Your personality is warm, encouraging, and concise.

You can help users with:
• Recipe suggestions and step-by-step cooking instructions
• Ingredient substitutions and cooking tips
• Nutrition advice and dietary information
• Meal planning and food storage guidance
• Cuisine-specific techniques (Indian, Italian, Mexican, Asian, etc.)

Rules:
- Keep answers concise and mobile-friendly (short paragraphs, bullet points).
- Use emojis sparingly to keep it fun.
- If a question is completely unrelated to food/cooking, politely redirect.
- When suggesting a recipe, include estimated time and difficulty.
- Format ingredient lists and steps clearly.`;

  if (pantryContext) {
    systemInstruction += `\n\n${pantryContext}`;
  }

  try {
    // Build the contents array with history
    const contents = history.map((turn) => ({
      role: turn.role === 'model' ? ('model' as const) : ('user' as const),
      parts: [{ text: turn.text }],
    }));

    // Add the current user message
    contents.push({
      role: 'user' as const,
      parts: [{ text: userMessage }],
    });

    const response = await ai.models.generateContent({
      model: config.gemini.models.flash,
      contents,
      config: {
        systemInstruction,
      },
    });

    return response.text?.trim() || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error('Gemini chat error:', error);
    throw new Error('Failed to get a response. Please check your connection and try again.');
  }
}
