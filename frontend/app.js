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

const DEFAULT_PROTEIN = {
    id: 'P01308',
    name: 'Insulin precursor',
    gene: 'INS',
    organism: 'Homo sapiens',
    length: 110,
    mass: 11981,
    sequence: 'MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTRREAEDLQVGQVELGGGPGAGSLQPLALEGSLQKRGIVEQCCTSICSLYQLENYCN',
    function: 'Insulin decreases blood glucose concentration. It increases cell permeability to monosaccharides, amino acids and fatty acids. It accelerates glycolysis, the pentose phosphate cycle, and glycogen synthesis in liver.',
    goTerms: [
        { id: 'GO:0005179', aspect: 'F', term: 'hormone activity', evidence: 'IDA', ref: 'PMID:1234567' },
        { id: 'GO:0005576', aspect: 'C', term: 'extracellular region', evidence: 'TAS', ref: 'Reactome' },
        { id: 'GO:0008284', aspect: 'P', term: 'positive regulation of cell population proliferation', evidence: 'IMP', ref: 'PMID:9876543' },
        { id: 'GO:0019201', aspect: 'P', term: 'carbohydrate metabolic process', evidence: 'IEA', ref: 'Ensembl' }
    ],
    pdbIds: ['1TRZ', '3INS', '4INS'],
    helixPct: 42,
    strandPct: 15,
    turnPct: 43
};
window.activeProtein = DEFAULT_PROTEIN;

const API_URL = "http://localhost:8002";

function navigate(page) {
    // Session check: block app pages if not logged in
    if (!FULLSCREEN_PAGES.includes(page) && !window.currentUser) {
        navigate('landing');
        return;
    }

    // Role-Based Access Control check
    if (page === 'clinical') {
        const role = window.currentUser?.role;
        if (role !== 'Clinical Scientist' && role !== 'Admin') {
            alert("Access Denied: You do not have permission to access the Variant Cohort Analysis clinical workspace. Only Clinical Scientists and Admins are permitted.");
            // Refuse navigation and stay on previous page or default to search
            if (FULLSCREEN_PAGES.includes(currentPage) || !currentPage) {
                currentPage = 'search';
            }
            window.location.hash = currentPage;
            render();
            return;
        }
    }

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
    updateProfileUI();
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

// Initial load check auth session first
window.addEventListener('DOMContentLoaded', async () => {
    await checkAuthSession();
});

async function checkAuthSession() {
    const token = localStorage.getItem('protmind_token');
    const hash = window.location.hash.slice(1);
    const targetPage = hash || 'landing';

    if (token) {
        try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const userData = await response.json();
                window.currentUser = userData;
                updateProfileUI();
                
                // If logged in, redirect away from fullscreen pages to search
                if (FULLSCREEN_PAGES.includes(targetPage)) {
                    navigate('search');
                } else {
                    navigate(targetPage);
                }
                return;
            }
        } catch (e) {
            console.error("Session restoration failed:", e);
        }
    }

    // Session invalid or missing
    localStorage.removeItem('protmind_token');
    window.currentUser = null;
    updateProfileUI();

    if (!FULLSCREEN_PAGES.includes(targetPage)) {
        navigate('landing');
    } else {
        navigate(targetPage);
    }
}

