document.addEventListener('DOMContentLoaded', () => {
    // --- KONFIGURASI ---
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxjGeT6VmNa9Tdr8MfEbXpG7jC2RXdkwa22NyJvNtY6qlfkydoa2njr2Lxh4uMZQK1i/exec';

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
    let allData = { permohonan: [], sop: [] };
    let sopHeaders = [];

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
            return { status: 'error', message: error.message };
        }
    };

    // --- AUTHENTICATION ---
    const handleLogin = async (e) => {
        e.preventDefault();
        const btn = document.getElementById('login-button');
        btn.disabled = true;
        btn.innerHTML = `<i class="fa fa-spinner fa-spin"></i>`;
        
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
            btn.innerHTML = `Login`;
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        authToken = null;
        DOM.loginView.classList.remove('hidden');
        DOM.dashboardView.classList.add('hidden');
        DOM.adminLoginForm.reset();
    };

    // --- DATA LOADING & CACHING ---
    const loadDataForView = async (viewName, forceReload = false) => {
        const container = document.getElementById(`${viewName}-view`);
        container.innerHTML = `<div class="text-center p-8"><i class="fas fa-spinner fa-spin fa-2x text-blue-500"></i></div>`;

        const cacheKey = `cache_${viewName}`;
        if (forceReload) {
            sessionStorage.removeItem(cacheKey);
        }
        
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
            allData[viewName] = JSON.parse(cachedData);
            if (viewName === 'sop' && allData.sop.length > 0) {
                 sopHeaders = Object.keys(allData.sop[0]).filter(k => k !== 'rowIndex');
            }
            renderView(viewName, allData[viewName]);
            return;
        }

        const action = viewName === 'permohonan' ? 'adminGetPermohonan' : 'adminGetSOP';
        const response = await callApi(action);
        if (response.status === 'success') {
            allData[viewName] = response.data;
            if (viewName === 'sop' && response.data.length > 0) {
                 sopHeaders = Object.keys(response.data[0]).filter(k => k !== 'rowIndex');
            }
            sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
            renderView(viewName, allData[viewName]);
        } else {
            container.innerHTML = `<div class="text-center p-8 bg-red-50 text-red-700 rounded-lg shadow">${response.message}</div>`;
        }
    };
    
    // --- UI & DATA RENDERING ---
    const renderView = (viewName, data) => {
        const container = document.getElementById(`${viewName}-view`);
        if (!container) return;
        
        const isSopView = viewName === 'sop';
        
        const filtersHTML = `
            <div class="flex flex-col lg:flex-row items-center gap-4 mb-4">
                <div class="relative w-full lg:flex-grow">
                    <input type="search" data-view="${viewName}" class="filter-search w-full pl-10 pr-4 py-2 border rounded-lg" placeholder="Cari Nama atau Nomor...">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><i class="fa fa-search text-gray-400"></i></div>
                </div>
                <select data-view="${viewName}" class="filter-unit w-full lg:w-auto p-2 border rounded-md bg-white"><option value="">Semua Unit</option></select>
                <select data-view="${viewName}" class="filter-fungsi w-full lg:w-auto p-2 border rounded-md bg-white ${isSopView ? '' : 'hidden'}"><option value="">Semua Fungsi</option></select>
                <button data-view="${viewName}" class="reload-btn w-full lg:w-auto bg-white border text-blue-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 flex items-center justify-center gap-2">
                    <i class="fas fa-sync-alt"></i><span class="hidden sm:inline">Muat Ulang</span>
                </button>
            </div>`;
        
        let contentHTML = '';
        if (viewName === 'permohonan') contentHTML = getPermohonanHTML(data);
        if (isSopView) contentHTML = getSopHTML(data);
        
        container.innerHTML = filtersHTML + `<div class="content-wrapper">${contentHTML}</div>`;
        populateFilters(viewName, allData[viewName]);
    };
    
    const applyFiltersAndRender = (viewName) => {
        const searchTerm = document.querySelector(`.filter-search[data-view="${viewName}"]`).value.toLowerCase();
        const selectedUnit = document.querySelector(`.filter-unit[data-view="${viewName}"]`).value;
        const selectedFungsi = document.querySelector(`.filter-fungsi[data-view="${viewName}"]`).value;

        const filteredData = allData[viewName].filter(item => {
            const hasSearchTerm = searchTerm === '' || 
                (item['Nama SOP'] || '').toLowerCase().includes(searchTerm) ||
                (item['Nomor SOP'] || '').toLowerCase().includes(searchTerm);
            const hasUnit = selectedUnit === '' || item.Unit === selectedUnit;
            const hasFungsi = viewName === 'permohonan' || selectedFungsi === '' || item.Fungsi === selectedFungsi;
            return hasSearchTerm && hasUnit && hasFungsi;
        });
        
        let contentHTML = '';
        if (viewName === 'permohonan') contentHTML = getPermohonanHTML(filteredData);
        if (viewName === 'sop') contentHTML = getSopHTML(filteredData);
        
        const contentContainer = document.querySelector(`#${viewName}-view .content-wrapper`);
        if(contentContainer) {
            contentContainer.innerHTML = contentHTML;
        }
    };
    
    const populateFilters = (viewName, data) => {
        const units = [...new Set(data.map(item => item.Unit).filter(Boolean))].sort();
        const unitSelect = document.querySelector(`.filter-unit[data-view="${viewName}"]`);
        unitSelect.innerHTML = '<option value="">Semua Unit</option>' + units.map(u => `<option value="${u}">${u}</option>`).join('');

        if (viewName === 'sop') {
            const fungsis = [...new Set(data.map(item => item.Fungsi).filter(Boolean))].sort();
            const fungsiSelect = document.querySelector(`.filter-fungsi[data-view="${viewName}"]`);
            fungsiSelect.innerHTML = '<option value="">Semua Fungsi</option>' + fungsis.map(f => `<option value="${f}">${f}</option>`).join('');
        }
    };

    const getPermohonanHTML = (data) => {
        const addButton = `<div class="flex justify-end mb-4"><button onclick="window.adminApp.openPermohonanModal(null)" class="bg-blue-600 text-white hover:bg-blue-700 font-semibold px-4 py-2 rounded-lg flex items-center gap-2"><i class="fas fa-plus"></i> Tambah Permohonan</button></div>`;
        if (!data || data.length === 0) {
             return addButton + `<div class="text-center p-8 bg-white rounded-lg shadow"><p>Tidak ada data permohonan.</p></div>`;
        }
        
        const sortedData = [...data].sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
        const tableRows = sortedData.map(item => {
             const statusText = item.Status || 'Diajukan';
            let statusBadge = '';
            switch (statusText.toLowerCase()) {
                case 'disetujui': statusBadge = `<span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>`; break;
                case 'ditolak': statusBadge = `<span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>`; break;
                default: statusBadge = `<span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>`;
            }
            const formattedTimestamp = new Date(item.Timestamp).toLocaleString('id-ID', { dateStyle:'short', timeStyle: 'short' });
            return `
                <tr class="hover:bg-gray-50">
                    <td class="p-3 text-sm text-gray-700">${formattedTimestamp}</td>
                    <td class="p-3 text-sm text-gray-700">${item.Unit || ''}</td>
                    <td class="p-3 text-sm font-semibold text-gray-900">${item['Nama SOP'] || ''}</td>
                    <td class="p-3 text-sm">${statusBadge}</td>
                    <td class="p-3 text-sm text-gray-500">${item.Keterangan || ''}</td>
                    <td class="p-3 text-sm text-right">
                        <div class="flex items-center justify-end gap-2">
                           <button title="Jadikan SOP" class="bg-green-100 text-green-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-green-200" onclick="window.adminApp.convertPermohonanToSop('${item.IDPermohonan}')"><i class="fas fa-sync-alt"></i></button>
                           <button title="Edit Permohonan" class="bg-blue-100 text-blue-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-200" onclick="window.adminApp.openPermohonanModal('${item.IDPermohonan}')"><i class="fas fa-edit"></i></button>
                           <button title="Hapus Permohonan" class="bg-red-100 text-red-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-200" onclick="window.adminApp.openDeletePermohonanModal('${item.IDPermohonan}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>`;
        }).join('');
        
        const cards = sortedData.map(item => {
             const statusText = item.Status || 'Diajukan';
            let statusBadge = '';
            switch (statusText.toLowerCase()) {
                case 'disetujui': statusBadge = `<span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>`; break;
                case 'ditolak': statusBadge = `<span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>`; break;
                default: statusBadge = `<span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${statusText}</span>`;
            }
            const formattedTimestamp = new Date(item.Timestamp).toLocaleDateString('id-ID');
             return `
            <div class="bg-white p-4 rounded-lg shadow space-y-2">
                <div class="flex justify-between items-start">
                    <p class="font-semibold text-gray-900 pr-2">${item['Nama SOP']}</p>
                    ${statusBadge}
                </div>
                <p class="text-xs text-gray-500"><span class="font-medium">Unit:</span> ${item.Unit}</p>
                <p class="text-xs text-gray-500"><span class="font-medium">Tanggal:</span> ${formattedTimestamp}</p>
                ${item.Keterangan ? `<p class="text-xs text-gray-600 bg-gray-50 p-2 rounded-md mt-1"><span class="font-medium">Ket:</span> ${item.Keterangan}</p>` : ''}
                <div class="flex items-center justify-end gap-2 pt-2 border-t mt-2">
                   <button title="Jadikan SOP" class="bg-green-100 text-green-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-green-200" onclick="window.adminApp.convertPermohonanToSop('${item.IDPermohonan}')"><i class="fas fa-sync-alt"></i></button>
                   <button title="Edit Permohonan" class="bg-blue-100 text-blue-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-200" onclick="window.adminApp.openPermohonanModal('${item.IDPermohonan}')"><i class="fas fa-edit"></i></button>
                   <button title="Hapus Permohonan" class="bg-red-100 text-red-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-200" onclick="window.adminApp.openDeletePermohonanModal('${item.IDPermohonan}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');

        return addButton + `<div class="bg-white rounded-lg shadow overflow-x-auto hidden md:block"><table class="w-full"><thead class="bg-gray-50"><tr><th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Tanggal</th><th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Unit</th><th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama SOP</th><th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th><th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Keterangan</th><th class="p-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksi</th></tr></thead><tbody class="divide-y">${tableRows}</tbody></table></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">${cards}</div>`;
    };

    const getSopHTML = (data) => {
        const addButton = `<div class="flex justify-end mb-4"><button onclick="window.adminApp.openSopModal(null)" class="bg-blue-600 text-white hover:bg-blue-700 font-semibold px-4 py-2 rounded-lg flex items-center gap-2"><i class="fas fa-plus"></i> Tambah SOP Baru</button></div>`;
        if (!data || data.length === 0) {
            return addButton + `<div class="text-center p-8 bg-white rounded-lg shadow"><p>Tidak ada data SOP.</p></div>`;
        }
        const sortedData = [...data].sort((a, b) => (a['Nama SOP'] || '').localeCompare(b['Nama SOP'] || ''));
        const tableRows = sortedData.map(item => `
            <tr class="hover:bg-gray-50">
                <td class="p-3 text-sm text-gray-700">${item['Nomor SOP'] || ''}</td>
                <td class="p-3 text-sm font-semibold text-gray-900">${item['Nama SOP'] || ''}</td>
                <td class="p-3 text-sm text-gray-700">${item.Unit || ''}</td>
                 <td class="p-3 text-sm text-gray-700">${item.Fungsi || ''}</td>
                <td class="p-3 text-sm text-right">
                    <div class="flex items-center justify-end gap-2">
                        <button title="Edit SOP" class="bg-blue-100 text-blue-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-200" onclick="window.adminApp.openSopModal(${item.rowIndex})"><i class="fas fa-edit"></i></button>
                        <button title="Hapus SOP" class="bg-red-100 text-red-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-200" onclick="window.adminApp.openDeleteSopModal(${item.rowIndex})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`).join('');
        
        const cards = sortedData.map(item => `
            <div class="bg-white p-4 rounded-lg shadow space-y-2">
                <p class="font-semibold text-gray-900">${item['Nama SOP']}</p>
                <p class="text-xs text-gray-500"><span class="font-medium">Nomor:</span> ${item['Nomor SOP'] || 'N/A'}</p>
                <p class="text-xs text-gray-500"><span class="font-medium">Unit:</span> ${item.Unit || 'N/A'}</p>
                <div class="flex items-center justify-end gap-2 pt-2 border-t mt-2">
                    <button title="Edit SOP" class="bg-blue-100 text-blue-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-200" onclick="window.adminApp.openSopModal(${item.rowIndex})"><i class="fas fa-edit"></i></button>
                    <button title="Hapus SOP" class="bg-red-100 text-red-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-200" onclick="window.adminApp.openDeleteSopModal(${item.rowIndex})"><i class="fas fa-trash"></i></button>
                </div>
            </div>`).join('');

        return addButton + `<div class="bg-white rounded-lg shadow overflow-x-auto hidden md:block"><table class="w-full"><thead class="bg-gray-50"><tr><th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Nomor SOP</th><th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama SOP</th><th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Unit</th><th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Fungsi</th><th class="p-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksi</th></tr></thead><tbody class="divide-y">${tableRows}</tbody></table></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">${cards}</div>`;
    };

    // --- MODALS & FORMS ---
    const openPermohonanModal = (id) => {
        const isEdit = id !== null;
        const item = isEdit ? allData.permohonan.find(p => p.IDPermohonan === id) : {};
        const title = isEdit ? 'Edit Permohonan' : 'Tambah Permohonan Baru';

        const modalHTML = `
            <div id="permohonan-modal" class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div class="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg">
                    <h2 class="text-xl font-bold">${title}</h2>
                    <form id="permohonan-form" class="space-y-4">
                        <div>
                            <label for="Unit" class="text-sm font-medium">Unit</label>
                            <input type="text" name="Unit" value="${item.Unit || ''}" required class="w-full mt-1 p-2 border rounded-md">
                        </div>
                        <div>
                            <label for="Nama_SOP" class="text-sm font-medium">Nama SOP</label>
                            <input type="text" name="Nama_SOP" value="${item['Nama SOP'] || ''}" required class="w-full mt-1 p-2 border rounded-md">
                        </div>
                        <div>
                            <label for="Status" class="text-sm font-medium">Status</label>
                            <select name="Status" class="w-full mt-1 p-2 border rounded-md">
                                <option value="Diajukan" ${item.Status === 'Diajukan' ? 'selected' : ''}>Diajukan</option>
                                <option value="Disetujui" ${item.Status === 'Disetujui' ? 'selected' : ''}>Disetujui</option>
                                <option value="Ditolak" ${item.Status === 'Ditolak' ? 'selected' : ''}>Ditolak</option>
                            </select>
                        </div>
                        <div>
                            <label for="Keterangan" class="text-sm font-medium">Keterangan</label>
                            <textarea name="Keterangan" rows="3" class="w-full mt-1 p-2 border rounded-md">${item.Keterangan || ''}</textarea>
                        </div>
                        <div class="flex items-center gap-4 pt-4">
                            <button type="button" onclick="window.adminApp.closeModal()" class="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold">Batal</button>
                            <button type="submit" id="submit-permohonan" class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">Simpan</button>
                        </div>
                    </form>
                </div>
            </div>`;
        DOM.modalsContainer.innerHTML = modalHTML;
        document.getElementById('permohonan-form').addEventListener('submit', (e) => handlePermohonanFormSubmit(e, id));
    };
    
    const handlePermohonanFormSubmit = async (e, id) => {
        e.preventDefault();
        const isEdit = id !== null;
        const form = e.target;
        const data = {
            Unit: form.Unit.value,
            'Nama SOP': form.Nama_SOP.value,
            Status: form.Status.value,
            Keterangan: form.Keterangan.value,
        };
        
        const action = isEdit ? 'adminUpdatePermohonan' : 'adminCreatePermohonan';
        const payload = isEdit ? { id, data } : { data };
        
        const btn = document.getElementById('submit-permohonan');
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;

        const response = await callApi(action, payload);
        if (response.status === 'success') {
            closeModal();
            loadDataForView('permohonan', true);
        } else {
            alert('Gagal: ' + response.message);
            btn.disabled = false;
            btn.innerHTML = `Simpan`;
        }
    };

    const openDeletePermohonanModal = (id) => {
        const item = allData.permohonan.find(p => p.IDPermohonan === id);
        if (!item) return;
        const modalHTML = `
            <div class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                    <h2 class="text-xl font-bold">Konfirmasi Hapus</h2>
                    <p>Anda yakin ingin menghapus permohonan untuk SOP berikut?</p>
                    <p class="font-semibold text-gray-800 bg-gray-100 p-2 rounded-md">${item['Nama SOP']}</p>
                    <div class="flex items-center gap-4 pt-4">
                        <button onclick="window.adminApp.closeModal()" class="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold">Batal</button>
                        <button id="confirm-delete" class="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">Ya, Hapus</button>
                    </div>
                </div>
            </div>`;
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
            alert('Gagal menghapus: ' + response.message);
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

        const fields = sopHeaders.map(header => {
            const value = item[header] || '';
            if (header === 'File') {
                return `
                    <div class="md:col-span-2">
                        <label class="text-sm font-medium text-gray-700">File</label>
                        ${value ? `<p class="text-xs mt-1">File saat ini: <a href="${value}" target="_blank" class="text-blue-600">${value.split('/').pop().split('?')[0]}</a></p>` : ''}
                        <input type="file" name="file" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mt-1">
                        <input type="hidden" name="File" value="${value}">
                    </div>`;
            }
            return `<div><label for="sop-${header}" class="text-sm font-medium text-gray-700">${header}</label><input type="text" id="sop-${header}" name="${header}" value="${value}" class="w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg"></div>`;
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
        document.getElementById('sop-form').addEventListener('submit', (e) => handleSopFormSubmit(e, rowIndex));
    };

    const handleSopFormSubmit = async (e, rowIndex) => {
        e.preventDefault();
        const btn = document.getElementById('submit-sop');
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        delete data.file;

        const fileInput = e.target.file;
        let fileInfo = null;
        if (fileInput.files[0]) {
            fileInfo = await getFileInfo(fileInput.files[0]);
        }
        
        const action = rowIndex ? 'adminUpdateSOP' : 'adminCreateSOP';
        const payload = { data, fileInfo };
        if (rowIndex) payload.rowIndex = rowIndex;
        
        const response = await callApi(action, payload);
        if (response.status === 'success') {
            closeModal();
            loadDataForView('sop', true);
        } else {
            alert('Gagal menyimpan: ' + response.message);
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
        const modalHTML = `
            <div class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                    <h2 class="text-xl font-bold">Konfirmasi Hapus</h2>
                    <p>Anda yakin ingin menghapus SOP berikut?</p>
                    <p class="font-semibold text-gray-800 bg-gray-100 p-2 rounded-md">${item['Nama SOP']}</p>
                    <div class="flex items-center gap-4 pt-4">
                        <button onclick="window.adminApp.closeModal()" class="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold">Batal</button>
                        <button id="confirm-delete" class="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">Ya, Hapus</button>
                    </div>
                </div>
            </div>`;
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
            alert('Gagal menghapus: ' + response.message);
            closeModal();
        }
    };
    const closeModal = () => { DOM.modalsContainer.innerHTML = ''; };

    // --- INITIALIZATION & EVENT LISTENERS ---
    const initializeApp = () => {
        DOM.loginView.classList.add('hidden');
        DOM.dashboardView.classList.remove('hidden');
        DOM.adminUserEmail.textContent = sessionStorage.getItem('adminUserEmail');
        document.querySelector('.menu-item[data-view="permohonan"]').click();
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
        const btn = e.target.closest('.reload-btn');
        if (btn) {
            loadDataForView(btn.dataset.view, true);
        }
    });

    DOM.adminLoginForm.addEventListener('submit', handleLogin);
    DOM.logoutButton.addEventListener('click', handleLogout);

    // --- GLOBAL OBJECT ---
    window.adminApp = { openPermohonanModal, openDeletePermohonanModal, convertPermohonanToSop, openSopModal, openDeleteSopModal, closeModal };

    // --- STARTUP ---
    authToken = sessionStorage.getItem('adminAuthToken');
    if (authToken) {
        initializeApp();
    }
});

