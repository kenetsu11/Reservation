const API_KEY = 'bd5b5b1c'; // Your OMDb API key
const API_URL = 'https://www.omdbapi.com/';

// Movie prices in Philippine Pesos
const moviePrices = {
  'Sonic the Hedgehog': 350,
  'Carry-On': 300,
  'Nosferatu': 400,
  'The Wild Robot': 320
};

// Fetch initial time from TimeZoneDB (for Manila time)
const apiKey = "S962X44UTSAA"; // Replace with your actual API key
const apiUrl = `https://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=zone&zone=Asia/Manila`;

fetch(apiUrl)
  .then((response) => response.json())
  .then((data) => {
    if (data.status === "OK") {
      let currentTime = new Date(data.formatted); // Convert API time to Date object

      // Function to update the clock every second
      function updateClock() {
        currentTime.setSeconds(currentTime.getSeconds() + 1); // Increment time
        document.getElementById(
          "timezone"
        ).innerText = `Current Time: ${currentTime.toLocaleTimeString()}`;
      }

      // Start the real-time clock
      setInterval(updateClock, 1000);
    } else {
      console.error("API Error:", data.message);
    }
  })
  .catch((error) => console.error("Error fetching timezone:", error));

// Function to convert 24-hour time to 12-hour time
function convertTo12HourFormat(time24) {
  const [hours, minutes] = time24.split(':');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12; // Converts 0 hours to 12 (for 12 AM)
  return `${hours12}:${minutes} ${suffix}`;
}

// Handle search form submission
document.getElementById('search-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = document.getElementById('movie-input').value.trim();
    if (!query) return;

    const response = await fetch(`${API_URL}?s=${query}&apikey=${API_KEY}`);
    const data = await response.json();

    if (data.Response === "True") {
      displayMovies(data.Search, 'search-carousel');
      document.getElementById('back-to-main').style.display = 'block'; // Show Back to Main button
    } else {
      alert('No movies found!');
    }
});

// Display movies in the search results
function displayMovies(movies, carouselId) {
  const carousel = document.getElementById(carouselId);
  carousel.innerHTML = ''; // Clear previous content

  movies.forEach(movie => {
    const moviePrice = moviePrices[movie.Title] || 300; // Default price if not listed
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');
    movieCard.innerHTML = `
      <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/150x200'}" alt="${movie.Title}">
      <h3>${movie.Title}</h3>
      <p>Price: ₱${moviePrice}</p>
      <button class="book-button" data-title="${movie.Title}" data-price="${moviePrice}">Book Now</button>
    `;

    // Add event listener to the "Book Now" button
    movieCard.querySelector('.book-button').addEventListener('click', (event) => {
      const movieTitle = event.target.getAttribute('data-title');
      const moviePrice = event.target.getAttribute('data-price');
      openBookingForm(movieTitle, moviePrice);
    });

    carousel.appendChild(movieCard);
  });
}

// Open the booking form modal
function openBookingForm(movieTitle, moviePrice) {
  document.getElementById('movie-title').value = movieTitle;
  document.getElementById('modal-movie-title').textContent = `Book Your Movie: ${movieTitle}`;
  document.getElementById('modal-movie-price').textContent = `Price: ₱${moviePrice}`;
  document.getElementById('booking-modal').style.display = 'block';
}

// Close the booking modal
document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('booking-modal').style.display = 'none';
});

// Handle booking form submission
document.getElementById('booking-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const date = document.getElementById('date').value;
  const time24 = document.getElementById('time').value;  // 24-hour time input
  const movieTitle = document.getElementById('movie-title').value;
  const moviePrice = moviePrices[movieTitle] || 300;

  // Convert 24-hour time to 12-hour format
  const time12 = convertTo12HourFormat(time24);

  // Confirmation message
  alert(`Booking confirmed for "${movieTitle}"!
Name: ${name}
Date: ${date}
Time: ${time12}
Price: ₱${moviePrice}`);

  // Display booking details on the page
  displayBooking(movieTitle, name, date, time12, moviePrice);

  // Close the modal
  document.getElementById('booking-modal').style.display = 'none';

  // Clear form inputs
  document.getElementById('booking-form').reset();
});

// Function to display booking details
function displayBooking(movieTitle, name, date, time, price) {
  const bookingList = document.getElementById('booking-list');

  // Create a new booking item
  const bookingItem = document.createElement('div');
  bookingItem.classList.add('booking-item');
  bookingItem.innerHTML = `
    <h3>${movieTitle}</h3>
    <p>Name: ${name}</p>
    <p>Date: ${date}</p>
    <p>Time: ${time}</p>
    <p>Price: ₱${price}</p>
    <button class="delete-button">Delete Booking</button>
  `;

  // Add the booking item to the list
  bookingList.appendChild(bookingItem);

  // Store booking in localStorage
  const bookings = JSON.parse(localStorage.getItem('movieBookings')) || [];
  bookings.push({ movieTitle, name, date, time, price });
  localStorage.setItem('movieBookings', JSON.stringify(bookings));

  // Add event listener for the delete button
  bookingItem.querySelector('.delete-button').addEventListener('click', () => {
    // Remove booking item from the DOM
    bookingList.removeChild(bookingItem);

    // Remove booking from localStorage
    const updatedBookings = bookings.filter(
      (booking) =>
        booking.movieTitle !== movieTitle ||
        booking.name !== name ||
        booking.date !== date ||
        booking.time !== time
    );
    localStorage.setItem('movieBookings', JSON.stringify(updatedBookings));
  });
}

// Load bookings on page load
document.addEventListener('DOMContentLoaded', () => {
  const bookingList = document.getElementById('booking-list');
  const bookings = JSON.parse(localStorage.getItem('movieBookings')) || [];

  bookings.forEach(({ movieTitle, name, date, time, price }) => {
    const bookingItem = document.createElement('div');
    bookingItem.classList.add('booking-item');
    bookingItem.innerHTML = `
      <h3>${movieTitle}</h3>
      <p>Name: ${name}</p>
      <p>Date: ${date}</p>
      <p>Time: ${time}</p>
      <p>Price: ₱${price}</p>
      <button class="delete-button">Delete Booking</button>
    `;

    bookingList.appendChild(bookingItem);

    // Add event listener for the delete button
    bookingItem.querySelector('.delete-button').addEventListener('click', () => {
      bookingList.removeChild(bookingItem);
      const updatedBookings = bookings.filter(
        (booking) =>
          booking.movieTitle !== movieTitle ||
          booking.name !== name ||
          booking.date !== date ||
          booking.time !== time
      );
      localStorage.setItem('movieBookings', JSON.stringify(updatedBookings));
    });
  });
});

// Back to Main Page Button
const backToMainButton = document.getElementById('back-to-main');
backToMainButton.addEventListener('click', () => {
  document.getElementById('search-carousel').innerHTML = ''; // Clear search results
  backToMainButton.style.display = 'none'; // Hide back button
  document.getElementById('movie-input').value = ''; // Clear input
});