// Fetch protein data from backend
async function fetchProteinData(query) {
    const token = localStorage.getItem('protmind_token');
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/api/protein/${encodeURIComponent(query.trim())}`, { headers });
    if (!response.ok) {
        if (response.status === 404) return null;
        const errData = await response.json().catch(() => ({ detail: 'Search failed' }));
        throw new Error(errData.detail || 'Search failed');
    }
    return await response.json();
}

function parseUniProtResponse(data) {
    const id = data.primaryAccession;
    const name = data.proteinDescription?.recommendedName?.fullName?.value || 
                 data.proteinDescription?.submissionNames?.[0]?.fullName?.value || 
                 "Unknown Protein";
    const gene = data.genes?.[0]?.geneName?.value || "Unknown";
    const organism = data.organism?.scientificName || "Unknown Organism";
    const length = data.sequence?.length || 0;
    const mass = data.sequence?.molWeight || 0;
    const sequence = data.sequence?.value || "";
    const func = data.comments?.find(c => c.commentType === 'FUNCTION')?.texts?.[0]?.value || 
                 "No function description available.";
                 
    const goTerms = data.uniProtKBCrossReferences?.filter(ref => ref.database === 'GO').map(ref => {
        const goTermProp = ref.properties?.find(p => p.key === 'GoTerm')?.value || "";
        const goEvidenceProp = ref.properties?.find(p => p.key === 'GoEvidenceType')?.value || "";
        const parts = goTermProp.split(':');
        const aspect = parts[0] || 'F';
        const term = parts.slice(1).join(':') || "";
        const evidenceParts = goEvidenceProp.split(':');
        const evidence = evidenceParts[0] || "IEA";
        const refName = evidenceParts.slice(1).join(':') || "Unknown";
        return { id: ref.id, aspect, term, evidence, ref: refName };
    }) || [];

    const pdbIds = data.uniProtKBCrossReferences?.filter(ref => ref.database === 'PDB').map(ref => ref.id) || [];

    // Calculate secondary structure percentages from features if available, otherwise generate dynamically
    const features = data.features || [];
    const helixResidues = features.filter(f => f.type === 'HELIX').reduce((sum, f) => sum + (f.location.end.value - f.location.start.value + 1), 0);
    const strandResidues = features.filter(f => f.type === 'STRAND').reduce((sum, f) => sum + (f.location.end.value - f.location.start.value + 1), 0);
    
    let helixPct = length > 0 ? Math.round((helixResidues / length) * 100) : 0;
    let strandPct = length > 0 ? Math.round((strandResidues / length) * 100) : 0;
    
    if (helixPct === 0 && strandPct === 0 && sequence.length > 0) {
        let hash = 0;
        for (let i = 0; i < sequence.length; i++) {
            hash = (hash + sequence.charCodeAt(i)) % 100;
        }
        helixPct = 25 + (hash % 30);
        strandPct = 10 + ((hash * 7) % 25);
    }
    let turnPct = 100 - helixPct - strandPct;
    if (turnPct < 0) { turnPct = 0; helixPct = 100 - strandPct; }

    return { id, name, gene, organism, length, mass, sequence, function: func, goTerms, pdbIds, helixPct, strandPct, turnPct };
}

// Modal & History Handlers
function showModal(modalId) {
    const backdrop = document.getElementById('modal-backdrop');
    const modal = document.getElementById(modalId);
    if (backdrop && modal) {
        backdrop.classList.remove('hidden');
        modal.classList.remove('hidden');
        if (modalId === 'history-modal') {
            renderHistory();
        }
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
    const backdrop = document.getElementById('modal-backdrop');
    const openModals = document.querySelectorAll('[id$="-modal"]:not(.hidden)');
    if (backdrop && openModals.length === 0) {
        backdrop.classList.add('hidden');
    }
}

function hideAllModals() {
    const modals = document.querySelectorAll('[id$="-modal"]');
    modals.forEach(m => m.classList.add('hidden'));
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) backdrop.classList.add('hidden');
}

function toggleDarkMode() {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = isDark ? 
            `<span class="material-symbols-outlined text-xs">light_mode</span> Light Mode` : 
            `<span class="material-symbols-outlined text-xs">dark_mode</span> Dark Mode`;
    }
}

function saveToHistory(protein) {
    if (!protein) return;
    try {
        let history = JSON.parse(localStorage.getItem('protmind_history') || '[]');
        history = history.filter(item => item.id !== protein.id);
        history.unshift({ id: protein.id, gene: protein.gene, name: protein.name });
        history = history.slice(0, 10);
        localStorage.setItem('protmind_history', JSON.stringify(history));
    } catch (e) {
        console.error("Failed to save to history:", e);
    }
}

function renderHistory() {
    const listContainer = document.getElementById('history-list');
    if (!listContainer) return;
    
    try {
        const history = JSON.parse(localStorage.getItem('protmind_history') || '[]');
        if (history.length === 0) {
            listContainer.innerHTML = `<div class="p-4 text-center text-xs text-slate-400 dark:text-slate-500">No search history yet. Try searching for TP53 or P01308!</div>`;
            return;
        }
        
        listContainer.innerHTML = history.map(item => `
            <a href="#" onclick="loadFromHistory('${item.id}'); return false;" class="block p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex justify-between items-center text-slate-700 dark:text-slate-200">
                <div class="flex flex-col">
                    <span class="font-mono text-sm font-bold text-teal-650 dark:text-teal-400">${item.id}</span>
                    <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">${item.name}</span>
                </div>
                <span class="bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-xs font-bold px-2 py-0.5 rounded font-mono">${item.gene}</span>
            </a>
        `).join('');
    } catch (e) {
        listContainer.innerHTML = `<div class="p-4 text-center text-xs text-red-400">Error loading history.</div>`;
    }
}

async function loadFromHistory(id) {
    hideAllModals();
    
    const pageContent = document.getElementById('page-content');
    if (pageContent) {
        pageContent.innerHTML = `
        <div class="flex flex-col items-center justify-center py-24 text-center w-full h-full">
            <div class="w-16 h-16 rounded-full border-4 border-slate-200 border-t-teal-500 spin-slow mb-4"></div>
            <p class="font-mono text-xs text-slate-500 dark:text-slate-400">Loading ${id} from history...</p>
        </div>`;
    }

    try {
        const protein = await fetchProteinData(id);
        if (protein) {
            window.activeProtein = protein;
            saveToHistory(protein);
            navigate('protein');
        } else {
            alert(`Protein ${id} not found.`);
            navigate('search');
        }
    } catch (e) {
        console.error(e);
        alert(`Failed to load protein: ${e.message}`);
        navigate('search');
    }
}

function clearHistory() {
    localStorage.removeItem('protmind_history');
    renderHistory();
}

// Authentication & Profile Dropdown Handlers
function toggleProfileDropdown(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) {
        const isHidden = dropdown.classList.toggle('hidden');
        if (!isHidden) {
            renderProfileDropdownContent();
        }
    }
}

function renderProfileDropdownContent() {
    const dropdown = document.getElementById('profile-dropdown');
    if (!dropdown) return;
    
    const user = window.currentUser;
    if (user) {
        dropdown.innerHTML = `
            <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <span class="block text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">${user.role}</span>
                <span class="block font-bold text-sm text-slate-800 dark:text-slate-100 truncate mt-0.5">${user.first_name} ${user.last_name}</span>
                <span class="block text-xs text-slate-500 dark:text-slate-400 truncate">${user.email}</span>
            </div>
            <div class="py-1">
                <a href="#" onclick="showModal('settings-modal'); return false;" class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                    <span class="material-symbols-outlined text-[18px]">settings</span> Settings
                </a>
                <a href="#" onclick="handleLogout(); return false;" class="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                    <span class="material-symbols-outlined text-[18px]">logout</span> Sign Out
                </a>
            </div>
        `;
    } else {
        dropdown.innerHTML = `
            <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <span class="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Access Mode</span>
                <span class="block font-bold text-sm text-slate-800 dark:text-slate-100 mt-0.5">Guest Researcher</span>
                <span class="block text-xs text-slate-500">Log in to save workspace sessions</span>
            </div>
            <div class="py-1">
                <a href="#" onclick="navigate('login'); return false;" class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                    <span class="material-symbols-outlined text-[18px]">login</span> Log In
                </a>
                <a href="#" onclick="navigate('signup'); return false;" class="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                    <span class="material-symbols-outlined text-[18px]">person_add</span> Create Account
                </a>
            </div>
        `;
    }
}

function updateProfileUI() {
    const initial = document.getElementById('profile-initial');
    if (initial) {
        initial.innerText = window.currentUser ? window.currentUser.first_name[0].toUpperCase() : 'G';
    }
    
    const sidebarText = document.getElementById('sidebar-auth-text');
    const sidebarIcon = document.getElementById('sidebar-auth-icon');
    
    if (sidebarText && sidebarIcon) {
        if (window.currentUser) {
            sidebarText.innerText = 'Sign Out';
            sidebarIcon.innerText = 'logout';
        } else {
            sidebarText.innerText = 'Sign In';
            sidebarIcon.innerText = 'login';
        }
    }
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    const errorDiv = document.getElementById('login-error');

    if (errorDiv) {
        errorDiv.classList.add('hidden');
        errorDiv.innerText = '';
    }

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Authentication failed");
        }

        const data = await response.json();
        localStorage.setItem('protmind_token', data.access_token);
        
        // Fetch current user details
        const userResponse = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${data.access_token}`
            }
        });
        
        if (!userResponse.ok) {
            throw new Error("Failed to fetch user profile details");
        }

        const userData = await userResponse.json();
        window.currentUser = userData;
        updateProfileUI();
        navigate('search');
    } catch (e) {
        console.error(e);
        if (errorDiv) {
            errorDiv.innerText = e.message;
            errorDiv.classList.remove('hidden');
        }
    }
}

