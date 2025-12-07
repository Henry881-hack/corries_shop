// Simple Database System using localStorage
// Initialize database with default admin user if it doesn't exist

/**
 * Initializes the database with a default admin user if it doesn't exist in localStorage.
 */
function initializeDatabase() {
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {
                id: 1,
                username: 'lancas',
                fullName: 'lancaster henry',
                email: 'lancasterhenry881@gmail.com',
                mobilePhone: '+13464697174',
                password: 'Discovery754@',
                createdAt: new Date().toISOString(),
                isAdmin: true
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        localStorage.setItem('nextUserId', '2');
    }
}

/**
 * Retrieves all users from the database stored in localStorage.
 * @returns {Array<Object>} An array of user objects.
 */
function getAllUsers() {
    const usersJson = localStorage.getItem('users');
    return usersJson ? JSON.parse(usersJson) : [];
}

/**
 * Saves the provided array of users to localStorage.
 * @param {Array<Object>} users - The array of user objects to save.
 */
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

/**
 * Adds a new user to the database.
 * Performs validation checks for existing email/full name/username.
 * @param {Object} userData - The data for the new user.
 * @param {string} userData.fullName - The full name of the user.
 * @param {string} userData.email - The email of the user.
 * @param {string} userData.mobilePhone - The mobile phone number of the user.
 * @param {string} userData.password - The password of the user.
 * @returns {Object} An object indicating success or failure, and the new user if successful.
 */
function addUser(userData) {
    const users = getAllUsers();
    const nextId = parseInt(localStorage.getItem('nextUserId') || '1');
    
    // Generate username from full name (or use provided username if available)
    let generatedUsername = userData.username ? userData.username.toLowerCase().replace(/\s+/g, '') : userData.fullName.toLowerCase().replace(/\s+/g, '');
    
    // Check if email already exists
    const emailExists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (emailExists) {
        return { success: false, message: 'Email already registered. Please use a different email or login.' };
    }
    
    // Check if full name already exists (to prevent duplicate accounts - optional, but good for uniqueness)
    const fullNameExists = users.some(u => u.fullName.toLowerCase() === userData.fullName.toLowerCase());
    if (fullNameExists) {
        return { success: false, message: 'An account with this name already exists. Please login instead.' };
    }
    
    // Check if generated username already exists
    const usernameExists = users.some(u => u.username === generatedUsername);
    if (usernameExists) {
        // Append a number to make it unique
        let counter = 1;
        while (users.some(u => u.username === generatedUsername + counter)) {
            counter++;
        }
        generatedUsername = generatedUsername + counter;
    }
    
    const newUser = {
        id: nextId,
        username: generatedUsername,
        fullName: userData.fullName,
        email: userData.email,
        mobilePhone: userData.mobilePhone,
        password: userData.password, // IMPORTANT: In production, this should always be hashed (e.g., using bcrypt).
        createdAt: new Date().toISOString(),
        isAdmin: false
    };
    
    users.push(newUser);
    saveUsers(users);
    localStorage.setItem('nextUserId', String(nextId + 1));
    
    return { success: true, user: newUser };
}

/**
 * Finds a user by username, email, or full name (case-insensitive).
 * @param {string} identifier - The username, email, or full name to search for.
 * @returns {Object|undefined} The user object if found, otherwise undefined.
 */
function findUser(identifier) {
    const users = getAllUsers();
    const lowerIdentifier = identifier.toLowerCase();
    return users.find(u => 
        u.username.toLowerCase() === lowerIdentifier || 
        u.fullName.toLowerCase() === lowerIdentifier || 
        u.email.toLowerCase() === lowerIdentifier
    );
}

/**
 * Validates user login credentials.
 * @param {string} username - The username or email provided by the user.
 * @param {string} password - The password provided by the user.
 * @returns {Object} An object indicating success or failure, and the user if successful.
 */
function validateLogin(username, password) {
    const user = findUser(username);
    if (user && user.password === password) { // IMPORTANT: In production, compare hashed passwords.
        return { success: true, user: user };
    }
    return { success: false, message: 'Invalid username or password.' };
}

