/* =============================================
   Pocket Control — Lógica principal del frontend
   Toda la app en un solo archivo JS
   ============================================= */

// ===== CONFIGURACIÓN =====
const API = 'http://localhost:8080/api';

// ===== ESTADO =====
let authToken = localStorage.getItem('pc_token');
let userEmail = localStorage.getItem('pc_email');
let currentView = 'home';
let authMode = 'login'; // 'login' o 'register'

// ===== UTILIDADES =====

/** Formatear monto en pesos colombianos: $1.500.000 */
function formatMoney(amount) {
    const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return '$' + Math.round(num).toLocaleString('es-CO');
}

/** Formatear fecha corta */
function formatDate(dateStr) {
    const d = new Date(dateStr);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (d.toDateString() === hoy.toDateString()) {
        return 'Hoy ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    }
    if (d.toDateString() === ayer.toDateString()) {
        return 'Ayer ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) +
        ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

/** Saludo según la hora del día */
function getGreeting() {
    const h = new Date().getHours();
    const name = userEmail ? userEmail.split('@')[0] : '';
    if (h < 12) return `Buenos días, ${name} ☀️`;
    if (h < 18) return `Buenas tardes, ${name} 🌤️`;
    return `Buenas noches, ${name} 🌙`;
}

/** Fetch con token de autenticación */
async function apiFetch(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        ...options.headers
    };

    try {
        const res = await fetch(`${API}${endpoint}`, { ...options, headers });

        if (res.status === 401) {
            // Token expirado o inválido
            logout();
            return null;
        }

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || `Error ${res.status}`);
        }

        return await res.json();
    } catch (err) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            showToast('⚠️ No se puede conectar al servidor', true);
            return null;
        }
        throw err;
    }
}

/** Mostrar un toast de confirmación */
function showToast(message, isError = false) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    if (isError) toast.style.background = '#C07878';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// ===== AUTENTICACIÓN =====

function initAuth() {
    const tabs = document.querySelectorAll('.auth-tab');
    const submitBtn = document.getElementById('auth-submit');
    const emailInput = document.getElementById('auth-email');
    const passInput = document.getElementById('auth-password');
    const errorEl = document.getElementById('auth-error');

    // Cambiar entre login y registro
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            authMode = tab.dataset.tab;
            submitBtn.textContent = authMode === 'login' ? 'Iniciar sesión' : 'Crear cuenta';
            errorEl.textContent = '';
        });
    });

    // Submit
    submitBtn.addEventListener('click', handleAuth);
    passInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAuth();
    });

    async function handleAuth() {
        const email = emailInput.value.trim();
        const password = passInput.value;
        errorEl.textContent = '';

        if (!email || !password) {
            errorEl.textContent = 'Completa todos los campos';
            return;
        }
        if (password.length < 4) {
            errorEl.textContent = 'La contraseña debe tener al menos 4 caracteres';
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Cargando...';

        try {
            const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
            const data = await apiFetch(endpoint, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (data && data.token) {
                authToken = data.token;
                userEmail = data.email;
                localStorage.setItem('pc_token', authToken);
                localStorage.setItem('pc_email', userEmail);
                showApp();
            } else if (data) {
                errorEl.textContent = data.message || 'Error al autenticar';
            }
        } catch (err) {
            errorEl.textContent = err.message || 'Error de conexión';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = authMode === 'login' ? 'Iniciar sesión' : 'Crear cuenta';
        }
    }
}

function logout() {
    authToken = null;
    userEmail = null;
    localStorage.removeItem('pc_token');
    localStorage.removeItem('pc_email');
    document.getElementById('view-auth').classList.add('active');
    document.getElementById('app-main').style.display = 'none';
    document.getElementById('auth-email').value = '';
    document.getElementById('auth-password').value = '';
    document.getElementById('auth-error').textContent = '';
}

function showApp() {
    const authView = document.getElementById('view-auth');
    const appMain = document.getElementById('app-main');
    
    authView.classList.remove('active');
    authView.style.display = 'none';
    appMain.style.display = 'block';
    
    switchView('home');
    loadHomeData();
}

// ===== NAVEGACIÓN ENTRE VISTAS =====

function switchView(view) {
    currentView = view;

    // Ocultar todas las vistas
    document.querySelectorAll('#app-main > .view').forEach(v => v.classList.remove('active'));

    // Mostrar la vista seleccionada
    const viewEl = document.getElementById(`view-${view}`);
    if (viewEl) viewEl.classList.add('active');

    // Actualizar tabs
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.toggle('active', t.dataset.view === view);
    });

    // Cargar datos según la vista
    if (view === 'home') loadHomeData();
    if (view === 'stats') loadStats();
    if (view === 'history') loadHistory();
    if (view === 'invest') loadInvestments();
}

