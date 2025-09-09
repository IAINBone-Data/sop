/**
 * =================================================================================
 * SCRIPT APLIKASI UTAMA - SATU DATA IAIN BONE
 * =================================================================================
 * File ini berisi semua logika JavaScript untuk mengelola frontend aplikasi.
 *
 * PENTING:
 * 1. Pastikan Anda sudah men-deploy Google Apps Script (Code.gs) sebagai Web App.
 * 2. Ganti nilai variabel WEB_APP_URL di bawah dengan URL Web App Anda.
 * 3. Pastikan file ini ('app.js') berada di folder yang sama dengan 'index.html'.
 */

// --- KONFIGURASI APLIKASI ---
// Ganti URL ini dengan URL Web App dari Google Apps Script Anda.
const WEB_APP_URL = 'GANTI_DENGAN_URL_WEB_APP_ANDA';

document.addEventListener('DOMContentLoaded', function () {
 // === DOM ELEMENTS CACHING ===
 const DOM = {};
 const cacheDOMElements = () => {
  const ids = [
    'loginModal', 'loginForm', 'loginButton', 'loginButtonText', 'loginSpinner', 'loginError', 'closeLoginModalButton',
    'userInfoContainer', 'listViewContainer', 'detailViewContainer', 'aboutViewContainer', 'statsViewContainer',
    'adminListViewContainer', 'datasetList', 'datasetCount', 'searchInput', 'filterCategory', 'filterSifatContainer',
    'filterProducer', 'filterTag', 'loadingIndicator', 'noDataMessage', 'resetFilterButton',
    'paginationContainer', 'filterYear', 'filterDataStartYear', 'filterDataEndYear', 'backToListButton', 'detailActionButtons',
    'headerTitleLink', 'hamburgerMenuButton', 'popupMenu', 'menuOverlay', 'homeLink', 'aboutLink', 'statsLink',
    'adminListLink', 'statsMenuItem', 'adminListMenuItem', 'panduanMenuItem', 'requestMenuItem', 'requestLink',
    'requestViewContainer', 'requestListTableBody', 'requestListCards', 'requestDataModal', 'requestDataForm',
    'cancelRequestForm', 'requestModalDatasetTitle', 'requestFormError', 'requestButtonContainer', 'messageMenuItem',
    'messageLink', 'messageViewContainer', 'messageListContainer', 'customAlertModal', 'customAlertMessage',
    'closeCustomAlertButton', 'customAlertIconContainer', 'statTotalDataset', 'statTotalProducer', 'statTotalCategory', 'popularDatasetsList',
    'noPopularDatasets', 'resetPasswordModal', 'resetPasswordForm', 'closeResetPasswordModalButton', 'resetPasswordError',
    'resetPasswordSuccess', 'resetSubmitButton', 'resetButtonText', 'resetSpinner', 'addDatasetModal',
    'addDatasetForm', 'closeAddDatasetModalButton', 'cancelAddDatasetButton', 'addDatasetError', 'addDatasetSuccess',
    'submitAddDatasetButton', 'addDatasetButtonText', 'addDatasetSpinner', 'addKategori', 'addKategoriNew',
    'editDatasetModal', 'editDatasetForm', 'closeEditDatasetModalButton', 'cancelEditDatasetButton',
    'submitEditDatasetButton', 'editDatasetError', 'editDatasetSuccess', 'editDatasetButtonText', 'editDatasetSpinner',
    'userModal', 'userForm', 'userModalTitle', 'addUserButton', 'cancelUserForm', 'adminListTableBody', 'userFormError',
    'adminListCards', 'profileModal', 'profileForm', 'cancelProfileForm', 'saveProfileButton',
    'profileOpenResetPassword', 'profileFormError', 'profileFormSuccess', 'addDatasetButtonContainer',
    'addDatasetTriggerButton', 'reloadDatasetButton', 'chatButton', 'messageModal', 'messageForm', 'closeMessageModalButton',
    'cancelMessageForm', 'submitMessageButton', 'sendMessageButtonText', 'sendMessageSpinner', 'messageFormError',
    'toggleFilterBtn', 'filterContent', 'sortDatasetSelect', 'detailTitle', 'detailUraian', 'detailSifat',
    'detailFileTitle', 'detailFilenameDisplay', 'detailFileFormat', 'detailDownloadLink', 'metaProdusen',
    'metaPenanggungJawab', 'metaTanggal', 'metaDiperbaharui', 'metaFrekuensi', 'metaTahunData', 'tablePreviewContainer',
    'tablePreviewContent', 'historySection', 'historyList', 'noHistoryMessage', 'addProdusenData', 'editProdusenData',
    'editKategori', 'currentFileInfo', 'statsTotalVisitors', 'statsTotalDownloads', 'monthlyVisitsChart', 'yearlyVisitsChart',
    'adminLoginsTableBody'
  ];
  ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
          const key = id.replace(/-./g, m => m[1].toUpperCase());
          DOM[key] = el;
      }
  });
 };

 // === STATE MANAGEMENT ===
 let allDatasets = [];
 let allUsers = [];
 let filterOptionsCache = null;
 let currentDetailItemIndex = -1;
 let currentPage = 1;
 const rowsPerPage = 10;
 let currentFilteredData = [];
 let monthlyChart = null;
 let yearlyChart = null;
 
 // === API HELPER ===
 const callAppsScript = async (action, payload = {}) => {
  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload }),
      redirect: 'follow'
    });
    if (!response.ok) {
        throw new Error(`Network response error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Call Error for action "${action}":`, error);
    return { success: false, message: error.message };
  }
 };

 // === MAIN FUNCTIONS ===

 const initializeApp = () => {
  if (WEB_APP_URL === 'GANTI_DENGAN_URL_WEB_APP_ANDA' || !WEB_APP_URL) {
    showErrorState('Konfigurasi Error', 'Harap ganti "GANTI_DENGAN_URL_WEB_APP_ANDA" dengan URL Web App Anda yang valid di dalam file app.js.');
    return;
  }
  cacheDOMElements();
  setupEventListeners();
  updateUIForLoginStatus();
  loadInitialData();
 };

 const loadInitialData = async (keepDetailView = false, callback) => {
  setLoadingState(true);
  if (!keepDetailView) {
    DOM.datasetList.innerHTML = '';
  }
  
  const response = await callAppsScript('getInitialData');

  if (response.success) {
    allDatasets = response.data.datasets || [];
    filterOptionsCache = response.data.filterOptions || {};
    
    allDatasets.sort((a, b) => (parseInt(b.No, 10) || 0) - (parseInt(a.No, 10) || 0));

    if (keepDetailView && currentDetailItemIndex > -1) {
      const currentItem = allDatasets[currentDetailItemIndex];
      if (currentItem) {
        const updatedItem = allDatasets.find(d => d.rowIndex === currentItem.rowIndex);
        const newIndex = updatedItem ? allDatasets.indexOf(updatedItem) : -1;
        showDetailView(newIndex > -1 ? newIndex : 0);
      } else {
        showView('listViewContainer');
      }
    } else {
      applyFiltersAndRender();
    }
    updateSummaryStats();
    populateFilterOptions();
    loadTopVisited();
  } else {
    showErrorState('Gagal Memuat Data', response.message);
  }
  setLoadingState(false);
  if(callback) callback();
 };
 
 // === EVENT LISTENERS SETUP ===

 const setupEventListeners = () => {
    DOM.closeLoginModalButton.addEventListener('click', () => toggleModal('loginModal', false));
    DOM.loginForm.addEventListener('submit', handleLogin);
    DOM.userInfoContainer.addEventListener('click', handleUserMenuClick);
    window.addEventListener('click', closeAdminPopupOnClickOutside);
    DOM.headerTitleLink.addEventListener('click', (e) => { e.preventDefault(); showView('listViewContainer'); });
    DOM.hamburgerMenuButton.addEventListener('click', () => toggleSideMenu(true));
    DOM.menuOverlay.addEventListener('click', () => toggleSideMenu(false));
    DOM.homeLink.addEventListener('click', (e) => { e.preventDefault(); showView('listViewContainer', true); });
    DOM.aboutLink.addEventListener('click', (e) => { e.preventDefault(); showView('aboutViewContainer', true); });
    DOM.statsLink.addEventListener('click', (e) => { e.preventDefault(); showView('statsViewContainer', true); loadAndRenderStats(); });
    DOM.adminListLink.addEventListener('click', (e) => { e.preventDefault(); showView('adminListViewContainer', true); loadAndRenderAdminList(); });
    DOM.requestLink.addEventListener('click', (e) => { e.preventDefault(); showView('requestViewContainer', true); loadAndRenderRequests(); });
    DOM.messageLink.addEventListener('click', (e) => { e.preventDefault(); showView('messageViewContainer', true); loadAndRenderMessages(); });
    DOM.backToListButton.addEventListener('click', () => showView('listViewContainer'));
    const filterInputs = [DOM.searchInput, DOM.filterCategory, DOM.filterProducer, DOM.filterTag, DOM.filterYear, DOM.filterDataStartYear, DOM.filterDataEndYear];
    filterInputs.forEach(input => input.addEventListener('input', applyFiltersAndRender));
    DOM.sortDatasetSelect.addEventListener('change', applyFiltersAndRender);
    DOM.resetFilterButton.addEventListener('click', resetFilters);
    DOM.filterSifatContainer.addEventListener('change', applyFiltersAndRender);
    DOM.toggleFilterBtn.addEventListener('click', () => {
      DOM.filterContent.classList.toggle('hidden');
      DOM.toggleFilterBtn.querySelector('i').classList.toggle('rotate-180');
    });
    DOM.reloadDatasetButton.addEventListener('click', handleReload);
    DOM.datasetList.addEventListener('click', handleDatasetListClick);
    DOM.detailViewContainer.addEventListener('click', handleDetailViewActions);
    DOM.detailDownloadLink.addEventListener('click', handleDownload);
    DOM.popularDatasetsList.addEventListener('click', handlePopularDatasetClick);
    DOM.addDatasetTriggerButton.addEventListener('click', () => toggleAddDatasetModal(true));
    DOM.closeAddDatasetModalButton.addEventListener('click', () => toggleAddDatasetModal(false));
    DOM.cancelAddDatasetButton.addEventListener('click', () => toggleAddDatasetModal(false));
    DOM.addDatasetForm.addEventListener('submit', handleAddOrEditDataset);
    DOM.addKategori.addEventListener('change', () => DOM.addKategoriNew.classList.toggle('hidden', DOM.addKategori.value !== '--tambah-baru--'));
    DOM.closeEditDatasetModalButton.addEventListener('click', () => toggleEditDatasetModal(false));
    DOM.cancelEditDatasetButton.addEventListener('click', () => toggleEditDatasetModal(false));
    DOM.editDatasetForm.addEventListener('submit', handleAddOrEditDataset);
    DOM.cancelProfileForm.addEventListener('click', () => toggleProfileModal(false));
    DOM.profileForm.addEventListener('submit', handleSaveProfile);
    DOM.profileOpenResetPassword.addEventListener('click', (e) => { e.preventDefault(); toggleProfileModal(false); toggleResetPasswordModal(true); });
    DOM.closeResetPasswordModalButton.addEventListener('click', () => toggleResetPasswordModal(false));
    DOM.resetPasswordForm.addEventListener('submit', handleResetPassword);
    DOM.addUserButton.addEventListener('click', () => toggleUserModal(true));
    DOM.cancelUserForm.addEventListener('click', () => toggleUserModal(false));
    DOM.userForm.addEventListener('submit', handleSaveUser);
    DOM.adminListViewContainer.addEventListener('click', (e) => {
      const editButton = e.target.closest('.edit-user-button');
      if (editButton) toggleUserModal(true, allUsers[editButton.dataset.index]);
    });
    DOM.requestDataForm.addEventListener('submit', handleAddRequest);
    DOM.cancelRequestForm.addEventListener('click', () => toggleRequestDataModal(false));
    DOM.requestViewContainer.addEventListener('click', (e) => { if (e.target.closest('.status-update-button')) handleStatusUpdateClick(e); });
    DOM.messageListContainer.addEventListener('click', handleMessageClick);
    DOM.chatButton.addEventListener('click', () => toggleMessageModal(true));
    DOM.closeMessageModalButton.addEventListener('click', () => toggleMessageModal(false));
    DOM.cancelMessageForm.addEventListener('click', () => toggleMessageModal(false));
    DOM.messageForm.addEventListener('submit', handleSendMessage);
    DOM.closeCustomAlertButton.addEventListener('click', () => toggleModal('customAlertModal', false));
 };

