import { supabase } from './supabase-client.js';

function isValidEmail(email) {
    const emailRegex = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Allows digits, spaces, hyphens, and a plus sign, minimum 7 digits
    const phoneRegex = /^\+?[0-9\s-]{7,}$/;
    return phoneRegex.test(phone);
}

function isStrongPassword(password) {
    // Minimum 8 characters, at least one uppercase, one lowercase, one number, one special character
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~-]).{8,}$/;
    return strongPasswordRegex.test(password);
}

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {

    console.log('DOMContentLoaded event fired.');
    try {
        const hamburgerMenu = document.querySelector('.hamburger-menu');
        const mobileNav = document.querySelector('.mobile-nav');
        const mobileMenuCloseBtn = document.querySelector('.mobile-menu-close-btn');

        if (hamburgerMenu && mobileNav) {
            hamburgerMenu.addEventListener('click', () => {
                mobileNav.classList.add('active'); // Open menu
            });
        }

        if (mobileMenuCloseBtn && mobileNav) {
            mobileMenuCloseBtn.addEventListener('click', () => {
                mobileNav.classList.remove('active'); // Close menu
            });
        }

        // Initial content load and visibility update
        updateContent();

        // Listen for auth state changes
        supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session);
            updateNavigationVisibility();
            checkClientAccess();
        });

        // Language switcher functionality
        document.querySelectorAll('.language-switcher .lang-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const newLang = event.target.dataset.lang;
                if (newLang) { // Ensure newLang is defined
                    currentLang = newLang;
                    // Update active class for all language buttons
                    document.querySelectorAll('.language-switcher .lang-button').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    document.querySelectorAll(`.language-switcher button[data-lang="${currentLang}"]`).forEach(btn => {
                        btn.classList.add('active');
                    });
                    updateContent();
                }
            });
        });
    } catch (error) {
        console.error("Error in DOMContentLoaded handler:", error);
    }
});

async function checkLoginStatus() {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
}

async function checkClientAccess() {
    const { data: { user } } = await supabase.auth.getUser();
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'client-applications.html' || currentPage === 'post-job.html') {
        if (!user) {
            displayMessage('Access denied. Only clients can view this page.', 'error');
            setTimeout(() => { window.location.href = 'index.html'; }, 1500);
            return;
        }

        const { data, error } = await supabase.from('profiles').select('role').eq('email', user.email).single();

        if (error || data.role !== 'cliente') {
            displayMessage('Access denied. Only clients can view this page.', 'error');
            setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        }
    }
}



async function updateNavigationVisibility() {
    const isLoggedIn = await checkLoginStatus();
    const { data: { user } } = await supabase.auth.getUser();
    let isClient = false;
    let isWorker = false;

    if (user) {
        const { data, error } = await supabase.from('profiles').select('role').eq('email', user.email).single();
        if (data) {
            isClient = data.role === 'cliente';
            isWorker = data.role === 'trabajador';
        }
    }

    document.querySelectorAll('.logged-in-only').forEach(element => {
        element.style.display = isLoggedIn ? 'list-item' : 'none';
    });

    document.querySelectorAll('.logged-out-only').forEach(element => {
        element.style.display = isLoggedIn ? 'none' : 'list-item';
    });

    document.querySelectorAll('.client-only').forEach(element => {
        element.style.display = isClient ? 'list-item' : 'none';
    });

    document.querySelectorAll('.worker-only').forEach(element => {
        element.style.display = isWorker ? 'list-item' : 'none';
    });

    document.querySelectorAll('.client-nav-item').forEach(element => {
        element.style.display = isClient ? 'list-item' : 'none';
    });

    document.querySelectorAll('.worker-nav-item').forEach(element => {
        element.style.display = isWorker ? 'list-item' : 'none';
    });

    // Special handling for list items that contain buttons
    document.querySelectorAll('li.desktop-register-buttons').forEach(element => {
        element.style.display = isLoggedIn ? 'none' : 'flex';
    });

    // Special handling for mobile register buttons wrapper
    const mobileRegisterWrapper = document.querySelector('.mobile-register-button-wrapper');
    if (mobileRegisterWrapper) {
        mobileRegisterWrapper.style.display = isLoggedIn ? 'none' : 'flex';
    }

    // Update login/logout text in header
    const loginLink = document.querySelector('a[data-key="login"]');
    if (loginLink) {
        if (isLoggedIn) {
            loginLink.textContent = 'Logout';
            loginLink.href = '#';
            loginLink.addEventListener('click', handleLogout);
        } else {
            loginLink.textContent = translations[currentLang].login;
            loginLink.href = 'login.html';
            loginLink.removeEventListener('click', handleLogout);
        }
    }

    const logoutButtonDesktop = document.getElementById('logout-button-desktop');
    if (logoutButtonDesktop) {
        if (isLoggedIn) {
            logoutButtonDesktop.style.display = 'block';
            logoutButtonDesktop.addEventListener('click', handleLogout);
        } else {
            logoutButtonDesktop.style.display = 'none';
            logoutButtonDesktop.removeEventListener('click', handleLogout);
        }
    }

    const logoutButtonMobile = document.getElementById('logout-button-mobile');
    if (logoutButtonMobile) {
        if (isLoggedIn) {
            logoutButtonMobile.style.display = 'block';
            logoutButtonMobile.addEventListener('click', handleLogout);
        } else {
            logoutButtonMobile.style.display = 'none';
            logoutButtonMobile.removeEventListener('click', handleLogout);
        }
    }

    // Remove nav-hidden class after visibility is updated
    document.querySelector('.main-nav').classList.remove('nav-hidden');
    document.querySelector('.mobile-nav').classList.remove('nav-hidden');
}

