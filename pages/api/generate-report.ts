// FILE: pages/api/generate-report.ts (Corrected and Perfected)

import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Part } from '@google/generative-ai';

// ==============================================================================
// 1. SETUP AND CONFIGURATION (COMBINED)
// ==============================================================================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;
const SENTINEL_INSTANCE_ID = process.env.SENTINEL_INSTANCE_ID;

if (!GEMINI_API_KEY || !SENTINEL_INSTANCE_ID || !GOOGLE_API_KEY || !SEARCH_ENGINE_ID) {
    throw new Error("Server configuration error: Missing one or more required API keys or IDs in .env.local file.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const LAYERS_TO_ANALYZE = [
    { id: '1_TRUE_COLOR', name: 'True Color' },
    { id: 'NDVI', name: 'Vegetation Health (NDVI)' },
    { id: 'NDWI', name: 'Water Bodies (NDWI)' },
    { id: 'POLLUTION', name: 'Air Pollution (NO₂)' }
];

// ==============================================================================
// 2. SERVER-SIDE TOOLS AND HELPERS (COMBINED)
// ==============================================================================

const writeStreamChunk = (res: NextApiResponse, data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
};

async function refineLocationName(prompt: string): Promise<string> {
    const instruction = `You are a geocoding assistant. Refine the user's query into a formal location name suitable for an API. Return ONLY the formal name. Examples: "burma" -> "Myanmar", "the big apple" -> "New York City, USA"`;
    const fullPrompt = `${instruction}\n\nUser Input: "${prompt}"\nYour Response:`;
    const result = await model.generateContent(fullPrompt);
    const refinedName = result.response.text().trim();
    if (!refinedName) throw new Error("Gemini failed to refine the location name.");
    return refinedName;
}

async function geocode(locationName: string): Promise<{ location: string, bbox: number[] }> {
    const encodedLocation = encodeURIComponent(locationName);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1`;
    const response = await fetch(url, { headers: { 'User-Agent': 'OrbitalInsightApp/1.0' } });
    if (!response.ok) throw new Error(`Nominatim geocoding API failed: ${response.statusText}`);
    const data = await response.json();
    if (!data || data.length === 0) throw new Error(`No geocoding results found for "${locationName}"`);
    const result = data[0];
    const bbox = result.boundingbox.map(parseFloat);
    return { location: result.display_name, bbox };
}

async function searchTheWeb(query: string): Promise<any> {
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=5`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Google Search API failed with status: ${response.status}`);
    const data = await response.json();
    if (!data.items) return [];
    return data.items.map((item: any) => ({
        title: item.title, url: item.link, snippet: item.snippet
    }));
}

async function fetchSentinelImageForAnalysis(bbox: [number, number, number, number], date: Date, layer: string): Promise<Part> {
    const wmsUrl = `https://services.sentinel-hub.com/ogc/wms/${SENTINEL_INSTANCE_ID}`;
    const time = `${date.toISOString().split('T')[0]}`;
    const params = new URLSearchParams({
        SERVICE: 'WMS', REQUEST: 'GetMap', LAYERS: layer, BBOX: bbox.join(','),
        WIDTH: '512', HEIGHT: '512', FORMAT: 'image/png', CRS: 'EPSG:4326', TIME: `${time}/${time}`
    });
    const requestUrl = `${wmsUrl}?${params.toString()}`;
    const response = await fetch(requestUrl);
    if (!response.ok) throw new Error(`Failed to fetch image for layer ${layer}. Status: ${response.status}`);
    const imageBuffer = await response.arrayBuffer();
    return { inlineData: { mimeType: 'image/png', data: Buffer.from(imageBuffer).toString('base64') } };
}

// ==============================================================================
// 3. MAIN STREAMING API HANDLER
// ==============================================================================
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
        const { prompt, historicalDate, currentDate } = req.body;

        // === STAGE 1: GEOLOCATION ===
        writeStreamChunk(res, { status: "Refining location from your prompt..." });
        const refinedLocation = await refineLocationName(prompt);

        writeStreamChunk(res, { status: `Geocoding "${refinedLocation}"...` });
        const geoData = await geocode(refinedLocation);
        
        // ======================= THE CRITICAL FIX IS HERE =======================
        // Nominatim API returns bbox as [south, north, west, east].
        // We must be EXTREMELY precise about the order for different services.
        const [south, north, west, east] = geoData.bbox;

        // For Leaflet on the frontend, the format is [[south, west], [north, east]]
        const mapConfigForFrontend = {
            bounds: [[south, west], [north, east]],
            instanceId: SENTINEL_INSTANCE_ID
        };

        // For Sentinel Hub WMS API, the format MUST BE [west, south, east, north].
        // This line now correctly constructs the bounding box for the image fetch request,
        // matching the logic from the original working `analyze.ts` file.
        const wmsBbox: [number, number, number, number] = [west, south, east, north];
        // =========================================================================


        // === STAGE 2: AGENT 1 - RESEARCHER ===
        writeStreamChunk(res, { status: "Agent 1: Performing web research on climate effects..." });
        const researcherPrompt = `From the user's query, identify the main geographical location. Then, call the 'searchTheWeb' tool with a query formatted as "{Location Name} climate change". User Query: "${prompt}"`;
        const researcherChat = model.startChat({ tools: [{ functionDeclarations: [{ name: 'searchTheWeb', description: 'Performs a live web search.', parameters: { type: 'object', properties: { query: { type: 'string' } } } }] }] });
        const researcherResponse = await researcherChat.sendMessage(researcherPrompt);
        const functionCalls = researcherResponse.response.functionCalls();
        if (!functionCalls) throw new Error("Agent 1 failed to determine a search query.");
        const webSearchResults = await searchTheWeb(functionCalls[0].args.query);

        // === STAGE 3: IMAGE FETCHING ===
        writeStreamChunk(res, { status: "Fetching satellite imagery arrays for analysis..." });
        // We now pass the correctly formatted `wmsBbox` to the fetch function.
        const imageFetchPromises = LAYERS_TO_ANALYZE.flatMap(layer => [
            fetchSentinelImageForAnalysis(wmsBbox, new Date(historicalDate), layer.id),
            fetchSentinelImageForAnalysis(wmsBbox, new Date(currentDate), layer.id)
        ]);
        const allImages = await Promise.all(imageFetchPromises);

        // === STAGE 4: AGENT 2 - SYNTHESIZER ===
        writeStreamChunk(res, { status: "Agent 2: Synthesizing images and research into a final report..." });
        const synthesizerPrompt = `
You are an expert-level climate scientist and geospatial analyst.
Your mission is to synthesize two types of data: satellite imagery and pre-compiled web research.

**INPUTS PROVIDED:**
1.  **Satellite Imagery:** You have been given 8 images showing changes over time for True Color, Vegetation (NDVI), Water (NDWI), and Pollution (NO₂).
2.  **Web Research:** The following JSON contains the results of a web search about climate change in the target location. You MUST use this data for your analysis and sources.

**WEB RESEARCH RESULTS:**
\`\`\`json
${JSON.stringify(webSearchResults, null, 2)}
\`\`\`

**MANDATORY WORKFLOW:**
1.  **Analyze the Images:** Systematically review the 8 images to identify key visual changes between the historical and current dates.
2.  **Correlate with Research:** Connect your visual findings to the information in the provided JSON. For example, if you see a shrinking coastline in the images, find the article in the JSON that discusses sea-level rise or erosion and cite it.
3.  **Quantify and Chart:** Generate data for AT LEAST TWO charts (bar, pie, or line). Base your data on a combination of visual estimation from the images and facts from the provided research.
4.  **Cite Sources:** Your 'sources' list in the output MUST be populated directly from the provided JSON research data.

**Output Format:**
Respond ONLY with a single, valid JSON object. Do NOT wrap it in Markdown.
{
  "summary": "A detailed synthesis connecting visual changes in the images with facts from the provided web research.",
  "keyChanges": ["Bulleted list of the most significant changes observed across ALL image types."],
  "potentialCauses": [{ "cause": "e.g., Accelerated Sea Level Rise", "explanation": "Explanation backed by the provided research articles.", "confidence": "High | Medium | Low" }],
  "predictions": "A data-driven prediction for this area's future if trends continue.",
  "charts": [{ "type": "bar", "title": "e.g., Forest Cover Change (sq km)", "data": [{ "name": "2015", "value": 1500 }, { "name": "2024", "value": 1350 }] }],
  "sources": [{ "title": "Article Title from Provided Research", "url": "https://...", "snippet": "Snippet from Provided Research" }]
}
`;
        const synthesizerChat = model.startChat({ safetySettings });
        const synthesizerResponse = await synthesizerChat.sendMessage([synthesizerPrompt, ...allImages]);
        const finalResponseText = synthesizerResponse.response.text();
        const jsonMatch = finalResponseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("Agent 2 (Synthesizer) failed to produce a valid JSON object:", finalResponseText);
            throw new Error("Analysis failed: The final synthesis did not produce a valid JSON object.");
        }
        const analysisResult = JSON.parse(jsonMatch[0]);

        // === FINAL STAGE: SEND THE COMPLETE PAYLOAD ===
        writeStreamChunk(res, {
            type: 'finalResult',
            payload: { mapConfig: mapConfigForFrontend, analysisResult }
        });

    } catch (error: any) {
        console.error("Error during streaming report generation:", error);
        writeStreamChunk(res, { type: 'error', message: error.message });
    } finally {
        res.end();
    }
}