//==================================================
// AUTHENTICATION & UI UPDATE FUNCTIONS
//==================================================

async function handleLogin(e) {
  e.preventDefault();
  setButtonLoading(DOM.loginButton, DOM.loginSpinner, DOM.loginButtonText, true);
  DOM.loginError.classList.add('hidden');
  const username = DOM.loginForm.username.value;
  const password = DOM.loginForm.password.value;

  const response = await callAppsScript('login', { username, password });

  if (response.success) {
    sessionStorage.setItem('currentUser', JSON.stringify(response.user));
    updateUIForLoginStatus();
    toggleModal('loginModal', false);
    DOM.loginForm.reset();
    await loadInitialData(); 
  } else {
    DOM.loginError.textContent = response.message || "Login gagal.";
    DOM.loginError.classList.remove('hidden');
  }
  setButtonLoading(DOM.loginButton, DOM.loginSpinner, DOM.loginButtonText, false);
}

function handleLogout() {
  sessionStorage.removeItem('currentUser');
  updateUIForLoginStatus();
  showView('listViewContainer');
  applyFiltersAndRender();
}

function updateUIForLoginStatus() {
  const userString = sessionStorage.getItem('currentUser');
  const user = userString ? JSON.parse(userString) : null;
  
  [DOM.statsMenuItem, DOM.adminListMenuItem, DOM.panduanMenuItem, DOM.requestMenuItem, DOM.messageMenuItem].forEach(item => item.classList.add('hidden'));
  DOM.addDatasetButtonContainer.classList.add('hidden');

  if (user) {
    DOM.userInfoContainer.innerHTML = `
      <div class="relative">
        <button id="admin-menu-trigger" class="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100">
          <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">${user.Nama ? user.Nama.charAt(0).toUpperCase() : 'A'}</div>
          <span class="font-semibold text-sm text-gray-800 hidden md:block">${user.Nama || user.Username}</span>
          <i class="fas fa-chevron-down text-xs text-gray-500"></i>
        </button>
        <div id="admin-popup-menu" class="admin-popup hidden w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1">
          <div class="px-4 py-3 border-b"><p class="text-sm font-semibold truncate">${user.Nama}</p><p class="text-xs text-gray-500 truncate">${user.Unit}</p></div>
          <div class="py-1">
            <a href="#" id="popup-menu-profile" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-user-circle w-5 mr-3 text-gray-400"></i>Profil</a>
            <a href="#" id="popup-menu-logout" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-sign-out-alt w-5 mr-3 text-gray-400"></i>Logout</a>
          </div>
        </div>
      </div>
    `;
    DOM.panduanMenuItem.classList.remove('hidden');
    if (user.Role === 'Super Admin' || user.Role === 'Admin') {
      DOM.addDatasetButtonContainer.classList.remove('hidden');
      DOM.requestMenuItem.classList.remove('hidden');
    }
    if (user.Role === 'Super Admin') {
      DOM.statsMenuItem.classList.remove('hidden');
      DOM.adminListMenuItem.classList.remove('hidden');
      DOM.messageMenuItem.classList.remove('hidden');
    }
  } else {
    DOM.userInfoContainer.innerHTML = `<button id="admin-login-button" class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 text-sm"><i class="fas fa-sign-in-alt mr-2"></i>Login</button>`;
  }
}

