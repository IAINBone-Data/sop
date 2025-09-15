// --- KONFIGURASI APLIKASI ---
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwpH0q71ofk6Jm6hdHmrGl8QMSL26v1jRrWIpREMn9geTlJXmf34fykZRwFj67iSmYB/exec';

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
    // [BARU] Elemen untuk Toast Notification
    'toastNotification', 'toastMessage'
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
 let allPermohonan = [];
 let isPermohonanLoaded = false;
  let toastTimeout = null; // [BARU] Untuk mengelola timer toast
 
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
  loadInitialData(); // Fungsi ini sekarang menangani logika caching
 };

 const loadInitialData = async (isReload = false) => {
    if (isReload) {
        showToast('Memuat ulang data SOP...');
    } else {
        // [OPTIMISASI] Coba muat dari cache browser (localStorage) terlebih dahulu
        const cachedSOP = localStorage.getItem('sopDataCache');
        if (cachedSOP) {
            allDatasets = JSON.parse(cachedSOP);
            populateFilterOptions();
            applyFiltersAndRender();
            setLoadingState(false); // Pastikan UI siap dan hilangkan loading awal
        } else {
            // Hanya tampilkan loading halaman penuh jika tidak ada cache sama sekali
            setLoadingState(true);
            DOM.datasetList.innerHTML = '';
        }
    }
    
    // Selalu ambil data terbaru dari server
    const response = await callAppsScript('getData', { sheetName: 'SOP' });

    if (response.status === 'success') {
        const serverDataString = JSON.stringify(response.data);
        const localDataString = JSON.stringify(allDatasets);

        // Hanya perbarui UI jika ada data baru dari server
        if (serverDataString !== localDataString) {
            allDatasets = response.data || [];
            allDatasets.sort((a, b) => (b.IDSOP || '').localeCompare(a.IDSOP || ''));
            
            populateFilterOptions();
            applyFiltersAndRender();
            
            // Simpan data baru yang segar ke cache browser
            try {
                localStorage.setItem('sopDataCache', JSON.stringify(allDatasets));
            } catch (e) {
                console.warn("Gagal menyimpan data ke localStorage:", e);
            }
        }
        
        if (isReload) {
            showToast('Data berhasil dimuat ulang!', 'success');
        }

        // [OPTIMISASI] Muat data permohonan di latar belakang setelah SOP selesai
        if (!isPermohonanLoaded) {
            loadPermohonanDataInBackground();
        }

    } else {
        if (isReload) {
            showToast(`Gagal memuat: ${response.message}`, 'error');
        } else {
            // Tampilkan error besar hanya jika pemuatan awal gagal total
            showErrorState('Gagal Memuat Data', response.message);
        }
    }
    
    // Pastikan loading halaman penuh hilang setelah proses selesai
    if (!isReload) {
      setLoadingState(false);
    }
};
 
 // === EVENT LISTENERS SETUP ===
 const setupEventListeners = () => {
    DOM.headerTitleLink.addEventListener('click', (e) => { e.preventDefault(); showView('list-view-container'); });
    DOM.hamburgerMenuButton.addEventListener('click', () => toggleSideMenu(true));
    DOM.menuOverlay.addEventListener('click', () => toggleSideMenu(false));
    DOM.homeLink.addEventListener('click', (e) => { e.preventDefault(); showView('list-view-container', true); });
    DOM.aboutLink.addEventListener('click', (e) => { e.preventDefault(); showView('about-view-container', true); });
    DOM.backToListButton.addEventListener('click', () => showView('list-view-container'));
    DOM.permohonanLink.addEventListener('click', (e) => { e.preventDefault(); displayPermohonanView(); });
    DOM.searchInput.addEventListener('input', syncAndFilter);
    DOM.searchInputMobile.addEventListener('input', syncAndFilter);
    DOM.filterUnit.addEventListener('change', syncAndFilter);
    DOM.filterFungsi.addEventListener('change', syncAndFilter);
    DOM.filterUnitModal.addEventListener('change', syncAndFilter);
    DOM.filterFungsiModal.addEventListener('change', syncAndFilter);
    DOM.reloadDatasetButton.addEventListener('click', handleReload); // Fungsi handleReload diubah
    DOM.resetFilterButton.addEventListener('click', resetFilters);
    DOM.resetFilterButtonMobile.addEventListener('click', resetFilters);
    DOM.datasetList.addEventListener('click', handleDatasetListClick);
    DOM.datasetCardsContainer.addEventListener('click', handleDatasetListClick);
    if (DOM.detailDownloadLink) DOM.detailDownloadLink.addEventListener('click', handleDownload);
    DOM.closeCustomAlert.addEventListener('click', () => toggleModal('custom-alert-modal', false));
    DOM.closeLoginModal.addEventListener('click', () => toggleModal('login-modal', false));
    DOM.openFilterButton.addEventListener('click', () => toggleModal('filter-modal', true));
    DOM.closeFilterModal.addEventListener('click', () => toggleModal('filter-modal', false));
    // Event listener untuk modal konfirmasi reload Dihapus
    DOM.toggleMetadataButton.addEventListener('click', () => {
         DOM.metadataContent.classList.toggle('hidden');
         DOM.metadataChevron.classList.toggle('rotate-180');
    });

    DOM.ajukanSopButtonPage.addEventListener('click', openPermohonanForm);
    DOM.closeFormModal.addEventListener('click', () => toggleModal('form-permohonan-modal', false));
    DOM.permohonanForm.addEventListener('submit', handleFormSubmit);
    DOM.reloadDatasetButtonMobile.addEventListener('click', handleReload); // Fungsi handleReload diubah
 };

