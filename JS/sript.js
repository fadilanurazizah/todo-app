// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Get user name and display welcome message
    displayWelcomeMessage();
    
    // Initialize form validation
    initializeForm();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Initialize navbar scroll effect
    initializeNavbarEffect();
});

// Function to display personalized welcome message
function displayWelcomeMessage() {
    const welcomeElement = document.getElementById('welcome');
    let userName = localStorage.getItem('userName');
    
    // If no name is stored, prompt user for name
    if (!userName) {
        userName = prompt('Silakan masukkan nama Anda:');
        if (userName && userName.trim() !== '') {
            localStorage.setItem('userName', userName.trim());
        } else {
            userName = 'Guest';
        }
    }
    
    // Display welcome message with typing effect
    const welcomeText = `Hi ${userName}, Welcome To Website`;
    typeWriter(welcomeElement, welcomeText);
}

// Typing effect function
function typeWriter(element, text) {
    element.innerHTML = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, 80);
        }
    }
    
    setTimeout(type, 1000);
}

// Initialize form validation and submission
function initializeForm() {
    const form = document.getElementById('contactForm');
    
    // Form submission event
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all fields
        if (validateForm()) {
            // Display submitted data
            displaySubmittedData();
        }
    });
    
    // Real-time validation for each field
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const messageInput = document.getElementById('message');
    
    nameInput.addEventListener('blur', () => validateName());
    emailInput.addEventListener('blur', () => validateEmail());
    phoneInput.addEventListener('blur', () => validatePhone());
    messageInput.addEventListener('blur', () => validateMessage());
    
    // Only allow numbers in phone input
    phoneInput.addEventListener('input', function(e) {
        // Remove any non-digit characters
        this.value = this.value.replace(/[^0-9]/g, '');
    });
}

// Validate entire form
function validateForm() {
    const nameValid = validateName();
    const emailValid = validateEmail();
    const phoneValid = validatePhone();
    const messageValid = validateMessage();
    
    return nameValid && emailValid && phoneValid && messageValid;
}

// Validate name field
function validateName() {
    const nameInput = document.getElementById('name');
    const nameError = document.getElementById('nameError');
    const name = nameInput.value.trim();
    
    if (name === '') {
        showError(nameInput, nameError, 'Nama tidak boleh kosong');
        return false;
    } else if (name.length < 2) {
        showError(nameInput, nameError, 'Nama minimal 2 karakter');
        return false;
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
        showError(nameInput, nameError, 'Nama hanya boleh berisi huruf');
        return false;
    } else {
        clearError(nameInput, nameError);
        return true;
    }
}

// Validate email field
function validateEmail() {
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    const email = emailInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email === '') {
        showError(emailInput, emailError, 'Email tidak boleh kosong');
        return false;
    } else if (!emailPattern.test(email)) {
        showError(emailInput, emailError, 'Format email tidak valid');
        return false;
    } else {
        clearError(emailInput, emailError);
        return true;
    }
}

// Validate phone field
function validatePhone() {
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');
    const phone = phoneInput.value.trim();
    
    if (phone === '') {
        showError(phoneInput, phoneError, 'Nomor telepon tidak boleh kosong');
        return false;
    } else if (!/^[0-9]+$/.test(phone)) {
        showError(phoneInput, phoneError, 'Nomor telepon hanya boleh berisi angka');
        return false;
    } else if (phone.length < 10 || phone.length > 15) {
        showError(phoneInput, phoneError, 'Nomor telepon harus 10-15 digit');
        return false;
    } else {
        clearError(phoneInput, phoneError);
        return true;
    }
}

// Validate message field
function validateMessage() {
    const messageInput = document.getElementById('message');
    const messageError = document.getElementById('messageError');
    const message = messageInput.value.trim();
    
    if (message === '') {
        showError(messageInput, messageError, 'Pesan tidak boleh kosong');
        return false;
    } else if (message.length < 10) {
        showError(messageInput, messageError, 'Pesan minimal 10 karakter');
        return false;
    } else {
        clearError(messageInput, messageError);
        return true;
    }
}

// Show error message
function showError(input, errorElement, message) {
    input.classList.add('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Clear error message
function clearError(input, errorElement) {
    input.classList.remove('error');
    errorElement.textContent = '';
    errorElement.style.display = 'none';
}

// Display submitted data
function displaySubmittedData() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;
    const resultDiv = document.getElementById('result');
    
    // Create success message with submitted data
    resultDiv.innerHTML = `
        <div class="success">
            <h4>✅ Pesan berhasil dikirim!</h4>
            <p>Terima kasih ${name}, pesan Anda telah kami terima.</p>
        </div>
        <div class="submitted-data">
            <h4>📋 Data yang Dikirim:</h4>
            <p><strong>Nama:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Nomor Telepon:</strong> ${phone}</p>
            <p><strong>Pesan:</strong> ${message}</p>
        </div>
    `;
    
    // Clear form
    document.getElementById('contactForm').reset();
    
    // Auto hide result after 8 seconds
    setTimeout(() => {
        resultDiv.innerHTML = '';
    }, 8000);
}

// Initialize smooth scrolling for navigation links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize navbar scroll effect
function initializeNavbarEffect() {
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('nav');
        if (window.scrollY > 50) {
            nav.style.background = 'linear-gradient(135deg, rgba(30, 60, 114, 0.98) 0%, rgba(42, 82, 152, 0.98) 100%)';
            nav.style.backdropFilter = 'blur(15px)';
            nav.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.15)';
        } else {
            nav.style.background = 'linear-gradient(135deg, rgba(30, 60, 114, 0.95) 0%, rgba(42, 82, 152, 0.95) 100%)';
            nav.style.backdropFilter = 'blur(10px)';
            nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        }
    });
}