//==================================================
// DATA RENDERING & FILTERING
//==================================================

function applyFiltersAndRender() {
    let baseData = allDatasets;
    const userString = sessionStorage.getItem('currentUser');
    if (!userString) {
        baseData = allDatasets.filter(item => item.Sifat === 'Terbuka');
    } else {
        const user = JSON.parse(userString);
        if (user.Role === 'Terbatas') {
            baseData = allDatasets.filter(item => item.Sifat === 'Terbuka' || item.Sifat === 'Terbatas');
        } else if (user.Role === 'Admin') {
            baseData = allDatasets.filter(item => item.User === user.Username || item.Sifat !== 'Tertutup');
        }
    }

    const uniqueTitles = new Map();
    const sortedBaseData = [...baseData].sort((a,b) => {
        const dateA = new Date(a.Diperbaharui?.split('/').reverse().join('-'));
        const dateB = new Date(b.Diperbaharui?.split('/').reverse().join('-'));
        return dateB - dateA;
    });

    sortedBaseData.forEach(item => {
        if (!uniqueTitles.has(item.Judul)) {
            uniqueTitles.set(item.Judul, item);
        }
    });

    let filteredData = Array.from(uniqueTitles.values());
    const searchTerm = DOM.searchInput.value.toLowerCase();
    const category = DOM.filterCategory.value;
    const producer = DOM.filterProducer.value;
    const sifat = document.querySelector('input[name="filter-sifat"]:checked').value;
    const tag = DOM.filterTag.value;
    const year = DOM.filterYear.value;
    const startYear = DOM.filterDataStartYear.value;
    const endYear = DOM.filterDataEndYear.value;

    if (searchTerm) filteredData = filteredData.filter(item => (item.Judul || '').toLowerCase().includes(searchTerm) || (item.Uraian || '').toLowerCase().includes(searchTerm) || (item.Tag || '').toLowerCase().includes(searchTerm));
    if (category) filteredData = filteredData.filter(item => item.Kategori === category);
    if (producer) filteredData = filteredData.filter(item => item['Produsen Data'] === producer);
    if (sifat) filteredData = filteredData.filter(item => item.Sifat === sifat);
    if (tag) filteredData = filteredData.filter(item => (item.Tag || '').split(',').map(t => t.trim()).includes(tag));
    if (year) filteredData = filteredData.filter(item => (item.Tanggal || '').endsWith(`/${year}`));
    if (startYear) filteredData = filteredData.filter(item => (item['Tahun Data'] || '').split('-')[1]?.trim() >= startYear);
    if (endYear) filteredData = filteredData.filter(item => (item['Tahun Data'] || '').split('-')[0]?.trim() <= endYear);

    const sortValue = DOM.sortDatasetSelect.value;
    const parseDate = (dateStr) => {
        if (!dateStr || !dateStr.includes('/')) return null;
        const [d, m, y] = dateStr.split('/');
        return new Date(`${y}-${m}-${d}`);
    };
    filteredData.sort((a, b) => {
        switch (sortValue) {
            case 'no-desc': return (b.No || 0) - (a.No || 0);
            case 'no-asc': return (a.No || 0) - (b.No || 0);
            case 'tanggal-desc': return (parseDate(b.Diperbaharui) || 0) - (parseDate(a.Diperbaharui) || 0);
            case 'tanggal-asc': return (parseDate(a.Diperbaharui) || 0) - (parseDate(b.Diperbaharui) || 0);
            default: return (b.No || 0) - (a.No || 0);
        }
    });

    currentFilteredData = filteredData;
    currentPage = 1;
    renderPageContent();
}

