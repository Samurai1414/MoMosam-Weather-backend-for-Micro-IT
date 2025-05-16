import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY || 'ef173bd6ad884db03a5578c59bd8f978';

// Middleware
app.use(cors());
app.use(express.json());

// Weather API endpoint
app.get('/api/weather', async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({ message: 'City parameter is required' });
    }
    
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        q: city,
        appid: OPENWEATHERMAP_API_KEY
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    
    // Handle OpenWeatherMap API specific errors
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        return res.status(404).json({ message: 'City not found' });
      } else if (status === 401) {
        return res.status(401).json({ message: 'Invalid API key' });
      }
      return res.status(status).json({ message: error.response.data.message || 'Error from weather service' });
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Forecast API endpoint (5-day / 3-hour forecast)
app.get('/api/forecast', async (req, res) => {
  try {
    const { city = 'Dhaka' } = req.query; // Default to Dhaka if no city provided
    
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
      params: {
        q: city,
        appid: OPENWEATHERMAP_API_KEY
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching forecast data:', error.message);
    
    // Handle OpenWeatherMap API specific errors
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        return res.status(404).json({ message: 'City not found' });
      } else if (status === 401) {
        return res.status(401).json({ message: 'Invalid API key' });
      }
      return res.status(status).json({ message: error.response.data.message || 'Error from weather service' });
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
});

// For production: Serve frontend static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  // Serve static files from the frontend build directory
  const staticPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(staticPath));
  
  // Handle any requests that don't match the API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 