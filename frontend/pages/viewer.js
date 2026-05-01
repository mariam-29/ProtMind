function renderViewer() {
    return `
    <div class="max-w-7xl mx-auto space-y-6 page-enter">
        <header>
            <h2 class="font-h2 text-h2 text-on-background">Protein Structure Analysis</h2>
            <p class="text-on-surface-variant mt-2 max-w-2xl">Visualizing predicted folding sequences for Target Alpha-7 using the Mol* embedded viewer.</p>
        </header>
        <!-- 3D Viewer Panel -->
        <div class="bg-on-background rounded-xl clinical-shadow-lg border border-outline/20 overflow-hidden flex flex-col lg:flex-row min-h-[500px]">
            <div class="flex-grow relative viewer-canvas min-h-[400px] lg:min-h-[500px] flex flex-col">
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
                        <span class="font-mono text-[11px] text-on-primary">AF-P01308-F1</span>
                    </div>
                </div>
                <!-- Simulated 3D content (appears after loading) -->
                <div id="viewer-content" class="absolute inset-0 z-5 hidden flex-col items-center justify-center">
                    <div class="text-center">
                        <span class="material-symbols-outlined text-6xl text-primary-fixed-dim mb-4 block" style="font-variation-settings:'FILL' 1;">view_in_ar</span>
                        <p class="font-mono text-mono text-primary-fixed-dim">Mol* Viewer Active</p>
                        <p class="font-mono text-[11px] text-outline mt-1">Insulin Structure — AF-P01308-F1</p>
                    </div>
                </div>
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
                    <h3 class="font-label text-label text-surface-variant uppercase tracking-wider mb-4">View Controls</h3>
                    <div class="grid grid-cols-2 gap-3">
                        <button class="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-outline/30 hover:bg-white/5 text-on-tertiary-container transition-colors">
                            <span class="material-symbols-outlined text-[20px]">palette</span><span class="font-label text-[11px]">Color Scheme</span>
                        </button>
                        <button class="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-outline/30 hover:bg-white/5 text-on-tertiary-container transition-colors">
                            <span class="material-symbols-outlined text-[20px]">360</span><span class="font-label text-[11px]">Auto-Rotate</span>
                        </button>
                    </div>
                </div>
                <div class="p-5 mt-auto flex flex-col gap-3">
                    <button class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-outline/40 hover:bg-white/10 text-on-primary transition-colors font-label text-label">
                        <span class="material-symbols-outlined text-[18px]">restart_alt</span> Reset View
                    </button>
                    <button class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary hover:bg-surface-tint text-on-primary transition-colors font-label text-label shadow-sm">
                        <span class="material-symbols-outlined text-[18px]">download</span> Export PDB
                    </button>
                </div>
            </div>
        </div>
        <!-- Metadata -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-surface-container-lowest p-5 rounded-xl clinical-shadow border border-surface-variant">
                <span class="font-label text-label text-on-surface-variant uppercase">Sequence Length</span>
                <p class="font-mono text-h3 text-on-background mt-2">110 aa</p>
            </div>
            <div class="bg-surface-container-lowest p-5 rounded-xl clinical-shadow border border-surface-variant">
                <span class="font-label text-label text-on-surface-variant uppercase">Global pLDDT</span>
                <p class="font-mono text-h3 text-primary-container mt-2">92.15</p>
            </div>
            <div class="bg-surface-container-lowest p-5 rounded-xl clinical-shadow border border-surface-variant">
                <span class="font-label text-label text-on-surface-variant uppercase">Algorithm</span>
                <p class="font-mono text-h3 text-on-background mt-2">AlphaFold v2.3</p>
            </div>
        </div>
    </div>`;
}
// Simulate loading
function initViewer() {
    setTimeout(() => {
        const loading = document.getElementById('viewer-loading');
        const content = document.getElementById('viewer-content');
        if (loading) loading.style.display = 'none';
        if (content) { content.classList.remove('hidden'); content.classList.add('flex'); }
    }, 2000);
}