function renderPageContent() {
    DOM.datasetList.innerHTML = '';
    DOM.noDataMessage.classList.toggle('hidden', currentFilteredData.length > 0);
    if (currentFilteredData.length === 0) {
        DOM.paginationContainer.innerHTML = '';
        updateDatasetCount();
        return;
    }
    
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedItems = currentFilteredData.slice(startIndex, startIndex + rowsPerPage);
    const user = JSON.parse(sessionStorage.getItem('currentUser') || 'null');

    paginatedItems.forEach(item => {
        const originalIndex = allDatasets.findIndex(d => d.rowIndex === item.rowIndex);
        const sifatColor = getSifatColor(item.Sifat);
        
        let actionButtonHtml = '';
        if (user && (user.Role === 'Super Admin' || (user.Role === 'Admin' && user.Username === item.User))) {
            actionButtonHtml = `<button class="edit-dataset-button text-yellow-500 hover:text-yellow-700 font-bold py-1 px-2 rounded-lg text-sm" data-id="${originalIndex}"><i class="fas fa-edit"></i></button>`;
        }

        DOM.datasetList.innerHTML += `
            <div class="dataset-card bg-white p-5 rounded-lg shadow-md border hover:shadow-lg hover:border-blue-500 transition-all">
                <div class="flex justify-between items-start">
                    <h3 class="text-lg font-bold text-gray-800 mb-2 flex-grow cursor-pointer view-detail-trigger" data-id="${originalIndex}">${item.Judul || 'Tanpa Judul'}</h3>
                    <div class="flex items-center flex-shrink-0 ml-2">
                        <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${sifatColor}">${item.Sifat || 'N/A'}</span>
                        ${actionButtonHtml}
                    </div>
                </div>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2 cursor-pointer view-detail-trigger" data-id="${originalIndex}">${item.Uraian || 'Tidak ada uraian.'}</p>
                <div class="flex flex-wrap items-center justify-between gap-y-2">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">${item.Format || 'N/A'}</span>
                        ${item.Kategori ? `<span class="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-1 rounded-full"><i class="fas fa-folder-open mr-1"></i> ${item.Kategori}</span>` : ''}
                        ${item['Tahun Data'] ? `<span class="inline-block bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full"><i class="fas fa-calendar-alt mr-1"></i> ${item['Tahun Data']}</span>` : ''}
                    </div>
                    <div class="text-right flex-shrink-0"><span class="text-sm font-semibold text-blue-600">${item['Produsen Data'] || 'N/A'}</span></div>
                </div>
            </div>`;
    });

    renderPaginationControls();
    updateDatasetCount();
}

