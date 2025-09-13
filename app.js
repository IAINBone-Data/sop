/**
 * =================================================================================
 * SCRIPT APLIKASI UTAMA - SATU DATA IAIN BONE
 * =================================================================================
 * Versi ini telah disederhanakan tanpa fungsionalitas login, permohonan, dan kolom Sifat.
 */

// --- KONFIGURASI APLIKASI ---
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzUGtvg6395FkwLtTZozVxXLExnOxXImGKcBC5mFSTR0UsO_31kadjGkaGu5EGANqmD/exec';

document.addEventListener('DOMContentLoaded', function () {
 // === DOM ELEMENTS CACHING ===
 const DOM = {};
 const cacheDOMElements = () => {
  const ids = [
    'userInfoContainer', 'listViewContainer', 'detailViewContainer', 'aboutViewContainer',
    'datasetList', 'datasetCount', 'searchInput', 'filterCategory',
    'filterProducer', 'filterTag', 'loadingIndicator', 'noDataMessage', 'resetFilterButton',
    'paginationContainer', 'filterYear', 'filterDataStartYear', 'filterDataEndYear', 'backToListButton',
    'headerTitleLink', 'hamburgerMenuButton', 'popupMenu', 'menuOverlay', 'homeLink', 'aboutLink',
    'customAlertModal', 'customAlertMessage', 'closeCustomAlert', 'customAlertIconContainer', 
    'statTotalDataset', 'statTotalProducer', 'statTotalCategory',
    'reloadDatasetButton',
    'toggleFilterBtn', 'filterContent', 'sortDatasetSelect', 'detailTitle', 'detailUraian',
    'detailFileTitle', 'detailFilenameDisplay', 'detailFileFormat', 'detailDownloadLink', 'metaProdusen',
    'metaPenanggungJawab', 'metaTanggal', 'metaDiperbaharui', 'metaFrekuensi', 'metaTahunData', 'tablePreviewContainer',
    'tablePreviewContent', 
    'loginModal', 'closeLoginModal' // Menambahkan kembali referensi untuk modal login
  ];
   ids.forEach(id => {
       // [PERBAIKAN] Mengubah camelCase (js) menjadi kebab-case (html) untuk menemukan ID dengan benar
       const kebabCaseId = id.replace(/([A-Z])/g, "-$1").toLowerCase();
       const el = document.getElementById(kebabCaseId);
       if (el) {
           DOM[id] = el;
       }
   });
 };

 // === STATE MANAGEMENT ===
 let allDatasets = [];
 let filterOptionsCache = null;
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

  const loadInitialData = async () => {
      setLoadingState(true);
      DOM.datasetList.innerHTML = '';
      
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
      
          // [PERUBAHAN] Mengurutkan berdasarkan IDSOP dari yang terbaru (asumsi format timestamp)
          allDatasets.sort((a, b) => (b.IDSOP || '').localeCompare(a.IDSOP || ''));

          applyFiltersAndRender();
          updateSummaryStats();
          populateFilterOptions();
      } else {
          showErrorState('Gagal Memuat Data', response.message);
      }
      setLoadingState(false);
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
   DOM.toggleFilterBtn.addEventListener('click', () => {
     DOM.filterContent.classList.toggle('hidden');
     DOM.toggleFilterBtn.querySelector('i').classList.toggle('rotate-180');
   });
   DOM.reloadDatasetButton.addEventListener('click', handleReload);
   DOM.datasetList.addEventListener('click', handleDatasetListClick);
   if (DOM.detailDownloadLink) DOM.detailDownloadLink.addEventListener('click', handleDownload);
   DOM.closeCustomAlert.addEventListener('click', () => toggleModal('custom-alert-modal', false));
   DOM.closeLoginModal.addEventListener('click', () => toggleModal('login-modal', false));
 };

//==================================================
// UI UPDATE FUNCTIONS
//==================================================

function updateUIForLoginStatus() {
  // Selalu tampilkan tombol login, tapi fungsionalitasnya dinonaktifkan
  DOM.userInfoContainer.innerHTML = `<button id="admin-login-button" class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 text-sm"><i class="fas fa-sign-in-alt mr-2"></i>Login</button>`;
}

//==================================================
// DATA RENDERING & FILTERING
//==================================================

function applyFiltersAndRender() {
    let filteredData = [...allDatasets];
    
    const searchTerm = DOM.searchInput.value.toLowerCase();
    const category = DOM.filterCategory.value;
    const producer = DOM.filterProducer.value;
    const tag = DOM.filterTag.value;
    const year = DOM.filterYear.value;
    const startYear = DOM.filterDataStartYear.value;
    const endYear = DOM.filterDataEndYear.value;

    if (searchTerm) filteredData = filteredData.filter(item => (item['Nama SOP'] || '').toLowerCase().includes(searchTerm) || (item['Nomor SOP'] || '').toLowerCase().includes(searchTerm) || (item.Tag || '').toLowerCase().includes(searchTerm));
    if (category) filteredData = filteredData.filter(item => item.Kategori === category);
    if (producer) filteredData = filteredData.filter(item => item['Produsen Data'] === producer);
    if (tag) filteredData = filteredData.filter(item => (item.Tag || '').split(',').map(t => t.trim()).includes(tag));
    if (year) filteredData = filteredData.filter(item => (item.Tanggal || '').endsWith(`/${year}`));
    if (startYear) filteredData = filteredData.filter(item => (item['Tahun Data'] || '').split('-')[1]?.trim() >= startYear);
    if (endYear) filteredData = filteredData.filter(item => (item['Tahun Data'] || '').split('-')[0]?.trim() <= endYear);

    const sortValue = DOM.sortDatasetSelect.value;
    const parseDate = (dateStr) => new Date(dateStr);
    
    filteredData.sort((a, b) => {
        if (sortValue === 'tanggal-asc') {
            return (parseDate(a['Tanggal Diperbaharui']) || 0) - (parseDate(b['Tanggal Diperbaharui']) || 0);
        }
        return (parseDate(b['Tanggal Diperbaharui']) || 0) - (parseDate(a['Tanggal Diperbaharui']) || 0);
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
        const producerText = (item.Unit && item.Fungsi) ? `${item.Unit} - ${item.Fungsi}` : (item.Unit || item.Fungsi || 'N/A');
        DOM.datasetList.innerHTML += `
            <div class="dataset-card bg-white p-5 rounded-lg shadow-md border hover:shadow-lg hover:border-blue-500 transition-all">
                <div class="flex justify-between items-start">
                    <h3 class="text-lg font-bold text-gray-800 mb-2 flex-grow cursor-pointer view-detail-trigger" data-id="${item.IDSOP}">${item['Nama SOP'] || 'Tanpa Judul'}</h3>
                </div>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2 cursor-pointer view-detail-trigger" data-id="${item.IDSOP}">${item['Nomor SOP'] || 'Tidak ada nomor SOP.'}</p>
                <div class="flex flex-wrap items-center justify-between gap-y-2">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">${item.Format || 'N/A'}</span>
                        ${item.Kategori ? `<span class="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-1 rounded-full"><i class="fas fa-folder-open mr-1"></i> ${item.Kategori}</span>` : ''}
                    </div>
                    <div class="text-right flex-shrink-0"><span class="text-sm font-semibold text-blue-600">${producerText}</span></div>
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

function showDetailView(idsop) {
    const item = allDatasets.find(d => d.IDSOP === idsop);
    if (!item) {
        showCustomAlert('Data tidak ditemukan.', 'error');
        showView('list-view-container');
        return;
    }
    
    DOM.detailTitle.textContent = item['Nama SOP'] || 'Tanpa Judul';
    DOM.detailUraian.textContent = item['Nomor SOP'] || 'Tidak ada nomor SOP.';
    DOM.detailFileTitle.textContent = item['Nama File'] || 'File SOP';
    DOM.detailFilenameDisplay.textContent = item['Nama SOP'] || 'Tanpa Judul';
    const formatText = (item.Format || 'N/A').toUpperCase();
    DOM.detailFileFormat.textContent = formatText;
    if (formatText === 'CSV') DOM.detailFileFormat.className = 'font-semibold px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800';
    else if (['XLS', 'XLSX'].includes(formatText)) DOM.detailFileFormat.className = 'font-semibold px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800';
    else DOM.detailFileFormat.className = 'font-semibold px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800';
    DOM.metaProdusen.textContent = (item.Unit && item.Fungsi) ? `${item.Unit} - ${item.Fungsi}` : (item.Unit || item.Fungsi || 'N/A');
    DOM.metaPenanggungJawab.textContent = item['Penanggung Jawab'] || 'N/A';
    DOM.metaTanggal.textContent = item['Tanggal Dibuat'] ? new Date(item['Tanggal Dibuat']).toLocaleDateString('id-ID') : 'N/A';
    DOM.metaDiperbaharui.textContent = item['Tanggal Diperbaharui'] ? new Date(item['Tanggal Diperbaharui']).toLocaleString('id-ID') : 'N/A';
    DOM.metaFrekuensi.textContent = item.Frekuensi || 'N/A';
    DOM.metaTahunData.textContent = item['Tahun Data'] || 'N/A';
    
    DOM.detailDownloadLink.style.display = 'inline-block';

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

    showView('detail-view-container');
}


//==================================================
// EVENT HANDLERS
//==================================================

function handleUserMenuClick(e) {
    if (e.target.closest('#admin-login-button')) {
      toggleModal('login-modal', true);
    }
}

function handleDatasetListClick(e) {
    const viewTrigger = e.target.closest('.view-detail-trigger');
    if (viewTrigger) {
        showDetailView(viewTrigger.dataset.id);
    }
}

function handleDownload() {
    console.log("Tombol unduh diklik.");
}

//==================================================
// HELPER & UTILITY FUNCTIONS
//==================================================

function toggleModal(modalId, show) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.toggle('hidden', !show);
  }
}

function showView(viewId, closeMenu = false) {
    document.querySelectorAll('#main-app > main > div[id$="-container"]').forEach(div => div.classList.add('hidden'));
    const view = document.getElementById(viewId);
    if(view) view.classList.remove('hidden');
    if (closeMenu) toggleSideMenu(false);
    window.scrollTo(0, 0);
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
    if(DOM.loadingIndicator) DOM.loadingIndicator.style.display = isLoading ? 'flex' : 'none';
    if(DOM.reloadDatasetButton) {
        DOM.reloadDatasetButton.disabled = isLoading;
        const icon = DOM.reloadDatasetButton.querySelector('i');
        if (icon) {
           if (isLoading) icon.classList.add('fa-spin');
           else icon.classList.remove('fa-spin');
        }
    }
}

function updateSummaryStats() {
    if (!filterOptionsCache || !allDatasets) return;
    animateCountUp(DOM.statTotalDataset, allDatasets.length);
    animateCountUp(DOM.statTotalProducer, filterOptionsCache.producers.length);
    animateCountUp(DOM.statTotalCategory, filterOptionsCache.categories.length);
}

function populateSelect(selectElement, optionsArray) {
    if (!selectElement) return;
    const currentValue = selectElement.value;
    selectElement.innerHTML = `<option value="">Semua ${selectElement.id.replace('filter-','')}</option>`;
    optionsArray.forEach(option => selectElement.innerHTML += `<option value="${option}">${option}</option>`);
    selectElement.value = currentValue;
}

function populateFilterOptions() {
    if (!filterOptionsCache) return;
    populateSelect(DOM.filterCategory, filterOptionsCache.categories);
    populateSelect(DOM.filterProducer, filterOptionsCache.producers);
    populateSelect(DOM.filterTag, filterOptionsCache.tags);
    populateSelect(DOM.filterYear, filterOptionsCache.years);
}

function toggleSideMenu(show) {
    if(DOM.popupMenu) DOM.popupMenu.classList.toggle('-translate-x-full', !show);
    if(DOM.menuOverlay) DOM.menuOverlay.classList.toggle('hidden', !show);
}

function resetFilters(){
    if(document.getElementById('search-input')) document.getElementById('search-input').value = '';
    if(DOM.filterCategory) DOM.filterCategory.value = '';
    if(DOM.filterProducer) DOM.filterProducer.value = '';
    if(DOM.filterTag) DOM.filterTag.value = '';
    if(DOM.filterYear) DOM.filterYear.value = '';
    if(DOM.filterDataStartYear) DOM.filterDataStartYear.value = '';
    if(DOM.filterDataEndYear) DOM.filterDataEndYear.value = '';
    if(DOM.sortDatasetSelect) DOM.sortDatasetSelect.value = 'tanggal-desc';
    applyFiltersAndRender();
}

function handleReload() {
    loadInitialData();
}

function updateDatasetCount() {
    if(!DOM.datasetCount) return;
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

// RUN APP
initializeApp();
});

