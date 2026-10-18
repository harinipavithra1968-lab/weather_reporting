import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  Search, MapPin, LocateFixed, Sun, CloudSun, Cloud, CloudRain, CloudSnow,
  CloudLightning, Wind, Droplets, Eye, Thermometer, Sunrise, Sunset,
  CalendarDays, RefreshCw, AlertCircle, Umbrella, Gauge, LogOut
} from 'lucide-react';

const API = 'https://api.open-meteo.com/v1/forecast';
const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';

function weatherInfo(code) {
  if (code === 0) return { label: 'Clear sky', Icon: Sun };
  if ([1, 2].includes(code)) return { label: 'Mostly clear', Icon: CloudSun };
  if (code === 3) return { label: 'Overcast', Icon: Cloud };
  if ([45, 48].includes(code)) return { label: 'Foggy', Icon: Cloud };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: 'Drizzle', Icon: CloudRain };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: 'Rain', Icon: CloudRain };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Snow', Icon: CloudSnow };
  if ([95, 96, 99].includes(code)) return { label: 'Thunderstorm', Icon: CloudLightning };
  return { label: 'Cloudy', Icon: CloudSun };
}

function formatDay(dateString, index) {
  if (index === 0) return 'Today';
  return new Date(`${dateString}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' });
}

function formatTime(value) {
  if (!value) return '--:--';
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function getCoordinates(city) {
  const response = await fetch(`${GEO_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
  if (!response.ok) throw new Error('Could not search for that city. Please try again.');
  const data = await response.json();
  if (!data.results?.length) throw new Error('City not found. Check the spelling and try another city.');
  const place = data.results[0];
  return {
    name: place.name,
    region: [place.admin1, place.country].filter(Boolean).join(', '),
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone || 'auto'
  };
}

async function getWeather(place) {
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone || 'auto',
    forecast_days: '7',
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max'
  });
  const response = await fetch(`${API}?${params}`);
  if (!response.ok) throw new Error('Weather service is temporarily unavailable. Please refresh in a moment.');
  return response.json();
}

function Metric({ icon: Icon, label, value, note }) {
  return (
    <article className="metric-card">
      <div className="metric-top"><span className="metric-icon"><Icon size={18} /></span><span>{label}</span></div>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </article>
  );
}

