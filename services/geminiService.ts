import { GoogleGenAI, Type } from "@google/genai";
import { ShoppingListData } from '../types';

// FIX: Per the coding guidelines, the API key must be obtained exclusively from `process.env.API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    shoppingList: {
      type: Type.ARRAY,
      description: "La lista della spesa strutturata e suddivisa per categorie.",
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "Categoria degli articoli, es. Frutta e Verdura, Latticini, Carne, Dispensa." },
          items: {
            type: Type.ARRAY,
            description: "Elenco degli articoli in questa categoria.",
            items: { type: Type.STRING }
          }
        },
        required: ["category", "items"],
      }
    },
    recipeSuggestions: {
      type: Type.ARRAY,
      description: "Suggerimenti per ricette basate sulla lista della spesa.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Nome della ricetta." },
          ingredients: {
            type: Type.ARRAY,
            description: "Ingredienti principali per la ricetta.",
            items: { type: Type.STRING }
          }
        },
        required: ["name", "ingredients"],
      }
    },
    forgottenItemSuggestions: {
      type: Type.ARRAY,
      description: "Suggerimenti per articoli comuni che l'utente potrebbe aver dimenticato.",
      items: {
        type: Type.STRING
      }
    }
  },
  required: ["shoppingList", "recipeSuggestions", "forgottenItemSuggestions"],
};

export const generateShoppingList = async (transcript: string): Promise<ShoppingListData> => {
  const prompt = `
    Sei un assistente per la spesa intelligente. Il tuo compito è analizzare la seguente trascrizione del discorso di un utente e compiere tre azioni:
    1. Crea una lista della spesa strutturata. Raggruppa gli articoli in categorie logiche in italiano (es. Frutta e Verdura, Latticini e Formaggi, Carne e Pesce, Prodotti da Forno, Dispensa, Bevande, Casa e Igiene).
    2. Basandoti sugli articoli menzionati, suggerisci 2-3 semplici ricette che l'utente potrebbe preparare. Per ogni ricetta, elenca gli ingredienti principali.
    3. Suggerisci 3-5 articoli di uso comune che l'utente potrebbe aver dimenticato, correlati alla sua lista (es. se menziona la pasta, suggerisci parmigiano o sugo per la pasta se non già in lista).

    Trascrizione dell'utente: "${transcript}"

    Rispondi solo con un oggetto JSON valido che segua lo schema fornito.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text.trim();
    const data: ShoppingListData = JSON.parse(jsonText);
    return data;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate shopping list from Gemini API.");
  }
};