#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const NWS_API_BASE = "https://api.weather.gov";
const USER_AGENT = "weather-app/1.0";
const WEATHER_API_BASE = "https://api.weatherapi.com/v1";

// TypeScript interfaces
interface WeatherAPILocation {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
}

interface WeatherAPICurrent {
  location: WeatherAPILocation;
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
    };
    wind_mph: number;
    wind_kph: number;
    wind_dir: string;
    pressure_mb: number;
    humidity: number;
    feelslike_c: number;
    feelslike_f: number;
  };
}

interface WeatherAPIForecastDay {
  date: string;
  day: {
    maxtemp_c: number;
    maxtemp_f: number;
    mintemp_c: number;
    mintemp_f: number;
    avgtemp_c: number;
    avgtemp_f: number;
    condition: {
      text: string;
    };
    maxwind_mph: number;
    maxwind_kph: number;
    daily_chance_of_rain: number;
  };
}

interface WeatherAPIForecast {
  location: WeatherAPILocation;
  forecast: {
    forecastday: WeatherAPIForecastDay[];
  };
}

interface NWSAlert {
  properties: {
    event: string;
    headline: string;
    description: string;
    severity: string;
    urgency: string;
    certainty: string;
    areaDesc: string;
  };
}

interface NWSAlerts {
  features: NWSAlert[];
}

// Helper function for WeatherAPI.com requests
async function makeWeatherAPIRequest<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<T | null> {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    throw new Error("WEATHER_API_KEY environment variable is required");
  }

  const url = new URL(`${WEATHER_API_BASE}/${endpoint}`);
  url.searchParams.append("key", apiKey);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`WeatherAPI error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making WeatherAPI request:", error);
    return null;
  }
}

// Helper function for NWS API requests (US alerts only)
async function makeNWSRequest<T>(url: string): Promise<T | null> {
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "application/geo+json",
  };
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making NWS request:", error);
    return null;
  }
}

const server = new Server(
  {
    name: "weather-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_current_weather",
        description: "Get current weather for any location worldwide",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description:
                "Location name (e.g., 'London', 'New York', 'Tokyo', 'Paris')",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "get_forecast",
        description: "Get 5-day weather forecast for any location worldwide",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description:
                "Location name (e.g., 'London', 'New York', 'Tokyo', 'Paris')",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "get-alerts",
        description: "Get weather alerts for a US state (US only)",
        inputSchema: {
          type: "object",
          properties: {
            state: {
              type: "string",
              description: "Two-letter US state code (e.g., 'CA', 'NY')",
            },
          },
          required: ["state"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "get_current_weather": {
        if (!args || typeof args.name !== "string") {
          throw new Error("Location name is required");
        }

        const locationName = args.name;

        const weatherData = await makeWeatherAPIRequest<WeatherAPICurrent>(
          "current.json",
          {
            q: locationName,
            aqi: "no",
          }
        );

        if (!weatherData) {
          return {
            content: [
              {
                type: "text",
                text: `Could not fetch weather data for: ${locationName}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  location: {
                    name: weatherData.location.name,
                    region: weatherData.location.region,
                    country: weatherData.location.country,
                    coordinates: {
                      lat: weatherData.location.lat,
                      lon: weatherData.location.lon,
                    },
                  },
                  current: {
                    temperature: {
                      celsius: weatherData.current.temp_c,
                      fahrenheit: weatherData.current.temp_f,
                    },
                    feels_like: {
                      celsius: weatherData.current.feelslike_c,
                      fahrenheit: weatherData.current.feelslike_f,
                    },
                    condition: weatherData.current.condition.text,
                    wind: {
                      mph: weatherData.current.wind_mph,
                      kph: weatherData.current.wind_kph,
                      direction: weatherData.current.wind_dir,
                    },
                    humidity: weatherData.current.humidity,
                    pressure_mb: weatherData.current.pressure_mb,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_forecast": {
        if (!args || typeof args.name !== "string") {
          throw new Error("Location name is required");
        }

        const locationName = args.name;

        const forecastData = await makeWeatherAPIRequest<WeatherAPIForecast>(
          "forecast.json",
          {
            q: locationName,
            days: "5",
            aqi: "no",
            alerts: "no",
          }
        );

        if (!forecastData) {
          return {
            content: [
              {
                type: "text",
                text: `Could not fetch forecast data for: ${locationName}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  location: {
                    name: forecastData.location.name,
                    region: forecastData.location.region,
                    country: forecastData.location.country,
                    coordinates: {
                      lat: forecastData.location.lat,
                      lon: forecastData.location.lon,
                    },
                  },
                  forecast: forecastData.forecast.forecastday.map((day) => ({
                    date: day.date,
                    temperature: {
                      max_celsius: day.day.maxtemp_c,
                      max_fahrenheit: day.day.maxtemp_f,
                      min_celsius: day.day.mintemp_c,
                      min_fahrenheit: day.day.mintemp_f,
                      avg_celsius: day.day.avgtemp_c,
                      avg_fahrenheit: day.day.avgtemp_f,
                    },
                    condition: day.day.condition.text,
                    wind: {
                      max_mph: day.day.maxwind_mph,
                      max_kph: day.day.maxwind_kph,
                    },
                    chance_of_rain: day.day.daily_chance_of_rain,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get-alerts": {
        if (!args || typeof args.state !== "string") {
          throw new Error("State code is required");
        }

        const state = args.state.toUpperCase();
        const alertsUrl = `${NWS_API_BASE}/alerts/active?area=${state}`;
        const alertsData = await makeNWSRequest<NWSAlerts>(alertsUrl);

        if (!alertsData || !alertsData.features) {
          return {
            content: [
              {
                type: "text",
                text: `No alerts data available for ${state}`,
              },
            ],
          };
        }

        const features = alertsData.features;

        if (features.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No active alerts for ${state}`,
              },
            ],
          };
        }

        const alerts = features.map((alert) => ({
          event: alert.properties.event,
          headline: alert.properties.headline,
          severity: alert.properties.severity,
          urgency: alert.properties.urgency,
          certainty: alert.properties.certainty,
          areaDesc: alert.properties.areaDesc,
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ state, alerts }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
