function renderLogin() {
    return `
    <div class="auth-bg min-h-screen flex items-center justify-center p-6">
        <main class="w-full max-w-[440px] z-10 page-enter">
            <div class="text-center mb-8">
                <h1 class="font-h1 text-h1 text-primary flex items-center justify-center gap-2 mb-2">
                    <span class="material-symbols-outlined text-[32px] fill-icon">biotech</span>
                    ProtMind
                </h1>
                <p class="font-body text-body text-on-surface-variant">Clinical Informatics Workspace</p>
            </div>
            <div class="bg-surface-container-lowest rounded-xl p-8 clinical-shadow border border-surface-container-highest">
                <h2 class="font-h2 text-h2 text-on-surface mb-4 text-center">Secure Access</h2>
                <div class="h-px w-full bg-tertiary-container opacity-20 mb-6"></div>
                <form onsubmit="handleLoginSubmit(event); return false;" class="space-y-4">
                    <div class="flex flex-col gap-2">
                        <label class="font-label text-label text-on-surface-variant" for="email">Professional Email</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span class="material-symbols-outlined text-outline text-[18px]">mail</span>
                            </div>
                            <input class="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-body text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow" id="email" placeholder="dr.smith@institution.edu" type="email"/>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex justify-between items-center">
                            <label class="font-label text-label text-on-surface-variant" for="password">Password</label>
                            <a class="font-label text-label text-primary hover:text-primary-container transition-colors cursor-pointer">Forgot password?</a>
                        </div>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span class="material-symbols-outlined text-outline text-[18px]">lock</span>
                            </div>
                            <input class="w-full pl-10 pr-10 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-body text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow" id="password" placeholder="••••••••" type="password"/>
                            <div onclick="togglePasswordVisibility('password', this)" class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-outline hover:text-on-surface transition-colors">
                                <span class="material-symbols-outlined text-[18px]">visibility_off</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center pt-2">
                        <input class="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-lowest" id="remember" type="checkbox"/>
                        <label class="ml-2 block font-body text-body text-on-surface-variant" for="remember">Remember me for 30 days</label>
                    </div>
                    <div id="login-error" class="hidden text-error text-xs text-center bg-error-container/30 border border-error/20 p-2.5 rounded-lg font-medium"></div>
                    <div class="pt-4">
                        <button class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label text-label text-on-primary bg-primary hover:bg-on-primary-fixed-variant focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-150" type="submit">Login to Workspace</button>
                    </div>
                </form>
                <div class="mt-6 text-center border-t border-surface-container-highest pt-4">
                    <p class="font-body text-body text-on-surface-variant">
                        Don't have an account? <a class="font-label text-label text-primary hover:text-primary-container transition-colors cursor-pointer" onclick="navigate('signup')">Sign Up</a>
                    </p>
                </div>
            </div>
            <div class="mt-6 text-center">
                <p class="font-mono text-mono text-outline text-[11px]">Protected by Clinical-Grade Encryption • V 2.4.1</p>
            </div>
        </main>
    </div>`;
}
