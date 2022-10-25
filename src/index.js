import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

const galleryRef = document.querySelector('.gallery');
const form = document.querySelector('#search-form');

const API_KEY = '30739905-a485bdf08a4bd9d2aabc1774e';
let currentPage = 1;
let photosLoaded = 40;
let totalHits;
let searchValue;

form.addEventListener('submit', onSubmit);

function onSubmit(event) {
  event.preventDefault();
  galleryRef.innerHTML = '';
  currentPage = 1;

  searchValue = event.target[0].value;
  fetchData(searchValue)
    .then(data => foundedImages(data))
    .then(data => makeMarkup(data.data));
}

function fetchData(searchValue) {
  return axios.get(
    `https://pixabay.com/api/?key=${API_KEY}&q=${searchValue}&image_type=photo&safesearch=true&orientation=true&page=${currentPage}&per_page=40`
  );
}

function makeMarkup(array) {
  const markup = array.hits
    .map(
      ({
        largeImageURL,
        webformatURL,
        likes,
        downloads,
        comments,
        views,
        tags,
      }) => {
        return `<a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy"/>
                <div class="info"><p class="info-item"><b>Likes</b>${likes}</p><p class="info-item">
                <b>Views</b>${views}</p><p class="info-item"><b>Comments</b>${comments}</p>
                <p class="info-item"><b>Downloads </b>${downloads}</p></div></a>`;
      }
    )
    .join('');
  galleryRef.insertAdjacentHTML('beforeend', markup);

  // Show SimpleLightbox gallery
  const gallery = new SimpleLightbox('.gallery a');
  gallery.on('show.simplelightbox');
  gallery.on('error.simplelightbox');
}
// Infinite scroll
window.addEventListener('scroll', scrollListener);

function scrollListener() {
  if (
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight
  ) {
    if (photosLoaded >= totalHits) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      window.removeEventListener('scroll', scrollListener);
    }

    currentPage += 1;
    photosLoaded += 40;
    fetchData(searchValue)
      .then(data => makeMarkup(data.data))
      .then(smoothScroll);
  }
}

function foundedImages(array) {
  totalHits = array.data.totalHits;
  if (totalHits === 0) {
    Notiflix.Notify.failure(
      '"Sorry, there are no images matching your search query. Please try again."'
    );
  } else {
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  }

  return array;
}

function smoothScroll() {
  const { height: cardHeight } =
    galleryRef.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