async function handleLogout(event, redirectUrl = 'index.html') {
    if (event) event.preventDefault();
    await supabase.auth.signOut();
    displayMessage('Logged out successfully!', 'success');
    updateNavigationVisibility();
    setTimeout(() => { window.location.href = redirectUrl; }, 500);
}



const jobsFeed = document.getElementById('jobs-feed');
const currentDateDisplay = document.getElementById('current-date-display');
const prevDayButton = document.getElementById('prev-day');
const nextDayButton = document.getElementById('next-day');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

export const translations = {
    en: {
        jobs: 'Jobs',
        myProfile: 'My Profile',
        login: 'Login',
        register: 'Register',
        heroHeading: 'Find your next flexible job.',
        searchPlaceholder: 'Search by job title, company, or city...',
        searchButton: 'Search',
        previousDay: 'Previous Day',
        nextDay: 'Next Day',
        location: 'Location:',
        wage: 'Wage:',
        hours: 'Hours:',
        hardRequirements: 'Hard Requirements:',
        noJobs: 'No jobs available for this day.',
        chooseRegistrationType: 'Choose Registration Type',
        registerChambero: 'Register as Trabajador',
        registerCliente: 'Register as Cliente',
        registerChamberoTitle: 'Register as Trabajador',
        registerClienteTitle: 'Register as Cliente',
        emailLabel: 'Email:',
        passwordLabel: 'Password:',
        confirmPasswordLabel: 'Confirm Password:',
        registerButton: 'Register',
        alreadyHaveAccountAndLoginHere: 'Already have an account? Login here',
        businessNameLabel: 'Business Name:',
        addressLabel: 'Address:',
        phoneLabel: 'Phone Number:',
        skillsLabel: 'Skills/Services Offered (e.g., Web Design, Plumbing):',
        locationLabel: 'Location (City/Department):',
        contactPersonLabel: 'Contact Person (Full Official Name):',
        legalDocsLabel: 'Legal Documents (e.g., Business License Number):',
        clienteRole: 'Client',
        clienteDescription: 'Hire talent for your business or projects.',
        registerClienteButton: 'Register as Client',
        chamberoRole: 'Worker',
        chamberoDescription: 'Find flexible jobs and earn money.',
        registerChamberoButton: 'Register as Worker',
        loginTitle: 'Login to <span class="brand-brete">brete</span><span class="brand-app">.app</span>',
        noAccountAndRegisterHere: "Don't have an account? Register here",
        chooseRolePrompt: 'First, tell us what you want to do.',
        fullNameLabel: 'Full Name:',
        contactInfo: 'Contact Information',
        contactUs: 'Contact Us',
        contactUsTitle: 'Contact Us',
        contactUsIntro: "We'd love to hear from you! Please reach out to us using the information below:",
        contactUsEmail: 'support@<span class="brand-brete">brete</span><span class="brand-app">.app</span>',
        contactUsPhone: '+505 8888-8888',
        contactUsAddress: '123 Opportunity Lane, Managua, Nicaragua',
        contactUsFormIntro: "Alternatively, you can fill out the form below and we will get back to you as soon as possible.",
        contactUsNameLabel: 'Your Name:',
        contactUsEmailLabel: 'Your Email:',
        contactUsSubjectLabel: 'Subject:',
        contactUsMessageLabel: 'Message:',
        contactUsSendMessageButton: 'Send Message',
        businessInfo: 'Business Information',
        editProfileButton: 'Edit Profile',
        profileEmailLabel: 'Email:',
        profilePhoneLabel: 'Phone:',
        profileBusinessNameLabel: 'Business Name:',
        profileAddressLabel: 'Address:',
        profileContactPersonLabel: 'Contact Person:',
        profileLegalDocsLabel: 'Legal Docs:',
        jobDescriptionTitle: 'Job Description',
        requirementsTitle: 'Requirements',
        clientWorkerPrompt: 'You are logged in as a client. To apply for or favorite jobs, you need a worker account. Would you like to log out and register as a worker?',
        clientWorkerPromptSpanish: 'Ha iniciado sesión como cliente. Para solicitar o marcar trabajos como favoritos, necesita una cuenta de trabajador. ¿Desea cerrar sesión y registrarse como trabajador?',
        backToJobFeed: 'Back to Job Feed',
        postJob: 'Post a Job',
        myJobPosts: 'My Job Posts',
        messages: 'Messages',
        settings: 'Settings',
        loginSuccess: 'Login successful!',
        loginFailed: 'Login failed. Please check your credentials.',
        registrationSuccess: 'Registration successful!',
        registrationFailed: 'Registration failed. Please try again.',
        passwordsMismatch: 'Passwords do not match!',
        favoriteButton: 'Favorite',
        detailsButton: 'Details',
        applyButton: 'Apply',
        userRoleLabel: 'User Role:',
        bankTypeLabel: 'Bank Type:',
        uploadProfilePhoto: 'Upload Profile Photo',
        invalidEmail: 'Please enter a valid email address.',
        invalidPhone: 'Please enter a valid phone number.',
        invalidPassword: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
        invalidUrl: 'Please enter a valid URL.',
        profileImageUpdated: 'Profile image updated successfully!',
        fillAllRequiredFields: 'Please fill in all required fields',
        profileIncomplete: 'Please complete your profile before posting a job.',
        editButton: 'Edit',
        cancelButton: 'Cancel',
        viewApplicationsButton: 'View Applications',
        dateOfBirthLabel: 'Date of Birth:',
        specialSkillsLabel: 'Special Skills:',
        reportJobButton: 'Report Job',
        reportJobModalTitle: 'Report Job',
        reportReasonLabel: 'Reason for reporting:',
        submitReportButton: 'Submit Report',
        applyForJobTitle: 'Apply for Job',
        selectShiftsPrompt: 'Select the shifts you want to apply for:',
        applyForShiftsButton: 'Apply for Selected Shifts',
        applicationSuccessMessage: 'You have successfully applied for the selected shifts!',
        selectOneShiftMessage: 'Please select at least one shift to apply for.',
        jobPostedSuccess: 'Job posted successfully!',
        footerAboutText: 'Connecting talent with opportunity in Nicaragua.',
        footerQuickLinks: 'Quick Links',
        footerLegalSupport: 'Legal & Support',
        footerFollowUs: 'Follow Us',
        footerCopyright: '&copy; 2025 <span class="brand-brete">brete</span><span class="brand-app">.app</span> All rights reserved.',
        statusLabel: 'Status:',
        Pending: 'Pending'
    },
    es: {
        jobs: 'Trabajos',
        footerAboutText: 'Conectando talento con oportunidad en Nicaragua.',
        footerQuickLinks: 'Enlaces Rápidos',
        footerLegalSupport: 'Legal y Soporte',
        footerFollowUs: 'Síguenos',
        footerCopyright: '&copy; 2025 <span class="brand-brete">brete</span><span class="brand-app">.app</span> Todos los derechos reservados.',
        statusLabel: 'Estado:',
        Pending: 'Pendiente',
        alreadyApplied: 'Ya has aplicado a este trabajo.',
        declineConfirmation: '¿Estás seguro de que quieres rechazar esta solicitud?',
        ratingLabel: 'Calificación:',
        feedbackHistoryLabel: 'Historial de Comentarios:',
        statisticsLabel: 'Estadísticas:',
        myProfile: 'Mi Perfil',
        login: 'Iniciar Sesión',
        register: 'Registrarse',
        heroHeading: 'Encuentra tu próximo trabajo flexible.',
        searchPlaceholder: 'Buscar por título, empresa o ciudad...', 
        searchButton: 'Buscar',
        previousDay: 'Día Anterior',
        nextDay: 'Día Siguiente',
        location: 'Ubicación:',
        wage: 'Salario:',
        hours: 'Horas:',
        hardRequirements: 'Requisitos Obligatorios:',
        noJobs: 'No hay trabajos disponibles para este día.',
        chooseRegistrationType: 'Elige Tipo de Registro',
        registerChambero: 'Registrarse como Trabajador',
        registerCliente: 'Registrarse como Cliente',
        registerChamberoTitle: 'Registrarse como Trabajador',
        registerClienteTitle: 'Registrarse como Cliente',
        emailLabel: 'Correo Electrónico:',
        passwordLabel: 'Contraseña:',
        confirmPasswordLabel: 'Confirmar Contraseña:',
        registerButton: 'Registrarse',
        alreadyHaveAccountAndLoginHere: '¿Ya tienes una cuenta? Inicia sesión aquí',
        businessNameLabel: 'Nombre de la Empresa:',
        addressLabel: 'Dirección:',
        phoneLabel: 'Número de Teléfono:',
        skillsLabel: 'Habilidades/Servicios Ofrecidos (ej. Diseño Web, Fontanería):',
        locationLabel: 'Ubicación (Ciudad/Departamento):',
        contactPersonLabel: 'Persona de Contacto (Nombre Oficial Completo):',
        legalDocsLabel: 'Documentos Legales (ej. Número de Licencia Comercial):',
        clienteRole: 'Cliente',
        clienteDescription: 'Contrata talento para tu negocio o proyectos.',
        registerClienteButton: 'Registrarse como Cliente',
        chamberoRole: 'Trabajador',
        chamberoDescription: 'Encuentra trabajos flexibles y gana dinero.',
        registerChamberoButton: 'Registrarse como Trabajador',
        loginTitle: 'Iniciar Sesión en <span class="brand-brete">brete</span><span class="brand-app">.app</span>',
        noAccountAndRegisterHere: "¿No tienes una cuenta? Regístrate aquí",
        chooseRolePrompt: 'Primero, dinos qué quieres hacer.',
        fullNameLabel: 'Nombre Completo:',
        contactInfo: 'Información de Contacto',
        contactUs: 'Contáctanos',
        contactUsTitle: 'Contáctanos',
        contactUsIntro: "¡Nos encantaría saber de ti! Por favor, contáctanos usando la información a continuación:",
        contactUsEmail: 'soporte@<span class="brand-brete">brete</span><span class="brand-app">.app</span>',
        contactUsPhone: '+505 8888-8888',
        contactUsAddress: '123 Calle de la Oportunidad, Managua, Nicaragua',
        contactUsFormIntro: "Alternativamente, puedes llenar el siguiente formulario y te responderemos lo antes posible.",
        contactUsNameLabel: 'Tu Nombre:',
        contactUsEmailLabel: 'Tu Correo Electrónico:',
        contactUsSubjectLabel: 'Asunto:',
        contactUsMessageLabel: 'Mensaje:',
        contactUsSendMessageButton: 'Enviar Mensaje',
        businessInfo: 'Información de Negocio',
        editProfileButton: 'Editar Perfil',
        profileEmailLabel: 'Correo Electrónico:',
        profilePhoneLabel: 'Teléfono:',
        profileBusinessNameLabel: 'Nombre de la Empresa:',
        profileAddressLabel: 'Dirección:',
        profileContactPersonLabel: 'Persona de Contacto:',
        profileLegalDocsLabel: 'Documentos Legales:',
        jobDescriptionTitle: 'Descripción del Trabajo',
        requirementsTitle: 'Requisitos',
        clientWorkerPrompt: 'Ha iniciado sesión como cliente. Para solicitar o marcar trabajos como favoritos, necesita una cuenta de trabajador. ¿Desea cerrar sesión y registrarse como trabajador?',
        clientWorkerPromptSpanish: 'Ha iniciado sesión como cliente. Para solicitar o marcar trabajos como favoritos, necesita una cuenta de trabajador. ¿Desea cerrar sesión y registrarse como trabajador?',
        backToJobFeed: 'Volver al Feed de Trabajos',
        postJob: 'Publicar Trabajo',
        myJobPosts: 'Mis Publicaciones de Trabajo',
        myApplications: 'Mis Postulaciones',
        messages: 'Mensajes',
        settings: 'Configuración',
        loginSuccess: '¡Inicio de sesión exitoso!',
        loginFailed: 'Inicio de sesión fallido. Por favor, verifica tus credenciales.',
        registrationSuccess: '¡Registro exitoso!',
        registrationFailed: 'Registro fallido. Por favor, inténtalo de nuevo.',
        passwordsMismatch: '¡Las contraseñas no coinciden!',
        favoriteButton: 'Favorito',
        detailsButton: 'Detalles',
        applyButton: 'Aplicar',
        userRoleLabel: 'Rol de Usuario:',
        bankTypeLabel: 'Tipo de Banco:',
        uploadProfilePhoto: 'Subir Foto de Perfil',
        invalidEmail: 'Por favor, introduce una dirección de correo electrónico válida.',
        invalidPhone: 'Por favor, introduce un número de teléfono válido.',
        invalidPassword: 'La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas, un número y un carácter especial.',
        invalidUrl: 'Por favor, introduce una URL válida.',
        profileImageUpdated: '¡Imagen de perfil actualizada exitosamente!',
        fillAllRequiredFields: 'Por favor, rellena todos los campos obligatorios',
        profileIncomplete: 'Por favor, completa tu perfil antes de publicar un trabajo.',
        editButton: 'Editar',
        cancelButton: 'Cancelar',
        viewApplicationsButton: 'Ver Aplicaciones',
        dateOfBirthLabel: 'Fecha de Nacimiento:',
        specialSkillsLabel: 'Habilidades Especiales:',
        reportJobButton: 'Reportar Trabajo',
        reportJobModalTitle: 'Reportar Trabajo',
        reportReasonLabel: 'Razón para reportar:',
        submitReportButton: 'Enviar Reporte',
        applyForJobTitle: 'Aplicar para Trabajo',
        selectShiftsPrompt: 'Selecciona los turnos a los que quieres aplicar:',
        applyForShiftsButton: 'Aplicar a los Turnos Seleccionados',
        applicationSuccessMessage: '¡Has aplicado exitosamente a los turnos seleccionados!',
        selectOneShiftMessage: 'Por favor, selecciona al menos un turno para aplicar.',
        jobPostedSuccess: '¡Trabajo publicado exitosamente!',
        Pending: 'Pendiente',
        postJobTitle: 'Publicar un Nuevo Trabajo',
        jobImageLabel: 'Imagen del Trabajo: *',
        jobImageHint: 'Esta imagen se mostrará en la tarjeta de trabajo en el feed principal.',
        removeImageButton: 'Eliminar Imagen',
        jobTitleLabel: 'Título del Trabajo: *',
        jobTitlePlaceholder: 'Ej. Limpieza de Hogar',
        jobDescriptionLabel: 'Descripción: *',
        jobDescriptionPlaceholder: 'Ej. Limpieza general de casa, incluye cocina y baños.',
        jobLocationLabel: 'Ubicación (Ciudad): *',
        selectCityPlaceholder: 'Seleccione una ciudad',
        exactAddressLabel: 'Dirección Exacta: *',
        exactAddressPlaceholder: 'Ej. Calle Principal #123, Barrio Central',
        exactAddressHint: 'Esta ubicación solo será visible para los trabajadores una vez que su solicitud de empleo sea aprobada.',
        jobWageLabel: 'Salario (por hora): *',
        jobHoursStartLabel: 'Hora de Inicio: *',
        jobHoursEndLabel: 'Hora de Fin: *',
        jobDatesLabel: 'Fechas del Trabajo: *',
        jobDatesPlaceholder: 'ej., 2025-07-01, 2025-07-05',
        jobRequirementsLabel: 'Requisitos (separados por comas): *',
        jobRequirementsPlaceholder: 'ej., Botas de trabajo, Licencia de conducir, Certificado de primeros auxilios',
        contactPhoneLabel: 'Número de Contacto: *',
        contactPhonePlaceholder: 'Ej. +505 8888-8888',
        digitalContractHint: 'Al publicar un trabajo, aceptas nuestro <a href="digital-contract.html" target="_blank">Contrato Digital</a>.',
        postJobButton: 'Publicar Trabajo'
    }
};

