function renderPredictions() {
    const residues = 'MAVRLTP GSWFYKDEVIL QA'.replace(/ /g,'').split('');
    const heatColors = ['surface-container-high','surface-container-high','surface-container-high','secondary-fixed-dim','secondary-container','secondary-container','primary-fixed','primary-fixed-dim','tertiary-fixed','error-container/40','error-container/60','error-container','error/20','error-container','error-container/60','secondary-fixed-dim','surface-container-high','surface-container-high','surface-container-high','surface-container-high'];
    const hotSpots = [10,11,12,13,14];
    let heatmap = residues.map((r,i) => {
        const isHot = hotSpots.includes(i);
        const bold = isHot ? 'font-bold border border-error/20':'';
        return `<div class="flex-1 bg-${heatColors[i]} h-6 rounded-sm flex items-center justify-center text-mono font-mono text-[10px] text-on-surface sequence-cell ${bold}">${r}</div>`;
    }).join('');

    return `
    <div class="space-y-6 page-enter">
        <div class="mb-4 flex justify-between items-end">
            <div><h2 class="font-h1 text-h1 text-on-background mb-1">AI Prediction Dashboard</h2><p class="font-body text-body text-on-surface-variant">Protein sequence PK_4912 structural and functional analysis.</p></div>
            <button class="bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label text-label px-4 py-2 rounded flex items-center gap-2 transition-colors"><span class="material-symbols-outlined text-[18px]">download</span> Export Report</button>
        </div>
        <div class="grid grid-cols-12 gap-4">
            <!-- Function Prediction -->
            <div class="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-6 clinical-shadow border border-outline-variant/30 flex flex-col fade-in fade-in-delay-1">
                <div class="flex justify-between items-center mb-6"><h3 class="font-h3 text-h3 text-on-surface">Function Prediction</h3><span class="bg-surface-variant text-on-surface-variant font-label text-label px-2 py-1 rounded">Model: DeepFunc v2.4</span></div>
                <div class="flex-1 flex flex-col gap-4 justify-center">
                    ${predBar('Kinase Activity','94.2','primary')}
                    ${predBar('ATP Binding','88.7','primary-container')}
                    ${predBar('Nucleotide Binding','65.1','tertiary')}
                    ${predBar('Metal Ion Binding','12.4','outline-variant')}
                </div>
            </div>
            <!-- Interaction Gauge -->
            <div class="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl p-6 clinical-shadow border border-outline-variant/30 flex flex-col items-center justify-center text-center relative overflow-hidden fade-in fade-in-delay-2">
                <div class="absolute -right-8 -top-8 w-32 h-32 bg-secondary-container/20 rounded-full blur-2xl pointer-events-none"></div>
                <h3 class="font-h3 text-h3 text-on-surface w-full text-left mb-6">Interaction Propensity</h3>
                <div class="relative w-40 h-40 flex items-center justify-center">
                    <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle class="circular-progress-track" cx="50" cy="50" r="40" stroke-width="8"></circle>
                        <circle class="circular-progress-bar" cx="50" cy="50" r="40" stroke-width="8" stroke-dasharray="251.2" stroke-dashoffset="62.8"></circle>
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span class="font-h1 text-h1 text-on-surface leading-none">75<span class="text-body font-body">%</span></span>
                        <span class="font-label text-label text-on-surface-variant mt-1">High</span>
                    </div>
                </div>
                <p class="font-body text-body text-on-surface-variant mt-4">Predicted binding interface at residues 142-158.</p>
            </div>
            <!-- Residue Attribution -->
            <div class="col-span-12 bg-surface-container-lowest rounded-xl p-6 clinical-shadow border border-outline-variant/30 overflow-x-auto fade-in fade-in-delay-3">
                <div class="flex justify-between items-center mb-4 min-w-[600px]">
                    <h3 class="font-h3 text-h3 text-on-surface">Residue Attribution</h3>
                    <div class="flex items-center gap-2 font-label text-label text-on-surface-variant"><span>Low</span><div class="w-24 h-2 rounded bg-gradient-to-r from-surface-container-high via-secondary-container to-error-container"></div><span>High</span></div>
                </div>
                <div class="flex flex-col gap-1 min-w-[800px]">
                    <div class="flex text-mono font-mono text-[10px] text-outline mb-1"><span class="w-8">Pos</span><div class="flex-1 flex justify-between px-1"><span>10</span><span>20</span><span>30</span><span>40</span><span>50</span></div></div>
                    <div class="flex gap-[2px]"><span class="w-8 text-mono font-mono text-outline-variant text-[11px] pt-1">Seq</span><div class="flex-1 flex gap-[2px]">${heatmap}</div></div>
                </div>
            </div>
            <!-- Mutation Effect -->
            <div class="col-span-12 lg:col-span-6 bg-surface-container-lowest rounded-xl p-6 clinical-shadow border border-outline-variant/30">
                <div class="flex justify-between items-start mb-6"><div><h3 class="font-h3 text-h3 text-on-surface mb-1">In Silico Mutagenesis</h3><p class="font-body text-body text-on-surface-variant text-sm">Assess specific variant impact.</p></div><span class="material-symbols-outlined text-outline">science</span></div>
                <form class="space-y-4">
                    <div class="grid grid-cols-3 gap-4">
                        <div><label class="block font-label text-label text-on-surface-variant mb-1">Wild Type</label><input class="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-3 py-2 text-mono font-mono text-center" readonly value="Y"/></div>
                        <div><label class="block font-label text-label text-on-surface-variant mb-1">Position</label><input class="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-3 py-2 text-mono font-mono text-center" readonly type="number" value="12"/></div>
                        <div><label class="block font-label text-label text-on-surface-variant mb-1">Mutant</label><select class="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-3 py-2 text-mono font-mono text-center"><option>A</option><option>C</option><option>D</option><option selected>F</option><option>G</option></select></div>
                    </div>
                    <div class="pt-4 border-t border-surface-variant flex items-center justify-between">
                        <div class="flex flex-col"><span class="font-label text-label text-on-surface-variant">Predicted Effect</span><div class="flex items-center gap-2 mt-1"><div class="bg-error-container text-on-error-container px-3 py-1 rounded flex items-center gap-1.5 border border-error/20"><span class="material-symbols-outlined text-[16px] fill-icon">warning</span><span class="font-label text-label font-bold tracking-wide">PATHOGENIC</span></div><span class="font-mono text-mono text-outline">ΔΔG: +2.4 kcal/mol</span></div></div>
                        <button type="button" class="border border-primary text-primary hover:bg-surface-container font-label text-label px-4 py-2 rounded transition-colors">Recalculate</button>
                    </div>
                </form>
            </div>
            <!-- Structural Context -->
            <div class="col-span-12 lg:col-span-6 bg-surface-container-lowest rounded-xl p-6 clinical-shadow border border-outline-variant/30 flex flex-col">
                <h3 class="font-h3 text-h3 text-on-surface mb-4">Structural Context</h3>
                <div class="flex-1 bg-surface-container rounded-lg border border-outline-variant/50 flex items-center justify-center relative overflow-hidden group min-h-[200px]">
                    <div class="absolute inset-0 bg-gradient-to-br from-inverse-surface to-on-background opacity-90"></div>
                    <div class="z-10 text-center cursor-pointer" onclick="navigate('viewer')">
                        <span class="material-symbols-outlined text-4xl text-surface-container-highest mb-2 block group-hover:scale-110 transition-transform duration-300">3d_rotation</span>
                        <span class="font-label text-label text-surface-container-highest">Click to Open 3D Viewer</span>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}
function predBar(label,pct,color) {
    return `<div class="group relative"><div class="flex justify-between text-mono font-mono text-on-surface-variant mb-1"><span>${label}</span><span>${pct}%</span></div><div class="h-2 w-full bg-surface-container rounded-full overflow-hidden"><div class="h-full bg-${color} rounded-full progress-animate" style="width:${pct}%"></div></div></div>`;
}
