import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../services/firebase/firebaseConfig';
import { userService } from '../../services/firebase/userService';
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  BarChart2,
  Award,
  Activity,
  Clock,
  TrendingUp,
  Calendar,
  ExternalLink
} from 'lucide-react';
import './user.css';

/**
 * UI alineada a Juegos/Reportes:
 * - Header con título
 * - Barra de acciones/filtros ligeros
 * - Layout principal: Resumen/Perfil (izq) + KPIs (der)
 * - Sección de "Progreso por dominios" con barras
 * - Tabla de "Historial de Sesiones" (si existen)
 *
 * Datos esperados (opcionales) desde userService.getUserBasicStats(uid):
 * {
 *   totalSessions, totalGamesPlayed, correctAnswers, accuracy (0..1 o 0..100),
 *   streak, lastActivity: { game, when },
 *   domains: { memoria: 72, atencion: 65, ... }  // o progressByDomain.{clave: {percent}}
 *   recentSessions: [{ date, game, domain, level, score, time, accuracy }]
 *   isAdmin: true|false
 * }
 */
const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        if (!user) {
          setError('No hay un usuario autenticado.');
          return;
        }
        setProfile({
          uid: user.uid,
          displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Usuario'),
          email: user.email,
          photoURL: user.photoURL
        });
        try {
          const s = await userService.getUserBasicStats(user.uid);
          setStats(s || {});
        } catch (e) {
          console.warn('No se pudieron obtener estadísticas:', e.message);
        }
      } catch (e) {
        setError(e.message);
      }
    };
    load();
  }, [user]);

  const initials = useMemo(() => {
    const name = (profile?.displayName || 'U').trim();
    return name.split(/\s+/).map(w => w[0]).slice(0,2).join('').toUpperCase();
  }, [profile]);

  const num = v => (v === 0 || !!v ? v : '—');

  const accuracyPct = useMemo(() => {
    if (typeof stats?.accuracy === 'number') {
      const value = stats.accuracy > 1 ? stats.accuracy : stats.accuracy * 100;
      return `${Math.round(value)}%`;
    }
    return '—';
  }, [stats]);

  const lastActivity = stats?.lastActivity;

  const domains = useMemo(() => {
    const src = stats?.domains || stats?.progressByDomain;
    if (!src || typeof src !== 'object') return [];
    return Object.entries(src).map(([k, v]) => ({
      key: k,
      label: prettyLabel(k),
      value: typeof v === 'number'
        ? clampPct(v)
        : typeof v?.percent === 'number'
          ? clampPct(v.percent)
          : null
    })).filter(d => d.value !== null);
  }, [stats]);

  const sessions = Array.isArray(stats?.recentSessions) ? stats.recentSessions : [];

  if (error) {
    return (
      <div className="user-page">
        <h1 className="page-title">Perfil de Usuario</h1>
        <div className="card error-card">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="user-page">
        <h1 className="page-title">Perfil de Usuario</h1>
        <div className="card loading-card">Cargando…</div>
      </div>
    );
  }

  return (
    <div className="user-page">
      {/* Título principal */}
      <h1 className="page-title">Perfil de Usuario</h1>

      {/* Barra de acciones, similar a filtros de Reportes */}
      <div className="toolbar card">
        <div className="toolbar-group">
          <div className="pill">
            <UserIcon size={16} />
            <span>{profile.displayName}</span>
          </div>
          {stats?.isAdmin && <div className="pill pill-admin">Admin</div>}
        </div>
        <div className="toolbar-actions">
          <Link className="btn ghost" to="/dashboard">
            Volver al Dashboard <ExternalLink size={16}/>
          </Link>
          <Link className="btn ghost" to="/reports">
            Ver Reportes <ExternalLink size={16}/>
          </Link>
        </div>
      </div>

      {/* Layout principal */}
      <div className="main-grid">
        {/* Panel izquierdo: identidad + resumen + dominios */}
        <section className="left-col">
          <div className="card identity-card">
            <div className="avatar">
              {profile.photoURL
                ? <img src={profile.photoURL} alt="avatar"/>
                : <span className="initials">{initials}</span>}
            </div>

            <div className="identity-info">
              <h2>{profile.displayName}</h2>
              <div className="meta">
                <div className="meta-item"><Mail size={16}/>{profile.email || '—'}</div>
                <div className="meta-item mono"><ShieldCheck size={16}/>{profile.uid}</div>
              </div>

              {lastActivity && (
                <div className="last-activity">
                  <Clock size={16}/>
                  <span>
                    Última actividad: {lastActivity.game || '—'} {renderWhen(lastActivity.when)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="card domains-card">
            <h3 className="section-title"><TrendingUp size={18}/> Progreso por dominios</h3>
            {domains.length === 0 ? (
              <div className="empty">Aún no hay progreso registrado.</div>
            ) : (
              <div className="domains-list">
                {domains.map(d => (
                  <div key={d.key} className="domain-item">
                    <div className="domain-header">
                      <span className="domain-name">{d.label}</span>
                      <span className="domain-value">{d.value}%</span>
                    </div>
                    <div className="progress">
                      <div className="fill" style={{ width: `${d.value}%` }}/>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Panel derecho: KPIs tipo tarjetas de resumen */}
        <aside className="right-col">
          <div className="kpi-grid">
            <div className="kpi card kpi-blue">
              <div className="kpi-icon"><Activity size={18}/></div>
              <div className="kpi-body">
                <div className="kpi-label">Total de sesiones</div>
                <div className="kpi-value">{num(stats?.totalSessions)}</div>
              </div>
            </div>

            <div className="kpi card kpi-green">
              <div className="kpi-icon"><BarChart2 size={18}/></div>
              <div className="kpi-body">
                <div className="kpi-label">Juegos jugados</div>
                <div className="kpi-value">{num(stats?.totalGamesPlayed)}</div>
              </div>
            </div>

            <div className="kpi card kpi-orange">
              <div className="kpi-icon"><Award size={18}/></div>
              <div className="kpi-body">
                <div className="kpi-label">Aciertos</div>
                <div className="kpi-value">{num(stats?.correctAnswers)}</div>
              </div>
            </div>

            <div className="kpi card kpi-purple">
              <div className="kpi-icon"><ShieldCheck size={18}/></div>
              <div className="kpi-body">
                <div className="kpi-label">Precisión</div>
                <div className="kpi-value">{accuracyPct}</div>
              </div>
            </div>

            <div className="kpi card kpi-gray">
              <div className="kpi-icon"><Calendar size={18}/></div>
              <div className="kpi-body">
                <div className="kpi-label">Racha</div>
                <div className="kpi-value">{num(stats?.streak)}</div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Historial de sesiones, estilo similar a la tabla de Reportes */}
      <section className="history">
        <div className="history-header">
          <h3>Historial de Sesiones {sessions.length ? `(${sessions.length})` : ''}</h3>
        </div>

        <div className="table card">
          <div className="thead">
            <div className="tr">
              <div className="th">FECHA</div>
              <div className="th">JUEGO</div>
              <div className="th">DOMINIO</div>
              <div className="th">NIVEL</div>
              <div className="th">PUNTUACIÓN</div>
              <div className="th">TIEMPO</div>
              <div className="th">PRECISIÓN</div>
            </div>
          </div>
          <div className="tbody">
            {sessions.length === 0 ? (
              <div className="tr empty-row"><div className="td">Sin registros aún.</div></div>
            ) : (
              sessions.map((s, i) => (
                <div className="tr" key={i}>
                  <div className="td">{s.date || '—'}</div>
                  <div className="td">{s.game || '—'}</div>
                  <div className="td">{prettyLabel(s.domain) || '—'}</div>
                  <div className="td"><span className="badge">{(s.level || '').toString().toUpperCase()}</span></div>
                  <div className="td strong">{num(s.score)}</div>
                  <div className="td">{s.time || '—'}</div>
                  <div className="td">{typeof s.accuracy === 'number'
                    ? `${Math.round((s.accuracy > 1 ? s.accuracy : s.accuracy*100))}%`
                    : (s.accuracy || '—')}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

function prettyLabel(key='') {
  const map = {
    memoria: 'Memoria',
    atencion: 'Atención',
    razonamiento: 'Razonamiento',
    lenguaje: 'Lenguaje',
    velocidad: 'Velocidad de procesamiento'
  };
  return map[key] || (key || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
function clampPct(v) { return Math.max(0, Math.min(100, Math.round(v))); }
function renderWhen(when) { return when ? `— ${when}` : ''; }

export default UserProfile;