let currentLang = 'es';

let jobs = [];
let currentUser = null;


async function initializeJobs() {
    const { data, error } = await supabase.from('jobs').select('id');
    if (error) {
        console.error('Error checking for existing jobs:', error);
        return;
    }

    if (data.length === 0) {
        const defaultJobs = [
            {
                title: 'Desarrollador Web Junior',
                company: 'Soluciones Creativas',
                description: 'Ayudar a construir y mantener sitios web de clientes utilizando tecnologías web modernas.',
                date: ['2025-07-01'],
                location: 'Managua',
                exact_address: 'Calle Principal #123, Barrio Central',
                contact_phone: '+505 8888-8888',
                wage_amount: 15,
                wage_currency: 'USD',
                hours_start: '10:00',
                hours_end: '18:00',
                requirements: ['HTML', 'CSS', 'JavaScript', 'Git Básico'],
                image_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
            },
            {
                title: 'Asistente de Redes Sociales',
                company: 'Café Las Flores',
                description: 'Gestionar el contenido y la interacción en redes sociales para una cafetería local.',
                date: ['2025-07-01'],
                location: 'León',
                exact_address: 'Avenida Central, Edificio 456',
                contact_phone: '+505 7777-7777',
                wage_amount: 360,
                wage_currency: 'NIO',
                hours_start: '08:00',
                hours_end: '12:00',
                requirements: ['Creación de Contenido', 'Gestión de Comunidad', 'Instagram'],
                image_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
            },
        ];
        const { error: insertError } = await supabase.from('jobs').insert(defaultJobs);
        if (insertError) {
            console.error('Error inserting default jobs:', insertError);
        }
    }
}

