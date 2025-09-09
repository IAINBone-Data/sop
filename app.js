document.addEventListener('DOMContentLoaded', function () {
 // === DOM ELEMENTS ===
 const loginModal = document.getElementById('login-modal');
 const loginForm = document.getElementById('login-form');
 const loginButton = document.getElementById('login-button');
 const loginButtonText = document.getElementById('login-button-text');
 const loginSpinner = document.getElementById('login-spinner');
 const loginError = document.getElementById('login-error');
 const closeLoginModalButton = document.getElementById('close-login-modal');
 
 const userInfoContainer = document.getElementById('user-info');

 const listViewContainer = document.getElementById('list-view-container');
 const detailViewContainer = document.getElementById('detail-view-container');
 const aboutViewContainer = document.getElementById('about-view-container');
 const statsViewContainer = document.getElementById('stats-view-container');
 const adminListViewContainer = document.getElementById('admin-list-view-container');
 const datasetList = document.getElementById('dataset-list');
 const datasetCount = document.getElementById('dataset-count');
 const searchInput = document.getElementById('search-input');
 const filterCategory = document.getElementById('filter-category');
 const filterSifatContainer = document.getElementById('filter-sifat-container');
 const filterProducer = document.getElementById('filter-producer');
 const filterKelompok = document.getElementById('filter-kelompok');
 const filterTag = document.getElementById('filter-tag');
 const loadingIndicator = document.getElementById('loading-indicator');
 const noDataMessage = document.getElementById('no-data-message');
 const resetFilterButton = document.getElementById('reset-filter-button');
 const paginationContainer = document.getElementById('pagination-container');


 const filterYear = document.getElementById('filter-year');
 const filterDataStartYear = document.getElementById('filter-data-start-year');
 const filterDataEndYear = document.getElementById('filter-data-end-year');

 const backToListButton = document.getElementById('back-to-list-button');
 const detailActionButtons = document.getElementById('detail-action-buttons');

 // Hamburger Menu Elements
 const headerTitleLink = document.getElementById('header-title-link');
 const hamburgerMenuButton = document.getElementById('hamburger-menu-button');
 const popupMenu = document.getElementById('popup-menu');
 const menuOverlay = document.getElementById('menu-overlay');
 const homeLink = document.getElementById('home-link');
 const aboutLink = document.getElementById('about-link');
 const statsLink = document.getElementById('stats-link');
 const adminListLink = document.getElementById('admin-list-link');
 const statsMenuItem = document.getElementById('stats-menu-item');
 const adminListMenuItem = document.getElementById('admin-list-menu-item');
 const panduanMenuItem = document.getElementById('panduan-menu-item');

 // Request Elements
 const requestMenuItem = document.getElementById('request-menu-item');
 const requestLink = document.getElementById('request-link');
 const requestViewContainer = document.getElementById('request-view-container');
 const requestListTableBody = document.getElementById('request-list-table-body');
 const requestListCardsContainer = document.getElementById('request-list-cards');
 const requestDataModal = document.getElementById('request-data-modal');
 const requestDataForm = document.getElementById('request-data-form');
 const cancelRequestForm = document.getElementById('cancel-request-form');
 const requestModalDatasetTitle = document.getElementById('request-modal-dataset-title');
 const requestFormError = document.getElementById('request-form-error');
 const requestButtonContainer = document.getElementById('request-button-container');

 // Message Elements
 const messageMenuItem = document.getElementById('message-menu-item');
 const messageLink = document.getElementById('message-link');
 const messageViewContainer = document.getElementById('message-view-container');
 const messageListContainer = document.getElementById('message-list-container');

 // Custom Alert
 const customAlertModal = document.getElementById('custom-alert-modal');
 const customAlertMessage = document.getElementById('custom-alert-message');
 const closeCustomAlertButton = document.getElementById('close-custom-alert');

 // Statistics Elements
 const statTotalDataset = document.getElementById('stat-total-dataset');
 const statTotalProducer = document.getElementById('stat-total-producer');
 const statTotalCategory = document.getElementById('stat-total-category');
 const statTotalKelompok = document.getElementById('stat-total-kelompok');
 const popularDatasetsList = document.getElementById('popular-datasets-list');
 const noPopularDatasets = document.getElementById('no-popular-datasets');

 // Reset Password Elements
 const resetPasswordModal = document.getElementById('reset-password-modal');
 const resetPasswordForm = document.getElementById('reset-password-form');
 const closeResetPasswordModalButton = document.getElementById('close-reset-password-modal');
 const resetPasswordError = document.getElementById('reset-password-error');
 const resetPasswordSuccess = document.getElementById('reset-password-success');
 const resetSubmitButton = document.getElementById('reset-submit-button');
 const resetSubmitButtonText = document.getElementById('reset-button-text');
 const resetSpinner = document.getElementById('reset-spinner');

 // Add Dataset Elements
 const addDatasetModal = document.getElementById('add-dataset-modal');
 const addDatasetForm = document.getElementById('add-dataset-form');
 const closeAddDatasetModalButton = document.getElementById('close-add-dataset-modal');
 const cancelAddDatasetButton = document.getElementById('cancel-add-dataset-button');
 const addDatasetError = document.getElementById('add-dataset-error');
 const addDatasetSuccess = document.getElementById('add-dataset-success');
 const submitAddDatasetButton = document.getElementById('submit-add-dataset-button');
 const addDatasetButtonText = document.getElementById('add-dataset-button-text');
 const addDatasetSpinner = document.getElementById('add-dataset-spinner');
 const addKategoriSelect = document.getElementById('add-kategori');
 const addKategoriNewInput = document.getElementById('add-kategori-new');
 
 // Edit Dataset Elements
 const editDatasetModal = document.getElementById('edit-dataset-modal');
 const editDatasetForm = document.getElementById('edit-dataset-form');
 const closeEditDatasetModalButton = document.getElementById('close-edit-dataset-modal');
 const cancelEditDatasetButton = document.getElementById('cancel-edit-dataset-button');
 const submitEditDatasetButton = document.getElementById('submit-edit-dataset-button');
 const editDatasetError = document.getElementById('edit-dataset-error');
 const editDatasetSuccess = document.getElementById('edit-dataset-success');
 const editDatasetButtonText = document.getElementById('edit-dataset-button-text');
 const editDatasetSpinner = document.getElementById('edit-dataset-spinner');

 // User Management Elements
 const userModal = document.getElementById('user-modal');
 const userForm = document.getElementById('user-form');
 const userModalTitle = document.getElementById('user-modal-title');
 const addUserButton = document.getElementById('add-user-button');
 const cancelUserForm = document.getElementById('cancel-user-form');
 const adminListTableBody = document.getElementById('admin-list-table-body');
 const userFormError = document.getElementById('user-form-error');
 const adminListCardsContainer = document.getElementById('admin-list-cards');
 
 // Profile Elements
 const profileModal = document.getElementById('profile-modal');
 const profileForm = document.getElementById('profile-form');
 const cancelProfileForm = document.getElementById('cancel-profile-form');
 const saveProfileButton = document.getElementById('save-profile-button');
 const profileOpenResetPassword = document.getElementById('profile-open-reset-password');
 const profileFormError = document.getElementById('profile-form-error');
 const profileFormSuccess = document.getElementById('profile-form-success');

 // New Button Elements
 const addDatasetButtonContainer = document.getElementById('add-dataset-button-container');
 const addDatasetTriggerButton = document.getElementById('add-dataset-trigger-button');
 const reloadDatasetButton = document.getElementById('reload-dataset-button');

 // Chat/Message Modal Elements
 const chatButton = document.getElementById('chat-button');
 const messageModal = document.getElementById('message-modal');
 const messageForm = document.getElementById('message-form');
 const closeMessageModalButton = document.getElementById('close-message-modal');
 const cancelMessageFormButton = document.getElementById('cancel-message-form');
 const submitMessageButton = document.getElementById('submit-message-button');
 const sendMessageButtonText = document.getElementById('send-message-button-text');
 const sendMessageSpinner = document.getElementById('send-message-spinner');
 const messageFormError = document.getElementById('message-form-error');
 
 const toggleFilterBtn = document.getElementById('toggle-filter-btn');
 const filterContent = document.getElementById('filter-content');

 let allDatasets = [];
 let allUsers = [];
 let filterOptionsCache = null;
 let currentDetailItemIndex = -1;
 let currentPage = 1;
 const rowsPerPage = 20;
 let currentFilteredData = []; 

 let monthlyChart = null;
 let yearlyChart = null;


 // === FUNCTIONS ===
 
 function showCustomAlert(message) {
  customAlertMessage.textContent = message;
  customAlertModal.classList.remove('hidden');
 }

 function animateCountUp(el, endValue) {
   if (!el) return;
   let startValue = 0;
   const duration = 1500;
   const frameDuration = 1000 / 60;
   const totalFrames = Math.round(duration / frameDuration);
   let increment = endValue / totalFrames;
   if (endValue === 0) increment = 0;


   let currentFrame = 0;
   function counter() {
     currentFrame++;
     startValue += increment;
     if (currentFrame >= totalFrames) {
       el.textContent = endValue;
       return;
     }
     el.textContent = Math.round(startValue);
     requestAnimationFrame(counter);
   }
   requestAnimationFrame(counter);
 }

 function getSifatColor(sifat) {
  if (sifat === 'Terbuka') {
   return 'bg-green-100 text-green-800';
  } else if (sifat === 'Terbatas') {
   return 'bg-yellow-100 text-yellow-800';
  } else if (sifat === 'Tertutup') {
   return 'bg-red-100 text-red-800';
  } else {
   return 'bg-gray-100 text-gray-800';
  }
 }
 
 function toggleLoginModal(show) {
  if (show) loginModal.classList.remove('hidden');
  else loginModal.classList.add('hidden');
 }
 
 function toggleResetPasswordModal(show) {
   if (!resetPasswordModal) return;
   if (show) {
     resetPasswordModal.classList.remove('hidden');
     resetPasswordForm.reset();
     resetPasswordError.classList.add('hidden');
     resetPasswordSuccess.classList.add('hidden');
   } else {
     resetPasswordModal.classList.add('hidden');
   }
 }

 function toggleMessageModal(show) {
  if (show) {
    messageForm.reset();
    messageFormError.classList.add('hidden');
    messageModal.classList.remove('hidden');
  } else {
    messageModal.classList.add('hidden');
  }
 }
 
 function toggleAddDatasetModal(show, datasetToCopy = null) {
  if(!addDatasetModal) return;
  if (show) {
    addDatasetForm.reset();
    addKategoriNewInput.classList.add('hidden');
    addDatasetError.classList.add('hidden');
    addDatasetSuccess.classList.add('hidden');
    
    if(filterOptionsCache) {
      populateSelect(document.getElementById('add-kategori'), filterOptionsCache.categories, true, true);
    }

    if (datasetToCopy) {
      document.getElementById('add-judul').value = datasetToCopy.Judul || '';
      document.getElementById('add-uraian').value = datasetToCopy.Uraian || '';
      document.getElementById('add-sifat').value = datasetToCopy.Sifat || 'Terbuka';
      document.getElementById('add-produsen-data').value = datasetToCopy['Produsen Data'] || '';
      document.getElementById('add-penanggung-jawab').value = datasetToCopy['Penanggung Jawab'] || '';
      document.getElementById('add-tag').value = datasetToCopy.Tag || '';
      document.getElementById('add-nama-file').value = datasetToCopy['Nama File'] || '';
      document.getElementById('add-frekuensi').value = datasetToCopy.Frekuensi || '';
      document.getElementById('add-kategori').value = datasetToCopy.Kategori || '';

      const formatValue = datasetToCopy.Format ? datasetToCopy.Format.toLowerCase() : 'xlsx';
      const formatRadio = document.querySelector(`#add-dataset-form input[name="Format"][value="${formatValue}"]`);
      if (formatRadio) {
        formatRadio.checked = true;
      }

      const tahunData = (datasetToCopy['Tahun Data'] || '').split('-');
      addDatasetForm.querySelector('[name="Tahun Data Start"]').value = tahunData[0] ? tahunData[0].trim() : '';
      addDatasetForm.querySelector('[name="Tahun Data End"]').value = tahunData[1] ? tahunData[1].trim() : '';
    }
    
    addDatasetModal.classList.remove('hidden');
  } else {
    addDatasetModal.classList.add('hidden');
  }
 }

 function toggleEditDatasetModal(show, dataset = null) {
   if (!editDatasetModal) return;
   if (show && dataset) {
     editDatasetForm.reset();
     editDatasetError.classList.add('hidden');
     editDatasetSuccess.classList.add('hidden');
     
     document.getElementById('edit-rowIndex').value = dataset.rowIndex;
     document.getElementById('edit-judul').value = dataset.Judul || '';
     document.getElementById('edit-uraian').value = dataset.Uraian || '';
     
     const kategoriSelect = document.getElementById('edit-kategori');
     populateSelect(kategoriSelect, filterOptionsCache.categories, false, false);
     kategoriSelect.value = dataset.Kategori || '';

     document.getElementById('edit-sifat').value = dataset.Sifat || 'Terbuka';
     document.getElementById('edit-produsen-data').value = dataset['Produsen Data'] || '';
     document.getElementById('edit-penanggung-jawab').value = dataset['Penanggung Jawab'] || '';
     document.getElementById('edit-tag').value = dataset.Tag || '';
     document.getElementById('edit-nama-file').value = dataset['Nama File'] || '';
     document.getElementById('edit-frekuensi').value = dataset.Frekuensi || '';
     
     const currentFileInfo = document.getElementById('current-file-info');
     if(dataset.File){
       currentFileInfo.innerHTML = `File saat ini: <a href="${dataset.File}" target="_blank" class="text-blue-600 hover:underline">Lihat File</a>`;
     } else {
       currentFileInfo.innerHTML = 'Tidak ada file yang diunggah.';
     }


     const formatValue = dataset.Format ? dataset.Format.toLowerCase() : 'xlsx';
     const formatRadio = document.querySelector(`#edit-dataset-form input[name="Format"][value="${formatValue}"]`);
     if (formatRadio) {
       formatRadio.checked = true;
     }

     const tahunData = (dataset['Tahun Data'] || '').split('-');
     document.getElementById('edit-tahun-data-start').value = tahunData[0] ? tahunData[0].trim() : '';
     document.getElementById('edit-tahun-data-end').value = tahunData[1] ? tahunData[1].trim() : '';
     
     editDatasetModal.classList.remove('hidden');
   } else {
     editDatasetModal.classList.add('hidden');
   }
 }

 function toggleProfileModal(show) {
   if (show) {
     const userString = sessionStorage.getItem('currentUser');
     if (userString) {
       const user = JSON.parse(userString);
       document.getElementById('profile-nama').value = user.Nama || '';
       document.getElementById('profile-jabatan').value = user.Jabatan || '';
       document.getElementById('profile-username').value = user.Username || '';
       document.getElementById('profile-role').value = user.Role || '';
       profileModal.classList.remove('hidden');
     }
   } else {
     profileModal.classList.add('hidden');
   }
 }

 function updateUIForLoginStatus() {
  try {
    const userString = sessionStorage.getItem('currentUser');
    statsMenuItem.classList.add('hidden');
    adminListMenuItem.classList.add('hidden');
    panduanMenuItem.classList.add('hidden');
    requestMenuItem.classList.add('hidden');
    messageMenuItem.classList.add('hidden');

    if (userString) {
      const user = JSON.parse(userString);
      panduanMenuItem.classList.remove('hidden');
      
      userInfoContainer.innerHTML = `
        <button id="combined-notification-bell" class="relative text-gray-600 hover:text-blue-600 focus:outline-none hidden">
          <i class="fas fa-bell text-xl"></i>
          <span id="combined-notification-badge" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">0</span>
        </button>
        <div class="relative">
          <button id="admin-menu-trigger" class="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              ${user.Nama ? user.Nama.charAt(0).toUpperCase() : 'A'}
            </div>
            <span class="font-semibold text-sm text-gray-800 hidden md:block">${user.Nama || user.Username}</span>
            <i class="fas fa-chevron-down text-xs text-gray-500 transition-transform"></i>
          </button>
          <div id="admin-popup-menu" class="admin-popup hidden w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1">
            <div class="px-4 py-3 border-b border-gray-200">
              <p class="text-sm font-semibold text-gray-900 truncate" title="${user.Nama || user.Username}">${user.Nama || user.Username}</p>
              <p class="text-xs text-gray-500 truncate" title="${user.Unit || 'Admin'}">${user.Unit || 'Admin'}</p>
            </div>
            <div class="py-1">
              <a href="#" id="popup-menu-profile" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <i class="fas fa-user-circle w-5 mr-3 text-gray-400"></i>
                <span>Profil</span>
              </a>
              <a href="#" id="popup-menu-logout" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <i class="fas fa-sign-out-alt w-5 mr-3 text-gray-400"></i>
                <span>Logout</span>
              </a>
            </div>
          </div>
        </div>
      `;
      
      if (user.Role === 'Super Admin' || user.Role === 'Admin') {
        requestMenuItem.classList.remove('hidden');
        
        if (user.Role === 'Super Admin') {
          statsMenuItem.classList.remove('hidden');
          adminListMenuItem.classList.remove('hidden');
          messageMenuItem.classList.remove('hidden');
        }
        
        google.script.run.withSuccessHandler(response => {
          const bell = document.getElementById('combined-notification-bell');
          if (bell && response.success && response.totalNotifications > 0) {
            document.getElementById('combined-notification-badge').textContent = response.totalNotifications;
            bell.classList.remove('hidden');
          } else if (bell) {
            bell.classList.add('hidden');
          }
        }).getNotifications(user);
      }

      if (addDatasetButtonContainer && (user.Role === 'Admin' || user.Role === 'Super Admin')) {
        addDatasetButtonContainer.classList.remove('hidden');
      } else if (addDatasetButtonContainer) {
        addDatasetButtonContainer.classList.add('hidden');
      }
      // Disable popular datasets list
      popularDatasetsList.classList.add('opacity-50', 'pointer-events-none');
    } else {
      userInfoContainer.innerHTML = `
        <button id="admin-login-button" class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 text-sm">
          <i class="fas fa-sign-in-alt mr-2"></i>Login
        </button>
      `;
      if (addDatasetButtonContainer) addDatasetButtonContainer.classList.add('hidden');
      // Enable popular datasets list
      popularDatasetsList.classList.remove('opacity-50', 'pointer-events-none');
    }
  } catch (error) {
    console.error("Gagal memperbarui UI login:", error);
    sessionStorage.removeItem('currentUser');
    userInfoContainer.innerHTML = `
      <button id="admin-login-button" class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 text-sm">
        <i class="fas fa-sign-in-alt mr-2"></i>Login
      </button>
    `;
    if (addDatasetButtonContainer) addDatasetButtonContainer.classList.add('hidden');
  }
  applyFiltersAndRender();
 }
 
 function setButtonState(button, spinner, text, isLoading) {
  button.disabled = isLoading;
  spinner.classList.toggle('hidden', !isLoading);
  text.classList.toggle('hidden', isLoading);
 }
 
 function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  setButtonState(loginButton, loginSpinner, loginButtonText, true);
  loginError.classList.add('hidden');

  google.script.run
   .withSuccessHandler(response => {
    setButtonState(loginButton, loginSpinner, loginButtonText, false);
    if (response && response.success) {
     sessionStorage.setItem('currentUser', JSON.stringify(response.user));
     updateUIForLoginStatus();
     toggleLoginModal(false);
     loginForm.reset();
    } else {
     loginError.textContent = (response && response.message) ? response.message : "Login gagal, respons tidak valid.";
     loginError.classList.remove('hidden');
    }
   })
   .withFailureHandler(error => {
    setButtonState(loginButton, loginSpinner, loginButtonText, false);
    loginError.textContent = 'Gagal terhubung ke server: ' + error.message;
    loginError.classList.remove('hidden');
   })
   .checkLogin(username, password);
 }

 function handleLogout() {
   sessionStorage.removeItem('currentUser');
   updateUIForLoginStatus();
   showListView();
 }

 function handleResetPassword(e) {
   e.preventDefault();
   const newPassword = document.getElementById('new_password').value;
   const confirmPassword = document.getElementById('confirm_password').value;
   const userString = sessionStorage.getItem('currentUser');

   if (!userString) {
     resetPasswordError.textContent = 'Sesi pengguna tidak ditemukan. Silakan login kembali.';
     resetPasswordError.classList.remove('hidden');
     return;
   }
   if (newPassword !== confirmPassword) {
     resetPasswordError.textContent = 'Password baru dan konfirmasi tidak cocok.';
     resetPasswordError.classList.remove('hidden');
     return;
   }
   const user = JSON.parse(userString);
   setButtonState(resetSubmitButton, resetSpinner, resetSubmitButtonText, true);
   resetPasswordError.classList.add('hidden');
   resetPasswordSuccess.classList.add('hidden');

   google.script.run
     .withSuccessHandler(response => {
       setButtonState(resetSubmitButton, resetSpinner, resetSubmitButtonText, false);
       if (response && response.success) {
         resetPasswordSuccess.textContent = response.message;
         resetPasswordSuccess.classList.remove('hidden');
         setTimeout(() => {
           toggleResetPasswordModal(false);
           handleLogout();
         }, 2500);
       } else {
         resetPasswordError.textContent = (response && response.message) ? response.message : "Reset password gagal.";
         resetPasswordError.classList.remove('hidden');
       }
     })
     .withFailureHandler(error => {
       setButtonState(resetSubmitButton, resetSpinner, resetSubmitButtonText, false);
       resetPasswordError.textContent = 'Gagal terhubung ke server: ' + error.message;
       resetPasswordError.classList.remove('hidden');
     })
     .resetPassword(user.Username, newPassword);
 }

 function handleSendMessage(e) {
  e.preventDefault();
  if (!messageForm.checkValidity()) {
    messageForm.reportValidity();
    return;
  }

  setButtonState(submitMessageButton, sendMessageSpinner, sendMessageButtonText, true);
  messageFormError.classList.add('hidden');

  const formData = new FormData(messageForm);
  const messageData = Object.fromEntries(formData.entries());

  google.script.run
    .withSuccessHandler(response => {
      setButtonState(submitMessageButton, sendMessageSpinner, sendMessageButtonText, false);
      if (response.success) {
        toggleMessageModal(false);
        showCustomAlert('Terima kasih! Pesan Anda telah berhasil dikirim.');
      } else {
        messageFormError.textContent = response.message;
        messageFormError.classList.remove('hidden');
      }
    })
    .withFailureHandler(err => {
      setButtonState(submitMessageButton, sendMessageSpinner, sendMessageButtonText, false);
      messageFormError.textContent = 'Error: ' + err.message;
      messageFormError.classList.remove('hidden');
    })
    .addMessage(messageData);
 }
 
 function handleAddNewDataset(e) {
   e.preventDefault();
   
   const fileInput = document.getElementById('add-file');
   const file = fileInput.files[0];

   if (!file) {
     addDatasetError.textContent = "Mohon unggah file.";
     addDatasetError.classList.remove('hidden');
     return;
   }
   
   const userString = sessionStorage.getItem('currentUser');
   const user = userString ? JSON.parse(userString) : null;

   if (!user || (user.Role !== 'Admin' && user.Role !== 'Super Admin')) {
     addDatasetError.textContent = "Hanya Admin yang dapat menambahkan dataset.";
     addDatasetError.classList.remove('hidden');
     return;
   }

   setButtonState(submitAddDatasetButton, addDatasetSpinner, addDatasetButtonText, true);
   addDatasetError.classList.add('hidden');
   addDatasetSuccess.classList.add('hidden');

   const reader = new FileReader();
   reader.onload = function(event) {
     const fileData = event.target.result.split(',')[1];
     const formData = new FormData(addDatasetForm);
     const dataObject = Object.fromEntries(formData.entries());
     
     if (dataObject['Kategori-select'] === '--tambah-baru--') {
       dataObject.Kategori = dataObject['Kategori'];
     } else {
       dataObject.Kategori = dataObject['Kategori-select'];
     }
     delete dataObject['Kategori-select'];

     const startYear = dataObject['Tahun Data Start'] || new Date().getFullYear();
     const producer = (dataObject['Produsen Data'] || '').replace(/[^a-zA-Z0-9]/g, '_');
     const fileName = (dataObject['Nama File'] || 'file').replace(/[^a-zA-Z0-9]/g, '_');
     const extension = file.name.split('.').pop();
     dataObject.fileName = `${startYear}_${producer}_${fileName}.${extension}`;
     
     dataObject.fileData = fileData;
     dataObject.fileType = file.type;
     
     const startYearValue = dataObject['Tahun Data Start'];
     const endYearValue = dataObject['Tahun Data End'];
     dataObject['Tahun Data'] = (startYearValue || endYearValue) ? `${startYearValue || ''} - ${endYearValue || ''}`.trim() : '';
     delete dataObject['Tahun Data Start'];
     delete dataObject['Tahun Data End'];

     dataObject.User = user.Username;

     google.script.run
       .withSuccessHandler(response => {
         setButtonState(submitAddDatasetButton, addDatasetSpinner, addDatasetButtonText, false);
         if (response.success) {
           addDatasetSuccess.textContent = response.message;
           addDatasetSuccess.classList.remove('hidden');
           setTimeout(() => {
             toggleAddDatasetModal(false);
             loadInitialData();
           }, 2000);
         } else {
           addDatasetError.textContent = response.message;
           addDatasetError.classList.remove('hidden');
         }
       })
       .withFailureHandler(error => {
         setButtonState(submitAddDatasetButton, addDatasetSpinner, addDatasetButtonText, false);
         addDatasetError.textContent = "Terjadi kesalahan: " + error.message;
         addDatasetError.classList.remove('hidden');
       })
       .uploadFileAndAddDataset(dataObject);
   };
   reader.readAsDataURL(file);
 }

 function handleUpdateDataset(e) {
   e.preventDefault();

   const userString = sessionStorage.getItem('currentUser');
   const user = userString ? JSON.parse(userString) : null;

   if (!user || (user.Role !== 'Admin' && user.Role !== 'Super Admin')) {
     editDatasetError.textContent = "Hanya Admin yang dapat mengedit dataset.";
     editDatasetError.classList.remove('hidden');
     return;
   }
   
   setButtonState(submitEditDatasetButton, editDatasetSpinner, editDatasetButtonText, true);
   editDatasetError.classList.add('hidden');
   editDatasetSuccess.classList.add('hidden');

   const formData = new FormData(editDatasetForm);
   const dataObject = Object.fromEntries(formData.entries());
   dataObject.User = user.Username;

   const fileInput = document.getElementById('edit-file');
   const file = fileInput.files[0];

   const startYearValue = dataObject['Tahun Data Start'];
   const endYearValue = dataObject['Tahun Data End'];
   dataObject['Tahun Data'] = (startYearValue || endYearValue) ? `${startYearValue || ''} - ${endYearValue || ''}`.trim() : '';
   delete dataObject['Tahun Data Start'];
   delete dataObject['Tahun Data End'];

   if (file) {
     const reader = new FileReader();
     reader.onload = function(event) {
       dataObject.fileData = event.target.result.split(',')[1];
       dataObject.fileType = file.type;
       
       const startYear = startYearValue || new Date().getFullYear();
       const producer = (dataObject['Produsen Data'] || '').replace(/[^a-zA-Z0-9]/g, '_');
       const fileName = (dataObject['Nama File'] || 'file').replace(/[^a-zA-Z0-9]/g, '_');
       const extension = file.name.split('.').pop();
       dataObject.fileName = `${startYear}_${producer}_${fileName}.${extension}`;
       
       google.script.run
         .withSuccessHandler(onUpdateSuccess)
         .withFailureHandler(onUpdateFailure)
         .uploadFileAndUpdateDataset(dataObject);
     }
     reader.readAsDataURL(file);
   } else {
     google.script.run
       .withSuccessHandler(onUpdateSuccess)
       .withFailureHandler(onUpdateFailure)
       .updateDataset(dataObject);
   }
 }

 function onUpdateSuccess(response) {
   setButtonState(submitEditDatasetButton, editDatasetSpinner, editDatasetButtonText, false);
   if (response.success) {
     editDatasetSuccess.textContent = response.message;
     editDatasetSuccess.classList.remove('hidden');
     setTimeout(() => {
       toggleEditDatasetModal(false);
       loadInitialData(true);
     }, 2000);
   } else {
     editDatasetError.textContent = response.message;
     editDatasetError.classList.remove('hidden');
   }
 }

 function onUpdateFailure(error) {
   setButtonState(submitEditDatasetButton, editDatasetSpinner, editDatasetButtonText, false);
   editDatasetError.textContent = "Gagal memperbarui: " + error.message;
   editDatasetError.classList.remove('hidden');
 }


 function showListView() {
  detailViewContainer.classList.add('hidden');
  aboutViewContainer.classList.add('hidden');
  statsViewContainer.classList.add('hidden');
  adminListViewContainer.classList.add('hidden');
  requestViewContainer.classList.add('hidden');
  messageViewContainer.classList.add('hidden');
  listViewContainer.classList.remove('hidden');
  currentDetailItemIndex = -1;
 }

 function showAboutView() {
  listViewContainer.classList.add('hidden');
  detailViewContainer.classList.add('hidden');
  statsViewContainer.classList.add('hidden');
  adminListViewContainer.classList.add('hidden');
  requestViewContainer.classList.add('hidden');
  messageViewContainer.classList.add('hidden');
  aboutViewContainer.classList.remove('hidden');
 }

 function showStatisticsView() {
  listViewContainer.classList.add('hidden');
  detailViewContainer.classList.add('hidden');
  aboutViewContainer.classList.add('hidden');
  adminListViewContainer.classList.add('hidden');
  requestViewContainer.classList.add('hidden');
  messageViewContainer.classList.add('hidden');
  statsViewContainer.classList.remove('hidden');
  loadAndRenderStats();
 }

 function showAdminListView() {
   listViewContainer.classList.add('hidden');
   detailViewContainer.classList.add('hidden');
   aboutViewContainer.classList.add('hidden');
   statsViewContainer.classList.add('hidden');
   requestViewContainer.classList.add('hidden');
   messageViewContainer.classList.add('hidden');
   adminListViewContainer.classList.remove('hidden');
   loadAndRenderAdminList();
 }

 function showRequestView() {
  listViewContainer.classList.add('hidden');
  detailViewContainer.classList.add('hidden');
  aboutViewContainer.classList.add('hidden');
  statsViewContainer.classList.add('hidden');
  adminListViewContainer.classList.add('hidden');
  messageViewContainer.classList.add('hidden');
  requestViewContainer.classList.remove('hidden');
  loadAndRenderRequests();
 }
 
 function showMessagesView() {
   listViewContainer.classList.add('hidden');
   detailViewContainer.classList.add('hidden');
   aboutViewContainer.classList.add('hidden');
   statsViewContainer.classList.add('hidden');
   adminListViewContainer.classList.add('hidden');
   requestViewContainer.classList.add('hidden');
   messageViewContainer.classList.remove('hidden');
   loadAndRenderMessages();
 }
 
 function loadAndRenderRequests() {
  const userString = sessionStorage.getItem('currentUser');
  if (!userString) return;
  const user = JSON.parse(userString);

  const placeholder = '<tr><td colspan="7" class="text-center py-6 text-gray-500">Memuat permintaan...</td></tr>';
  requestListTableBody.innerHTML = placeholder;
  requestListCardsContainer.innerHTML = `<div class="p-4 text-center text-gray-500">Memuat permintaan...</div>`;

  google.script.run
    .withSuccessHandler(response => {
      if (response.success) {
        requestListTableBody.innerHTML = '';
        requestListCardsContainer.innerHTML = '';

        if (response.requests.length === 0) {
          const noDataHtml = '<tr><td colspan="7" class="text-center py-6 text-gray-500">Tidak ada permintaan data.</td></tr>';
          requestListTableBody.innerHTML = noDataHtml;
          requestListCardsContainer.innerHTML = `<div class="p-4 text-center text-gray-500">Tidak ada permintaan data.</div>`;
          return;
        }
        response.requests.forEach(req => {
          let statusHtml;
          const canUpdate = user.Role === 'Admin' || user.Role === 'Super Admin';

          if (req.Status === 'Selesai' || req.Status === 'Ditolak') {
            const statusColor = req.Status === 'Selesai' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
            statusHtml = `<span class="px-2 py-1 text-xs font-semibold rounded-full ${statusColor}">${req.Status}</span>`;
          } else if (canUpdate) {
            statusHtml = `
              <div class="flex gap-2">
                <button class="status-update-button bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-2 rounded" data-row-index="${req.rowIndex}" data-status="Selesai">Selesai</button>
                <button class="status-update-button bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-2 rounded" data-row-index="${req.rowIndex}" data-status="Ditolak">Ditolak</button>
              </div>
            `;
          } else {
            statusHtml = `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">${req.Status}</span>`;
          }

          // Table Row (Desktop)
          const tr = document.createElement('tr');
          tr.className = 'border-b';
          tr.innerHTML = `
            <td class="py-2 px-4 text-sm">${req.Timestamp || ''}</td>
            <td class="py-2 px-4 font-semibold">${req.Dataset || ''}</td>
            <td class="py-2 px-4 text-sm">
              <div>${req['Nama Pemohon'] || ''}</div>
              <div class="text-xs text-gray-500">${req['Email Pemohon'] || ''}</div>
            </td>
            <td class="py-2 px-4 text-sm">${req.Keperluan || ''}</td>
            <td class="py-2 px-4 text-sm">${req['Tgl Respon'] || ''}</td>
            <td class="py-2 px-4">${statusHtml}</td>
              <td class="py-2 px-4">
                <a href="${req.File}" target="_blank" class="bg-blue-600 text-white font-bold py-1 px-3 rounded-lg hover:bg-blue-700 text-sm" title="Lihat File">File</a>
              </td>
          `;
          requestListTableBody.appendChild(tr);

          // Card (Mobile)
          const card = document.createElement('div');
          card.className = 'bg-white p-4 rounded-lg shadow-md border space-y-3';
          card.innerHTML = `
            <div>
              <p class="text-xs text-gray-500">${req.Timestamp || ''}</p>
              <p class="font-bold text-gray-800">${req.Dataset || ''}</p>
            </div>
            <div class="text-sm space-y-1">
              <p><strong class="font-medium text-gray-600">Pemohon:</strong> ${req['Nama Pemohon'] || ''} (${req['Email Pemohon'] || ''})</p>
              <p><strong class="font-medium text-gray-600">Keperluan:</strong> ${req.Keperluan || ''}</p>
              <p><strong class="font-medium text-gray-600">Tgl Respon:</strong> ${req['Tgl Respon'] || ''}</p>
            </div>
            <div class="flex items-center justify-between pt-2 border-t">
              <div class="flex-grow">${statusHtml}</div>
              <a href="${req.File}" target="_blank" class="bg-blue-600 text-white font-bold py-1 px-3 rounded-lg hover:bg-blue-700 text-sm" title="Lihat File">
                <i class="fas fa-file-alt mr-1"></i> File
              </a>
            </div>
          `;
          requestListCardsContainer.appendChild(card);
        });
      } else {
        const errorHtml = `<tr><td colspan="7" class="text-center py-6 text-red-500">Gagal memuat: ${response.message}</td></tr>`;
        requestListTableBody.innerHTML = errorHtml;
        requestListCardsContainer.innerHTML = `<div class="p-4 text-center text-red-500">Gagal memuat: ${response.message}</div>`;
      }
    })
    .withFailureHandler(err => {
      const errorHtml = `<tr><td colspan="7" class="text-center py-6 text-red-500">Error: ${err.message}</td></tr>`;
      requestListTableBody.innerHTML = errorHtml;
      requestListCardsContainer.innerHTML = `<div class="p-4 text-center text-red-500">Error: ${err.message}</div>`;
    })
    .getRequests(user);
 }
 
 function handleStatusUpdateClick(e) {
  const button = e.target.closest('.status-update-button');
  if (!button) return;

  const rowIndex = button.dataset.rowIndex;
  const newStatus = button.dataset.status;

  button.disabled = true;
  button.textContent = '...';
  
  google.script.run
    .withSuccessHandler(response => {
      if(!response.success) {
        showCustomAlert('Gagal memperbarui status: ' + response.message);
      }
      loadAndRenderRequests(); // Refresh the list
    })
    .withFailureHandler(err => {
      showCustomAlert('Error: ' + err.message);
      loadAndRenderRequests(); // Refresh the list
    })
    .updateRequestStatus(rowIndex, newStatus);
 }

 function toggleRequestDataModal(show, dataset = null) {
  if (show && dataset) {
    requestDataForm.reset();
    requestFormError.classList.add('hidden');
    document.getElementById('request-dataset-title').value = dataset.Judul || '';
    document.getElementById('request-dataset-file').value = dataset.File || '';
    document.getElementById('request-dataset-user').value = dataset.User || '';
    requestModalDatasetTitle.textContent = dataset.Judul || '';
    requestDataModal.classList.remove('hidden');
  } else {
    requestDataModal.classList.add('hidden');
  }
 }

 function handleAddRequest(e) {
  e.preventDefault();
  if (!requestDataForm.checkValidity()) {
    requestDataForm.reportValidity();
    return;
  }
  const submitButton = document.getElementById('submit-request-button');
  submitButton.disabled = true;
  submitButton.textContent = 'Mengirim...';

  const formData = new FormData(requestDataForm);
  const requestData = Object.fromEntries(formData.entries());
  requestData.datasetTitle = document.getElementById('request-dataset-title').value;
  requestData.fileUrl = document.getElementById('request-dataset-file').value;
  requestData.datasetUser = document.getElementById('request-dataset-user').value;

  google.script.run
    .withSuccessHandler(response => {
      submitButton.disabled = false;
      submitButton.textContent = 'Kirim Permintaan';
      if (response.success) {
        toggleRequestDataModal(false);
        showCustomAlert('Permohonan data anda telah berhasil dikirim, data anda akan segera kami proses.');
      } else {
        requestFormError.textContent = response.message;
        requestFormError.classList.remove('hidden');
      }
    })
    .withFailureHandler(err => {
      submitButton.disabled = false;
      submitButton.textContent = 'Kirim Permintaan';
      requestFormError.textContent = 'Error: ' + err.message;
      requestFormError.classList.remove('hidden');
    })
    .addRequest(requestData);
 }
 
 function loadAndRenderMessages() {
  messageListContainer.innerHTML = `<div class="p-6 text-center text-gray-500">Memuat pesan...</div>`;
  google.script.run
    .withSuccessHandler(response => {
      if (response.success) {
        messageListContainer.innerHTML = '';
        if (response.messages.length === 0) {
          messageListContainer.innerHTML = `<div class="p-6 text-center text-gray-500">Tidak ada pesan.</div>`;
          return;
        }
        response.messages.forEach(msg => {
          const isUnread = msg.Status !== 'Read';
          const messageRow = document.createElement('div');
          messageRow.className = `message-item cursor-pointer p-4 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 ${isUnread ? 'bg-blue-50' : 'bg-white'}`;
          messageRow.dataset.rowIndex = msg.rowIndex;
          messageRow.dataset.status = msg.Status;

          messageRow.innerHTML = `
            <div class="w-full md:w-48 flex-shrink-0">
              <p class="font-semibold text-gray-900 truncate" title="${msg.Nama || ''}">${msg.Nama || 'N/A'}</p>
              <p class="text-sm text-gray-500 truncate" title="${msg.Kontak || ''}">${msg.Kontak || 'Tidak ada kontak'}</p>
            </div>
            <div class="flex-grow text-gray-700 min-w-0">
              <p class="break-words whitespace-normal">${msg.Pesan || ''}</p>
            </div>
            <div class="w-full md:w-auto flex-shrink-0 flex items-center justify-between md:flex-col md:items-end mt-2 md:mt-0">
               <div class="text-xs text-gray-500 whitespace-nowrap">${msg.Timestamp ? msg.Timestamp : ''}</div>
               ${isUnread ? '<span class="status-label mt-1 text-xs bg-blue-500 text-white font-bold px-2 py-0.5 rounded-full">Baru</span>' : ''}
            </div>
          `;
          
          messageListContainer.appendChild(messageRow);
        });
      } else {
        messageListContainer.innerHTML = `<div class="p-6 text-center text-red-500">Gagal memuat pesan: ${response.message}</div>`;
      }
    })
    .withFailureHandler(err => {
      messageListContainer.innerHTML = `<div class="p-6 text-center text-red-500">Error: ${err.message}</div>`;
    })
    .getMessages();
 }

 function renderTablePreview(fileId) {
  const previewContent = document.getElementById('table-preview-content');
  if (!previewContent) return;
  
  previewContent.innerHTML = '<div class="p-4 text-center text-gray-500">Memuat pratinjau tabel...</div>';

  google.script.run
   .withSuccessHandler(data => {
    if (data && data.length > 0 && !data[0][0].startsWith("Error:")) {
     let tableHTML = '<table class="w-full text-sm text-left text-gray-500">';
     // Header
     tableHTML += '<thead class="text-xs text-gray-700 uppercase bg-gray-50">';
     tableHTML += '<tr>';
     data[0].forEach(headerText => {
      tableHTML += `<th scope="col" class="px-6 py-3">${headerText}</th>`;
     });
     tableHTML += '</tr></thead>';
     // Body
     tableHTML += '<tbody>';
     data.slice(1).forEach(row => {
      tableHTML += '<tr class="bg-white border-b">';
      row.forEach(cellText => {
       tableHTML += `<td class="px-6 py-4">${cellText}</td>`;
      });
      tableHTML += '</tr>';
     });
     tableHTML += '</tbody></table>';
     previewContent.innerHTML = tableHTML;
    } else {
     previewContent.innerHTML = `<div class="p-4 text-center text-red-500">${data && data[0] ? data[0][0] : 'Tidak dapat memuat pratinjau tabel atau file kosong.'}</div>`;
    }
   })
   .withFailureHandler(error => {
    console.error("Gagal memuat pratinjau tabel:", error);
    previewContent.innerHTML = `<div class="p-4 text-center text-red-500">Gagal memuat pratinjau tabel: ${error.message}</div>`;
   })
   .getFileContent(fileId);
 }

 function displayChangeHistory(currentItem) {
  const historySection = document.getElementById('history-section');
  const historyList = document.getElementById('history-list');
  const noHistoryMessage = document.getElementById('no-history-message');

  if (!historySection || !historyList || !noHistoryMessage) return;

  const historyItems = allDatasets
    .filter(item => item.Judul === currentItem.Judul && item.rowIndex !== currentItem.rowIndex)
    .sort((a, b) => {
      const dateAStr = a['Diperbaharui'] || '';
      const dateBStr = b['Diperbaharui'] || '';
      if (!dateAStr) return 1;
      if (!dateBStr) return -1;
      const dateA = dateAStr.split('/').reverse().join('');
      const dateB = dateBStr.split('/').reverse().join('');
      return dateB.localeCompare(dateA);
    });

  historyList.innerHTML = '';

  if (historyItems.length > 0) {
    historySection.classList.remove('hidden');
    noHistoryMessage.classList.add('hidden');

    historyItems.forEach(item => {
      const format = item.Format ? item.Format.toUpperCase() : 'N/A';
      let formatColorClass = 'bg-gray-100 text-gray-800';
      if (format === 'XLS' || format === 'XLSX') {
        formatColorClass = 'bg-green-100 text-green-800';
      } else if (format === 'CSV') {
        formatColorClass = 'bg-blue-100 text-blue-800';
      }

      const historyItemHTML = `
        <div class="border rounded-lg p-4 flex items-center justify-between gap-4">
          <div class="flex-grow">
            <div class="flex items-start">
              <i class="fas fa-file-alt text-gray-500 text-xl mr-3 mt-1"></i>
              <div>
                <p class="font-semibold text-gray-800">${item['Nama File'] || 'N/A'}</p>
                <div class="flex items-center gap-4 flex-wrap mt-1 text-sm text-gray-600">
                  <span>Judul: <span class="font-medium text-gray-700">${item.Judul || 'N/A'}</span></span>
                  <span class="font-semibold px-2 py-0.5 rounded-full text-xs ${formatColorClass}">${format}</span>
                  <span>Diperbaharui: <span class="font-medium text-gray-700">${item['Diperbaharui'] || 'N/A'}</span></span>
                </div>
              </div>
            </div>
          </div>
          <a href="${item.File || '#'}" target="_blank" class="bg-blue-600 text-white font-bold py-2 px-2 rounded-lg hover:bg-blue-700 transition duration-300 flex-shrink-0" title="Download">
            <i class="fas fa-download"></i>
          </a>
        </div>
      `;
      historyList.innerHTML += historyItemHTML;
    });
  } else {
    historySection.classList.add('hidden');
    noHistoryMessage.classList.remove('hidden');
  }
}
 
 function showDetailView(datasetIndex) {
  currentDetailItemIndex = datasetIndex;
  const item = allDatasets[datasetIndex];
  if (!item) return;
  
  google.script.run.recordVisit(item.Judul);

  document.getElementById('detail-title').textContent = item.Judul || 'Tanpa Judul';
  const detailUraianEl = document.getElementById('detail-uraian');
  detailUraianEl.textContent = item.Uraian || 'Tidak ada uraian.';
  
  const oldTagsContainer = document.getElementById('detail-tags-container');
  if(oldTagsContainer) oldTagsContainer.remove();
  
  const category = item.Kategori;
  const tags = item.Tag ? item.Tag.split(',').map(t => t.trim()).filter(Boolean) : [];

  if (category || tags.length > 0) {
    const tagsContainer = document.createElement('div');
    tagsContainer.id = 'detail-tags-container';
    tagsContainer.className = 'mt-4 pt-4 border-t flex flex-wrap gap-2 items-center';
    if (category) {
      tagsContainer.innerHTML += `<span class="inline-block bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full"><i class="fas fa-folder-open mr-1.5"></i> ${category}</span>`;
    }
    tags.forEach(tag => {
      tagsContainer.innerHTML += `<span class="inline-block bg-gray-200 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">#${tag}</span>`;
    });
    detailUraianEl.insertAdjacentElement('afterend', tagsContainer);
  }

  const sifatEl = document.getElementById('detail-sifat');
  sifatEl.textContent = item.Sifat || 'N/A';
  sifatEl.className = `text-sm font-bold px-3 py-1 rounded-full flex-shrink-0 ml-4 ${getSifatColor(item.Sifat)}`;
  
  document.getElementById('detail-file-title').textContent = item['Nama File'] || 'File Dataset';
  document.getElementById('detail-filename-display').textContent = item.Judul || 'Tanpa Judul';
  
  const formatEl = document.getElementById('detail-file-format');
  const formatText = item.Format ? item.Format.toUpperCase() : 'N/A';
  formatEl.textContent = formatText;

  if (formatText === 'CSV') {
    formatEl.className = 'font-semibold px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800';
  } else if (formatText === 'XLS' || formatText === 'XLSX') {
    formatEl.className = 'font-semibold px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800';
  } else {
    formatEl.className = 'font-semibold px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800';
  }

  // Populate Metadata fields
  document.getElementById('meta-produsen').textContent = item['Produsen Data'] || 'N/A';
  document.getElementById('meta-penanggung-jawab').textContent = item['Penanggung Jawab'] || 'N/A';
  document.getElementById('meta-tanggal').textContent = item.Tanggal || 'N/A';
  document.getElementById('meta-diperbaharui').textContent = item.Diperbaharui || 'N/A';
  document.getElementById('meta-frekuensi').textContent = item.Frekuensi || 'N/A';
  document.getElementById('meta-tahun-data').textContent = item['Tahun Data'] || 'N/A';
  document.getElementById('meta-kelompok').textContent = item.Kelompok || 'N/A';
  
  const downloadLink = document.getElementById('detail-download-link');
  detailActionButtons.innerHTML = '';
  requestButtonContainer.innerHTML = '';
  
  const userString = sessionStorage.getItem('currentUser');
  const user = userString ? JSON.parse(userString) : null;
  
  let canDownload = item.Sifat === 'Terbuka' || (user && (user.Role === 'Super Admin' || user.Role === 'Tertutup' || (user.Role === 'Admin' && item.User === user.Username)));

  if (canDownload) {
   downloadLink.style.display = 'inline-block';
  } else {
   downloadLink.style.display = 'none';
   const requestButton = document.createElement('button');
   requestButton.id = 'detail-request-button';
   requestButton.innerHTML = `<i class="fas fa-inbox mr-2"></i> Minta Data`;
   requestButton.className = 'bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 text-sm flex items-center w-full justify-center';
   requestButtonContainer.appendChild(requestButton);
  }

  if (user && (user.Role === 'Super Admin' || (user.Role === 'Admin' && user.Username === item.User))) {
    let adminButtonsHtml = `<button id="detail-update-button" class="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 text-sm flex items-center"><i class="fas fa-copy mr-2"></i>Perbaharui</button>`;
    adminButtonsHtml += `<button id="detail-edit-button" class="bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 text-sm flex items-center ml-2"><i class="fas fa-edit mr-2"></i>Edit</button>`;
    detailActionButtons.innerHTML += adminButtonsHtml;
  }
  
  const fileUrl = item.File || '#';
  const driveRegex = /https:\/\/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9-_]+)/;
  const sheetRegex = /https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const driveMatch = fileUrl.match(driveRegex);
  const sheetMatch = fileUrl.match(sheetRegex);
  const fileId = driveMatch ? driveMatch[1] : (sheetMatch ? sheetMatch[1] : null);
  
  const tablePreviewContainer = document.getElementById('table-preview-container');
  const previewContent = document.getElementById('table-preview-content');

  previewContent.innerHTML = '';
  tablePreviewContainer.classList.add('hidden');

  if (canDownload && fileId) {
    const format = (item.Format || '').toLowerCase();
    downloadLink.href = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    let previewHTML = '';
    if (sheetMatch || ['pdf', 'docx', 'pptx', 'xls', 'xlsx'].includes(format)) {
      const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      previewHTML = `<iframe src="${embedUrl}" class="w-full h-96 border-0" frameborder="0"></iframe>`;
    } else if (['png', 'jpg', 'jpeg', 'gif'].includes(format)) {
      const imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
      previewHTML = `<img src="${imageUrl}" alt="Pratinjau Gambar" class="w-full h-auto rounded-lg">`;
    } else if (['mp4', 'webm', 'ogg'].includes(format)) {
      const videoUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
      previewHTML = `<video controls class="w-full rounded-lg"><source src="${videoUrl}" type="video/${format}">Browser Anda tidak mendukung tag video.</video>`;
    } else if (['mp3', 'wav'].includes(format)) {
      const audioUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
      previewHTML = `<audio controls class="w-full"><source src="${audioUrl}" type="audio/${format === 'mp3' ? 'mpeg' : format}">Browser Anda tidak mendukung tag audio.</audio>`;
    } else if (format === 'csv') {
      renderTablePreview(fileId);
    }

    if (previewHTML) {
      previewContent.innerHTML = previewHTML;
      tablePreviewContainer.classList.remove('hidden');
    }
  } else {
   downloadLink.href = fileUrl;
  }

  displayChangeHistory(item);

  listViewContainer.classList.add('hidden');
  aboutViewContainer.classList.add('hidden');
  statsViewContainer.classList.add('hidden');
  adminListViewContainer.classList.add('hidden');
  requestViewContainer.classList.add('hidden');
  detailViewContainer.classList.remove('hidden');
  window.scrollTo(0, 0);
 }
 
 function loadInitialData(keepDetailView = false, callback = () => {}) {
  loadingIndicator.style.display = 'block';
  if (!keepDetailView) {
   datasetList.innerHTML = '';
  }
  google.script.run
   .withSuccessHandler(datasets => {
    allDatasets = datasets;
    loadingIndicator.style.display = 'none';
    
    if (keepDetailView && currentDetailItemIndex > -1) {
      const updatedItem = allDatasets.find(d => d.rowIndex === allDatasets[currentDetailItemIndex].rowIndex);
      const newIndex = updatedItem ? allDatasets.indexOf(updatedItem) : -1;
      if (newIndex > -1) {
        showDetailView(newIndex);
      } else {
        showListView();
      }
    } else {
      applyFiltersAndRender();
    }
    
    animateCountUp(statTotalDataset, allDatasets.length);
    
    google.script.run
     .withSuccessHandler(options => {
      filterOptionsCache = options;
      populateSelect(filterCategory, options.categories);
      populateSelect(filterProducer, options.producers);
      populateSelect(filterKelompok, options.kelompok);
      populateSelect(filterTag, options.tags);
      populateSelect(filterYear, options.years);
      animateCountUp(statTotalProducer, options.producers.length);
      animateCountUp(statTotalCategory, options.categories.length);
      animateCountUp(statTotalKelompok, options.kelompok.length);
      callback();
     })
     .withFailureHandler(err => {
      console.error("Gagal memuat opsi filter:", err);
      callback();
     })
     .getFilterOptions();
     
    loadTopVisited();
   })
   .withFailureHandler(err => {
    loadingIndicator.style.display = 'none';
    datasetCount.innerHTML = `<i class="fas fa-exclamation-triangle text-red-500"></i> Gagal memuat data.`;
    callback();
   })
   .getDatasets();
 }

 function loadTopVisited() {
  google.script.run
    .withSuccessHandler(topData => {
      popularDatasetsList.innerHTML = ''; // Clear previous list
      if (topData && topData.length > 0) {
        noPopularDatasets.classList.add('hidden');
        popularDatasetsList.classList.remove('hidden');
        topData.forEach(item => {
          const li = document.createElement('li');
          li.className = "popular-dataset-item cursor-pointer hover:bg-gray-100 p-1 rounded";
          li.dataset.title = item.title;
          li.innerHTML = `
            <div class="flex justify-between items-center">
              <span class="truncate pr-2">${item.title}</span>
              <span class="font-bold text-gray-800 bg-blue-100 px-2 py-0.5 rounded-full text-xs">${item.visits}</span>
            </div>
          `;
          popularDatasetsList.appendChild(li);
        });
      } else {
        popularDatasetsList.classList.add('hidden');
        noPopularDatasets.classList.remove('hidden');
      }
    })
    .withFailureHandler(err => {
      console.error("Gagal memuat dataset populer:", err);
      popularDatasetsList.classList.add('hidden');
      noPopularDatasets.classList.remove('hidden');
      noPopularDatasets.textContent = 'Gagal memuat data.'
    })
    .getTopVisited();
 }
 
 function populateSelect(selectElement, optionsArray, withPlaceholder = false, allowAdd = false) {
   if (!selectElement) return;
   const currentValue = selectElement.value;
   selectElement.innerHTML = '';
   
   const defaultText = selectElement.id.includes('year') ? 'Semua Tahun' : "Semua " + (selectElement.id.split('-')[1] || "Opsi");
   
   let firstOptionText = defaultText;
   let firstOptionValue = "";

   if(withPlaceholder) {
    firstOptionText = "Pilih salah satu...";
    firstOptionValue = "";
   }

   selectElement.innerHTML = `<option value="${firstOptionValue}" ${withPlaceholder ? 'disabled selected' : ''}>${firstOptionText}</option>`;
   
   optionsArray.forEach(option => {
     selectElement.innerHTML += `<option value="${option}">${option}</option>`;
   });
   
   if(allowAdd) {
    selectElement.innerHTML += `<option value="--tambah-baru--">Tambah Kategori Baru...</option>`;
   }
   
   selectElement.value = currentValue;
 }

 function applyFiltersAndRender() {
   // Default view for non-logged-in users: Show 'Terbuka' and 'Terbatas' datasets
   let baseData = allDatasets.filter(item => item.Sifat === 'Terbuka' || item.Sifat === 'Terbatas');

   const userString = sessionStorage.getItem('currentUser');
   if (userString) {
     try {
       const user = JSON.parse(userString);
       if (user.Role === 'Super Admin' || user.Role === 'Tertutup') {
         // Super Admin and Tertutup can see all datasets
         baseData = allDatasets;
       } else if (user.Role === 'Admin') {
         // Admin hanya melihat dataset yang mereka unggah
         baseData = allDatasets.filter(item => item.User === user.Username);
       } else if (user.Role === 'Terbatas') {
        // 'Terbatas' role can see 'Terbuka' and 'Terbatas' data
        baseData = allDatasets.filter(item => item.Sifat === 'Terbuka' || item.Sifat === 'Terbatas');
       }
     } catch(e) {
       console.error("Error parsing user data:", e);
       // Fallback to default if user data is corrupted
       baseData = allDatasets.filter(item => item.Sifat === 'Terbuka' || item.Sifat === 'Terbatas');
     }
   }
   
   const uniqueTitles = new Map();
   baseData.forEach(item => {
     if (!uniqueTitles.has(item.Judul)) {
       uniqueTitles.set(item.Judul, item);
     }
   });
   const uniqueData = Array.from(uniqueTitles.values());

   let filteredData = [...uniqueData];
   const searchTerm = searchInput.value.toLowerCase();
   const category = filterCategory.value;
   const producer = filterProducer.value;
   const sifat = document.querySelector('input[name="filter-sifat"]:checked').value;
   const kelompok = filterKelompok.value;
   const tag = filterTag.value;
   const year = filterYear.value;
   const dataStartYear = filterDataStartYear.value;
   const dataEndYear = filterDataEndYear.value;

   if (searchTerm) filteredData = filteredData.filter(item => item.Judul && item.Judul.toLowerCase().includes(searchTerm));
   if (category) filteredData = filteredData.filter(item => item.Kategori === category);
   if (producer) filteredData = filteredData.filter(item => item['Produsen Data'] === producer);
   if (sifat) filteredData = filteredData.filter(item => item.Sifat === sifat);
   if (kelompok) filteredData = filteredData.filter(item => item.Kelompok === kelompok);
   if (tag) filteredData = filteredData.filter(item => (item.Tag || '').split(',').map(t => t.trim()).includes(tag));
   if (year) {
    filteredData = filteredData.filter(item => {
     const parts = (item.Tanggal || '').split('/');
     return parts.length === 3 && parts[2] === year;
    });
   }
   if(dataStartYear) {
     filteredData = filteredData.filter(item => {
       const yearRange = (item['Tahun Data'] || '').split('-');
       const itemEnd = parseInt(yearRange[1]?.trim() || yearRange[0]?.trim());
       return itemEnd && itemEnd >= parseInt(dataStartYear, 10);
     });
   }
   if(dataEndYear) {
     filteredData = filteredData.filter(item => {
       const yearRange = (item['Tahun Data'] || '').split('-');
       const itemStart = parseInt(yearRange[0]?.trim());
       return itemStart && itemStart <= parseInt(dataEndYear, 10);
     });
   }

   // === NEW SORTING LOGIC ===
   const sortValue = document.getElementById('sort-dataset-select') ? document.getElementById('sort-dataset-select').value : 'default';
   const parseDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string' || !dateStr.includes('/')) return null;
    const parts = dateStr.split('/'); // dd/MM/yyyy
    return new Date(parts[2], parts[1] - 1, parts[0]);
   };

   switch (sortValue) {
     case 'no-asc':
       filteredData.sort((a, b) => (parseInt(a.No, 10) || 0) - (parseInt(b.No, 10) || 0));
       break;
     case 'no-desc':
       filteredData.sort((a, b) => (parseInt(b.No, 10) || 0) - (parseInt(a.No, 10) || 0));
       break;
     case 'tanggal-desc':
       filteredData.sort((a, b) => {
         const dateA = parseDate(a.Tanggal);
         const dateB = parseDate(b.Tanggal);
         if (!dateA) return 1;
         if (!dateB) return -1;
         return dateB - dateA;
       });
       break;
     case 'tanggal-asc':
       filteredData.sort((a, b) => {
         const dateA = parseDate(a.Tanggal);
         const dateB = parseDate(b.Tanggal);
         if (!dateA) return 1;
         if (!dateB) return -1;
         return dateA - dateB;
       });
       break;
     case 'sifat-asc':
       filteredData.sort((a, b) => (a.Sifat || '').localeCompare(b.Sifat || ''));
       break;
     case 'default':
     default:
       filteredData.sort((a, b) => {
         const dateA = parseDate(a['Tanggal']);
         const dateB = parseDate(b['Tanggal']);
         if (dateA && dateB) {
           const dateComparison = dateB - dateA;
           if (dateComparison !== 0) return dateComparison;
         } else if (dateB) {
           return 1;
         } else if (dateA) {
           return -1;
         }
         const noA = parseInt(a['No'], 10) || 0;
         const noB = parseInt(b['No'], 10) || 0;
         return noB - noA;
       });
       break;
   }
   
   currentFilteredData = filteredData;
   currentPage = 1; // Selalu reset ke halaman pertama setelah filter
   renderPageContent();
 }
 
 function renderPageContent() {
  datasetList.innerHTML = '';
  paginationContainer.innerHTML = '';
  
  noDataMessage.classList.toggle('hidden', currentFilteredData.length > 0);
  datasetCount.innerHTML = `<i class="fa-solid fa-box-archive mr-2"></i> <strong>${currentFilteredData.length}</strong> Datasets Ditemukan`;

  if (currentFilteredData.length === 0) {
    return;
  }

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedItems = currentFilteredData.slice(startIndex, endIndex);

  const userString = sessionStorage.getItem('currentUser');
  const currentUser = userString ? JSON.parse(userString) : null;
  
  paginatedItems.forEach(item => {
   const originalIndex = allDatasets.indexOf(item);
   const sifatColor = getSifatColor(item.Sifat);
   
   let metaInfoHtml = `<span class="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">${item.Format || 'N/A'}</span>`;
   if (item.Kategori) {
    metaInfoHtml += `<span class="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-1 rounded-full"><i class="fas fa-folder-open mr-1"></i> ${item.Kategori}</span>`;
   }
   if (item['Tahun Data']) {
    metaInfoHtml += `<span class="inline-block bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full"><i class="fas fa-calendar-alt mr-1"></i> ${item['Tahun Data']}</span>`;
   }
   
   let actionButtonHtml = '';
   if (currentUser && (currentUser.Role === 'Super Admin' || (currentUser.Role === 'Admin' && currentUser.Username === item.User))) {
     actionButtonHtml = `<button class="edit-dataset-button text-yellow-500 hover:text-yellow-700 font-bold py-1 px-2 rounded-lg text-sm" data-id="${originalIndex}"><i class="fas fa-edit"></i></button>`;
   }

   datasetList.innerHTML += `
     <div class="dataset-card bg-white p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg hover:border-blue-500 transition-all duration-300">
       <div class="flex justify-between items-start">
         <h3 class="text-lg font-bold text-gray-800 mb-2 flex-grow cursor-pointer view-detail-trigger" data-id="${originalIndex}">
           ${item.Judul || 'Tanpa Judul'}
         </h3>
         <div class="flex items-center flex-shrink-0 ml-2">
           <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${sifatColor}">${item.Sifat || 'N/A'}</span>
           ${actionButtonHtml}
         </div>
       </div>
       <p class="text-gray-600 text-sm mb-4 line-clamp-2 cursor-pointer view-detail-trigger" data-id="${originalIndex}">${item.Uraian || 'Tidak ada uraian.'}</p>
       <div class="flex flex-wrap items-center justify-between gap-y-2">
         <div class="flex items-center gap-2 flex-wrap">${metaInfoHtml}</div>
         <div class="text-right flex-shrink-0">
           <span class="text-sm font-semibold text-blue-600">${item['Produsen Data'] || 'Sumber tidak diketahui'}</span>
         </div>
       </div>
     </div>
   `;
  });

  renderPaginationControls();
 }

 function renderPaginationControls() {
  const totalItems = currentFilteredData.length;
  paginationContainer.innerHTML = '';

  if (totalItems <= rowsPerPage) {
    return;
  }

  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const prevButton = document.createElement('button');
  prevButton.innerHTML = '&laquo;';
  prevButton.className = 'px-3 py-1 rounded-md text-gray-700 bg-white hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderPageContent();
    }
  });
  paginationContainer.appendChild(prevButton);

  const pageInfo = document.createElement('span');
  pageInfo.className = 'px-3 py-1 text-sm font-semibold text-gray-600';
  pageInfo.textContent = `Halaman ${currentPage} dari ${totalPages}`;
  paginationContainer.appendChild(pageInfo);

  const nextButton = document.createElement('button');
  nextButton.innerHTML = '&raquo;';
  nextButton.className = 'px-3 py-1 rounded-md text-gray-700 bg-white hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed';
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderPageContent();
    }
  });
  paginationContainer.appendChild(nextButton);
 }
 
 // === EVENT LISTENERS ===
 closeLoginModalButton.addEventListener('click', () => toggleLoginModal(false));
 loginForm.addEventListener('submit', handleLogin);

 userInfoContainer.addEventListener('click', function(e) {
   const trigger = e.target.closest('#admin-menu-trigger');
   const profileBtn = e.target.closest('#popup-menu-profile');
   const logoutBtn = e.target.closest('#popup-menu-logout');
   const loginBtn = e.target.closest('#admin-login-button');
   const combinedBell = e.target.closest('#combined-notification-bell');

   if (loginBtn) toggleLoginModal(true);
   if (trigger) {
     const menu = document.getElementById('admin-popup-menu');
     menu.classList.toggle('hidden');
     trigger.querySelector('i').classList.toggle('rotate-180');
   }
   if (profileBtn) {
     e.preventDefault();
     document.getElementById('admin-popup-menu').classList.add('hidden');
     toggleProfileModal(true);
   }
   if (logoutBtn) {
     e.preventDefault();
     document.getElementById('admin-popup-menu').classList.add('hidden');
     handleLogout();
   }
   if (combinedBell) {
     e.preventDefault();
     const userString = sessionStorage.getItem('currentUser');
     if(userString){
       const user = JSON.parse(userString);
       if (user.Role === 'Super Admin') {
         showMessagesView();
       } else {
         showRequestView();
       }
     }
   }
 });

 headerTitleLink.addEventListener('click', (e) => {
  e.preventDefault();
  showListView();
 });

 hamburgerMenuButton.addEventListener('click', () => {
  popupMenu.classList.remove('-translate-x-full');
  menuOverlay.classList.remove('hidden');
 });

 menuOverlay.addEventListener('click', () => {
  popupMenu.classList.add('-translate-x-full');
  menuOverlay.classList.add('hidden');
 });

 homeLink.addEventListener('click', (e) => {
   e.preventDefault();
   showListView();
   popupMenu.classList.add('-translate-x-full');
   menuOverlay.classList.add('hidden');
 });

 aboutLink.addEventListener('click', (e) => {
   e.preventDefault();
   showAboutView();
   popupMenu.classList.add('-translate-x-full');
   menuOverlay.classList.add('hidden');
 });
 
 statsLink.addEventListener('click', (e) => {
   e.preventDefault();
   showStatisticsView();
   popupMenu.classList.add('-translate-x-full');
   menuOverlay.classList.add('hidden');
 });
 
 adminListLink.addEventListener('click', (e) => {
   e.preventDefault();
   showAdminListView();
   popupMenu.classList.add('-translate-x-full');
   menuOverlay.classList.add('hidden');
 });
 
 requestLink.addEventListener('click', (e) => {
   e.preventDefault();
   showRequestView();
   popupMenu.classList.add('-translate-x-full');
   menuOverlay.classList.add('hidden');
 });
 
 messageLink.addEventListener('click', (e) => {
   e.preventDefault();
   showMessagesView();
   popupMenu.classList.add('-translate-x-full');
   menuOverlay.classList.add('hidden');
 });

 requestViewContainer.addEventListener('click', e => {
  if (e.target.classList.contains('status-update-button')) {
    handleStatusUpdateClick(e);
  }
 });
 
 messageListContainer.addEventListener('click', e => {
   const messageItem = e.target.closest('.message-item');
   if (messageItem && messageItem.dataset.status !== 'Read') {
     const rowIndex = messageItem.dataset.rowIndex;
     google.script.run
       .withSuccessHandler(() => {
         messageItem.classList.remove('bg-blue-50');
         messageItem.classList.add('bg-white');
         messageItem.dataset.status = 'Read';
         const statusLabel = messageItem.querySelector('.status-label');
         if (statusLabel) {
           statusLabel.remove();
         }
       })
       .updateMessageStatus(rowIndex);
   }
 });

 cancelRequestForm.addEventListener('click', () => toggleRequestDataModal(false));
 requestDataForm.addEventListener('submit', handleAddRequest);

 window.addEventListener('click', function(e) {
   if (!userInfoContainer.contains(e.target)) {
     const menu = document.getElementById('admin-popup-menu');
     if (menu && !menu.classList.contains('hidden')) {
       menu.classList.add('hidden');
       document.querySelector('#admin-menu-trigger i').classList.remove('rotate-180');
     }
   }
 });
 
 if (resetPasswordForm) {
   closeResetPasswordModalButton.addEventListener('click', () => toggleResetPasswordModal(false));
   resetPasswordForm.addEventListener('submit', handleResetPassword);
 }

 if (addDatasetForm) {
  closeAddDatasetModalButton.addEventListener('click', () => toggleAddDatasetModal(false));
  cancelAddDatasetButton.addEventListener('click', () => toggleAddDatasetModal(false));
  addDatasetForm.addEventListener('submit', handleAddNewDataset);
 }
 
 if(editDatasetForm) {
  closeEditDatasetModalButton.addEventListener('click', () => toggleEditDatasetModal(false));
  cancelEditDatasetButton.addEventListener('click', () => toggleEditDatasetModal(false));
  editDatasetForm.addEventListener('submit', handleUpdateDataset);
 }

 if (addKategoriSelect) {
   addKategoriSelect.addEventListener('change', function() {
     addKategoriNewInput.style.display = this.value === '--tambah-baru--' ? 'block' : 'none';
     if(this.value === '--tambah-baru--') addKategoriNewInput.focus();
   });
 }

 if (addDatasetTriggerButton) {
  addDatasetTriggerButton.addEventListener('click', () => toggleAddDatasetModal(true));
 }
 
 if (reloadDatasetButton) {
   reloadDatasetButton.addEventListener('click', () => {
     const icon = reloadDatasetButton.querySelector('i');
     icon.classList.add('fa-spin');
     reloadDatasetButton.disabled = true;

     setTimeout(() => {
       loadInitialData(false, () => {
         icon.classList.remove('fa-spin');
         reloadDatasetButton.disabled = false;
       });
     }, 200);
   });
 }
 
 detailViewContainer.addEventListener('click', function(e) {
   if (e.target.closest('#detail-edit-button')) {
     toggleEditDatasetModal(true, allDatasets[currentDetailItemIndex]);
   }
   if (e.target.closest('#detail-update-button')) {
    toggleAddDatasetModal(true, allDatasets[currentDetailItemIndex]);
   }
   if (e.target.closest('#detail-request-button')) {
    toggleRequestDataModal(true, allDatasets[currentDetailItemIndex]);
   }
 });

 document.getElementById('detail-download-link').addEventListener('click', function(e) {
   const item = allDatasets[currentDetailItemIndex];
   if (item) {
     const userString = sessionStorage.getItem('currentUser');
     const user = userString ? JSON.parse(userString) : { Username: 'Guest' };
     google.script.run.recordDownload(item.Judul, user.Username);
   }
 });

 popularDatasetsList.addEventListener('click', function(e) {
  const target = e.target.closest('.popular-dataset-item');
  if(target) {
    const title = target.dataset.title;
    const datasetIndex = allDatasets.findIndex(d => d.Judul === title);
    if (datasetIndex > -1) {
      showDetailView(datasetIndex);
    }
  }
 });


 ['input', 'change'].forEach(evt => {
  searchInput.addEventListener(evt, applyFiltersAndRender);
  filterCategory.addEventListener(evt, applyFiltersAndRender);
  filterProducer.addEventListener(evt, applyFiltersAndRender);
  filterKelompok.addEventListener(evt, applyFiltersAndRender);
  filterTag.addEventListener(evt, applyFiltersAndRender);
  filterYear.addEventListener(evt, applyFiltersAndRender);
  filterDataStartYear.addEventListener(evt, applyFiltersAndRender);
  filterDataEndYear.addEventListener('change', applyFiltersAndRender);
 });
 
 if (filterSifatContainer) {
  filterSifatContainer.addEventListener('change', applyFiltersAndRender);
 }

 resetFilterButton.addEventListener('click', () => {
   searchInput.value = '';
   filterCategory.value = '';
   document.getElementById('sifat-semua').checked = true;
   filterProducer.value = '';
   filterKelompok.value = '';
   filterTag.value = '';
   filterYear.value = '';
   filterDataStartYear.value = '';
   filterDataEndYear.value = '';
   document.getElementById('sort-dataset-select').value = 'default';
   applyFiltersAndRender();
 });
 backToListButton.addEventListener('click', showListView);

 datasetList.addEventListener('click', function(e) {
  const viewTrigger = e.target.closest('.view-detail-trigger');
  const editButton = e.target.closest('.edit-dataset-button');
  
  if (editButton) {
    e.stopPropagation();
    const dataset = allDatasets[editButton.dataset.id];
    toggleEditDatasetModal(true, dataset);
  } else if (viewTrigger) {
   showDetailView(viewTrigger.dataset.id);
  }
 });

 if (toggleFilterBtn) {
  toggleFilterBtn.addEventListener('click', () => {
    filterContent.classList.toggle('hidden');
    toggleFilterBtn.querySelector('i').classList.toggle('rotate-180');
  });
 }

 function loadAndRenderStats() {
  google.script.run
    .withSuccessHandler(stats => {
      if (stats.success) {
        document.getElementById('stats-total-visitors').textContent = stats.totalVisits || 0;
        document.getElementById('stats-total-downloads').textContent = stats.totalDownloads || 0;

        if (monthlyChart) {
          monthlyChart.destroy();
        }
        if (yearlyChart) {
          yearlyChart.destroy();
        }

        const monthlyCtx = document.getElementById('monthly-visits-chart').getContext('2d');
        monthlyChart = new Chart(monthlyCtx, {
          type: 'bar',
          data: {
            labels: Object.keys(stats.monthlyVisits),
            datasets: [{
              label: 'Jumlah Pengunjung',
              data: Object.values(stats.monthlyVisits),
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }]
          },
          options: {
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
            responsive: true,
            maintainAspectRatio: false
          }
        });

        const yearlyCtx = document.getElementById('yearly-visits-chart').getContext('2d');
        yearlyChart = new Chart(yearlyCtx, {
          type: 'line',
          data: {
            labels: Object.keys(stats.yearlyVisits),
            datasets: [{
              label: 'Jumlah Pengunjung',
              data: Object.values(stats.yearlyVisits),
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }]
          },
          options: {
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
            responsive: true,
            maintainAspectRatio: false
          }
        });
        
        // Render Admin Login Counts
        const adminLoginTableBody = document.getElementById('admin-logins-table-body');
        if (adminLoginTableBody) {
          adminLoginTableBody.innerHTML = ''; // Clear previous data
          const adminLoginCounts = stats.adminLoginCounts || {};
          const adminUsernames = Object.keys(adminLoginCounts);

          if (adminUsernames.length > 0) {
            adminUsernames.forEach(username => {
              const count = adminLoginCounts[username];
              const tr = document.createElement('tr');
              tr.className = 'border-b hover:bg-gray-50';
              tr.innerHTML = `
                <td class="py-3 px-6">${username}</td>
                <td class="py-3 px-6 font-medium">${count}</td>
              `;
              adminLoginTableBody.appendChild(tr);
            });
          } else {
            adminLoginTableBody.innerHTML = '<tr><td colspan="2" class="text-center py-6 text-gray-500">Belum ada data login admin.</td></tr>';
          }
        }
      } else {
        console.error("Gagal mengambil data statistik:", stats.message);
      }
    })
    .withFailureHandler(err => {
      console.error("Error saat memanggil getStats:", err);
    })
    .getStats();
 }
 
 function loadAndRenderAdminList() {
   google.script.run.withSuccessHandler(response => {
     if (response.success) {
       allUsers = response.users;
       adminListTableBody.innerHTML = '';
       adminListCardsContainer.innerHTML = ''; 

       if (allUsers.length === 0) {
         const noDataHtml = `<div class="text-center py-6 text-gray-500">Tidak ada admin terdaftar.</div>`;
         adminListTableBody.innerHTML = `<tr><td colspan="5">${noDataHtml}</td></tr>`;
         adminListCardsContainer.innerHTML = noDataHtml;
         return;
       }

       allUsers.forEach((user, index) => {
         const roleColor = user.Role === 'Super Admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
         
         // Table Row for Desktop
         const tr = document.createElement('tr');
         tr.className = 'hover:bg-gray-50';
         tr.innerHTML = `
           <td class="py-3 px-4">
             <p class="font-semibold text-gray-900">${user.Nama}</p>
             <p class="text-sm text-gray-500">${user.Jabatan}</p>
           </td>
           <td class="py-3 px-4 text-gray-700">${user.Username}</td>
           <td class="py-3 px-4 text-gray-700">${user.Unit}</td>
           <td class="py-3 px-4"><span class="px-2 py-1 text-xs font-semibold rounded-full ${roleColor}">${user.Role}</span></td>
           <td class="py-3 px-4">
             <button class="edit-user-button text-blue-600 hover:text-blue-800" data-index="${index}" title="Edit Pengguna">
               <i class="fas fa-edit"></i>
             </button>
           </td>
         `;
         adminListTableBody.appendChild(tr);

         // Card for Mobile
         const card = document.createElement('div');
         card.className = 'bg-white p-4 rounded-lg shadow border border-gray-200 space-y-3';
         card.innerHTML = `
           <div class="flex justify-between items-start">
             <div>
               <p class="font-bold text-gray-800">${user.Nama}</p>
               <p class="text-sm text-gray-500">${user.Username}</p>
             </div>
             <span class="px-2 py-1 text-xs font-semibold rounded-full ${roleColor}">${user.Role}</span>
           </div>
           <div class="text-sm text-gray-600 border-t pt-3">
             <p><strong>Unit:</strong> ${user.Unit}</p>
             <p><strong>Jabatan:</strong> ${user.Jabatan}</p>
           </div>
           <div class="text-right border-t pt-3">
             <button class="edit-user-button text-blue-600 bg-blue-50 hover:bg-blue-100 font-semibold py-2 px-4 rounded-lg" data-index="${index}">
               <i class="fas fa-edit mr-2"></i>Edit
             </button>
           </div>
         `;
         adminListCardsContainer.appendChild(card);
       });
     }
   }).getUsers();
 }
 
 function handleSaveUser(e) {
   e.preventDefault();
   const formData = new FormData(userForm);
   const userData = Object.fromEntries(formData.entries());

   const handler = userData.rowIndex ? 'updateUser' : 'addUser';

   google.script.run.withSuccessHandler(response => {
     if (response.success) {
       userModal.classList.add('hidden');
       loadAndRenderAdminList();
     } else {
       userFormError.textContent = response.message;
       userFormError.classList.remove('hidden');
     }
   }).withFailureHandler(err => {
     userFormError.textContent = err.message;
     userFormError.classList.remove('hidden');
   })[handler](userData);
 }

 function handleSaveProfile(e) {
   e.preventDefault();
   const userString = sessionStorage.getItem('currentUser');
   if (!userString) return;

   const user = JSON.parse(userString);
   const formData = new FormData(profileForm);
   const profileData = Object.fromEntries(formData.entries());
   
   const updatedUser = { ...user, ...profileData, rowIndex: user.rowIndex };

   google.script.run.withSuccessHandler(response => {
     if (response.success) {
       profileFormSuccess.textContent = "Profil berhasil diperbarui.";
       profileFormSuccess.classList.remove('hidden');
       sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
       updateUIForLoginStatus();
       setTimeout(() => {
         profileFormSuccess.classList.add('hidden');
       }, 3000);
     } else {
       profileFormError.textContent = response.message;
       profileFormError.classList.remove('hidden');
     }
   }).updateUser(updatedUser);
 }

 // === INISIALISASI ===
 function initializeApp() {
  const sortDatasetSelect = document.getElementById('sort-dataset-select');
  if(sortDatasetSelect){
    sortDatasetSelect.addEventListener('change', applyFiltersAndRender);
  }

  updateUIForLoginStatus();
  loadInitialData();

  addUserButton.addEventListener('click', () => {
    userForm.reset();
    document.getElementById('user-rowIndex').value = '';
    userModalTitle.textContent = 'Tambah Admin Baru';
    userModal.classList.remove('hidden');
  });

  cancelUserForm.addEventListener('click', () => {
    userModal.classList.add('hidden');
  });

  userForm.addEventListener('submit', handleSaveUser);

  adminListViewContainer.addEventListener('click', e => {
    const editButton = e.target.closest('.edit-user-button');
    
    if (editButton) {
      const user = allUsers[editButton.dataset.index];
      userModalTitle.textContent = 'Edit Admin';
      Object.keys(user).forEach(key => {
        const input = userForm.elements[key];
        if (input) {
          input.value = user[key];
        }
      });
      document.getElementById('user-rowIndex').value = user.rowIndex; 
      document.getElementById('user-password').value = ''; 
      userModal.classList.remove('hidden');
    }
  });

  // Event listeners for profile modal
  cancelProfileForm.addEventListener('click', () => toggleProfileModal(false));
  profileForm.addEventListener('submit', handleSaveProfile);
  profileOpenResetPassword.addEventListener('click', (e) => {
    e.preventDefault();
    toggleProfileModal(false);
    toggleResetPasswordModal(true);
  });

  closeCustomAlertButton.addEventListener('click', () => {
    customAlertModal.classList.add('hidden');
  });

  // Event listeners for chat button
  chatButton.addEventListener('click', () => toggleMessageModal(true));
  closeMessageModalButton.addEventListener('click', () => toggleMessageModal(false));
  cancelMessageFormButton.addEventListener('click', () => toggleMessageModal(false));
  messageForm.addEventListener('submit', handleSendMessage);
 }
 
 initializeApp();

});
