import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { currentWeather, forecastWeather, getShortedURL } from "./api";
import { z } from "zod";

const baseReturnedPrompt = `This response is returned from the api you need to parse it the following is the data returned from api: `;

console.log("[Server] Initializing McpServer...");
const server = new McpServer({
  name: "Tools - Weather and URL Shortener",
  version: "1.0.0",
});
console.log("[Server] McpServer initialized.");


console.log("[Server] Registering tool: getWeather"); 
server.tool(
  "getWeather", 
  "Get comprehensive weather data including temperature, pressure, humidity, visibility, wind details, and weather conditions for a specific location",
  {
    latitude: z.number(),
    longitude: z.number(),
  },
  async ({ latitude, longitude }) => {
    console.log(`[Server] Tool 'getWeather' called with: lat=${latitude}, lon=${longitude}`); 
    const data = await currentWeather(latitude, longitude);
    console.log(`[Server] Tool 'getWeather' got data, preparing response.`); 
    return {
      content: [
        {
          type: "text",
          text: baseReturnedPrompt + JSON.stringify(data),
        },
      ],
    };
  }
);
console.log("[Server] Tool 'getWeather' registered."); 


console.log("[Server] Registering tool: get-next-5days-forecast-weather-from-latitude-and-longitude");
server.tool(
  "get-next-5days-forecast-weather-from-latitude-and-longitude",
  "Get 5-day weather forecast data including temperature, pressure, humidity, visibility, wind details, and weather conditions for a specific location based on the latitude and longitude",
  {
    latitude: z.number(),
    longitude: z.number(),
  },
  async ({ latitude, longitude }) => {
    console.log(`[Server] Tool 'get-next-5days-forecast-weather-from-latitude-and-longitude' called with: lat=${latitude}, lon=${longitude}`);
    const data = await forecastWeather(latitude, longitude);
    console.log(`[Server] Tool 'get-next-5days-forecast-weather-from-latitude-and-longitude' got data, preparing response.`);
    return {
      content: [
        {
          type: "text",
          text: baseReturnedPrompt + JSON.stringify(data),
        },
      ],
    };
  }
);
console.log("[Server] Tool 'get-next-5days-forecast-weather-from-latitude-and-longitude' registered.");

console.log("[Server] Registering tool: get-shortened-url");
server.tool(
  "get-shortened-url",
  "Get shortened URL based on the URL and optional URL name",
  {
    url: z.string(),
    urlName: z.string().optional(),
  },
  async ({ url, urlName }) => {
    console.log(`[Server] Tool 'get-shortened-url' called with: url=${url}, urlName=${urlName}`);
    const data = await getShortedURL(url, urlName);
    console.log(`[Server] Tool 'get-shortened-url' got data, preparing response.`);
    return {
      content: [
        {
          type: "text",
          text: baseReturnedPrompt + JSON.stringify(data),
        },
      ],
    };
  }
);
console.log("[Server] Tool 'get-shortened-url' registered.");

const transport = new StdioServerTransport();
console.log("[Server] Connecting transport...");
await server.connect(transport);
console.log("[Server] Transport connected. Server is listening.");