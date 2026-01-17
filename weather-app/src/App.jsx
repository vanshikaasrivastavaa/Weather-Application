import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('New York');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  
  const [darkMode, setDarkMode] = useState(false);
  const [isCelsius, setIsCelsius] = useState(false);

  // API Constants
  const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
  const API_HOST = import.meta.env.VITE_RAPIDAPI_HOST;

  // 1. Fetch by City Name (Search Bar)
  const fetchWeatherByCity = async (cityName) => {
    setLoading(true);
    setError(null);
    
    const url = `https://open-weather13.p.rapidapi.com/city?city=${cityName}&lang=EN`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST
      }
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setWeather(result);
      setCity(result.name); // Update city name from API result
    } catch (err) {
      console.error(err);
      setError("Could not find weather for that city.");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch by Coordinates (Location Button)
  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);

    // Using the direct Lat/Lon endpoint you found
    const url = `https://open-weather13.p.rapidapi.com/latlon?latitude=${lat}&longitude=${lon}&lang=EN`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST
      }
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setWeather(result);
      setCity(result.name); // Automatically update the city name in state
    } catch (err) {
      console.error(err);
      setError("Could not find weather for your location.");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchWeatherByCity('New York');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchWeatherByCity(searchInput);
      setSearchInput('');
    }
  };

  // --- Optimized Location Handler ---
  const handleLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Call the new specific function directly
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          setError("Location access denied. Please enable it in your browser.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  // Helper: Temperature Conversion
  const displayTemp = (tempF) => {
    if (isCelsius) {
      return Math.round((tempF - 32) * (5/9));
    }
    return Math.round(tempF);
  };

  const getIconUrl = (iconCode) => `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'} min-vh-100 d-flex flex-column align-items-center justify-content-center`}>
      
      {/* Top Controls */}
      <div className="position-absolute top-0 end-0 p-4">
        <button 
          className={`btn ${darkMode ? 'btn-light' : 'btn-dark'} rounded-circle shadow-sm`}
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle Dark Mode"
        >
          <i className={`bi ${darkMode ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`}></i>
        </button>
      </div>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            
            {/* Search Card */}
            <div className={`card shadow-lg border-0 rounded-4 mb-4 ${darkMode ? 'glass-dark' : 'glass-light'}`}>
              <div className="card-body p-4">
                <h3 className={`text-center fw-bold mb-4 ${darkMode ? 'text-white' : 'text-primary'}`}>
                  Weather Forecast
                </h3>
                <form onSubmit={handleSearch} className="d-flex gap-2">
                  <input
                    type="text"
                    className={`form-control form-control-lg border-0 shadow-sm ${darkMode ? 'bg-dark text-white placeholder-light' : ''}`}
                    placeholder="Enter city name..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  
                  {/* Location Button */}
                  <button 
                    className="btn btn-secondary btn-lg shadow-sm" 
                    type="button" 
                    onClick={handleLocation}
                    title="Use My Location"
                  >
                    <i className="bi bi-geo-alt-fill"></i>
                  </button>

                  <button className="btn btn-primary btn-lg shadow-sm" type="submit">
                    <i className="bi bi-search"></i>
                  </button>
                </form>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger rounded-4 shadow-sm text-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
              </div>
            )}

            {/* Loading Spinner */}
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {/* Weather Display */}
            {!loading && weather && (
              <div className={`card shadow-lg border-0 rounded-4 fade-in ${darkMode ? 'glass-dark text-white' : 'glass-light text-dark'}`}>
                <div className="card-body p-5 text-center">
                  
                  {/* Header */}
                  <div className="mb-4">
                    <h2 className="display-6 fw-bold mb-0">{weather.name}, {weather.sys.country}</h2>
                    <p className={`text-capitalize fs-5 ${darkMode ? 'text-light-50' : 'text-muted'}`}>
                      {weather.weather[0].description}
                    </p>
                  </div>

                  {/* Main Temp & Icon */}
                  <div className="d-flex align-items-center justify-content-center mb-4 position-relative">
                    <img 
                      src={getIconUrl(weather.weather[0].icon)} 
                      alt={weather.weather[0].main} 
                      className="weather-icon"
                    />
                    <div className="ms-3 text-start">
                      <h1 className="display-1 fw-bold mb-0">
                        {displayTemp(weather.main.temp)}°{isCelsius ? 'C' : 'F'}
                      </h1>
                      
                      <div className="form-check form-switch mt-2">
                        <input 
                          className="form-check-input cursor-pointer" 
                          type="checkbox" 
                          role="switch" 
                          id="unitSwitch"
                          checked={isCelsius}
                          onChange={() => setIsCelsius(!isCelsius)}
                        />
                        <label className="form-check-label small opacity-75" htmlFor="unitSwitch">
                          Switch to {isCelsius ? 'Fahrenheit' : 'Celsius'}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="row g-3">
                    <div className="col-6">
                      <div className={`p-3 rounded-4 shadow-sm h-100 ${darkMode ? 'bg-white-10' : 'bg-light'}`}>
                        <i className="bi bi-thermometer-half text-danger fs-3"></i>
                        <p className="mb-0 small opacity-75">Feels Like</p>
                        <h5 className="fw-bold">{displayTemp(weather.main.feels_like)}°{isCelsius ? 'C' : 'F'}</h5>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className={`p-3 rounded-4 shadow-sm h-100 ${darkMode ? 'bg-white-10' : 'bg-light'}`}>
                        <i className="bi bi-droplet-fill text-primary fs-3"></i>
                        <p className="mb-0 small opacity-75">Humidity</p>
                        <h5 className="fw-bold">{weather.main.humidity}%</h5>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className={`p-3 rounded-4 shadow-sm h-100 ${darkMode ? 'bg-white-10' : 'bg-light'}`}>
                        <i className="bi bi-wind text-secondary fs-3"></i>
                        <p className="mb-0 small opacity-75">Wind</p>
                        <h5 className="fw-bold">{weather.wind.speed} mph</h5>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className={`p-3 rounded-4 shadow-sm h-100 ${darkMode ? 'bg-white-10' : 'bg-light'}`}>
                        <i className="bi bi-speedometer2 text-success fs-3"></i>
                        <p className="mb-0 small opacity-75">Pressure</p>
                        <h5 className="fw-bold">{weather.main.pressure} hPa</h5>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;