function renderPaginationControls() {
    DOM.paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(currentFilteredData.length / rowsPerPage);
    if (totalPages <= 1) return;

    let paginationHTML = '';
    paginationHTML += `<button class="px-3 py-1 rounded-md ${currentPage === 1 ? 'opacity-50' : 'hover:bg-blue-100'}" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">&laquo;</button>`;
    paginationHTML += `<span class="px-3 py-1 text-sm">Halaman ${currentPage} dari ${totalPages}</span>`;
    paginationHTML += `<button class="px-3 py-1 rounded-md ${currentPage === totalPages ? 'opacity-50' : 'hover:bg-blue-100'}" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">&raquo;</button>`;
    
    DOM.paginationContainer.innerHTML = paginationHTML;
    DOM.paginationContainer.querySelectorAll('button').forEach(btn => btn.addEventListener('click', (e) => {
        currentPage = parseInt(e.currentTarget.dataset.page);
        renderPageContent();
        window.scrollTo(0, 0);
    }));
}

function showDetailView(datasetIndex) {
    if (datasetIndex < 0 || !allDatasets[datasetIndex]) {
        showCustomAlert('Data tidak ditemukan atau tidak valid.', 'error');
        showView('listViewContainer');
        return;
    }
    currentDetailItemIndex = datasetIndex;
    const item = allDatasets[datasetIndex];

    callAppsScript('recordVisit', { title: item.Judul });

    DOM.detailTitle.textContent = item.Judul || 'Tanpa Judul';
    DOM.detailUraian.textContent = item.Uraian || 'Tidak ada uraian.';
    DOM.detailSifat.textContent = item.Sifat || 'N/A';
    DOM.detailSifat.className = `text-sm font-bold px-3 py-1 rounded-full flex-shrink-0 ml-4 ${getSifatColor(item.Sifat)}`;
    DOM.detailFileTitle.textContent = item['Nama File'] || 'File Dataset';
    DOM.detailFilenameDisplay.textContent = item.Judul || 'Tanpa Judul';
    const formatText = (item.Format || 'N/A').toUpperCase();
    DOM.detailFileFormat.textContent = formatText;
    if (formatText === 'CSV') DOM.detailFileFormat.className = 'font-semibold px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800';
    else if (['XLS', 'XLSX'].includes(formatText)) DOM.detailFileFormat.className = 'font-semibold px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800';
    else DOM.detailFileFormat.className = 'font-semibold px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800';
    DOM.metaProdusen.textContent = item['Produsen Data'] || 'N/A';
    DOM.metaPenanggungJawab.textContent = item['Penanggung Jawab'] || 'N/A';
    DOM.metaTanggal.textContent = item.Tanggal || 'N/A';
    DOM.metaDiperbaharui.textContent = item.Diperbaharui || 'N/A';
    DOM.metaFrekuensi.textContent = item.Frekuensi || 'N/A';
    DOM.metaTahunData.textContent = item['Tahun Data'] || 'N/A';

    const user = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    const canDownload = item.Sifat === 'Terbuka' || (user && (user.Role === 'Super Admin' || user.Role === 'Tertutup' || user.Role === 'Terbatas' || (user.Role === 'Admin' && user.Username === item.User)));
    
    DOM.detailDownloadLink.style.display = canDownload ? 'inline-block' : 'none';
    DOM.requestButtonContainer.innerHTML = '';
    if (!canDownload) {
        DOM.requestButtonContainer.innerHTML = `<button id="detail-request-button" class="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 text-sm flex items-center w-full justify-center"><i class="fas fa-inbox mr-2"></i> Minta Data</button>`;
    }

    DOM.detailActionButtons.innerHTML = '';
    if (user && (user.Role === 'Super Admin' || (user.Role === 'Admin' && user.Username === item.User))) {
        DOM.detailActionButtons.innerHTML = `
            <button id="detail-update-button" class="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 text-sm flex items-center"><i class="fas fa-copy mr-2"></i>Perbaharui</button>
            <button id="detail-edit-button" class="bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 text-sm flex items-center"><i class="fas fa-edit mr-2"></i>Edit</button>
        `;
    }

    const fileUrl = item.File || '#';
    const driveRegex = /https:\/\/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9-_]+)/;
    const fileId = (fileUrl.match(driveRegex) || [])[1];

    DOM.tablePreviewContainer.classList.add('hidden');
    DOM.tablePreviewContent.innerHTML = '';
    if (fileId) {
        DOM.detailDownloadLink.href = `https://drive.google.com/uc?export=download&id=${fileId}`;
        const format = (item.Format || '').toLowerCase();
        let previewHTML = '';
        if (['pdf', 'docx', 'pptx', 'xls', 'xlsx'].includes(format)) {
            previewHTML = `<iframe src="https://drive.google.com/file/d/${fileId}/preview" class="w-full h-96 border-0" frameborder="0"></iframe>`;
        } else if (['png', 'jpg', 'jpeg', 'gif'].includes(format)) {
            previewHTML = `<img src="https://drive.google.com/uc?export=view&id=${fileId}" alt="Pratinjau Gambar" class="w-full h-auto rounded-lg">`;
        }
        if (previewHTML) {
            DOM.tablePreviewContent.innerHTML = previewHTML;
            DOM.tablePreviewContainer.classList.remove('hidden');
        }
    } else {
        DOM.detailDownloadLink.href = '#';
    }

    displayChangeHistory(item);
    showView('detailViewContainer');
}

