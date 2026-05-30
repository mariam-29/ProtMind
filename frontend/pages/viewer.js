let currentViewerInstance = null;

function renderViewer() {
    const p = window.activeProtein;
    if (!p) return `<div class="p-8 text-center text-on-surface">Please select a protein first.</div>`;

    const isAF = p.pdbIds.length === 0 || p.id.startsWith('AF');
    const plddtText = isAF ? "89.4 (Confident)" : "N/A (Experimental)";
    const algorithmText = isAF ? "AlphaFold v2.3" : "X-ray Crystallography";

    return `
    <div class="max-w-7xl mx-auto space-y-6 page-enter">
        <header>
            <h2 class="font-h2 text-h2 text-on-background">Protein Structure Analysis</h2>
            <p class="text-on-surface-variant mt-2 max-w-2xl">Visualizing predicted or experimental folding structures for ${p.name} (${p.id}).</p>
        </header>
        <!-- 3D Viewer Panel -->
        <div class="bg-on-background rounded-xl clinical-shadow-lg border border-outline/20 overflow-hidden flex flex-col lg:flex-row min-h-[500px]">
            <div class="flex-grow relative min-h-[400px] lg:min-h-[500px] flex flex-col bg-[#021016]">
                <!-- Loading Overlay -->
                <div id="viewer-loading" class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#021016]/90">
                    <div class="w-24 h-24 rounded-full border-4 border-surface-variant/10 border-t-primary-fixed-dim border-r-primary-fixed-dim/50 spin-slow mb-6"></div>
                    <div class="font-mono text-mono text-primary-fixed-dim tracking-widest uppercase">Initializing Canvas</div>
                    <div class="font-mono text-[11px] text-outline mt-2">Loading coordinates...</div>
                </div>
                <!-- Top Canvas Label -->
                <div class="absolute top-4 left-4 z-20 flex gap-2">
                    <div class="bg-inverse-surface/80 backdrop-blur-sm border border-outline/30 rounded-md px-3 py-1.5 flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-primary-fixed pulse-dot"></span>
                        <span id="viewer-label" class="font-mono text-[11px] text-on-primary">AF-${p.id}-F1</span>
                    </div>
                </div>
                <!-- Real Mol* Canvas Container -->
                <div id="my-viewer-container" style="position: relative; width: 100%; height: 500px;"></div>
            </div>
            <!-- Right Controls -->
            <div class="w-full lg:w-72 bg-inverse-surface border-t lg:border-t-0 lg:border-l border-outline/20 flex flex-col">
                <div class="p-5 border-b border-outline/20">
                    <h3 class="font-label text-label text-surface-variant uppercase tracking-wider mb-4">Confidence (pLDDT)</h3>
                    <ul class="space-y-3 font-mono text-mono text-on-tertiary-container">
                        <li class="flex items-center gap-3"><div class="w-4 h-4 rounded-sm shadow-inner" style="background:#005A94;"></div><span>Very High (&gt;90)</span></li>
                        <li class="flex items-center gap-3"><div class="w-4 h-4 rounded-sm shadow-inner" style="background:#66CCFF;"></div><span>Confident (70-90)</span></li>
                        <li class="flex items-center gap-3"><div class="w-4 h-4 rounded-sm shadow-inner" style="background:#FFFF00;"></div><span class="text-on-surface-variant">Low (50-70)</span></li>
                        <li class="flex items-center gap-3"><div class="w-4 h-4 rounded-sm shadow-inner" style="background:#FF9900;"></div><span>Very Low (&lt;50)</span></li>
                    </ul>
                </div>
                <div class="p-5 border-b border-outline/20">
                    <h3 class="font-label text-label text-surface-variant uppercase tracking-wider mb-4">Info Controls</h3>
                    <div class="grid grid-cols-1 gap-3">
                        <div class="p-3 rounded-lg border border-outline/30 bg-white/5 text-on-tertiary-container">
                            <span class="font-label text-xs block text-outline">PDB ID Associations</span>
                            <span class="font-mono text-sm block mt-1">${p.pdbIds && p.pdbIds.length > 0 ? p.pdbIds.join(', ') : 'None Found'}</span>
                        </div>
                    </div>
                </div>
                <div class="p-5 mt-auto flex flex-col gap-3">
                    <button onclick="initViewer()" class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-outline/40 hover:bg-white/10 text-on-primary transition-colors font-label text-label">
                        <span class="material-symbols-outlined text-[18px]">restart_alt</span> Reload Structure
                    </button>
                    <a href="${isAF ? `https://alphafold.ebi.ac.uk/files/AF-${p.id}-F1-model_v4.cif` : `https://files.rcsb.org/download/${p.pdbIds[0]}.cif`}" target="_blank" class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary hover:bg-surface-tint text-on-primary transition-colors font-label text-label shadow-sm text-center">
                        <span class="material-symbols-outlined text-[18px]">download</span> Download CIF
                    </a>
                </div>
            </div>
        </div>
        <!-- Metadata -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-surface-container-lowest p-5 rounded-xl clinical-shadow border border-surface-variant">
                <span class="font-label text-label text-on-surface-variant uppercase">Sequence Length</span>
                <p class="font-mono text-h3 text-on-background mt-2">${p.length} aa</p>
            </div>
            <div class="bg-surface-container-lowest p-5 rounded-xl clinical-shadow border border-surface-variant">
                <span class="font-label text-label text-on-surface-variant uppercase">Global pLDDT</span>
                <p class="font-mono text-h3 text-primary-container mt-2">${plddtText}</p>
            </div>
            <div class="bg-surface-container-lowest p-5 rounded-xl clinical-shadow border border-surface-variant">
                <span class="font-label text-label text-on-surface-variant uppercase">Algorithm</span>
                <p class="font-mono text-h3 text-on-background mt-2">${algorithmText}</p>
            </div>
        </div>
    </div>`;
}

// Instantiate Mol* canvas using CDN
async function initViewer() {
    const p = window.activeProtein;
    if (!p) return;

    const label = document.getElementById('viewer-label');
    const container = document.getElementById('my-viewer-container');
    if (!container) return;

    container.innerHTML = '';
    
    // Show loading
    const loading = document.getElementById('viewer-loading');
    if (loading) loading.style.display = 'flex';

    let structureUrl = p.structure ? p.structure.url : `https://alphafold.ebi.ac.uk/files/AF-${p.id}-F1-model_v4.cif`;
    const proxyUrl = `${API_URL}/api/structure/proxy?url=${encodeURIComponent(structureUrl)}`;
    if (label) label.innerText = p.structure ? p.structure.label : `AF-${p.id}-F1`;

    try {
        if (typeof molstar === 'undefined') {
            throw new Error("Molstar CDN not loaded yet");
        }

        // Initialize Molstar Viewer using container ID
        const viewer = await molstar.Viewer.create('my-viewer-container', {
            viewportShowExpand: false,
            layoutShowControls: false,
            layoutShowRemoteState: false,
            layoutShowSequence: true,
            layoutShowLog: false,
            layoutIsExpanded: false
        });

        currentViewerInstance = viewer;

        // Load structure
        await viewer.loadStructureFromUrl(proxyUrl, 'mmcif');

        if (loading) loading.style.display = 'none';

    } catch (err) {
        console.error("Mol* initialization failed:", err);
        container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center p-6 text-slate-300">
            <span class="material-symbols-outlined text-red-400 text-5xl mb-4">error</span>
            <p class="font-mono text-sm text-red-300">WebGL / Mol* Initialization Failed</p>
            <p class="text-xs text-red-400/80 mt-1 max-w-sm font-mono">${err.message}</p>
            <p class="text-xs text-slate-400 mt-2 max-w-sm">Make sure WebGL is enabled in your browser and hardware acceleration is active.</p>
        </div>`;
        if (loading) loading.style.display = 'none';
    }
}
