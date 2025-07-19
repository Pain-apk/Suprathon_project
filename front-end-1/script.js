document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('resume-form');
    let workExpCount = 0;
    let eduCount = 0;

    // Function to update preview in real-time
    const updatePreview = (inputId, previewId) => {
        const inputElement = document.getElementById(inputId);
        const previewElement = document.getElementById(previewId);
        
        inputElement.addEventListener('input', () => {
            previewElement.innerText = inputElement.value;
        });
    };

    // Personal Information
    updatePreview('name', 'preview-name');
    updatePreview('title', 'preview-title');
    updatePreview('phone', 'preview-phone');
    updatePreview('email', 'preview-email');
    updatePreview('linkedin', 'preview-linkedin');
    updatePreview('summary', 'preview-summary');

    // Skills
    document.getElementById('skills').addEventListener('input', (e) => {
        const skillsList = document.getElementById('preview-skills');
        skillsList.innerHTML = '';
        const skills = e.target.value.split(',').filter(skill => skill.trim() !== '');
        skills.forEach(skill => {
            const li = document.createElement('li');
            li.textContent = skill.trim();
            skillsList.appendChild(li);
        });
    });

    // Function to add a new Work Experience entry
    const addWorkExperience = () => {
        workExpCount++;
        const workFields = document.getElementById('work-experience-fields');
        const previewWork = document.getElementById('preview-work-experience');

        // Create form fields
        const newWorkEntry = document.createElement('div');
        newWorkEntry.classList.add('dynamic-entry');
        newWorkEntry.innerHTML = `
            <h4>Work Experience #${workExpCount}</h4>
            <input type="text" placeholder="Job Title" class="work-title">
            <input type="text" placeholder="Company" class="work-company">
            <input type="text" placeholder="Start & End Dates (e.g., Jan 2020 - Present)" class="work-dates">
            <textarea placeholder="Job Description..."></textarea>
        `;
        workFields.appendChild(newWorkEntry);

        // Create preview section
        const newPreviewEntry = document.createElement('div');
        newPreviewEntry.classList.add('work-entry');
        newPreviewEntry.innerHTML = `
            <h3>Job Title</h3>
            <p><strong>Company</strong></p>
            <p class="date">Dates</p>
            <p>Description</p>
        `;
        previewWork.appendChild(newPreviewEntry);

        // Add event listeners to update preview
        newWorkEntry.addEventListener('input', () => {
            newPreviewEntry.querySelector('h3').textContent = newWorkEntry.querySelector('.work-title').value;
            newPreviewEntry.querySelector('strong').textContent = newWorkEntry.querySelector('.work-company').value;
            newPreviewEntry.querySelector('.date').textContent = newWorkEntry.querySelector('.work-dates').value;
            newPreviewEntry.querySelector('p:last-of-type').textContent = newWorkEntry.querySelector('textarea').value;
        });
    };
    
    // Function to add a new Education entry
    const addEducation = () => {
        eduCount++;
        const eduFields = document.getElementById('education-fields');
        const previewEdu = document.getElementById('preview-education');

        // Create form fields
        const newEduEntry = document.createElement('div');
        newEduEntry.classList.add('dynamic-entry');
        newEduEntry.innerHTML = `
            <h4>Education #${eduCount}</h4>
            <input type="text" placeholder="Degree / Certificate" class="edu-degree">
            <input type="text" placeholder="School / University" class="edu-school">
            <input type="text" placeholder="Graduation Year" class="edu-year">
        `;
        eduFields.appendChild(newEduEntry);

        // Create preview section
        const newPreviewEntry = document.createElement('div');
        newPreviewEntry.classList.add('edu-entry');
        newPreviewEntry.innerHTML = `
            <h3>Degree / Certificate</h3>
            <p><strong>School / University</strong></p>
            <p class="date">Year</p>
        `;
        previewEdu.appendChild(newPreviewEntry);

        // Add event listeners to update preview
        newEduEntry.addEventListener('input', () => {
            newPreviewEntry.querySelector('h3').textContent = newEduEntry.querySelector('.edu-degree').value;
            newPreviewEntry.querySelector('strong').textContent = newEduEntry.querySelector('.edu-school').value;
            newPreviewEntry.querySelector('.date').textContent = newEduEntry.querySelector('.edu-year').value;
        });
    };


    // Event Listeners for Add buttons
    document.getElementById('add-work-btn').addEventListener('click', addWorkExperience);
    document.getElementById('add-edu-btn').addEventListener('click', addEducation);


    // PDF Download Functionality
    document.getElementById('download-pdf-btn').addEventListener('click', () => {
        const resumePreview = document.getElementById('resume-preview');
        const opt = {
            margin:       0.5,
            filename:     'resume.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Use html2pdf to generate the PDF
        html2pdf().from(resumePreview).set(opt).save();
    });
    
    // Initially add one entry for work and education to start
    addWorkExperience();
    addEducation();
});
