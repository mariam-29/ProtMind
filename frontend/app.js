/* ==================== ProtMind SPA Router ==================== */

const NAV_ITEMS = [
    { id: 'search',      icon: 'search',         label: 'Search' },
    { id: 'protein',     icon: 'science',        label: 'Protein Overview' },
    { id: 'viewer',      icon: 'view_in_ar',     label: '3D Viewer' },
    { id: 'predictions', icon: 'psychology',     label: 'AI Predictions' },
    { id: 'clinical',    icon: 'clinical_notes', label: 'Clinical' },
];

// Pages that use the full-screen layout (no sidebar)
const FULLSCREEN_PAGES = ['landing', 'login', 'signup'];
let currentPage = 'landing';

function navigate(page) {
    currentPage = page;
    window.location.hash = page;
    render();
    // Scroll to top on navigation
    window.scrollTo(0, 0);
}

function render() {
    const authContainer = document.getElementById('auth-container');
    const appShell = document.getElementById('app-shell');
    const pageContent = document.getElementById('page-content');

    if (FULLSCREEN_PAGES.includes(currentPage)) {
        // Full-screen pages: landing, login, signup — no sidebar
        appShell.classList.add('hidden');
        appShell.classList.remove('flex');
        authContainer.classList.remove('hidden');
        authContainer.className = 'min-h-screen';

        switch (currentPage) {
            case 'landing': authContainer.innerHTML = renderLanding(); break;
            case 'login':   authContainer.innerHTML = renderLogin(); break;
            case 'signup':  authContainer.innerHTML = renderSignup(); break;
        }
    } else {
        // App pages: with sidebar + topbar
        authContainer.classList.add('hidden');
        appShell.classList.remove('hidden');
        appShell.classList.add('flex');
        renderNav();
        
        switch (currentPage) {
            case 'search':      pageContent.innerHTML = renderSearch(); break;
            case 'protein':     pageContent.innerHTML = renderProtein(); break;
            case 'viewer':      pageContent.innerHTML = renderViewer(); setTimeout(initViewer, 100); break;
            case 'predictions': pageContent.innerHTML = renderPredictions(); break;
            case 'clinical':    pageContent.innerHTML = renderClinical(); break;
            default:            pageContent.innerHTML = renderSearch(); break;
        }
    }
}

function renderNav() {
    const container = document.getElementById('nav-links');
    if (!container) return;
    container.innerHTML = NAV_ITEMS.map(item => {
        const isActive = currentPage === item.id;
        const cls = isActive ? 'nav-link-active' : 'nav-link-inactive';
        return `
            <a href="#" onclick="navigate('${item.id}'); return false;" 
               class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 text-sm ${cls}">
                <span class="material-symbols-outlined"${isActive ? ' style="font-variation-settings:\'FILL\' 1;"' : ''}>${item.icon}</span>
                <span>${item.label}</span>
            </a>`;
    }).join('');
}

// Hash-based routing
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash) { currentPage = hash; render(); }
});

// Initial load — default to landing page
window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.slice(1);
    currentPage = hash || 'landing';
    render();
});