//==================================================
// UI UPDATE FUNCTIONS
//==================================================

function updateUIForLoginStatus() {
  DOM.userInfoContainer.innerHTML = `
    <button id="ajukan-sop-button-header" class="bg-blue-600 text-white hover:bg-blue-700 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm">
      <i class="fas fa-plus"></i>
      <span class="hidden sm:inline">Ajukan SOP</span>
    </button>
    <button id="admin-login-button" class="bg-gray-200 text-gray-700 hover:bg-gray-300 p-2 rounded-full w-8 h-8 flex items-center justify-center" title="Login Administrator">
      <i class="fas fa-user"></i>
    </button>
  `;
  document.getElementById('ajukan-sop-button-header').addEventListener('click', openPermohonanForm);
  document.getElementById('admin-login-button').addEventListener('click', () => toggleModal('login-modal', true));
}

// ... (Fungsi render dan filter SOP tidak berubah)
function syncAndFilter(event) {
     const sourceElement = event.target;
     if (sourceElement.id === 'search-input') DOM.searchInputMobile.value = sourceElement.value;
     else if (sourceElement.id === 'search-input-mobile') DOM.searchInput.value = sourceElement.value;
     if (sourceElement.id === 'filter-unit') DOM.filterUnitModal.value = sourceElement.value;
     else if (sourceElement.id === 'filter-unit-modal') DOM.filterUnit.value = sourceElement.value;
     if (sourceElement.id === 'filter-fungsi') DOM.filterFungsiModal.value = sourceElement.value;
     else if (sourceElement.id === 'filter-fungsi-modal') DOM.filterFungsi.value = sourceElement.value;
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
      if (selectedUnit) filteredData = filteredData.filter(item => item.Unit === selectedUnit);
      if (selectedFungsi) filteredData = filteredData.filter(item => item.Fungsi === selectedFungsi);
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
                       ${unitLabel} <span class="mx-1">-</span> <span>${fungsiText}</span>
                   </p>
               </div>`;
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
// FUNGSI-FUNGSI UNTUK HALAMAN PERMOHONAN
//==================================================

const displayPermohonanView = () => {
    showView('permohonan-view-container', true);
    // Jika data belum termuat, tampilkan loading dan mulai memuat.
    // Jika sudah termuat dari background, akan langsung tampil.
    if (!isPermohonanLoaded) {
        loadPermohonanData();
    } else {
        renderPermohonanData(); // Langsung render jika sudah ada
    }
};

const loadPermohonanDataInBackground = async () => {
    // Fungsi ini berjalan di latar belakang tanpa mengganggu UI utama
    const response = await callAppsScript('getData', { sheetName: 'Permohonan' });
    if (response.status === 'success') {
        allPermohonan = response.data || [];
        if (allPermohonan.length > 0 && allPermohonan[0].Timestamp) {
            allPermohonan.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
        }
        isPermohonanLoaded = true;
        
        // Jika user kebetulan sedang berada di halaman permohonan, langsung perbarui datanya
        if (!DOM.permohonanViewContainer.classList.contains('hidden')) {
          DOM.permohonanLoadingIndicator.style.display = 'none';
          renderPermohonanData();
        }
    } 
    // Jika gagal, tidak menampilkan error besar. Error akan ditangani saat user membuka halaman permohonan secara manual.
};

const loadPermohonanData = async () => {
    DOM.permohonanLoadingIndicator.style.display = 'block';
    DOM.permohonanContent.classList.add('hidden');
    
    // Panggil fungsi background dan tunggu hasilnya
    await loadPermohonanDataInBackground(); 
    
    DOM.permohonanLoadingIndicator.style.display = 'none';

    // Jika setelah pemanggilan masih belum termuat (artinya gagal), tampilkan pesan error
    if (!isPermohonanLoaded) {
        const permohonanSection = DOM.permohonanViewContainer.querySelector('section');
        if (permohonanSection) {
            permohonanSection.innerHTML = `<p class="text-center text-red-500 py-10">Gagal memuat data permohonan. Silakan coba lagi nanti.</p>`;
        }
    }
};


const renderPermohonanData = () => {
    DOM.permohonanTableBody.innerHTML = '';
    DOM.permohonanCardsContainer.innerHTML = '';
    DOM.permohonanContent.classList.remove('hidden');
    const contentContainer = DOM.permohonanContent.querySelector('.bg-white');
    if (allPermohonan.length === 0) {
        DOM.permohonanNoDataMessage.classList.remove('hidden');
        if (contentContainer) contentContainer.classList.add('hidden');
    } else {
        DOM.permohonanNoDataMessage.classList.add('hidden');
        if (contentContainer) contentContainer.classList.remove('hidden');
        allPermohonan.forEach(item => {
            const statusText = item.Status || 'Diajukan';
            let statusBadge = '';
            switch (statusText.toLowerCase()) {
                case 'disetujui': statusBadge = `<span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>`; break;
                case 'ditolak': statusBadge = `<span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>`; break;
                default: statusBadge = `<span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>`;
            }
            const formattedTimestamp = item.Timestamp ? new Date(item.Timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
            const rowHTML = `
                <tr>
                    <td class="p-4 text-sm text-gray-700 font-mono">${item.IDPermohonan || 'N/A'}</td>
                    <td class="p-4 text-sm text-gray-700">${formattedTimestamp}</td>
                    <td class="p-4 text-sm text-gray-700">${item.Unit || 'N/A'}</td>
                    <td class="p-4 text-sm font-semibold text-gray-900">${item['Nama SOP'] || 'N/A'}</td>
                    <td class="p-4 text-sm text-gray-700">${statusBadge}</td>
                    <td class="p-4 text-sm text-gray-500">${item.Keterangan || ''}</td>
                </tr>`;
            DOM.permohonanTableBody.innerHTML += rowHTML;

            const cardHTML = `
                <div class="p-4 space-y-2">
                    <div class="flex justify-between items-start">
                        <p class="font-semibold text-gray-900">${item['Nama SOP'] || 'N/A'}</p>
                        ${statusBadge}
                    </div>
                    <p class="text-xs text-gray-500"><span class="font-medium">Unit:</span> ${item.Unit || 'N/A'}</p>
                    <p class="text-xs text-gray-500"><span class="font-medium">ID:</span> ${item.IDPermohonan || 'N/A'}</p>
                    <p class="text-xs text-gray-500"><span class="font-medium">Tanggal:</span> ${formattedTimestamp}</p>
                    ${item.Keterangan ? `<p class="text-xs text-gray-600 bg-gray-50 p-2 rounded-md mt-1"><span class="font-medium">Ket:</span> ${item.Keterangan}</p>` : ''}
                </div>`;
            DOM.permohonanCardsContainer.innerHTML += cardHTML;
        });
    }
};

// ... (Fungsi form permohonan tidak berubah)
function openPermohonanForm() {
    DOM.permohonanForm.reset();
    DOM.formError.classList.add('hidden');
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
        unit,
        namaSop,
        idPermohonan: `SOP-${Date.now()}`,
        timestamp: new Date().toISOString(),
    };
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const fileData = reader.result;
            payload.fileData = fileData;
            payload.fileName = file.name;
            payload.fileType = file.type;
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
        isPermohonanLoaded = false; // Setel ulang agar data dimuat kembali saat dibuka
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

//==================================================
// EVENT HANDLERS
//==================================================

function handleDatasetListClick(e) {
      const viewTrigger = e.target.closest('.view-detail-trigger');
      if (viewTrigger) showDetailView(viewTrigger.dataset.id);
}

function handleDownload() {
      console.log("Tombol unduh diklik.");
}

// [MODIFIKASI] handleReload sekarang langsung memanggil loadInitialData
function handleReload() {
    loadInitialData(true);
}

//==================================================
// HELPER & UTILITY FUNCTIONS
//==================================================

// [BARU] Fungsi untuk menampilkan dan menyembunyikan Toast
function showToast(message, type = 'info') {
    clearTimeout(toastTimeout);
    const toast = DOM.toastNotification;
    const icon = toast.querySelector('i');

    DOM.toastMessage.textContent = message;
    
    toast.classList.remove('bg-gray-800', 'bg-green-600', 'bg-red-600', 'translate-x-[120%]');
    icon.className = 'mr-2';

    if (type === 'success') {
        toast.classList.add('bg-green-600');
        icon.classList.add('fas', 'fa-check-circle');
    } else if (type === 'error') {
        toast.classList.add('bg-red-600');
        icon.classList.add('fas', 'fa-exclamation-circle');
    } else { // 'info' untuk loading
        toast.classList.add('bg-gray-800');
        icon.classList.add('fas', 'fa-sync-alt', 'fa-spin');
    }
    
    // Sembunyikan otomatis jika bukan pesan loading
    if (type !== 'info') {
        toastTimeout = setTimeout(hideToast, 3000);
    }
}

function hideToast() {
    DOM.toastNotification.classList.add('translate-x-[120%]');
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
      container.innerHTML = `<div class="text-center py-10 bg-red-50 rounded-lg"><i class="fas fa-exclamation-triangle fa-3x text-red-500"></i><h2 class="mt-4 text-xl font-bold text-red-800">${title}</h2><p class="mt-2 text-red-700">${message}</p></div>`;
      setLoadingState(false);
}

function setLoadingState(isLoading) {
    if(DOM.loadingIndicator) DOM.loadingIndicator.classList.toggle('hidden', !isLoading);

    const buttons = [DOM.reloadDatasetButton, DOM.reloadDatasetButtonMobile];
    const icons = [DOM.reloadIcon, DOM.reloadIconMobile];

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
      DOM.searchInput.value = '';
      DOM.searchInputMobile.value = '';
      DOM.filterUnit.value = '';
      DOM.filterFungsi.value = '';
      DOM.filterUnitModal.value = '';
      DOM.filterFungsiModal.value = '';
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
