# Movie Discovery App

#### Date: 2025/09/24  
#### By *Nelson Munyua*  

## Description
A responsive, feature-rich web application for browsing and discovering movies. This project utilizes The Movie Database (TMDB) API to provide users with up-to-date movie information, including popular, top-rated, and upcoming titles. Users can filter by genre, search for specific movies, and view detailed information in an elegant modal pop-up.

## Features

-   **Browse by Category**: View horizontally scrolling lists of **Popular**, **Top Rated**, **Now Playing**, and **Upcoming** movies.
-   **Filter by Genre**: Click on a genre to see a grid of relevant movies.
-   **Live Movie Search**: A search bar provides real-time suggestions in a dropdown as you type.
-   **Detailed Movie Modal**: Click on any movie poster to open a pop-up modal that displays:
    -   High-resolution poster
    -   Title and overview
    -   Release date and rating
    -   An embedded YouTube trailer (if available)
    -   A list of similar movies
-   **Fully Responsive Design**: The layout adapts seamlessly to devices of all sizes, from mobile phones to desktop screens.
-   **Dynamic Content Loading**: All movie data is fetched asynchronously from the TMDB API, ensuring the UI is fast and responsive.

## Tech Stack

-   **Frontend**:
    -   HTML5
    -   CSS3 (with Grid and Flexbox for layout)
    -   Vanilla JavaScript (ES6+ with `async/await`)
-   **API**:
    -   [The Movie Database (TMDB) API](https://www.themoviedb.org/documentation/api)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   A modern web browser (e.g., Chrome, Firefox, Safari).
-   A text editor (e.g., VS Code).

### Installation

1.  **Clone the repository (or download the files):**
    ```sh
    git clone https://github.com/nelsonmunyua/movies-api-app
    ```
2.  **Get an API Key from TMDB:**
    -   Visit [The Movie Database (TMDB)](https://www.themoviedb.org/signup) and create a free account.
    -   Go to your account **Settings > API** and copy your **API Key (v3 auth)**.
3.  **Add your API Key to the project:**
    -   Open the `main.js` file.
    -   Find the `apiKey` constant at the top and paste your key there:
      ```javascript
      const apiKey = "YOUR_TMDB_API_KEY_HERE";
      ```
4.  **Open the application:**
    -   Simply open the `index.html` file in your web browser.

## File Structure

The project is organized into three main files:

-   `index.html`: Contains the HTML structure for the navigation, search bar, movie lists, and the modal container.
-   `styles.css`: Provides all the styling for the application, including the responsive layout, card design, and modal animations.
-   `main.js`: Handles all the application logic, including:
    -   Fetching data from the TMDB API.
    -   Dynamically rendering movie lists and cards.
    -   Managing event listeners for clicks and search input.
    -   Controlling the movie details modal.


GitHub

Support and contact details
For inquiries, reach out via:
github.com/nelsonmunyua

License
The content of this site is licensed under the MIT license.
Copyright (c) 2025.