/**
 * Retrieves the currently logged-in user from localStorage.
 * @returns {Object|null} The current user object if logged in, otherwise null.
 */
function getCurrentUser() {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) return null;
    
    const users = getAllUsers();
    return users.find(u => u.id === parseInt(userId));
}

/**
 * Sets or clears the currently logged-in user in localStorage.
 * @param {Object|null} user - The user object to set as current, or null to log out.
 */
function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('currentUserId', user.id.toString());
        localStorage.setItem('currentUsername', user.username);
    } else {
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('currentUsername');
    }
}

/**
 * Logs out the current user and redirects to the login page.
 * Requires user confirmation.
 */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        setLoggedIn(false);
        setCurrentUser(null);
        // window.cart = {}; // Optional: Clear cart on logout
        // saveCart();
        window.location.href = 'index.html';
    }
}

// Make logout accessible globally
window.logout = logout;

/**
 * Retrieves and logs all registered users (for admin/debugging purposes).
 * IMPORTANT: This function exposes user data and should be removed or protected in a production environment.
 * Can be called from browser console: `getAllRegisteredUsers()`
 * @returns {Array<Object>} An array of all registered user objects.
 */
function getAllRegisteredUsers() {
    const users = getAllUsers();
    console.table(users.map(u => ({
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        email: u.email,
        mobilePhone: u.mobilePhone,
        createdAt: u.createdAt,
        isAdmin: u.isAdmin
    })));
    return users;
}

// Initialize database on script load
initializeDatabase();

// Login state management
/**
 * Checks if a user is currently logged in.
 * @returns {boolean} True if a user is logged in, false otherwise.
 */
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true' && localStorage.getItem('currentUserId') !== null;
}

/**
 * Sets the login state of the user in localStorage.
 * @param {boolean} value - True to log in, false to log out.
 * @param {Object|null} user - The user object if logging in, otherwise null.
 */
function setLoggedIn(value, user = null) {
    localStorage.setItem('isLoggedIn', value ? 'true' : 'false');
    if (value && user) {
        setCurrentUser(user);
    } else if (!value) {
        setCurrentUser(null);
    }
}

// Cart initialization - runs immediately when script loads
window.cart = JSON.parse(localStorage.getItem('cart')) || {};

// Cart functions - available globally
/**
 * Saves the current state of the cart to localStorage.
 */
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(window.cart));
}

/**
 * Updates the displayed count of items in the cart.
 */
function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        const totalItems = Object.values(window.cart).reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

/**
 * Adds a product to the shopping cart.
 * @param {string} productId - The ID of the product to add.
 */
function addToCart(productId) {
    console.log('addToCart called with productId:', productId);
    
    if (!isLoggedIn()) {
        alert('Please login or signup to add items to cart.');
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = 'index.html';
        return;
    }
    
    if (typeof products === 'undefined') {
        console.error('Products array not loaded. Make sure products.js is loaded before script.js');
        alert('Error: Products data not loaded. Please refresh the page.');
        return;
    }
    
    console.log('Products array available, searching for product:', productId);
    const product = products.find(p => p.id === productId);
    if (product) {
        if (window.cart[productId]) {
            window.cart[productId].quantity++;
        } else {
            window.cart[productId] = { ...product, quantity: 1 };
        }
        saveCart();
        updateCartCount();
        alert(`${product.name} added to cart!`);
    } else {
        console.error('Product not found:', productId);
        console.log('Available products:', products.map(p => p.id));
        alert(`Product not found: ${productId}`);
    }
}

/**
 * Removes a product from the shopping cart.
 * @param {string} productId - The ID of the product to remove.
 */
function removeFromCart(productId) {
    if (window.cart[productId]) {
        delete window.cart[productId];
        saveCart();
        updateCartCount();
        if (typeof renderCartItems === 'function') {
            renderCartItems();
        }
    }
}

/**
 * Updates the quantity of a product in the shopping cart.
 * If newQuantity is 0 or less, the product is removed.
 * @param {string} productId - The ID of the product to update.
 * @param {number} newQuantity - The new quantity for the product.
 */
