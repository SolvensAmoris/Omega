// Reemplazar con las credenciales de tu proyecto Supabase
const SUPABASE_URL = "https://TU_PROYECTO.supabase.co";
const SUPABASE_ANON_KEY = "TU_ANON_KEY";

const supabase = idb = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const core = {
    async init() {
        if (!supabase) return console.error("Error: Supabase no inicializado.");
        
        // Verificar sesión activa
        const { data: { session } } = await supabase.auth.getSession();
        this.updateUI(session);

        // Escuchar cambios de estado en el portal auth
        supabase.auth.onAuthStateChange((_event, session) => {
            this.updateUI(session);
        });

        // Registrar Service Worker para soporte offline (PWA)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(err => console.log("SW Error", err));
        }
    },

    async register() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) alert(`Error de Transmutación: ${error.message}`);
        else alert("Registro exitoso. Revisa tu correo o inicia sesión directamente.");
    },

    async login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) alert(`Acceso Denegado: ${error.message}`);
    },

    async logout() {
        await supabase.auth.signOut();
    },

    updateUI(session) {
        const authSec = document.getElementById('auth-section');
        const dashSec = document.getElementById('dashboard-section');
        const userDisp = document.getElementById('user-display');

        if (session) {
            authSec.classList.add('hidden');
            dashSec.classList.remove('hidden');
            userDisp.innerText = session.user.email;
        } else {
            authSec.classList.remove('hidden');
            dashSec.classList.add('hidden');
        }
    }
};

window.addEventListener('DOMContentLoaded', () => core.init());