function initNavigation() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchView(tab.dataset.view));
    });

    document.getElementById('btn-logout').addEventListener('click', logout);
}

// ===== HOME =====

async function loadHomeData() {
    document.getElementById('greeting').textContent = getGreeting();

    const data = await apiFetch('/stats/home');
    if (!data) return;

    const spent = parseFloat(data.totalMonth) || 0;
    const budget = parseFloat(data.budget) || 500000;
    const remaining = parseFloat(data.remaining) || (budget - spent);
    const percent = parseFloat(data.budgetPercent) || 0;

    document.getElementById('home-spent').textContent = formatMoney(spent);
    document.getElementById('home-budget').textContent = formatMoney(budget);

    const remainEl = document.getElementById('home-remaining');
    remainEl.textContent = `Disponible: ${formatMoney(remaining)}`;
    remainEl.classList.toggle('negative', remaining < 0);

    // Barra de progreso
    const bar = document.getElementById('home-budget-bar');
    const clampedPercent = Math.min(percent, 100);
    bar.style.width = clampedPercent + '%';
    bar.classList.remove('warning', 'danger');
    if (percent >= 100) bar.classList.add('danger');
    else if (percent >= 80) bar.classList.add('warning');

    // Alertas
    showBudgetAlert(percent);

    // Últimos gastos
    renderRecentExpenses(data.recentExpenses || []);
}

function showBudgetAlert(percent) {
    const alertEl = document.getElementById('budget-alert');
    const iconEl = document.getElementById('budget-alert-icon');
    const textEl = document.getElementById('budget-alert-text');

    alertEl.classList.remove('warning', 'danger');

    if (percent >= 100) {
        alertEl.style.display = 'flex';
        alertEl.classList.add('danger');
        iconEl.textContent = '🚨';
        textEl.textContent = '¡Superaste tu presupuesto mensual!';
    } else if (percent >= 80) {
        alertEl.style.display = 'flex';
        alertEl.classList.add('warning');
        iconEl.textContent = '⚠️';
        textEl.textContent = `Has usado el ${Math.round(percent)}% de tu presupuesto`;
    } else {
        alertEl.style.display = 'none';
    }
}

function renderRecentExpenses(expenses) {
    const container = document.getElementById('home-recent');
    if (!expenses.length) {
        container.innerHTML = '<div class="empty-state">Aún no tienes gastos registrados</div>';
        return;
    }

    container.innerHTML = expenses.map(exp => `
        <div class="expense-item animate-in">
            <div class="expense-icon">${exp.categoryIcon || '📦'}</div>
            <div class="expense-info">
                <div class="expense-desc">${escapeHtml(exp.description)}</div>
                <div class="expense-meta">${exp.category} · ${formatDate(exp.createdAt)}</div>
            </div>
            <div class="expense-amount">-${formatMoney(exp.amount)}</div>
        </div>
    `).join('');
}

// ===== REGISTRO DE GASTOS =====

function initExpenseInput() {
    const input = document.getElementById('expense-input');
    const btn = document.getElementById('expense-submit');

    btn.addEventListener('click', submitExpense);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitExpense();
    });

    async function submitExpense() {
        const text = input.value.trim();
        if (!text) return;

        btn.disabled = true;
        try {
            const data = await apiFetch('/expenses', {
                method: 'POST',
                body: JSON.stringify({ text })
            });

            if (data) {
                input.value = '';
                showToast(`✅ ${data.categoryIcon} ${escapeHtml(data.description)} — ${formatMoney(data.amount)}`);
                loadHomeData(); // Refrescar datos
            }
        } catch (err) {
            showToast('❌ ' + (err.message || 'Error al registrar'), true);
        } finally {
            btn.disabled = false;
            input.focus();
        }
    }
}

// ===== ESTADÍSTICAS =====

