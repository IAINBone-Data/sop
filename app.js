/**
 * =================================================================================
 * SCRIPT APLIKASI UTAMA - SATU DATA IAIN BONE
 * =================================================================================
 * Versi ini telah dimodifikasi untuk menghapus fungsionalitas login.
 */

// --- KONFIGURASI APLIKASI ---
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwaZGTS7zK-kou_CV4Mw6VBgxM3mR0-75Wur0th9g-8Dw_uPDeVLh6Sea8TBjyg2U6M/exec';

document.addEventListener('DOMContentLoaded', function () {
 // === DOM ELEMENTS CACHING ===
 const DOM = {};
 const cacheDOMElements = () => {
  const ids = [
    // Elemen terkait login, profil, dan reset password telah dihapus
    'userInfoContainer', 'listViewContainer', 'detailViewContainer', 'aboutViewContainer', 'statsViewContainer',
    'adminListViewContainer', 'datasetList', 'datasetCount', 'searchInput', 'filterCategory', 'filterSifatContainer',
    'filterProducer', 'filterTag', 'loadingIndicator', 'noDataMessage', 'resetFilterButton',
    'paginationContainer', 'filterYear', 'filterDataStartYear', 'filterDataEndYear', 'backToListButton', 'detailActionButtons',
    'headerTitleLink', 'hamburgerMenuButton', 'popupMenu', 'menuOverlay', 'homeLink', 'aboutLink', 'statsLink',
    'adminListLink', 'statsMenuItem', 'adminListMenuItem', 'panduanMenuItem', 'requestMenuItem', 'requestLink',
    'requestViewContainer', 'requestListTableBody', 'requestListCards', 'requestDataModal', 'requestDataForm',
    'cancelRequestForm', 'requestModalDatasetTitle', 'requestFormError', 'requestButtonContainer', 'messageMenuItem',
    'messageLink', 'messageViewContainer', 'messageListContainer', 'customAlertModal', 'customAlertMessage',
    'closeCustomAlert', 'customAlertIconContainer', 'statTotalDataset', 'statTotalProducer', 'statTotalCategory', 'popularDatasetsList',
    'noPopularDatasets', 'addDatasetModal',
    'addDatasetForm', 'closeAddDatasetModal', 'cancelAddDatasetButton', 'addDatasetError', 'addDatasetSuccess',
    'submitAddDatasetButton', 'addDatasetButtonText', 'addDatasetSpinner', 'addKategori', 'addKategoriNew',
    'editDatasetModal', 'editDatasetForm', 'closeEditDatasetModal', 'cancelEditDatasetButton',
    'submitEditDatasetButton', 'editDatasetError', 'editDatasetSuccess', 'editDatasetButtonText', 'editDatasetSpinner',
    'userModal', 'userForm', 'userModalTitle', 'addUserButton', 'cancelUserForm', 'adminListTableBody', 'userFormError',
    'adminListCards', 'addDatasetButtonContainer',
    'addDatasetTriggerButton', 'reloadDatasetButton', 'chatButton', 'messageModal', 'messageForm', 'closeMessageModal',
    'cancelMessageForm', 'submitMessageButton', 'sendMessageButtonText', 'sendMessageSpinner', 'messageFormError',
    'toggleFilterBtn', 'filterContent', 'sortDatasetSelect', 'detailTitle', 'detailUraian', 'detailSifat',
    'detailFileTitle', 'detailFilenameDisplay', 'detailFileFormat', 'detailDownloadLink', 'metaProdusen',
    'metaPenanggungJawab', 'metaTanggal', 'metaDiperbaharui', 'metaFrekuensi', 'metaTahunData', 'tablePreviewContainer',
    'tablePreviewContent', 'historySection', 'historyList', 'noHistoryMessage', 'addProdusenData', 'editProdusenData',
    'editKategori', 'currentFileInfo', 'statsTotalVisitors', 'statsTotalDownloads', 'monthlyVisitsChart', 'yearlyVisitsChart',
    'adminLoginsTableBody', 'editTahunDataStart', 'editTahunDataEnd'
  ];
   ids.forEach(id => {
       const kebabCaseId = id.replace(/([A-Z])/g, "-$1").toLowerCase();
       const el = document.getElementById(kebabCaseId);
       if (el) {
           DOM[id] = el;
       }
   });
 };

 // === STATE MANAGEMENT ===
 let allDatasets = [];
 let allUsers = [];
 let allRequests = [];
 let allMessages = [];
 let filterOptionsCache = null;
 let currentDetailItemIndex = -1;
 let currentPage = 1;
 const rowsPerPage = 10;
 let currentFilteredData = [];
 
  // === API HELPER ===
  const callAppsScript = async (action, payload = {}) => {
      try {
          const response = await fetch(WEB_APP_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({ action, ...payload }),
              redirect: 'follow'
          });
          if (!response.ok) {
              throw new Error(`Network response error: ${response.statusText}`);
          }
          const text = await response.text();
          try {
              return JSON.parse(text);
          } catch (e) {
              console.error("Gagal mem-parsing JSON:", text);
              return { status: 'error', message: 'Gagal memproses respon dari server.' };
          }
      } catch (error) {
          console.error(`API Call Error untuk action "${action}":`, error);
          return { status: 'error', message: error.message };
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
      
      const response = await callAppsScript('getData', { sheetName: 'SOP' });

      if (response.status === 'success') {
          allDatasets = response.data || [];
          
          if (allDatasets.length > 0) {
              const categories = [...new Set(allDatasets.map(item => item.Kategori).filter(Boolean))].sort();
              const producers = [...new Set(allDatasets.map(item => item['Produsen Data']).filter(Boolean))].sort();
              const tags = [...new Set(allDatasets.flatMap(item => (item.Tag || '').split(',')).map(t => t.trim()).filter(Boolean))].sort();
              const years = [...new Set(allDatasets.map(item => (item.Tanggal || '').split('/')[2]).filter(Boolean))].sort((a, b) => b - a);
              filterOptionsCache = { categories, producers, tags, years };
          } else {
              filterOptionsCache = { categories: [], producers: [], tags: [], years: [] };
          }
      
          allDatasets.sort((a, b) => (new Date(b['Tanggal Diperbaharui']) - new Date(a['Tanggal Diperbaharui'])));

          applyFiltersAndRender();
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
   DOM.userInfoContainer.addEventListener('click', handleUserMenuClick);
   DOM.headerTitleLink.addEventListener('click', (e) => { e.preventDefault(); showView('list-view-container'); });
   DOM.hamburgerMenuButton.addEventListener('click', () => toggleSideMenu(true));
   DOM.menuOverlay.addEventListener('click', () => toggleSideMenu(false));
   DOM.homeLink.addEventListener('click', (e) => { e.preventDefault(); showView('list-view-container', true); });
   DOM.aboutLink.addEventListener('click', (e) => { e.preventDefault(); showView('about-view-container', true); });
   DOM.backToListButton.addEventListener('click', () => showView('list-view-container'));
   const filterInputs = [DOM.searchInput, DOM.filterCategory, DOM.filterProducer, DOM.filterTag, DOM.filterYear, DOM.filterDataStartYear, DOM.filterDataEndYear];
   filterInputs.forEach(input => {
       if(input) input.addEventListener('input', applyFiltersAndRender)
    });
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
   DOM.chatButton.addEventListener('click', () => toggleMessageModal(true));
   DOM.closeMessageModal.addEventListener('click', () => toggleMessageModal(false));
   DOM.cancelMessageForm.addEventListener('click', () => toggleMessageModal(false));
   DOM.messageForm.addEventListener('submit', handleSendMessage);
   DOM.closeCustomAlert.addEventListener('click', () => toggleModal('custom-alert-modal', false));
 };

//==================================================
// AUTHENTICATION & UI UPDATE FUNCTIONS
//==================================================

function updateUIForLoginStatus() {
  // Semua menu admin disembunyikan secara default
  [DOM.statsMenuItem, DOM.adminListMenuItem, DOM.panduanMenuItem, DOM.requestMenuItem, DOM.messageMenuItem].forEach(item => {
      if(item) item.classList.add('hidden')
    });
  if(DOM.addDatasetButtonContainer) DOM.addDatasetButtonContainer.classList.add('hidden');

  // Selalu tampilkan tombol login
  DOM.userInfoContainer.innerHTML = `<button id="admin-login-button" class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 text-sm"><i class="fas fa-sign-in-alt mr-2"></i>Login</button>`;
}

//==================================================
// DATA RENDERING & FILTERING
//==================================================

function applyFiltersAndRender() {
    // Hanya tampilkan data dengan Sifat 'Terbuka' karena tidak ada user yang login
    let baseData = allDatasets.filter(item => item.Sifat === 'Terbuka');

    const uniqueTitles = new Map();
    const sortedBaseData = [...baseData].sort((a,b) => {
        const dateA = new Date(a['Tanggal Diperbaharui']);
        const dateB = new Date(b['Tanggal Diperbaharui']);
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
    const parseDate = (dateStr) => new Date(dateStr);
    
    filteredData.sort((a, b) => {
        switch (sortValue) {
            case 'tanggal-desc': return (parseDate(b['Tanggal Diperbaharui']) || 0) - (parseDate(a['Tanggal Diperbaharui']) || 0);
            case 'tanggal-asc': return (parseDate(a['Tanggal Diperbaharui']) || 0) - (parseDate(b['Tanggal Diperbaharui']) || 0);
            default: return (parseDate(b['Tanggal Diperbaharui']) || 0) - (parseDate(a['Tanggal Diperbaharui']) || 0);
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

    paginatedItems.forEach(item => {
        const originalIndex = allDatasets.findIndex(d => d.rowIndex === item.rowIndex);
        const sifatColor = getSifatColor(item.Sifat);
        
        // Tombol aksi (edit/hapus) tidak ditampilkan karena tidak ada login
        const actionButtonHtml = '';

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
        showView('list-view-container');
        return;
    }
    currentDetailItemIndex = datasetIndex;
    const item = allDatasets[datasetIndex];

    callAppsScript('logAction', { 
        type: 'visit', 
        details: { title: item.Judul }, 
        user: 'Guest' 
    });

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
    DOM.metaTanggal.textContent = item.Tanggal ? new Date(item.Tanggal).toLocaleDateString('id-ID') : 'N/A';
    DOM.metaDiperbaharui.textContent = item['Tanggal Diperbaharui'] ? new Date(item['Tanggal Diperbaharui']).toLocaleString('id-ID') : 'N/A';
    DOM.metaFrekuensi.textContent = item.Frekuensi || 'N/A';
    DOM.metaTahunData.textContent = item['Tahun Data'] || 'N/A';
    
    // Logika download disederhanakan, hanya untuk data terbuka
    const canDownload = item.Sifat === 'Terbuka';
    
    DOM.detailDownloadLink.style.display = canDownload ? 'inline-block' : 'none';
    DOM.requestButtonContainer.innerHTML = '';
    if (!canDownload) {
        DOM.requestButtonContainer.innerHTML = `<button id="detail-request-button" class="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 text-sm flex items-center w-full justify-center"><i class="fas fa-inbox mr-2"></i> Minta Data</button>`;
    }
    
    DOM.detailActionButtons.innerHTML = ''; // Tombol edit/hapus dihapus

    const fileId = item['File ID'] || '';

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
    showView('detail-view-container');
}

function displayChangeHistory(currentItem) {
    const historyItems = allDatasets
        .filter(item => item.Judul === currentItem.Judul && item.rowIndex !== currentItem.rowIndex)
        .sort((a, b) => new Date(b['Tanggal Diperbaharui']) - new Date(a['Tanggal Diperbaharui']));
    
    DOM.historyList.innerHTML = '';
    if (historyItems.length > 0) {
        DOM.historySection.classList.remove('hidden');
        DOM.noHistoryMessage.classList.add('hidden');
        historyItems.forEach(item => {
            const fileId = item['File ID'];
            const downloadUrl = fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : '#';

            DOM.historyList.innerHTML += `
                <div class="border rounded-lg p-4 flex items-center justify-between gap-4">
                    <div>
                        <p class="font-semibold text-gray-800">${item['Nama File'] || 'N/A'}</p>
                        <div class="text-sm text-gray-600">Diperbaharui: ${new Date(item['Tanggal Diperbaharui']).toLocaleString('id-ID')}</div>
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
    // Fungsionalitas login dinonaktifkan, tombol tidak melakukan apa-apa
    if (target.closest('#admin-login-button')) {
      console.log("Tombol login diklik, fungsionalitas dinonaktifkan.");
      showCustomAlert('Fungsionalitas login saat ini dinonaktifkan.', 'error');
    }
}

function handleDatasetListClick(e) {
    const viewTrigger = e.target.closest('.view-detail-trigger');
    if (viewTrigger) {
        showDetailView(viewTrigger.dataset.id);
    }
}

async function handleDetailViewActions(e) {
    // Tombol edit/hapus sudah tidak ada, namun request button mungkin masih ada
    if (e.target.closest('#detail-request-button')) {
        toggleRequestDataModal(true, allDatasets[currentDetailItemIndex]);
    }
}

async function handleSendMessage(e) {
    e.preventDefault();
    if (!DOM.messageForm.checkValidity()) {
        DOM.messageForm.reportValidity();
        return;
    }
    setButtonLoading(DOM.submitMessageButton, DOM.sendMessageSpinner, DOM.sendMessageButtonText, true);
    DOM.messageFormError.classList.add('hidden');
    const formData = new FormData(DOM.messageForm);
    const messageData = Object.fromEntries(formData.entries());

    const response = await callAppsScript('sendMessage', messageData);

    if (response.status === 'success') {
        toggleMessageModal(false);
        showCustomAlert('Pesan Anda telah berhasil dikirim.', 'success');
        DOM.messageForm.reset();
    } else {
        DOM.messageFormError.textContent = response.message;
        DOM.messageFormError.classList.remove('hidden');
    }
    setButtonLoading(DOM.submitMessageButton, DOM.sendMessageSpinner, DOM.sendMessageButtonText, false);
}

function handleDownload(e) {
    const item = allDatasets[currentDetailItemIndex];
    if (item) {
        callAppsScript('logAction', {
            type: 'download',
            details: { title: item.Judul },
            user: 'Guest'
        });
    }
}

//==================================================
// HELPER & UTILITY FUNCTIONS
//==================================================

function toggleModal(modalId, show) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.toggle('hidden', !show);
    if(show) {
        const form = modal.querySelector('form');
        if(form) form.reset();
        modal.querySelectorAll('.form-error, .form-success').forEach(el => el.classList.add('hidden'));
    }
  }
}

function setButtonLoading(button, spinner, text, isLoading) {
  if (button && spinner && text) {
      button.disabled = isLoading;
      spinner.classList.toggle('hidden', !isLoading);
      text.classList.toggle('hidden', isLoading);
  }
}

function showView(viewId, closeMenu = false) {
    document.querySelectorAll('#main-app > main > div[id$="-container"]').forEach(div => div.classList.add('hidden'));
    const view = document.getElementById(viewId);
    if(view) view.classList.remove('hidden');
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
    toggleModal('custom-alert-modal', true);
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
    DOM.loadingIndicator.style.display = isLoading ? 'flex' : 'none';
    if(DOM.reloadDatasetButton) {
        DOM.reloadDatasetButton.disabled = isLoading;
        if (isLoading) DOM.reloadDatasetButton.querySelector('i').classList.add('fa-spin');
        else DOM.reloadDatasetButton.querySelector('i').classList.remove('fa-spin');
    }
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
    let firstOptionText = "Semua " + (selectElement.id.replace('filter-', '').replace('add-', '').replace('edit-', '') || "Opsi");
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
}

async function loadTopVisited() {
    DOM.noPopularDatasets.classList.remove('hidden');
    DOM.popularDatasetsList.innerHTML = '';
}

function toggleSideMenu(show) {
    DOM.popupMenu.classList.toggle('-translate-x-full', !show);
    DOM.menuOverlay.classList.toggle('hidden', !show);
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
    DOM.sortDatasetSelect.value = 'tanggal-desc';
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

function updateDatasetCount() {
    DOM.datasetCount.innerHTML = `<i class="fa-solid fa-box-archive mr-2"></i> <strong>${currentFilteredData.length}</strong> SOP Ditemukan`;
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

// Sisa fungsi untuk halaman admin, dll. tidak diperlukan lagi
// karena fungsionalitasnya bergantung pada login

// RUN APP
initializeApp();
});