initializeJobs();

let currentDisplayDate = new Date();

function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export async function addMessage(recipientEmail, subject, body) {
    const { data: recipientProfile, error: recipientError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', recipientEmail)
        .single();

    if (recipientError || !recipientProfile) {
        console.error('Error finding recipient for message:', recipientError);
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('messages').insert([
        {
            sender_id: user.id,
            recipient_id: recipientProfile.id,
            subject: subject,
            body: body,
        }
    ]);

    if (error) {
        console.error('Error sending message:', error);
    }
}

export function displayMessage(message, type) {
    const messageContainer = document.getElementById('message-display');
    if (messageContainer) {
        messageContainer.textContent = message;
        messageContainer.className = `message-container show ${type}-message`;
        setTimeout(() => {
            messageContainer.classList.remove('show');
        }, 3000);
    }
}

function updateContent() {
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        if (translations[currentLang][key]) {
            if (element.tagName === 'INPUT') {
                element.placeholder = translations[currentLang][key];
            } else if (element.getAttribute('data-key') === 'loginTitle') {
                element.innerHTML = translations[currentLang][key];
            } else {
                element.textContent = translations[currentLang][key];
            }
        }
    });
    // Special handling for footer copyright to render HTML entity
    const footerCopyrightElement = document.querySelector('[data-key="footerCopyright"]');
    if (footerCopyrightElement) {
        footerCopyrightElement.innerHTML = translations[currentLang].footerCopyright;
    }
    if (document.getElementById('jobs-feed')) {
        displayJobsForDate(currentDisplayDate);
    }

    // Explicitly style the form links to ensure they appear as hyperlinks
    document.querySelectorAll('p.form-link a').forEach(link => {
        link.style.textDecoration = 'underline';
        link.style.color = 'blue'; // Or any other distinct color
    });
}

