function renderSearch() {
    return `
    <div class="flex-1 flex flex-col items-center justify-center py-16 w-full max-w-4xl mx-auto page-enter molecule-pattern" style="min-height:calc(100vh - 56px)">
        <div class="text-center mb-10 w-full fade-in">
            <h1 class="font-h1 text-h1 text-on-background mb-4">Explore the Proteome</h1>
            <p class="font-body text-body text-outline max-w-2xl mx-auto">Precision informatics for deep genomic and proteomic metadata analysis.</p>
        </div>
        <div class="w-full max-w-3xl relative mb-6 fade-in fade-in-delay-1">
            <div class="relative flex items-center w-full bg-surface-container-lowest rounded-xl clinical-shadow border border-outline-variant p-2">
                <span class="material-symbols-outlined text-outline ml-3 mr-2">search</span>
                <input id="search-input" autocomplete="off" class="flex-1 bg-transparent border-none focus:ring-0 font-mono text-body text-on-surface py-3 px-2 outline-none" placeholder="Enter UniProt ID, PDB ID, or Gene Name" type="text" onkeydown="if(event.key==='Enter'){doSearch()}"/>
                <button onclick="doSearch()" class="bg-primary text-on-primary font-label text-label px-6 py-3 rounded-lg hover:bg-primary-container transition-colors ml-2 shadow-sm">Search</button>
            </div>
        </div>
        <div class="flex items-center gap-3 flex-wrap justify-center mb-16 fade-in fade-in-delay-2">
            <span class="font-label text-label text-outline mr-2">Try:</span>
            <button onclick="quickSearch('P01308')" class="bg-surface-container text-on-surface-variant font-mono text-mono px-3 py-1.5 rounded-full border border-outline-variant hover:bg-surface-variant transition-colors">P01308</button>
            <button onclick="quickSearch('1TRZ')" class="bg-surface-container text-on-surface-variant font-mono text-mono px-3 py-1.5 rounded-full border border-outline-variant hover:bg-surface-variant transition-colors">1TRZ</button>
            <button onclick="quickSearch('TP53')" class="bg-surface-container text-on-surface-variant font-mono text-mono px-3 py-1.5 rounded-full border border-outline-variant hover:bg-surface-variant transition-colors">TP53</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full fade-in fade-in-delay-3">
            <div class="bg-surface-container-lowest rounded-xl clinical-shadow p-6 flex flex-col items-start border border-outline-variant/30 hover:border-primary/30 transition-colors card-hover">
                <div class="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-4"><span class="material-symbols-outlined">database</span></div>
                <h3 class="font-h3 text-h3 text-on-surface mb-2">Data Retrieval</h3>
                <p class="font-body text-body text-on-surface-variant text-sm">Access deep genomic and proteomic metadata from integrated clinical databases with unified API access.</p>
            </div>
            <div class="bg-surface-container-lowest rounded-xl clinical-shadow p-6 flex flex-col items-start border border-outline-variant/30 hover:border-primary/30 transition-colors card-hover">
                <div class="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-4"><span class="material-symbols-outlined">view_in_ar</span></div>
                <h3 class="font-h3 text-h3 text-on-surface mb-2">3D Visualization</h3>
                <p class="font-body text-body text-on-surface-variant text-sm">Interactive Mol* powered protein structure viewer with custom residue highlighting and alignment tools.</p>
            </div>
            <div class="bg-surface-container-lowest rounded-xl clinical-shadow p-6 flex flex-col items-start border border-outline-variant/30 hover:border-primary/30 transition-colors card-hover">
                <div class="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-4"><span class="material-symbols-outlined">auto_awesome</span></div>
                <h3 class="font-h3 text-h3 text-on-surface mb-2">AI Prediction</h3>
                <p class="font-body text-body text-on-surface-variant text-sm">ESM-2 driven function and mutation effect modeling for uncharacterized sequences and variants.</p>
            </div>
        </div>
    </div>`;
}

function doSearch() {
    const v = document.getElementById('search-input')?.value?.trim();
    if (v) navigate('protein');
}
function quickSearch(id) {
    const inp = document.getElementById('search-input');
    if (inp) inp.value = id;
    navigate('protein');
}
