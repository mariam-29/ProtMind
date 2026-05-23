function renderProtein() {
    const p = window.activeProtein;
    
    const goRows = p.goTerms && p.goTerms.length > 0 ? 
        p.goTerms.map(term => {
            const badge = { F: 'bg-inverse-surface', C: 'bg-tertiary', P: 'bg-outline' }[term.aspect] || 'bg-outline';
            return goRow(term.id, term.aspect, term.term, term.evidence, term.ref, badge);
        }).join('') : 
        `<tr><td colspan="5" class="p-8 text-center text-on-surface-variant">No GO annotations found for this protein.</td></tr>`;

    return `
    <div class="max-w-[1600px] w-full mx-auto space-y-6 page-enter">
        <div class="flex justify-between items-end">
            <div>
                <h1 class="font-h1 text-h1 text-on-surface">Protein Overview: ${p.id}</h1>
                <p class="font-body text-body text-on-surface-variant mt-2">${p.name}</p>
            </div>
            <div class="flex gap-3">
                <button onclick="downloadFASTA()" class="px-4 py-2 border border-primary text-primary font-label text-label rounded hover:bg-surface-container-high transition-colors duration-150 flex items-center gap-2">
                    <span class="material-symbols-outlined" style="font-size:18px;">download</span> Export FASTA
                </button>
                <button onclick="navigate('viewer')" class="px-4 py-2 bg-primary text-on-primary font-label text-label rounded hover:bg-on-primary-fixed-variant transition-colors duration-150 flex items-center gap-2">
                    <span class="material-symbols-outlined" style="font-size:18px;">view_in_ar</span> View 3D
                </button>
            </div>
        </div>
        <!-- Info Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-surface-container-lowest rounded-xl p-6 clinical-shadow flex flex-col gap-4 fade-in fade-in-delay-1">
                <div class="flex items-center gap-2 pb-3 border-b border-outline-variant/30"><span class="material-symbols-outlined text-primary">fingerprint</span><h3 class="font-h3 text-h3 text-on-surface">Identity</h3></div>
                <div class="grid grid-cols-2 gap-y-4 gap-x-2">
                    <div><span class="block font-label text-label text-on-surface-variant mb-1">Gene Name</span><span class="font-body text-body text-on-surface font-medium">${p.gene}</span></div>
                    <div><span class="block font-label text-label text-on-surface-variant mb-1">Organism</span><span class="font-body text-body text-on-surface">${p.organism}</span></div>
                    <div><span class="block font-label text-label text-on-surface-variant mb-1">Sequence Length</span><span class="font-mono text-mono text-on-surface">${p.length} AA</span></div>
                    <div><span class="block font-label text-label text-on-surface-variant mb-1">Mass (Da)</span><span class="font-mono text-mono text-on-surface">${p.mass.toLocaleString()}</span></div>
                </div>
            </div>
            <div class="bg-surface-container-lowest rounded-xl p-6 clinical-shadow flex flex-col gap-4 fade-in fade-in-delay-2">
                <div class="flex items-center gap-2 pb-3 border-b border-outline-variant/30"><span class="material-symbols-outlined text-primary">architecture</span><h3 class="font-h3 text-h3 text-on-surface">Secondary Structure</h3></div>
                <div class="flex flex-col gap-3 flex-1 justify-center">
                    ${progressBar('Alpha Helix', p.helixPct, 'bg-primary')}
                    ${progressBar('Beta Strand', p.strandPct, 'bg-secondary')}
                    ${progressBar('Turn / Coil', p.turnPct, 'bg-tertiary-fixed-dim')}
                </div>
            </div>
            <div class="bg-surface-container-lowest rounded-xl p-6 clinical-shadow flex flex-col gap-4 fade-in fade-in-delay-3">
                <div class="flex items-center gap-2 pb-3 border-b border-outline-variant/30"><span class="material-symbols-outlined text-primary">psychology</span><h3 class="font-h3 text-h3 text-on-surface">Function Overview</h3></div>
                <p class="font-body text-body text-on-surface-variant">${p.function}</p>
            </div>
        </div>
        <!-- Sequence Viewer -->
        <div class="bg-surface-container-lowest rounded-xl clinical-shadow flex flex-col overflow-hidden fade-in fade-in-delay-4">
            <div class="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-bright">
                <h3 class="font-h3 text-h3 text-on-surface">Amino Acid Sequence</h3>
            </div>
            <div class="p-6 overflow-x-auto bg-[#fafafa]">
                <div class="grid grid-cols-[60px_1fr] gap-y-3 whitespace-nowrap">
                    ${formatSequence(p.sequence)}
                </div>
            </div>
        </div>
        <!-- GO Annotations -->
        <div class="bg-surface-container-lowest rounded-xl clinical-shadow flex flex-col overflow-hidden">
            <div class="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center">
                <h3 class="font-h3 text-h3 text-on-surface">Gene Ontology (GO) Annotations</h3>
                <button onclick="navigate('predictions')" class="text-primary hover:text-primary-fixed-dim font-label text-label flex items-center gap-1 transition-colors">Run AI Prediction <span class="material-symbols-outlined" style="font-size:16px;">arrow_forward</span></button>
            </div>
            <div class="w-full overflow-x-auto">
                <table class="w-full text-left border-collapse min-w-[800px]">
                    <thead><tr class="bg-surface-container-high border-b border-outline-variant">
                        <th class="p-4 font-label text-label text-on-surface w-[15%]">GO ID</th>
                        <th class="p-4 font-label text-label text-on-surface w-[10%]">Aspect</th>
                        <th class="p-4 font-label text-label text-on-surface w-[45%]">Term Name</th>
                        <th class="p-4 font-label text-label text-on-surface w-[15%]">Evidence</th>
                        <th class="p-4 font-label text-label text-on-surface w-[15%]">Reference</th>
                    </tr></thead>
                    <tbody class="font-body text-body text-on-surface">
                        ${goRows}
                    </tbody>
                </table>
            </div>
        </div>
    </div>`;
}

