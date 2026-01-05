# A Simple MCP weather Server written in TypeScript

# Weather MCP Server 🌤️ written in TypeScript

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that provides real-time weather information, forecasts, and alerts using the National Weather Service API and WeatherAPI.com.

## Features

- 🌤️ **Current Weather** - Get real-time weather conditions for any location worldwide
- 📅 **5-Day Forecasts** - Detailed weather forecasts with temperature, wind, and conditions
- ⚠️ **Weather Alerts** - Active weather alerts and warnings for US states
- 🌍 **Global Support** - Location search via geocoding (city names, landmarks, etc.)
- 🔒 **Type-Safe** - Built with TypeScript for reliability

## Prerequisites

- Node.js 18+
- npm or yarn
- A free API key from [WeatherAPI.com](https://www.weatherapi.com/signup.aspx)

## Installation

````bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/weather-mcp-server.git
cd weather-mcp-server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

Configuration

Sign up for a free API key at WeatherAPI.com
Edit .env and add your API key:

env

WEATHER_API_KEY=your_api_key_here

Usage

Development Mode (TypeScript)

bash

npm run dev

Production Build

bash

# Build the project
npm run build

# Run the built version
npm start

Testing with MCP Inspector

bash

# Test with TypeScript source
npm run inspect

# Test with built JavaScript
npm run inspect-built

Integration

Cline (VS Code Extension)
Add to %APPDATA%\Code\User\globalStorage\cline.cline\settings\cline_mcp_settings.json:

json

{
  "mcpServers": {
    "weather-server": {
      "command": "node",
      "args": [
        "C:\\path\\to\\weather-server\\build\\index.js"
      ],
      "env": {
        "WEATHER_API_KEY": "your_api_key_here"
      }
    }
  }
}

Claude Desktop

Add to %APPDATA%\Claude\claude_desktop_config.json:

json

{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": [
        "C:\\path\\to\\weather-server\\build\\index.js"
      ],
      "env": {
        "WEATHER_API_KEY": "your_api_key_here"
      }
    }
  }
}

Available Tools

get_current_weather
Get current weather conditions for any location.

Input:
json{
  "name": "London"
}
Output:

json
{
  "location": "London",
  "coordinates": { "lat": 51.5074, "lon": -0.1278 },
  "temperature": 72,
  "temperatureUnit": "F",
  "windSpeed": "10 mph",
  "windDirection": "SW",
  "shortForecast": "Partly Cloudy",
  "detailedForecast": "Partly cloudy with a high near 72..."
}

get_forecast
Get 5-day weather forecast for any location.

Input:
json
{
  "name": "New York"
}

Output:
json
{
  "location": "New York",
  "coordinates": { "lat": 40.7128, "lon": -74.0060 },
  "forecast": [
    {
      "name": "Tonight",
      "temperature": 45,
      "temperatureUnit": "F",
      "windSpeed": "5 mph",
      "windDirection": "N",
      "shortForecast": "Clear",
      "detailedForecast": "Clear skies with low around 45..."
    }
    // ... more periods
  ]
}

get-alerts
Get active weather alerts for US states.

Input:
json
{
  "state": "CA"
}
Output:
json

{
  "state": "CA",
  "alerts": [
    {
      "event": "Heat Advisory",
      "headline": "Heat Advisory issued June 15...",
      "severity": "Moderate",
      "urgency": "Expected",
      "certainty": "Likely",
      "areaDesc": "Los Angeles County"
    }
  ]
}

Development
Project Structure


weather-server/
├── src/
│   └── index.ts          # TypeScript source code
├── build/
│   └── index.js          # Compiled JavaScript (generated)
├── .env                  # Environment variables (not in git)
├── .env.example          # Example environment file
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file

Scripts

bash

npm run dev            # Run in development mode with tsx
npm run build          # Build TypeScript to JavaScript
npm start              # Run built JavaScript version
npm run inspect        # Test with MCP Inspector (TypeScript)
npm run inspect-built  # Test with MCP Inspector (JavaScript)

APIs Used

- National Weather Service API - Free US weather data
- WeatherAPI.com - Global geocoding and location search

Limitations

- Weather alerts (get-alerts) only work for US locations (NWS limitation)
- Current weather and forecasts are US-focused but work globally via geocoding
- Rate limits apply based on your WeatherAPI.com plan (free tier: 1M calls/month)

Troubleshooting

"WEATHER_API_KEY environment variable is required"

- Make sure .env file exists with valid API key
- Check that the key is not expired

"This location might not be supported by the NWS API"

- NWS only covers US locations for detailed forecasts
- Try a US city or use the geocoding to verify location

Type errors in development

- Run npm install to ensure all dependencies are installed
- Check that TypeScript version is 5.7+ with npx tsc --version

## Cline/Claude Desktop Integration

### Cline (VS Code Extension)

**Config Location (depends on Cline version):**

- **Newer versions:** `%APPDATA%\Code\User\globalStorage\cline.cline\settings\cline_mcp_settings.json`
- **Older versions:** `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

**Configuration:**

```json
{
  "mcpServers": {
    "weather-server": {
      "command": "node",
      "args": [
        "C:\\path\\to\\weather-server\\build\\index.js"
      ],
      "env": {
        "WEATHER_API_KEY": "your_api_key_here"
      },
      "autoApprove": [
        "get_current_weather",
        "get_forecast",
        "get-alerts"
      ]
    }
  }
}

Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

- Fork the repository
- Create your feature branch (git checkout -b feature/AmazingFeature)
- Commit your changes (git commit -m 'Add some AmazingFeature')
- Push to the branch (git push origin feature/AmazingFeature)
- Open a Pull Request

License

This project is licensed under the MIT License - see the LICENSE file for details.

Author

Herman Adu

Acknowledgments

- Model Context Protocol by Anthropic
- National Weather Service API
- WeatherAPI.com

Support

If you have questions or need help:

- Open an issue on GitHub
- Check the MCP Documentation


Built with ❤️ using the Model Context Protocol

---
````
