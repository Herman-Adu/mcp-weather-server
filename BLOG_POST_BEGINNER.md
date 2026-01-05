# From Zero to Production: Building My First MCP Server in 3 Days

_A beginner-friendly guide to creating a production-ready weather API integration using the Model Context Protocol_

---

## 👋 Introduction

Three days ago, I had never written a single line of MCP (Model Context Protocol) code. Today, I have a production-ready weather server powering real business operations.

This is the complete story of that journey – every challenge, every breakthrough, and every lesson learned along the way. If you're thinking about building your first MCP server, this guide is for you.

**Spoiler:** It's easier than you think, and you don't need to be an expert.

---

## 🎯 What I Set Out to Build

I needed to solve a real problem for a client – an electrical engineering company in Southeast England. Their engineers were spending 2.5-4 hours every day manually checking weather conditions for 50+ active job sites.

**The goal:** Build a weather integration that AI assistants (like Claude) could use to provide instant weather data.

**The result:** A weather server that answers questions like:

- "What's the weather in London right now?"
- "Give me a 5-day forecast for Tokyo"
- "Are there any weather alerts in California?"

---

## 🤔 What is the Model Context Protocol?

Before we dive in, let's quickly understand what MCP is (in simple terms).

Think of MCP as a **universal translator** between AI assistants and external tools. It's like giving Claude a phone and a directory of services it can call.

**The key components:**

