// --- KONFIGURASI APLIKASI ---
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyBXz9Umo_1LbSUk4oaKL6Paz79B4lzfmXYTiwsB1DC_yWc6_v0TPwDFUPp4UkS_rAm/exec';


document.addEventListener('DOMContentLoaded', function () {
  // === DOM ELEMENTS CACHING ===
  const DOM = {};
  const cacheDOMElements = () => {
  const ids = [
    'userInfoContainer', 'listViewContainer', 'detailViewContainer', 'aboutViewContainer',
    'datasetList', 'datasetCardsContainer',
    'datasetCount', 'searchInput', 'loadingIndicator', 'noDataMessage',
    'paginationContainer', 'backToListButton', 'headerTitleLink', 'hamburgerMenuButton', 
    'popupMenu', 'menuOverlay', 'homeLink', 'aboutLink', 'customAlertModal', 
    'customAlertMessage', 'closeCustomAlert', 'customAlertIconContainer', 
    'reloadDatasetButton', 'detailTitle', 'detailUraian', 'detailDownloadLink', 
    'metaPenandatangan', 'metaUnit', 'metaFungsi', 'metaTanggal', 'metaDiperbaharui', 'metaRevisiRow',
    'metaEfektif', 'detailStatus', 'tablePreviewContainer',
    'tablePreviewContent', 'loginModal', 'closeLoginModal', 
    'resetFilterButton',
    'filterModal', 'openFilterButton', 'closeFilterModal',
    'searchInputMobile', 'resetFilterButtonMobile',
    'filterUnit', 'filterFungsi',
    'filterUnitModal', 'filterFungsiModal',
    'toggleMetadataButton', 'metadataContent', 'metadataChevron',
    'permohonanLink', 'permohonanViewContainer', 'permohonanLoadingIndicator',
    'permohonanContent', 'permohonanTableBody', 'permohonanNoDataMessage',
    'permohonanCardsContainer', 'ajukanSopButtonPage',
    'formPermohonanModal', 'permohonanForm', 'closeFormModal', 'submitPermohonanButton',
    'formUnit', 'formNamaSop', 'formFile', 'formError', 'submitButtonText', 'submitSpinner',
    'datasetCountMobile', 'reloadDatasetButtonMobile', 'reloadIconMobile',
    'toastNotification', 'toastMessage',
    'detailKeterkaitanCard',
    'laporanModal', 'laporanForm', 'closeLaporanModal', 'submitLaporanButton',
    'laporanSopId', 'laporanTextarea', 'laporanError', 'laporanButtonText', 'laporanSpinner',
    'reportSopButton'
  ];
    ids.forEach(id => {
        const kebabCaseId = id.replace(/([A-Z])/g, "-$1").toLowerCase();
        const el = document.getElementById(kebabCaseId);
        if (el) {
            DOM[id] = el;
        } else {
            if (!['reportSopButton'].includes(id)) {
                 console.warn(`Elemen dengan ID '${kebabCaseId}' tidak ditemukan.`);
            }
        }
    });
 };


  // === STATE MANAGEMENT ===
  let allDatasets = [];
  let currentPage = 1;
  const rowsPerPage = 100;
  let currentFilteredData = [];
  let allPermohonan = [];
  let isPermohonanLoaded = false; 
  let toastTimeout = null;
  let currentSort = { key: 'IDSOP', order: 'desc' };
  let currentReportingSopId = null; 
  let searchDebounceTimeout = null; // PERUBAHAN BARU: Untuk debounce
  
   // === API HELPER ===
   const callAppsScript = async (action, payload = {}) => {
       try {
           const response = await fetch(WEB_APP_URL, {
               method: 'POST',
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

  const loadInitialData = async (isReload = false) => {
    const CACHE_DURATION_HOURS = 1;

    if (isReload) {
        showToast('Memuat ulang data SOP...');
        localStorage.removeItem('sopDataCache'); // Hapus cache agar reload efektif
    }
    
    const cachedItem = localStorage.getItem('sopDataCache');
    if (cachedItem && !isReload) {
        try {
            const cache = JSON.parse(cachedItem);
            const cacheAgeHours = (new Date().getTime() - cache.timestamp) / (1000 * 60 * 60);

            if (cache.data && cache.timestamp && cacheAgeHours < CACHE_DURATION_HOURS) {
                allDatasets = cache.data;
                populateFilterOptions();
                applyFiltersAndRender();
                setLoadingState(false);
                if (!isPermohonanLoaded) loadPermohonanDataInBackground();
                return;
            }
        } catch (e) {
            console.error("Gagal mem-parsing cache:", e);
            localStorage.removeItem('sopDataCache');
        }
    }
    
    setLoadingState(true);
    if (DOM.datasetList) DOM.datasetList.innerHTML = '';
    
    const response = await callAppsScript('getData', { sheetName: 'SOP' });

    if (response.status === 'success') {
        allDatasets = response.data || [];
        populateFilterOptions();
        applyFiltersAndRender();
        
        try {
            const cacheData = { data: allDatasets, timestamp: new Date().getTime() };
            localStorage.setItem('sopDataCache', JSON.stringify(cacheData));
        } catch (e) {
            console.warn("Gagal menyimpan data ke localStorage:", e);
        }
        
        if (isReload) showToast('Data berhasil dimuat ulang!', 'success');
        if (!isPermohonanLoaded) loadPermohonanDataInBackground();
    } else {
        if (isReload) showToast(`Gagal memuat: ${response.message}`, 'error');
        else showErrorState('Gagal Memuat Data', response.message);
    }
    
    setLoadingState(false);
};
  
  // === EVENT LISTENERS SETUP ===
  const setupEventListeners = () => {
    if (DOM.headerTitleLink) DOM.headerTitleLink.addEventListener('click', (e) => { e.preventDefault(); showView('list-view-container'); });
    if (DOM.hamburgerMenuButton) DOM.hamburgerMenuButton.addEventListener('click', () => toggleSideMenu(true));
    if (DOM.menuOverlay) DOM.menuOverlay.addEventListener('click', () => toggleSideMenu(false));
    if (DOM.homeLink) DOM.homeLink.addEventListener('click', (e) => { e.preventDefault(); showView('list-view-container', true); });
    if (DOM.aboutLink) DOM.aboutLink.addEventListener('click', (e) => { e.preventDefault(); showView('about-view-container', true); });
    if (DOM.backToListButton) DOM.backToListButton.addEventListener('click', () => showView('list-view-container'));
    if (DOM.permohonanLink) DOM.permohonanLink.addEventListener('click', (e) => { e.preventDefault(); displayPermohonanView(); });
    // PERUBAHAN: Menggunakan fungsi debounce untuk search
    if (DOM.searchInput) DOM.searchInput.addEventListener('input', handleSearchInput);
    if (DOM.searchInputMobile) DOM.searchInputMobile.addEventListener('input', handleSearchInput);
    if (DOM.filterUnit) DOM.filterUnit.addEventListener('change', syncAndFilter);
    if (DOM.filterFungsi) DOM.filterFungsi.addEventListener('change', syncAndFilter);
    if (DOM.filterUnitModal) DOM.filterUnitModal.addEventListener('change', syncAndFilter);
    if (DOM.filterFungsiModal) DOM.filterFungsiModal.addEventListener('change', syncAndFilter);
    if (DOM.reloadDatasetButton) DOM.reloadDatasetButton.addEventListener('click', handleReload);
    if (DOM.resetFilterButton) DOM.resetFilterButton.addEventListener('click', resetFilters);
    if (DOM.resetFilterButtonMobile) DOM.resetFilterButtonMobile.addEventListener('click', resetFilters);
    if (DOM.datasetList) DOM.datasetList.addEventListener('click', handleDatasetListClick);
    if (DOM.datasetCardsContainer) DOM.datasetCardsContainer.addEventListener('click', handleDatasetListClick);
    if (DOM.detailDownloadLink) DOM.detailDownloadLink.addEventListener('click', handleDownload);
    if (DOM.closeCustomAlert) DOM.closeCustomAlert.addEventListener('click', () => toggleModal('custom-alert-modal', false));
    if (DOM.openFilterButton) DOM.openFilterButton.addEventListener('click', () => toggleModal('filter-modal', true));
    if (DOM.closeFilterModal) DOM.closeFilterModal.addEventListener('click', () => toggleModal('filter-modal', false));
    if (DOM.toggleMetadataButton) DOM.toggleMetadataButton.addEventListener('click', () => {
         DOM.metadataContent.classList.toggle('hidden');
         DOM.metadataChevron.classList.toggle('rotate-180');
    });
    if (DOM.ajukanSopButtonPage) DOM.ajukanSopButtonPage.addEventListener('click', openPermohonanForm);
    if (DOM.closeFormModal) DOM.closeFormModal.addEventListener('click', () => toggleModal('form-permohonan-modal', false));
    if (DOM.permohonanForm) DOM.permohonanForm.addEventListener('submit', handleFormSubmit);
    if (DOM.reloadDatasetButtonMobile) DOM.reloadDatasetButtonMobile.addEventListener('click', handleReload);

    const tableHead = document.querySelector('#dataset-list')?.parentElement?.querySelector('thead');
    if (tableHead) {
        tableHead.addEventListener('click', handleSort);
    }

    if (DOM.detailViewContainer) {
        DOM.detailViewContainer.addEventListener('click', handleDetailViewClick);
    }

    if (DOM.closeLaporanModal) DOM.closeLaporanModal.addEventListener('click', () => toggleModal('laporan-modal', false));
    if (DOM.laporanForm) DOM.laporanForm.addEventListener('submit', handleLaporanSubmit);
  };

function updateUIForLoginStatus() {
  if(!DOM.userInfoContainer) return;
  DOM.userInfoContainer.innerHTML = `
    <button id="ajukan-sop-button-header" class="bg-blue-600 text-white hover:bg-blue-700 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm">
      <i class="fas fa-plus"></i>
      <span class="hidden sm:inline">Ajukan SOP</span>
    </button>
    <a href="./admin.html" target="_blank" class="bg-gray-200 text-gray-700 hover:bg-gray-300 p-2 rounded-full w-8 h-8 flex items-center justify-center" title="Login Administrator">
      <i class="fas fa-user"></i>
    </a>
  `;
  document.getElementById('ajukan-sop-button-header').addEventListener('click', openPermohonanForm);
}

// PERUBAHAN BARU: Fungsi debounce untuk menangani input pencarian
const handleSearchInput = (event) => {
    syncSearchInputs(event);
    clearTimeout(searchDebounceTimeout);
    searchDebounceTimeout = setTimeout(() => {
        applyFiltersAndRender();
    }, 300); // Jeda 300ms sebelum filter dijalankan
};

const syncSearchInputs = (event) => {
    const sourceElement = event.target;
    if (sourceElement.id === 'search-input' && DOM.searchInputMobile) {
        DOM.searchInputMobile.value = sourceElement.value;
    } else if (sourceElement.id === 'search-input-mobile' && DOM.searchInput) {
        DOM.searchInput.value = sourceElement.value;
    }
}

function syncAndFilter(event) {
    const sourceElement = event.target;
    
    if (sourceElement.id === 'filter-unit' && DOM.filterUnitModal) DOM.filterUnitModal.value = sourceElement.value;
    else if (sourceElement.id === 'filter-unit-modal' && DOM.filterUnit) DOM.filterUnit.value = sourceElement.value;

    if (sourceElement.id === 'filter-fungsi' && DOM.filterFungsiModal) DOM.filterFungsiModal.value = sourceElement.value;
    else if (sourceElement.id === 'filter-fungsi-modal' && DOM.filterFungsi) DOM.filterFungsi.value = sourceElement.value;
    
    applyFiltersAndRender();
}

function applyFiltersAndRender() {
    let filteredData = [...allDatasets];
    const searchTerm = DOM.searchInput ? DOM.searchInput.value.toLowerCase() : '';
    const selectedUnit = DOM.filterUnit ? DOM.filterUnit.value : '';
    const selectedFungsi = DOM.filterFungsi ? DOM.filterFungsi.value : '';

    if (searchTerm) {
        filteredData = filteredData.filter(item => 
            (item['Nama SOP'] || '').toLowerCase().includes(searchTerm) || 
            (item['Nomor SOP'] || '').toLowerCase().includes(searchTerm)
        );
    }
    if (selectedUnit) filteredData = filteredData.filter(item => item.Unit === selectedUnit);
    if (selectedFungsi) filteredData = filteredData.filter(item => item.Fungsi === selectedFungsi);
    
    if (currentSort.key) {
        filteredData.sort((a, b) => {
            const valA = a[currentSort.key] || '';
            const valB = b[currentSort.key] || '';
            const comparison = valA.localeCompare(valB, 'id-ID', { numeric: true });
            return currentSort.order === 'asc' ? comparison : -comparison;
        });
    }

    currentFilteredData = filteredData;
    currentPage = 1;
    renderPageContent();
}

// PERUBAHAN: Optimasi rendering dengan membangun string HTML sekali jalan
function renderPageContent() {
    if (!DOM.datasetList || !DOM.datasetCardsContainer) return;

    updateSortIcons();
    const hasData = currentFilteredData.length > 0;
    if (DOM.noDataMessage) DOM.noDataMessage.classList.toggle('hidden', hasData);

    if (!hasData) {
        DOM.datasetList.innerHTML = '';
        DOM.datasetCardsContainer.innerHTML = '';
        if (DOM.paginationContainer) DOM.paginationContainer.innerHTML = '';
        updateDatasetCount();
        return;
    }

    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedItems = currentFilteredData.slice(startIndex, startIndex + rowsPerPage);
    
    let tableRowsHTML = '';
    let cardsHTML = '';

    paginatedItems.forEach(item => {
        const unitText = item.Unit || 'N/A';
        const fungsiText = item.Fungsi || 'N/A';
        const nomorSOP = item['Nomor SOP'] || 'N/A';
        const safeIDSOP = (item.IDSOP || '').trim();
        const unitLabel = `<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${unitText}</span>`;
        
        tableRowsHTML += `
            <tr class="view-detail-trigger cursor-pointer hover:bg-gray-50" data-id="${safeIDSOP}">
                <td class="p-4 text-sm text-gray-700">${nomorSOP}</td>
                <td class="p-4 text-sm font-semibold text-gray-900">${item['Nama SOP'] || 'Tanpa Judul'}</td>
                <td class="p-4 text-sm text-gray-700">${unitLabel}</td>
                <td class="p-4 text-sm text-gray-700">${fungsiText}</td>
            </tr>`;
            
        cardsHTML += `
            <div class="view-detail-trigger cursor-pointer p-4" data-id="${safeIDSOP}">
                <p class="font-semibold text-gray-900">${item['Nama SOP'] || 'Tanpa Judul'}</p>
                <p class="text-xs text-gray-500 mt-2 flex items-center gap-2 flex-wrap">
                    ${unitLabel} <span class="mx-1">-</span> <span>${fungsiText}</span>
                </p>
            </div>`;
    });

    DOM.datasetList.innerHTML = tableRowsHTML;
    DOM.datasetCardsContainer.innerHTML = cardsHTML;

    renderPaginationControls();
    updateDatasetCount();
}

function renderPaginationControls() {
    if(!DOM.paginationContainer) return;
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
    const trimmedIdsop = idsop ? idsop.trim() : '';
    const item = allDatasets.find(d => (d.IDSOP || '').trim() === trimmedIdsop);
    if (!item) {
        showCustomAlert('Data tidak ditemukan.', 'error');
        showView('list-view-container');
        return;
    }
    
    window.scrollTo(0,0);
    DOM.metadataContent.classList.add('hidden');
    DOM.metadataChevron.classList.remove('rotate-180');
    DOM.detailTitle.textContent = item['Nama SOP'] || 'Tanpa Judul';
    DOM.detailUraian.textContent = item['Nomor SOP'] || 'Tidak ada nomor SOP.';
    DOM.metaPenandatangan.textContent = item.Penandatangan || 'N/A';
    DOM.metaUnit.textContent = item.Unit || 'N/A';
    DOM.metaFungsi.textContent = item.Fungsi || 'N/A';
    DOM.metaTanggal.textContent = item['Tanggal Pembuatan'] || 'N/A';
    DOM.metaEfektif.textContent = item['Tanggal Efektif'] || 'N/A';
    const tanggalRevisi = item['Tanggal Revisi'] || 'N/A';
    if (tanggalRevisi !== "N/A" && tanggalRevisi.trim() !== "") {
        DOM.metaDiperbaharui.textContent = tanggalRevisi;
        DOM.metaRevisiRow.classList.remove('hidden');
    } else {
        DOM.metaRevisiRow.classList.add('hidden');
    }
    if (item.Status) {
        DOM.detailStatus.textContent = item.Status;
        DOM.detailStatus.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
        if (item.Status.toLowerCase() === 'berlaku' || item.Status.toLowerCase() === 'aktif') {
            DOM.detailStatus.classList.add('bg-green-100', 'text-green-800');
        } else {
            DOM.detailStatus.classList.add('bg-red-100', 'text-red-800');
        }
    } else {
        DOM.detailStatus.classList.add('hidden');
    }
    
    const reportButton = document.getElementById('report-sop-button');
    if(reportButton) reportButton.dataset.id = trimmedIdsop;
    
    DOM.detailDownloadLink.style.display = 'inline-block';
    const fileUrl = item.File || '';
    const driveRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = fileUrl.match(driveRegex);
    const fileId = match ? match[1] : null;
    
    DOM.tablePreviewContainer.classList.remove('hidden');
    if (fileId) {
        DOM.detailDownloadLink.href = `https://drive.google.com/uc?export=download&id=${fileId}`;
        DOM.tablePreviewContent.innerHTML = `<iframe src="https://drive.google.com/file/d/${fileId}/preview" class="w-full h-full" style="min-height: 80vh;" frameborder="0"></iframe>`;
    } else {
        DOM.detailDownloadLink.href = '#';
        DOM.tablePreviewContent.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8 bg-gray-50 rounded-md" style="min-height: 50vh;"><i class="fas fa-file-excel fa-3x mb-4 text-gray-400"></i><p class="font-semibold">Tidak Ada Pratinjau</p><p class="text-sm mt-1">Dokumen untuk SOP ini tidak tersedia.</p></div>`;
    }

    if (DOM.detailKeterkaitanCard && item.Hubungan && item.Hubungan.trim() !== '') {
        const hubunganList = item.Hubungan.split(',').map(sop => sop.trim());
        let listHTML = '<div class="pt-4 mt-4 border-t"><h3 class="text-sm font-semibold text-gray-800 mb-2">Keterkaitan:</h3><ol class="list-decimal list-inside space-y-2 text-sm">';
        
        hubunganList.forEach(sopName => {
            const relatedSop = allDatasets.find(d => d['Nama SOP'] === sopName);
            if (relatedSop) {
                listHTML += `<li><a href="#" class="related-sop-link text-blue-600 hover:underline" data-id="${relatedSop.IDSOP}">${sopName}</a></li>`;
            } else {
                listHTML += `<li class="text-gray-500">${sopName} (data tidak ditemukan)</li>`;
            }
        });
        listHTML += '</ol></div>';
        
        DOM.detailKeterkaitanCard.innerHTML = listHTML;
        DOM.detailKeterkaitanCard.classList.remove('hidden');
    } else if (DOM.detailKeterkaitanCard) {
        DOM.detailKeterkaitanCard.innerHTML = '';
        DOM.detailKeterkaitanCard.classList.add('hidden');
    }

    showView('detail-view-container');
}

//==================================================
// FUNGSI-FUNGSI UNTUK HALAMAN LAPORAN
//==================================================

const openLaporanForm = (idsop) => {
    currentReportingSopId = idsop;
    if (DOM.laporanForm) DOM.laporanForm.reset();
    if (DOM.laporanSopId) DOM.laporanSopId.value = idsop;
    if (DOM.laporanError) DOM.laporanError.classList.add('hidden');
    toggleModal('laporan-modal', true);
};

const handleLaporanSubmit = async (e) => {
    e.preventDefault();
    if (!currentReportingSopId) return;

    DOM.laporanSpinner.classList.remove('hidden');
    DOM.laporanButtonText.classList.add('hidden');
    DOM.submitLaporanButton.disabled = true;
    DOM.laporanError.classList.add('hidden');

    const laporanText = DOM.laporanTextarea.value;
    if (!laporanText.trim()) {
        showLaporanError("Isi laporan tidak boleh kosong.");
        return;
    }

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    const payload = {
        data: {
            IDSOP: currentReportingSopId,
            Tanggal: formattedDate,
            Laporan: laporanText
        }
    };

    const response = await callAppsScript('addLaporan', payload);

    if (response.status === 'success') {
        toggleModal('laporan-modal', false);
        showToast('Laporan berhasil dikirim. Terima kasih.', 'success');
    } else {
        showLaporanError(response.message || 'Terjadi kesalahan saat mengirim laporan.');
    }

    DOM.laporanSpinner.classList.add('hidden');
    DOM.laporanButtonText.classList.remove('hidden');
    DOM.submitLaporanButton.disabled = false;
};

const showLaporanError = (message) => {
    DOM.laporanError.textContent = message;
    DOM.laporanError.classList.remove('hidden');
    DOM.laporanSpinner.classList.add('hidden');
    DOM.laporanButtonText.classList.remove('hidden');
    DOM.submitLaporanButton.disabled = false;
};


//==================================================
// FUNGSI-FUNGSI UNTUK HALAMAN PERMOHONAN
//==================================================

const displayPermohonanView = () => {
    showView('permohonan-view-container', true);
    loadPermohonanData();
};

const loadPermohonanDataInBackground = async () => {
    const response = await callAppsScript('getData', { sheetName: 'Permohonan' });
    if (response.status === 'success') {
        allPermohonan = response.data || [];
        if (allPermohonan.length > 0 && allPermohonan[0].Timestamp) {
            allPermohonan.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
        }
        isPermohonanLoaded = true;
    }
};

const loadPermohonanData = async () => {
    DOM.permohonanContent.classList.add('hidden');
    DOM.permohonanNoDataMessage.classList.add('hidden');

    if (isPermohonanLoaded) {
        DOM.permohonanLoadingIndicator.style.display = 'none'; 
        renderPermohonanData();
    } else {
        DOM.permohonanLoadingIndicator.style.display = 'block';
        const response = await callAppsScript('getData', { sheetName: 'Permohonan' });
        DOM.permohonanLoadingIndicator.style.display = 'none';

        if (response.status === 'success') {
            allPermohonan = response.data || [];
            if (allPermohonan.length > 0 && allPermohonan[0].Timestamp) {
                allPermohonan.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
            }
            isPermohonanLoaded = true;
            renderPermohonanData();
        } else {
            DOM.permohonanContent.innerHTML = `<p class="text-center text-red-500 py-10">Gagal memuat data permohonan. Silakan coba lagi nanti.</p>`;
            DOM.permohonanContent.classList.remove('hidden');
        }
    }
};

// PERUBAHAN: Optimasi rendering dengan membangun string HTML sekali jalan
const renderPermohonanData = () => {
    DOM.permohonanContent.classList.remove('hidden');
    const contentContainer = DOM.permohonanContent.querySelector('.bg-white');
    
    const hasData = allPermohonan.length > 0;
    DOM.permohonanNoDataMessage.classList.toggle('hidden', hasData);
    if (contentContainer) contentContainer.classList.toggle('hidden', !hasData);

    if (!hasData) {
        DOM.permohonanTableBody.innerHTML = '';
        DOM.permohonanCardsContainer.innerHTML = '';
        return;
    }
    
    let tableRowsHTML = '';
    let cardsHTML = '';

    allPermohonan.forEach(item => {
        const statusText = item.Status || 'Diajukan';
        let statusBadge = '';
        switch (statusText.toLowerCase()) {
            case 'disetujui': statusBadge = `<span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>`; break;
            case 'ditolak': statusBadge = `<span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>`; break;
            default: statusBadge = `<span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>`;
        }
        const formattedTimestamp = item.Timestamp ? new Date(item.Timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
        
        tableRowsHTML += `<tr><td class="p-4 text-sm text-gray-700 font-mono">${item.IDPermohonan || 'N/A'}</td><td class="p-4 text-sm text-gray-700">${formattedTimestamp}</td><td class="p-4 text-sm text-gray-700">${item.Unit || 'N/A'}</td><td class="p-4 text-sm font-semibold text-gray-900">${item['Nama SOP'] || 'N/A'}</td><td class="p-4 text-sm text-gray-700">${statusBadge}</td><td class="p-4 text-sm text-gray-500">${item.Keterangan || ''}</td></tr>`;

        cardsHTML += `<div class="p-4 space-y-2"><div class="flex justify-between items-start"><p class="font-semibold text-gray-900">${item['Nama SOP'] || 'N/A'}</p>${statusBadge}</div><p class="text-xs text-gray-500"><span class="font-medium">Unit:</span> ${item.Unit || 'N/A'}</p><p class="text-xs text-gray-500"><span class="font-medium">ID:</span> ${item.IDPermohonan || 'N/A'}</p><p class="text-xs text-gray-500"><span class="font-medium">Tanggal:</span> ${formattedTimestamp}</p>${item.Keterangan ? `<p class="text-xs text-gray-600 bg-gray-50 p-2 rounded-md mt-1"><span class="font-medium">Ket:</span> ${item.Keterangan}</p>` : ''}</div>`;
    });

    DOM.permohonanTableBody.innerHTML = tableRowsHTML;
    DOM.permohonanCardsContainer.innerHTML = cardsHTML;
};


function openPermohonanForm() {
    if(!DOM.permohonanForm) return;
    DOM.permohonanForm.reset();
    if(DOM.formError) DOM.formError.classList.add('hidden');
    toggleModal('form-permohonan-modal', true);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    DOM.submitSpinner.classList.remove('hidden');
    DOM.submitButtonText.classList.add('hidden');
    DOM.submitPermohonanButton.disabled = true;
    DOM.formError.classList.add('hidden');

    const unit = DOM.formUnit.value;
    const namaSop = DOM.formNamaSop.value;
    const file = DOM.formFile.files[0];
    if (!unit || !namaSop) {
        showFormError("Unit dan Nama SOP wajib diisi.");
        return;
    }
    if (file && file.size > 1 * 1024 * 1024) { // 1 MB
        showFormError("Ukuran file tidak boleh melebihi 1MB.");
        return;
    }
    const payload = {
        data: {
            Unit: unit,
            "Nama SOP": namaSop,
        }
    };
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const fileData = reader.result;
            payload.fileInfo = {
                fileData: fileData,
                fileName: file.name,
                fileType: file.type,
            };
            sendFormData(payload);
        };
        reader.onerror = () => {
            showFormError("Gagal membaca file.");
        };
    } else {
        sendFormData(payload);
    }
}

async function sendFormData(payload) {
    const response = await callAppsScript('addPermohonan', payload);
    if (response.status === 'success') {
        toggleModal('form-permohonan-modal', false);
        showCustomAlert('Permohonan Anda berhasil dikirim!', 'success');
        isPermohonanLoaded = false; 
        if (!DOM.permohonanViewContainer.classList.contains('hidden')) {
            loadPermohonanData();
        }
    } else {
        showFormError(response.message || 'Terjadi kesalahan di server.');
    }
}

function showFormError(message) {
    DOM.formError.textContent = message;
    DOM.formError.classList.remove('hidden');
    DOM.submitSpinner.classList.add('hidden');
    DOM.submitButtonText.classList.remove('hidden');
    DOM.submitPermohonanButton.disabled = false;
}

function handleDatasetListClick(e) {
      const viewTrigger = e.target.closest('.view-detail-trigger');
      if (viewTrigger) showDetailView(viewTrigger.dataset.id);
}

const handleDetailViewClick = (e) => {
    const relatedLink = e.target.closest('.related-sop-link');
    if (relatedLink) {
        e.preventDefault();
        const sopId = relatedLink.dataset.id;
        if (sopId) {
            showDetailView(sopId);
        }
    }

    const reportButton = e.target.closest('#report-sop-button');
    if (reportButton) {
        e.preventDefault();
        const sopId = reportButton.dataset.id;
        if (sopId) {
            openLaporanForm(sopId);
        }
    }
};

function handleDownload() {
      console.log("Tombol unduh diklik.");
}

function handleReload() {
    loadInitialData(true);
}

const handleSort = (e) => {
    const header = e.target.closest('[data-sort-key]');
    if (!header) return;

    const key = header.dataset.sortKey;
    
    if (currentSort.key === key) {
        currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.key = key;
        currentSort.order = 'asc';
    }
    applyFiltersAndRender();
};

const updateSortIcons = () => {
    const headers = document.querySelectorAll('th[data-sort-key]');
    headers.forEach(header => {
        const key = header.dataset.sortKey;
        const icon = header.querySelector('i');
        if (!icon) return;

        icon.classList.remove('fa-sort', 'fa-sort-up', 'fa-sort-down', 'text-blue-500', 'text-gray-400');

        if (currentSort.key === key) {
            icon.classList.add(currentSort.order === 'asc' ? 'fa-sort-up' : 'fa-sort-down');
            icon.classList.add('text-blue-500');
        } else {
            icon.classList.add('fa-sort', 'text-gray-400');
        }
    });
};


function showToast(message, type = 'info') {
    if(!DOM.toastNotification || !DOM.toastMessage) return;
    clearTimeout(toastTimeout);
    const toast = DOM.toastNotification;
    const icon = toast.querySelector('i');

    DOM.toastMessage.textContent = message;
    
    toast.classList.remove('bg-gray-800', 'bg-green-600', 'bg-red-600', 'translate-x-[120%]');
    if(icon) icon.className = 'mr-3 fa-lg';

    if (type === 'success') {
        toast.classList.add('bg-green-600');
        if(icon) icon.classList.add('fas', 'fa-check-circle');
    } else if (type === 'error') {
        toast.classList.add('bg-red-600');
        if(icon) icon.classList.add('fas', 'fa-exclamation-circle');
    } else {
        toast.classList.add('bg-gray-800');
        if(icon) icon.classList.add('fas', 'fa-sync-alt', 'fa-spin');
    }
    
    toast.classList.remove('translate-x-[120%]');
    
    if (type !== 'info') {
        toastTimeout = setTimeout(hideToast, 3000);
    }
}

function hideToast() {
  if (DOM.toastNotification) {
    DOM.toastNotification.classList.add('translate-x-[120%]');
  }
}

function toggleModal(modalId, show) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.toggle('hidden', !show);
}

function showView(viewId, closeMenu = false) {
      document.querySelectorAll('#main-app > main > div[id$="-container"]').forEach(div => div.classList.add('hidden'));
      const view = document.getElementById(viewId);
      if(view) view.classList.remove('hidden');
      if (closeMenu) toggleSideMenu(false);
      if (document.getElementById(viewId)?.classList.contains('hidden')) {
        window.scrollTo(0, 0);
      }
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
      const container = DOM.listViewContainer || document.body;
      container.innerHTML = `<div class="text-center py-10 bg-red-50 rounded-lg"><i class="fas fa-exclamation-triangle fa-3x text-red-500"></i><h2 class="mt-4 text-xl font-bold text-red-800">${title}</h2><p class="mt-2 text-red-700">${message}</p></div>`;
      setLoadingState(false);
}

function setLoadingState(isLoading) {
    if(DOM.loadingIndicator) DOM.loadingIndicator.classList.toggle('hidden', !isLoading);

    const buttons = [DOM.reloadDatasetButton, DOM.reloadDatasetButtonMobile];
    const icons = [document.getElementById('reload-icon'), DOM.reloadIconMobile];

    buttons.forEach(button => {
        if (button) button.disabled = isLoading;
    });

    icons.forEach(icon => {
        if (icon) {
            if (isLoading) icon.classList.add('fa-spin');
            else icon.classList.remove('fa-spin');
        }
    });
}

function populateFilterOptions() {
      const units = [...new Set(allDatasets.map(item => item.Unit).filter(Boolean))].sort();
      const fungsis = [...new Set(allDatasets.map(item => item.Fungsi).filter(Boolean))].sort();
      const populateSelect = (selectElement, options, defaultText) => {
          if (!selectElement) return;
          selectElement.innerHTML = `<option value="">${defaultText}</option>`;
          options.forEach(option => {
              selectElement.innerHTML += `<option value="${option}">${option}</option>`;
          });
      };
      populateSelect(DOM.filterUnit, units, "Semua Unit");
      populateSelect(DOM.filterFungsi, fungsis, "Semua Fungsi");
      populateSelect(DOM.filterUnitModal, units, "Semua Unit");
      populateSelect(DOM.filterFungsiModal, fungsis, "Semua Fungsi");
}

function toggleSideMenu(show) {
      if(DOM.popupMenu) DOM.popupMenu.classList.toggle('-translate-x-full', !show);
      if(DOM.menuOverlay) DOM.menuOverlay.classList.toggle('hidden', !show);
}

function resetFilters() {
    if(DOM.searchInput) DOM.searchInput.value = '';
    if(DOM.searchInputMobile) DOM.searchInputMobile.value = '';
    if(DOM.filterUnit) DOM.filterUnit.value = '';
    if(DOM.filterFungsi) DOM.filterFungsi.value = '';
    if(DOM.filterUnitModal) DOM.filterUnitModal.value = '';
    if(DOM.filterFungsiModal) DOM.filterFungsiModal.value = '';
    
    currentSort = { key: 'IDSOP', order: 'desc' };
    
    applyFiltersAndRender();
}

function updateDatasetCount() {
    const text = `<i class="fa-solid fa-box-archive mr-2"></i> <strong>${currentFilteredData.length}</strong> SOP Ditemukan`;
    if(DOM.datasetCount) DOM.datasetCount.innerHTML = text;
    if(DOM.datasetCountMobile) DOM.datasetCountMobile.innerHTML = text;
}

// RUN APP
initializeApp();
});