function truncateText(text, maxLength) {
    if (text && text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text || '';
}

export async function createJobCard(job, context = 'default') {
    const truncatedDescription = truncateText(job.description, 100); // Truncate description to 100 characters
    const truncatedTitle = truncateText(job.title, 50); // Truncate title to 50 characters
    const truncatedCompany = truncateText(job.company, 30); // Truncate company to 30 characters
    const jobCard = document.createElement('div');
    jobCard.classList.add('job-card');
    jobCard.dataset.jobId = job.id;

    let wageFormatted = 'N/A'; // Default value
    if (job.wage_amount && job.wage_currency) {
        wageFormatted = new Intl.NumberFormat(currentLang === 'en' ? 'en-US' : 'es-NI', {
            style: 'currency',
            currency: job.wage_currency,
            minimumFractionDigits: 2,
        }).format(job.wage_amount);
    }

    let actionsHtml = '';
    if (context === 'client-view') {
        actionsHtml = `
            <div class="job-card-actions">
                <button class="btn btn-danger" style="background-color: white; color: black;" onclick="cancelJob('${job.id}')">${translations[currentLang].cancelButton}</button>
                <button class="btn btn-primary" onclick="window.location.href='job-applications.html?id=${job.id}'">${translations[currentLang].viewApplicationsButton}</button>
            </div>
        `;
    } else {
        const { data: { user } } = await supabase.auth.getUser();
        let currentUser = null;
        if (user) {
                        const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('email', user.email).single();
            if (profileError) {
                console.error('Error fetching current user profile:', profileError);
            } else {
                currentUser = profile;
            }
        }
        const { data: applications, error: applicationsError } = await supabase.from('applications').select('*');
            if (error) {
            console.error('Error fetching applications:', applicationsError);
            return [];
        }
        let hasApplied = false;
        if (currentUser && currentUser.role === 'trabajador') {
            hasApplied = applications.some(app => app.jobId === job.id && app.worker_id === currentUser.id);
        }

        let applyButtonHtml = '';
        if (hasApplied) {
            applyButtonHtml = `<button class="btn btn-primary applied" disabled style="background-color: white; color: black; border: 1px solid black;">${translations[currentLang].alreadyApplied}</button>`;
        } else {
            applyButtonHtml = `<button class="btn btn-primary" data-key="applyButton">${translations[currentLang].applyButton}</button>`;
        }

        actionsHtml = `
            <div class="job-card-actions">
                <button class="btn btn-secondary btn-favorite"><i class="far fa-heart"></i></button>
                <button class="btn btn-secondary" data-key="detailsButton">${translations[currentLang].detailsButton}</button>
                ${applyButtonHtml}
            </div>
        `;
    }

    jobCard.innerHTML = `
        <img src="${job.image_url || 'images/default-profile.svg'}" alt="${job.title}" class="job-card-image">
        <div class="job-card-content">
            <h3 class="job-card-title">${truncatedTitle}</h3>
            <p class="job-card-company">${truncatedCompany}</p>
            
            <div class="job-card-details">
                <div class="detail-item"><i class="fas fa-map-marker-alt"></i> ${job.location}</div>
                ${job.is_approved ? `<div class="detail-item"><i class="fas fa-map-pin"></i> ${job.exact_address}</div>` : ''}
                ${job.is_approved ? `<div class="detail-item"><i class="fas fa-phone"></i> ${job.contact_phone}</div>` : ''}
                <div class="detail-item"><i class="fas fa-money-bill-wave"></i> ${wageFormatted}/hora</div>
                <div class="detail-item"><i class="fas fa-clock"></i> ${job.hours_start} - ${job.hours_end}</div>
                <div class="detail-item"><i class="fas fa-calendar-alt"></i> ${job.date}</div>
            </div>
            <div class="job-card-tags">
                ${(Array.isArray(job.requirements) ? job.requirements : (job.requirements || '').replace(/[[\]]/g, '').split(',')).map(req => `<span class="tag">${req.trim()}</span>`).join('')}
            </div>
            ${actionsHtml}
        </div>
    `;
    return jobCard;
}

export async function cancelJob(jobId) {
    if (confirm('Are you sure you want to cancel this job?')) {
        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', jobId);

        if (error) {
            console.error('Error canceling job:', error);
            displayMessage('Error canceling job.', 'error');
        } else {
            displayMessage('Job cancelled successfully!', 'success');
            location.reload();
        }
    }
}


async function displayJobsForDate(date, filteredJobs = null) {
    console.log("displayJobsForDate called");
    const formattedDate = formatDate(date);

    let jobsToDisplay = [];

    if (filteredJobs) {
        jobsToDisplay = filteredJobs;
    } else {
        const { data, error } = await supabase.from('jobs').select('*').contains('date', [formattedDate]);
        if (error) {
            console.error('Error fetching jobs:', error);
        } else {
            jobsToDisplay = data;
        }
    }

    if (currentDateDisplay) {
        currentDateDisplay.textContent = date.toLocaleDateString(currentLang === 'en' ? 'en-US' : 'es-ES', { month: 'long', day: 'numeric' });
    }

    if (jobsFeed) {
        jobsFeed.innerHTML = '';

        if (jobsToDisplay.length === 0) {
            const noJobsMessage = document.createElement('p');
            noJobsMessage.textContent = translations[currentLang].noJobs;
            jobsFeed.appendChild(noJobsMessage);
        } else {
            jobsToDisplay.forEach(job => {
                const jobCard = createJobCard(job);
                jobsFeed.appendChild(jobCard);
            });
        }
    }
}

function navigateDay(direction) {
    currentDisplayDate.setDate(currentDisplayDate.getDate() + direction);
    updateContent();
}

if (prevDayButton) {
    prevDayButton.addEventListener('click', () => navigateDay(-1));
}
if (nextDayButton) {
    nextDayButton.addEventListener('click', () => navigateDay(1));
}

// Search functionality
if (searchButton) {
    searchButton.addEventListener('click', performSearch);
}

if (searchInput) {
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
}

function performSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredJobs = jobs.filter(job => {
        return job.title.toLowerCase().includes(searchTerm) ||
               job.company.toLowerCase().includes(searchTerm) ||
               job.location.toLowerCase().includes(searchTerm) ||
               job.requirements.some(req => req.toLowerCase().includes(searchTerm));
    });
    displayJobsForDate(currentDisplayDate, filteredJobs); // Pass filtered jobs to display
}

