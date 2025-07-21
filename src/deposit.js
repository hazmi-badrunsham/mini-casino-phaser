// This file handles the coin balance and the deposit modal.
// It operates independently of the Phaser game logic in main.js.

let currentCoins = 0; // Initialize player's coins

// --- Get DOM Elements ---
const balanceDisplay = document.getElementById('balance'); // Main balance display
const topDepositButton = document.getElementById('top-deposit-btn'); // Button above title
const depositModal = document.getElementById('deposit-modal'); // The modal overlay
const closeModalButton = depositModal.querySelector('.close-button'); // Close button inside modal
const modalBalanceDisplay = document.getElementById('modal-balance-display'); // Balance display inside modal
const depositAmountInput = document.getElementById('deposit-amount-input'); // Input field inside modal
const confirmDepositButton = document.getElementById('confirm-deposit-btn'); // Confirm button inside modal
const depositMessage = document.getElementById('deposit-message'); // Message display inside modal

// --- Functions ---

/**
 * Updates the coin display on the main page and inside the modal.
 */
function updateCoinDisplay() {
    balanceDisplay.textContent = `💰 Coins: ${currentCoins}`;
    modalBalanceDisplay.textContent = currentCoins;
        
    const event = new CustomEvent('coinsUpdated', { detail: { coins: currentCoins } });
    window.dispatchEvent(event);
}

/**
 * Shows the deposit modal.
 */
function showDepositModal() {
    updateCoinDisplay(); // Ensure balance is up-to-date in modal
    depositAmountInput.value = ''; // Clear previous input
    depositMessage.textContent = ''; // Clear previous messages
    depositModal.style.display = 'flex'; // Show the modal (flex for centering)
}

/**
 * Hides the deposit modal.
 */
function hideDepositModal() {
    depositModal.style.display = 'none'; // Hide the modal
}

/**
 * Handles the deposit logic when the "Confirm Deposit" button is clicked.
 */
function handleDeposit() {
    const amount = parseFloat(depositAmountInput.value);

    // Validate the input amount
    if (isNaN(amount) || amount <= 0) {
        depositMessage.textContent = 'Please enter a valid positive number.';
        depositMessage.className = 'message error'; // Apply error styling
        return;
    }

    // Perform the deposit
    currentCoins += amount;
    updateCoinDisplay(); // Update all coin displays

    depositMessage.textContent = `Successfully deposited ${amount} coins!`;
    depositMessage.className = 'message success'; // Apply success styling

    // Optional: You might want to clear the input or hide the modal after a short delay
    depositAmountInput.value = '';
    // setTimeout(hideDepositModal, 1500); // Hide after 1.5 seconds
}

// --- Event Listeners ---

// Open modal when the top deposit button is clicked
topDepositButton.addEventListener('click', showDepositModal);

// Close modal when the 'x' button is clicked
closeModalButton.addEventListener('click', hideDepositModal);

// Close modal if the user clicks outside the modal content
depositModal.addEventListener('click', (event) => {
    if (event.target === depositModal) {
        hideDepositModal();
    }
});

// Handle deposit when the confirm button inside the modal is clicked
confirmDepositButton.addEventListener('click', handleDeposit);

// --- Initial Setup ---
updateCoinDisplay(); // Set initial balance display on page load

// You might want to expose currentCoins or a function to modify it
// if your Phaser games need to interact with the player's balance.
// For example:
window.getCoins = () => currentCoins;
window.addCoins = (amount) => {
    if (typeof amount === 'number' && amount > 0) {
        currentCoins += amount;
        updateCoinDisplay();
        return true;
    }
    return false;
};
window.deductCoins = (amount) => {
    if (typeof amount === 'number' && amount > 0 && currentCoins >= amount) {
        currentCoins -= amount;
        updateCoinDisplay();
        return true;
    }
    return false;
};
