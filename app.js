/* =========================================================
   app.js — Controlador de navegação, categoria e inicialização
   ========================================================= */

let currentGender     = 'M';   // 'M' | 'F'
let currentSection    = 'home';
let currentGroupFilter = 'all';

// ── Navegação ─────────────────────────────────────────────
const NAV_LABELS = {
  home:         'Início',
  classificacao: 'Classificação',
  jogos:        'Jogos',
  chaveamento:  'Chaveamento',
  artilharia:   'Artilharia',
  estatisticas: 'Estatísticas',
  equipes:      'Equipes',
  regulamento:  'Regulamento',
  admin:        'Painel Admin',
};

function showSection(name) {
  if (name === 'admin' && !isLoggedIn) {
    openModal('modal-login');
    return;
  }

  // Oculta todas as seções e remove nav ativo
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  // Ativa seção
  const el = document.getElementById('section-' + name);
  if (el) el.classList.add('active');

  // Marca nav ativo pelo texto do botão
  const label = NAV_LABELS[name] || name;
  document.querySelectorAll('.nav-btn').forEach(b => {
    if (b.textContent.trim() === label) b.classList.add('active');
  });

  currentSection = name;
  renderSection(name);
  window.scrollTo(0, 0);
}

function renderSection(name) {
  switch (name) {
    case 'home':          renderHome();          break;
    case 'classificacao': renderClassificacao(); break;
    case 'jogos':         renderJogos();         break;
    case 'chaveamento':   renderChaveamento();   break;
    case 'artilharia':    renderArtilharia();    break;
    case 'estatisticas':  renderEstatisticas();  break;
    case 'equipes':       renderEquipes();       break;
    case 'regulamento':   renderRegulamento();   break;
    case 'admin':         renderAdmin();         break;
  }
}

// ── Filtro de grupo (classificação) ──────────────────────
function filterGroup(g) {
  currentGroupFilter = g;
  renderClassificacao();
}

// ── Alternância Masculino / Feminino ──────────────────────
function setGender(g) {
  currentGender = g;

  document.getElementById('btn-m').classList.toggle('active', g === 'M');
  document.getElementById('btn-f').classList.toggle('active', g === 'F');

  const labelEl = document.getElementById('home-gender-label');
  if (labelEl) {
    labelEl.textContent = (g === 'M' ? '⚽ Masculino' : '⚽ Feminino') + ' · ' + DB.config.ano;
  }

  renderSection(currentSection);
}

// ── Tela de carregamento ──────────────────────────────────
function _showLoadingOverlay() {
  if (document.getElementById('db-loading-overlay')) return;
  const div = document.createElement('div');
  div.id = 'db-loading-overlay';
  div.style.cssText =
    'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;' +
    'justify-content:center;flex-direction:column;gap:1rem;' +
    'background:var(--navy, #0a1628);color:var(--gold, #d4a017);' +
    'font-family:"Inter",sans-serif;';
  div.innerHTML =
    '<div style="font-family:\'Bebas Neue\',cursive;font-size:1.5rem">Carregando dados…</div>' +
    '<div style="font-size:0.85rem;color:#999">Conectando ao banco de dados</div>';
  document.body.appendChild(div);
}

function _hideLoadingOverlay() {
  const el = document.getElementById('db-loading-overlay');
  if (el) el.remove();
}

// Chamado por data.js quando o Firestore carregou pela primeira vez
function onDatabaseReady() {
  _hideLoadingOverlay();
  updateGenderBadges();
  renderSection(currentSection);
}

// Chamado por data.js sempre que algum dado mudar (de qualquer usuário)
function onDatabaseChanged() {
  updateGenderBadges();
  renderSection(currentSection);
}

// ── Inicialização ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  _showLoadingOverlay();
  startDB();
});