// Form Submissions
const loginForm = document.getElementById('login-form');
const registerTrabajadorForm = document.getElementById('register-trabajador-form');
const registerClienteForm = document.getElementById('register-cliente-form');
const postJobForm = document.getElementById('post-job-form');

if (loginForm) {
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            displayMessage(translations[currentLang].loginFailed, 'error');
        } else {
            displayMessage(translations[currentLang].loginSuccess, 'success');
            updateNavigationVisibility();
            window.location.href = 'index.html';
        }
    });
}

if (registerTrabajadorForm) {
    registerTrabajadorForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const fullName = document.getElementById('full-name').value;

        if (password !== confirmPassword) {
            displayMessage(translations[currentLang].passwordsMismatch, 'error');
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    role: 'trabajador'
                }
            }
        });

        if (error) {
            displayMessage(translations[currentLang].registrationFailed, 'error');
        } else {
            displayMessage(translations[currentLang].registrationSuccess, 'success');
            updateNavigationVisibility();
            window.location.href = 'index.html';
        }
    });
}

if (registerClienteForm) {
    registerClienteForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const businessName = document.getElementById('business-name').value;
        const contactPerson = document.getElementById('contact-person').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        const legalDocs = document.getElementById('legal-docs').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            displayMessage(translations[currentLang].passwordsMismatch, 'error');
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    business_name: businessName,
                    contact_person: contactPerson,
                    phone: phone,
                    address: address,
                    legal_docs: legalDocs,
                    role: 'cliente'
                }
            }
        });

        if (error) {
            displayMessage(translations[currentLang].registrationFailed, 'error');
        } else {
            displayMessage(translations[currentLang].registrationSuccess, 'success');
            updateNavigationVisibility();
            window.location.href = 'index.html';
        }
    });
}

