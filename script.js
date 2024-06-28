const totalTrials = 8; // Total number of trials in the experiment
const facesPerTrial = 6; // Number of faces to be used per trial
const targetFaces = 3; // Number of target faces per trial

let experimentStartTime = null; // To record the start time of the experiment
let experimentEndTime = null; // To record the end time of the experiment

let participantID = generateUniqueID();
let prolificID = getProlificID(); // Get the Prolific ID from the URL
let currentTrial = 0; // Track the current trial number
let currentBlock = 0; // Track the current block of trials
let condition = Math.random() < 0.5 ? 1 : 2; // Randomly assign initial condition
let usedFaces = new Set(); // Track used faces to avoid repetition
let faces = []; // Array to hold faces for the current trial
let targets = []; // Array to hold target faces
let fillers = []; // Array to hold filler faces
let recognitionFace; // The face to be tested in the recognition phase
let feedbackTimeout; // Timeout for feedback display
let distractorStartTime = null; // To record the start time of each distractor task
let testStartTime = null; // To record the start time of each test face presentation
let distractorReactionTimes = [];
let testAccuracies = [];
let testReactionTimes = [];


// Distractor images for the distractor task
const distractorImages = Array.from({ length: 20 }, (_, i) => `images/distractor-task/cat${i + 1}.jpg`)
    .concat(Array.from({ length: 20 }, (_, i) => `images/distractor-task/dog${i + 1}.jpg`))
    .concat(Array.from({ length: 20 }, (_, i) => `images/distractor-task/car${i + 1}.jpg`));
const distractorTasks = ["cat", "dog", "car"]; // Types of distractor tasks

// Generate a unique 7-digit participant ID
function generateUniqueID() {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
}

// Function to get the Prolific ID from the URL
function getProlificID() {
    const params = new URLSearchParams(window.location.search);
    return params.get('PROLIFIC_PID') || '';
}

// Event listener for the consent checkbox to show/hide the start button
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('consent-checkbox').addEventListener('change', function() {
        document.getElementById('start-button').classList.toggle('hidden', !this.checked);
    });
    document.getElementById('prolific-id').value = prolificID; // Set the Prolific ID value
});


// Function to start the experiment
function startExperiment() {
    experimentStartTime = new Date(); // Record the start time of the experiment
    console.log (experimentStartTime);
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
    distractorStartTime = new Date().getTime(); // Record the start time of distractor task
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
        const distractorReactionTime = new Date().getTime() - distractorStartTime; // Calculate distractor task reaction time
        distractorReactionTimes.push(distractorReactionTime); // Store reaction time
        console.log(`Reaction time for distractor task: ${distractorReactionTime} ms`); // Log reaction time
        showFeedback("Great! You have passed the task.");
        setTimeout(showTestInstruction, 1000); // Show recognition phase after a delay
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

function showTestInstruction() {
    document.getElementById('distractor-container').classList.add('hidden');
    const testInstruction = document.getElementById('test-instruction');
    testInstruction.textContent = `Press 1 if you think the following face is old, press 2 if you think the following face is new`;
    testInstruction.classList.remove('hidden');
    setTimeout(showRecognitionPhase, 3000);
}

// Function to show the recognition phase
function showRecognitionPhase() {
    document.getElementById('test-instruction').classList.add('hidden');
    recognitionFace = faces[Math.floor(Math.random() * facesPerTrial)]; // Select a face for recognition
    const facesContainer = document.getElementById('faces-container');
    facesContainer.innerHTML = `<img src="${recognitionFace}" alt="face">`;
    facesContainer.classList.remove('hidden');
    testStartTime = new Date().getTime(); // Record the start time of recognition test
    document.addEventListener('keydown', handleKeyPress); // Listen for key press
}

// Function to handle key press during recognition phase
function handleKeyPress(event) {
    if (event.key === '1' || event.key === '2') {
        const testReactionTime = new Date().getTime() - testStartTime; // Calculate recognition test reaction time
        testReactionTimes.push(testReactionTime); // Store reaction time
        const accuracy = event.key === '1' ? (targets.includes(recognitionFace) ? 'Hit' : 'False Alarm') : (targets.includes(recognitionFace) ? 'False Negative' : 'Correct Rejection');
        testAccuracies.push(accuracy); // Store accuracy
        console.log(`Reaction time for face: ${testReactionTime} ms`); // Log reaction time
        console.log(`Response accuracy: ${accuracy}`); // Log response accuracy
        document.removeEventListener('keydown', handleKeyPress);
        endTrial(); // End trial
    }
}

// Function to end the current trial
function endTrial() {
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
        experimentEndTime = new Date(); // Record the end time of the experiment
        console.log(experimentEndTime);
        showSurvey(); // Show survey after all trials are completed
    }
}

// Function to show the survey form
function showSurvey() {
    document.getElementById('container').classList.add('hidden');
    document.getElementById('survey-container').classList.remove('hidden');
    document.getElementById('survey-form').addEventListener('submit', function(event) {
        event.preventDefault();
        sendDataToServer(); // Send data to server on survey submission
    });
}

// Function to show the completion message
function showCompletionMessage() {
    document.getElementById('survey-container').classList.add('hidden');
    document.getElementById('completion-container').classList.remove('hidden');
}

// Function to send data to the server
function sendDataToServer() {
    const trialData = []; // Collect trial data here
    for (let i = 0; i < totalTrials; i++) {
        trialData.push({
            trialNumber: i + 1,
            distractorReactionTime: distractorReactionTimes[i],
            testAccuracy: testAccuracies[i],
            testReactionTime: testReactionTimes[i]
        });
    }

    const surveyResponses = {
        age: document.getElementById('age').value,
        gender: document.querySelector('input[name="gender"]:checked').value,
        race: Array.from(document.querySelectorAll('input[name="race"]:checked')).map(el => el.value),
        education: document.querySelector('input[name="education"]:checked').value,
        seenFaces: document.querySelector('input[name="seenFaces"]:checked').value
    };

    const data = new FormData();
    data.append('experimentStartTime', experimentStartTime.toISOString()); 
    data.append('experimentEndTime', experimentEndTime.toISOString()); 
    data.append('participantID', participantID);
    data.append('prolificID', prolificID);
    data.append('condition', condition);
    data.append('trialData', JSON.stringify(trialData));
    data.append('surveyResponses', JSON.stringify(surveyResponses));

    fetch('store_data.php', {
        method: 'POST',
        body: data
    })
    .then(response => response.text())
    .then(response => {
        console.log(response);
        showCompletionMessage();
        // Redirect to Prolific completion URL
        window.location.href = `https://app.prolific.com/submissions/complete?cc=C1MDGC0J`;
    })
    .catch(error => console.error('Error:', error));
}