export default function App({ onLogout }) {
  const [place, setPlace] = useState({
    name: 'Chennai', region: 'Tamil Nadu, India', latitude: 13.0827, longitude: 80.2707, timezone: 'Asia/Kolkata'
  });
  const [weather, setWeather] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('C');
  const [updatedAt, setUpdatedAt] = useState(null);

  const loadWeather = useCallback(async (selectedPlace) => {
    setLoading(true);
    setError('');
    try {
      const data = await getWeather(selectedPlace);
      setPlace(selectedPlace);
      setWeather(data);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(err.message || 'Something went wrong while loading weather.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWeather(place); }, []); // Initial weather for Chennai

  const convert = useCallback((celsius) => {
    if (celsius == null) return '--°';
    const value = unit === 'C' ? celsius : (celsius * 9) / 5 + 32;
    return `${Math.round(value)}°`;
  }, [unit]);

  const current = weather?.current;
  const daily = weather?.daily;
  const hourly = weather?.hourly;
  const currentInfo = current ? weatherInfo(current.weather_code) : { label: 'Loading weather', Icon: CloudSun };

  const hourlyItems = useMemo(() => {
    if (!hourly || !current) return [];
    const start = hourly.time.findIndex((time) => new Date(time).getTime() >= new Date(current.time).getTime());
    const safeStart = Math.max(0, start);
    return Array.from({ length: 8 }, (_, i) => safeStart + i)
      .filter((i) => i < hourly.time.length)
      .map((i) => ({ time: hourly.time[i], temp: hourly.temperature_2m[i], code: hourly.weather_code[i], rain: hourly.precipitation_probability[i] }));
  }, [hourly, current]);

  async function handleSearch(event) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setError('Enter a city name to search.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const found = await getCoordinates(trimmed);
      await loadWeather(found);
      setQuery('');
    } catch (err) {
      setError(err.message || 'Unable to find this location.');
      setLoading(false);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError('Location is not supported by this browser. Search for a city instead.');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const found = {
          name: 'My location', region: 'Current location', latitude: coords.latitude,
          longitude: coords.longitude, timezone: 'auto'
        };
        await loadWeather(found);
      } catch (err) {
        setError(err.message || 'Could not load your location.');
        setLoading(false);
      }
    }, () => {
      setError('Location permission was denied. You can still search for a city.');
      setLoading(false);
    }, { timeout: 10000, maximumAge: 300000 });
  }

  const todayHigh = daily?.temperature_2m_max?.[0];
  const todayLow = daily?.temperature_2m_min?.[0];
  const todayUV = daily?.uv_index_max?.[0];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="SkyCast home">
          <span className="brand-mark"><CloudSun size={23} /></span>
          <span>sky<span className="brand-accent">cast</span><small>WEATHER STUDIO</small></span>
        </a>
        <div className="sidebar-label">YOUR WEATHER</div>
        <button className="side-link active" onClick={() => loadWeather(place)}><CloudSun size={18} /> Overview</button>
        <button className="side-link" onClick={useMyLocation}><LocateFixed size={18} /> My location</button>
        <div className="sidebar-bottom">
          <div className="mini-weather-icon"><Sun size={27} /></div>
          <p>Weather, at a glance.</p>
          <span>Plan your day with confidence.</span>
        </div>
        <div className="sidebar-footer">DATA BY OPEN-METEO</div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div><p className="eyebrow">WEATHER DASHBOARD</p><h1>Good day, explorer <span>✦</span></h1></div>
          <div className="topbar-actions">
            {onLogout && <button className="icon-button" onClick={onLogout} aria-label="Log out" title="Log out"><LogOut size={18} /></button>}
            <div className="unit-toggle" aria-label="Temperature unit">
              <button className={unit === 'C' ? 'selected' : ''} onClick={() => setUnit('C')} aria-pressed={unit === 'C'}>°C</button>
              <button className={unit === 'F' ? 'selected' : ''} onClick={() => setUnit('F')} aria-pressed={unit === 'F'}>°F</button>
            </div>
            <button className="icon-button refresh-btn" onClick={() => loadWeather(place)} disabled={loading} aria-label="Refresh weather"><RefreshCw size={18} className={loading ? 'spin' : ''} /></button>
          </div>
        </header>

        <form className="search-form" onSubmit={handleSearch} noValidate>
          <Search size={19} />
          <input aria-label="Search city" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for a city..." autoComplete="off" />
          {query && <button className="clear-search" type="button" onClick={() => { setQuery(''); setError(''); }} aria-label="Clear search">×</button>}
          <button className="search-submit" type="submit" disabled={loading}>Search</button>
          <button className="location-button" type="button" onClick={useMyLocation} aria-label="Use my location"><LocateFixed size={18} /></button>
        </form>

        {error && <div className="error-banner" role="alert"><AlertCircle size={18} /><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}

        <div className="location-heading">
          <div><MapPin size={16} /><span>{place.name}</span><span className="location-region">{place.region}</span></div>
          <span className="updated-label">{updatedAt ? `Updated ${updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Connecting to live weather…'}</span>
        </div>

        <section className="hero-card" aria-label="Current weather">
          <div className="hero-copy">
            <span className="current-pill"><span className="live-dot"></span> CURRENT WEATHER</span>
            <p className="hero-date">{current ? new Date(current.time).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Fetching local forecast'}</p>
            <div className="temperature-row"><strong>{current ? convert(current.temperature_2m) : '--°'}</strong><span className="hero-unit">{unit === 'C' ? 'C' : 'F'}</span></div>
            <h2>{currentInfo.label}</h2>
            <p className="feels-like">Feels like {current ? convert(current.apparent_temperature) : '--°'}</p>
            <div className="hero-range"><span>H: {convert(todayHigh)}</span><span>L: {convert(todayLow)}</span></div>
          </div>
          <div className="hero-art">
            <div className="sun-glow"></div>
            <currentInfo.Icon size={112} strokeWidth={1.25} />
            <span className="weather-art-caption">{current?.is_day ? 'DAYTIME' : 'NIGHTTIME'}</span>
          </div>
          <div className="hero-footer"><span><MapPin size={14} /> {place.name}</span><span><CalendarDays size={14} /> 7-day outlook</span></div>
        </section>

        <section className="metrics-section">
          <div className="section-heading"><div><h2>Today's highlights</h2><p>Weather details to help plan your day</p></div><span className="section-tag">LIVE DATA</span></div>
          <div className="metrics-grid">
            <Metric icon={Wind} label="Wind speed" value={current ? `${Math.round(current.wind_speed_10m)} km/h` : '—'} note="At current location" />
            <Metric icon={Droplets} label="Humidity" value={current ? `${current.relative_humidity_2m}%` : '—'} note="Relative humidity" />
            <Metric icon={Umbrella} label="Rain chance" value={daily ? `${daily.precipitation_probability_max[0]}%` : '—'} note="Today's maximum" />
            <Metric icon={Gauge} label="UV index" value={todayUV == null ? '—' : todayUV.toFixed(1)} note={todayUV >= 8 ? 'Very high' : todayUV >= 6 ? 'High — use protection' : 'Check before going out'} />
            <Metric icon={Sunrise} label="Sunrise" value={daily ? formatTime(daily.sunrise[0]) : '—'} note="Local time" />
            <Metric icon={Sunset} label="Sunset" value={daily ? formatTime(daily.sunset[0]) : '—'} note="Local time" />
          </div>
        </section>

        <section className="forecast-section">
          <div className="section-heading"><div><h2>Hourly forecast</h2><p>Next hours at a glance</p></div><span className="section-tag">NEXT 8 HOURS</span></div>
          <div className="hourly-grid">
            {hourlyItems.length ? hourlyItems.map((item, i) => {
              const { Icon, label } = weatherInfo(item.code);
              return <article className={`hour-card ${i === 0 ? 'hour-now' : ''}`} key={item.time}>
                <span className="hour-time">{i === 0 ? 'Now' : new Date(item.time).toLocaleTimeString([], { hour: 'numeric' })}</span>
                <Icon className="hour-weather-icon" size={25} />
                <strong>{convert(item.temp)}</strong>
                <span className="hour-rain"><Droplets size={12} /> {item.rain ?? 0}%</span>
                <span className="sr-only">{label}</span>
              </article>;
            }) : <div className="loading-inline">{loading ? 'Loading hourly forecast…' : 'Hourly forecast will appear here.'}</div>}
          </div>
        </section>

        <section className="forecast-section weekly-section">
          <div className="section-heading"><div><h2>7-day forecast</h2><p>Plan ahead for the week</p></div><span className="section-tag">THIS WEEK</span></div>
          <div className="weekly-list">
            {daily ? daily.time.map((day, i) => {
              const { Icon, label } = weatherInfo(daily.weather_code[i]);
              const max = daily.temperature_2m_max[i];
              const min = daily.temperature_2m_min[i];
              const range = Math.max(1, daily.temperature_2m_max[0] - daily.temperature_2m_min[0]);
              const barLeft = Math.max(0, Math.min(85, ((min - Math.min(...daily.temperature_2m_min)) / (Math.max(...daily.temperature_2m_max) - Math.min(...daily.temperature_2m_min) || 1)) * 75));
              const barWidth = Math.max(15, Math.min(90, ((max - min) / (Math.max(...daily.temperature_2m_max) - Math.min(...daily.temperature_2m_min) || range)) * 70 + 20));
              return <article className="weekly-row" key={day}>
                <span className="week-day">{formatDay(day, i)}</span>
                <span className="week-condition"><Icon size={22} /><span>{label}</span></span>
                <span className="week-rain"><Droplets size={13} /> {daily.precipitation_probability_max[i] ?? 0}%</span>
                <div className="temp-range"><span>{convert(min)}</span><div className="temp-track"><span style={{ marginLeft: `${barLeft}%`, width: `${barWidth}%` }} /></div><strong>{convert(max)}</strong></div>
              </article>;
            }) : <div className="loading-inline">{loading ? 'Loading 7-day forecast…' : 'Weekly forecast will appear here.'}</div>}
          </div>
        </section>

        <footer className="app-footer"><span>SkyCast Weather Studio</span><span>Weather data powered by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a></span></footer>
      </section>
    </main>
  );
}