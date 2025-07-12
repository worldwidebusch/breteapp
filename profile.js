import { supabase } from './supabase-client.js';
import { translations, currentLang } from './script.js';

// Function to display messages (e.g., success or error)
function displayMessage(message, type) {
    let messageContainer = document.getElementById('message-display');
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'message-display';
        messageContainer.classList.add('message-container');
        document.body.prepend(messageContainer); // Add to the top of the body
    }
    messageContainer.textContent = message;
    messageContainer.className = `message-container show ${type}-message`;
    setTimeout(() => {
        messageContainer.classList.remove('show');
    }, 3000);
}

function isValidEmail(email) {
    // Basic email validation regex
    const emailRegex = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Basic phone validation regex (allows digits, spaces, hyphens, and plus sign)
    const phoneRegex = /^[\d\s\-\+]+$/;
    return phoneRegex.test(phone);
}

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        displayMessage('You must be logged in to view your profile.', 'error');
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        return;
    }

    const { data: currentUser, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .single();

    if (error || !currentUser) {
        console.error('Error fetching user profile:', error);
        displayMessage('Error loading profile.', 'error');
        return;
    }

    const profileNameView = document.getElementById('profile-name-view');
    const profileNameEdit = document.getElementById('profile-name-edit');
    const profileRole = document.getElementById('profile-role');
    const editProfileButton = document.getElementById('edit-profile-button');
    const saveProfileButton = document.getElementById('save-profile-button');
    const cancelEditButton = document.getElementById('cancel-edit-button');

    // Contact Info Elements
    const contactInfoCard = document.querySelector('.contact-info-card');
    const profileEmailView = document.getElementById('profile-email-view');
    const profilePhoneView = document.getElementById('profile-phone-view');
    const profileEmailEdit = document.getElementById('profile-email-edit');
    const profilePhoneEdit = document.getElementById('profile-phone-edit');

    // Cliente Details Elements
    const clienteDetailsCard = document.getElementById('cliente-details');
    const profileBusinessNameView = document.getElementById('profile-business-name-view');
    const profileAddressView = document.getElementById('profile-address-view');
    const profileContactPersonView = document.getElementById('profile-contact-person-view');
    const profileLegalDocsView = document.getElementById('profile-legal-docs-view');
    const profileTaxIdView = document.getElementById('profile-tax-id-view');
    const profileBankNameClienteView = document.getElementById('profile-bank-name-cliente-view');
    const profileAccountTypeClienteView = document.getElementById('profile-account-type-cliente-view');
    const profileAccountNumberClienteView = document.getElementById('profile-account-number-cliente-view');

    const profileBusinessNameEdit = document.getElementById('profile-business-name-edit');
    const profileAddressEdit = document.getElementById('profile-address-edit');
    const profileContactPersonEdit = document.getElementById('profile-contact-person-edit');
    const profileLegalDocsEdit = document.getElementById('profile-legal-docs-edit');
    const profileTaxIdEdit = document.getElementById('profile-tax-id-edit');
    const profileBankNameClienteEdit = document.getElementById('profile-bank-name-cliente-edit');
    const profileUserRoleClienteEdit = document.getElementById('profile-user-role-cliente-edit');
    const profileBankTypeClienteEdit = document.getElementById('profile-bank-type-cliente-edit');
    const profileAccountNumberClienteEdit = document.getElementById('profile-account-number-cliente-edit');

    // Trabajador Details Elements
    const trabajadorDetailsCard = document.getElementById('trabajador-details');
    const profileIdNumberView = document.getElementById('profile-id-number-view');
    const profileDobView = document.getElementById('profile-dob-view');
    const profileBirthplaceView = document.getElementById('profile-birthplace-view');
    const profileEmergencyContactPhoneView = document.getElementById('profile-emergency-contact-phone-view');
    const profileBankNameTrabajadorView = document.getElementById('profile-bank-name-trabajador-view');
    const profileAccountTypeTrabajadorView = document.getElementById('profile-account-type-trabajador-view');
    const profileAccountNumberTrabajadorView = document.getElementById('profile-account-number-trabajador-view');
    const profileResumeLinkView = document.getElementById('profile-resume-link-view');

    const profileFullNameEdit = document.getElementById('profile-full-name-edit');
    const profileIdNumberEdit = document.getElementById('profile-id-number-edit');
    const profileDobEdit = document.getElementById('profile-dob-edit');
    const profileBirthplaceEdit = document.getElementById('profile-birthplace-edit');
    const profileEmergencyContactPhoneEdit = document.getElementById('profile-emergency-contact-phone-edit');
    const profileBankNameTrabajadorEdit = document.getElementById('profile-bank-name-trabajador-edit');
    const profileUserRoleTrabajadorEdit = document.getElementById('profile-user-role-trabajador-edit');
    const profileBankTypeTrabajadorEdit = document.getElementById('profile-bank-type-trabajador-edit');
    const profileAccountNumberTrabajadorEdit = document.getElementById('profile-account-number-trabajador-edit');
    const profileResumeLinkEdit = document.getElementById('profile-resume-link-edit');

    // Profile Image Upload Elements
    const profileAvatar = document.getElementById('profile-avatar');
    const profileImage = document.getElementById('profile-image');
    const profileIcon = document.getElementById('profile-icon');
    const profileImageUpload = document.getElementById('profile-image-upload');
    const profileUploadPrompt = document.getElementById('profile-upload-prompt');

    async function displayProfile() {
        if (profileNameView) profileNameView.textContent = currentUser.name;
        if (profileRole) profileRole.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
        
        // Display profile image or default icon and prompt
        if (currentUser.profile_image_url) {
            if (profileImage) {
                profileImage.src = currentUser.profile_image_url;
                profileImage.style.display = 'block';
            }
            if (profileIcon) profileIcon.style.display = 'none';
            if (profileUploadPrompt) profileUploadPrompt.style.display = 'none';
        } else {
            if (profileImage) profileImage.style.display = 'none';
            if (profileIcon) profileIcon.style.display = 'block';
            if (profileUploadPrompt) profileUploadPrompt.style.display = 'block';
        }

        // Contact Info
        if (profileEmailView) profileEmailView.textContent = currentUser.email;
        if (profilePhoneView) profilePhoneView.textContent = currentUser.phone;

        // Cliente Details
        if (currentUser.role === 'cliente') {
            if (clienteDetailsCard) clienteDetailsCard.style.display = 'block';
            if (profileBusinessNameView) profileBusinessNameView.textContent = currentUser.business_name;
            if (profileAddressView) profileAddressView.textContent = currentUser.address;
            if (profileContactPersonView) profileContactPersonView.textContent = currentUser.contact_person;
            if (profileLegalDocsView) profileLegalDocsView.textContent = currentUser.legal_docs;
            if (profileTaxIdView) profileTaxIdView.textContent = currentUser.tax_id;
            if (profileBankNameClienteView) profileBankNameClienteView.textContent = currentUser.bank_name_cliente;
            if (profileAccountTypeClienteView) profileAccountTypeClienteView.textContent = currentUser.account_type_cliente;
            if (profileAccountNumberClienteView) profileAccountNumberClienteView.textContent = currentUser.account_number_cliente;
        } else {
            if (clienteDetailsCard) clienteDetailsCard.style.display = 'none';
        }

        // Trabajador Details
        if (currentUser.role === 'trabajador') {
            if (trabajadorDetailsCard) trabajadorDetailsCard.style.display = 'block';
            if (profileIdNumberView) profileIdNumberView.textContent = currentUser.id_number;
            if (profileDobView) profileDobView.textContent = currentUser.date_of_birth;
            if (profileSkillsView) profileSkillsView.textContent = currentUser.special_skills.join(', ');
            if (profileBankNameTrabajadorView) profileBankNameTrabajadorView.textContent = currentUser.bank_name_trabajador;
            if (profileAccountTypeTrabajadorView) profileAccountTypeTrabajadorView.textContent = currentUser.account_type_trabajador;
            if (profileAccountNumberTrabajadorView) profileAccountNumberTrabajadorView.textContent = currentUser.account_number_trabajador;
            if (profileResumeLinkView) {
                profileResumeLinkView.href = currentUser.resume_url;
                profileResumeLinkView.textContent = currentUser.resume_url ? 'View Resume' : 'N/A';
            }
        } else {
            if (trabajadorDetailsCard) trabajadorDetailsCard.style.display = 'none';
        }
    }

    async function toggleEditMode(cardElement, isEditing) {
        const viewMode = cardElement.querySelector('.view-mode');
        const editMode = cardElement.querySelector('.edit-mode');
        const editButton = cardElement.querySelector('.edit-card-button');
        const saveButton = cardElement.querySelector('.save-card-button');
        const cancelButton = cardElement.querySelector('.cancel-card-button');

        if (viewMode && editMode) {
            if (isEditing) {
                viewMode.classList.add('hidden');
                editMode.classList.remove('hidden');
                if (editButton) editButton.classList.add('hidden');
                if (saveButton) saveButton.textContent = translations[currentLang].saveButton;
                if (cancelButton) cancelButton.textContent = translations[currentLang].cancelButton;
            } else {
                viewMode.classList.remove('hidden');
                editMode.classList.add('hidden');
                if (editButton) {
                    editButton.classList.remove('hidden');
                    editButton.innerHTML = `<i class="fas fa-edit"></i> ${translations[currentLang].editButton}`;
                }
            }
        }

        // Populate edit fields with current data when entering edit mode
        if (isEditing) {
            if (cardElement.classList.contains('contact-info-card')) {
                if (profileEmailEdit) profileEmailEdit.value = currentUser.email;
                if (profilePhoneEdit) profilePhoneEdit.value = currentUser.phone;
            } else if (cardElement.classList.contains('cliente-details-card')) {
                if (profileBusinessNameEdit) profileBusinessNameEdit.value = currentUser.business_name;
                if (profileAddressEdit) profileAddressEdit.value = currentUser.address;
                if (profileContactPersonEdit) profileContactPersonEdit.value = currentUser.contact_person;
                if (profileLegalDocsEdit) profileLegalDocsEdit.value = currentUser.legal_docs;
                if (profileTaxIdEdit) profileTaxIdEdit.value = currentUser.tax_id;
                if (profileBankNameClienteEdit) profileBankNameClienteEdit.value = currentUser.bank_name_cliente;
                if (profileAccountNumberClienteEdit) profileAccountNumberClienteEdit.value = currentUser.account_number_cliente;
            } else if (cardElement.classList.contains('trabajador-details-card')) {
                if (profileFullNameEdit) profileFullNameEdit.value = currentUser.full_name;
                if (profileIdNumberEdit) profileIdNumberEdit.value = currentUser.id_number;
                if (profileDobEdit) profileDobEdit.value = currentUser.date_of_birth;
                if (profileBirthplaceEdit) profileBirthplaceEdit.value = currentUser.birthplace;
                if (profileEmergencyContactPhoneEdit) profileEmergencyContactPhoneEdit.value = currentUser.emergency_contact_phone;
                if (profileBankNameTrabajadorEdit) profileBankNameTrabajadorEdit.value = currentUser.bank_name_trabajador;
                if (profileAccountTypeTrabajadorEdit) profileAccountTypeTrabajadorEdit.value = currentUser.account_type_trabajador;
                if (profileAccountNumberTrabajadorEdit) profileAccountNumberTrabajadorEdit.value = currentUser.account_number_trabajador;
                if (profileResumeLinkEdit) profileResumeLinkEdit.value = currentUser.resume_url;
            }
        }
    }

    async function saveCardChanges(cardElement) {
        // Validate all required fields before saving
        if (!validateProfile()) {
            return; // Stop if validation fails
        }

        let updatedProfile = {};

        if (cardElement.classList.contains('contact-info-card')) {
            const newEmail = profileEmailEdit ? profileEmailEdit.value : currentUser.email;
            const newPhone = profilePhoneEdit ? profilePhoneEdit.value : currentUser.phone;

            if (!isValidEmail(newEmail)) {
                displayMessage(translations[currentLang].invalidEmail, 'error');
                return;
            }
            if (!isValidPhone(newPhone)) {
                displayMessage(translations[currentLang].invalidPhone, 'error');
                return;
            }
            updatedProfile = { email: newEmail, phone: newPhone };
        } else if (cardElement.classList.contains('cliente-details-card')) {
            updatedProfile = {
                business_name: profileBusinessNameEdit ? profileBusinessNameEdit.value : currentUser.business_name,
                address: profileAddressEdit ? profileAddressEdit.value : currentUser.address,
                contact_person: profileContactPersonEdit ? profileContactPersonEdit.value : currentUser.contact_person,
                legal_docs: profileLegalDocsEdit ? profileLegalDocsEdit.value : currentUser.legal_docs,
                tax_id: profileTaxIdEdit ? profileTaxIdEdit.value : currentUser.tax_id,
                bank_name_cliente: profileBankNameClienteEdit ? profileBankNameClienteEdit.value : currentUser.bank_name_cliente,
                account_number_cliente: profileAccountNumberClienteEdit ? profileAccountNumberClienteEdit.value : currentUser.account_number_cliente,
            };
        } else if (cardElement.classList.contains('trabajador-details-card')) {
            updatedProfile = {
                full_name: profileFullNameEdit ? profileFullNameEdit.value : currentUser.full_name,
                id_number: profileIdNumberEdit ? profileIdNumberEdit.value : currentUser.id_number,
                date_of_birth: profileDobEdit ? profileDobEdit.value : currentUser.date_of_birth,
                birthplace: profileBirthplaceEdit ? profileBirthplaceEdit.value : currentUser.birthplace,
                emergency_contact_phone: profileEmergencyContactPhoneEdit ? profileEmergencyContactPhoneEdit.value : currentUser.emergency_contact_phone,
                bank_name_trabajador: profileBankNameTrabajadorEdit ? profileBankNameTrabajadorEdit.value : currentUser.bank_name_trabajador,
                account_type_trabajador: profileAccountTypeTrabajadorEdit ? profileAccountTypeTrabajadorEdit.value : currentUser.account_type_trabajador,
                account_number_trabajador: profileAccountNumberTrabajadorEdit ? profileAccountNumberTrabajadorEdit.value : currentUser.account_number_trabajador,
                resume_url: profileResumeLinkEdit ? profileResumeLinkEdit.value : currentUser.resume_url,
            };
        }

        const { error } = await supabase
            .from('profiles')
            .update(updatedProfile)
            .eq('id', user.id);

        if (error) {
            console.error('Error updating profile:', error);
            displayMessage('Error updating profile.', 'error');
        } else {
            // Update local currentUser object with new values
            Object.assign(currentUser, updatedProfile);
            displayProfile();
            toggleEditMode(cardElement, false);
            displayMessage(translations[currentLang].profileUpdated, 'success');
        }
    }

    function validateProfile() {
        let isValid = true;
        let missingFields = [];

        // Profile Image and Name validation
        if (!currentUser.profile_image_url) {
            missingFields.push(translations[currentLang].uploadProfilePhoto);
            isValid = false;
        }
        if (!currentUser.name) { 
            missingFields.push(translations[currentLang].fullNameLabel);
            isValid = false;
        }

        // Contact Info validation
        if (!currentUser.email) {
            missingFields.push(translations[currentLang].profileEmailLabel);
            isValid = false;
        }
        if (!currentUser.phone) {
            missingFields.push(translations[currentLang].profilePhoneLabel);
            isValid = false;
        }

        if (currentUser.role === 'cliente') {
            if (!currentUser.business_name) {
                missingFields.push(translations[currentLang].profileBusinessNameLabel);
                isValid = false;
            }
            if (!currentUser.address) {
                missingFields.push(translations[currentLang].profileAddressLabel);
                isValid = false;
            }
            if (!currentUser.contact_person) {
                missingFields.push(translations[currentLang].profileContactPersonLabel);
                isValid = false;
            }
            if (!currentUser.legal_docs) {
                missingFields.push(translations[currentLang].profileLegalDocsLabel);
                isValid = false;
            }
            if (!currentUser.tax_id) {
                missingFields.push(translations[currentLang].taxIdLabel);
                isValid = false;
            }
            if (!currentUser.bank_name_cliente) {
                missingFields.push(translations[currentLang].bankNameLabel);
                isValid = false;
            }
            if (!currentUser.account_number_cliente) {
                missingFields.push(translations[currentLang].accountNumberLabel);
                isValid = false;
            }
        } else if (currentUser.role === 'trabajador') {
            if (!currentUser.id_number) {
                missingFields.push(translations[currentLang].idNumberLabel);
                isValid = false;
            }
            if (!currentUser.bank_name_trabajador) {
                missingFields.push(translations[currentLang].bankNameLabel);
                isValid = false;
            }
            if (!currentUser.account_number_trabajador) {
                missingFields.push(translations[currentLang].accountNumberLabel);
                isValid = false;
            }
            
            if (!currentUser.date_of_birth) {
                missingFields.push(translations[currentLang].dateOfBirthLabel);
                isValid = false;
            }
            
        }

        if (!isValid) {
            displayMessage(`${translations[currentLang].fillAllRequiredFields}: ${missingFields.join(', ')}`, 'error');
        }
        return isValid;
    }

    function cancelCardChanges(cardElement) {
        displayProfile(); // Revert to original data
        toggleEditMode(cardElement, false);
    }

    // Event Listeners for individual card edit/save/cancel buttons
    document.querySelectorAll('.edit-card-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const cardElement = event.target.closest('.profile-card');
            toggleEditMode(cardElement, true);
        });
    });

    document.querySelectorAll('.save-card-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            const cardElement = event.target.closest('.profile-card');
            await saveCardChanges(cardElement);
        });
    });

    document.querySelectorAll('.cancel-card-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const cardElement = event.target.closest('.profile-card');
            cancelCardChanges(cardElement);
        });
    });

    // Initial display of profile data
    displayProfile();

    // Handle profile image upload
    if (profileAvatar && profileImageUpload && profileUploadPrompt) {
        profileAvatar.addEventListener('click', () => {
            profileImageUpload.click();
        });

        profileUploadPrompt.addEventListener('click', () => {
            profileImageUpload.click();
        });

        profileImageUpload.addEventListener('change', async (event) => {
            console.log('Profile image upload change event fired.');
            const file = event.target.files[0];
            if (file) {
                console.log('File selected:', file.name, file.type, file.size);
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;
                console.log('Uploading to:', filePath);

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, file, { upsert: true });

                if (uploadError) {
                    console.error('Error uploading profile image:', uploadError);
                    displayMessage('Error uploading profile image.', 'error');
                    return;
                }
                console.log('Image uploaded successfully. Getting public URL...');
                const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
                const publicUrl = publicUrlData.publicUrl;
                console.log('Public URL:', publicUrl);

                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ profile_image_url: publicUrl })
            .eq('email', user.email);

                if (updateError) {
                    console.error('Error updating profile image URL:', updateError);
                    displayMessage('Error updating profile image URL.', 'error');
                    return;
                }

                currentUser.profile_image_url = publicUrl;
                displayProfile();
                displayMessage(translations[currentLang].profileImageUpdated, 'success');
            } else {
                console.log('No file selected.');
            }
        });
    }

    // Populate applications for trabajador
    if (currentUser.role === 'trabajador') {
        const applicationsList = document.getElementById('applications-list');
        const { data: applications, error: applicationsError } = await supabase
            .from('applications')
            .select('*, jobs(title, company)')
            .eq('worker_id', user.id);

        if (applicationsError) {
            console.error('Error fetching applications:', applicationsError);
            return;
        }

        if (applications.length > 0) {
            applications.forEach(app => {
                const appElement = document.createElement('div');
                appElement.innerHTML = `
                    <p><strong>Job:</strong> ${app.jobs.title} (${app.jobs.company}) - <strong>Date:</strong> ${app.date} - <strong>Status:</strong> ${translations[currentLang][app.status] || app.status}</p>
                    <button class="btn btn-danger cancel-application-button" data-application-id="${app.id}">Cancel Application</button>
                `;
                applicationsList.appendChild(appElement);
            });
        } else {
            applicationsList.innerHTML = '<p>You have no applications.</p>';
        }

        document.querySelectorAll('.cancel-application-button').forEach(button => {
            button.addEventListener('click', async function() {
                const applicationId = this.dataset.applicationId;
                
                const { error: deleteError } = await supabase
                    .from('applications')
                    .delete()
                    .eq('id', applicationId);

                if (deleteError) {
                    console.error('Error canceling application:', deleteError);
                    displayMessage('Error canceling application.', 'error');
                    return;
                }

                displayMessage('Application canceled.', 'success');
                window.location.reload();
            });
        });
    }
});