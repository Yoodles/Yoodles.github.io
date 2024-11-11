function renderResultPanel() {
    const starContainer = document.getElementById('starContainer');
    const moves = gameState.moveCounter;
    const message = document.getElementById('resultMessage');

    // Reset star colors (all to grey by removing 'yellow')
    const stars = starContainer.querySelectorAll('.star');
    stars.forEach(star => star.classList.remove('yellow'));

    // Determine star rating based on score3star and score2star
    let starRating;
    if (moves <= wordPair.score3star) starRating = 3;
    else if (moves <= wordPair.score2star) starRating = 2;
    else starRating = 1;

    // Add 'yellow' class to stars based on the starRating
    stars.forEach((star, index) => {
        if (index < starRating) star.classList.add('yellow');
    });

    // Update the result message based on the star rating
    if (starRating === 3) {
        message.innerText = `Completed in ${gameState.moveCounter} moves!\nOutstanding!`;
    } else if (starRating === 2) {
        message.innerText = `Completed in ${gameState.moveCounter} moves!\nGreat job!`;
    } else {
        message.innerText = `Completed in ${gameState.moveCounter} moves!\nYou know words good!!`;
    }

    console.log(`Rendered result panel with ${starRating} stars.`);
}
