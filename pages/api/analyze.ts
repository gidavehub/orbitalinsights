// FILE: pages/api/analyze.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Part } from '@google/generative-ai';

// ==============================================================================
// 1. SETUP AND CONFIGURATION
// ==============================================================================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; // For Google Search
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID; // For Google Search

if (!GEMINI_API_KEY) throw new Error("Server configuration error: Missing Gemini API Key.");
if (!GOOGLE_API_KEY || !SEARCH_ENGINE_ID) {
    throw new Error("Server configuration error: Missing Google API Key or Search Engine ID for web search.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

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
// 2. SERVER-SIDE TOOLS
// ==============================================================================

// This function is used by Agent 1 to get real-world data.
async function searchTheWeb(query: string): Promise<any> { // Returns a JSON object now
    console.log(`[AGENT 1] Performing LIVE web search for: "${query}"`);
    try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=5`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Google Search API failed with status: ${response.status}`);
        const data = await response.json();
        if (!data.items) return [];
        const simplifiedResults = data.items.map((item: any) => ({
            title: item.title,
            url: item.link,
            snippet: item.snippet
        }));
        return simplifiedResults; // Return the actual JSON object/array
    } catch (error) {
        console.error("[AGENT 1] Web search failed:", error);
        return { error: "Web search failed.", details: error instanceof Error ? error.message : "Unknown error" };
    }
}

// This function fetches images for Agent 2 to analyze.
async function fetchSentinelImageForAnalysis(bbox: [number, number, number, number], instanceId: string, date: Date, layer: string): Promise<Part> {
    const wmsUrl = `https://services.sentinel-hub.com/ogc/wms/${instanceId}`;
    const time = `${date.toISOString().split('T')[0]}`;
    const params = new URLSearchParams({
        SERVICE: 'WMS', REQUEST: 'GetMap', LAYERS: layer, BBOX: bbox.join(','),
        WIDTH: '512', HEIGHT: '512', FORMAT: 'image/png', CRS: 'EPSG:4326', TIME: `${time}/${time}`
    });
    const requestUrl = `${wmsUrl}?${params.toString()}`;
    // console.log(`Fetching ${layer} image for analysis from: ${requestUrl}`); // Can be noisy
    const response = await fetch(requestUrl);
    if (!response.ok) throw new Error(`Failed to fetch image from Sentinel Hub for layer ${layer}. Status: ${response.status}`);
    const imageBuffer = await response.arrayBuffer();
    return { inlineData: { mimeType: 'image/png', data: Buffer.from(imageBuffer).toString('base64') } };
}

// ==============================================================================
// 3. MAIN API HANDLER WITH TWO-AGENT ARCHITECTURE
// ==============================================================================
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { bounds, instanceId, historicalDate, currentDate, prompt } = req.body;
        const wmsBbox: [number, number, number, number] = [bounds[0][1], bounds[0][0], bounds[1][1], bounds[1][0]];

        // --- AGENT 1: THE RESEARCHER ---
        // Its sole job is to determine the correct search query and execute it.
        console.log("--- EXECUTING AGENT 1 (Researcher) ---");
        const researcherPrompt = `From the user's query, identify the main geographical location. Then, call the 'searchTheWeb' tool with a query formatted as "{Location Name} climate change". User Query: "${prompt}"`;
        const researcherChat = model.startChat({
            tools: [{ functionDeclarations: [ { name: 'searchTheWeb', description: 'Performs a live web search.', parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } } ] }],
            safetySettings
        });
        const researcherResponse = await researcherChat.sendMessage(researcherPrompt);
        const functionCalls = researcherResponse.response.functionCalls();

        if (!functionCalls || functionCalls[0].name !== 'searchTheWeb') {
            throw new Error("Agent 1 (Researcher) failed to determine a search query.");
        }
        
        const searchQuery = functionCalls[0].args.query;
        const webSearchResults = await searchTheWeb(searchQuery); // This is our clean JSON result
        console.log("[AGENT 1] Mission Complete. Handing off search results to Agent 2.");
        console.log("--- Google Search JSON Result ---");
        console.log(JSON.stringify(webSearchResults, null, 2));


        // --- AGENT 2: THE SYNTHESIZER ---
        // It receives images and the pre-compiled research from Agent 1. It performs NO tool calls.
        console.log("\n--- EXECUTING AGENT 2 (Synthesizer) ---");

        // Fetch all images in parallel while Agent 1 was working.
        const imageFetchPromises = LAYERS_TO_ANALYZE.flatMap(layer => [
            fetchSentinelImageForAnalysis(wmsBbox, instanceId, new Date(historicalDate), layer.id),
            fetchSentinelImageForAnalysis(wmsBbox, instanceId, new Date(currentDate), layer.id)
        ]);
        const allImages = await Promise.all(imageFetchPromises);
        
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
  "charts": [{ "type": "bar" | "pie" | "line", "title": "e.g., Average Sea Level Rise", "data": [{ "name": "2010-2015", "value": 3.5 }, { "name": "2016-2021", "value": 4.2 }] }],
  "sources": [{ "title": "Article Title from Provided Research", "url": "https://...", "snippet": "Snippet from Provided Research" }]
}
`;      
        // Start a clean session for Agent 2. No tools are provided.
        const synthesizerChat = model.startChat({ safetySettings });
        const synthesizerResponse = await synthesizerChat.sendMessage([ synthesizerPrompt, ...allImages ]);
        
        const finalResponseText = synthesizerResponse.response.text();
        const jsonMatch = finalResponseText.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            console.error("Agent 2 (Synthesizer) failed to produce a valid JSON object:", finalResponseText);
            throw new Error("Analysis failed: The final synthesis did not produce a valid JSON object.");
        }

        const jsonString = jsonMatch[0];
        const finalJsonResponse = JSON.parse(jsonString);

        console.log("\n[AGENT 2] Mission Complete. Final analysis generated.");
        res.status(200).json(finalJsonResponse);

    } catch (error: any) {
        console.error("\n--- AN ERROR OCCURRED IN THE MAIN HANDLER ---");
        console.error(error);
        res.status(500).json({ error: error.message || "An unknown error occurred during the two-agent process." });
    }
}