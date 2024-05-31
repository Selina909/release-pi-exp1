const totalTrials = 8;
const facesPerTrial = 6;
const targetFaces = 3;
let currentTrial = 0;
let currentBlock = 0;
let condition = 1;
let usedFaces = new Set();
let faces = [];
let targets = [];
let fillers = [];
let recognitionFace;
let feedbackTimeout;

const distractorImages = Array.from({ length: 20 }, (_, i) => `distractor-task/cat${i + 1}.jpg`)
    .concat(Array.from({ length: 10 }, (_, i) => `distractor-task/dog${i + 1}.jpg`))
    .concat(Array.from({ length: 10 }, (_, i) => `distractor-task/street${i + 1}.jpg`));
const distractorTasks = ["cat", "dog", "street"];

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('consent-checkbox').addEventListener('change', function() {
        document.getElementById('start-button').classList.toggle('hidden', !this.checked);
    });
});

function startExperiment() {
    document.getElementById('instruction-container').classList.add('hidden');
    document.getElementById('container').classList.remove('hidden');
    showTrialNumber();
    setTimeout(startTrial, 2000);
}

function showTrialNumber() {
    document.getElementById('trial-number').textContent = `Trial ${currentTrial + 1}`;
    document.getElementById('trial-number').classList.remove('hidden');
}

function startTrial() {
    document.getElementById('trial-number').classList.add('hidden');
    selectFaces();
    showStudyPhase();
}

function selectFaces() {
    const isBuildup = (currentTrial % 4) < 3;
    const folder = determineFolder(isBuildup);
    faces = [];
    while (faces.length < facesPerTrial) {
        let face = `${folder}/face${Math.floor(Math.random() * 40) + 1}.jpg`;
        if (!usedFaces.has(face)) {
            faces.push(face);
            usedFaces.add(face);
        }
    }
    targets = faces.slice(0, targetFaces);
    fillers = faces.slice(targetFaces);
}

function determineFolder(isBuildup) {
    if (condition === 1) {
        return isBuildup ? 'WM-faces' : 'WF-faces';
    } else {
        return isBuildup ? 'WF-faces' : 'WM-faces';
    }
}

function showStudyPhase() {
    const facesContainer = document.getElementById('faces-container');
    facesContainer.innerHTML = targets.map(face => `<img src="${face}" alt="face">`).join('');
    facesContainer.classList.remove('hidden');
    setTimeout(showDistractorTask, 2000);
}

function showDistractorTask() {
    document.getElementById('faces-container').classList.add('hidden');
    const distractorInstruction = document.getElementById('distractor-instruction');
    const distractorGrid = document.getElementById('distractor-grid');
    const selectedTask = distractorTasks[Math.floor(Math.random() * distractorTasks.length)];
    distractorInstruction.textContent = `Select all images that show ${selectedTask}`;
    distractorInstruction.dataset.task = selectedTask;
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

function toggleSelection(image) {
    image.classList.toggle('selected');
}

function submitDistractorTask() {
    const selectedTask = document.getElementById('distractor-instruction').dataset.task;
    const selectedImages = Array.from(document.querySelectorAll('#distractor-grid img.selected'));
    const correctImages = selectedImages.every(image => image.src.includes(selectedTask));
    const allCorrect = correctImages && selectedImages.length === document.querySelectorAll(`#distractor-grid img[src*="${selectedTask}"]`).length;

    if (allCorrect) {
        showFeedback("Great! You have passed the task.");
        setTimeout(showRecognitionPhase, 1000);
    } else {
        showFeedback("Incorrect! Please try again.");
        setTimeout(showDistractorTask, 1000);
    }
}

function showFeedback(message) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.classList.remove('hidden');
    feedbackTimeout = setTimeout(() => feedback.classList.add('hidden'), 1000);
}

function showRecognitionPhase() {
    document.getElementById('distractor-container').classList.add('hidden');
    recognitionFace = faces[Math.floor(Math.random() * facesPerTrial)];
    const facesContainer = document.getElementById('faces-container');
    facesContainer.innerHTML = `<img src="${recognitionFace}" alt="face">`;
    facesContainer.classList.remove('hidden');
    document.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(event) {
    if (event.key === '1' || event.key === '2') {
        document.removeEventListener('keydown', handleKeyPress);
        showFeedback(event.key === '1' ? (targets.includes(recognitionFace) ? 'Hit' : 'False Alarm') : (targets.includes(recognitionFace) ? 'False Negative' : 'Correct Rejection'));
        feedbackTimeout = setTimeout(endTrial, 1000);
    }
}

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
        setTimeout(startTrial, 2000);
    } else {
        showSurvey();
    }
}

function showSurvey() {
    document.getElementById('container').classList.add('hidden');
    document.getElementById('survey-container').classList.remove('hidden');
    document.getElementById('survey-form').addEventListener('submit', function(event) {
        event.preventDefault();
        showCompletionMessage();
    });
}

function showCompletionMessage() {
    document.getElementById('survey-container').classList.add('hidden');
    document.getElementById('completion-container').classList.remove('hidden');
}
