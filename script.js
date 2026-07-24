// ===================================
// Initialize EmailJS after library loads
// ===================================

document.addEventListener('DOMContentLoaded', function() {
  // Initialize EmailJS with your public key
  // IMPORTANT: Replace "YOUR_PUBLIC_KEY" with your actual EmailJS public key
  if (typeof emailjs !== 'undefined') {
    emailjs.init('YOUR_PUBLIC_KEY');
  }

  // Set footer year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Initialize app
  setupLanguageButtons();
  setupPriceCalculator();
  setupBookingForm();
});

// ===================================
// Language Selection
// ===================================

const translations = {
  ru: {
    title: 'Автосервис и шиномонтаж в Таллине',
    subtitle: 'Профессиональный ремонт автомобилей и шиномонтаж'
  },
  et: {
    title: 'Autoremondi ja rehvivahetuse teenus Tallinnas',
    subtitle: 'Professionaalne autoremont ja rehvivahetus'
  }
};

function setupLanguageButtons() {
  const langButtons = document.querySelectorAll('.lang-btn');
  const savedLang = localStorage.getItem('lang') || 'ru';

  // Set active button on load
  updateActiveLanguageButton(savedLang);
  setLanguage(savedLang);

  // Add click handlers
  langButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const lang = this.getAttribute('data-lang');
      setLanguage(lang);
      updateActiveLanguageButton(lang);
      localStorage.setItem('lang', lang);
    });
  });
}

function updateActiveLanguageButton(lang) {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
}

function setLanguage(lang) {
  const titleEl = document.getElementById('title');
  const subtitleEl = document.getElementById('subtitle');

  if (translations[lang]) {
    titleEl.textContent = translations[lang].title;
    subtitleEl.textContent = translations[lang].subtitle;
  }
}

// ===================================
// Price Calculator
// ===================================

// Cache DOM elements to avoid repeated lookups
const rimSelect = document.getElementById('rim');
const vehicleSelect = document.getElementById('vehicle');
const priceField = document.getElementById('price');

function setupPriceCalculator() {
  calculatePrice();
  rimSelect.addEventListener('change', calculatePrice);
  vehicleSelect.addEventListener('change', calculatePrice);
}

function calculatePrice() {
  const rim = parseInt(rimSelect.value, 10);
  const vehicleExtra = parseInt(vehicleSelect.value, 10);

  let price = 40;

  if (rim > 16) {
    price += (rim - 16) * 5;
  }

  price += vehicleExtra;

  // Use textContent instead of innerText for better performance
  priceField.textContent = price + '€';
}

// ===================================
// Booking Form Handler
// ===================================

// Cache form elements for better performance
const bookingForm = document.getElementById('bookingForm');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');
const dateInput = document.getElementById('date');
const timeSelect = document.getElementById('time');
const rimSelectForm = document.getElementById('rim');
const vehicleSelectForm = document.getElementById('vehicle');
const submitBtn = document.getElementById('submitBtn');

function setupBookingForm() {
  bookingForm.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(e) {
  e.preventDefault();

  // Validate form (basic client-side validation)
  if (!phoneInput.value.trim() || !emailInput.value.trim() || !dateInput.value) {
    alert('Пожалуйста, заполните обязательные поля: телефон, email и дату.');
    return;
  }

  // Disable submit button to prevent double-submission
  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Отправка...';

  try {
    // Prepare data for admin
    const vehicleOption = vehicleSelectForm.options[vehicleSelectForm.selectedIndex];
    const vehicleText = vehicleOption.text;

    const adminParams = {
      client_name: nameInput.value.trim() || 'Не указано',
      client_phone: phoneInput.value.trim(),
      client_email: emailInput.value.trim(),
      booking_date: dateInput.value,
      booking_time: timeSelect.value,
      wheel_size: rimSelectForm.value,
      vehicle_type: vehicleText,
      price: priceField.textContent
    };

    const clientParams = {
      email: emailInput.value.trim(),
      name: nameInput.value.trim() || 'Клиент',
      date: dateInput.value,
      time: timeSelect.value
    };

    // Send emails in parallel (if order doesn't matter)
    // Or use Promise.all() if you want both to send simultaneously
    await Promise.all([
      emailjs.send(
        'YOUR_SERVICE_ID',      // Replace with your EmailJS Service ID
        'YOUR_ADMIN_TEMPLATE',  // Replace with your admin template ID
        adminParams
      ),
      emailjs.send(
        'YOUR_SERVICE_ID',      // Replace with your EmailJS Service ID
        'YOUR_CLIENT_TEMPLATE', // Replace with your client template ID
        clientParams
      )
    ]);

    // Success feedback
    alert('✓ Бронирование успешно отправлено! Мы свяжемся с вами в ближайшее время.');
    bookingForm.reset();
    calculatePrice();

  } catch (error) {
    console.error('Form submission error:', error);
    alert('✗ Ошибка отправки. Пожалуйста, попробуйте позже или позвоните нам напрямую.');
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}