async function handleAddOrEditDataset(e) {
    e.preventDefault();
    const form = e.target;
    const isEdit = form.id === 'editDatasetForm';
    const modalError = isEdit ? DOM.editDatasetError : DOM.addDatasetError;
    const modalSuccess = isEdit ? DOM.editDatasetSuccess : DOM.addDatasetSuccess;
    const submitButton = isEdit ? DOM.submitEditDatasetButton : DOM.submitAddDatasetButton;
    const spinner = isEdit ? DOM.editDatasetSpinner : DOM.addDatasetSpinner;
    const buttonText = isEdit ? DOM.editDatasetButtonText : DOM.addDatasetButtonText;
    
    setButtonLoading(submitButton, spinner, buttonText, true);
    modalError.classList.add('hidden');
    modalSuccess.classList.add('hidden');

    const fileInput = form.querySelector('input[type="file"]');
    const file = fileInput.files[0];
    let filePayload = null;

    if (!isEdit && !file) {
        modalError.textContent = 'Mohon unggah file untuk dataset baru.';
        modalError.classList.remove('hidden');
        setButtonLoading(submitButton, spinner, buttonText, false);
        return;
    }

    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            modalError.textContent = 'Ukuran file tidak boleh melebihi 5MB.';
            modalError.classList.remove('hidden');
            setButtonLoading(submitButton, spinner, buttonText, false);
            return;
        }
        filePayload = await fileToBase64(file);
    }
    
    const formData = new FormData(form);
    let dataObject = Object.fromEntries(formData.entries());
    
    if (dataObject['Kategori-select'] === '--tambah-baru--') {
        dataObject.Kategori = dataObject['Kategori'];
    } else {
        dataObject.Kategori = dataObject['Kategori-select'];
    }
    delete dataObject['Kategori-select'];

    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    dataObject.user = user.Username;
    dataObject.namaUser = user.Nama;

    if (filePayload) {
        dataObject = { ...dataObject, ...filePayload };
    }
    
    const action = isEdit ? 'updateDataset' : 'addDataset';
    const response = await callAppsScript(action, { data: dataObject });

    if (response.success) {
        modalSuccess.textContent = response.message || 'Operasi berhasil!';
        modalSuccess.classList.remove('hidden');
        setTimeout(async () => {
            toggleModal(isEdit ? 'editDatasetModal' : 'addDatasetModal', false);
            await loadInitialData(isEdit);
        }, 2000);
    } else {
        modalError.textContent = response.message;
        modalError.classList.remove('hidden');
    }
    setButtonLoading(submitButton, spinner, buttonText, false);
}

function displayChangeHistory(currentItem) {
    const historyItems = allDatasets
        .filter(item => item.Judul === currentItem.Judul && item.rowIndex !== currentItem.rowIndex)
        .sort((a, b) => new Date(b.Diperbaharui?.split('/').reverse().join('-')) - new Date(a.Diperbaharui?.split('/').reverse().join('-')));
    
    DOM.historyList.innerHTML = '';
    if (historyItems.length > 0) {
        DOM.historySection.classList.remove('hidden');
        DOM.noHistoryMessage.classList.add('hidden');
        historyItems.forEach(item => {
            const fileUrl = item.File || '#';
            const driveRegex = /https:\/\/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9-_]+)/;
            const fileId = (fileUrl.match(driveRegex) || [])[1];
            const downloadUrl = fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : '#';

            DOM.historyList.innerHTML += `
                <div class="border rounded-lg p-4 flex items-center justify-between gap-4">
                    <div>
                        <p class="font-semibold text-gray-800">${item['Nama File'] || 'N/A'}</p>
                        <div class="text-sm text-gray-600">Diperbaharui: ${item.Diperbaharui || 'N/A'}</div>
                    </div>
                    <a href="${downloadUrl}" target="_blank" class="bg-blue-600 text-white font-bold py-2 px-2 rounded-lg hover:bg-blue-700"><i class="fas fa-download"></i></a>
                </div>`;
        });
    } else {
        DOM.historySection.classList.add('hidden');
        DOM.noHistoryMessage.classList.remove('hidden');
    }
}
//==================================================
// EVENT HANDLERS
//==================================================

function handleUserMenuClick(e) {
    const target = e.target;
    if (target.closest('#admin-login-button')) toggleModal('loginModal', true);
    if (target.closest('#admin-menu-trigger')) {
        document.getElementById('admin-popup-menu').classList.toggle('hidden');
    }
    if (target.closest('#popup-menu-logout')) handleLogout();
    if (target.closest('#popup-menu-profile')) toggleProfileModal(true);
}

