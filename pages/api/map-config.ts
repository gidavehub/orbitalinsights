import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ==============================================================================
// 1. SETUP AND CONFIGURATION
// ==============================================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SENTINEL_INSTANCE_ID = process.env.SENTINEL_INSTANCE_ID;

if (!GEMINI_API_KEY || !SENTINEL_INSTANCE_ID) {
    throw new Error("Server configuration error: Missing Gemini API Key or Sentinel Instance ID.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// ==============================================================================
// 2. HELPER FUNCTIONS (Unchanged)
// ==============================================================================

async function refineLocationName(prompt: string): Promise<string> {
    console.log(`[GEMINI] Refining location for prompt: "${prompt}"`);
    const instruction = `You are a geocoding assistant. Refine the user's query into a formal location name suitable for an API. Return ONLY the formal name. Examples: "burma" -> "Myanmar", "the big apple" -> "New York City, USA"`;
    const fullPrompt = `${instruction}\n\nUser Input: "${prompt}"\nYour Response:`;
    const result = await model.generateContent(fullPrompt);
    const refinedName = result.response.text().trim();
    if (!refinedName) throw new Error("Gemini failed to refine the location name.");
    console.log(`[GEMINI] Refined name: "${refinedName}"`);
    return refinedName;
}

async function geocode(locationName: string): Promise<{ location: string, bbox: number[] }> {
    console.log(`[TOOL] Geocoding location: "${locationName}"`);
    const encodedLocation = encodeURIComponent(locationName);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1`;
    const response = await fetch(url, { headers: { 'User-Agent': 'OrbitalInsightApp/1.0' } });
    if (!response.ok) throw new Error(`Nominatim API failed: ${response.statusText}`);
    const data = await response.json();
    if (!data || data.length === 0) throw new Error(`No geocoding results for "${locationName}"`);
    const result = data[0];
    const bbox = result.boundingbox.map(parseFloat);
    return { location: result.display_name, bbox };
}

// ==============================================================================
// 3. MAIN API HANDLER
// ==============================================================================
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'A location prompt is required.' });

    try {
        // Step 1: Refine the user's prompt.
        const refinedLocation = await refineLocationName(prompt);
        // Step 2: Geocode to get the bounding box.
        const geoData = await geocode(refinedLocation);

        // ======================= THE CRITICAL FIX IS HERE =======================
        // Nominatim API returns bbox as [south, north, west, east].
        // We destructure it explicitly to avoid any confusion.
        const [south, north, west, east] = geoData.bbox;

        // Step 3: Send the configuration to the frontend.
        res.status(200).json({
            // Leaflet requires bounds in a [[south, west], [north, east]] format.
            // We construct this structure explicitly and robustly.
            bounds: [ [south, west], [north, east] ],
            instanceId: SENTINEL_INSTANCE_ID
        });
        // =========================================================================

    } catch (error: any) {
        console.error("\n--- AN ERROR OCCURRED IN THE HANDLER ---");
        console.error(error);
        res.status(500).json({ error: error.message || "An unknown error occurred." });
    }
}