function updateQuantity(productId, newQuantity) {
    if (window.cart[productId] && newQuantity > 0) {
        window.cart[productId].quantity = newQuantity;
        saveCart();
        updateCartCount();
        if (typeof renderCartItems === 'function') {
            renderCartItems();
        }
    } else if (newQuantity <= 0) {
        removeFromCart(productId);
    }
}

/**
 * Clears all items from the shopping cart after user confirmation.
 */
function clearCart() {
    if (Object.keys(window.cart).length === 0) {
        alert('Your cart is already empty.');
        return;
    }
    
    if (confirm('Are you sure you want to remove all items from your cart?')) {
        window.cart = {};
        saveCart();
        updateCartCount();
        if (typeof renderCartItems === 'function') {
            renderCartItems();
        }
        alert('All items have been removed from your cart.');
    }
}

/**
 * Simulates a payment API call to a backend.
 * In a real application, this would be an AJAX request to your server.
 * @param {object} paymentDetails - Object containing payment information (e.g., cardNumber, expiryDate, cvc, cardName).
 * @returns {Promise<object>} A promise that resolves with a success message or rejects with an error message.
 */
function simulatePayment(paymentDetails) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate server-side validation and processing
            if (paymentDetails.cardNumber && paymentDetails.expiryDate && paymentDetails.cvc && paymentDetails.cardName) {
                // Basic validation for demonstration. In real app, this would be more complex and secure.
                if (paymentDetails.cardNumber.length < 16 || paymentDetails.expiryDate.length < 5 || paymentDetails.cvc.length < 3) {
                    reject({ success: false, message: 'Invalid card details provided.' });
                } else {
                    resolve({ success: true, message: 'Payment processed successfully!' });
                }
            } else {
                reject({ success: false, message: 'Please fill in all card details.' });
            }
        }, 1500); // Simulate network delay
    });
}

// Event delegation for "Add to Cart" buttons - set up immediately, works with all buttons
document.addEventListener('click', function(event) {
    const button = event.target.closest('.add-to-cart-button');
    if (button) {
        event.preventDefault();
        event.stopPropagation();
        const productId = button.dataset.productId || button.getAttribute('data-product-id');
        console.log('Add to Cart button clicked, productId:', productId);
        if (productId) {
            addToCart(productId);
        } else {
            console.error('Product ID not found on button:', button);
            alert('Error: Product ID not found.');
        }
    }
});

// Protect pages - check login status on page load
// Protect index.html, cart.html, and checkout.html
(function() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'home.html';
    const currentHref = window.location.href;
    
    // Check if we're on a protected page
    const protectedPages = ['home.html', 'cart.html', 'checkout.html'];
    const isProtectedPage = protectedPages.some(page => 
        currentPage === page || 
        currentHref.includes(page) ||
        currentPath.includes(page)
    );
    
    if (isProtectedPage && !isLoggedIn()) {
        // Store the full path for redirect after login
        sessionStorage.setItem('redirectAfterLogin', currentHref);
        alert('Please login or signup to access this page.');
        window.location.href = 'index.html';
    }
})();