function handleDatasetListClick(e) {
    const viewTrigger = e.target.closest('.view-detail-trigger');
    const editButton = e.target.closest('.edit-dataset-button');
    if (editButton) {
        e.stopPropagation();
        toggleEditDatasetModal(true, allDatasets[editButton.dataset.id]);
    } else if (viewTrigger) {
        showDetailView(viewTrigger.dataset.id);
    }
}

function handleDetailViewActions(e) {
    if (e.target.closest('#detail-edit-button')) {
        toggleEditDatasetModal(true, allDatasets[currentDetailItemIndex]);
    }
    if (e.target.closest('#detail-update-button')) {
        toggleAddDatasetModal(true, allDatasets[currentDetailItemIndex]);
    }
    if (e.target.closest('#detail-request-button')) {
        toggleRequestDataModal(true, allDatasets[currentDetailItemIndex]);
    }
}
async function handleSaveProfile(e) {
    e.preventDefault();
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    const formData = new FormData(DOM.profileForm);
    const profileData = Object.fromEntries(formData.entries());
    const updatedUser = { ...user, ...profileData, rowIndex: user.rowIndex };
    
    const response = await callAppsScript('updateUser', { data: updatedUser });
    if (response.success) {
        DOM.profileFormSuccess.textContent = "Profil berhasil diperbarui.";
        DOM.profileFormSuccess.classList.remove('hidden');
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        updateUIForLoginStatus();
        setTimeout(() => DOM.profileFormSuccess.classList.add('hidden'), 3000);
    } else {
        DOM.profileFormError.textContent = response.message;
        DOM.profileFormError.classList.remove('hidden');
    }
}

async function handleResetPassword(e) {
    e.preventDefault();
    const newPassword = DOM.resetPasswordForm.new_password.value;
    const confirmPassword = DOM.resetPasswordForm.confirm_password.value;
    if (newPassword !== confirmPassword) {
        DOM.resetPasswordError.textContent = 'Password baru dan konfirmasi tidak cocok.';
        DOM.resetPasswordError.classList.remove('hidden');
        return;
    }
    setButtonLoading(DOM.resetSubmitButton, DOM.resetSpinner, DOM.resetButtonText, true);
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    const response = await callAppsScript('resetPassword', { username: user.Username, newPassword });
    if (response.success) {
        DOM.resetPasswordSuccess.textContent = response.message;
        DOM.resetPasswordSuccess.classList.remove('hidden');
        setTimeout(() => {
            toggleResetPasswordModal(false);
            handleLogout();
        }, 2500);
    } else {
        DOM.resetPasswordError.textContent = response.message;
        DOM.resetPasswordError.classList.remove('hidden');
    }
    setButtonLoading(DOM.resetSubmitButton, DOM.resetSpinner, DOM.resetButtonText, false);
}

async function handleSendMessage(e) {
    e.preventDefault();
    if (!DOM.messageForm.checkValidity()) {
        DOM.messageForm.reportValidity();
        return;
    }
    setButtonLoading(DOM.submitMessageButton, DOM.sendMessageSpinner, DOM.sendMessageButtonText, true);
    const formData = new FormData(DOM.messageForm);
    const messageData = Object.fromEntries(formData.entries());
    const response = await callAppsScript('addMessage', { data: messageData });
    if (response.success) {
        toggleMessageModal(false);
        showCustomAlert('Pesan Anda telah berhasil dikirim.', 'success');
    } else {
        DOM.messageFormError.textContent = response.message;
        DOM.messageFormError.classList.remove('hidden');
    }
    setButtonLoading(DOM.submitMessageButton, DOM.sendMessageSpinner, DOM.sendMessageButtonText, false);
}

//==================================================
// HELPER & UTILITY FUNCTIONS
//==================================================

