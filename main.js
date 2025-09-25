// --- Global Constants ---
const baseUrl = "https://api.themoviedb.org/3/";
const apiKey = "50a540b448a228f9f2f710a36c248b31";
const posterBaseUrl = "https://image.tmdb.org/t/p/w500";
const posterBaseUrlDropdown = "https://image.tmdb.org/t/p/w200";

// --- Wait for the DOM to be fully loaded before running any script ---
document.addEventListener("DOMContentLoaded", () => {
    // --- Select all DOM elements safely here ---
    const genreList = document.querySelector(".genre-list");
    const moviesList = document.querySelector(".movies-list");
    const modal = document.querySelector("#movie-modal");

    // --- Attach all event listeners here ---
    genreList.addEventListener("click", (event) => {
        event.preventDefault(); // Stop the link's default behaviour
        const listItem = event.target.closest("li");
        if (listItem && listItem.dataset.id) {
            fetchMoviesByGenre(listItem.dataset.id, moviesList);
        }
    });

    moviesList.addEventListener("click", (event) => {
        const movieCard = event.target.closest('.movie-card');
        if (movieCard && movieCard.dataset.movieId) {
            fetchMovieDetails(movieCard.dataset.movieId, modal);
        }
    });

    // Add listeners to close the modal
    modal.addEventListener('click', (event) => {
        // Close if the dark overlay is clicked
        if (event.target === modal) {
            hideModal(modal);
        }
        // Close if the 'X' button is clicked
        if (event.target.classList.contains('modal-close')) {
            hideModal(modal);
        }
    });

    // --- Initial call to populate the genre list ---
    fetchGenresList(genreList);
});


// --- Reusable API Fetch Function (Corrected) ---
async function fetchFromTMDB(endpoint) {
    // Check if the endpoint already has query params
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${baseUrl}${endpoint}${separator}api_key=${apiKey}`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`HTTP Error: ${res.status}`);
        }
        return res.json();
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

// --- Modal Helper Functions ---
const showModal = (modal) => {
    if(modal) modal.classList.add('show-modal');
};
const hideModal = (modal) => {
    if(modal) modal.classList.remove('show-modal');
};

// --- Data Fetching and Display Functions ---

const fetchGenresList = async (genreList) => {
    if (!genreList) return;
    const data = await fetchFromTMDB("genre/movie/list?language=en-US");
    if (!data) return;

    genreList.innerHTML = "";
    data.genres.forEach((genre) => {
        const listItem = document.createElement("li");
        const listLink = document.createElement("a");
        listLink.textContent = genre.name;
        listLink.href = "#";
        listItem.dataset.id = genre.id;
        listItem.appendChild(listLink);
        genreList.appendChild(listItem);
    });
};

const fetchMoviesByGenre = async (genreId, moviesList) => {
    if (!moviesList) return;
    const data = await fetchFromTMDB(`discover/movie?with_genres=${genreId}`);
    if (!data || !data.results) return;
    displayMovies(data.results, moviesList);
};

const displayMovies = (movies, moviesList) => {
    moviesList.innerHTML = "";
    movies.forEach((movie) => {
        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");
        movieCard.dataset.movieId = movie.id;
        const posterPath = movie.poster_path ?
            `${posterBaseUrl}${movie.poster_path}` :
            "https://via.placeholder.com/500x750?text=No+Image";

        movieCard.innerHTML = `
            <img src="${posterPath}" alt="${movie.title} poster">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p>Rating: ${movie.vote_average.toFixed(1)}</p>
            </div>
        `;
        moviesList.appendChild(movieCard);
    });
};

const fetchMovieDetails = async (movieId, modal) => {
    if(!modal) return;
    showModal(modal);
    try {
        const [details, videos, similar] = await Promise.all([
            fetchFromTMDB(`movie/${movieId}`),
            fetchFromTMDB(`movie/${movieId}/videos`),
            fetchFromTMDB(`movie/${movieId}/similar`)
        ]);
        populateModal(details, videos.results, similar.results, modal);
    } catch (error) {
        console.error("Failed to fetch movie details:", error);
        hideModal(modal);
    }
};

const populateModal = (details, videos, similarMovies, modal) => {
    const modalContent = modal.querySelector(".modal-content");
    if(!modalContent) return;

    modalContent.innerHTML = `
        <span class="modal-close">&times;</span>
        <h2>${details.title}</h2>
        <div class="modal-body">
            <img src="${posterBaseUrl}${details.poster_path}" alt="${details.title} poster">
            <p><strong>Overview:</strong> ${details.overview}</p>
            <p><strong>Release Date:</strong> ${details.release_date}</p>
            <p><strong>Rating:</strong> ${details.vote_average.toFixed(1)}</p>
            ${getTrailerHtml(videos)}
            ${getSimilarMoviesHtml(similarMovies)}
        </div>
    `;
    showModal(modal);
};

const getTrailerHtml = (videos) => {
    const trailer = videos.find(vid => vid.site === "YouTube" && vid.type === "Trailer");
    if (!trailer) return '<h4>No trailers available.</h4>';
    return `
        <h4>Trailer</h4>
        <div class="video-container">
            <iframe src="https://www.youtube.com/embed/${trailer.key}" 
                    frameborder="0" allow="accelerometer; autoplay; clipboard-write; 
                    encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
    `;
};

const getSimilarMoviesHtml = (similarMovies) => {
    if (similarMovies.length === 0) return '<h4>No similar movies found.</h4>';
    const similarCards = similarMovies.slice(0, 4).map(movie => {
        const posterPath = movie.poster_path ?
            `${posterBaseUrlDropdown}${movie.poster_path}` :
            'https://via.placeholder.com/200x300?text=No+Image';
        return `
            <div class="similar-movie-card">
                <img src="${posterPath}" alt="${movie.title} poster">
                <p>${movie.title}</p>
            </div>
        `;
    }).join('');
    return `
        <h4>Similar Movies</h4>
        <div class="similar-movies-grid">
            ${similarCards}
        </div>
    `;
};