function myFuction() {
    var x = document.getElementById("password");
    if (x && x.type === "password") {
        x.type = "text";
    } else if (x) {
        x.type = "password";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            // Get form values
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const mobilePhone = document.getElementById('mobilePhone').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Validation
            if (!fullName || !email || !mobilePhone || !password) {
                alert('Please fill in all fields.');
                return;
            }

            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            if (password.length < 4) {
                alert("Password must be at least 4 characters long.");
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("Please enter a valid email address.");
                return;
            }

            // Add user to database
            const result = addUser({
                fullName: fullName,
                email: email,
                mobilePhone: mobilePhone,
                password: password
            });

            if (!result.success) {
                alert(result.message);
                return;
            }

            // Display confirmation message
            alert("You're subscribed to Corrie Sells alerts! Get order updates & exclusive offers. Msg&data rates may apply. Reply HELP for help, STOP to opt out.");

            // Set user as logged in after successful signup
            setLoggedIn(true, result.user);

            // Log signup data (for debugging)
            console.log('New user registered:', {
                id: result.user.id,
                username: result.user.username,
                fullName: result.user.fullName,
                email: result.user.email,
                createdAt: result.user.createdAt
            });

            // Redirect to homepage or the page they were trying to access
            const redirectPath = sessionStorage.getItem('redirectAfterLogin');
            sessionStorage.removeItem('redirectAfterLogin');
            
            if (redirectPath) {
                // Extract just the filename if it's a full URL
                const redirectPage = redirectPath.includes('home.html') ? 'index.html' :
                                    redirectPath.includes('cart.html') ? 'cart.html' :
                                    redirectPath.includes('checkout.html') ? 'checkout.html' :
                                    redirectPath;
                window.location.href = redirectPage;
            } else {
                window.location.href = 'home.html';
            }
        });
    }

    const carouselImages = document.querySelectorAll('.carousel-image');
    let currentIndex = 0;

    function showImage(index) {
        carouselImages.forEach((img, i) => {
            if (i === index) {
                img.classList.add('active');
            } else {
                img.classList.remove('active');
            }
        });
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % carouselImages.length;
        showImage(currentIndex);
    }

    // Show the first image initially
    if (carouselImages.length > 0) {
        showImage(currentIndex);
        // Automatically rotate images every 3 seconds
        setInterval(nextImage, 3000);
    }

    // New search redirection logic for all search inputs
    function setupSearchInput(inputId) {
        const searchInput = document.getElementById(inputId);
        if (searchInput) {
            searchInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    const searchTerm = searchInput.value;
                    if (searchTerm) {
                        window.location.href = `search.html?query=${encodeURIComponent(searchTerm)}`;
                    }
                }
            });
        }
    }

    setupSearchInput('search-input'); // For index.html
    setupSearchInput('search-input-men'); // For men.html
    setupSearchInput('search-input-women'); // For women.html
    setupSearchInput('search-input-sneakers'); // For sneakers.html
    setupSearchInput('search-input-page'); // For cart.html and other pages

    // Logic for search.html
    if (window.location.pathname.includes('search.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('query');
        const searchResultsGrid = document.getElementById('search-results-grid');
        const searchQueryDisplay = document.getElementById('search-query-display');

        if (searchQueryDisplay) {
            searchQueryDisplay.textContent = `Results for: "${query || ''}"`;
        }

        if (searchResultsGrid && typeof products !== 'undefined') {
            const filteredProducts = products.filter(product => 
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.category.toLowerCase().includes(query.toLowerCase())
            );

            if (filteredProducts.length > 0) {
                filteredProducts.forEach(product => {
                    const productItem = document.createElement('div');
                    productItem.classList.add('product-item');
                    productItem.innerHTML = `
                        <img src="${product.image}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p>${product.price}</p>
                        <button class="add-to-cart-button" data-product-id="${product.id}">Add to Cart</button>
                    `;
                    searchResultsGrid.appendChild(productItem);
                });
            } else {
                searchResultsGrid.innerHTML = '<p>No products found matching your search.</p>';
            }
        }
    }

    const loginForm = document.getElementById("login1");
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault(); // Prevent the default form submission
            var username = document.getElementById("username").value.trim();
            var password = document.getElementById("password").value;
            
            if (!username || !password) {
                alert('Please enter both username and password.');
                return;
            }
            
            // Validate credentials against database
            const loginResult = validateLogin(username, password);
            
            if (loginResult.success) {
                // Set user as logged in after successful login
                setLoggedIn(true, loginResult.user);
                
                // Log login (for debugging)
                console.log('User logged in:', {
                    id: loginResult.user.id,
                    username: loginResult.user.username,
                    fullName: loginResult.user.fullName,
                    email: loginResult.user.email
                });
                
                // Redirect to homepage or the page they were trying to access
                const redirectPath = sessionStorage.getItem('redirectAfterLogin');
                sessionStorage.removeItem('redirectAfterLogin');
                
                if (redirectPath) {
                    // Extract just the filename if it's a full URL
                    const redirectPage = redirectPath.includes('home.html') ? 'home.html' :
                                        redirectPath.includes('cart.html') ? 'cart.html' :
                                        redirectPath.includes('checkout.html') ? 'checkout.html' :
                                        redirectPath;
                    window.location.href = redirectPage;
                } else {
                    window.location.href = 'home.html';
                }
            } else {
                alert(loginResult.message || 'Invalid username or password. Please try again.');
            }
        });
    }

    // Initial cart count update
    updateCartCount();

    // Update navbar based on login status
    function updateNavbar() {
        const signupLink = document.getElementById('signup-link');
        const loginLink = document.getElementById('login-link');
        const logoutLink = document.getElementById('logout-link');
        const userWelcome = document.getElementById('user-welcome');
        const usernameDisplay = document.getElementById('username-display');

        // Only update if we're on a page with navbar elements
        if (!signupLink && !loginLink && !logoutLink) {
            return; // Page doesn't have navbar elements, skip
        }

        if (isLoggedIn()) {
            const currentUser = getCurrentUser();
            // Hide signup/login links
            if (signupLink) signupLink.style.display = 'none';
            if (loginLink) loginLink.style.display = 'none';
            // Show logout button and user welcome
            if (logoutLink) logoutLink.style.display = 'inline-block';
            if (userWelcome) userWelcome.style.display = 'inline-block';
            if (usernameDisplay && currentUser) {
                usernameDisplay.textContent = currentUser.fullName || currentUser.username;
            }
        } else {
            // Show signup/login links
            if (signupLink) signupLink.style.display = 'inline-block';
            if (loginLink) loginLink.style.display = 'inline-block';
            // Hide logout button and user welcome
            if (logoutLink) logoutLink.style.display = 'none';
            if (userWelcome) userWelcome.style.display = 'none';
        }
    }

    // Make updateNavbar globally accessible
    window.updateNavbar = updateNavbar;

    // Update navbar on page load
    updateNavbar();

    // Logic for rendering cart items on cart.html
    function renderCartItems() {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartTotalElement = document.getElementById('cart-total');
        const emptyCartMessage = document.querySelector('.empty-cart-message');
        const clearCartButton = document.getElementById('clear-cart-button');

        if (!cartItemsContainer) return; // Only run if on cart.html

        cartItemsContainer.innerHTML = ''; // Clear existing items
        let total = 0;

        if (Object.keys(window.cart).length === 0) {
            if (emptyCartMessage) emptyCartMessage.style.display = 'block';
            if (cartTotalElement) cartTotalElement.textContent = '$0.00';
            if (clearCartButton) clearCartButton.style.display = 'none';
            return;
        } else {
            if (emptyCartMessage) emptyCartMessage.style.display = 'none';
            if (clearCartButton) clearCartButton.style.display = 'block';
        }

        for (const productId in window.cart) {
            const item = window.cart[productId];
            const itemPrice = parseFloat(item.price.replace('$', '').replace(',', ''));
            const itemSubtotal = itemPrice * item.quantity;
            total += itemSubtotal;

            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>Price: ${item.price}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-button remove-quantity" data-product-id="${item.id}">-</button>
                        <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-product-id="${item.id}">
                        <button class="quantity-button add-quantity" data-product-id="${item.id}">+</button>
                    </div>
                    <p>Subtotal: $${itemSubtotal.toFixed(2)}</p>
                    <button class="remove-from-cart-button" data-product-id="${item.id}">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        }

        if (cartTotalElement) cartTotalElement.textContent = `$${total.toFixed(2)}`;

        // Add event listeners for quantity buttons and remove buttons within the cart
        cartItemsContainer.querySelectorAll('.remove-quantity').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                updateQuantity(productId, window.cart[productId].quantity - 1);
            });
        });

        cartItemsContainer.querySelectorAll('.add-quantity').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                updateQuantity(productId, window.cart[productId].quantity + 1);
            });
        });

        cartItemsContainer.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (event) => {
                const productId = event.target.dataset.productId;
                const newQuantity = parseInt(event.target.value);
                updateQuantity(productId, newQuantity);
            });
        });

        cartItemsContainer.querySelectorAll('.remove-from-cart-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                removeFromCart(productId);
            });
        });
    }

    // Make renderCartItems available globally
    window.renderCartItems = renderCartItems;

    // Render cart items if on cart.html
    if (window.location.pathname.includes('cart.html')) {
        renderCartItems();

        const checkoutButton = document.querySelector('.checkout-button');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', () => {
                if (Object.keys(window.cart).length > 0) {
                    window.location.href = 'checkout.html';
                } else {
                    alert('Your cart is empty. Please add items before checking out.');
                }
            });
        }

        const clearCartButton = document.getElementById('clear-cart-button');
        if (clearCartButton) {
            clearCartButton.addEventListener('click', () => {
                clearCart();
            });
        }
    }

    // Logic for checkout.html
    if (window.location.pathname.includes('checkout.html')) {
        const paymentForm = document.getElementById('payment-form');
        const paymentMessage = document.getElementById('payment-message');
        // const paypalButton = document.getElementById('paypal-button'); // Removed as it's replaced by SDK

        if (paymentForm) {
            paymentForm.addEventListener('submit', async (event) => { // Added async keyword
                event.preventDefault();
                paymentMessage.textContent = 'Processing your payment...';
                paymentMessage.style.color = '#FFD400';

                const cardNumber = document.getElementById('card-number').value;
                const expiryDate = document.getElementById('expiry-date').value;
                const cvc = document.getElementById('cvc').value;
                const cardName = document.getElementById('card-name').value;

                try {
                    const result = await simulatePayment({ cardNumber, expiryDate, cvc, cardName });
                    if (result.success) {
                        paymentMessage.textContent = result.message + ' Redirecting...';
                        paymentMessage.style.color = '#28a745';
                        window.cart = {};
                        saveCart();
                        updateCartCount();
                        setTimeout(() => {
                            window.location.href = 'home.html';
                        }, 2000);
                    } else {
                        paymentMessage.textContent = result.message;
                        paymentMessage.style.color = '#dc3545';
                    }
                } catch (error) {
                    paymentMessage.textContent = error.message || 'An unexpected error occurred.';
                    paymentMessage.style.color = '#dc3545';
                }
            });
        }

        // Render the PayPal Smart Buttons
        if (document.getElementById('paypal-button-container')) {
            paypal.Buttons({
                createOrder: function(data, actions) {
                    // This function sets up the details of the transaction, including the amount and currency
                    // In a real application, you would fetch the total from your cart dynamically
                    const cartTotalElement = document.getElementById('cart-total');
                    const totalAmount = cartTotalElement ? parseFloat(cartTotalElement.textContent.replace('$', '')) : 0;

                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: totalAmount.toFixed(2) // Replace with your dynamic total amount
                            }
                        }]
                    });
                },
                onApprove: function(data, actions) {
                    // This function captures the funds from the transaction.
                    // You can show a loading message while processing
                    paymentMessage.textContent = 'Processing PayPal payment...';
                    paymentMessage.style.color = '#FFD400';

                    // In a real app, you'd send data.orderID to your server to capture the payment
                    // Here, we simulate a successful payment after PayPal approves it
                    return simulatePayment({ 
                        cardNumber: 'PAYPAL_SIMULATED', 
                        expiryDate: 'N/A', 
                        cvc: 'N/A', 
                        cardName: 'PayPal User'
                    }).then(result => {
                        if (result.success) {
                            paymentMessage.textContent = result.message + ' Redirecting...';
                            paymentMessage.style.color = '#28a745';
                            window.cart = {};
                            saveCart();
                            updateCartCount();
                            setTimeout(() => {
                                window.location.href = 'home.html';
                            }, 2000);
                        } else {
                            paymentMessage.textContent = result.message;
                            paymentMessage.style.color = '#dc3545';
                        }
                    }).catch(error => {
                        paymentMessage.textContent = error.message || 'An unexpected error occurred during PayPal processing.';
                        paymentMessage.style.color = '#dc3545';
                    });
                },
                onError: function(err) {
                    // Handle any errors that come from the PayPal checkout
                    console.error('PayPal button error:', err);
                    paymentMessage.textContent = 'PayPal payment failed or was cancelled. Please try again.';
                    paymentMessage.style.color = '#dc3545';
                }
            }).render('#paypal-button-container');
        }
    }
});