function toggleModal(modalId, show) {
  const modalKey = modalId.replace(/-./g, m => m[1].toUpperCase());
  const modal = DOM[modalKey];
  if (modal) modal.classList.toggle('hidden', !show);
}
function setButtonLoading(button, spinner, text, isLoading) {
  if (button && spinner && text) {
      button.disabled = isLoading;
      spinner.classList.toggle('hidden', isLoading);
      text.classList.toggle('hidden', !isLoading);
  }
}
function showView(viewId, closeMenu = false) {
    document.querySelectorAll('#main-app > main > div[id$="-container"]').forEach(div => div.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
    if (closeMenu) toggleSideMenu(false);
    window.scrollTo(0, 0);
}
function getSifatColor(sifat) {
    const colors = {'Terbuka': 'bg-green-100 text-green-800','Terbatas': 'bg-yellow-100 text-yellow-800','Tertutup': 'bg-red-100 text-red-800'};
    return colors[sifat] || 'bg-gray-100 text-gray-800';
}
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({ base64: reader.result.split(',')[1], name: file.name, type: file.type });
        reader.onerror = error => reject(error);
    });
}
function showCustomAlert(message, type = 'success') {
    DOM.customAlertMessage.textContent = message;
    const iconContainer = DOM.customAlertIconContainer;
    if (type === 'success') {
        iconContainer.innerHTML = `<i class="fas fa-check text-green-600 text-xl"></i>`;
        iconContainer.className = 'mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100';
    } else {
        iconContainer.innerHTML = `<i class="fas fa-times text-red-600 text-xl"></i>`;
        iconContainer.className = 'mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100';
    }
    toggleModal('customAlertModal', true);
}
function showErrorState(title, message) {
    DOM.listViewContainer.innerHTML = `
        <div class="text-center py-10 bg-red-50 rounded-lg">
            <i class="fas fa-exclamation-triangle fa-3x text-red-500"></i>
            <h2 class="mt-4 text-xl font-bold text-red-800">${title}</h2>
            <p class="mt-2 text-red-700">${message}</p>
        </div>
    `;
    setLoadingState(false);
}
function setLoadingState(isLoading) {
    DOM.loadingIndicator.style.display = isLoading ? 'block' : 'none';
    DOM.reloadDatasetButton.disabled = isLoading;
    if (isLoading) DOM.reloadDatasetButton.querySelector('i').classList.add('fa-spin');
    else DOM.reloadDatasetButton.querySelector('i').classList.remove('fa-spin');
}
function updateSummaryStats() {
    if (!filterOptionsCache) return;
    const uniqueTitles = new Set(allDatasets.map(d => d.Judul));
    animateCountUp(DOM.statTotalDataset, uniqueTitles.size);
    animateCountUp(DOM.statTotalProducer, filterOptionsCache.producers.length);
    animateCountUp(DOM.statTotalCategory, filterOptionsCache.categories.length);
}
function populateSelect(selectElement, optionsArray, withPlaceholder = false, allowAdd = false) {
    if (!selectElement) return;
    const currentValue = selectElement.value;
    selectElement.innerHTML = '';
    let firstOptionText = "Semua " + (selectElement.id.split('-')[1] || "Opsi");
    if (withPlaceholder) firstOptionText = "Pilih salah satu...";
    selectElement.innerHTML = `<option value="">${firstOptionText}</option>`;
    optionsArray.forEach(option => selectElement.innerHTML += `<option value="${option}">${option}</option>`);
    if(allowAdd) selectElement.innerHTML += `<option value="--tambah-baru--">Tambah Kategori Baru...</option>`;
    selectElement.value = currentValue;
}
function populateFilterOptions() {
    if (!filterOptionsCache) return;
    populateSelect(DOM.filterCategory, filterOptionsCache.categories);
    populateSelect(DOM.filterProducer, filterOptionsCache.producers);
    populateSelect(DOM.filterTag, filterOptionsCache.tags);
    populateSelect(DOM.filterYear, filterOptionsCache.years);
    populateSelect(DOM.addProdusenData, filterOptionsCache.producers, true);
    populateSelect(DOM.editProdusenData, filterOptionsCache.producers, true);
}
async function loadTopVisited() {
    const response = await callAppsScript('getTopVisited');
    DOM.popularDatasetsList.innerHTML = '';
    if (response.success && response.data.length > 0) {
        DOM.noPopularDatasets.classList.add('hidden');
        response.data.forEach(item => {
            DOM.popularDatasetsList.innerHTML += `
                <li class="popular-dataset-item cursor-pointer hover:bg-gray-100 p-1 rounded" data-title="${item.title}">
                    <div class="flex justify-between items-center">
                        <span class="truncate pr-2">${item.title}</span>
                        <span class="font-bold text-gray-800 bg-blue-100 px-2 py-0.5 rounded-full text-xs">${item.visits}</span>
                    </div>
                </li>`;
        });
    } else {
        DOM.noPopularDatasets.classList.remove('hidden');
    }
}
function toggleSideMenu(show) {
    DOM.popupMenu.classList.toggle('-translate-x-full', !show);
    DOM.menuOverlay.classList.toggle('hidden', !show);
}
function closeAdminPopupOnClickOutside(e) {
    const adminMenu = document.getElementById('admin-popup-menu');
    const trigger = document.getElementById('admin-menu-trigger');
    if (adminMenu && !adminMenu.classList.contains('hidden') && !trigger.contains(e.target)) {
        adminMenu.classList.add('hidden');
    }
}
function resetFilters(){
    DOM.searchInput.value = '';
    DOM.filterCategory.value = '';
    document.getElementById('sifat-semua').checked = true;
    DOM.filterProducer.value = '';
    DOM.filterTag.value = '';
    DOM.filterYear.value = '';
    DOM.filterDataStartYear.value = '';
    DOM.filterDataEndYear.value = '';
    DOM.sortDatasetSelect.value = 'default';
    applyFiltersAndRender();
}
function handleReload() {
    loadInitialData();
}
function handlePopularDatasetClick(e) {
    const target = e.target.closest('.popular-dataset-item');
    if(target) {
        const title = target.dataset.title;
        const datasetIndex = allDatasets.findIndex(d => d.Judul === title);
        if (datasetIndex > -1) {
            showDetailView(datasetIndex);
        }
    }
}
function handleDownload(e) {
    const item = allDatasets[currentDetailItemIndex];
    if (item) {
        const user = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
        callAppsScript('recordDownload', { title: item.Judul, username: user?.Username || 'Guest' });
    }
}
function updateDatasetCount() {
    DOM.datasetCount.innerHTML = `<i class="fa-solid fa-box-archive mr-2"></i> <strong>${currentFilteredData.length}</strong> Datasets Ditemukan`;
}

function animateCountUp(el, endValue) {
    if (!el) return;
    let startValue = 0;
    const duration = 1500;
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);
    const increment = endValue / totalFrames;
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

// RUN APP
initializeApp();
});

