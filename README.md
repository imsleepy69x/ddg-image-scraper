# DuckDuckGo Image Scraper API

A powerful and efficient Node.js REST API for scraping image search results from DuckDuckGo.

## Overview

This project provides a simple yet robust REST API built with Express.js that fetches image results from DuckDuckGo. It's designed to be a reliable backend service for applications that need dynamic image content without requiring an official API key.

The API mimics a real browser to avoid getting blocked and includes essential features like result count customization, safe search filtering, pagination, and performance caching. It's built to be easily deployed and used, whether for a personal project, a frontend application, or a content service.

## Key Features

Dynamic Image Scraping: Fetch images from DuckDuckGo for any keyword.

Structured JSON Response: Receive clean , predictable JSON data.

Customizable Queries: Control the number of images, safe search level, and more.

Full Pagination Support: Use the offset parameter to skip results and browse deep into the search pages.

Efficient VQD Caching: An in-memory cache speeds up consecutive requests for the same query by reusing session tokens.

Built-in Throttling: Smart delays between requests prevent rate-limiting and improve reliability.

CORS Enabled: Ready to be consumed directly by any frontend web application.

Vercel Ready: Includes a vercel.json configuration for seamless, one-click deployment.

API Usage Guide

The API exposes a single, powerful endpoint for all image scraping tasks.

Endpoint: GET /images

This endpoint scrapes DuckDuckGo for images and returns the findings in a JSON format.

Query Parameters

q (string)

Description: The search keyword or phrase you want to search for.

Required: Yes

Example: ?q=northern+lights

count (number)

Description: The desired number of images to fetch. The API will fetch as many as possible up to this limit.

Required: No

Default: 30

Max Value: 200

Example: ?count=50

safe (integer)

Description: The safe search filter level.

Required: No

Default: 1 (Moderate)

Options:

1: Moderate

0: Strict

-1: Off

Example: ?safe=-1

offset (number)

Description: The number of initial results to skip. This is the key to pagination, allowing you to fetch "new" results for the same query.

Required: No

Default: 0

Example: ?offset=100

Example Requests

You can use cURL or any other HTTP client to interact with the API.

### 1. Basic Request
Fetch the default 30 images for the query "forests".


```
curl "http://localhost:3000/images?q=forests"
```

### 2. Custom Count & Safe Search
Fetch 15 images of "supernova" with safe search turned off.

```
curl "http://localhost:3000/images?q=supernova&count=15&safe=-1"
```

### 3. Pagination with Offset
Fetch the "second page" of results for "classic cars" by skipping the first 25.

```
curl "http://localhost:3000/images?q=classic+cars&count=25&offset=25"
```

### 4. Invalid Request (Missing q parameter)


This will return a 400 Bad Request with an error message:

```
{
  "error": "The \"q\" parameter (search query) is required."
}```

Example Success Response:

A  successful request returns a JSON object with metadata and a results array.

```
{
   "query": "classic cars",
  "count": 25,
  "offset": 25,
  "metadata": {
    "elapsedTime": "2.15s",
    "pagesScraped": 3
  },
  "results": [
    {
      "title": "Classic Car Show",
      "image": "https://example.com/images/car.jpg",
      "thumbnail": "https://example.com/images/thumb_car.jpg",
      "width": 1920,
      "height": 1080,
      "source": "example.com",
      "page_url": "https://example.com/page/classic-car-show"
    }
  ]
}

# Local Development Setup

Follow these steps to run the API on your own machine.

## 1. Clone the Repository

```
git clone https://github.com/imsleepy69x/ddg-image-scraper.git
cd ddg-image-scraper
```

## 2. Install Dependencies
You'll need Node.js and npm installed.


## 3. Create Environment File
Create a .env file in the project root. This file stores configuration that should not be committed to Git. Copy and paste the following, adjusting if needed.


# Server Configuration

```
PORT=3000
HOST=localhost
```

# Scraping Configuration

```
USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"

REQUEST_DELAY_MS=500

# API Limits
MAX_IMAGE_COUNT=200 (per query)
```

4. Run the Server

The API is now live and listening at http://localhost:3000.

# Deployment Guide for Vercel

This project is optimized for a quick and free deployment on Vercel.

## 1. Prerequisites

A GitHub account with your project code pushed to a repository.

A Vercel account (you can sign up for free with your GitHub account).

## 2. Import Your Project in Vercel

Log in to your Vercel dashboard.

Click "Add New... -> Project".

Select the GitHub repository for this project. Vercel will automatically detect that it's a Node.js application.

## 3. Configure the Project

The build settings should be automatically configured thanks to the vercel.json file. You don't need to change them.

Navigate to the "Environment Variables" section. This is the most important step. Add the variables from your local .env file one by one.

Name	 Value

HOST 0.0.0.0
MAX_IMAGE_COUNT 200
REQUEST_DELAY_MS	500
USER_AGENT Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36

## 4. Deploy

Click the "Deploy" button.

Vercel will build and deploy your API to its global serverless network. When it's finished, you will be given a public URL (e.g., https://ddg-image-scraper-your-name.vercel.app).

## Technology Stack

Backend: Node.js 

Framework: Express.js

HTTP Client: Axios

Deployment: Vercel
