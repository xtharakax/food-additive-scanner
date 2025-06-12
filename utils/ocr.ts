import axios from 'axios';
import { supabase } from './supabaseClient';

const TOGETHER_API_KEY = 'dea4c7366c52c9ca750b5b438182817d2acb6b12fbb923464e2c5beaa4735c1f'; // Replace with your actual API key, ideally from environment variables
const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';

export async function getOCRResult(base64Image: string): Promise<string> {
  try {
    const response = await axios.post(TOGETHER_API_URL, {
      model: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Only extract the text and Dont add anything else.' },
            { type: 'image_url', image_url: { url: base64Image } }
          ]
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    // Assuming the response structure is similar to OpenAI chat completions
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      return 'No text found.';
    }

  } catch (error) {
    console.error('Error calling Together API:', error);
    return 'Error extracting text.';
  }
}

// Function to process extracted text and identify food additives using DeepSeek model

export interface FoodAdditive {
  id: number;
  created_at: string; // ISO 8601 date string
  e_code: string; // E code with optional subcode
  name: string; // Name of the additive
  category: string; // Brief description of the additive and its safety
  classification: string;
  safetyValue: string// Risk level: 1 (low), 2 (moderate), 3 (high); // Safety information, e.g., "safe", "unsafe", "controversial"
  active: null;
}

export async function extractAdditivesFromText(text: string): Promise<FoodAdditive[]> {
  console.log('Extracting additives from text:', text);

  // Extract E-codes with E prefix (E100, E202, E161g, E1202, etc.)
  const ecodeRegex = /\bE\d{3,4}[a-z]?\b/gi;
  const ecodesWithE: string[] = text.match(ecodeRegex) || [];

  // Extract bare codes (100, 202, 161g, 1202, etc.) not preceded by 'E'
  const bareCodeRegex = /(?<!E)\b\d{3,4}[a-z]?\b/gi;
  const bareCodes: string[] = text.match(bareCodeRegex) || [];

  // Normalize all to E-codes
  const allEcodes: string[] = [
    ...ecodesWithE.map(e => e.toUpperCase()),
    ...bareCodes.map(b => `E${b.toUpperCase()}`)
  ];
  const uniqueEcodes: string[] = [...new Set(allEcodes)];

  console.log('Unique E-codes extracted:', uniqueEcodes);
  

  if (uniqueEcodes.length === 0) {
    return [];
  }

  // Query Supabase for additive details
  const { data, error } = await supabase
    .from('FoodAddictives')
    .select('*')
    .in('e_code', uniqueEcodes);

  if (error) {
    console.error('Supabase query error:', error);
    return [];
  }

  // Map response to FoodAdditive interface
  return (data || []).map((item: any) => ({
    id: item.id,
    created_at: item.created_at,
    e_code: item.e_code,
    name: item.name,
    category: item.category,
    classification: item.classification,
    safetyValue: item.safety_level === 1 ? 'low' : item.safety_level === 2 ? 'moderate' : 'high',
    active: item.active ?? null,
  }));
}

export async function extractECodesWithLLM(text: string): Promise<string[]> {
  try {
    const response = await axios.post(TOGETHER_API_URL, {
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract all food additive from the following text and return them as a comma-separated E-Code list. Only output the codes.' },
            { type: 'text', text }
          ]
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      // Expecting a comma-separated string of E-codes
      const codes = response.data.choices[0].message.content;
      console.log('Extracted E-codes:', codes);
      
      return codes.split(',').map((c: string) => c.trim()).filter(Boolean);
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error calling LLM for E-codes:', error);
    return [];
  }
}

export async function getAdditivesFromImage(base64Image: string): Promise<any[]> {
  // 1. Get text from OCR
  const ocrText = await getOCRResult(base64Image);

  // 2. Extract E-codes using LLM
  const eCodes = await extractECodesWithLLM(ocrText);

  // 3. Convert E-codes array to a string for extractAdditivesFromText
  const eCodesText = eCodes.join(', ');

  // 4. Pass to extractAdditivesFromText to get additive details from Supabase
  return await extractAdditivesFromText(eCodesText);
}