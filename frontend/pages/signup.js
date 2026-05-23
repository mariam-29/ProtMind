function renderSignup() {
    return `
    <div class="auth-bg min-h-screen flex items-center justify-center p-6">
        <main class="w-full max-w-[440px] z-10 page-enter">
            <div class="text-center mb-8">
                <h1 class="font-h1 text-h1 text-primary flex items-center justify-center gap-2 mb-2">
                    <span class="material-symbols-outlined text-[32px] fill-icon">biotech</span> ProtMind
                </h1>
                <p class="font-body text-body text-on-surface-variant">Join the Research Community</p>
            </div>
            <div class="bg-surface-container-lowest rounded-xl p-8 clinical-shadow border border-surface-container-highest">
                <h2 class="font-h2 text-h2 text-on-surface mb-4 text-center">Create Account</h2>
                <div class="h-px w-full bg-tertiary-container opacity-20 mb-6"></div>
                <form onsubmit="handleSignupSubmit(event); return false;" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-label text-label text-on-surface-variant" for="signup-first-name">First Name</label>
                            <input id="signup-first-name" class="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-body text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Ahmed" required/>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-label text-label text-on-surface-variant" for="signup-last-name">Last Name</label>
                            <input id="signup-last-name" class="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-body text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Chen" required/>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-label text-label text-on-surface-variant" for="signup-institution">Institution</label>
                        <input id="signup-institution" class="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-body text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="University / Research Institute"/>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-label text-label text-on-surface-variant" for="signup-email">Professional Email</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span class="material-symbols-outlined text-outline text-[18px]">mail</span></div>
                            <input id="signup-email" class="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-body text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="you@institution.edu" type="email" required/>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-label text-label text-on-surface-variant" for="signup-password">Password</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span class="material-symbols-outlined text-outline text-[18px]">lock</span></div>
                            <input id="signup-password" class="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-body text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Min. 8 characters" type="password" required minlength="8"/>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-label text-label text-on-surface-variant" for="signup-role">Workspace Role</label>
                        <select id="signup-role" class="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-body text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                            <option value="Researcher">Researcher</option>
                            <option value="Clinical Scientist">Clinical Scientist</option>
                        </select>
                    </div>
                    <div id="signup-error" class="hidden text-error text-xs text-center bg-error-container/30 border border-error/20 p-2.5 rounded-lg font-medium"></div>
                    <div class="pt-4">
                        <button class="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm font-label text-label text-on-primary bg-primary hover:bg-on-primary-fixed-variant transition-colors duration-150" type="submit">Create Workspace</button>
                    </div>
                </form>
                <div class="mt-6 text-center border-t border-surface-container-highest pt-4">
                    <p class="font-body text-body text-on-surface-variant">
                        Already have an account? <a class="font-label text-label text-primary hover:text-primary-container transition-colors cursor-pointer" onclick="navigate('login')">Login</a>
                    </p>
                </div>
            </div>
        </main>
    </div>`;
}
