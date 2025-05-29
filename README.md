MCP Tool Server 

Overview

The MCP Tool Server is a Bun-based server using the Model Context Protocol (MCP) to expose a suite of tools:

Current Weather Data
5-Day Weather Forecast
URL Shortening Service
It comes with a built-in client that demonstrates how to call these tools over MCP.

Features

Tool	Description
get-current-weather-from-latitude-and-longitude	Fetches real-time weather details for any geographic location.
get-next-5days-forecast-weather-from-latitude-and-longitude	Returns 5-day forecast data for a location.
get-shortened-url	Shortens URLs with optional custom alias using urlix.me
📂 Directory Structure

.
├── api.ts             // API integrations (OpenWeatherMap & Urlix)
├── client.ts          // Example client calling MCP server tools
├── credentials.ts     // Secure API keys for external APIs
├── index.ts           // Main MCP server tool registration
├── package.json       // Bun dependencies and project metadata
├── tsconfig.json      // TypeScript setup
└── README.md          // Project info (this doc)
