# Orbital Insights
> Harnessing satellite intelligence to reveal global change.

## My Vision in Action: The Orbital Insights Platform

My goal with Orbital Insights was to create a tool that was both powerful for experts and accessible to everyone. I wanted to build an interface that could not only show you a picture of the planet but also tell you its story.

**Harnessing satellite intelligence to reveal global change.**

That's not just a slogan; it's the core principle I built this entire platform around. I invite you to experience it firsthand:

### [**https://orbitalinsights.vercel.app/**](https://orbitalinsights.vercel.app/)

### The Heart of the Platform: The Dual-Map Comparator

At the heart of Orbital Insights is the interactive, dual-map interface. I designed this specifically for comparative analysis, allowing you to see a location at two different points in time, side-by-side. This immediate visual feedback is crucial for grasping the scale and nature of change.

But to truly understand what's happening, you need to look beyond what the naked eye can see. That's why I integrated several critical data layers directly into the map interface. You can switch between these layers on both the "historical" and "current" maps to compare how different environmental factors have evolved.

The available analytical layers include:

*   **Natural Color:** This is our baseline—what Earth looks like from space. It's perfect for identifying obvious visual changes like urban expansion, the construction of new infrastructure, or the shrinking of lakes.
*   **Vegetation (NDVI):** This layer reveals the health and density of our planet's green lungs. Using the Normalized Difference Vegetation Index, it helps you instantly spot deforestation, track the impact of droughts on farmland, or monitor reforestation efforts over time.
*   **Water (NDWI):** The Normalized Difference Water Index layer makes bodies of water stand out in sharp contrast to land. It is an indispensable tool for mapping the extent of floods, monitoring the effects of drought on rivers and reservoirs, and analyzing coastal erosion.
*   **Wildfire (False Color):** This specialized view uses infrared bands to cut through smoke and clearly identify active fire fronts and, just as importantly, the vast burn scars left behind after a fire has passed.
*   **Pollution (NO₂):** This layer visualizes concentrations of Nitrogen Dioxide, a key pollutant from industrial activity and vehicle emissions. With it, you can track changes in air quality over industrial zones or see the impact of lockdowns on urban pollution.

### Beyond Visuals: The AI-Generated Intelligence Report

Seeing the change is only half the story. The real power comes from understanding *why* it happened. This is where the AI analyst takes over.

After you've explored the visual data, the AI synthesizes all the available information into a comprehensive **Analysis Report**. I built this to function like a dedicated research assistant, providing the deep context that turns data into knowledge. The report gathers history, scientific data, and current events to build a complete narrative around the observed changes. It includes:

*   **An Executive Summary:** A clear, concise explanation of the situation.
*   **Key Changes & Potential Causes:** The AI analyzes the imagery and correlates its findings with a vast database of information to propose what could have led to the changes you see.
*   **Quantitative Data:** The report generates custom charts and stats to help you quantify the impact, such as the estimated area of forest lost or the percentage increase in water surface during a flood.
*   **Sources & Further Reading:** To empower deeper investigation, the AI provides a curated list of sources, including links to relevant news articles and scientific papers. You can click on any source to review it directly within the application.

By combining an intuitive visual comparison tool with deep, AI-driven contextual analysis, Orbital Insights becomes more than just a map viewer. I believe it is **the ultimate research tool** for journalists, scientists, students, and policymakers—for anyone dedicated to studying and combating climate change.

## The Vision: Decoding Global Change from Space

### The Problem: A Deluge of Data, A Drought of Insight

Every day, a constellation of Earth-observation satellites captures petabytes of data, documenting every corner of our world. This data holds the secrets to our planet's most pressing challenges: climate change, geopolitical conflict, natural disasters, and illicit activities. However, this raw data is inaccessible to all but the most specialized experts. The sheer volume and complexity of satellite imagery create a barrier, turning a potential fountain of knowledge into a deluge of noise.

### The Solution: An Agentic AI Analyst

Orbital Insights bridges this gap by serving as an autonomous geospatial analyst. It acts as an intelligent layer between human curiosity and raw satellite data. Instead of requiring users to be experts in remote sensing, it provides a simple search bar. Behind this interface, a swarm of AI agents collaborates to understand the user's query, gather evidence from multiple sources, and synthesize it into a coherent, insightful narrative.

### How It Works: From Prompt to Intelligence

The user experience is deceptively simple, masking a powerful workflow:

1.  **A User Poses a Question:** It begins with a natural language prompt, such as *"Show me the impact of the recent dam collapse in Libya"* or *"Analyze deforestation in the Amazon rainforest near Manaus over the last decade."*
2.  **The AI Agent Swarm Awakens:** An orchestrator agent receives the prompt and breaks down the task, activating a team of specialist agents.
3.  **Evidence Is Gathered:**
    *   A **Geocoding Agent** identifies and pinpoints the precise geographical area of interest.
    *   A **Research Agent** scours the web for contextual information, finding news reports, scientific papers, and local data related to the query.
    *   An **Imagery Agent** accesses archives of high-resolution Sentinel satellite data, fetching multi-spectral images from different points in time to enable change detection.
4.  **Intelligence is Synthesized:** All the collected evidence—historical images, current images, and web research—is fed to a master **Synthesizer Agent**. Powered by a cutting-edge multi-modal AI, this agent analyzes the visual changes in the imagery, correlates them with the textual research, quantifies the impact, generates charts, and composes a final, structured intelligence report.

The result is a holistic analysis that doesn't just show *what* changed, but explains *why* it might have changed and what the future could hold.

