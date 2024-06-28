<?php
// Directory and file path
$directory = '/mnt/pentagon/release_pi_replication/';
$csvFile = $directory . 'exp1_data.csv';

// Ensure directory exists
if (!is_dir($directory)) {
    die('Directory does not exist: ' . $directory);
}

// Check if the directory is writable
if (!is_writable($directory)) {
    die('Directory is not writable: ' . $directory);
}

$experimentStartTime = $_POST['experimentStartTime'];
$experimentEndTime = $_POST['experimentEndTime'];
$participantID = $_POST['participantID'];
$prolificID = $_POST['prolificID'];
$condition = $_POST['condition'];
$trialData = json_decode($_POST['trialData'], true);
$surveyResponses = json_decode($_POST['surveyResponses'], true);

// Open the file in append mode
$csvData = fopen($csvFile, 'a');

if ($csvData === false) {
    die('Error opening the file ' . $csvFile);
}

// Write header if the file is empty
if (filesize($csvFile) == 0) {
    fputcsv($csvData, [
        'Experiment Start Time', 'Experiment End Time', 'Participant ID', 'Prolific ID', 'Condition',
        'Trial Number', 'Distractor Reaction Time', 'Test Accuracy', 'Test Reaction Time',
        'Age', 'Gender', 'Race', 'Education', 'Seen Faces'
    ]);
}

// Write trial data
foreach ($trialData as $trial) {
    fputcsv($csvData, [
        $experimentStartTime, $experimentEndTime, $participantID, $prolificID, $condition, $trial['trialNumber'], 
        $trial['distractorReactionTime'], $trial['testAccuracy'], $trial['testReactionTime'], 
        $surveyResponses['age'], $surveyResponses['gender'], implode(',', $surveyResponses['race']),
        $surveyResponses['education'], $surveyResponses['seenFaces']
    ]);
}

fclose($csvData);
echo "Data successfully saved!";
?>
