import { useState, useEffect } from 'react';
import './App.css';

const TMDB_API_KEY = process.env.REACT_APP_API_KEY; // add your own TMDB API Key in a .env file
const DEFAULT_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const EMPTY_POSTER = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750"><rect width="500" height="750" fill="%23d6d6d6"/></svg>';


// Header Component
function SearchSort({ currentSearch, currentSort, newSearch, newSort }) {
  return (
    <div className="sortControls">
      <input type="text" id="searchInput" placeholder="Search for a movie..." value={currentSearch} onChange={(event) => newSearch(event.target.value)} />
      <select id="sortSelect" value={currentSort || 'Sortings'} onChange={(event) => newSort(event.target.value)} >
        <option value="Sortings">Sort By</option>
        <option value="release_date.asc">Release Date (Asc)</option>
        <option value="release_date.desc">Release Date (Desc)</option>
        <option value="vote_average.asc">Rating (Asc)</option>
        <option value="vote_average.desc">Rating (Desc)</option>
      </select>
    </div>
  );
}

//Main Component - Done
function DisplayMovies({ movie }) {
  return (
    <div className="movie-poster">
      <img src={movie.poster_path ? IMAGE_URL + movie.poster_path : EMPTY_POSTER} alt={movie.title} />
      <h3>{movie.title}</h3>
      <p>Release Date: {movie.release_date || 'N/A'}</p>
      <p>Rating: {movie.vote_average}</p>
    </div>
  );
}

//Footer Component
function Pagination({ currentPage, totalPages, prevButton, nextButton }) {
  return (
    <div className="pagination">
      <button id="prevButton" onClick={prevButton} disabled={currentPage === 1}> Previous </button>
      <span id="pageNumber">Page {currentPage} of {totalPages}</span>
      <button id="nextButton" onClick={nextButton} disabled={currentPage === totalPages}> Next </button>
    </div>
  );
}

export default function App() {
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentSearch, setCurrentSearch] = useState('');
  const [currentSort, setCurrentSort] = useState('');

  useEffect(() => {

    // Fetch the movies
    async function fetchMovies() {
      let url = "";

      if (currentSearch) {
        // Search endpoint
        url = `${DEFAULT_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${currentSearch}&page=${currentPage}`;
      } else {
        // Sort endpoints
        const activeSort = currentSort || "popularity.desc";
        url = `${DEFAULT_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=${activeSort}&page=${currentPage}`;

        // Filtering results
        if (activeSort.startsWith("vote_average")) {
          url += "&vote_count.gte=10";
        }
        if (activeSort.startsWith("release_date")) {
          url += "&vote_count.gte=10";
        }
      }

      const response = await fetch(url);
      const data = await response.json();

      if (currentPage === 1) {
        setTotalPages(data.total_pages || 1);
      }
      setMovies(data.results || []);
    }

    fetchMovies();
  }, [currentPage, currentSearch, currentSort]);


  const handleSearch = (value) => {
    setCurrentSearch(value);
    setCurrentPage(1);
  };

  const handleSort = (value) => {
    setCurrentSort(value === 'Sortings' ? '' : value);
    setCurrentPage(1);
  };


  return (
    <>
      <header>
        <h1>Movie Explorer</h1>
        <SearchSort
          currentSearch={currentSearch}
          currentSort={currentSort}
          newSearch={handleSearch}
          newSort={handleSort}
        />
      </header>

      <main>
        <div id="moviesContainer" className="movies-grid">
          {movies.map((movie) => (
            <DisplayMovies key={movie.id} movie={movie} />
          ))}
        </div>
      </main>

      <footer>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          prevButton={() => setCurrentPage((page) => Math.max(1, page - 1))}
          nextButton={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
        />
      </footer>
 
    </>
  );
}