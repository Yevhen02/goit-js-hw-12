import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const API_BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '42034785-c436f003c310c5b5229f24b7b';

axios.defaults.baseURL = API_BASE_URL;

let limit;

const searchParams = {
  key: API_KEY,
  q: '',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
  per_page: 20,
  page: 1,
};

const simpleGallery = new SimpleLightbox('.gallery a', {
  overlayOpacity: 0.7,
  captionsData: 'alt',
  captionDelay: 500,
  captionPosition: 'center',
});

const formElem = document.querySelector('.gallery-form');
const searchInputElem = document.querySelector('.search-input');
const galleryElem = document.querySelector('.gallery');
const loaderElem = document.querySelector('.loader');
const loadMoreBtnElem = document.querySelector('.load-more-btn');

async function startSearch(event) {
  event.preventDefault();
  if (!searchInputElem.value.trim()) {
    showErrorMessage('Please fill in the search field');
    return;
  }
  try {
    galleryElem.innerHTML = '';
    isContentVisible(loaderElem, true);
    isContentVisible(loadMoreBtnElem, false);
    searchParams.q = searchInputElem.value.trim();
    searchParams.page = 1;
    const data = await fetchPhotos();
    limit = data.totalHits;
    createGallery(data);
  } catch (error) {
    console.log(error);
  }
}

async function loadMore() {
  try {
    isContentVisible(loaderElem, true);
    isContentVisible(loadMoreBtnElem, false);
    const photos = await fetchPhotos();
    createGallery(photos);
  } catch (error) {
    console.log(error);
  }
}

async function fetchPhotos() {
  const response = await axios.get('', { params: searchParams });
  return response.data;
}

function createGallery(photos) {
  if (!photos.total) {
    showErrorMessage(
      'Sorry, there are no images matching your search query. Please, try again!'
    );
    isContentVisible(loaderElem, false);
    return;
  }
  const markup = photos.hits
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<li class="gallery-item">
          <a href="${largeImageURL}">
            <img class="api-img" src="${webformatURL}" alt="${tags}">
            <div class="img-desc">
            <p class="para">Likes: <span class="span"> <br/>${likes}</span></p>
            <p class="para">Views: <span class="span"> <br/>${views}</span></p>
            <p class="para">Comments: <span class="span"> <br/>${comments}</span></p>
            <p class="para">Downloads: <span class="span"> <br/>${downloads}</span></p>
            </div>
          </a>
        </li>`;
      }
    )
    .join('');

  galleryElem.insertAdjacentHTML('beforeend', markup);
  isContentVisible(loaderElem, false);
  checkLimit();
  scrollPage();
  simpleGallery.refresh();
  formElem.reset();
}

function checkLimit() {
  if (Math.ceil(limit / searchParams.per_page) === searchParams.page) {
    showErrorMessage(
      "We're sorry, but you've reached the end of search results."
    );
  } else {
    searchParams.page += 1;
    isContentVisible(loadMoreBtnElem, true);
  }
}

function isContentVisible(content, isVisible) {
  if (isVisible) {
    content.classList.remove('hidden');
  } else {
    content.classList.add('hidden');
  }
}

function scrollPage() {
  if (searchParams.page > 1) {
    const rect = document
      .querySelector('.gallery-item')
      .getBoundingClientRect();
    window.scrollBy({ top: rect.height * 2, left: 0, behavior: 'smooth' });
  }
}

function showErrorMessage(message) {
  iziToast.show({
    position: 'bottomCenter',
    title: 'X',
    titleColor: '#FFF5E0',
    titleSize: '20px',
    message,
    backgroundColor: '#FF6969',
    messageColor: '#FFF5E0',
    messageSize: '14px',
    close: false,
    closeOnClick: true,
    closeOnEscape: true,
  });
}

formElem.addEventListener('submit', event => startSearch(event));

loadMoreBtnElem.addEventListener('click', () => loadMore());
