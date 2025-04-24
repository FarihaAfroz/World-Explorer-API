const countryContainer = document.getElementById('country-container');
const searchInput = document.getElementById('search');
const background = document.getElementById('background');

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  if (query.length > 1) fetchCountry(query);
});

async function fetchCountry(name) {
  countryContainer.innerHTML = '';
  try {
    const res = await fetch(`https://restcountries.com/v3.1/name/${name}`);
    const data = await res.json();
    displayCountries(data);
  } catch (err) {
    countryContainer.innerHTML = `<p>Country not found!</p>`;
    console.error(err);
  }
}

async function fetchWeather(city) {
  if (!city) return null;

  const WEATHER_API_KEY = 'f9a1c35303b5467183e225239252404';
  const endpoint = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(city)}`;

  try {
    const res = await fetch(endpoint);
    const data = await res.json();

    if (data.error) {
      console.warn(`Weather error for ${city}: ${data.error.message}`);
      return null;
    }

    return {
      icon: `https:${data.current.condition.icon}`,
      temp: data.current.temp_c,
      desc: data.current.condition.text.toLowerCase()
    };
  } catch (err) {
    console.error('FetchWeather Error:', err.message);
    return null;
  }
}

function updateBackground(weatherType) {
  const backgrounds = {
    clear: 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80)',
    cloudy: 'url(https://images.unsplash.com/photo-1526676031257-3e894e2a07e0?auto=format&fit=crop&w=1920&q=80)',
    rain: 'url(https://images.unsplash.com/photo-1520483861765-dfa9404c4d63?auto=format&fit=crop&w=1920&q=80)',
    snow: 'url(https://images.unsplash.com/photo-1600369671578-37c9965ed73d?auto=format&fit=crop&w=1920&q=80)',
    thunder: 'url(https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1920&q=80)',
    mist: 'url(https://images.unsplash.com/photo-1532274402917-5aadf881bdf1?auto=format&fit=crop&w=1920&q=80)'
  };

  const desc = weatherType.toLowerCase();
  let type = 'clear';

  if (desc.includes('cloud')) type = 'cloudy';
  else if (desc.includes('rain')) type = 'rain';
  else if (desc.includes('snow')) type = 'snow';
  else if (desc.includes('thunder')) type = 'thunder';
  else if (desc.includes('mist') || desc.includes('fog')) type = 'mist';

  background.style.backgroundImage = backgrounds[type];
}

async function displayCountries(countries) {
  for (let country of countries) {
    const capital = country.capital && country.capital[0];
    const weather = await fetchWeather(capital) || await fetchWeather(country.name.common);

    if (weather) updateBackground(weather.desc);

    const card = document.createElement('div');
    card.classList.add('card');

    card.innerHTML = `
      <h2>${country.name.common}</h2>
      <h4>${capital || 'No Capital'}</h4>
      <img src="${country.flags.svg}" alt="${country.name.common} Flag" style="width: 80px; height: 50px; border-radius: 5px;" />
      ${weather?.icon ? `<img src="${weather.icon}" alt="Weather Icon">` : '<p>Weather unavailable</p>'}
      <p>Temp: ${weather?.temp ? weather.temp + '°C' : 'N/A'}</p>
      <button class="toggle-details">More Details</button>
      <div class="details hidden">
        <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
        <p><strong>Capital:</strong> ${country.capital}</p>
        <p><strong>Region:</strong> ${country.region}</p>
        <p><strong>Flag:</strong> ${country.flag}</p>
      </div>
    `;

    card.querySelector('.toggle-details').addEventListener('click', () => {
      const details = card.querySelector('.details');
      details.classList.toggle('hidden');
    });

    countryContainer.appendChild(card);
  }
}
