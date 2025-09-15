// --- KONFIGURASI APLIKASI ---
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby3PDSqG35NMjCoo2eT2eVt7uLfNmfx1FxfkTPfgp3_UGmSPoplvT_kyWVE65Iqo8ry/exec';

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
    'confirmReloadModal', 'confirmReloadButton', 'cancelReloadButton',
    'searchInputMobile', 'resetFilterButtonMobile',
    'filterUnit', 'filterFungsi',
    'filterUnitModal', 'filterFungsiModal',
    'toggleMetadataButton', 'metadataContent', 'metadataChevron',
    // [BARU] ID untuk halaman Permohonan
    'permohonanLink', 'permohonanViewContainer', 'permohonanLoadingIndicator',
    'permohonanContent', 'permohonanTableBody', 'permohonanNoDataMessage'
  ];
    ids.forEach(id => {
        const kebabCaseId = id.replace(/([A-Z])/g, "-$1").toLowerCase();
        const el = document.getElementById(kebabCaseId);
        if (el) {
            DOM[id] = el;
        } else {
            console.warn(`Elemen dengan ID '${kebabCaseId}' tidak ditemukan.`);
        }
    });
 };

 // === STATE MANAGEMENT ===
 let allDatasets = [];
 let currentPage = 1;
 const rowsPerPage = 100;
 let currentFilteredData = [];
 // [BARU] State untuk data permohonan
 let allPermohonan = [];
 let isPermohonanLoaded = false;
 
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
          allDatasets.sort((a, b) => (b.IDSOP || '').localeCompare(a.IDSOP || ''));
          
          populateFilterOptions();
          applyFiltersAndRender();
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
    
    // [BARU] Event listener untuk menu permohonan
    DOM.permohonanLink.addEventListener('click', (e) => { e.preventDefault(); displayPermohonanView(); });

    DOM.searchInput.addEventListener('input', syncAndFilter);
    DOM.searchInputMobile.addEventListener('input', syncAndFilter);
    DOM.filterUnit.addEventListener('change', syncAndFilter);
    DOM.filterFungsi.addEventListener('change', syncAndFilter);
    DOM.filterUnitModal.addEventListener('change', syncAndFilter);
    DOM.filterFungsiModal.addEventListener('change', syncAndFilter);

    DOM.reloadDatasetButton.addEventListener('click', handleReload);
    DOM.resetFilterButton.addEventListener('click', resetFilters);
    DOM.resetFilterButtonMobile.addEventListener('click', resetFilters);

    DOM.datasetList.addEventListener('click', handleDatasetListClick);
    DOM.datasetCardsContainer.addEventListener('click', handleDatasetListClick);
    if (DOM.detailDownloadLink) DOM.detailDownloadLink.addEventListener('click', handleDownload);
    DOM.closeCustomAlert.addEventListener('click', () => toggleModal('custom-alert-modal', false));
    DOM.closeLoginModal.addEventListener('click', () => toggleModal('login-modal', false));

    DOM.openFilterButton.addEventListener('click', () => toggleModal('filter-modal', true));
    DOM.closeFilterModal.addEventListener('click', () => toggleModal('filter-modal', false));

    DOM.cancelReloadButton.addEventListener('click', () => toggleModal('confirm-reload-modal', false));
    DOM.confirmReloadButton.addEventListener('click', () => {
        toggleModal('confirm-reload-modal', false);
        loadInitialData();
    });

    // Event listener untuk metadata accordion
    DOM.toggleMetadataButton.addEventListener('click', () => {
         DOM.metadataContent.classList.toggle('hidden');
         DOM.metadataChevron.classList.toggle('rotate-180');
    });
 };

//==================================================
// UI UPDATE FUNCTIONS
//==================================================

function updateUIForLoginStatus() {
  DOM.userInfoContainer.innerHTML = `<button id="admin-login-button" class="bg-blue-600 text-white hover:bg-blue-700 p-2 rounded-full w-10 h-10 flex items-center justify-center" title="Login Administrator"><i class="fas fa-user text-lg"></i></button>`;
}

//==================================================
// DATA RENDERING & FILTERING (SOP)
//==================================================

