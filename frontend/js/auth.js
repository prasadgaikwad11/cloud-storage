/* ============================================================
   auth.js — Login & Register Page Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Redirect to dashboard if already logged in
  Auth.redirectIfAuthenticated();

  /* ── Login Form ─────────────────────────────────────────── */
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const btn      = document.getElementById('login-btn');
      const btnText  = document.getElementById('login-btn-text');
      const spinner  = document.getElementById('login-spinner');

      // Basic validation
      if (!email || !password) {
        Toast.warning('Please fill in all fields.');
        return;
      }

      // Show loading state
      btn.disabled = true;
      btnText.textContent = 'Signing in…';
      spinner.classList.remove('hidden');

      try {
        const data = await authAPI.login({ email, password });
        Auth.setSession(data.token, data.user);
        Toast.success('Welcome back! Redirecting…');
        setTimeout(() => (window.location.href = 'dashboard.html'), 800);
      } catch (err) {
        Toast.error(err.message || 'Login failed. Please try again.');
      } finally {
        btn.disabled = false;
        btnText.textContent = 'Sign In';
        spinner.classList.add('hidden');
      }
    });
  }

  /* ── Register Form ──────────────────────────────────────── */
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name     = document.getElementById('name').value.trim();
      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirm  = document.getElementById('confirm-password').value;
      const btn      = document.getElementById('register-btn');
      const btnText  = document.getElementById('register-btn-text');
      const spinner  = document.getElementById('register-spinner');

      // Validation
      if (!name || !email || !password || !confirm) {
        Toast.warning('Please fill in all fields.');
        return;
      }

      if (password !== confirm) {
        Toast.error('Passwords do not match.');
        shakeInput('confirm-password');
        return;
      }

      if (password.length < 6) {
        Toast.warning('Password must be at least 6 characters.');
        return;
      }

      // Show loading state
      btn.disabled = true;
      btnText.textContent = 'Creating account…';
      spinner.classList.remove('hidden');

      try {
        const data = await authAPI.register({ name, email, password });
        Auth.setSession(data.token, data.user);
        Toast.success('Account created! Welcome aboard 🎉');
        setTimeout(() => (window.location.href = 'dashboard.html'), 900);
      } catch (err) {
        Toast.error(err.message || 'Registration failed. Please try again.');
      } finally {
        btn.disabled = false;
        btnText.textContent = 'Create Account';
        spinner.classList.add('hidden');
      }
    });

    // Real-time password strength indicator
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
      passwordInput.addEventListener('input', updatePasswordStrength);
    }

    // Confirm password match indicator
    const confirmInput = document.getElementById('confirm-password');
    if (confirmInput) {
      confirmInput.addEventListener('input', () => {
        const pw  = document.getElementById('password').value;
        const cfm = confirmInput.value;
        const hint = document.getElementById('confirm-hint');
        if (!hint) return;
        if (cfm === '') {
          hint.textContent = '';
        } else if (pw === cfm) {
          hint.textContent = '✓ Passwords match';
          hint.style.color = 'var(--success)';
        } else {
          hint.textContent = '✗ Passwords do not match';
          hint.style.color = 'var(--danger)';
        }
      });
    }
  }

  /* ── Password visibility toggle ────────────────────────── */
  document.querySelectorAll('.toggle-password').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input    = document.getElementById(targetId);
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type    = isPassword ? 'text' : 'password';
      btn.innerHTML = isPassword ? eyeOffIcon() : eyeIcon();
    });
  });
});

/* ── Password Strength ──────────────────────────────────────── */
function updatePasswordStrength() {
  const pw       = document.getElementById('password').value;
  const bar      = document.getElementById('strength-bar');
  const label    = document.getElementById('strength-label');
  if (!bar || !label) return;

  let strength = 0;
  if (pw.length >= 6)                       strength++;
  if (pw.length >= 10)                      strength++;
  if (/[A-Z]/.test(pw))                    strength++;
  if (/[0-9]/.test(pw))                    strength++;
  if (/[^A-Za-z0-9]/.test(pw))            strength++;

  const levels = [
    { label: '', color: 'transparent', width: '0%' },
    { label: 'Very Weak', color: 'var(--danger)',  width: '20%' },
    { label: 'Weak',      color: 'var(--warning)', width: '40%' },
    { label: 'Fair',      color: 'var(--warning)', width: '60%' },
    { label: 'Strong',    color: 'var(--success)', width: '80%' },
    { label: 'Very Strong', color: 'var(--success)', width: '100%' },
  ];

  const lvl  = levels[Math.min(strength, 5)];
  bar.style.width            = lvl.width;
  bar.style.background       = lvl.color;
  label.textContent          = lvl.label;
  label.style.color          = lvl.color;
}

/* ── Shake animation on error ───────────────────────────────── */
function shakeInput(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.4s ease';
  setTimeout(() => (el.style.animation = ''), 400);
}

/* ── Eye icons ──────────────────────────────────────────────── */
function eyeIcon() {
  return `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
  </svg>`;
}

function eyeOffIcon() {
  return `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
  </svg>`;
}
