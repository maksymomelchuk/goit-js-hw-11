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
// Listeners
form.addEventListener('submit', onSubmit);
window.addEventListener('scroll', scrollListener);
// onSubmit function
async function onSubmit(event) {
  try {
    event.preventDefault();
    galleryRef.innerHTML = '';
    currentPage = 1;
    searchValue = event.target[0].value;
    const fetchedData = await fetchData(searchValue);
    const images = await foundedImages(fetchedData);
    makeMarkup(images);
    simpleGallery();
  } catch (error) {
    console.log(error);
  }
}
// onScroll function
async function scrollListener() {
  try {
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
      const fetchedData = await fetchData(searchValue);
      makeMarkup(fetchedData);
      simpleGallery();
      smoothScroll();
    }
  } catch (error) {
    console.log(error);
  }
}
// Fetch data function
function fetchData(searchValue) {
  return axios.get(
    `https://pixabay.com/api/?key=${API_KEY}&q=${searchValue}&image_type=photo&safesearch=true&orientation=true&page=${currentPage}&per_page=40`
  );
}
// Create markup function
function makeMarkup(array) {
  const markup = array.data.hits
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
}
// Function to notify about quantity of loaded images
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
// Smooth scroll
function smoothScroll() {
  const { height: cardHeight } =
    galleryRef.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
// Show SimpleLightbox gallery
function simpleGallery() {
  const gallery = new SimpleLightbox('.gallery a');
  gallery.on('show.simplelightbox');
  gallery.on('error.simplelightbox');
}
