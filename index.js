const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 16
const movies = []
let filteredMovies = []
let currentMode = "card-mode";
let currentPage = 1;
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const changeMode = document.querySelector('#change-mode')
const paginator = document.querySelector('#paginator')
const btnFavoriteMovie = document.querySelector(`.btn btn-info`)


function renderMovieListMode(data) {
  let rawHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>Image</th>
          <th>Title</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
    <tbody>`
  data.forEach((item) => {
    console.log(item)
    rawHTML += `
    <tr>
      <td>
        <img src="${POSTER_URL}${item.image}"
          width="70" class="img-thumbnail" />
      </td>
      <td>${item.title}</td>
      <td></td>
      <td>
        <a href="#" class="btn btn-primary align-bottom" id="btn-show-movie" data-id="${item.id}"
          data-bs-toggle="modal" data-bs-target="#movie-info">More</a>
        <a href="#" class="btn btn-info" id="btn-favorite-movie" data-id="${item.id}">+</a>
      </td>
    </tr>
  `
  })
  rawHTML += `
      </tbody>
    </table>
  </div>
  `
  dataPanel.innerHTML = rawHTML
}

function renderMovieCardMode(data) {
  let rawHTML = ``
  data.forEach((item) => {
    // console.log(item)
    rawHTML += `
      <div class="card m-2" style="width: 14rem;">
        <img src="${POSTER_URL + item.image}" class="card-img-center" alt="error">
        <div class="card-body text-center">
          <h5 class="card-title">${item.title}</h5>
          <a href="#" class="btn btn-primary align-bottom" id="btn-show-movie" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#movie-info">More</a>
          <a href="#" class="btn btn-info" id="btn-favorite-movie" data-id="${item.id}">+</a>
        </div>
      </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const movieModalTitle = document.querySelector('#movie-modal-title')
  const movieModalImage = document.querySelector('#movie-modal-image')
  const movieModalDate = document.querySelector('#movie-modal-date')
  const movieModalDescription = document.querySelector('#movie-modal-description')

  axios
    .get(INDEX_URL + id)
    .then(response => {
      const data = response.data.results
      movieModalTitle.innerText = data.title
      movieModalDate.innerText = data.release_date
      movieModalDescription.innerText = data.description
      movieModalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="" class="img-fluid">`
    })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)

  if (list.some(movie => movie.id === id)) {
    return alert('already in your favorite!')
  }

  list.push(movie)
  console.log(list)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

changeMode.addEventListener('click', function(event) {
  if (event.target.matches('#card-mode-btn')) {
    currentMode = "card-mode"
    renderMovieCardMode(getMoviesByPage(currentPage))
  } else if (event.target.matches('#list-mode-btn')) {
    currentMode = "list-mode"
    renderMovieListMode(getMoviesByPage(currentPage))
  }
})

dataPanel.addEventListener('click', function(event) {
  if (event.target.matches('#btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('#btn-favorite-movie')) {
    event.target.innerText = '✓'
    addToFavorite(Number(event.target.dataset.id))
  }
})

searchForm.addEventListener('submit', function(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  for (const movie of movies) {
    if (movie.title.toLowerCase().includes(keyword)) {
      filteredMovies.push(movie)
    }
  }
  if (!keyword.length) {
    return alert("Please enter a valid string!");
  }
  if (filteredMovies.length === 0) {
    return alert(`cannot find any movie matches「${keyword}」!`)
  }
  if (currentMode === "card-mode") {
    renderMovieCardMode(getMoviesByPage(currentPage))
  } else if (currentMode === "list-mode") {
    renderMovieListMode(getMoviesByPage(currentPage))
  }
  renderPaginator(filteredMovies.length)
})

paginator.addEventListener('click', function(event) {
  if (event.target.tagName !== 'A') return
  currentPage = Number(event.target.dataset.page)
  if (currentMode === "card-mode") {
    renderMovieCardMode(getMoviesByPage(currentPage))
  } else if (currentMode === "list-mode") {
    renderMovieListMode(getMoviesByPage(currentPage))
  }
})

axios
  .get(INDEX_URL)
  .then(response => {
    for (const movie of response.data.results) {
      movies.push(movie)
    }
    renderPaginator(movies.length)
    renderMovieCardMode(getMoviesByPage(1))
  })