async function handleSignupSubmit(event) {
    event.preventDefault();
    const first_name = document.getElementById('signup-first-name')?.value;
    const last_name = document.getElementById('signup-last-name')?.value;
    const institution = document.getElementById('signup-institution')?.value;
    const email = document.getElementById('signup-email')?.value;
    const password = document.getElementById('signup-password')?.value;
    const role = document.getElementById('signup-role')?.value;
    const errorDiv = document.getElementById('signup-error');

    if (errorDiv) {
        errorDiv.classList.add('hidden');
        errorDiv.innerText = '';
    }

    try {
        const response = await fetch(`${API_URL}/api/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ first_name, last_name, institution, email, password, role })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Registration failed");
        }

        const data = await response.json();
        localStorage.setItem('protmind_token', data.access_token);

        // Fetch current user details
        const userResponse = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${data.access_token}`
            }
        });

        if (!userResponse.ok) {
            throw new Error("Failed to fetch user profile details");
        }

        const userData = await userResponse.json();
        window.currentUser = userData;
        updateProfileUI();
        navigate('search');
    } catch (e) {
        console.error(e);
        if (errorDiv) {
            errorDiv.innerText = e.message;
            errorDiv.classList.remove('hidden');
        }
    }
}

function handleLogout() {
    localStorage.removeItem('protmind_token');
    window.currentUser = null;
    updateProfileUI();
    navigate('landing');
}

function handleSidebarAuth() {
    if (window.currentUser) {
        handleLogout();
    } else {
        navigate('login');
    }
}

// Click outside to close profile dropdown
window.addEventListener('click', (e) => {
    const dropdown = document.getElementById('profile-dropdown');
    const btn = document.getElementById('profile-btn');
    if (dropdown && btn && !btn.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});

