
# SkyCast — Weather Reporting App

A responsive React weather dashboard using the free Open-Meteo forecast and geocoding APIs. No API key is required.

## Features
- Current temperature, condition, and feels-like temperature
- Search for a city with basic form validation
- Browser geolocation (permission required)
- Celsius/Fahrenheit toggle
- Wind, humidity, rain chance, UV index, sunrise, and sunset
- Next 8 hours and 7-day forecasts
- Refresh action, loading states, and error messages
- Responsive desktop, tablet, and mobile layouts
- Accessible labels, keyboard focus states, and reduced-motion support

## Folder structure
```text
weather-reporting-app/
├── index.html
├── package.json
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    └── styles.css
```

## Run locally
1. Install Node.js (LTS recommended).
2. Extract this folder and open it in VS Code.
3. Open a terminal in the `weather-reporting-app` folder.
4. Run:

```bash
npm install
npm run dev
```

5. Open the local URL printed by Vite (usually `http://localhost:5173`).

To check the production build:
```bash
npm run build
npm run preview
```

## API notes
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast: `https://api.open-meteo.com/v1/forecast`
- API documentation: https://open-meteo.com/en/docs

Open-Meteo's free API does not require a key for this demo. Internet access is required for live weather data. Browser location works on localhost and secure HTTPS deployments, and only after the user grants permission.

## Interview explanation
- `App.jsx` owns state, API calls, validation, temperature conversion, and rendering.
- `getCoordinates()` converts a city name into latitude/longitude.
- `getWeather()` requests current, hourly, and daily forecast data.
- `weatherInfo()` maps weather codes to readable labels and icons.
- `styles.css` contains the responsive layout and reusable card styles.
- `main.jsx` mounts the React application.


## Login and registration
- Users see the login page first.
- The registration page validates required fields, email format, password length, and matching passwords.
- After signing in, the weather dashboard appears. The logout icon returns to login.
- This is a **front-end demonstration only**: demo account details are stored in browser `localStorage`. Do not use real passwords or deploy this as secure authentication. For production, add a backend with hashed passwords, session/JWT handling, and server-side validation.

# weather_reporting
SkyCast is a responsive weather forecasting web application built using React, JavaScript, HTML, and CSS. It provides current weather conditions and a 7-day forecast using the Open-Meteo API. The application includes login and registration pages, form validation, and a personalized weather dashboard with a modern, user-friendly interface.

