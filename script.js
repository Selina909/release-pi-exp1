const totalTrials = 8; // Total number of trials in the experiment
const facesPerTrial = 6; // Number of faces to be used per trial
const targetFaces = 3; // Number of target faces per trial
let currentTrial = 0; // Track the current trial number
let currentBlock = 0; // Track the current block of trials
let condition = 1; // Condition to alternate between sets of faces
let usedFaces = new Set(); // Track used faces to avoid repetition
let faces = []; // Array to hold faces for the current trial
let targets = []; // Array to hold target faces
let fillers = []; // Array to hold filler faces
let recognitionFace; // The face to be tested in the recognition phase
let feedbackTimeout; // Timeout for feedback display

// Distractor images for the distractor task
const distractorImages = Array.from({ length: 20 }, (_, i) => `images/distractor-task/cat${i + 1}.jpg`)
    .concat(Array.from({ length: 10 }, (_, i) => `images/distractor-task/dog${i + 1}.jpg`))
    .concat(Array.from({ length: 10 }, (_, i) => `images/distractor-task/street${i + 1}.jpg`));
const distractorTasks = ["cat", "dog", "street"]; // Types of distractor tasks

// Event listener for the consent checkbox to show/hide the start button
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('consent-checkbox').addEventListener('change', function() {
        document.getElementById('start-button').classList.toggle('hidden', !this.checked);
    });
});

// Function to start the experiment
function startExperiment() {
    document.getElementById('instruction-container').classList.add('hidden');
    document.getElementById('container').classList.remove('hidden');
    showTrialNumber(); // Display the trial number
    setTimeout(startTrial, 2000); // Start the first trial after a delay
}

// Function to display the current trial number
function showTrialNumber() {
    document.getElementById('trial-number').textContent = `Trial ${currentTrial + 1}`;
    document.getElementById('trial-number').classList.remove('hidden');
}

// Function to start the current trial
function startTrial() {
    document.getElementById('trial-number').classList.add('hidden');
    selectFaces(); // Select faces for the trial
    showStudyPhase(); // Show the study phase
}

// Function to select faces for the current trial
function selectFaces() {
    const isBuildup = (currentTrial % 4) < 3; // Determine if it is a buildup phase
    const folder = determineFolder(isBuildup); // Decide which folder to use based on the condition
    faces = [];
    while (faces.length < facesPerTrial) {
        let face = `images/${folder}/face${Math.floor(Math.random() * 40) + 1}.jpg`;
        if (!usedFaces.has(face)) { // Ensure face has not been used before
            faces.push(face);
            usedFaces.add(face);
        }
    }
    targets = faces.slice(0, targetFaces); // Select target faces
    fillers = faces.slice(targetFaces); // Select filler faces
}

// Function to determine folder name based on condition and phase
function determineFolder(isBuildup) {
    if (condition === 1) {
        return isBuildup ? 'WM-faces' : 'WF-faces';
    } else {
        return isBuildup ? 'WF-faces' : 'WM-faces';
    }
}

// Function to show the study phase with target faces
function showStudyPhase() {
    const facesContainer = document.getElementById('faces-container');
    facesContainer.innerHTML = targets.map(face => `<img src="${face}" alt="face">`).join('');
    facesContainer.classList.remove('hidden');
    setTimeout(showDistractorTask, 2000); // Show distractor task after a delay
}

// Function to show the distractor task
function showDistractorTask() {
    document.getElementById('faces-container').classList.add('hidden');
    const distractorInstruction = document.getElementById('distractor-instruction');
    const distractorGrid = document.getElementById('distractor-grid');
    const selectedTask = distractorTasks[Math.floor(Math.random() * distractorTasks.length)];
    distractorInstruction.textContent = `Select all images that show ${selectedTask}`;
    distractorInstruction.dataset.task = selectedTask; // Set task type in dataset
    const selectedImages = [];
    while (selectedImages.length < 12) {
        const image = distractorImages[Math.floor(Math.random() * distractorImages.length)];
        if (!selectedImages.includes(image)) {
            selectedImages.push(image);
        }
    }
    distractorGrid.innerHTML = selectedImages.map(image => `<img src="${image}" alt="distractor" onclick="toggleSelection(this)">`).join('');
    document.getElementById('distractor-container').classList.remove('hidden');
}

// Function to toggle selection of distractor images
function toggleSelection(image) {
    image.classList.toggle('selected');
}

// Function to submit the distractor task and show feedback
function submitDistractorTask() {
    const selectedTask = document.getElementById('distractor-instruction').dataset.task;
    const selectedImages = Array.from(document.querySelectorAll('#distractor-grid img.selected'));
    const correctImages = selectedImages.every(image => image.src.includes(selectedTask));
    const allCorrect = correctImages && selectedImages.length === document.querySelectorAll(`#distractor-grid img[src*="${selectedTask}"]`).length;

    if (allCorrect) {
        showFeedback("Great! You have passed the task.");
        setTimeout(showRecognitionPhase, 1000); // Show recognition phase after a delay
    } else {
        showFeedback("Incorrect! Please try again.");
        setTimeout(showDistractorTask, 1000); // Retry distractor task after a delay
    }
}

// Function to show feedback message
function showFeedback(message) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.classList.remove('hidden');
    feedbackTimeout = setTimeout(() => feedback.classList.add('hidden'), 1000);
}

// Function to show the recognition phase
function showRecognitionPhase() {
    document.getElementById('distractor-container').classList.add('hidden');
    recognitionFace = faces[Math.floor(Math.random() * facesPerTrial)]; // Select a face for recognition
    const facesContainer = document.getElementById('faces-container');
    facesContainer.innerHTML = `<img src="${recognitionFace}" alt="face">`;
    facesContainer.classList.remove('hidden');
    document.addEventListener('keydown', handleKeyPress); // Listen for key press
}

// Function to handle key press during recognition phase
function handleKeyPress(event) {
    if (event.key === '1' || event.key === '2') {
        document.removeEventListener('keydown', handleKeyPress);
        showFeedback(event.key === '1' ? (targets.includes(recognitionFace) ? 'Hit' : 'False Alarm') : (targets.includes(recognitionFace) ? 'False Negative' : 'Correct Rejection'));
        feedbackTimeout = setTimeout(endTrial, 1000); // End trial after feedback
    }
}

// Function to end the current trial
function endTrial() {
    clearTimeout(feedbackTimeout);
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('faces-container').classList.add('hidden');
    currentTrial++;
    if (currentTrial % 4 === 0) {
        condition = condition === 1 ? 2 : 1;
        currentBlock++;
    }
    if (currentTrial < totalTrials) {
        showTrialNumber();
        setTimeout(startTrial, 2000); // Start next trial after a delay
    } else {
        showSurvey(); // Show survey after all trials are completed
    }
}

// Function to show the survey form
function showSurvey() {
    document.getElementById('container').classList.add('hidden');
    document.getElementById('survey-container').classList.remove('hidden');
    document.getElementById('survey-form').addEventListener('submit', function(event) {
        event.preventDefault();
        showCompletionMessage(); // Show completion message after survey submission
    });
}

// Function to show the completion message
function showCompletionMessage() {
    document.getElementById('survey-container').classList.add('hidden');
    document.getElementById('completion-container').classList.remove('hidden');
}
