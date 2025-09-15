document.addEventListener('DOMContentLoaded', () => {
    // --- KONFIGURASI ---
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby4VDW0BYOe79TdMvP26bDFE7W7bZiFaCaEVqMrsvcqXWEPWoxLE3gTsBsWdHC4iOtf/exec';

    // --- DOM ELEMENTS ---
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const adminLoginForm = document.getElementById('admin-login-form');
    const logoutButton = document.getElementById('logout-button');
    const adminUserEmail = document.getElementById('admin-user-email');
    const modalsContainer = document.getElementById('modals-container');
    const menuItems = document.querySelectorAll('.menu-item');
    const headerTitle = document.getElementById('header-title');
    const hamburgerButton = document.getElementById('hamburger-button');
    const sidebarMenu = document.getElementById('sidebar-menu');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    // --- STATE ---
    let authToken = null;
    let allPermohonan = [];
    let allSop = [];
    let sopHeaders = [];

    // --- API HELPER ---
    const callApi = async (action, payload = {}, requiresAuth = true) => {
        if (requiresAuth && !authToken) {
            handleLogout();
            return { status: 'error', message: 'Token tidak ada.' };
        }
        const fullPayload = requiresAuth ? { ...payload, authToken } : payload;
        try {
            const response = await fetch(WEB_APP_URL, {
                method: 'POST', body: JSON.stringify({ action, ...fullPayload }), redirect: 'follow'
            });
            if (!response.ok) throw new Error(`Network response error: ${response.statusText}`);
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
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const loginError = document.getElementById('login-error');
        const loginButton = document.getElementById('login-button');

        loginButton.disabled = true;
        loginButton.innerHTML = `<span id="login-spinner"><i class="fa fa-spinner fa-spin"></i></span>`;
        loginError.classList.add('hidden');

        const response = await callApi('adminLogin', { username, password }, false);

        if (response.status === 'success' && response.token) {
            authToken = response.token;
            sessionStorage.setItem('adminAuthToken', authToken);
            sessionStorage.setItem('adminUserEmail', response.email);
            initializeApp();
        } else {
            loginError.textContent = response.message || 'Login Gagal.';
            loginError.classList.remove('hidden');
        }

        loginButton.disabled = false;
        loginButton.innerHTML = `<span id="login-button-text">Login</span>`;
    };

    const handleLogout = () => {
        authToken = null;
        sessionStorage.removeItem('adminAuthToken');
        sessionStorage.removeItem('adminUserEmail');
        loginView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
        adminUserEmail.textContent = '';
        adminLoginForm.reset();
    };

    const checkSession = () => {
        const token = sessionStorage.getItem('adminAuthToken');
        if (token) {
            authToken = token;
            return true;
        }
        return false;
    };

    // --- UI RENDERING & MODALS ---
    const renderPermohonan = (data) => {
        allPermohonan = data;
        const container = document.getElementById('permohonan-view');
        if (!data || data.length === 0) {
            container.innerHTML = `<div class="text-center p-8 bg-white rounded-lg shadow"><p class="text-gray-500">Tidak ada data permohonan.</p></div>`;
            return;
        }
        const sortedData = data.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
        
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
                    <td class="p-3 text-sm text-gray-700">${item.Unit}</td>
                    <td class="p-3 text-sm font-semibold text-gray-900">${item['Nama SOP']}</td>
                    <td class="p-3 text-sm">${statusBadge}</td>
                    <td class="p-3 text-sm text-gray-500">${item.Keterangan || ''}</td>
                    <td class="p-3 text-sm text-right">
                        <div class="flex items-center justify-end gap-2">
                           <button title="Jadikan SOP" class="bg-green-100 text-green-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-green-200" onclick="window.adminApp.convertPermohonanToSop('${item.IDPermohonan}')"><i class="fas fa-sync-alt"></i></button>
                           <button title="Ubah Status" class="bg-blue-100 text-blue-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-200" onclick="window.adminApp.openUpdateStatusModal('${item.IDPermohonan}')"><i class="fas fa-edit"></i></button>
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
            return `
            <div class="bg-white p-4 rounded-lg shadow space-y-2">
                <div class="flex justify-between items-start">
                    <p class="font-semibold text-gray-900">${item['Nama SOP']}</p>
                    ${statusBadge}
                </div>
                <p class="text-xs text-gray-500"><span class="font-medium">Unit:</span> ${item.Unit}</p>
                <p class="text-xs text-gray-500"><span class="font-medium">Tanggal:</span> ${new Date(item.Timestamp).toLocaleDateString('id-ID')}</p>
                 ${item.Keterangan ? `<p class="text-xs text-gray-600 bg-gray-50 p-2 rounded-md mt-1"><span class="font-medium">Ket:</span> ${item.Keterangan}</p>` : ''}
                <div class="flex items-center justify-end gap-2 pt-2 border-t mt-2">
                   <button title="Jadikan SOP" class="bg-green-100 text-green-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-green-200" onclick="window.adminApp.convertPermohonanToSop('${item.IDPermohonan}')"><i class="fas fa-sync-alt"></i></button>
                   <button title="Ubah Status" class="bg-blue-100 text-blue-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-200" onclick="window.adminApp.openUpdateStatusModal('${item.IDPermohonan}')"><i class="fas fa-edit"></i></button>
                   <button title="Hapus Permohonan" class="bg-red-100 text-red-700 p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-200" onclick="window.adminApp.openDeletePermohonanModal('${item.IDPermohonan}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `}).join('');

        container.innerHTML = `
            <div class="bg-white rounded-lg shadow overflow-x-auto hidden md:block">
                <table class="w-full"><thead class="bg-gray-50"><tr><th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Tanggal</th><th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Unit</th><th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama SOP</th><th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th><th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Keterangan</th><th class="p-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksi</th></tr></thead><tbody class="divide-y">${tableRows}</tbody></table>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">${cards}</div>
        `;
    };
    
    const renderSop = (data) => {
        allSop = data;
        if (data.length > 0 && sopHeaders.length === 0) {
            sopHeaders = Object.keys(data[0]).filter(key => key !== 'rowIndex');
        }
        const container = document.getElementById('sop-view');
        const sortedData = data.sort((a, b) => (a['Nama SOP'] || '').localeCompare(b['Nama SOP'] || ''));

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

        container.innerHTML = `
            <div class="flex justify-end mb-4"><button id="add-sop-button" class="bg-blue-600 text-white hover:bg-blue-700 font-semibold px-4 py-2 rounded-lg flex items-center gap-2"><i class="fas fa-plus"></i> Tambah SOP Baru</button></div>
            <div class="bg-white rounded-lg shadow overflow-x-auto hidden md:block"><table class="w-full"><thead class="bg-gray-50"><tr><th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Nomor SOP</th><th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama SOP</th><th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Unit</th><th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Fungsi</th><th class="p-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksi</th></tr></thead><tbody class="divide-y">${tableRows}</tbody></table></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">${cards}</div>`;
        document.getElementById('add-sop-button').addEventListener('click', () => window.adminApp.openSopModal(null));
    };

    const openUpdateStatusModal = (id) => {
        const item = allPermohonan.find(p => p.IDPermohonan === id);
        if (!item) return;

        const modalHTML = `
            <div id="status-modal" class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div class="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg">
                    <h2 class="text-xl font-bold">Ubah Status Permohonan</h2>
                    <p class="text-sm text-gray-600">ID: <span class="font-mono">${item.IDPermohonan}</span></p>
                    <form id="update-status-form">
                        <div>
                            <label for="status-select" class="text-sm font-medium">Status</label>
                            <select id="status-select" class="w-full mt-1 p-2 border rounded-md">
                                <option value="Diajukan" ${item.Status === 'Diajukan' ? 'selected' : ''}>Diajukan</option>
                                <option value="Disetujui" ${item.Status === 'Disetujui' ? 'selected' : ''}>Disetujui</option>
                                <option value="Ditolak" ${item.Status === 'Ditolak' ? 'selected' : ''}>Ditolak</option>
                            </select>
                        </div>
                        <div>
                            <label for="keterangan-input" class="text-sm font-medium">Keterangan (Opsional)</label>
                            <textarea id="keterangan-input" rows="3" class="w-full mt-1 p-2 border rounded-md">${item.Keterangan || ''}</textarea>
                        </div>
                        <div class="flex items-center gap-4 pt-4">
                            <button type="button" onclick="window.adminApp.closeModal()" class="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold">Batal</button>
                            <button type="submit" id="submit-update" class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex justify-center items-center">
                                <span>Simpan Perubahan</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>`;
        modalsContainer.innerHTML = modalHTML;
        document.getElementById('update-status-form').addEventListener('submit', (e) => handleUpdateStatusSubmit(e, id));
    };

    const handleUpdateStatusSubmit = async (e, id) => {
        e.preventDefault();
        const newStatus = document.getElementById('status-select').value;
        const keterangan = document.getElementById('keterangan-input').value;
        const submitButton = document.getElementById('submit-update');
        submitButton.disabled = true;
        submitButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
        
        const response = await callApi('adminUpdatePermohonan', { id, newStatus, keterangan });

        if (response.status === 'success') {
            closeModal();
            loadPermohonanData();
        } else {
            alert('Gagal memperbarui: ' + response.message);
            submitButton.disabled = false;
            submitButton.innerHTML = `<span>Simpan Perubahan</span>`;
        }
    };

    const openSopModal = (rowIndex, prefillData = {}) => {
        const isEdit = rowIndex !== null;
        const sopData = isEdit ? allSop.find(s => s.rowIndex === rowIndex) : prefillData;
        if (isEdit && !sopData) return;

        const formFields = sopHeaders.map(header => `
            <div>
                <label for="sop-${header}" class="text-sm font-medium text-gray-700">${header}</label>
                <input type="text" id="sop-${header}" name="${header}" value="${sopData[header] || ''}" class="w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>`).join('');

        const modalHTML = `
            <div id="sop-modal" class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div class="w-full max-w-lg p-8 bg-white rounded-xl shadow-lg">
                    <h2 class="text-xl font-bold mb-6">${isEdit ? 'Edit SOP' : 'Tambah SOP Baru'}</h2>
                    <form id="sop-form" class="space-y-4 max-h-[60vh] overflow-y-auto pr-2">${formFields}</form>
                    <div class="flex items-center gap-4 pt-6 border-t">
                        <button onclick="window.adminApp.closeModal()" class="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold">Batal</button>
                        <button id="submit-sop" class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">Simpan</button>
                    </div>
                </div>
            </div>`;
        modalsContainer.innerHTML = modalHTML;
        document.getElementById('submit-sop').addEventListener('click', () => document.getElementById('sop-form').requestSubmit());
        document.getElementById('sop-form').addEventListener('submit', (e) => handleSopFormSubmit(e, rowIndex));
    };

    const handleSopFormSubmit = async (e, rowIndex) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        const action = rowIndex ? 'adminUpdateSOP' : 'adminCreateSOP';
        const payload = { data };
        if (rowIndex) payload.rowIndex = rowIndex;

        const submitButton = document.getElementById('submit-sop');
        submitButton.disabled = true;
        submitButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;

        const response = await callApi(action, payload);
        if (response.status === 'success') {
            closeModal();
            loadSopData();
        } else {
            alert('Gagal menyimpan: ' + response.message);
        }
        submitButton.disabled = false;
        submitButton.innerHTML = `Simpan`;
    };

    const openDeleteSopModal = (rowIndex) => {
        const sopData = allSop.find(s => s.rowIndex === rowIndex);
        if (!sopData) return;
        const modalHTML = `
            <div id="delete-modal" class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                    <h2 class="text-xl font-bold">Konfirmasi Hapus</h2>
                    <p>Anda yakin ingin menghapus SOP berikut?</p>
                    <p class="font-semibold text-gray-800 bg-gray-100 p-2 rounded-md">${sopData['Nama SOP']}</p>
                    <div class="flex items-center gap-4 pt-4">
                        <button onclick="window.adminApp.closeModal()" class="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold">Batal</button>
                        <button id="confirm-delete" class="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">Ya, Hapus</button>
                    </div>
                </div>
            </div>`;
        modalsContainer.innerHTML = modalHTML;
        document.getElementById('confirm-delete').addEventListener('click', () => handleDeleteSopConfirm(rowIndex));
    };

    const handleDeleteSopConfirm = async (rowIndex) => {
        const deleteButton = document.getElementById('confirm-delete');
        deleteButton.disabled = true;
        deleteButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
        const response = await callApi('adminDeleteSOP', { rowIndex });
        if (response.status === 'success') {
            modalsContainer.innerHTML = '';
            loadSopData();
        } else {
            alert('Gagal menghapus: ' + response.message);
            modalsContainer.innerHTML = '';
        }
    };

    const openDeletePermohonanModal = (id) => {
        const item = allPermohonan.find(p => p.IDPermohonan === id);
        if (!item) return;
        const modalHTML = `
            <div id="delete-modal" class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
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
        modalsContainer.innerHTML = modalHTML;
        document.getElementById('confirm-delete').addEventListener('click', () => handleDeletePermohonanConfirm(id));
    };
    
    const handleDeletePermohonanConfirm = async (id) => {
        const deleteButton = document.getElementById('confirm-delete');
        deleteButton.disabled = true;
        deleteButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
        const response = await callApi('adminDeletePermohonan', { id });
        if (response.status === 'success') {
            modalsContainer.innerHTML = '';
            loadPermohonanData();
        } else {
            alert('Gagal menghapus: ' + response.message);
            modalsContainer.innerHTML = '';
        }
    };

    const convertPermohonanToSop = (id) => {
        const item = allPermohonan.find(p => p.IDPermohonan === id);
        if (!item) return;
        const prefillData = { 'Nama SOP': item['Nama SOP'], 'Unit': item.Unit };
        document.querySelector('.menu-item[data-view="sop"]').click();
        setTimeout(() => openSopModal(null, prefillData), 100);
    };

    const closeModal = () => { modalsContainer.innerHTML = ''; };

    // --- INITIALIZATION & DATA LOADING ---
    const initializeApp = () => {
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        adminUserEmail.textContent = sessionStorage.getItem('adminUserEmail');
        document.querySelector('.menu-item[data-view="permohonan"]').click();
    };
    
    const loadPermohonanData = async () => {
        const container = document.getElementById('permohonan-view');
        container.innerHTML = `<div class="text-center p-8"><i class="fas fa-spinner fa-spin fa-2x text-blue-500"></i></div>`;
        const response = await callApi('adminGetPermohonan');
        if(response.status === 'success'){
            renderPermohonan(response.data);
        } else {
            container.innerHTML = `<div class="text-center p-8 bg-red-50 text-red-600 rounded-lg shadow">${response.message}</div>`;
        }
    };
    const loadSopData = async () => {
        const container = document.getElementById('sop-view');
        container.innerHTML = `<div class="text-center p-8"><i class="fas fa-spinner fa-spin fa-2x text-blue-500"></i></div>`;
        const response = await callApi('adminGetSOP');
        if(response.status === 'success'){
            renderSop(response.data);
        } else {
            container.innerHTML = `<div class="text-center p-8 bg-red-50 text-red-600 rounded-lg shadow">${response.message}</div>`;
        }
    };
    
    // --- EVENT LISTENERS ---
    adminLoginForm.addEventListener('submit', handleLogin);
    logoutButton.addEventListener('click', handleLogout);
    
    hamburgerButton.addEventListener('click', () => {
        sidebarMenu.classList.toggle('-translate-x-full');
        sidebarOverlay.classList.toggle('hidden');
    });
    sidebarOverlay.addEventListener('click', () => {
        sidebarMenu.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('hidden');
    });

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = item.dataset.view;
            
            menuItems.forEach(mi => mi.classList.remove('bg-blue-50', 'text-blue-600'));
            item.classList.add('bg-blue-50', 'text-blue-600');
            
            document.querySelectorAll('.view-content').forEach(vc => vc.classList.add('hidden'));
            document.getElementById(`${viewName}-view`).classList.remove('hidden');

            headerTitle.textContent = item.textContent;
            if (viewName === 'permohonan') loadPermohonanData();
            else if (viewName === 'sop') loadSopData();

            if(window.innerWidth < 768) {
                sidebarMenu.classList.add('-translate-x-full');
                sidebarOverlay.classList.add('hidden');
            }
        });
    });

    // --- GLOBAL APP OBJECT FOR MODALS ---
    window.adminApp = {
        openUpdateStatusModal, openSopModal, openDeleteSopModal, closeModal,
        openDeletePermohonanModal, convertPermohonanToSop
    };

    // --- STARTUP ---
    if (checkSession()) {
        initializeApp();
    }
});

