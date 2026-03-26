document.addEventListener('DOMContentLoaded', async () => {
    const signupForm = document.getElementById('signupForm');
    const signinForm = document.getElementById('signinForm');
    const submitBtn = document.getElementById('submitBtn');
    const alertMessage = document.getElementById('alertMessage');
    const btnText = submitBtn ? submitBtn.querySelector('span') : null;

    // 1. Initialize Supabase
    const supabaseUrl = "https://jweresseodrnaiadzmkn.supabase.co";
    const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3ZXJlc3Nlb2RybmFpYWR6bWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTQ1MjQsImV4cCI6MjA5MDAzMDUyNH0.XYttVaVYb_Iqx5lphSOo2SrMN2UxgLk_upU6pmgQjIA";

    let supabaseClient = null;
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    } else {
        console.error('Supabase library missing!');
    }

    // 2. Protect Dashboard & Handle Profile Display
    const isDashboard = window.location.pathname.includes('dashboard');
    if (isDashboard && supabaseClient) {
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

        if (!session) {
            console.log('No active session, redirecting to sign-in...');
            window.location.href = '/signin';
            return;
        }

        // Fetch profile data
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (profile) {
            const userNameElements = document.querySelectorAll('.user-name');
            userNameElements.forEach(el => el.innerText = profile.name);
            const userEmailElements = document.querySelectorAll('.user-email');
            userEmailElements.forEach(el => el.innerText = session.user.email);
        }

        // Handle Sign Out
        const signOutBtn = document.getElementById('signOutBtn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', async () => {
                await supabaseClient.auth.signOut();
                window.location.href = '/signin';
            });
        }
    }

    // 3. Signup Logic
    if (signupForm && supabaseClient) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            setLoading(true, 'Creating account...');
            try {
                const { data, error } = await supabaseClient.auth.signUp({
                    email, password, options: { data: { full_name: name } }
                });

                if (error) throw error;

                if (data.user) {
                    await supabaseClient.from('profiles').insert({ id: data.user.id, name, verified: false });
                }

                showAlert('success', 'Account created! Please check your email to verify.');
                signupForm.reset();
            } catch (err) {
                showAlert('error', err.message);
            } finally {
                setLoading(false);
            }
        });
    }

    // 4. Sign-in Logic
    if (signinForm && supabaseClient) {
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            setLoading(true, 'Signing in...');
            try {
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email, password
                });

                if (error) throw error;

                console.log('Sign in success:', data);
                window.location.href = '/dashboard';
            } catch (err) {
                showAlert('error', err.message);
            } finally {
                setLoading(false);
            }
        });
    }

    // Helper functions
    function setLoading(isLoading, text = 'Processing...') {
        if (!submitBtn) return;
        submitBtn.disabled = isLoading;
        if (isLoading) {
            submitBtn.classList.add('opacity-70', 'cursor-not-allowed');
            if (btnText) btnText.innerText = text;
        } else {
            submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
            if (btnText) btnText.innerText = signupForm ? 'Create Account' : 'Sign In';
        }
    }

    function showAlert(type, message) {
        if (!alertMessage) return;
        alertMessage.classList.remove('hidden', 'bg-red-50', 'text-red-700', 'border-red-200', 'bg-green-50', 'text-green-700', 'border-green-200');

        if (type === 'error') {
            alertMessage.classList.add('bg-red-50', 'text-red-700', 'border', 'border-red-200');
            alertMessage.innerHTML = `<div class="flex items-center gap-2"><i data-lucide="alert-circle" class="w-5 h-5"></i> <span>${message}</span></div>`;
        } else {
            alertMessage.classList.add('bg-green-50', 'text-green-700', 'border', 'border-green-200');
            alertMessage.innerHTML = `<div class="flex items-center gap-2"><i data-lucide="check-circle" class="w-5 h-5"></i> <span>${message}</span></div>`;
        }
        if (window.lucide) lucide.createIcons();
    }
});