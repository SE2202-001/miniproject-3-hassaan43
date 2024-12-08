let jobData = []; // To store all job data
let filteredJobs = []; // To store filtered or sorted jobs
let jobDetail = []; // To store deatils for jobs

// Load the JSON file if the button is clicked
document.getElementById('load-data').addEventListener('click', () => {
    const fileInput = document.getElementById('file-upload');
    if (fileInput.files.length === 0) {
        alert('Please select a JSON file to upload.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            // Try to parse the file content
            jobData = JSON.parse(e.target.result);

            // Validate the structure of the parsed data (ensure it's an array)
            if (!Array.isArray(jobData)) {
                throw new Error('Invalid JSON structure.');
            }

            // Convert job data to Job objects
            const jobs = jobData.map(job => new Job(
                job["Job No"],
                job["Title"],
                job["Job Page Link"],
                job["Posted"],
                job["Type"],
                job["Level"],
                job["Estimated Time"],
                job["Skill"],
                job["Detail"]
            ));


            // Display jobs
            displayJobs(jobs);

            populateFilters(jobData);

        } catch (error) {
            console.error('Error parsing JSON data:', error);
            alert('Error parsing JSON data.');
        }
    };

    reader.readAsText(file);
});

// Job class
class Job {
    constructor(jobNum, title, link, postedTime, type, level, time, skill, detail) {
        this.jobNum = jobNum;
        this.title = title;
        this.link = link;
        this.postedTime = postedTime;
        this.type = type;
        this.level = level;
        this.time = time;
        this.skill = skill;
        this.detail = detail;
    }

    getDetails() {
        return `
            Title: ${this.title} <br>
            Posted: ${this.postedTime} <br>
            Type: ${this.type} <br>
            Level: ${this.level} <br>
            Skill: ${this.skill} <br>
            Detail: ${this.detail}
        `;
    }
}

function populateFilters(jobData) {
    const levelSelect = document.getElementById('level');
    const typeSelect = document.getElementById('type');
    const skillSelect = document.getElementById('skill');

    // Populate level filter
    const levels = [...new Set(jobData.map(job => job["Level"]))];
    levels.forEach(level => {
        const option = document.createElement('option');
        option.value = level;
        option.textContent = level;
        levelSelect.appendChild(option);
    });

    // Populate type filter
    const types = [...new Set(jobData.map(job => job["Type"]))];
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
    });

    // Populate skill filter
    const skills = [...new Set(jobData.map(job => job["Skill"]))];
    skills.forEach(skill => {
        const option = document.createElement('option');
        option.value = skill;
        option.textContent = skill;
        skillSelect.appendChild(option);
    });
}

function populateDropdown(id, values) {
    const dropdown = document.getElementById(id);
    dropdown.innerHTML = '<option value="">All</option>';
    values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        dropdown.appendChild(option);
    });
}

// Filters based on chosen filters after button is clicked
document.getElementById('filter-button').addEventListener('click', () => {
    const selectedLevel = document.getElementById('level').value;
    const selectedType = document.getElementById('type').value;
    const selectedSkill = document.getElementById('skill').value;

    if (selectedLevel == "" && selectedType == "" && selectedSkill == "") {
        filteredJobs = jobData;
    }
    if (selectedLevel != "") {
        filteredJobs = jobData.filter(job => job.Level == selectedLevel);
    }
    if (selectedType != "") {
        filteredJobs = filteredJobs.filter(job => job.Type == selectedType);
    }
    if (selectedSkill != "") {
        filteredJobs = filteredJobs.filter(job => job.Skill == selectedSkill);
    }

    const jobs = filteredJobs.map(job => new Job(
        job["Job No"],
        job["Title"],
        job["Job Page Link"],
        job["Posted"],
        job["Type"],
        job["Level"],
        job["Estimated Time"],
        job["Skill"],
        job["Detail"]
    ));

    displayJobs(jobs);
});