const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        // In a real application, you would send this data to a server
        console.log('Contact form submitted!');
        console.log('Name:', document.getElementById('name').value);
        console.log('Email:', document.getElementById('email').value);
        console.log('Subject:', document.getElementById('subject').value);
        console.log('Message:', document.getElementById('message').value);

        displayMessage('Your message has been sent!', 'success');
        contactForm.reset(); // Clear the form
    });
}

        async function checkProfileCompletion() {
    const { data: { user } } = await supabase.auth.getUser();
    let currentUser = null;
    if (user) {
        const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profileError) {
            console.error('Error fetching current user profile:', profileError);
        } else {
            currentUser = profile;
        }
    }
    if (!currentUser) {
        // If no user is logged in, they can't post a job anyway
        return true;
    }

    let isComplete = true;
    let missingFields = [];

    // Check common required fields
    if (!currentUser.email) {
        missingFields.push(translations[currentLang].profileEmailLabel);
        isComplete = false;
    }
    if (!currentUser.phone) {
        missingFields.push(translations[currentLang].profilePhoneLabel);
        isComplete = false;
    }

    if (currentUser.role === 'cliente') {
        if (!currentUser.businessName) {
            missingFields.push(translations[currentLang].profileBusinessNameLabel);
            isComplete = false;
        }
        if (!currentUser.address) {
            missingFields.push(translations[currentLang].profileAddressLabel);
            isComplete = false;
        }
        if (!currentUser.contactPerson) {
            missingFields.push(translations[currentLang].profileContactPersonLabel);
            isComplete = false;
        }
        if (!currentUser.legalDocs) {
            missingFields.push(translations[currentLang].profileLegalDocsLabel);
            isComplete = false;
        }
        if (!currentUser.taxId) {
            missingFields.push(translations[currentLang].taxIdLabel);
            isComplete = false;
        }
        if (!currentUser.bankNameCliente) {
            missingFields.push(translations[currentLang].bankNameLabel);
            isComplete = false;
        }
        if (!currentUser.accountNumberCliente) {
            missingFields.push(translations[currentLang].accountNumberLabel);
            isComplete = false;
        }
    } else if (currentUser.role === 'trabajador') {
        if (!currentUser.idNumber) {
            missingFields.push(translations[currentLang].idNumberLabel);
            isComplete = false;
        }
        if (!currentUser.bankNameTrabajador) {
            missingFields.push(translations[currentLang].bankNameLabel);
            isComplete = false;
        }
        if (!currentUser.accountNumberTrabajador) {
            missingFields.push(translations[currentLang].accountNumberLabel);
            isComplete = false;
        }
        if (!currentUser.resumeUrl) {
            missingFields.push(translations[currentLang].resumeLabel);
            isComplete = false;
        }
    }

    if (!isComplete) {
        displayMessage(`${translations[currentLang].profileIncomplete} ${missingFields.join(', ')}.`, 'error');
        setTimeout(() => { window.location.href = 'profile.html'; }, 1500);
        return false;
    }
    return true;
}

        if (postJobForm) {
    // ... (rest of the postJobForm event listener)

    postJobForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            displayMessage('You must be logged in to post a job.', 'error');
            return;
        }

        const jobTitle = document.getElementById('job-title').value;
        const jobDescription = document.getElementById('job-description').value;
        const jobLocation = document.getElementById('job-location').value;
        const jobExactAddress = document.getElementById('job-exact-address').value;
        const jobWageAmount = document.getElementById('job-wage-amount');
        const jobWageCurrency = document.getElementById('job-wage-currency');
        const jobWage = parseFloat(jobWageAmount.value);
        const jobCurrency = jobWageCurrency.value;
        const jobHoursStart = document.getElementById('job-hours-start').value;
        const jobHoursEnd = document.getElementById('job-hours-end').value;
        const jobDates = document.getElementById('selected-job-dates').value.split(',').map(date => date.trim()).filter(date => date !== '');
        const jobRequirements = document.getElementById('job-requirements').value.split(',').map(req => req.trim()).filter(req => req !== '');
        const contactPhone = document.getElementById('contact-phone').value;
        const jobImageInput = document.getElementById('job-image');
        const jobImageFile = jobImageInput.files[0];

        let imageUrl = '';
        if (jobImageFile) {
            const { data, error } = await supabase.storage.from('job-images').upload(`${user.id}/${Date.now()}_${jobImageFile.name}`, jobImageFile);
            if (error) {
                console.error('Error uploading image:', error);
            } else {
                imageUrl = data.path;
            }
        }

        const { data: profileData, error: profileError } = await supabase.from('profiles').select('business_name').eq('id', user.id).single();

        if (profileError || !profileData) {
            displayMessage('You must be a client with a business name to post a job.', 'error');
            return;
        }

        const jobToSave = {
            title: jobTitle,
            company: profileData.business_name,
            description: jobDescription,
            date: jobDates,
            location: jobLocation,
            exact_address: jobExactAddress,
            contact_phone: contactPhone,
            wage_amount: jobWage,
            wage_currency: jobCurrency,
            hours_start: jobHoursStart,
            hours_end: jobHoursEnd,
            requirements: jobRequirements,
            image_url: imageUrl,
            is_approved: true,
            client_id: user.id
        };

        const { error } = await supabase.from('jobs').insert([jobToSave]);

        if (error) {
            displayMessage('Error posting job.', 'error');
        } else {
            displayMessage(translations[currentLang].jobPostedSuccess, 'success');
            postJobForm.reset();
            setTimeout(() => { window.location.href = `client-applications.html`; }, 1000);
        }
    });
}

