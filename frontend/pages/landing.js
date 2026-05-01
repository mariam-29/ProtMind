function renderLanding() {
    return `
    <div class="min-h-screen flex flex-col bg-background">
        <!-- TopNavBar -->
        <header class="bg-[#F0FAFA] sticky top-0 z-50 border-b border-slate-200 flex justify-between items-center w-full px-8 py-4">
            <div class="text-xl font-bold tracking-tight text-slate-900 font-h1">ProtMind</div>
            <nav class="hidden md:flex gap-8">
                <a class="font-label text-label text-slate-600 hover:text-[#1A9E8F] transition-colors duration-150 cursor-pointer" href="#features">Features</a>
                <a class="font-label text-label text-slate-600 hover:text-[#1A9E8F] transition-colors duration-150 cursor-pointer" href="#about">About</a>
                <a class="font-label text-label text-slate-600 hover:text-[#1A9E8F] transition-colors duration-150 cursor-pointer" href="#security">Security</a>
            </nav>
            <div class="flex items-center gap-4">
                <button onclick="navigate('login')" class="font-label text-label text-primary hover:text-on-primary-fixed-variant transition-colors duration-150 px-4 py-2">Login</button>
                <button onclick="navigate('signup')" class="bg-primary text-on-primary font-label text-label px-6 py-2 rounded hover:bg-on-primary-fixed-variant transition-colors duration-150">Sign Up</button>
            </div>
        </header>

        <main class="flex-grow">
            <!-- Hero Section -->
            <section class="relative pt-24 pb-32 px-6 overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-surface to-surface-container-low -z-10"></div>
                <div class="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none -z-10">
                    <svg class="w-full h-full fill-primary" preserveAspectRatio="none" viewBox="0 0 100 100"><polygon points="0,100 100,0 100,100"></polygon></svg>
                </div>
                <div class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div class="space-y-8 page-enter">
                        <div class="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full border border-outline-variant">
                            <span class="w-2 h-2 rounded-full bg-primary pulse-dot"></span>
                            <span class="font-mono text-mono text-primary">v2.4 Core Engine Active</span>
                        </div>
                        <div class="space-y-3">
                            <h1 class="font-h1 text-[40px] leading-[1.15] tracking-[-0.02em] font-semibold text-on-surface">The Future of Bioinformatics, Quantified.</h1>
                            <p class="font-body text-body text-on-surface-variant max-w-xl">
                                Accelerate protein research with an integrated environment for data retrieval, precise 3D modeling, and advanced AI predictions. Designed for the rigor of clinical precision.
                            </p>
                        </div>
                        <div class="flex flex-wrap gap-4">
                            <button onclick="navigate('signup')" class="bg-primary text-on-primary font-label text-label px-6 py-3 rounded hover:bg-on-primary-fixed-variant transition-colors duration-150 shadow-sm flex items-center gap-2">
                                Get Started <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                            <button class="border border-primary text-primary font-label text-label px-6 py-3 rounded hover:bg-surface-container-low transition-colors duration-150 flex items-center gap-2">
                                View Documentation <span class="material-symbols-outlined text-[18px]">book</span>
                            </button>
                        </div>
                    </div>
                    <!-- Hero Graphic -->
                    <div class="relative h-[400px] w-full rounded-xl clinical-shadow bg-white border border-outline-variant p-4 flex flex-col gap-4 overflow-hidden fade-in fade-in-delay-2">
                        <div class="flex justify-between items-center pb-2 border-b border-surface-container">
                            <div class="flex gap-2">
                                <div class="w-3 h-3 rounded-full bg-outline-variant"></div>
                                <div class="w-3 h-3 rounded-full bg-outline-variant"></div>
                                <div class="w-3 h-3 rounded-full bg-outline-variant"></div>
                            </div>
                            <div class="font-mono text-[10px] text-outline">sequence_viewer.tsx</div>
                        </div>
                        <div class="flex-grow grid grid-cols-3 gap-4">
                            <div class="col-span-1 bg-surface rounded flex flex-col gap-2 p-2">
                                <div class="h-4 bg-outline-variant/30 rounded w-3/4"></div>
                                <div class="h-3 bg-outline-variant/20 rounded w-1/2"></div>
                                <div class="h-3 bg-outline-variant/20 rounded w-full mt-4"></div>
                                <div class="h-3 bg-outline-variant/20 rounded w-5/6"></div>
                                <div class="h-3 bg-outline-variant/20 rounded w-full"></div>
                                <div class="h-3 bg-primary/10 rounded w-2/3 mt-2"></div>
                                <div class="h-3 bg-primary/15 rounded w-full"></div>
                                <div class="h-3 bg-outline-variant/20 rounded w-4/5"></div>
                            </div>
                            <div class="col-span-2 relative bg-[#021016] border border-outline-variant rounded overflow-hidden flex items-center justify-center">
                                <img alt="Protein Structure" class="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-screen" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8ng0Wvg95RJlDInIuBMgBwXv4_6Rm3m09jG4CBR6ovbiv6BdJBCF-8qWaKQguwFmm190Nn6qxFOGhlhLBWfDbMKUXmm0AF95EQe3YRkobjmmzwUbhGNcAOD8uiIxrPrKLluhkIv9F-LNB59jwt1W1pOs_J9j3WkbCINvRUMd4sLvaFkjV4ePS2lHvm_CmsmhNiT9vwdDZrFs3qmxrXMASpWITFOs20nM_eQ-MOTxG8erAReAXHwbe5l9UzyBk_BYGUxgb811eB3Y"/>
                                <div class="absolute bottom-2 right-2 font-mono text-[10px] bg-white/80 px-2 py-0.5 rounded text-on-surface">Mol* Viewer</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- About Section -->
            <section id="about" class="py-24 px-6 bg-white">
                <div class="max-w-4xl mx-auto text-center space-y-4 fade-in">
                    <span class="font-label text-label text-primary uppercase tracking-widest">Platform Vision</span>
                    <h2 class="font-h2 text-h2 text-on-surface">Engineered for Clinical Precision</h2>
                    <p class="font-body text-body text-on-surface-variant max-w-2xl mx-auto">
                        We reject the noise of generic AI tools. ProtMind is built strictly for high-stakes medical informatics, providing a clean, transparent, and mathematically rigorous environment. Every feature is designed to reduce cognitive load during complex data analysis, ensuring trust at every step of your research pipeline.
                    </p>
                </div>
            </section>

            <!-- Core Pillars -->
            <section id="features" class="py-24 px-6 bg-surface-container-lowest">
                <div class="max-w-6xl mx-auto space-y-16">
                    <div class="text-center">
                        <h2 class="font-h2 text-h2 text-on-surface mb-4">Core Infrastructure</h2>
                        <p class="font-body text-body text-on-surface-variant">The functional pillars of the ProtMind ecosystem.</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        ${pillarCard('database', 'Unified Data Retrieval', 'Seamlessly integrate multi-source data streams. Connect securely to public databases (PDB, UniProt) and proprietary internal repositories with mathematically verified consistency checks.', ['REST API', 'GraphQL'])}
                        ${pillarCard('view_in_ar', '3D Visualization', 'Native Mol* integration provides hardware-accelerated rendering of massive macromolecular structures. Analyze binding sites and conformations without leaving the platform.', ['Mol* Engine', 'WebGL'])}
                        ${pillarCard('memory', 'AI Predictions', 'Leverage embedded ESM-2 models for highly accurate sequence-to-structure predictions and variant effect mapping. Transparent confidence scoring prevents analytical black boxes.', ['ESM-2', 'PyTorch'])}
                    </div>
                </div>
            </section>

            <!-- Who it's for -->
            <section class="py-24 px-6 bg-surface-container-low border-y border-outline-variant">
                <div class="max-w-5xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
                    <div class="lg:w-1/2 space-y-6">
                        <h2 class="font-h2 text-h2 text-on-surface">Built for the Specialists</h2>
                        <p class="font-body text-body text-on-surface-variant">ProtMind is not a general-purpose tool. It is a highly specialized instrument designed for professionals who demand exactness.</p>
                        <ul class="space-y-4 mt-8">
                            ${specialistItem('biotech', 'Lab Scientists', 'Streamline experiment planning with integrated structural context.')}
                            ${specialistItem('terminal', 'Computational Biologists', 'Access raw data streams via API for custom pipeline integration.')}
                            ${specialistItem('health_and_safety', 'Clinical Researchers', 'Analyze variant pathogenicity within a secure, compliant environment.')}
                        </ul>
                    </div>
                    <div class="lg:w-1/2 w-full">
                        <img alt="Scientist in Lab" class="rounded-xl clinical-shadow border border-outline-variant w-full object-cover h-[500px]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDM30ED1SVWt5v9ano8dGll0B7DGPLKY8rSp75gBTXhgpuiFJKZSqh09AmFhei0bVjNDOtqhhpjCfP0X3VWdjCjmTcu5omydeTr7zdCLSZliHgki3pKTIAw2LPbq8Ib9OAtPJLYK4JKFUOByvBJlhCXOzJxpljD4JfzXLapTxvu1nmiXKSQUBIeu75_m4mmZiHpTpBnXlwNQx1vKYQVmKui24W7ERUOnvpIS8hXbCzUcctX-kRVLNnHmswGLt5Lcy63E_HrBrL6HO0"/>
                    </div>
                </div>
            </section>

            <!-- Security Section -->
            <section id="security" class="py-24 px-6 bg-white">
                <div class="max-w-4xl mx-auto text-center space-y-8">
                    <span class="material-symbols-outlined text-[48px] text-primary">verified_user</span>
                    <h2 class="font-h2 text-h2 text-on-surface">Uncompromising Security</h2>
                    <p class="font-body text-body text-on-surface-variant max-w-2xl mx-auto">
                        In clinical informatics, data integrity is non-negotiable. ProtMind employs state-of-the-art encryption at rest and in transit. We maintain strict compliance with global healthcare data standards.
                    </p>
                    <div class="flex justify-center gap-8 pt-8 border-t border-surface-container mt-8">
                        ${secBadge('HIPAA', 'Compliant')}
                        ${secBadge('SOC 2', 'Type II Certified')}
                        ${secBadge('AES-256', 'Encryption')}
                    </div>
                </div>
            </section>

            <!-- CTA -->
            <section class="py-20 px-6 bg-gradient-to-r from-primary to-primary-container text-center">
                <div class="max-w-3xl mx-auto space-y-6">
                    <h2 class="font-h2 text-h2 text-on-primary">Ready to Accelerate Your Research?</h2>
                    <p class="font-body text-body text-on-primary/80">Join the growing community of researchers using ProtMind for clinical-grade bioinformatics.</p>
                    <div class="flex justify-center gap-4 pt-4">
                        <button onclick="navigate('signup')" class="bg-white text-primary font-label text-label px-8 py-3 rounded hover:bg-surface-container-lowest transition-colors shadow-md flex items-center gap-2">
                            Create Free Account <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </section>
        </main>

        <!-- Footer -->
        <footer class="bg-[#E8FAE8] border-t border-slate-200 py-12 px-8 flex flex-col md:flex-row justify-between items-start gap-8">
            <div class="text-lg font-bold text-slate-800 font-h1">ProtMind</div>
            <nav class="flex flex-wrap gap-6">
                <a class="font-label text-label text-slate-500 hover:text-slate-900 transition-opacity cursor-pointer">Privacy Policy</a>
                <a class="font-label text-label text-slate-500 hover:text-slate-900 transition-opacity cursor-pointer">Terms of Service</a>
                <a class="font-label text-label text-slate-500 hover:text-slate-900 transition-opacity cursor-pointer">Security</a>
                <a class="font-label text-label text-slate-500 hover:text-slate-900 transition-opacity cursor-pointer">Contact Support</a>
                <a class="font-label text-label text-slate-500 hover:text-slate-900 transition-opacity cursor-pointer">Documentation</a>
            </nav>
            <div class="font-label text-label text-slate-500">© 2026 ProtMind Informatics. All rights reserved.</div>
        </footer>
    </div>`;
}