function syncAndFilter(event) {
     const sourceElement = event.target;

     if (sourceElement.id === 'search-input') {
         DOM.searchInputMobile.value = sourceElement.value;
     } else if (sourceElement.id === 'search-input-mobile') {
         DOM.searchInput.value = sourceElement.value;
     }

     if (sourceElement.id === 'filter-unit') {
         DOM.filterUnitModal.value = sourceElement.value;
     } else if (sourceElement.id === 'filter-unit-modal') {
         DOM.filterUnit.value = sourceElement.value;
     }

     if (sourceElement.id === 'filter-fungsi') {
         DOM.filterFungsiModal.value = sourceElement.value;
     } else if (sourceElement.id === 'filter-fungsi-modal') {
         DOM.filterFungsi.value = sourceElement.value;
     }

     applyFiltersAndRender();
}


function applyFiltersAndRender() {
      let filteredData = [...allDatasets];
      
      const searchTerm = DOM.searchInput.value.toLowerCase();
      const selectedUnit = DOM.filterUnit.value;
      const selectedFungsi = DOM.filterFungsi.value;

      if (searchTerm) {
          filteredData = filteredData.filter(item => 
              (item['Nama SOP'] || '').toLowerCase().includes(searchTerm) || 
              (item['Nomor SOP'] || '').toLowerCase().includes(searchTerm)
          );
      }

      if (selectedUnit) {
          filteredData = filteredData.filter(item => item.Unit === selectedUnit);
      }
      
      if (selectedFungsi) {
          filteredData = filteredData.filter(item => item.Fungsi === selectedFungsi);
      }
      
      currentFilteredData = filteredData;
      currentPage = 1;
      renderPageContent();
}

function renderPageContent() {
      DOM.datasetList.innerHTML = ''; 
      DOM.datasetCardsContainer.innerHTML = ''; 
      DOM.noDataMessage.classList.toggle('hidden', currentFilteredData.length > 0);

      if (currentFilteredData.length === 0) {
          if(DOM.paginationContainer) DOM.paginationContainer.innerHTML = '';
          updateDatasetCount();
          return;
      }
      
      const startIndex = (currentPage - 1) * rowsPerPage;
      const paginatedItems = currentFilteredData.slice(startIndex, startIndex + rowsPerPage);

      paginatedItems.forEach(item => {
          const unitText = item.Unit || 'N/A';
          const fungsiText = item.Fungsi || 'N/A';
          const nomorSOP = item['Nomor SOP'] || 'N/A';
          const safeIDSOP = (item.IDSOP || '').trim();

          const unitLabel = `<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${unitText}</span>`;
          
          const tableRowHTML = `
               <tr class="view-detail-trigger cursor-pointer hover:bg-gray-50" data-id="${safeIDSOP}">
                   <td class="p-4 text-sm text-gray-700">${nomorSOP}</td>
                   <td class="p-4 text-sm font-semibold text-gray-900">${item['Nama SOP'] || 'Tanpa Judul'}</td>
                   <td class="p-4 text-sm text-gray-700">${unitLabel}</td>
                   <td class="p-4 text-sm text-gray-700">${fungsiText}</td>
               </tr>`;
          
          const cardHTML = `
               <div class="view-detail-trigger cursor-pointer p-4" data-id="${safeIDSOP}">
                   <p class="font-semibold text-gray-900">${item['Nama SOP'] || 'Tanpa Judul'}</p>
                   <p class="text-xs text-gray-500 mt-2 flex items-center gap-2 flex-wrap">
                       ${unitLabel}
                       <span class="mx-1">-</span>
                       <span>${fungsiText}</span>
                   </p>
               </div>
          `;

          DOM.datasetList.innerHTML += tableRowHTML;
          DOM.datasetCardsContainer.innerHTML += cardHTML;
      });

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
      
      // Reset metadata accordion ke keadaan default (terciut)
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
      
      DOM.detailDownloadLink.style.display = 'inline-block';

      const fileUrl = item.File || '';
      const driveRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
      const match = fileUrl.match(driveRegex);
      const fileId = match ? match[1] : null;

      DOM.tablePreviewContainer.classList.add('hidden');
      DOM.tablePreviewContent.innerHTML = '';
      if (fileId) {
          DOM.detailDownloadLink.href = `https://drive.google.com/uc?export=download&id=${fileId}`;
          DOM.tablePreviewContainer.classList.remove('hidden');
          DOM.tablePreviewContent.innerHTML = `<iframe src="https://drive.google.com/file/d/${fileId}/preview" class="w-full h-full" style="min-height: 80vh;" frameborder="0"></iframe>`;
      } else {
          DOM.detailDownloadLink.href = '#';
      }

      showView('detail-view-container');
}

//==================================================
// [BARU] FUNGSI-FUNGSI UNTUK HALAMAN PERMOHONAN
//==================================================

