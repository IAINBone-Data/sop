document.addEventListener('DOMContentLoaded', () => {
    // --- KONFIGURASI ---
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwXiVWSmy8cTIqWXEmspArQNrWkKuhuB7fkY5guw7wxnEJMn3riikRl7Esl22PdX1i2/exec';

    // --- DOM ELEMENTS ---
    const DOM = {
        loginView: document.getElementById('login-view'),
        dashboardView: document.getElementById('dashboard-view'),
        adminLoginForm: document.getElementById('admin-login-form'),
        logoutButton: document.getElementById('logout-button'),
        adminUserEmail: document.getElementById('admin-user-email'),
        modalsContainer: document.getElementById('modals-container'),
        menuItems: document.querySelectorAll('.menu-item'),
        headerTitle: document.getElementById('header-title'),
        hamburgerButton: document.getElementById('hamburger-button'),
        sidebarMenu: document.getElementById('sidebar-menu'),
        mainContent: document.getElementById('main-content')
    };

    // --- STATE ---
    let authToken = null;
    let allData = { permohonan: [], sop: [], laporan: [] };
    let sopHeaders = [];
    // PERBAIKAN: Sistem sort yang lebih baik
    let currentSort = { view: '', key: '', order: 'asc' };
    let tomSelectInstances = {};
    let toastTimeout = null;

    // --- API HELPER ---
    const callApi = async (action, payload = {}) => {
        if (!action.includes('Login') && !authToken) {
            handleLogout();
            return { status: 'error', message: 'Token tidak ada.' };
        }
        const fullPayload = { action, ...payload, authToken };
        try {
            const response = await fetch(WEB_APP_URL, {
                method: 'POST', body: JSON.stringify(fullPayload)
            });
            if (!response.ok) throw new Error(`Network response error`);
            const result = await response.json();
            if (result.status === 'error' && result.message.includes('token tidak valid')) {
                handleLogout();
            }
            return result;
        } catch (error) {
            console.error(`API Call Error for "${action}":`, error);
            showToast(`API Error: ${error.message}`, 'error');
            return { status: 'error', message: error.message };
        }
    };

    // --- AUTHENTICATION ---
    const handleLogin = async (e) => {
        e.preventDefault();
        const btn = document.getElementById('login-button');
        const btnText = document.getElementById('login-button-text');
        btn.disabled = true;
        btnText.innerHTML = `<i class="fa fa-spinner fa-spin"></i>`;
        
        const response = await callApi('adminLogin', {
            username: DOM.adminLoginForm.username.value,
            password: DOM.adminLoginForm.password.value
        });

        if (response.status === 'success' && response.token) {
            authToken = response.token;
            sessionStorage.setItem('adminAuthToken', authToken);
            sessionStorage.setItem('adminUserEmail', response.email);
            initializeApp();
        } else {
            const err = document.getElementById('login-error');
            err.textContent = response.message || 'Login Gagal.';
            err.classList.remove('hidden');
            btn.disabled = false;
            btnText.innerHTML = `Login`;
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        authToken = null;
        DOM.loginView.classList.remove('hidden');
        DOM.dashboardView.classList.add('hidden');
        DOM.adminLoginForm.reset();

        const btn = document.getElementById('login-button');
        const btnText = document.getElementById('login-button-text');
        if (btn && btnText) {
            btn.disabled = false;
            btnText.innerHTML = 'Login';
        }
    };

    // --- DATA LOADING & CACHING ---
    const loadDataForView = async (viewName, forceReload = false) => {
        const container = document.getElementById(`${viewName}-view`);
        container.innerHTML = `<div class="text-center p-8"><i class="fas fa-spinner fa-spin fa-2x text-blue-500"></i></div>`;
        const cacheKey = `cache_admin_${viewName}`;
        if (forceReload) sessionStorage.removeItem(cacheKey);
        
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
            allData[viewName] = JSON.parse(cachedData);
            if (viewName === 'sop' && allData.sop.length > 0) sopHeaders = Object.keys(allData.sop[0]).filter(k => k !== 'rowIndex');
            renderView(viewName, allData[viewName]);
            return;
        }
        
        let action = '';
        switch(viewName) {
            case 'permohonan': action = 'adminGetPermohonan'; break;
            case 'sop': action = 'adminGetSOP'; break;
            case 'laporan': action = 'adminGetLaporan'; break;
        }

        const response = await callApi(action);
        if (response.status === 'success') {
            allData[viewName] = response.data;
            if (viewName === 'sop' && response.data.length > 0) sopHeaders = Object.keys(response.data[0]).filter(k => k !== 'rowIndex');
            sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
            renderView(viewName, allData[viewName]);
        } else {
            container.innerHTML = `<div class="text-center p-8 bg-red-50 text-red-700 rounded-lg shadow">${response.message}</div>`;
        }
    };
    
    // --- UI & DATA RENDERING ---
    const updateCount = (viewName, filteredData) => {
        const countElement = document.getElementById(`${viewName}-count`);
        if (countElement) {
            const total = allData[viewName].length;
            const showing = filteredData.length;
            const itemTypes = { sop: 'SOP', permohonan: 'Permohonan', laporan: 'Laporan'};
            countElement.innerHTML = `Menampilkan <strong>${showing}</strong> dari <strong>${total}</strong> total ${itemTypes[viewName]}.`;
        }
    };

    const renderView = (viewName, data) => {
        const container = document.getElementById(`${viewName}-view`);
        if (!container) return;
        
        if (viewName === 'laporan') {
            container.innerHTML = getLaporanHTML(data);
            return;
        }
        
        const isSopView = viewName === 'sop';
        const addButtonHTML = isSopView || viewName === 'permohonan' ? `<button onclick="window.adminApp.open${isSopView ? 'Sop' : 'Permohonan'}Modal(null)" class="bg-blue-600 text-white hover:bg-blue-700 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 flex-shrink-0"><i class="fas fa-plus"></i> Tambah</button>` : '';
        
        const filtersHTML = `
            <div class="flex flex-wrap items-center justify-between gap-4 mb-2">
                <div class="flex flex-wrap items-center gap-2 flex-grow">
                    <div class="relative flex-grow min-w-[200px]">
                        <input type="search" data-view="${viewName}" class="filter-search w-full pl-10 pr-4 py-2 border rounded-lg" placeholder="Cari...">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><i class="fa fa-search text-gray-400"></i></div>
                    </div>
                    <select data-view="${viewName}" class="filter-unit w-full sm:w-auto p-2 border rounded-md bg-white"><option value="">Semua Unit</option></select>
                    <select data-view="${viewName}" class="filter-fungsi w-full sm:w-auto p-2 border rounded-md bg-white ${isSopView ? '' : 'hidden'}"><option value="">Semua Fungsi</option></select>
                    <button data-view="${viewName}" title="Reset Filter" class="reset-btn p-2 w-10 h-10 border rounded-lg flex items-center justify-center bg-white flex-shrink-0"><i class="fas fa-undo"></i></button>
                    <button data-view="${viewName}" title="Muat Ulang" class="reload-btn p-2 w-10 h-10 border rounded-lg flex items-center justify-center bg-white flex-shrink-0"><i class="fas fa-sync-alt"></i></button>
                </div>
                <div class="flex-shrink-0">
                    ${addButtonHTML}
                </div>
            </div>`;
        
        const countHTML = `<div class="text-sm text-gray-600 mb-4" id="${viewName}-count"></div>`;

        let contentHTML = '';
        if (viewName === 'permohonan') contentHTML = getPermohonanHTML(data);
        if (isSopView) contentHTML = getSopHTML(data);
        
        container.innerHTML = filtersHTML + countHTML + `<div class="content-wrapper">${contentHTML}</div>`;
        populateFilters(viewName, allData[viewName]);
        updateSortIcons(viewName);
        updateCount(viewName, data);
    };
    
    const applyFiltersAndRender = (viewName) => {
        const searchTerm = document.querySelector(`.filter-search[data-view="${viewName}"]`)?.value.toLowerCase() || '';
        const selectedUnit = document.querySelector(`.filter-unit[data-view="${viewName}"]`)?.value || '';
        const selectedFungsi = document.querySelector(`.filter-fungsi[data-view="${viewName}"]`)?.value || '';

        let filteredData = allData[viewName].filter(item => {
            const hasSearchTerm = searchTerm === '' || 
                (item['Nama SOP'] || '').toLowerCase().includes(searchTerm) || 
                (item['Nomor SOP'] || '').toLowerCase().includes(searchTerm);
            const hasUnit = selectedUnit === '' || item.Unit === selectedUnit;
            const hasFungsi = viewName !== 'sop' || selectedFungsi === '' || item.Fungsi === selectedFungsi;
            return hasSearchTerm && hasUnit && hasFungsi;
        });

        if (currentSort.view === viewName && currentSort.key) {
            filteredData.sort((a, b) => {
                const valA = a[currentSort.key] || '';
                const valB = b[currentSort.key] || '';
                const comparison = valA.toString().localeCompare(valB.toString(), 'id-ID');
                return currentSort.order === 'asc' ? comparison : -comparison;
            });
        }

        let contentHTML = '';
        if (viewName === 'permohonan') contentHTML = getPermohonanHTML(filteredData);
        if (viewName === 'sop') contentHTML = getSopHTML(filteredData);
        
        const contentContainer = document.querySelector(`#${viewName}-view .content-wrapper`);
        if(contentContainer) contentContainer.innerHTML = contentHTML;
        
        updateSortIcons(viewName);
        updateCount(viewName, filteredData);
    };
    
    const populateFilters = (viewName, data) => {
        const units = [...new Set(data.map(item => item.Unit).filter(Boolean))].sort();
        const unitSelect = document.querySelector(`.filter-unit[data-view="${viewName}"]`);
        if(unitSelect) unitSelect.innerHTML = '<option value="">Semua Unit</option>' + units.map(u => `<option value="${u}">${u}</option>`).join('');
        
        if (viewName === 'sop') {
            const fungsis = [...new Set(data.map(item => item.Fungsi).filter(Boolean))].sort();
            const fungsiSelect = document.querySelector(`.filter-fungsi[data-view="${viewName}"]`);
            if(fungsiSelect) fungsiSelect.innerHTML = '<option value="">Semua Fungsi</option>' + fungsis.map(f => `<option value="${f}">${f}</option>`).join('');
        }
    };
    
    // PERBAIKAN: Sistem sort yang lebih baik
    const handleSort = (e) => {
        const header = e.target.closest('[data-sort]');
        if (!header) return;
        const key = header.dataset.sort;
        const view = header.closest('[data-view]').dataset.view;
        if (currentSort.key === key && currentSort.view === view) {
            currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.key = key;
            currentSort.order = 'asc';
        }
        currentSort.view = view;
        applyFiltersAndRender(view);
    };

    const updateSortIcons = (viewName) => {
        const headers = document.querySelectorAll(`[data-view="${viewName}"] [data-sort]`);
        headers.forEach(header => {
            const key = header.dataset.sort;
            const icon = header.querySelector('i');
            if (!icon) return;
            icon.classList.remove('fa-sort', 'fa-sort-up', 'fa-sort-down', 'text-blue-500', 'text-gray-400');
            if (currentSort.view === viewName && currentSort.key === key) {
                icon.classList.add(currentSort.order === 'asc' ? 'fa-sort-up' : 'fa-sort-down', 'text-blue-500');
            } else {
                icon.classList.add('fa-sort', 'text-gray-400');
            }
        });
    };

    // PERBAIKAN: Sistem sort di getSopHTML
    const getSopHTML = (data) => {
        if (!data || data.length === 0) return `<div class="text-center p-8 bg-white rounded-lg shadow"><p>Tidak ada data SOP.</p></div>`;
        const headers = [
            { key: 'Nomor SOP', label: 'Nomor SOP' },
            { key: 'Nama SOP', label: 'Nama SOP' },
            { key: 'Unit', label: 'Unit' },
            { key: 'Fungsi', label: 'Fungsi' }
        ];
        const tableHeaders = `
             <tr data-view="sop">
                ${headers.map(h => `<th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:text-blue-600" data-sort="${h.key}">${h.label} <i class="fas fa-sort ml-1 text-gray-400"></i></th>`).join('')}
                <th class="p-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksi</th>
            </tr>`;
        const tableRows = data.map(item => {
             const fileButton = (item.File && item.File.startsWith('http')) 
                ? `<a href="${item.File}" target="_blank" title="Lihat File" class="bg-gray-100 text-gray-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200"><i class="fas fa-file-alt"></i></a>`
                : `<button title="File tidak tersedia" class="bg-gray-50 text-gray-300 p-2 rounded-full w-8 h-8 flex items-center justify-center cursor-not-allowed" disabled><i class="fas fa-file-alt"></i></button>`;
            return `
            <tr class="hover:bg-gray-50">
                <td class="p-3 text-sm text-gray-700">${item['Nomor SOP'] || ''}</td>
                <td class="p-3 text-sm font-semibold text-gray-900">${item['Nama SOP'] || ''}</td>
                <td class="p-3 text-sm text-gray-700">${item.Unit || ''}</td>
                <td class="p-3 text-sm text-gray-700">${item.Fungsi || ''}</td>
                <td class="p-3 text-sm text-right">
                    <div class="flex items-center justify-end gap-2">
                        ${fileButton}
                        <button title="Edit SOP" class="bg-blue-100 text-blue-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-200" onclick="window.adminApp.openSopModal(${item.rowIndex})"><i class="fas fa-edit"></i></button>
                        <button title="Hapus SOP" class="bg-red-100 text-red-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-200" onclick="window.adminApp.openDeleteSopModal(${item.rowIndex})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`;
        }).join('');
        const cards = data.map(item => {
            const fileButton = (item.File && item.File.startsWith('http')) 
                ? `<a href="${item.File}" target="_blank" title="Lihat File" class="bg-gray-100 text-gray-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200"><i class="fas fa-file-alt"></i></a>`
                : `<button title="File tidak tersedia" class="bg-gray-50 text-gray-300 p-2 rounded-full w-8 h-8 flex items-center justify-center cursor-not-allowed" disabled><i class="fas fa-file-alt"></i></button>`;
            return `
                <div class="bg-white p-4 rounded-lg shadow space-y-3">
                    <p class="font-semibold text-gray-900">${item['Nama SOP']}</p>
                    <div class="text-xs text-gray-500 space-y-1">
                        <p><span class="font-medium">Nomor:</span> ${item['Nomor SOP'] || 'N/A'}</p>
                        <p><span class="font-medium">Unit:</span> ${item.Unit || 'N/A'}</p>
                        <p><span class="font-medium">Fungsi:</span> ${item.Fungsi || 'N/A'}</p>
                    </div>
                    <div class="flex items-center justify-end gap-2 pt-3 border-t mt-3">
                        ${fileButton}
                        <button title="Edit SOP" class="bg-blue-100 text-blue-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-200" onclick="window.adminApp.openSopModal(${item.rowIndex})"><i class="fas fa-edit"></i></button>
                        <button title="Hapus SOP" class="bg-red-100 text-red-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-200" onclick="window.adminApp.openDeleteSopModal(${item.rowIndex})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
        }).join('');
        return `<div class="bg-white rounded-lg shadow overflow-x-auto hidden md:block"><table class="w-full"><thead class="bg-gray-50">${tableHeaders}</thead><tbody class="divide-y">${tableRows}</tbody></table></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">${cards}</div>`;
    };
    
    const getPermohonanHTML = (data) => {
        if (!data || data.length === 0) return `<div class="text-center p-8 bg-white rounded-lg shadow"><p>Tidak ada data permohonan.</p></div>`;
        const headers = [
            { key: 'Timestamp', label: 'Tanggal' }, { key: 'Unit', label: 'Unit' },
            { key: 'Nama SOP', label: 'Nama SOP' }, { key: 'Status', label: 'Status' }
        ];
        const tableHeaders = `
            <tr data-view="permohonan">
                ${headers.map(h => `<th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:text-blue-600" data-sort="${h.key}">${h.label} <i class="fas fa-sort ml-1 text-gray-400"></i></th>`).join('')}
                <th class="p-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksi</th>
            </tr>`;
        const tableRows = data.map(item => {
            const statusText = item.Status || 'Diajukan';
            let statusBadge = '';
            switch (statusText.toLowerCase()) {
                case 'disetujui': statusBadge = `<span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>`; break;
                case 'ditolak': statusBadge = `<span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>`; break;
                default: statusBadge = `<span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>`;
            }
            const fileButton = (item.File && item.File.startsWith('http')) 
                ? `<a href="${item.File}" target="_blank" title="Lihat File" class="bg-gray-100 text-gray-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200"><i class="fas fa-file-alt"></i></a>`
                : `<button title="File tidak tersedia" class="bg-gray-50 text-gray-300 p-2 rounded-full w-8 h-8 flex items-center justify-center cursor-not-allowed" disabled><i class="fas fa-file-alt"></i></button>`;
            return `
                <tr class="hover:bg-gray-50">
                    <td class="p-3 text-sm text-gray-700">${new Date(item.Timestamp).toLocaleString('id-ID', { dateStyle:'short', timeStyle: 'short' })}</td>
                    <td class="p-3 text-sm text-gray-700">${item.Unit || ''}</td>
                    <td class="p-3 text-sm font-semibold text-gray-900">${item['Nama SOP'] || ''}</td>
                    <td class="p-3 text-sm">${statusBadge}</td>
                    <td class="p-3 text-sm text-right">
                        <div class="flex items-center justify-end gap-2">
                           ${fileButton}
                           <button title="Jadikan SOP" class="bg-green-100 text-green-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-green-200" onclick="window.adminApp.convertPermohonanToSop('${item.IDPermohonan}')"><i class="fas fa-exchange-alt"></i></button>
                           <button title="Edit Permohonan" class="bg-blue-100 text-blue-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-200" onclick="window.adminApp.openPermohonanModal('${item.IDPermohonan}')"><i class="fas fa-edit"></i></button>
                           <button title="Hapus Permohonan" class="bg-red-100 text-red-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-200" onclick="window.adminApp.openDeletePermohonanModal('${item.IDPermohonan}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>`;
        }).join('');
        const cards = data.map(item => {
            const statusText = item.Status || 'Diajukan';
            let statusBadge = '';
            switch (statusText.toLowerCase()) {
                case 'disetujui': statusBadge = `<span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>`; break;
                case 'ditolak': statusBadge = `<span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>`; break;
                default: statusBadge = `<span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>`;
            }
             const fileButton = (item.File && item.File.startsWith('http')) 
                ? `<a href="${item.File}" target="_blank" title="Lihat File" class="bg-gray-100 text-gray-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200"><i class="fas fa-file-alt"></i></a>`
                : `<button title="File tidak tersedia" class="bg-gray-50 text-gray-300 p-2 rounded-full w-8 h-8 flex items-center justify-center cursor-not-allowed" disabled><i class="fas fa-file-alt"></i></button>`;
            return `
                <div class="bg-white p-4 rounded-lg shadow space-y-3">
                    <div class="flex justify-between items-start">
                        <p class="font-semibold text-gray-900 pr-2">${item['Nama SOP']}</p>
                        ${statusBadge}
                    </div>
                    <div class="text-xs text-gray-500 space-y-1">
                        <p><span class="font-medium">Unit:</span> ${item.Unit || 'N/A'}</p>
                        <p><span class="font-medium">Tanggal:</span> ${new Date(item.Timestamp).toLocaleString('id-ID', { dateStyle:'short', timeStyle: 'short' })}</p>
                    </div>
                    <div class="flex items-center justify-end gap-2 pt-3 border-t mt-3">
                        ${fileButton}
                        <button title="Jadikan SOP" class="bg-green-100 text-green-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-green-200" onclick="window.adminApp.convertPermohonanToSop('${item.IDPermohonan}')"><i class="fas fa-exchange-alt"></i></button>
                        <button title="Edit Permohonan" class="bg-blue-100 text-blue-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-200" onclick="window.adminApp.openPermohonanModal('${item.IDPermohonan}')"><i class="fas fa-edit"></i></button>
                        <button title="Hapus Permohonan" class="bg-red-100 text-red-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-200" onclick="window.adminApp.openDeletePermohonanModal('${item.IDPermohonan}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
        }).join('');
        return `<div class="bg-white rounded-lg shadow overflow-x-auto hidden md:block"><table class="w-full"><thead class="bg-gray-50">${tableHeaders}</thead><tbody class="divide-y">${tableRows}</tbody></table></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">${cards}</div>`;
    };

    // --- PENAMBAHAN: Fungsi untuk merender tampilan laporan ---
    const getLaporanHTML = (data) => {
        if (!data || data.length === 0) return `<div class="text-center p-8 bg-white rounded-lg shadow"><p>Tidak ada data laporan.</p></div>`;
        const tableHeaders = `
            <tr>
                <th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Tanggal</th>
                <th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">ID SOP</th>
                <th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Laporan</th>
                <th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
            </tr>`;
        
        const sortedData = data.sort((a,b) => new Date(b.Tanggal) - new Date(a.Tanggal));

        const tableRows = sortedData.map(item => {
            const statusOptions = ['Ditindaklanjuti', 'Selesai', 'Ditahan'];
            const selectOptions = statusOptions.map(opt => `<option value="${opt}" ${item.Status === opt ? 'selected' : ''}>${opt}</option>`).join('');
            const statusClass = `status-${(item.Status || 'Ditindaklanjuti').replace(/\s/g, '')}`;
            
            return `
            <tr class="hover:bg-gray-50">
                <td class="p-3 text-sm text-gray-700 whitespace-nowrap">${item.Tanggal}</td>
                <td class="p-3 text-sm text-gray-700 font-mono">${item.IDSOP || ''}</td>
                <td class="p-3 text-sm text-gray-800"><p class="max-w-md">${item.Laporan || ''}</p></td>
                <td class="p-3 text-sm text-gray-700">
                    <select class="status-select font-semibold text-xs p-2 rounded-lg border-0 focus:ring-2 focus:ring-blue-400 ${statusClass}" data-row-index="${item.rowIndex}">
                        ${selectOptions}
                    </select>
                </td>
            </tr>`;
        }).join('');
        
        const cards = sortedData.map(item => {
            const statusOptions = ['Ditindaklanjuti', 'Selesai', 'Ditahan'];
            const selectOptions = statusOptions.map(opt => `<option value="${opt}" ${item.Status === opt ? 'selected' : ''}>${opt}</option>`).join('');
            const statusClass = `status-${(item.Status || 'Ditindaklanjuti').replace(/\s/g, '')}`;
            return `
                <div class="bg-white p-4 rounded-lg shadow space-y-3">
                    <div class="flex justify-between items-start">
                        <p class="font-mono text-xs text-gray-600">${item.IDSOP}</p>
                        <p class="text-xs text-gray-500">${item.Tanggal}</p>
                    </div>
                    <p class="text-sm text-gray-800 bg-gray-50 p-2 rounded-md">${item.Laporan}</p>
                    <div>
                         <select class="status-select w-full font-semibold text-xs p-2 rounded-lg border-0 focus:ring-2 focus:ring-blue-400 ${statusClass}" data-row-index="${item.rowIndex}">
                            ${selectOptions}
                        </select>
                    </div>
                </div>`;
        }).join('');

        return `<div class="bg-white rounded-lg shadow overflow-x-auto hidden md:block"><table class="w-full"><thead class="bg-gray-50">${tableHeaders}</thead><tbody class="divide-y">${tableRows}</tbody></table></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">${cards}</div>`;
    };

    // PENAMBAHAN: Fungsi untuk update status laporan
    const handleLaporanStatusChange = async (e) => {
        const select = e.target;
        const rowIndex = select.dataset.rowIndex;
        const newStatus = select.value;

        // Update visual
        select.className = select.className.replace(/status-\w+/, `status-${newStatus.replace(/\s/g, '')}`);
        showToast(`Mengupdate status...`, 'info');

        const response = await callApi('adminUpdateLaporanStatus', { rowIndex, status: newStatus });
        if(response.status === 'success') {
            showToast('Status berhasil diperbarui!', 'success');
            // Update data lokal
            const item = allData.laporan.find(l => l.rowIndex == rowIndex);
            if(item) item.Status = newStatus;
            sessionStorage.setItem('cache_admin_laporan', JSON.stringify(allData.laporan));
        } else {
            showToast('Gagal memperbarui status.', 'error');
            // Kembalikan ke nilai semula jika gagal
            const item = allData.laporan.find(l => l.rowIndex == rowIndex);
            if(item) select.value = item.Status;
        }
    };
    
    // --- MODALS & FORMS ---
    // (Fungsi-fungsi modal permohonan dan SOP tidak diubah)
    const openPermohonanModal = (id) => {
        const isEdit = id !== null;
        const item = isEdit ? allData.permohonan.find(p => p.IDPermohonan === id) : {};
        const title = isEdit ? 'Edit Permohonan' : 'Tambah Permohonan Baru';
        const unitOptions = `<option value="" disabled selected>Pilih Unit</option><option>Biro AUAK</option><option>Bagian ULA</option><option>Subbag TUPR</option><option>Subbag LA</option><option>Fakultas Syariah dan Hukum Islam</option><option>Fakultas Tarbiyah</option><option>Fakultas Ekonomi dan Bisnis Islam</option><option>Fakultas Ushuluddin dan Dakwah</option><option>Pascasarjana</option><option>Lembaga Penjaminan Mutu</option><option>Lembaga Penelitian dan Pengabdian Masyarakat</option><option>Satuan Pengawasan Internal</option><option>UPT TIPD</option><option>UPT Perpustakaan</option><option>UPT Bahasa</option><option>UPT Mahad Al Jamiah</option>`;
        const modalHTML = `
            <div id="permohonan-modal" class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div class="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg">
                    <h2 class="text-xl font-bold">${title}</h2>
                    <form id="permohonan-form" class="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        <div><label for="Unit" class="text-sm font-medium">Unit</label><select name="Unit" required class="w-full mt-1 p-2 border rounded-md bg-white">${unitOptions}</select></div>
                        <div><label for="Nama_SOP" class="text-sm font-medium">Nama SOP</label><input type="text" name="Nama_SOP" value="${item['Nama SOP'] || ''}" required class="w-full mt-1 p-2 border rounded-md"></div>
                        <div><label for="File" class="text-sm font-medium">Unggah Dokumen (Opsional)</label><input type="file" name="file" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mt-1"></div>
                        <div class="flex items-center gap-4 pt-4 border-t mt-4">
                            <button type="button" onclick="window.adminApp.closeModal()" class="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold">Batal</button>
                            <button type="submit" id="submit-permohonan" class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">Simpan</button>
                        </div>
                    </form>
                </div>
            </div>`;
        DOM.modalsContainer.innerHTML = modalHTML;
        if (isEdit) document.querySelector('#permohonan-form [name="Unit"]').value = item.Unit;
        document.getElementById('permohonan-form').addEventListener('submit', (e) => handlePermohonanFormSubmit(e, id));
    };
    const handlePermohonanFormSubmit = async (e, id) => {
        e.preventDefault();
        const isEdit = id !== null;
        const form = e.target;
        const data = { 'Unit': form.Unit.value, 'Nama SOP': form.Nama_SOP.value };
        if(isEdit) data.Status = allData.permohonan.find(p=>p.IDPermohonan === id).Status
        let fileInfo = null;
        if (form.file.files[0]) fileInfo = await getFileInfo(form.file.files[0]);
        const action = isEdit ? 'adminUpdatePermohonan' : 'adminCreatePermohonan';
        const payload = isEdit ? { id, data, fileInfo } : { data, fileInfo };
        const btn = document.getElementById('submit-permohonan');
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
        const response = await callApi(action, payload);
        if (response.status === 'success') {
            closeModal();
            loadDataForView('permohonan', true);
        } else {
            showToast('Gagal: ' + response.message, 'error');
            btn.disabled = false;
            btn.innerHTML = `Simpan`;
        }
    };
    const openDeletePermohonanModal = (id) => {
        const item = allData.permohonan.find(p => p.IDPermohonan === id);
        if (!item) return;
        const modalHTML = `<div class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"><div class="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg"><h2 class="text-xl font-bold">Konfirmasi Hapus</h2><p>Anda yakin ingin menghapus permohonan untuk SOP berikut?</p><p class="font-semibold text-gray-800 bg-gray-100 p-2 rounded-md">${item['Nama SOP']}</p><div class="flex items-center gap-4 pt-4"><button onclick="window.adminApp.closeModal()" class="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold">Batal</button><button id="confirm-delete" class="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">Ya, Hapus</button></div></div></div>`;
        DOM.modalsContainer.innerHTML = modalHTML;
        document.getElementById('confirm-delete').addEventListener('click', () => handleDeletePermohonanConfirm(id));
    };
    const handleDeletePermohonanConfirm = async (id) => {
        const btn = document.getElementById('confirm-delete');
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
        const response = await callApi('adminDeletePermohonan', { id });
        if (response.status === 'success') {
            closeModal();
            loadDataForView('permohonan', true);
        } else {
            showToast('Gagal menghapus: ' + response.message, 'error');
            closeModal();
        }
    };
    const convertPermohonanToSop = (id) => {
        const item = allData.permohonan.find(p => p.IDPermohonan === id);
        if (!item) return;
        const prefillData = { 'Nama SOP': item['Nama SOP'], 'Unit': item.Unit };
        document.querySelector('.menu-item[data-view="sop"]').click();
        setTimeout(() => openSopModal(null, prefillData), 100);
    };
    const openSopModal = (rowIndex, prefillData = {}) => {
        const isEdit = rowIndex !== null;
        const item = isEdit ? allData.sop.find(s => s.rowIndex === rowIndex) : prefillData;
        if (isEdit && !item) return;
        const unitOptions = `<option value="" disabled selected>Pilih Unit</option><option>Biro AUAK</option><option>Bagian ULA</option><option>Subbag TUPR</option><option>Subbag LA</option><option>Fakultas Syariah dan Hukum Islam</option><option>Fakultas Tarbiyah</option><option>Fakultas Ekonomi dan Bisnis Islam</option><option>Fakultas Ushuluddin dan Dakwah</option><option>Pascasarjana</option><option>Lembaga Penjaminan Mutu</option><option>Lembaga Penelitian dan Pengabdian Masyarakat</option><option>Satuan Pengawasan Internal</option><option>UPT TIPD</option><option>UPT Perpustakaan</option><option>UPT Bahasa</option><option>UPT Mahad Al Jamiah</option>`;
        const fungsiOptions = [...new Set(allData.sop.map(s => s.Fungsi).filter(Boolean))].sort().map(f => `<option value="${f}">${f}</option>`).join('');
        const sopNameOptions = allData.sop.map(s => `<option value="${s['Nama SOP']}">${s['Nama SOP']}</option>`).join('');

        const visibleHeaders = sopHeaders.filter(header => header !== 'IDSOP');
        const fields = visibleHeaders.map(header => {
            const value = item[header] || '';
            let fieldHtml = `<div><label for="sop-${header}" class="text-sm font-medium text-gray-700">${header}</label><input type="text" id="sop-${header}" name="${header}" value="${value}" class="w-full px-4 py-2 mt-1 bg-gray-50 border rounded-lg"></div>`;
            switch(header) {
                case 'Unit':
                    fieldHtml = `<div><label class="text-sm font-medium">Unit</label><select name="Unit" class="w-full p-2 mt-1 bg-white border rounded-lg">${unitOptions}</select></div>`;
                    break;
                case 'Fungsi':
                    fieldHtml = `<div><label class="text-sm font-medium">Fungsi</label><select name="Fungsi" id="fungsi-select" class="w-full p-2 mt-1 bg-white border rounded-lg"><option value="">Pilih Fungsi</option>${fungsiOptions}<option value="_add_new_">Tambah Fungsi Baru...</option></select><input type="text" id="new-fungsi-input" name="new_fungsi" class="w-full p-2 mt-2 border rounded-lg hidden" placeholder="Nama Fungsi Baru"></div>`;
                    break;
                case 'Status':
                    fieldHtml = `<div><label class="text-sm font-medium">Status</label><select name="Status" class="w-full p-2 mt-1 bg-white border rounded-lg"><option value="Aktif">Aktif</option><option value="Non Aktif">Non Aktif</option></select></div>`;
                    break;
                case 'Hubungan':
                    fieldHtml = `<div class="md:col-span-2"><label class="text-sm font-medium">Hubungan</label><select name="Hubungan" id="hubungan-select" multiple>${sopNameOptions}</select></div>`;
                    break;
                case 'File':
                    fieldHtml = `<div class="md:col-span-2"><label class="text-sm font-medium">File</label>${value ? `<p class="text-xs mt-1">File saat ini: <a href="${value}" target="_blank" class="text-blue-600">${value.split('/').pop().split('?')[0]}</a></p>` : ''}<input type="file" name="file" class="w-full mt-1 text-sm"><input type="hidden" name="File" value="${value}"></div>`;
                    break;
            }
            return fieldHtml;
        }).join('');

        const modalHTML = `
            <div id="sop-modal" class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div class="w-full max-w-4xl p-8 bg-white rounded-xl shadow-lg">
                    <h2 class="text-xl font-bold mb-6">${isEdit ? 'Edit SOP' : 'Tambah SOP Baru'}</h2>
                    <form id="sop-form" class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">${fields}</form>
                    <div class="flex items-center gap-4 pt-6 border-t mt-6">
                        <button type="button" onclick="window.adminApp.closeModal()" class="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold">Batal</button>
                        <button type="submit" form="sop-form" id="submit-sop" class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">Simpan</button>
                    </div>
                </div>
            </div>`;
        DOM.modalsContainer.innerHTML = modalHTML;

        if (isEdit || prefillData.Unit) document.querySelector('#sop-form [name="Unit"]').value = item.Unit;
        if (isEdit) document.querySelector('#sop-form [name="Status"]').value = item.Status;
        if (isEdit) document.querySelector('#sop-form [name="Fungsi"]').value = item.Fungsi;
        
        tomSelectInstances['hubungan'] = new TomSelect('#hubungan-select', { create: false, placeholder: 'Pilih SOP terkait...' });
        if (isEdit && item.Hubungan) tomSelectInstances['hubungan'].setValue(item.Hubungan.split(',').map(s => s.trim()));

        document.getElementById('fungsi-select').addEventListener('change', (e) => {
            document.getElementById('new-fungsi-input').classList.toggle('hidden', e.target.value !== '_add_new_');
        });
        document.getElementById('sop-form').addEventListener('submit', (e) => handleSopFormSubmit(e, rowIndex));
    };
    const handleSopFormSubmit = async (e, rowIndex) => {
        e.preventDefault();
        const btn = document.getElementById('submit-sop');
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;

        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (data.Fungsi === '_add_new_' && data.new_fungsi) {
            data.Fungsi = data.new_fungsi;
        }
        delete data.new_fungsi;
        
        data.Hubungan = tomSelectInstances['hubungan'].getValue().join(', ');

        delete data.file;

        let fileInfo = null;
        if (form.file.files[0]) {
            fileInfo = await getFileInfo(form.file.files[0]);
        }
        
        const action = rowIndex ? 'adminUpdateSOP' : 'adminCreateSOP';
        const payload = { data, fileInfo };
        if (rowIndex) payload.rowIndex = rowIndex;
        
        const response = await callApi(action, payload);
        if (response.status === 'success') {
            closeModal();
            loadDataForView('sop', true);
        } else {
            showToast('Gagal menyimpan: ' + response.message, 'error');
            btn.disabled = false;
            btn.innerHTML = `Simpan`;
        }
    };
    const getFileInfo = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({
                fileName: file.name,
                fileType: file.type,
                fileData: reader.result
            });
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };
    const openDeleteSopModal = (rowIndex) => {
        const item = allData.sop.find(s => s.rowIndex === rowIndex);
        if (!item) return;
        const modalHTML = `<div class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"><div class="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg"><h2 class="text-xl font-bold">Konfirmasi Hapus</h2><p>Anda yakin ingin menghapus SOP berikut?</p><p class="font-semibold text-gray-800 bg-gray-100 p-2 rounded-md">${item['Nama SOP']}</p><div class="flex items-center gap-4 pt-4"><button onclick="window.adminApp.closeModal()" class="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold">Batal</button><button id="confirm-delete" class="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">Ya, Hapus</button></div></div></div>`;
        DOM.modalsContainer.innerHTML = modalHTML;
        document.getElementById('confirm-delete').addEventListener('click', () => handleDeleteSopConfirm(rowIndex));
    };
    const handleDeleteSopConfirm = async (rowIndex) => {
        const btn = document.getElementById('confirm-delete');
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
        const response = await callApi('adminDeleteSOP', { rowIndex });
        if (response.status === 'success') {
            closeModal();
            loadDataForView('sop', true);
        } else {
            showToast('Gagal menghapus: ' + response.message, 'error');
            closeModal();
        }
    };
    const closeModal = () => {
        if(tomSelectInstances['hubungan']) tomSelectInstances['hubungan'].destroy();
        DOM.modalsContainer.innerHTML = ''; 
    };
    const showToast = (message, type = 'info') => {
        const container = document.getElementById('modals-container');
        if (!container) return;

        clearTimeout(toastTimeout);
        const toastId = 'toast-notification-admin';
        let toast = document.getElementById(toastId);
        if (!toast) {
            toast = document.createElement('div');
            toast.id = toastId;
            toast.className = 'fixed top-5 right-5 z-[101] w-full max-w-xs p-4 text-white rounded-lg shadow-lg transform transition-transform duration-300 translate-x-[120%]'
            container.appendChild(toast);
        }
        
        let iconClass = 'fas fa-info-circle';
        let bgClass = 'bg-gray-800';
        if (type === 'success') { iconClass = 'fas fa-check-circle'; bgClass = 'bg-green-600'; }
        if (type === 'error') { iconClass = 'fas fa-exclamation-circle'; bgClass = 'bg-red-600'; }
        
        toast.innerHTML = `<div class="flex items-center"><i class="${iconClass} mr-3 fa-lg"></i><p class="text-sm font-medium">${message}</p></div>`;
        toast.className = `fixed top-5 right-5 z-[101] w-full max-w-xs p-4 text-white rounded-lg shadow-lg transform transition-transform duration-300 ${bgClass}`;
        
        setTimeout(() => toast.classList.remove('translate-x-[120%]'), 10);
        
        toastTimeout = setTimeout(() => {
            toast.classList.add('translate-x-[120%]');
        }, 3000);
    }


    // --- INITIALIZATION & EVENT LISTENERS ---
    const initializeApp = () => {
        DOM.loginView.classList.add('hidden');
        DOM.dashboardView.classList.remove('hidden');
        DOM.adminUserEmail.textContent = sessionStorage.getItem('adminUserEmail');
        // PERUBAHAN: Mulai dari view SOP
        document.querySelector('.menu-item[data-view="sop"]').click();
    };

    DOM.hamburgerButton.addEventListener('click', () => {
        DOM.sidebarMenu.classList.toggle('collapsed');
        DOM.mainContent.classList.toggle('collapsed');
    });

    DOM.menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = item.dataset.view;
            DOM.headerTitle.textContent = item.querySelector('.menu-text').textContent;
            document.querySelectorAll('.view-content').forEach(vc => vc.classList.add('hidden'));
            document.getElementById(`${viewName}-view`).classList.remove('hidden');
            DOM.menuItems.forEach(mi => mi.classList.remove('bg-blue-50', 'text-blue-600'));
            item.classList.add('bg-blue-50', 'text-blue-600');
            
            // PERBAIKAN: Reset sort saat ganti view
            currentSort = { view: viewName, key: '', order: 'asc' };
            if (viewName === 'sop') {
                currentSort.key = 'IDSOP';
                currentSort.order = 'desc';
            }
             if (viewName === 'permohonan') {
                currentSort.key = 'Timestamp';
                currentSort.order = 'desc';
            }

            loadDataForView(viewName);
        });
    });
    
    document.body.addEventListener('input', (e) => {
        const target = e.target;
        if (target.matches('.filter-search, .filter-unit, .filter-fungsi')) {
            applyFiltersAndRender(target.dataset.view);
        }
    });

    document.body.addEventListener('click', (e) => {
        const reloadBtn = e.target.closest('.reload-btn');
        if (reloadBtn) loadDataForView(reloadBtn.dataset.view, true);

        const resetBtn = e.target.closest('.reset-btn');
        if (resetBtn) {
            const view = resetBtn.dataset.view;
            document.querySelector(`.filter-search[data-view="${view}"]`).value = '';
            document.querySelector(`.filter-unit[data-view="${view}"]`).value = '';
            if(document.querySelector(`.filter-fungsi[data-view="${view}"]`)) {
                document.querySelector(`.filter-fungsi[data-view="${view}"]`).value = '';
            }
            // PERBAIKAN: Reset sort ke default
            currentSort = { view: view, key: view === 'sop' ? 'IDSOP' : 'Timestamp', order: 'desc' };
            applyFiltersAndRender(view);
        }
        
        handleSort(e);
    });

    // PENAMBAHAN: Listener untuk dropdown status laporan
    document.body.addEventListener('change', (e) => {
        if (e.target.matches('.status-select')) {
            handleLaporanStatusChange(e);
        }
    });

    DOM.adminLoginForm.addEventListener('submit', handleLogin);
    DOM.logoutButton.addEventListener('click', handleLogout);

    window.adminApp = { openPermohonanModal, openDeletePermohonanModal, convertPermohonanToSop, openSopModal, openDeleteSopModal, closeModal };

    authToken = sessionStorage.getItem('adminAuthToken');
    if (authToken) initializeApp();
});
