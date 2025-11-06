import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../services/firebase/firebaseConfig';
import { userService } from '../../services/firebase/userService';
import { gameService } from '../../services/firebase/gameService';
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
  ExternalLink,
  LogOut,
  Trash2,
  AlertTriangle
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
  const [bestScores, setBestScores] = useState([]); // Store best scores for each game
  const [totalSessionsAvailable, setTotalSessionsAvailable] = useState(0);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
          // Load basic stats
          const s = await userService.getUserBasicStats(user.uid);
          setStats(s || {});
        } catch (e) {
          console.warn('No se pudieron obtener estadísticas:', e.message);
        }

        try {
          // Load recent game sessions - get more data for streak calculation
          const gameResults = await gameService.getUserGameResults(user.uid, null, 100); // Get last 100 sessions for streak calculation
          console.log('🎮 Recent sessions loaded:', gameResults?.length || 0);
          console.log('🎮 Sample session data:', gameResults?.[0]);

          // Helper function to format game names
          const formatGameName = (gameName) => {
            if (!gameName) return '—';
            return gameName
              .split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
          };

          // Helper function to calculate streak based on sessions
          const calculateStreak = (sessions) => {
            if (!sessions || sessions.length === 0) return 0;

            // Get unique dates when user played (only date, ignore time)
            const playDates = sessions.map(session => {
              const date = session.createdAt?.toDate ? session.createdAt.toDate() : new Date(session.createdAt);
              return date.toDateString(); // This gives us "Mon Oct 08 2025" format
            });

            // Remove duplicates and sort in descending order (most recent first)
            const uniqueDates = [...new Set(playDates)].sort((a, b) => new Date(b) - new Date(a));

            if (uniqueDates.length === 0) return 0;

            // Check if user played today
            const today = new Date().toDateString();
            const mostRecentPlayDate = uniqueDates[0];

            // If user didn't play today or yesterday, streak is broken
            const daysDifference = Math.floor((new Date(today) - new Date(mostRecentPlayDate)) / (1000 * 60 * 60 * 24));
            if (daysDifference > 1) return 0;

            // Count consecutive days
            let streak = 0;
            const todayDate = new Date();

            for (let i = 0; i < uniqueDates.length; i++) {
              const currentDate = new Date(uniqueDates[i]);
              const expectedDate = new Date(todayDate);
              expectedDate.setDate(todayDate.getDate() - i);

              // If this date matches the expected consecutive date
              if (currentDate.toDateString() === expectedDate.toDateString()) {
                streak++;
              } else {
                break; // Streak is broken
              }
            }

            return streak;
          };

          // Calculate current streak
          const currentStreak = calculateStreak(gameResults);
          console.log('🔥 Current streak:', currentStreak, 'days');

          // Transform ALL the session data
          const allTransformedSessions = gameResults?.map(result => {
            const date = result.createdAt?.toDate ? result.createdAt.toDate() : new Date(result.createdAt);
            const gameName = result.gameDisplayName || result.gameId;

            return {
              date: date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              }),
              game: formatGameName(gameName),
              domain: result.domainDisplayName || result.cognitiveDomain,
              level: result.level || 'medium',
              score: result.score || 0,
              time: result.timeSpent || 0,
              accuracy: result.details?.correctAnswers && result.details?.totalQuestions
                ? Math.round((result.details.correctAnswers / result.details.totalQuestions) * 100)
                : result.score // Fallback to score if accuracy can't be calculated
            };
          }) || [];

          console.log('🎮 Total sessions available:', gameResults?.length || 0);
          console.log('🎮 All transformed sessions:', allTransformedSessions.length);

          // Log unique games in full dataset for debugging (reuse from stats calculation)
          console.log('🎮 Total unique games from stats calculation');

          // Store session data for stats
          setTotalSessionsAvailable(gameResults?.length || 0);

          // Calculate comprehensive stats from the session data
          const calculateStatsFromSessions = (sessions) => {
            if (!sessions || sessions.length === 0) {
              return {
                totalSessions: 0,
                totalGamesPlayed: 0,
                correctAnswers: 0,
                totalQuestions: 0,
                accuracy: 0,
                averageScore: 0,
                lastActivity: null
              };
            }

            // Calculate totals
            let totalCorrectAnswers = 0;
            let totalQuestions = 0;
            let totalScore = 0;
            let gamesWithValidData = 0;
            const uniqueGames = new Set(); // Track unique games

            sessions.forEach(session => {
              // Track unique games played
              const gameId = session.gameId || session.gameDisplayName;
              if (gameId) {
                uniqueGames.add(gameId);
              }

              // Count correct answers and total questions
              // Try multiple sources for correct answers and total questions
              let sessionCorrectAnswers = 0;
              let sessionTotalQuestions = 0;

              // First try details object (nested structure)
              if (session.details?.correctAnswers && session.details?.totalQuestions) {
                sessionCorrectAnswers = session.details.correctAnswers;
                sessionTotalQuestions = session.details.totalQuestions;
              }
              // Then try direct properties (flat structure)
              else if (session.correctAnswers && session.totalQuestions) {
                sessionCorrectAnswers = session.correctAnswers;
                sessionTotalQuestions = session.totalQuestions;
              }

              // Add to totals if we found valid data
              if (sessionCorrectAnswers > 0 && sessionTotalQuestions > 0) {
                totalCorrectAnswers += sessionCorrectAnswers;
                totalQuestions += sessionTotalQuestions;
              }

              // Sum scores for average calculation
              if (typeof session.score === 'number' && session.score > 0) {
                totalScore += session.score;
                gamesWithValidData++;
              }
            });

            // Calculate accuracy
            const accuracy = totalQuestions > 0 ? (totalCorrectAnswers / totalQuestions) * 100 : 0;

            // Calculate average score
            const averageScore = gamesWithValidData > 0 ? totalScore / gamesWithValidData : 0;

            console.log('📊 Stats calculation details:', {
              sessionsProcessed: sessions.length,
              totalCorrectAnswers,
              totalQuestions,
              accuracy,
              uniqueGamesCount: uniqueGames.size,
              gamesWithValidData
            });

            // Get last activity
            const lastActivity = sessions.length > 0 ? {
              game: sessions[0].gameDisplayName || sessions[0].gameId,
              when: sessions[0].createdAt ? 'recientemente' : null
            } : null;

            return {
              totalSessions: sessions.length,
              totalGamesPlayed: uniqueGames.size, // Count of unique different games
              correctAnswers: totalCorrectAnswers,
              totalQuestions: totalQuestions,
              accuracy: accuracy,
              averageScore: averageScore,
              lastActivity: lastActivity
            };
          };

          // Calculate all stats from sessions (using raw gameResults, not transformed sessions)
          const calculatedStats = calculateStatsFromSessions(gameResults);
          console.log('📊 Calculated stats:', calculatedStats);
          console.log('📊 Sample gameResult for debugging:', gameResults?.[0]);

          // Update stats with calculated values and streak
          setStats(prevStats => ({
            ...prevStats,
            ...calculatedStats,
            streak: currentStreak
          }));

          // Calculate best scores for each unique game
          const calculateBestScores = (sessions) => {
            if (!sessions || sessions.length === 0) return [];

            const gameScores = new Map();

            sessions.forEach(session => {
              const gameId = session.gameId || session.gameDisplayName;
              const gameName = session.gameDisplayName || session.gameId;
              const domain = session.domainDisplayName || session.cognitiveDomain;
              const score = session.score || 0;

              if (gameId && typeof score === 'number') {
                const currentBest = gameScores.get(gameId);

                if (!currentBest || score > currentBest.score) {
                  gameScores.set(gameId, {
                    gameId: gameId,
                    gameName: formatGameName(gameName),
                    domain: domain,
                    score: score,
                    date: session.createdAt?.toDate ? session.createdAt.toDate() : new Date(session.createdAt)
                  });
                }
              }
            });

            // Convert to array and sort by score descending
            return Array.from(gameScores.values())
              .sort((a, b) => b.score - a.score)
              .map(best => ({
                ...best,
                date: best.date.toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                })
              }));
          };

          const bestScoresList = calculateBestScores(gameResults);
          console.log('🏆 Best scores calculated:', bestScoresList);
          setBestScores(bestScoresList);
        } catch (e) {
          console.warn('No se pudieron obtener sesiones recientes:', e.message);
          setBestScores([]);
        }

      } catch (e) {
        setError(e.message);
      }
    };
    load();
  }, [user]);

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await userService.logoutUser();

      // Redirect to home page or login page
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      setError('Error al cerrar sesión: ' + error.message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await userService.deleteUserAccount(user.uid);

      // Account deleted successfully, redirect to home
      navigate('/', {
        state: {
          message: 'Tu cuenta ha sido eliminada exitosamente. Todos los datos han sido anonimizados.'
        }
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Error al eliminar la cuenta: ' + error.message);
      setShowDeleteConfirmation(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Confirmation modal component
  const DeleteConfirmationModal = () => {
    if (!showDeleteConfirmation) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowDeleteConfirmation(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <AlertTriangle size={24} color="#ef4444" />
            <h3>Confirmar Eliminación de Cuenta</h3>
          </div>

          <div className="modal-body">
            <p>
              <strong>¿Estás seguro de que quieres eliminar tu cuenta?</strong>
            </p>
            <p>
              Esta acción:
            </p>
            <ul>
              <li>• Cerrará tu sesión inmediatamente</li>
              <li>• Anonimizará todos tus datos personales</li>
              <li>• Mantendrá tus estadísticas de juego para análisis (sin datos personales)</li>
              <li>• <strong>No se puede deshacer</strong></li>
            </ul>
          </div>

          <div className="modal-actions">
            <button
              className="btn cancel-btn"
              onClick={() => setShowDeleteConfirmation(false)}
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              className="btn delete-btn"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>Eliminando...</>
              ) : (
                <>
                  <Trash2 size={16} />
                  Eliminar Cuenta
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const initials = useMemo(() => {
    const name = (profile?.displayName || 'U').trim();
    return name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }, [profile]);

  // Generate a consistent color based on user ID
  const avatarColor = useMemo(() => {
    if (!profile?.uid) return '#6366f1';

    const colors = [
      '#ef4444', // red
      '#f97316', // orange  
      '#eab308', // yellow
      '#22c55e', // green
      '#06b6d4', // cyan
      '#3b82f6', // blue
      '#6366f1', // indigo
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#10b981', // emerald
      '#f59e0b', // amber
      '#84cc16'  // lime
    ];

    // Simple hash function to convert UID to array index
    let hash = 0;
    for (let i = 0; i < profile.uid.length; i++) {
      hash = profile.uid.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }, [profile?.uid]);

  // Create SVG avatar component
  const AvatarSVG = useMemo(() => {
    if (!profile?.uid) return null;

    return (
      <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" style={{ borderRadius: '50%' }}>
        {/* Background circle */}
        <circle cx="32" cy="32" r="32" fill={avatarColor} />

        {/* Head - bigger */}
        <circle cx="32" cy="20" r="9" fill="white" fillOpacity="0.95" />

        {/* Body - wider, shorter, with gap from head */}
        <ellipse
          cx="32"
          cy="48"
          rx="18"
          ry="18"
          fill="white"
          fillOpacity="0.95"
        />
      </svg>
    );
  }, [avatarColor, profile?.uid]);

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
            Volver al inicio <ExternalLink size={16} />
          </Link>
          <Link className="btn ghost" to="/reports">
            Ver Reportes <ExternalLink size={16} />
          </Link>
          <button
            className="btn logout-btn"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>Cerrando...</>
            ) : (
              <>
                <LogOut size={16} />
                Cerrar Sesión
              </>
            )}
          </button>
          <button
            className="btn danger-btn"
            onClick={() => setShowDeleteConfirmation(true)}
            disabled={isDeleting}
          >
            <Trash2 size={16} />
            Eliminar Cuenta
          </button>
        </div>
      </div>

      {/* Layout principal */}
      <div className="main-grid">
        {/* Panel izquierdo: identidad + mejores puntuaciones */}
        <section className="left-col">
          <div className="card identity-card">
            <div className="avatar">
              {profile.photoURL
                ? <img src={profile.photoURL} alt="avatar" />
                : AvatarSVG}
            </div>

            <div className="identity-info">
              <h2>{profile.displayName}</h2>
              <div className="meta">
                <div className="meta-item"><Mail size={16} />{profile.email || '—'}</div>
              </div>
            </div>
          </div>

          {/* Mejores puntuaciones por juego */}
          <div className="card" style={{ marginTop: '20px' }}>
            <h3 className="section-title" style={{ marginBottom: '16px', padding: '16px 16px 0 16px' }}>
              <Award size={18} /> Mejores Puntuaciones
            </h3>
            {bestScores.length === 0 ? (
              <div className="empty">Sin registros aún.</div>
            ) : (
              <div className="table" style={{ width: '100%' }}>
                <div className="thead">
                  <div className="tr" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', padding: '12px 16px' }}>
                    <div className="th" style={{ textAlign: 'left' }}>JUEGO</div>
                    <div className="th" style={{ textAlign: 'center' }}>PUNTUACIÓN</div>
                    <div className="th" style={{ textAlign: 'center' }}>FECHA</div>
                  </div>
                </div>
                <div className="tbody">
                  {bestScores.map((best, i) => (
                    <div className="tr" key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', padding: '12px 16px', borderBottom: i < bestScores.length - 1 ? '1px solid #eee' : 'none' }}>
                      <div className="td" style={{ textAlign: 'left' }}>{best.gameName || '—'}</div>
                      <div className="td strong" style={{ color: '#4caf50', fontWeight: 'bold', textAlign: 'center' }}>
                        {typeof best.score === 'number'
                          ? `${Math.round(best.score * 100)}%`
                          : '—'}
                      </div>
                      <div className="td" style={{ textAlign: 'center' }}>{best.date || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Panel derecho: KPIs tipo tarjetas de resumen */}
        <aside className="right-col">
          <div className="kpi-grid">
            <div className="kpi card kpi-blue">
              <div className="kpi-icon"><Activity size={18} /></div>
              <div className="kpi-body">
                <div className="kpi-label">Total de sesiones</div>
                <div className="kpi-value">{num(stats?.totalSessions)}</div>
              </div>
            </div>

            <div className="kpi card kpi-green">
              <div className="kpi-icon"><BarChart2 size={18} /></div>
              <div className="kpi-body">
                <div className="kpi-label">Juegos jugados</div>
                <div className="kpi-value">{num(stats?.totalGamesPlayed)}</div>
              </div>
            </div>

            <div className="kpi card kpi-orange">
              <div className="kpi-icon"><Award size={18} /></div>
              <div className="kpi-body">
                <div className="kpi-label">Aciertos</div>
                <div className="kpi-value">{num(stats?.correctAnswers)}</div>
              </div>
            </div>

            <div className="kpi card kpi-purple">
              <div className="kpi-icon"><ShieldCheck size={18} /></div>
              <div className="kpi-body">
                <div className="kpi-label">Precisión</div>
                <div className="kpi-value">{accuracyPct}</div>
              </div>
            </div>

            <div className="kpi card kpi-gray">
              <div className="kpi-icon"><Calendar size={18} /></div>
              <div className="kpi-body">
                <div className="kpi-label">Racha</div>
                <div className="kpi-value">{num(stats?.streak)}</div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Modal de confirmación para eliminar cuenta */}
      <DeleteConfirmationModal />
    </div>
  );
};

function prettyLabel(key = '') {
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