async function loadStats() {
    const data = await apiFetch('/stats');
    if (!data) return;

    document.getElementById('stat-total').textContent = formatMoney(data.totalMonth);
    document.getElementById('stat-prev').textContent = formatMoney(data.totalPrevMonth);
    document.getElementById('stat-count').textContent = data.transactionCount;
    document.getElementById('stat-avg').textContent = formatMoney(data.averagePerDay);

    // Barras por categoría
    const container = document.getElementById('stats-bars');
    const cats = data.categories || [];

    if (!cats.length) {
        container.innerHTML = '<div class="empty-state">Sin datos aún</div>';
        return;
    }

    container.innerHTML = cats.map(cat => `
        <div class="cat-bar-item animate-in">
            <div class="cat-bar-header">
                <span class="cat-bar-name">${cat.icon} ${cat.category}</span>
                <span class="cat-bar-amount">${formatMoney(cat.total)}</span>
            </div>
            <div class="cat-bar-track">
                <div class="cat-bar-fill" style="width: ${Math.min(cat.percent, 100)}%"></div>
            </div>
        </div>
    `).join('');
}

// ===== HISTORIAL =====

function initHistory() {
    document.getElementById('history-filter').addEventListener('change', loadHistory);
}

async function loadHistory() {
    const category = document.getElementById('history-filter').value;
    const params = category && category !== 'Todas' ? `?category=${encodeURIComponent(category)}` : '';

    const data = await apiFetch(`/expenses${params}`);
    if (!data) return;

    const container = document.getElementById('history-list');

    if (!data.length) {
        container.innerHTML = '<div class="empty-state">No hay gastos este mes</div>';
        return;
    }

    container.innerHTML = data.map(exp => `
        <div class="expense-item animate-in" id="expense-${exp.id}">
            <div class="expense-icon">${exp.categoryIcon || '📦'}</div>
            <div class="expense-info">
                <div class="expense-desc">${escapeHtml(exp.description)}</div>
                <div class="expense-meta">${exp.category} · ${formatDate(exp.createdAt)}</div>
            </div>
            <div class="expense-amount">-${formatMoney(exp.amount)}</div>
            <button class="expense-delete" onclick="deleteExpense(${exp.id})" title="Eliminar">🗑️</button>
        </div>
    `).join('');
}

async function deleteExpense(id) {
    if (!confirm('¿Eliminar este gasto?')) return;

    try {
        await apiFetch(`/expenses/${id}`, { method: 'DELETE' });
        const el = document.getElementById(`expense-${id}`);
        if (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateX(50px)';
            el.style.transition = 'all 0.3s';
            setTimeout(() => {
                el.remove();
                // Si no quedan gastos, mostrar empty state
                const container = document.getElementById('history-list');
                if (!container.children.length) {
                    container.innerHTML = '<div class="empty-state">No hay gastos este mes</div>';
                }
            }, 300);
        }
        showToast('🗑️ Gasto eliminado');
    } catch (err) {
        showToast('❌ Error al eliminar', true);
    }
}

// ===== INVERSIONES =====

function switchProfile(profile) {
    document.querySelectorAll('.invest-profile-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.profile === profile);
    });
    document.querySelectorAll('.invest-profile-content').forEach(c => {
        c.classList.toggle('active', c.id === `profile-${profile}`);
    });
}

function initInvestments() {}

async function loadInvestments() {
    const data = await apiFetch('/stats/home');
    if (!data) return;
    const spent = parseFloat(data.totalMonth) || 0;
    const budget = parseFloat(data.budget) || 500000;
    const ahorro = Math.max(budget - spent, 0);
    const el = document.getElementById('invest-ai-text');
    if (el) {
        el.innerHTML = `Este mes gastaste <strong>$${Math.round(spent).toLocaleString('es-CO')}</strong>.<br>
        Tu ahorro disponible estimado es <span style="color:var(--positive)"><strong>$${Math.round(ahorro).toLocaleString('es-CO')}</strong></span>.<br><br>
        ${ahorro >= 200000
            ? `Con $${Math.round(ahorro).toLocaleString('es-CO')} podrías abrir un CDT o invertir en un fondo de renta fija.<br>Incluso pequeñas cantidades generan hábitos financieros sólidos.`
            : 'Intenta reducir gastos este mes para tener más disponible para invertir.'}`;
    }
}

// ===== UTILIDAD: Escapar HTML =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== INICIALIZACIÓN =====

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initNavigation();
    initExpenseInput();
    initHistory();
    initInvestments();

    // Si ya hay token guardado, intentar ir directo a la app
    if (authToken && userEmail) {
        showApp();
    }
});