## The Journey: From Specialized Models to a Unified Agent

The path to creating Orbital Insights was one of evolution, driven by the immense challenges of analyzing data at a planetary scale.

### The Initial Ambition: High-Precision Object Detection

The project began with a highly ambitious goal: to solve several distinct, critical problems using specialized, high-precision computer vision models. The aim was to create a suite of tools that could automatically detect and highlight specific features in satellite imagery. To this end, several bespoke models were developed and deployed:

*   [**Orbital Insights Damage Detector**](https://huggingface.co/spaces/gidave/orbital-insights-damage-detector): Trained to identify and highlight structural damage to buildings and infrastructure, intended for post-conflict assessment and natural disaster response.
*   [**Orbital Insights Flood Detector**](https://huggingface.co/spaces/gidave/orbital-insights-flood-detector): Designed to precisely map the extent of flooding and inundated areas.
*   [**Orbital Insights Wildfire Detector**](https://huggingface.co/spaces/gidave/orbital-insights-wildfire-detector): Built to find active wildfires and delineate the boundaries of burn scars for environmental impact analysis.
*   [**Orbital Insights Maritime Detector**](https://huggingface.co/spaces/gidave/orbital-insights-maritime-detector): Created to detect maritime vessels, with the goal of tackling illegal fishing and monitoring shipping routes.

These models were trained on curated vision datasets from sources like **Roboflow**, demonstrating a powerful capability for targeted object detection.

### The Scalability Challenge: A Sea of Pixels

While the specialist models were effective on pre-selected image tiles, applying them to real-world, user-driven queries revealed a fundamental scalability problem. The core challenges were twofold:

1.  **Data Scarcity for Robustness:** While datasets existed, building models that could perform reliably across diverse global geographies, lighting conditions, and seasons required an astronomical amount of labeled data that was simply not available.
2.  **Prohibitive Processing Times:** A user query like *"find illegal fishing activity in the South Atlantic Ocean"* would require fetching and processing millions of square kilometers of high-resolution imagery. Running a detection model over such a vast area would be computationally expensive and could take hours, if not days, to return a result, failing the core promise of on-demand intelligence.

It became clear that while the vision of high-precision detection was powerful, the approach of running single-purpose models across massive, undefined areas was not a viable path forward for a responsive application.

### The Strategic Pivot: A Multi-Modal Synthesizer

This challenge prompted a strategic pivot. Instead of trying to brute-force a solution with narrow AI, the focus shifted to creating a more flexible and intelligent system. The project evolved from a collection of tools into a single, cohesive AI brain.

The new architecture embraces a multi-modal, agentic approach where the specialist models are not the primary engine, but rather potential tools in a larger analytical arsenal. The core of the system became the **Synthesizer Agent**, which can reason across different types of data simultaneously. It can look at a true-color image, a vegetation index map, and a news article about a drought all at once to form a conclusion, much like a human analyst would.

This approach solved the scalability problem by focusing the analysis on human-defined areas of interest and leveraging the AI's ability to draw broad conclusions from visual evidence, rather than relying solely on pixel-level object detection. It transformed Orbital Insights from a set of niche detectors into a versatile platform for broad-spectrum geospatial analysis, with a primary focus on the multifaceted story of climate change and its global impact.

## Architecture and Technology Stack

This project was built by orchestrating a modern, serverless technology stack designed for performance, scalability, and rapid development.

### **Frontend**

*   **Framework:** Next.js (React)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Animation:** Framer Motion
*   **Mapping:** Leaflet & React-Leaflet
*   **Data Visualization:** Recharts

### **Backend & AI Core**

*   **Platform:** Next.js API Routes (Serverless)
*   **Primary AI Model:** Google Gemini 1.5 Pro (for multi-modal synthesis and agentic control)
*   **Computer Vision Models:** Custom YOLO models trained and deployed on Hugging Face Spaces

### **Data & Services**

*   **Satellite Imagery:** Sentinel Hub API (providing Sentinel-2 data)
*   **Geocoding:** OpenStreetMap Nominatim API
*   **Web Research:** Google Custom Search API

### **Deployment**

*   **Hosting:** Vercel

## Future Vision

Orbital Insights is a living project with a long-term vision. The current platform lays a powerful foundation, but the journey is far from over. Future development will focus on:

*   **Proactive Alerting:** Implementing a subscription system where users can monitor specific areas of interest and receive automated alerts when the AI detects significant changes, such as new wildfires, flood events, or rapid deforestation.
*   **Enhanced Time-Series Analysis:** Moving beyond two-point comparison to allow for the analysis of data across multiple years, automatically generating trend lines and graphs for key environmental indicators.
*   **Integration of Higher-Resolution Data:** Incorporating commercial satellite imagery sources to enable even more detailed analysis for specialized use cases.
*   **User-Driven Data Integration:** Allowing users to upload their own geospatial data (e.g., GeoJSON files) to overlay on the map and incorporate into the AI's analysis.

## Acknowledgements

This project would not have been possible without the incredible work of the open data community. I extend my sincere gratitude to:

*   The **European Space Agency (ESA)** and the **Copernicus Programme** for providing free and open access to high-quality Sentinel satellite data.
*   The contributors to **OpenStreetMap** for creating and maintaining an invaluable global geocoding service.
*   **Google** for the powerful generative AI models and search APIs that form the core of the analytical engine.
*   The open-source developers behind Next.js, React, Leaflet, and the entire ecosystem of tools that powered this application.