function progressBar(label, pct, color) {
    return `<div><div class="flex justify-between font-label text-label mb-1"><span class="text-on-surface-variant">${label}</span><span class="text-on-surface font-mono">${pct}%</span></div><div class="w-full h-2 bg-surface-container rounded-full overflow-hidden"><div class="h-full ${color} progress-animate" style="width:${pct}%;"></div></div></div>`;
}

function goRow(id,aspect,term,evidence,ref,badge) {
    const labels = {F:'Molecular Function',C:'Cellular Component',P:'Biological Process'};
    return `<tr class="odd:bg-surface-container-lowest even:bg-surface-container-low border-b border-outline-variant/20 hover:bg-surface-variant/30 transition-colors">
        <td class="p-4 font-mono text-mono text-primary"><a href="https://amigo.geneontology.org/amigo/term/${id}" target="_blank" class="hover:underline">${id}</a></td>
        <td class="p-4"><span class="w-6 h-6 rounded flex items-center justify-center ${badge} text-on-primary font-label text-xs" title="${labels[aspect]}">${aspect}</span></td>
        <td class="p-4">${term}</td>
        <td class="p-4"><span class="bg-secondary-container text-on-secondary-container px-2 py-1 rounded-[4px] font-label text-[11px] uppercase tracking-wider">${evidence}</span></td>
        <td class="p-4 text-on-surface-variant font-mono text-xs">${ref}</td>
    </tr>`;
}

function formatSequence(seq) {
    if (!seq) return '';
    let result = '';
    const lineLen = 60; // 60 residues per line
    for (let i = 0; i < seq.length; i += lineLen) {
        const lineNum = i + 1;
        const sub = seq.substring(i, i + lineLen);
        let subBlocks = [];
        for (let j = 0; j < sub.length; j += 10) {
            subBlocks.push(sub.substring(j, j + 10));
        }
        result += `
        <div class="text-on-surface-variant text-right pr-4 border-r border-outline-variant select-none font-mono text-mono text-sm">${lineNum}</div>
        <div class="text-on-surface tracking-[0.2em] font-mono text-mono text-sm pl-4">
            ${subBlocks.map(b => `<span class="px-0.5 rounded-sm">${b}</span>`).join(' ')}
        </div>`;
    }
    return result;
}

function downloadFASTA() {
    const p = window.activeProtein;
    if (!p) return;
    
    // Create FASTA string format
    const fasta = `>${p.id} | ${p.name} | ${p.organism}\n${p.sequence.match(/.{1,60}/g).join('\n')}\n`;
    
    // Trigger download
    const blob = new Blob([fasta], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${p.id}.fasta`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