// Job Card Button Actions
if (jobsFeed) { // Only add listeners if jobsFeed exists (i.e., on index.html)
    jobsFeed.addEventListener('click', async (event) => {
        const target = event.target;
        // Check if the clicked element or its parent is a button
        const button = target.closest('button');

        if (button) {
            const isLoggedIn = await checkLoginStatus();
            const { data: { user } } = await supabase.auth.getUser();
            let currentUser = null;
            if (user) {
                            const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('email', user.email).single();
                if (profileError) {
                    console.error('Error fetching current user profile:', profileError);
                } else {
                    currentUser = profile;
                }
            }
            const isTrabajador = isLoggedIn && currentUser && currentUser.role === 'trabajador';

            const jobCard = button.closest('.job-card');
            const jobId = jobCard ? jobCard.dataset.jobId : 'unknown';
            const action = button.dataset.key;

            if (action === 'detailsButton') {
                window.location.href = `job-details.html?id=${jobId}`;
            } else if (action === 'applyButton' || button.classList.contains('btn-favorite')) {
                const isLoggedIn = await checkLoginStatus();
                const { data: { user } } = await supabase.auth.getUser();
                let currentUser = null;
                if (user) {
                                const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('email', user.email).single();
                    if (profileError) {
                        console.error('Error fetching current user profile:', profileError);
                    } else {
                        currentUser = profile;
                    }
                }
                const isTrabajador = isLoggedIn && currentUser && currentUser.role === 'trabajador';

                if (isLoggedIn && currentUser.role === 'cliente') {
                    const confirmationMessage = currentLang === 'es' ? translations[currentLang].clientWorkerPromptSpanish : translations[currentLang].clientWorkerPrompt;
                    if (confirm(confirmationMessage)) {
                        handleLogout(event, 'register-trabajador.html');
                    }
                    return; // Stop further execution if client cancels or proceeds with logout
                }

                if (!isTrabajador) {
                    displayMessage('Please register as a worker to apply for or favorite jobs.', 'error');
                    setTimeout(() => { window.location.href = 'register-trabajador.html'; }, 1500);
                    return;
                }

                // Existing logic for apply and favorite buttons for workers
                if (action === 'applyButton') {
                    window.location.href = `apply.html?id=${jobId}`;
                } else if (button.classList.contains('btn-favorite')) {
                    button.classList.toggle('favorited');
                    const icon = button.querySelector('i');
                    if (button.classList.contains('favorited')) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                        console.log(`Job ID: ${jobId} favorited!`);
                    } else {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                        console.log(`Job ID: ${jobId} unfavorited.`);
                    }
                }
            }
        }
    });
}

// Make navigation links responsive (existing code - adjusted for direct navigation)
        // Make navigation links responsive (existing code - adjusted for direct navigation)
document.querySelectorAll('.main-nav a').forEach(link => {
    link.addEventListener('click', function(event) {
        // Prevent default only if it's a placeholder link (e.g., #)
        if (this.getAttribute('href') === '#') {
            event.preventDefault();
            console.log(`Navigating to: ${this.textContent}`);
        } else {
            console.log(`Attempting to navigate to: ${this.getAttribute('href')}`);
            // Allow default navigation for actual links
        }
        // Update active class for navigation (optional, can be handled by server-side or more complex JS)
        document.querySelectorAll('.main-nav a').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
    });
});