1. **MCP Server** (what we're building) - Exposes tools that do useful things
2. **MCP Client** (like Claude or Cline) - Uses those tools
3. **Tools** - Individual functions (like "get weather")
4. **Transport** - How they communicate (usually stdio - standard input/output)

**Analogy:**

- MCP Server = A restaurant kitchen
- Tools = Individual dishes on the menu
- MCP Client = A customer ordering food
- Transport = The waiter taking orders

---

## ✅ Prerequisites (What You Need to Know)

You don't need to be an expert, but you should have:

**Required:**

- ✅ Basic JavaScript/TypeScript knowledge
- ✅ Comfortable with terminal/command line
- ✅ Node.js installed (18 or newer)
- ✅ A code editor (VS Code recommended)

**Helpful (but not required):**

- Understanding of async/await
- Basic API concepts
- Git basics

**Time commitment:**

- Following this guide: 2-3 hours
- Building from scratch (like I did): ~10 hours

---

## 📦 Day 1: Setting Up (Hours 1-3)

### Step 1: Create Your Project

```bash
# Create project folder
mkdir weather-server
cd weather-server

# Initialize npm project
npm init -y
This creates a package.json file – think of it as your project's instruction manual.
Step 2: Install Dependencies
bashCopy# Install the MCP SDK
npm install @modelcontextprotocol/sdk

# Install development tools
npm install -D typescript @types/node tsx
What these do:

@modelcontextprotocol/sdk - The MCP toolkit (like React for MCP)
typescript - Adds type safety (catches bugs before they happen)
@types/node - Helps TypeScript understand Node.js
tsx - Runs TypeScript directly (great for development)

Step 3: Set Up TypeScript
bashCopy# Create TypeScript configuration
npx tsc --init
This creates tsconfig.json. Here's what mine looks like (with explanations):
jsonCopy{
  "compilerOptions": {
    "target": "ES2022",                    // Use modern JavaScript
    "module": "Node16",                    // Node.js ES modules
    "moduleResolution": "Node16",          // How to find imports
    "lib": ["ES2022"],                     // Modern features available
    "outDir": "./build",                   // Where compiled code goes
    "rootDir": "./src",                    // Where source code is
    "strict": true,                        // Catch more potential bugs
    "esModuleInterop": true,               // Better import compatibility
    "skipLibCheck": true,                  // Faster compilation
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],                 // What to compile
  "exclude": ["node_modules", "build"]     // What to ignore
}
Key setting to remember: "rootDir": "./src"
I spent 30 minutes debugging because I had this set to "./" and my build output was going to the wrong place!
Step 4: Create Your Project Structure
bashCopy# Create folders
mkdir src

# Create your main file
touch src/index.ts

# Create environment file for API keys
touch .env
touch .env.example
Your structure should look like:
Copyweather-server/
├── src/
│   └── index.ts
├── .env
├── .env.example
├── package.json
└── tsconfig.json
Step 5: Get a Weather API Key

Go to https://www.weatherapi.com/signup.aspx
Sign up for free (takes 2 minutes)
Copy your API key
Add to .env:

bashCopyWEATHER_API_KEY=your_api_key_here
Important: Never commit .env to Git! We'll set up .gitignore later.

💻 Day 1 (Continued): Your First MCP Server (Hours 4-6)
Step 6: Write the Basic Server
Open src/index.ts and let's build our first server:
typescriptCopy// Import MCP SDK components
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Create the server
const server = new Server(
  {
    name: "weather-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},  // We'll add tools here
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_current_weather",
        description: "Get current weather for a location",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Location name (e.g., 'London', 'Tokyo')",
            },
          },
          required: ["name"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "get_current_weather") {
    return {
      content: [
        {
          type: "text",
          text: `Weather for ${args.name}: Sunny, 22°C`,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
What's happening here?

Import the tools - Get MCP SDK components
Create a server - Give it a name and version
List tools - Tell clients what tools are available
Handle calls - When a tool is called, do something
Start it up - Connect to stdio transport

Step 7: Test It!
Add scripts to package.json:
jsonCopy{
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc",
    "start": "node build/index.js"
  }
}
Run your server:
bashCopynpm run dev
You should see:
CopyWeather MCP Server running on stdio
Success! 🎉 You just created your first MCP server!

🚀 Day 2: Making It Real (Hours 7-15)
Step 8: Add Real Weather Data
Now let's connect to the actual Weather API. First, create a helper function:
typescriptCopy// Add at the top of your file
const WEATHER_API_BASE = "https://api.weatherapi.com/v1";

async function makeWeatherAPIRequest(endpoint: string, params: Record<string, string>) {
  // Get API key from environment
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    throw new Error("WEATHER_API_KEY environment variable is required");
  }

  // Build URL with parameters
  const url = new URL(`${WEATHER_API_BASE}/${endpoint}`);
  url.searchParams.append("key", apiKey);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  // Make the request
  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`WeatherAPI error! status: ${response.status}`);
  }

  return await response.json();
}
What this does:

Gets your API key from the .env file
Builds a URL with all the parameters
Makes the API request
Returns the weather data

Step 9: Update the Handler with Real Data
Replace the dummy handler with:
typescriptCopyserver.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (name === "get_current_weather") {
      // Validate input
      if (!args || typeof args.name !== "string") {
        throw new Error("Location name is required");
      }

      const locationName = args.name;

      // Fetch real weather data
      const weatherData = await makeWeatherAPIRequest("current.json", {
        q: locationName,
        aqi: "no",  // We don't need air quality data
      });

      // Format the response
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                location: {
                  name: weatherData.location.name,
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
                  condition: weatherData.current.condition.text,
                  humidity: weatherData.current.humidity,
                  wind: {
                    mph: weatherData.current.wind_mph,
                    kph: weatherData.current.wind_kph,
                  },
                },
              },
              null,
              2
            ),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
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
Key improvements:

✅ Validates user input
✅ Fetches real weather data
✅ Formats response nicely
✅ Handles errors gracefully

Step 10: Load Environment Variables
Install dotenv:
bashCopynpm install dotenv
Add to the top of src/index.ts:
typescriptCopyimport { config } from "dotenv";
config();  // Load .env file
Step 11: Test with Real Data
bashCopynpm run dev
At this point, your server can fetch real weather data!

🧪 Day 2 (Continued): Testing with MCP Inspector (Hours 16-20)
Step 12: Build Your Server
Before testing with the inspector, build your server:
bashCopynpm run build
This creates build/index.js – your compiled JavaScript.
Step 13: Test with MCP Inspector
MCP Inspector is a visual debugging tool – think of it as Chrome DevTools for MCP servers.
Run it:
bashCopynpx @modelcontextprotocol/inspector node build/index.js
This will:

Start your server
Open a browser at http://localhost:6274
Show you a visual interface

Step 14: Configure Environment Variables
In the MCP Inspector:

Click "Environment Variables"
Add key: WEATHER_API_KEY
Add value: (your API key from .env)
Click "Connect"

Step 15: Test Your Tool
You should see get_current_weather listed. Click it and:

Enter a location name (e.g., "London")
Click "Run Tool"
See the real weather data!

If it works, celebrate! 🎉 You just made your first successful API call through MCP!

🎨 Day 3: Polish and Production (Hours 21-30)
Step 16: Add More Tools
Let's add a forecast tool. In your ListToolsRequestSchema handler:
typescriptCopyserver.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_current_weather",
        description: "Get current weather for a location",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Location name" },
          },
          required: ["name"],
        },
      },
      {
        name: "get_forecast",
        description: "Get 5-day weather forecast",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Location name" },
          },
          required: ["name"],
        },
      },
    ],
  };
});
Step 17: Handle the Forecast Tool
In your CallToolRequestSchema handler, add:
typescriptCopyif (name === "get_forecast") {
  if (!args || typeof args.name !== "string") {
    throw new Error("Location name is required");
  }

  const forecastData = await makeWeatherAPIRequest("forecast.json", {
    q: args.name,
    days: "5",
    aqi: "no",
    alerts: "no",
  });

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            location: {
              name: forecastData.location.name,
              country: forecastData.location.country,
            },
            forecast: forecastData.forecast.forecastday.map((day: any) => ({
              date: day.date,
              temperature: {
                max_celsius: day.day.maxtemp_c,
                max_fahrenheit: day.day.maxtemp_f,
                min_celsius: day.day.mintemp_c,
                min_fahrenheit: day.day.mintemp_f,
              },
              condition: day.day.condition.text,
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
Step 18: Set Up Git
Create .gitignore:
bashCopy# Dependencies
node_modules/

# Environment
.env
.env.local

# Build
build/

# Logs
*.log

# OS
.DS_Store
Initialize Git:
bashCopygit init
git add .
git commit -m "Initial commit: Weather MCP Server"
Step 19: Write Documentation
Create README.md:
markdownCopy# Weather MCP Server

Get real-time weather data through Claude AI!

## Quick Start

1. Clone this repo
2. Install dependencies: `npm install`
3. Create `.env` file with your WeatherAPI.com key
4. Build: `npm run build`
5. Test: `npm run dev`

## Tools

- `get_current_weather` - Current conditions
- `get_forecast` - 5-day forecast

## Configuration

See `.env.example` for required environment variables.
Create .env.example:
bashCopy# Get your free API key at https://www.weatherapi.com/signup.aspx
WEATHER_API_KEY=your_api_key_here
Step 20: Final Testing
Test everything one more time:
bashCopy# Build
npm run build

# Test with inspector
npx @modelcontextprotocol/inspector node build/index.js
Try both tools with different locations:

Current weather for Paris
Forecast for Tokyo
Weather in New York

If all works, you're done! 🎉

🎓 What I Learned
1. MCP is Simpler Than It Looks
At first, I was intimidated. But MCP is just:

List your tools
Handle when they're called
Return formatted responses

That's it!
2. MCP Inspector is Essential
Don't try to debug with console.log statements. Use the Inspector – it shows you:

What tools are available
The exact request/response
Any errors in real-time

3. Start Small, Then Expand
My first version just returned "Sunny, 22°C" for everything. That's fine! Get the basics working, then add real API calls.
4. TypeScript Catches Bugs Early
Several times, TypeScript warned me about:

Typos in property names
Missing required parameters
Wrong data types

Each warning saved me from a runtime error.
5. Documentation Matters
I spent almost as much time on documentation as on code. Why? Because:

Future me will forget how this works
Others can use it without asking questions
It looks more professional


🚧 Challenges I Faced (and How I Solved Them)
Challenge 1: "Cannot find module 'build/index.js'"
Problem: After running npm run build, the file wasn't where I expected.
Cause: Had "rootDir": "./" instead of "rootDir": "./src" in tsconfig.json
Solution: Changed tsconfig, rebuilt, worked perfectly.
Time lost: 30 minutes
Challenge 2: API Key Not Working
Problem: Server couldn't read WEATHER_API_KEY
Cause: Forgot to import and call dotenv.config()
Solution: Added these lines at the top:
typescriptCopyimport { config } from "dotenv";
config();
Time lost: 15 minutes
Challenge 3: MCP Inspector Shows "Command not found"
Problem: Inspector couldn't start my server
Cause: Forgot to add the API key in Inspector's Environment Variables UI
Solution: Clicked "Environment Variables" in Inspector, added the key there (not just in .env)
Time lost: 20 minutes

🎯 Your Turn: Next Steps
Now that you've seen the process, here are some ideas to make it your own:
Beginner Friendly:

Add more locations - Support coordinates, zip codes
Better formatting - Make responses more readable
Add emojis - 🌤️ for conditions

Intermediate:

Add caching - Store responses for 5 minutes to reduce API calls
Historical data - Add a tool for past weather
Multiple APIs - Compare weather from different sources

Advanced:

WebSocket support - Real-time weather updates
Database storage - Track weather over time
Push notifications - Alert when conditions change


📚 Resources That Helped Me
Official Documentation:

MCP Docs: https://modelcontextprotocol.io
MCP SDK: https://github.com/modelcontextprotocol/typescript-sdk
WeatherAPI Docs: https://www.weatherapi.com/docs/

Tools:

MCP Inspector: Included with SDK (essential for testing)
VS Code: Best editor for TypeScript
Postman: Helpful for testing Weather API directly

Communities:

Anthropic Discord: #mcp-discussion channel
GitHub Discussions: MCP SDK repo


💭 Final Thoughts
Three days ago, I knew nothing about MCP. Today, I have a production server that:

Serves real client needs
Handles 50+ requests per day
Saved 2.5-4 hours of manual work daily

The secret? Just start. Pick a simple API, follow the MCP docs, and build something real.
You don't need to be an expert. You just need to:

Start with the basics
Test as you go
Add features incrementally
Don't be afraid to make mistakes

Your first MCP server doesn't have to be perfect. It just has to work.

🔗 Get the Full Code
Want to see the complete, production-ready version?
GitHub: https://github.com/Herman-Adu/mcp-weather-server
Includes:

Full source code
Comprehensive documentation
Configuration examples
Troubleshooting guide


🤝 Let's Connect
Built something cool with MCP? Have questions? Let's connect!

GitHub: @Herman-Adu
Twitter: @adu_dev
LinkedIn: https://www.linkedin.com/in/herman-adu/
Website: https://www.adudev.co.uk


📖 What's Next?
This is Part 1 in my MCP series. Coming next:

Part 2: Advanced TypeScript patterns for MCP servers
Part 3: Building a production-ready database MCP server
Part 4: Performance optimization and caching strategies

Subscribe to Adu Dev on LinkedIn to catch the next posts!

Tags: #MCP #TypeScript #Beginners #Tutorial #AI #ClaudeAI #WebDevelopment

Written by Herman Adu | Adu Dev
Development services you can trust
January 2025
```
