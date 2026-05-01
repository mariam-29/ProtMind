function renderClinical() {
    return `
    <div class="space-y-6 page-enter">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div><h2 class="font-h2 text-h2 text-on-background mb-1">Variant Cohort Analysis</h2><p class="font-body text-body text-on-surface-variant">CCA Demo Project • NSCLC Primary Tumors</p></div>
            <div class="flex items-center gap-3">
                <button class="flex items-center gap-2 bg-white border border-outline-variant rounded px-4 py-2 text-on-surface text-sm font-medium hover:bg-surface-container-lowest transition-colors shadow-sm">
                    <span class="material-symbols-outlined text-[18px] text-primary">filter_list</span> Cohort: Stage III (n=452)
                    <span class="material-symbols-outlined text-[18px]">arrow_drop_down</span>
                </button>
                <button class="flex items-center gap-2 bg-primary text-on-primary rounded px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                    <span class="material-symbols-outlined text-[18px]">add</span> New Analysis
                </button>
            </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <!-- Survival Curve -->
            <div class="lg:col-span-8 bg-surface-container-lowest rounded-xl clinical-shadow border border-outline-variant/30 flex flex-col h-[400px] fade-in fade-in-delay-1">
                <div class="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center">
                    <h3 class="font-h3 text-h3 text-on-background">Overall Survival by Mutation Status</h3>
                    <div class="flex gap-2">
                        <button class="p-1 rounded text-on-surface-variant hover:bg-surface-variant transition-colors"><span class="material-symbols-outlined text-sm">download</span></button>
                        <button class="p-1 rounded text-on-surface-variant hover:bg-surface-variant transition-colors"><span class="material-symbols-outlined text-sm">fullscreen</span></button>
                    </div>
                </div>
                <div class="flex-1 p-6 relative">
                    <div class="absolute inset-x-6 inset-y-6 border-l-2 border-b-2 border-outline-variant/40">
                        <div class="absolute w-full h-[1px] bg-outline-variant/20 bottom-1/4"></div>
                        <div class="absolute w-full h-[1px] bg-outline-variant/20 bottom-2/4"></div>
                        <div class="absolute w-full h-[1px] bg-outline-variant/20 bottom-3/4"></div>
                        <div class="absolute top-4 right-4 bg-white/80 backdrop-blur-sm border border-outline-variant/30 p-3 rounded text-xs space-y-2 z-10">
                            <div class="flex items-center gap-2"><div class="w-3 h-[2px] bg-primary"></div><span class="font-mono text-on-surface">EGFR+ (n=124)</span></div>
                            <div class="flex items-center gap-2"><div class="w-3 h-[2px] bg-secondary"></div><span class="font-mono text-on-surface">EGFR- (n=328)</span></div>
                        </div>
                        <svg class="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                            <path class="text-primary curve-animate" d="M0,0 L10,5 L20,15 L30,15 L40,25 L50,35 L60,35 L70,45 L80,55 L90,65 L100,75" fill="none" stroke="currentColor" stroke-width="0.5"></path>
                            <path class="text-secondary curve-animate" d="M0,0 L10,15 L20,35 L30,45 L40,65 L50,75 L60,85 L70,90 L80,95 L90,95 L100,98" fill="none" stroke="currentColor" stroke-width="0.5" style="animation-delay:0.5s"></path>
                        </svg>
                    </div>
                </div>
            </div>
            <!-- Heatmap -->
            <div class="lg:col-span-4 bg-surface-container-lowest rounded-xl clinical-shadow border border-outline-variant/30 flex flex-col h-[400px] fade-in fade-in-delay-2">
                <div class="px-6 py-4 border-b border-outline-variant/20"><h3 class="font-h3 text-h3 text-on-background">Co-occurrence Frequency</h3></div>
                <div class="flex-1 p-6 flex flex-col">
                    <div class="flex-1 grid grid-cols-4 grid-rows-4 gap-1">
                        ${[90,20,5,40,20,80,10,30,5,10,60,15,40,30,15,50].map(v=>`<div class="bg-primary/${v} rounded-sm heatmap-cell"></div>`).join('')}
                    </div>
                    <div class="mt-4 flex justify-between text-[10px] font-mono text-on-surface-variant uppercase"><span>EGFR</span><span>TP53</span><span>KRAS</span><span>ALK</span></div>
                </div>
            </div>
            <!-- Variant Table -->
            <div class="lg:col-span-12 bg-surface-container-lowest rounded-xl clinical-shadow border border-outline-variant/30 overflow-hidden fade-in fade-in-delay-3">
                <div class="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface">
                    <h3 class="font-h3 text-h3 text-on-background">Significant Variants</h3>
                    <button class="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-fixed-dim transition-colors"><span class="material-symbols-outlined text-[18px]">download</span> Export CSV</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead><tr class="border-b border-outline-variant/30 bg-surface-container-low text-xs font-label text-on-surface-variant uppercase tracking-wider">
                            <th class="px-6 py-3 font-medium">Gene</th><th class="px-6 py-3 font-medium">Alteration</th><th class="px-6 py-3 font-medium">Frequency</th><th class="px-6 py-3 font-medium">P-Value</th><th class="px-6 py-3 font-medium">Status</th>
                        </tr></thead>
                        <tbody class="text-sm font-body text-on-surface divide-y divide-outline-variant/20">
                            ${variantRow('EGFR','L858R','24.5%','1.2e-08','Validated','badge-validated')}
                            ${variantRow('TP53','R175H','18.2%','3.4e-06','Validated','badge-validated')}
                            ${variantRow('KRAS','G12C','12.8%','5.1e-04','In-Progress','badge-in-progress')}
                            ${variantRow('ALK','Fusion','5.4%','0.021','Draft','badge-draft')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>`;
}
function variantRow(gene,alt,freq,pval,status,badge) {
    return `<tr class="hover:bg-surface-variant/30 transition-colors">
        <td class="px-6 py-3 font-mono text-mono">${gene}</td>
        <td class="px-6 py-3 font-mono text-mono">${alt}</td>
        <td class="px-6 py-3 text-on-surface-variant">${freq}</td>
        <td class="px-6 py-3 font-mono text-mono">${pval}</td>
        <td class="px-6 py-3"><span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${badge}">${status}</span></td>
    </tr>`;
}
