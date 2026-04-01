import { useState } from 'react';
import { useApp } from '../../hooks/useApp';

export default function LoginScreen() {
  const { login, register } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [password2, setPassword2] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length !== 6) {
      setError('Şifre 6 haneli olmalıdır.');
      return;
    }

    if (isRegister) {
      if (password !== password2) {
        setError('Şifreler eşleşmiyor.');
        return;
      }
      register(username.trim(), password);
    } else {
      const ok = login(username.trim(), password, rememberMe);
      if (!ok) {
        setError('Kullanıcı adı veya şifre hatalı.');
      }
    }
  };

  return (
    <div className="login-screen">
      <div className="login-logo-wrap">
        <img src={`${import.meta.env.BASE_URL}icons/logo.png`} alt="HabiTR" className="login-logo" />
      </div>

      <div className="login-card">
        <h2 className="login-title">{isRegister ? 'Kayıt Ol' : 'Giriş Yap'}</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Kullanıcı Adı</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Kullanıcı adın"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Şifre (6 hane)</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
              maxLength={6}
              required
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>Şifre Tekrar</label>
              <input
                type="password"
                value={password2}
                onChange={e => setPassword2(e.target.value)}
                placeholder="••••••"
                maxLength={6}
                required
              />
            </div>
          )}

          {!isRegister && (
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              <span>Beni hatırla</span>
            </label>
          )}

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="btn-primary login-btn">
            {isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
          </button>
        </form>

        <p className="login-switch">
          {isRegister ? 'Hesabın var mı?' : 'Hesabın yok mu?'}{' '}
          <button className="link-btn" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
            {isRegister ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </p>
      </div>
    </div>
  );
}