const displayPermohonanView = () => {
    showView('permohonan-view-container', true);
    // Hanya fetch data jika belum pernah dimuat
    if (!isPermohonanLoaded) {
        loadPermohonanData();
    }
};

const loadPermohonanData = async () => {
    DOM.permohonanLoadingIndicator.style.display = 'block';
    DOM.permohonanContent.classList.add('hidden');

    const response = await callAppsScript('getData', { sheetName: 'Permohonan' });

    DOM.permohonanLoadingIndicator.style.display = 'none';
    if (response.status === 'success') {
        allPermohonan = response.data || [];
        // Urutkan berdasarkan timestamp, yang terbaru di atas
        if (allPermohonan.length > 0 && allPermohonan[0].Timestamp) {
            allPermohonan.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
        }
        isPermohonanLoaded = true;
        renderPermohonanTable();
    } else {
        // Tampilkan pesan error di dalam container
        const permohonanSection = DOM.permohonanViewContainer.querySelector('section');
        if (permohonanSection) {
            permohonanSection.innerHTML = `<p class="text-center text-red-500 py-10">Gagal memuat data permohonan: ${response.message}</p>`;
        }
    }
};

const renderPermohonanTable = () => {
    DOM.permohonanTableBody.innerHTML = '';
    DOM.permohonanContent.classList.remove('hidden');
    const tableContainer = DOM.permohonanContent.querySelector('.bg-white');

    if (allPermohonan.length === 0) {
        DOM.permohonanNoDataMessage.classList.remove('hidden');
        if (tableContainer) tableContainer.classList.add('hidden');
    } else {
        DOM.permohonanNoDataMessage.classList.add('hidden');
        if (tableContainer) tableContainer.classList.remove('hidden');

        allPermohonan.forEach(item => {
            const statusText = item.Status || 'Diajukan';
            let statusBadge = '';
            // Memberi warna badge sesuai status
            switch (statusText.toLowerCase()) {
                case 'disetujui':
                    statusBadge = `<span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>`;
                    break;
                case 'ditolak':
                    statusBadge = `<span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>`;
                    break;
                default: // 'diajukan', 'diproses', dll
                    statusBadge = `<span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>`;
            }

            const formattedTimestamp = item.Timestamp ? new Date(item.Timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';

            const rowHTML = `
                <tr>
                    <td class="p-4 text-sm text-gray-700 font-mono">${item.IDPermohonan || 'N/A'}</td>
                    <td class="p-4 text-sm text-gray-700">${formattedTimestamp}</td>
                    <td class="p-4 text-sm text-gray-700">${item.Unit || 'N/A'}</td>
                    <td class="p-4 text-sm font-semibold text-gray-900">${item['Nama SOP'] || 'N/A'}</td>
                    <td class="p-4 text-sm text-gray-700">${statusBadge}</td>
                    <td class="p-4 text-sm text-gray-500">${item.Keterangan || ''}</td>
                </tr>
            `;
            DOM.permohonanTableBody.innerHTML += rowHTML;
        });
    }
};

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

function handleReload() {
    toggleModal('confirm-reload-modal', true);
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
      const container = DOM.listViewContainer || document.body;
      container.innerHTML = `
          <div class="text-center py-10 bg-red-50 rounded-lg">
              <i class="fas fa-exclamation-triangle fa-3x text-red-500"></i>
              <h2 class="mt-4 text-xl font-bold text-red-800">${title}</h2>
              <p class="mt-2 text-red-700">${message}</p>
          </div>
      `;
      setLoadingState(false);
}

function setLoadingState(isLoading) {
      if(DOM.loadingIndicator) DOM.loadingIndicator.classList.toggle('hidden', !isLoading);
      if(DOM.reloadDatasetButton) {
          DOM.reloadDatasetButton.disabled = isLoading;
          const icon = DOM.reloadDatasetButton.querySelector('i');
          if (icon) {
              if (isLoading) icon.classList.add('fa-spin');
              else icon.classList.remove('fa-spin');
          }
      }
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
      DOM.searchInput.value = '';
      DOM.searchInputMobile.value = '';
      DOM.filterUnit.value = '';
      DOM.filterFungsi.value = '';
      DOM.filterUnitModal.value = '';
      DOM.filterFungsiModal.value = '';
      applyFiltersAndRender();
}


function updateDatasetCount() {
      if(!DOM.datasetCount) return;
      DOM.datasetCount.innerHTML = `<i class="fa-solid fa-box-archive mr-2"></i> <strong>${currentFilteredData.length}</strong> SOP Ditemukan`;
}

// RUN APP
initializeApp();
});
