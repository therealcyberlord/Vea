# Vea

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A local AI assistant that seamlessly integrates with your Ollama installations. Learn more about Ollama at [https://ollama.com/](https://ollama.com/).

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Limitations](#limitations)
- [License](#license)

## Overview

Vea is a local AI copilot that seamlessly integrates with your Ollama installations. It provides a modern, web-based interface for interacting with local AI models while leveraging additional capabilities such as web search, mathematical operations, weather information, and image analysis. You can switch to closed-source models like OpenAI and Anthropic by editing the configuration file at `backend/config/agent.yaml`.

## Features

- Web search capabilities powered by Tavily API
- Real-time weather information using OpenWeather API
- Mathematical calculations including arithmetic and trigonometric functions
- Multi-modal vision capabilities
- Context-aware responses with current date/time integration
- Modular architecture with LangGraph support and LangSmith observability
- Visible thinking traces when using a reasoning model

## Tech Stack

- **Backend**: FastAPI, LangGraph, LangSmith, and Ollama
- **Frontend**: React, TypeScript, TailwindCSS, and Vite

## Setting Up Vite Project

To create a new Vite project with TypeScript support:

```bash
npm create vite@latest frontend -- --template react-ts
```

## Prerequisites

To install and run Vea, ensure you have the following:

- Python 3.8 or higher
- Node.js 16 or higher
- Tavily API key
- OpenWeather API key
- Ollama installed and running

## Installation

1. Clone the repository:

```bash
git clone https://github.com/therealcyberlord/Vea.git
cd Vea
```

2. Install Python dependencies using UV:

```bash
uv install
```

3. Install frontend dependencies:

```bash
cd frontend
npm install
```

## Configuration

Create a `.env` file in the root directory with the following configuration:

```
TAVILY_API_KEY=your_tavily_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
```

You can obtain API keys from:

- Tavily API: https://tavily.com/
- OpenWeather API: https://openweathermap.org/api

## Usage

1. Start the backend server:

```bash
uv run backend/agent/vea.py
```

2. Start the frontend development server:

```bash
cd frontend
npm run dev
```

The application will be accessible at `http://localhost:3000`

## Project Structure

```
Vea/
├── backend/           # Backend implementation
│   ├── agent/         # Main AI agent
│   └── tools/         # AI tools and utilities
├── frontend/          # Frontend application
│   ├── src/           # TypeScript source code
│   ├── public/        # Static assets
│   └── vite.config.ts # Vite configuration
└── .env               # Environment variables
```

## Limitations

- Memory persistence is stored in-memory and is not persisted to an external database
- Web search capabilities are subject to Tavily API's rate limits
- Vision capabilities depend on the underlying model's capabilities
- Temperature configuration functionality is currently a work-in-progress

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
