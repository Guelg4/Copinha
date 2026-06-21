/* =========================================================
   helpers.js — Utilitários de UI compartilhados
   ========================================================= */

// ── Rótulos de fase ───────────────────────────────────────
function phaseLabel(fase) {
  const map = {
    A: 'Grupo A', B: 'Grupo B', C: 'Grupo C', D: 'Grupo D',
    SF: 'Semifinal', '3P': '3º Lugar', F: 'Final',
  };
  return map[fase] || fase;
}

function phaseBadgeClass(fase) {
  if (['A','B','C','D'].includes(fase)) return 'tag tag-group';
  if (fase === 'SF')  return 'tag tag-sf';
  if (fase === '3P')  return 'tag tag-3rd';
  if (fase === 'F')   return 'tag tag-final';
  return 'tag';
}

// ── Team cell HTML ────────────────────────────────────────
function teamCell(t) {
  if (!t) {
    return '<span class="team-cell"><span style="color:var(--gray2);font-style:italic">A definir</span></span>';
  }
  const shield = t.escudo
    ? `<img src="${t.escudo}" class="team-shield"
           style="border:1.5px solid var(--gold);box-shadow:0 0 6px rgba(212,160,23,0.3)"
           onerror="this.outerHTML='<div class=\'team-shield\'>${t.flag||'?'}</div>'">`
    : `<div class="team-shield" style="background:var(--navy3);color:var(--gold);font-size:15px">${t.flag || '?'}</div>`;

  return `<span class="team-cell">
    ${shield}
    <span class="team-flag">${t.flag || ''}</span>
    <span>
      <span class="team-name">${t.nome}</span><br>
      <span class="team-class">${t.sala}</span>
    </span>
  </span>`;
}

// ── Gender badge HTML ─────────────────────────────────────
function genderBadgeHTML(g) {
  return g === 'M'
    ? '<span class="gender-badge gb-m">Masculino</span>'
    : '<span class="gender-badge gb-f">Feminino</span>';
}

// ── Atualiza badges de categoria nas páginas ──────────────
function updateGenderBadges() {
  const g     = currentGender;
  const label = g === 'M' ? 'Masculino' : 'Feminino';
  const cls   = 'gender-badge ' + (g === 'M' ? 'gb-m' : 'gb-f');

  ['classif','jogos','chave','artil','estat','equipes'].forEach(id => {
    const el = document.getElementById(id + '-badge');
    if (el) { el.textContent = label; el.className = cls; }
  });
}

// ── Empty state HTML ──────────────────────────────────────
function emptyState(icon, text) {
  return `<div class="empty">
    <span class="empty-icon">${icon}</span>
    <span class="empty-text">${text}</span>
  </div>`;
}

// ── Modais ────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// Fecha modal ao clicar fora
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', function (e) {
      if (e.target === this) this.classList.remove('open');
    });
  });
});

// ── Data formatada PT-BR ──────────────────────────────────
function fmtDate(dateStr, opts) {
  if (!dateStr) return '—';
  const defaults = { day: '2-digit', month: '2-digit' };
  return new Date(dateStr + 'T00:00').toLocaleDateString('pt-BR', opts || defaults);
}