document.addEventListener('DOMContentLoaded', () => {
    // --- KONFIGURASI ---
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxVeR6nXbRZbV6gIGEA43jBo0MHcm0icWfPY9zsu2tnLSMsoJgdq_jqQ21fcM8J-Q/exec';

    // --- DOM ELEMENTS ---
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const adminLoginForm = document.getElementById('admin-login-form');
    const logoutButton = document.getElementById('logout-button');
    const adminUserEmail = document.getElementById('admin-user-email');
    const permohonanView = document.getElementById('permohonan-view');
    const sopView = document.getElementById('sop-view');
    const modalsContainer = document.getElementById('modals-container');
    const tabButtons = document.querySelectorAll('.tab-button');

    // --- STATE ---
    let authToken = null;
    let allPermohonan = [];
    let allSop = [];

    // --- API HELPER ---
    const callApi = async (action, payload = {}, requiresAuth = true) => {
        if (requiresAuth && !authToken) {
            handleLogout();
            return { status: 'error', message: 'Token tidak ada.' };
        }
        
        const fullPayload = requiresAuth ? { ...payload, authToken } : payload;

        try {
            const response = await fetch(WEB_APP_URL, {
                method: 'POST',
                body: JSON.stringify({ action, ...fullPayload }),
                redirect: 'follow'
            });
            if (!response.ok) throw new Error(`Network response error: ${response.statusText}`);
            const result = await response.json();
            if (result.status === 'error' && result.message === 'Token tidak valid') {
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
        const loginSpinner = document.getElementById('login-spinner');
        const loginButtonText = document.getElementById('login-button-text');
        
        loginButton.disabled = true;
        loginSpinner.classList.remove('hidden');
        loginButtonText.classList.add('hidden');
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
        loginSpinner.classList.add('hidden');
        loginButtonText.classList.remove('hidden');
    };

    const handleLogout = () => {
        authToken = null;
        sessionStorage.removeItem('adminAuthToken');
        sessionStorage.removeItem('adminUserEmail');
        loginView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
        adminUserEmail.textContent = '';
    };

    const checkSession = () => {
        const token = sessionStorage.getItem('adminAuthToken');
        if (token) {
            authToken = token;
            return true;
        }
        return false;
    };
    
    // --- RENDER & MODALS: PERMOHONAN ---
    const renderPermohonan = (data) => {
        allPermohonan = data; 
        if (!data || data.length === 0) {
            permohonanView.innerHTML = `<div class="text-center p-8 bg-white rounded-lg shadow"><p class="text-gray-500">Tidak ada data permohonan.</p></div>`;
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
                        <button class="text-blue-600 hover:text-blue-800" onclick="window.adminApp.openUpdateStatusModal('${item.IDPermohonan}')"><i class="fas fa-edit"></i> Ubah Status</button>
                    </td>
                </tr>`;
        }).join('');
        permohonanView.innerHTML = `
            <div class="bg-white rounded-lg shadow overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Tanggal</th>
                            <th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Unit</th>
                            <th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama SOP</th>
                            <th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                            <th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Keterangan</th>
                            <th class="p-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">${tableRows}</tbody>
                </table>
            </div>`;
    };
    const openUpdateStatusModal = (id) => { /* ... (code unchanged) ... */ };
    const handleUpdateStatusSubmit = async (e, id) => { /* ... (code unchanged) ... */ };
    const closeStatusModal = () => { modalsContainer.innerHTML = ''; };

    // --- RENDER & MODALS: SOP ---
    const renderSop = (data) => {
        allSop = data;
        const sortedData = data.sort((a, b) => (a['Nama SOP'] || '').localeCompare(b['Nama SOP'] || ''));

        const tableRows = sortedData.map(item => `
            <tr class="hover:bg-gray-50">
                <td class="p-3 text-sm text-gray-700">${item['Nomor SOP'] || ''}</td>
                <td class="p-3 text-sm font-semibold text-gray-900">${item['Nama SOP'] || ''}</td>
                <td class="p-3 text-sm text-gray-700">${item.Unit || ''}</td>
                <td class="p-3 text-sm text-gray-700">${item.Fungsi || ''}</td>
                <td class="p-3 text-sm text-right">
                    <button class="text-blue-600 hover:text-blue-800 mr-4" onclick="window.adminApp.openSopModal(${item.rowIndex})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="text-red-600 hover:text-red-800" onclick="window.adminApp.openDeleteSopModal(${item.rowIndex})"><i class="fas fa-trash"></i> Hapus</button>
                </td>
            </tr>
        `).join('');

        sopView.innerHTML = `
            <div class="flex justify-end mb-4">
                <button id="add-sop-button" class="bg-blue-600 text-white hover:bg-blue-700 font-semibold px-4 py-2 rounded-lg flex items-center gap-2">
                    <i class="fas fa-plus"></i> Tambah SOP Baru
                </button>
            </div>
            <div class="bg-white rounded-lg shadow overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Nomor SOP</th>
                            <th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama SOP</th>
                            <th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Unit</th>
                            <th class="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Fungsi</th>
                            <th class="p-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">${tableRows}</tbody>
                </table>
            </div>`;
        document.getElementById('add-sop-button').addEventListener('click', () => window.adminApp.openSopModal(null));
    };

    const openSopModal = (rowIndex) => {
        const isEdit = rowIndex !== null;
        const item = isEdit ? allSop.find(s => s.rowIndex === rowIndex) : {};
        if (isEdit && !item) return;

        const title = isEdit ? 'Edit SOP' : 'Tambah SOP Baru';
        const modalHTML = `
            <div id="sop-modal" class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div class="w-full max-w-2xl bg-white rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
                    <form id="sop-form" class="p-8 space-y-4">
                        <h2 class="text-xl font-bold">${title}</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label class="text-sm">Nama SOP</label><input name="Nama SOP" value="${item['Nama SOP'] || ''}" required class="w-full mt-1 p-2 border rounded-md"></div>
                            <div><label class="text-sm">Nomor SOP</label><input name="Nomor SOP" value="${item['Nomor SOP'] || ''}" class="w-full mt-1 p-2 border rounded-md"></div>
                            <div><label class="text-sm">Unit</label><input name="Unit" value="${item.Unit || ''}" class="w-full mt-1 p-2 border rounded-md"></div>
                            <div><label class="text-sm">Fungsi</label><input name="Fungsi" value="${item.Fungsi || ''}" class="w-full mt-1 p-2 border rounded-md"></div>
                            <div><label class="text-sm">Penandatangan</label><input name="Penandatangan" value="${item.Penandatangan || ''}" class="w-full mt-1 p-2 border rounded-md"></div>
                            <div><label class="text-sm">Status</label><input name="Status" value="${item.Status || 'Berlaku'}" class="w-full mt-1 p-2 border rounded-md"></div>
                            <div><label class="text-sm">Tanggal Pembuatan</label><input type="date" name="Tanggal Pembuatan" value="${(item['Tanggal Pembuatan'] || '').substring(0,10)}" class="w-full mt-1 p-2 border rounded-md"></div>
                            <div><label class="text-sm">Tanggal Efektif</label><input type="date" name="Tanggal Efektif" value="${(item['Tanggal Efektif'] || '').substring(0,10)}" class="w-full mt-1 p-2 border rounded-md"></div>
                        </div>
                        <div><label class="text-sm">Link File Google Drive</label><input name="File" value="${item.File || ''}" placeholder="https://drive.google.com/..." class="w-full mt-1 p-2 border rounded-md"></div>
                        <div class="flex items-center gap-4 pt-4">
                            <button type="button" id="cancel-sop-form" class="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold">Batal</button>
                            <button type="submit" id="submit-sop-form" class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex justify-center items-center">
                                <span>Simpan</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>`;
        modalsContainer.innerHTML = modalHTML;
        document.getElementById('sop-form').addEventListener('submit', (e) => handleSopFormSubmit(e, rowIndex));
        document.getElementById('cancel-sop-form').addEventListener('click', () => modalsContainer.innerHTML = '');
    };

    const handleSopFormSubmit = async (e, rowIndex) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Handle dates correctly
        if (data['Tanggal Pembuatan']) data['Tanggal Pembuatan'] = new Date(data['Tanggal Pembuatan']).toISOString();
        if (data['Tanggal Efektif']) data['Tanggal Efektif'] = new Date(data['Tanggal Efektif']).toISOString();

        const isEdit = rowIndex !== null;
        const action = isEdit ? 'adminUpdateSOP' : 'adminCreateSOP';
        const payload = isEdit ? { rowIndex, data } : { data };

        const submitButton = document.getElementById('submit-sop-form');
        submitButton.disabled = true;
        submitButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;

        const response = await callApi(action, payload);
        if (response.status === 'success') {
            modalsContainer.innerHTML = '';
            loadSopData();
        } else {
            alert('Gagal menyimpan: ' + response.message);
            submitButton.disabled = false;
            submitButton.innerHTML = `<span>Simpan</span>`;
        }
    };

    const openDeleteSopModal = (rowIndex) => {
        const item = allSop.find(s => s.rowIndex === rowIndex);
        if (!item) return;
        const modalHTML = `
            <div id="delete-modal" class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                    <h2 class="text-xl font-bold">Konfirmasi Hapus</h2>
                    <p>Anda yakin ingin menghapus SOP berikut?</p>
                    <p class="font-semibold text-gray-800 bg-gray-100 p-2 rounded-md">${item['Nama SOP']}</p>
                    <div class="flex items-center gap-4 pt-4">
                        <button id="cancel-delete" class="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold">Batal</button>
                        <button id="confirm-delete" class="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">Ya, Hapus</button>
                    </div>
                </div>
            </div>`;
        modalsContainer.innerHTML = modalHTML;
        document.getElementById('cancel-delete').addEventListener('click', () => modalsContainer.innerHTML = '');
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
    
    // --- INITIALIZATION & DATA LOADING ---
    const initializeApp = () => {
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        adminUserEmail.textContent = sessionStorage.getItem('adminUserEmail');
        loadPermohonanData();
    };
    
    const loadPermohonanData = async () => { /* ... (code unchanged) ... */ };
    const loadSopData = async () => {
        sopView.innerHTML = `<div class="text-center p-8"><i class="fas fa-spinner fa-spin fa-2x text-blue-500"></i></div>`;
        const response = await callApi('adminGetSOP');
        if(response.status === 'success'){
            renderSop(response.data);
        } else {
            sopView.innerHTML = `<div class="text-center p-8 bg-red-50 text-red-600 rounded-lg shadow">${response.message}</div>`;
        }
    };
    
    // --- EVENT LISTENERS ---
    adminLoginForm.addEventListener('submit', handleLogin);
    logoutButton.addEventListener('click', handleLogout);
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600'));
            button.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
            document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
            document.getElementById(`${tab}-view`).classList.remove('hidden');
            if (tab === 'sop') loadSopData();
            else if (tab === 'permohonan') loadPermohonanData();
        });
    });

    // --- GLOBAL APP OBJECT FOR MODALS ---
    window.adminApp = {
        openUpdateStatusModal,
        openSopModal,
        openDeleteSopModal
    };

    // --- STARTUP ---
    if (checkSession()) {
        initializeApp();
    }
});

