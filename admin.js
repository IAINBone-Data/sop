document.addEventListener('DOMContentLoaded', () => {
    // --- KONFIGURASI ---
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwfjR1j10AkKTMXlFJ4rY1kcRlOhBcKJmpHqBKYlmQv3d4SCxwYyfxQoiAU0JBW6RMZ/exec';

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
            // Anda bisa menambahkan toast notifikasi di sini jika mau
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
    
    // --- UI RENDERING & MODALS ---
    const renderPermohonan = (data) => {
        allPermohonan = data; // Simpan data untuk digunakan modal
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
                        <button class="text-blue-600 hover:text-blue-800" onclick="window.adminApp.openUpdateStatusModal('${item.IDPermohonan}')">
                            <i class="fas fa-edit"></i> Ubah Status
                        </button>
                    </td>
                </tr>
            `;
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
            </div>
        `;
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
                            <button type="button" id="cancel-update" class="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold">Batal</button>
                            <button type="submit" id="submit-update" class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex justify-center items-center">
                                <span>Simpan Perubahan</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        modalsContainer.innerHTML = modalHTML;

        document.getElementById('update-status-form').addEventListener('submit', (e) => handleUpdateStatusSubmit(e, id));
        document.getElementById('cancel-update').addEventListener('click', closeStatusModal);
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
            closeStatusModal();
            loadPermohonanData(); // Reload data to show changes
        } else {
            alert('Gagal memperbarui: ' + response.message);
            submitButton.disabled = false;
            submitButton.innerHTML = `<span>Simpan Perubahan</span>`;
        }
    };
    
    const closeStatusModal = () => {
        modalsContainer.innerHTML = '';
    };

    // --- INITIALIZATION & DATA LOADING ---
    const initializeApp = () => {
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        adminUserEmail.textContent = sessionStorage.getItem('adminUserEmail');
        loadPermohonanData();
    };
    
    const loadPermohonanData = async () => {
        permohonanView.innerHTML = `<div class="text-center p-8"><i class="fas fa-spinner fa-spin fa-2x text-blue-500"></i></div>`;
        const response = await callApi('adminGetPermohonan');
        if(response.status === 'success'){
            renderPermohonan(response.data);
        } else {
            permohonanView.innerHTML = `<div class="text-center p-8 bg-red-50 text-red-600 rounded-lg shadow">${response.message}</div>`;
        }
    };

    // --- EVENT LISTENERS ---
    adminLoginForm.addEventListener('submit', handleLogin);
    logoutButton.addEventListener('click', handleLogout);

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            
            tabButtons.forEach(btn => {
                btn.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
                btn.classList.add('text-gray-500');
            });
            button.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');

            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });

            document.getElementById(`${tab}-view`).classList.remove('hidden');
            
            if (tab === 'sop') {
                sopView.innerHTML = `<div class="text-center p-8 bg-white rounded-lg shadow"><p class="text-gray-500">Fitur Manajemen SOP sedang dalam pengembangan.</p></div>`;
            } else if (tab === 'permohonan') {
                loadPermohonanData();
            }
        });
    });

    // --- GLOBAL APP OBJECT FOR MODALS ---
    window.adminApp = {
        openUpdateStatusModal: openUpdateStatusModal
    };

    // --- STARTUP ---
    if (checkSession()) {
        initializeApp();
    }
});

