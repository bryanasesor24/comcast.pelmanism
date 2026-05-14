/**
 * ADMIN CONFIGURATION
 * Add or remove business processes here. 
 * The game will automatically create pairs from 'before' and 'after'.
 */
const processes = [
    { id: 1, name: "Parking Protocol", before: "Arrive at Gate", after: "Ticket Validated" },
    { id: 2, name: "User Auth", before: "Enter Credentials", after: "Token Generated" },
    { id: 3, name: "Coffee Loop", before: "Grind Beans", after: "Espresso Extracted" },
    { id: 4, name: "System Update", before: "Download Patch", after: "Reboot Success" },
    { id: 5, name: "Client Onboarding", before: "Initial Meeting", after: "Contract Signed" },
    { id: 6, name: "Inventory", before: "Stock Count", after: "Database Sync" }
];

let flippedCards = [];
let matchedPairs = 0;
let timerSeconds = 0;
let timerInterval = null;
let isChecking = false;

const grid = document.getElementById('game-grid');
const timerDisplay = document.getElementById('timer');
const pairsDisplay = document.getElementById('pairs-count');
const processList = document.getElementById('process-list');

function initGame() {
    // Reset State
    grid.innerHTML = '';
    processList.innerHTML = '';
    flippedCards = [];
    matchedPairs = 0;
    timerSeconds = 0;
    isChecking = false;
    clearInterval(timerInterval);
    timerDisplay.textContent = "00:00";
    pairsDisplay.textContent = processes.length;

    // Create Card Deck
    let deck = [];
    processes.forEach(p => {
        deck.push({ text: p.before, pairId: p.id, type: 'before' });
        deck.push({ text: p.after, pairId: p.id, type: 'after' });
        
        // Add to Sidebar
        const div = document.createElement('div');
        div.className = 'process-item';
        div.id = `proc-${p.id}`;
        div.innerHTML = `<strong>${p.name}</strong><br><small>${p.before} → ${p.after}</small>`;
        processList.appendChild(div);
    });

    // Shuffle
    deck.sort(() => Math.random() - 0.5);

    // Render Cards
    deck.forEach((data, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.pairId = data.pairId;
        card.innerHTML = `
            <div class="card-face card-front"></div>
            <div class="card-back card-face">${data.text}</div>
        `;
        card.addEventListener('click', () => flipCard(card));
        grid.appendChild(card);
    });
}

function flipCard(card) {
    if (isChecking || card.classList.contains('flipped') || card.classList.contains('matched')) return;

    // Start timer on first click
    if (!timerInterval) startTimer();

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    isChecking = true;
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.pairId === card2.dataset.pairId;

    if (isMatch) {
        handleSuccess(card1, card2);
    } else {
        handleFailure(card1, card2);
    }
}

function handleSuccess(c1, c2) {
    matchedPairs++;
    pairsDisplay.textContent = processes.length - matchedPairs;
    
    c1.classList.add('matched', 'correct-glow');
    c2.classList.add('matched', 'correct-glow');
    
    // Update Sidebar
    document.getElementById(`proc-${c1.dataset.pairId}`).classList.add('completed');

    flippedCards = [];
    isChecking = false;

    if (matchedPairs === processes.length) {
        endGame();
    }
}

function handleFailure(c1, c2) {
    c1.classList.add('shake');
    c2.classList.add('shake');

    setTimeout(() => {
        c1.classList.remove('flipped', 'shake');
        c2.classList.remove('flipped', 'shake');
        flippedCards = [];
        isChecking = false;
    }, 1000);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timerSeconds++;
        const mins = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
        const secs = (timerSeconds % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${mins}:${secs}`;
    }, 1000);
}

function endGame() {
    clearInterval(timerInterval);
    triggerConfetti();
    alert(`Excellent! Process optimization complete in ${timerDisplay.textContent}`);
}

function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let pieces = [];
    for(let i=0; i<100; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            size: Math.random() * 10 + 5,
            speed: Math.random() * 3 + 2
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.y += p.speed;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        if(pieces[0].y < canvas.height) requestAnimationFrame(animate);
    }
    animate();
}

document.getElementById('restart-btn').addEventListener('click', initGame);

// Initialize on Load
initGame();