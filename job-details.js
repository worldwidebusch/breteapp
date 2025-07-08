import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('id');

    const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('title, company, description, location, wage_amount, wage_currency, hours_start, hours_end, date, requirements, image_url, is_approved, exact_address, contact_phone')
        .eq('id', jobId)
        .single();

    if (jobError || !job) {
        console.error('Error fetching job details:', jobError);
        document.querySelector('.job-details-main').innerHTML = '<p>Job not found.</p>';
        return;
    }

    document.getElementById('job-details-title').textContent = job.title;
    document.getElementById('job-details-company').textContent = job.company;
    document.getElementById('job-details-description').textContent = job.description;
    document.getElementById('job-details-location').textContent = job.location;
    

    const wageFormatted = new Intl.NumberFormat(currentLang === 'en' ? 'en-US' : 'es-NI', {
        style: 'currency',
        currency: job.wage_currency,
        minimumFractionDigits: 2,
    }).format(job.wage_amount);
    document.getElementById('job-details-wage').textContent = `${wageFormatted}/hora`;

    document.getElementById('job-details-hours').textContent = `${job.hours_start} - ${job.hours_end}`;
    document.getElementById('job-details-date').textContent = job.date[0];

    const requirementsContainer = document.getElementById('job-details-requirements');
    requirementsContainer.innerHTML = job.requirements.map(req => `<span class="tag">${req}</span>`).join('');

    const jobImage = document.getElementById('job-details-image');
    if (job.image_url) {
        jobImage.src = job.image_url;
        jobImage.style.display = 'block';
    } else {
        jobImage.style.display = 'none';
    }

    // Handle Apply Now button click
    const applyNowButton = document.getElementById('apply-now-button');
    if (applyNowButton) {
        applyNowButton.addEventListener('click', async (event) => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                displayMessage('You must be logged in to apply for jobs.', 'error');
                setTimeout(() => { window.location.href = 'login.html'; }, 1500);
                return;
            }

            const { data: userProfile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('email', user.email)
                .single();

            if (profileError || userProfile.role === 'cliente') {
                if (confirm(translations[currentLang].clientWorkerPrompt)) {
                    // Assuming handleLogout is globally available or imported
                    // For now, we'll just redirect to register-trabajador.html
                    window.location.href = 'register-trabajador.html';
                }
                return;
            }

            // If logged in as worker, proceed to apply page
            window.location.href = `apply.html?id=${job.id}`;
        });
    }

    // Report Job Functionality
    const reportModal = document.getElementById('report-job-modal');
    const reportJobButton = document.getElementById('report-job-button');
    const closeButton = document.querySelector('.modal .close-button');
    const reportForm = document.getElementById('report-job-form');

    reportJobButton.addEventListener('click', async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            displayMessage('You must be logged in to report a job.', 'error');
            setTimeout(() => { window.location.href = 'login.html'; }, 1500);
            return;
        }
        document.getElementById('report-job-id').value = job.id;
        reportModal.style.display = 'block';
    });

    closeButton.addEventListener('click', () => {
        reportModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == reportModal) {
            reportModal.style.display = 'none';
        }
    });

    reportForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const reason = document.getElementById('report-reason').value;
        const reportedJobId = document.getElementById('report-job-id').value;
        const { data: { user } } = await supabase.auth.getUser();

        const { error: insertError } = await supabase
            .from('job_reports')
            .insert([
                {
                    job_id: reportedJobId,
                    reason: reason,
                    reported_by: user.id,
                }
            ]);

        if (insertError) {
            console.error('Error submitting report:', insertError);
            displayMessage('Error submitting report.', 'error');
        } else {
            displayMessage('Job reported successfully. Our team will review it.', 'success');
            reportModal.style.display = 'none';
            reportForm.reset();
        }
    });
});