// Sorts based on the sort option chosen by user after clicking the button
document.getElementById('sort-button').addEventListener('click', () => {
    const selectedOption = document.getElementById('sort-options').value;
    let sortedJobs = [];

    if (selectedOption == "postedTime") {
        if (filteredJobs.length !== 0) {
            sortedJobs = sortJobsByPostedTime([...filteredJobs]);
        } else {
            sortedJobs = sortJobsByPostedTime([...jobData]);
        }
    } else {
        if (filteredJobs.length != 0) {
            sortedJobs = [...filteredJobs].sort((a, b) => a.Title.localeCompare(b.Title));
        } else {
            sortedJobs = [...jobData].sort((a, b) => a.Title.localeCompare(b.Title));
        }
    }

    const jobs = sortedJobs.map(job => new Job(
        job["Job No"],
        job["Title"],
        job["Job Page Link"],
        job["Posted"],
        job["Type"],
        job["Level"],
        job["Estimated Time"],
        job["Skill"],
        job["Detail"]
    ));

    displayJobs(jobs);
});

// Convert the time to a normalized time
function normalizePostedTime(postedTime) {
    const regexMinutes = /(\d+) minute(s)? ago/;
    const regexHours = /(\d+) hour(s)? ago/;
    const regexDays = /(\d+) day(s)? ago/;

    let normalizedTime = 0; 

    // Check if the time is in minutes
    if (regexMinutes.test(postedTime)) {
        const match = postedTime.match(regexMinutes);
        normalizedTime = parseInt(match[1]);
    }
    // Check if the time is in hours
    else if (regexHours.test(postedTime)) {
        const match = postedTime.match(regexHours);
        normalizedTime = parseInt(match[1]) * 60;  
    }
    // Check if the time is in days
    else if (regexDays.test(postedTime)) {
        const match = postedTime.match(regexDays);
        normalizedTime = parseInt(match[1]) * 1440;  
    }

    return normalizedTime;
}

function sortJobsByPostedTime(jobs) {
    return jobs.sort((a, b) => {
        const timeA = normalizePostedTime(a.postedTime);
        const timeB = normalizePostedTime(b.postedTime);
        return timeA - timeB; // Sort by the normalized time
    });
}

// Check if a job was clicked
document.getElementById('job-listings').addEventListener('click', (e) => {
    const jobElement = e.target.closest('.job-item');
    if (jobElement) {
        const jobTitle = jobElement.querySelector('h3').textContent;  
        console.log(jobTitle);  
        jobDetail = jobData.find(job => job["Title"] == jobTitle);
        console.log(jobDetail);
        const job = new Job(
            jobDetail["Job No"],
            jobDetail["Title"],
            jobDetail["Job Page Link"],
            jobDetail["Posted"],
            jobDetail["Type"],
            jobDetail["Level"],
            jobDetail["Estimated Time"],
            jobDetail["Skill"],
            jobDetail["Detail"]
        );
        displayJobDetails(job);
    }
});

// Display the job details for the clicked job
function displayJobDetails(job) {
    document.getElementById('job-title').textContent = job.title;
    document.getElementById('job-link').href = job.link;
    document.getElementById('job-link').textContent = job.link;
    document.getElementById('job-type').textContent = job.type;
    document.getElementById('job-level').textContent = job.level;
    document.getElementById('job-skills').textContent = job.skill;
    document.getElementById('job-detail').textContent = job.detail;

    // Show the overlay and popup
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('job-popup').style.display = 'block';
}

// Close the popup when the close button is clicked
document.getElementById('close-popup').addEventListener('click', function() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('job-popup').style.display = 'none';
});

// Close the popup if the user clicks on the dimmed overlay
document.getElementById('overlay').addEventListener('click', function() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('job-popup').style.display = 'none';
});

// Display the jobs after filtering, sorting or loading
function displayJobs(jobs) {
    const jobList = document.getElementById('job-listings');
    jobList.innerHTML = '';
    jobs.forEach((job, index) => {
        const jobElement = document.createElement('div');
        jobElement.classList.add('job-item');
        jobElement.dataset.id = index;
        jobElement.innerHTML = `
            <h3>${job.title}</h3>
            <p>${job.type} - ${job.level} - ${job.skill}</p>
            <small>${job.postedTime}</small>
        `;
        jobList.appendChild(jobElement);
    });
}