function pillarCard(icon, title, desc, tags) {
    return `<div class="bg-white p-8 rounded-xl clinical-shadow border border-outline-variant space-y-4 hover:-translate-y-1 transition-transform duration-300 flex flex-col card-hover">
        <div class="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center text-primary mb-2">
            <span class="material-symbols-outlined text-[28px] fill-icon">${icon}</span>
        </div>
        <h3 class="font-h3 text-h3 text-on-surface">${title}</h3>
        <p class="font-body text-body text-on-surface-variant flex-grow">${desc}</p>
        <div class="pt-4 border-t border-surface-container flex gap-2">
            ${tags.map(t => `<span class="px-2 py-1 bg-surface-container text-on-surface font-mono text-[11px] rounded">${t}</span>`).join('')}
        </div>
    </div>`;
}

function specialistItem(icon, title, desc) {
    return `<li class="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-outline-variant card-hover">
        <span class="material-symbols-outlined text-primary mt-1">${icon}</span>
        <div>
            <h4 class="font-h3 text-h3 text-on-surface text-[16px]">${title}</h4>
            <p class="font-body text-[14px] text-on-surface-variant mt-1">${desc}</p>
        </div>
    </li>`;
}

function secBadge(label, sub) {
    return `<div class="flex flex-col items-center gap-2">
        <span class="font-h3 text-h3 text-on-surface">${label}</span>
        <span class="font-mono text-mono text-outline">${sub}</span>
    </div>`;
}
