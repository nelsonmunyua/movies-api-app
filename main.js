// --- Global Constants and State Object ---
const state = {}; // Central state object
const baseUrl = "https://api.themoviedb.org/3/";
const apiKey = "50a540b448a228f9f2f710a36c248b31";
const posterBaseUrl = "https://image.tmdb.org/t/p/w500";
const posterBaseUrlDropdown = "https://image.tmdb.org/t/p/w200";

// --- API Fetch Function ---
async function fetchFromTMDB(endpoint) {
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${baseUrl}${endpoint}${separator}api_key=${apiKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

// --- HTML Rendering Functions ---
function createMovieCard(movie, imgSize = '500x750', isSimilar = false) {
  const imgBaseUrl = isSimilar ? posterBaseUrlDropdown : posterBaseUrl;
  const posterPath = movie.poster_path ?
    `${imgBaseUrl}${movie.poster_path}` :
    `https://via.placeholder.com/${imgSize}?text=No+Image`;

  // Make movie card width fixed for horizontal lists
  const cardStyle = isSimilar ? '' : 'style="min-width: 200px; width: 200px;"';

  return `
    <div class="movie-card" data-movie-id="${movie.id}" ${cardStyle}>
      <img src="${posterPath}" alt="${movie.title} poster">
      <div class="movie-info">
        <h3 class="movie-title">${movie.title}</h3>
        <p>Rating: ${movie.vote_average.toFixed(1)}</p>
      </div>
    </div>
  `;
}

function displayMovies(movies) {
  if (state.moviesList) {
    state.moviesList.innerHTML = movies.map(movie => createMovieCard(movie)).join('');
  }
}

function getSimilarMoviesHtml(similarMovies) {
  if (similarMovies.length === 0) return '<h4>No similar movies found.</h4>';
  const similarCards = similarMovies.slice(0, 4).map(movie =>
    createMovieCard(movie, '200x300', true)
  ).join('');
  return `
    <h4>Similar Movies</h4>
    <div class="similar-movies-grid">${similarCards}</div>
  `;
}

function getTrailerHtml(videos) {
  const trailer = videos.find(vid => vid.site === "YouTube" && vid.type === "Trailer");
  if (!trailer) return '<h4>No trailers available.</h4>';
  return `
    <h4>Trailer</h4>
    <div class="video-container">
      <iframe src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>
    </div>
  `;
}

function populateModal(details, videos, similarMovies) {
  if (!state.modalContent) return;
  state.modalContent.innerHTML = `
    <span class="modal-close">&times;</span>
    <h2>${details.title}</h2>
    <div class="modal-body">
      <img src="${posterBaseUrl}${details.poster_path}" alt="${details.title} poster" style="max-width: 300px; border-radius: 8px;">
      <p><strong>Overview:</strong> ${details.overview}</p>
      <p><strong>Release Date:</strong> ${details.release_date}</p>
      <p><strong>Rating:</strong> ${details.vote_average.toFixed(1)}</p>
      ${getTrailerHtml(videos)}
      ${getSimilarMoviesHtml(similarMovies)}
    </div>
  `;
  if (state.modal) state.modal.classList.add('show-modal');
}

// --- Event Handlers and Fetchers ---
const fetchGenresList = async () => {
  if (!state.genreList) return;
  const data = await fetchFromTMDB("genre/movie/list?language=en-US");
  if (!data) return;
  state.genreList.innerHTML = data.genres.map(genre =>
    `<li data-id="${genre.id}"><a href="#">${genre.name}</a></li>`
  ).join('');
};

const fetchMoviesByGenre = async (genreId) => {
  const data = await fetchFromTMDB(`discover/movie?with_genres=${genreId}`);
  if (!data || !data.results) return;
  displayMovies(data.results);
};

const fetchMovieDetails = async (movieId) => {
  if (!state.modal) return;
  state.modal.classList.add('show-modal');
  try {
    const [details, videos, similar] = await Promise.all([
      fetchFromTMDB(`movie/${movieId}`),
      fetchFromTMDB(`movie/${movieId}/videos`),
      fetchFromTMDB(`movie/${movieId}/similar`)
    ]);
    populateModal(details, videos.results, similar.results);
  } catch (error) {
    console.error("Failed to fetch movie details:", error);
    if (state.modal) state.modal.classList.remove('show-modal');
  }
};

async function fetchAndDisplayCategory(endpoint, container) {
  if (!container) return;
  const data = await fetchFromTMDB(endpoint);
  if (!data || !data.results) return;
  container.innerHTML = data.results.map(movie => createMovieCard(movie)).join('');
}

// Search functionality with debounce
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

const handleSearch = async (query) => {
    if (!state.searchDropdownResults) return;
    if (query.trim() === "") {
        state.searchDropdownResults.innerHTML = "";
        state.searchDropdownResults.classList.remove('show');
        return;
    }
    const data = await fetchFromTMDB(`search/movie?query=${encodeURIComponent(query)}`);
    if (!data || !data.results) return;

    state.searchDropdownResults.innerHTML = data.results.slice(0, 5).map(movie => {
        const posterPath = movie.poster_path ? `${posterBaseUrlDropdown}${movie.poster_path}` : 'https://via.placeholder.com/40x60?text=No+Image';
        return `
            <div class="dropdown-item" data-movie-id="${movie.id}">
                <img src="${posterPath}" alt="${movie.title} poster">
                <span class="title">${movie.title}</span>
            </div>
        `;
    }).join('');
    state.searchDropdownResults.classList.add('show');
};

const debouncedSearch = debounce(handleSearch, 300);

// --- Initial Setup ---
document.addEventListener("DOMContentLoaded", () => {
  // Initialize state with all DOM elements
  Object.assign(state, {
    genreList: document.querySelector(".genre-list"),
    moviesList: document.querySelector(".movies-list"),
    modal: document.querySelector("#movie-modal"),
    modalContent: document.querySelector(".modal-content"),
    popularMovies: document.getElementById("popular-movies"),
    topRatedMoviesList: document.getElementById("top-rated-movies"),
    nowPlayingMoviesList: document.getElementById("now-playing-movies"),
    upcomingMoviesList: document.getElementById("upcoming-movies"),
    searchInput: document.getElementById("search-input"),
    searchDropdownResults: document.getElementById("search-dropdown-results"),
  });

  // Attach all event listeners
  const listsToListen = [
      state.genreList, state.moviesList, state.popularMovies, 
      state.topRatedMoviesList, state.nowPlayingMoviesList, state.upcomingMoviesList
  ];
  
  listsToListen.forEach(list => {
      if (!list) return;
      list.addEventListener("click", (event) => {
          if (list === state.genreList) {
              event.preventDefault();
              const listItem = event.target.closest("li");
              if (listItem && listItem.dataset.id) {
                  fetchMoviesByGenre(listItem.dataset.id);
              }
          } else {
              const movieCard = event.target.closest('.movie-card');
              if (movieCard && movieCard.dataset.movieId) {
                  fetchMovieDetails(movieCard.dataset.movieId);
              }
          }
      });
  });

  if (state.searchInput) {
    state.searchInput.addEventListener("input", (e) => debouncedSearch(e.target.value));
    state.searchInput.addEventListener("blur", () => {
      setTimeout(() => {
        if(state.searchDropdownResults) state.searchDropdownResults.classList.remove('show');
      }, 200);
    });
  }
  
  if (state.searchDropdownResults) {
    state.searchDropdownResults.addEventListener("click", (event) => {
      const dropdownItem = event.target.closest('.dropdown-item');
      if (dropdownItem && dropdownItem.dataset.movieId) {
        fetchMovieDetails(dropdownItem.dataset.movieId);
      }
    });
  }

  if (state.modal) {
    state.modal.addEventListener('click', (event) => {
      if (event.target === state.modal || event.target.classList.contains('modal-close')) {
        state.modal.classList.remove('show-modal');
      }
    });
  }

  // --- Initial API Calls on Page Load ---
  fetchGenresList();
  fetchAndDisplayCategory("movie/popular", state.popularMovies);
  fetchAndDisplayCategory("movie/top_rated", state.topRatedMoviesList);
  fetchAndDisplayCategory("movie/now_playing", state.nowPlayingMoviesList);
  fetchAndDisplayCategory("movie/upcoming", state.upcomingMoviesList);
});
