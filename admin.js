/* =========================================================
   admin.js — Painel administrativo: renderização e CRUD
   ========================================================= */

// ── Render principal do admin ─────────────────────────────
function renderAdmin() {
  if (!isLoggedIn) {
    document.getElementById('admin-login-prompt').style.display = 'block';
    document.getElementById('admin-content').style.display      = 'none';
    return;
  }

  document.getElementById('admin-login-prompt').style.display = 'none';
  document.getElementById('admin-content').style.display      = 'block';
  document.getElementById('admin-user-badge').textContent =
    '👤 ' + currentUser.username + ' · ' + (currentUser.role === 'admin' ? 'Administrador' : 'Organizador');

  document.getElementById('config-reg').value = DB.config.regulamento;
  document.getElementById('config-ano').value = DB.config.ano;

  renderAdminEquipes();
  loadTeamsForPlayer();
  renderAdminJogadores();
  loadTeamsForMatch();
  renderAdminJogos();
  renderAdminResultados();
  loadMatchesForGol();
  renderAdminGols();
  renderAdminUsers();
  loadTeamsForJogFilter();
}

function switchAdminTab(name) {
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));

  document.querySelectorAll('.admin-tab').forEach(b => {
    const oc = b.getAttribute('onclick') || '';
    if (oc.includes("'" + name + "'")) b.classList.add('active');
  });

  const panel = document.getElementById('ap-' + name);
  if (panel) panel.classList.add('active');

  if (name === 'resultados') {
    loadMatchesForGol();
    renderAdminGols();
  }
}

// =========================================================
//  EQUIPES
// =========================================================
function renderAdminEquipes() {
  const canDelete = currentUser && currentUser.role === 'admin';
  document.getElementById('admin-equipes-list').innerHTML = `
    <div style="overflow-x:auto">
      <table class="data-table">
        <thead><tr><th>Cat</th><th>Flag</th><th>Nome</th><th>Sala</th><th>Grupo</th><th>Ações</th></tr></thead>
        <tbody>
          ${DB.equipes.map(t => `<tr>
            <td>${t.cat === 'M' ? '⚽ M' : '⚽ F'}</td>
            <td style="font-size:1.5rem">${t.flag}</td>
            <td><strong>${t.nome}</strong></td>
            <td>${t.sala}</td>
            <td>Grupo ${t.grupo}</td>
            <td>
              <button class="btn btn-sm btn-outline" onclick="editEquipe('${t.id}')">✏️</button>
              ${canDelete ? `<button class="btn btn-sm btn-danger" onclick="deleteEquipe('${t.id}')">🗑️</button>` : ''}
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function saveEquipe() {
  const id  = document.getElementById('eq-id').value;
  const obj = {
    cat:    document.getElementById('eq-cat').value,
    nome:   document.getElementById('eq-nome').value.trim(),
    flag:   document.getElementById('eq-flag').value.trim(),
    sala:   document.getElementById('eq-sala').value.trim(),
    grupo:  document.getElementById('eq-grupo').value,
    escudo: document.getElementById('eq-escudo').value.trim(),
  };

  if (!obj.nome) { alert('Preencha o nome da equipe!'); return; }

  if (id) {
    const i = DB.equipes.findIndex(e => e.id === id);
    if (i >= 0) DB.equipes[i] = { ...DB.equipes[i], ...obj };
  } else {
    DB.equipes.push({ id: 'e' + uid(), ...obj });
  }

  saveDB();
  clearEquipeForm();
  renderAdminEquipes();
  alert('Equipe salva com sucesso!');
}

function editEquipe(id) {
  const t = DB.equipes.find(e => e.id === id);
  if (!t) return;
  document.getElementById('eq-id').value    = t.id;
  document.getElementById('eq-cat').value   = t.cat;
  document.getElementById('eq-nome').value  = t.nome;
  document.getElementById('eq-flag').value  = t.flag;
  document.getElementById('eq-sala').value  = t.sala;
  document.getElementById('eq-grupo').value = t.grupo;
  document.getElementById('eq-escudo').value = t.escudo || '';
  document.querySelector('#ap-equipes').scrollIntoView({ behavior: 'smooth' });
}

function deleteEquipe(id) {
  if (!confirm('Tem certeza que deseja excluir esta equipe?')) return;
  DB.equipes = DB.equipes.filter(e => e.id !== id);
  saveDB();
  renderAdminEquipes();
}

function clearEquipeForm() {
  ['eq-id','eq-nome','eq-flag','eq-sala','eq-escudo'].forEach(f => {
    const el = document.getElementById(f);
    if (el) el.value = '';
  });
  document.getElementById('eq-cat').value   = 'M';
  document.getElementById('eq-grupo').value = 'A';
}

// =========================================================
//  JOGADORES
// =========================================================
function loadTeamsForPlayer() {
  const cat   = document.getElementById('jog-cat').value;
  const teams = getTeams(cat);
  document.getElementById('jog-time').innerHTML =
    teams.map(t => `<option value="${t.id}">${t.flag} ${t.nome}</option>`).join('');
}

function loadTeamsForJogFilter() {
  const cat   = document.getElementById('filter-jog-cat').value;
  const teams = getTeams(cat);
  document.getElementById('filter-jog-time').innerHTML =
    '<option value="">Todos</option>' +
    teams.map(t => `<option value="${t.id}">${t.flag} ${t.nome}</option>`).join('');
}

function renderAdminJogadores() {
  const cat     = document.getElementById('filter-jog-cat').value;
  const tid     = document.getElementById('filter-jog-time').value;
  const players = DB.jogadores.filter(j => j.cat === cat && (!tid || j.timeid === tid));
  const canDel  = currentUser && currentUser.role === 'admin';

  document.getElementById('admin-jogadores-list').innerHTML = players.length
    ? `<table class="data-table">
        <thead><tr><th>#</th><th>Nome</th><th>Time</th><th>Ações</th></tr></thead>
        <tbody>${players.map(p => {
          const t = getTeam(p.timeid);
          return `<tr>
            <td>${p.numero || '—'}</td>
            <td>${p.nome}</td>
            <td>${t ? `${t.flag} ${t.nome}` : '—'}</td>
            <td>
              <button class="btn btn-sm btn-outline" onclick="editJogador('${p.id}')">✏️</button>
              ${canDel ? `<button class="btn btn-sm btn-danger" onclick="deleteJogador('${p.id}')">🗑️</button>` : ''}
            </td>
          </tr>`;
        }).join('')}</tbody>
      </table>`
    : '<div class="empty" style="padding:1rem"><span class="empty-text">Nenhum jogador cadastrado</span></div>';
}

function saveJogador() {
  const id  = document.getElementById('jog-id').value;
  const obj = {
    cat:    document.getElementById('jog-cat').value,
    timeid: document.getElementById('jog-time').value,
    nome:   document.getElementById('jog-nome').value.trim(),
    numero: document.getElementById('jog-numero').value,
  };

  if (!obj.nome) { alert('Preencha o nome do jogador!'); return; }

  if (id) {
    const i = DB.jogadores.findIndex(j => j.id === id);
    if (i >= 0) DB.jogadores[i] = { ...DB.jogadores[i], ...obj };
  } else {
    DB.jogadores.push({ id: 'j' + uid(), ...obj });
  }

  saveDB();
  clearJogadorForm();
  renderAdminJogadores();
  alert('Jogador salvo!');
}

function editJogador(id) {
  const p = DB.jogadores.find(j => j.id === id);
  if (!p) return;
  document.getElementById('jog-id').value     = p.id;
  document.getElementById('jog-cat').value    = p.cat;
  loadTeamsForPlayer();
  setTimeout(() => { document.getElementById('jog-time').value = p.timeid; }, 50);
  document.getElementById('jog-nome').value   = p.nome;
  document.getElementById('jog-numero').value = p.numero || '';
}

function deleteJogador(id) {
  if (!confirm('Excluir jogador?')) return;
  DB.jogadores = DB.jogadores.filter(j => j.id !== id);
  saveDB();
  renderAdminJogadores();
}

function clearJogadorForm() {
  ['jog-id','jog-nome','jog-numero'].forEach(f => {
    const el = document.getElementById(f);
    if (el) el.value = '';
  });
}

// =========================================================
//  JOGOS
// =========================================================
function loadTeamsForMatch() {
  const cat   = document.getElementById('jogo-cat').value;
  const teams = getTeams(cat);
  const opts  = teams.map(t => `<option value="${t.id}">${t.flag} ${t.nome}</option>`).join('');
  document.getElementById('jogo-t1').innerHTML = opts;
  document.getElementById('jogo-t2').innerHTML = opts;
}

function renderAdminJogos() {
  const cat     = document.getElementById('filter-jogo-cat').value;
  const matches = getMatches(cat);
  const canDel  = currentUser && currentUser.role === 'admin';

  document.getElementById('admin-jogos-list').innerHTML = matches.length
    ? `<div style="overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>Fase</th><th>Mandante</th><th>Visitante</th><th>Data</th><th>Hora</th><th>Local</th><th>Ações</th></tr></thead>
          <tbody>${matches.map(m => {
            const t1 = getTeam(m.t1), t2 = getTeam(m.t2);
            return `<tr>
              <td><span class="${phaseBadgeClass(m.fase)}">${phaseLabel(m.fase)}</span></td>
              <td>${t1 ? `${t1.flag} ${t1.nome}` : '—'}</td>
              <td>${t2 ? `${t2.flag} ${t2.nome}` : '—'}</td>
              <td>${m.data || '—'}</td>
              <td>${m.hora || '—'}</td>
              <td>${m.local || '—'}</td>
              <td>
                <button class="btn btn-sm btn-outline" onclick="editJogo('${m.id}')">✏️</button>
                ${canDel ? `<button class="btn btn-sm btn-danger" onclick="deleteJogo('${m.id}')">🗑️</button>` : ''}
              </td>
            </tr>`;
          }).join('')}</tbody>
        </table>
      </div>`
    : '<div class="empty" style="padding:1rem"><span class="empty-text">Nenhum jogo cadastrado</span></div>';
}

function saveJogo() {
  const id   = document.getElementById('jogo-id').value;
  const fase = document.getElementById('jogo-fase').value;
  const obj  = {
    cat:   document.getElementById('jogo-cat').value,
    fase,
    t1:    document.getElementById('jogo-t1').value,
    t2:    document.getElementById('jogo-t2').value,
    data:  document.getElementById('jogo-data').value,
    hora:  document.getElementById('jogo-hora').value,
    local: document.getElementById('jogo-local').value.trim(),
    sf_num: fase === 'SF' ? _nextSFNum(document.getElementById('jogo-cat').value) : undefined,
  };

  if (!obj.t1 || !obj.t2 || obj.t1 === obj.t2) {
    alert('Selecione dois times diferentes!');
    return;
  }

  if (id) {
    const i = DB.jogos.findIndex(j => j.id === id);
    if (i >= 0) {
      DB.jogos[i] = {
        ...DB.jogos[i], ...obj,
        played: DB.jogos[i].played,
        g1: DB.jogos[i].g1,
        g2: DB.jogos[i].g2,
      };
    }
  } else {
    DB.jogos.push({ id: 'g' + uid(), ...obj, played: false, g1: null, g2: null });
  }

  saveDB();
  clearJogoForm();
  renderAdminJogos();
  alert('Jogo salvo!');
}

function _nextSFNum(cat) {
  const existing = DB.jogos.filter(j => j.cat === cat && j.fase === 'SF');
  return existing.length === 0 ? 1 : 2;
}

function editJogo(id) {
  const m = DB.jogos.find(j => j.id === id);
  if (!m) return;
  document.getElementById('jogo-id').value   = m.id;
  document.getElementById('jogo-cat').value  = m.cat;
  document.getElementById('jogo-fase').value = m.fase;
  loadTeamsForMatch();
  setTimeout(() => {
    document.getElementById('jogo-t1').value = m.t1;
    document.getElementById('jogo-t2').value = m.t2;
  }, 50);
  document.getElementById('jogo-data').value  = m.data  || '';
  document.getElementById('jogo-hora').value  = m.hora  || '';
  document.getElementById('jogo-local').value = m.local || '';
  document.querySelector('#ap-jogos').scrollIntoView({ behavior: 'smooth' });
}

function deleteJogo(id) {
  if (!confirm('Excluir este jogo?')) return;
  DB.jogos = DB.jogos.filter(j => j.id !== id);
  saveDB();
  renderAdminJogos();
}

function clearJogoForm() {
  ['jogo-id','jogo-data','jogo-hora','jogo-local'].forEach(f => {
    const el = document.getElementById(f);
    if (el) el.value = '';
  });
}

// =========================================================
//  RESULTADOS
// =========================================================
function renderAdminResultados() {
  const cat     = document.getElementById('filter-res-cat').value;
  const matches = getMatches(cat);

  document.getElementById('admin-resultados-list').innerHTML = matches.length
    ? `<div style="overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>Fase</th><th>Mandante</th><th>Visitante</th><th>Resultado</th><th>Ações</th></tr></thead>
          <tbody>${matches.map(m => {
            const t1 = getTeam(m.t1), t2 = getTeam(m.t2);
            return `<tr>
              <td><span class="${phaseBadgeClass(m.fase)}">${phaseLabel(m.fase)}</span></td>
              <td>${t1 ? `${t1.flag} ${t1.nome}` : '—'}</td>
              <td>${t2 ? `${t2.flag} ${t2.nome}` : '—'}</td>
              <td>${m.played
                ? `<strong>${m.g1} × ${m.g2}</strong>`
                : '<span style="color:var(--gray2)">Pendente</span>'}</td>
              <td>
                <button class="btn btn-sm btn-gold" onclick="openResultadoModal('${m.id}')">📝 Resultado</button>
              </td>
            </tr>`;
          }).join('')}</tbody>
        </table>
      </div>`
    : '<div class="empty" style="padding:1rem"><span class="empty-text">Nenhum jogo cadastrado</span></div>';
}

function openResultadoModal(jogoid) {
  const m = getMatch(jogoid);
  if (!m) return;
  const t1 = getTeam(m.t1), t2 = getTeam(m.t2);

  document.getElementById('res-jogo-id').value    = jogoid;
  document.getElementById('modal-res-title').textContent = `${t1 ? t1.nome : '?'} × ${t2 ? t2.nome : '?'}`;
  document.getElementById('res-t1-label').textContent    = t1 ? t1.nome : 'Time 1';
  document.getElementById('res-t2-label').textContent    = t2 ? t2.nome : 'Time 2';
  document.getElementById('res-g1').value = m.g1 || 0;
  document.getElementById('res-g2').value = m.g2 || 0;

  openModal('modal-resultado');
}

function saveResultado() {
  const id = document.getElementById('res-jogo-id').value;
  const m  = DB.jogos.find(j => j.id === id);
  if (!m) return;

  m.g1     = parseInt(document.getElementById('res-g1').value) || 0;
  m.g2     = parseInt(document.getElementById('res-g2').value) || 0;
  m.played = true;

  saveDB();
  closeModal('modal-resultado');
  renderAdminResultados();
  renderAdminGols();
  alert('Resultado salvo!');
}

// =========================================================
//  GOLS
// =========================================================
function loadMatchesForGol() {
  const cat     = document.getElementById('gol-cat-inline').value;
  const matches = getMatches(cat).filter(m => m.played);

  document.getElementById('gol-jogo-inline').innerHTML = matches.map(m => {
    const t1 = getTeam(m.t1), t2 = getTeam(m.t2);
    return `<option value="${m.id}">${t1 ? t1.nome : '?'} ${m.g1}×${m.g2} ${t2 ? t2.nome : '?'}</option>`;
  }).join('');

  loadTeamsForGolInline();
}

function loadTeamsForGolInline() {
  const cat    = document.getElementById('gol-cat-inline').value;
  const jogoid = document.getElementById('gol-jogo-inline').value;
  const m      = getMatch(jogoid);
  if (!m) return;

  const teams = [getTeam(m.t1), getTeam(m.t2)].filter(Boolean);
  document.getElementById('gol-time-inline').innerHTML =
    teams.map(t => `<option value="${t.id}">${t.flag} ${t.nome}</option>`).join('');

  loadPlayersForGolInline();
}

function loadPlayersForGolInline() {
  const cat     = document.getElementById('gol-cat-inline').value;
  const tid     = document.getElementById('gol-time-inline').value;
  const players = getPlayers(cat, tid);

  document.getElementById('gol-jogador-inline').innerHTML = players.length
    ? players.map(p => `<option value="${p.id}" data-nome="${p.nome}">${p.nome}</option>`).join('')
    : '<option value="_manual">— Digitar nome manualmente —</option>';
}

function saveGolInline() {
  const cat    = document.getElementById('gol-cat-inline').value;
  const jogoid = document.getElementById('gol-jogo-inline').value;
  const timeid = document.getElementById('gol-time-inline').value;
  const sel    = document.getElementById('gol-jogador-inline');
  const jogadorid = sel.value;
  const jogador   = sel.options[sel.selectedIndex]?.dataset?.nome
                 || sel.options[sel.selectedIndex]?.text
                 || '?';
  const min = document.getElementById('gol-minuto-inline').value;

  if (!jogoid || !timeid) { alert('Selecione a partida e o time!'); return; }

  DB.gols.push({ id: 'gol' + uid(), cat, jogoid, timeid, jogadorid, jogador, min: min || null });
  saveDB();
  renderAdminGols();
  alert('Gol registrado!');
}

function renderAdminGols() {
  const catEl = document.getElementById('filter-res-cat') || document.getElementById('gol-cat-inline');
  const cat   = catEl ? catEl.value : 'M';
  const gols  = DB.gols.filter(g => g.cat === cat);

  document.getElementById('admin-gols-list').innerHTML = gols.length
    ? `<table class="data-table">
        <thead><tr><th>Partida</th><th>Time</th><th>Jogador</th><th>Min</th><th>Ação</th></tr></thead>
        <tbody>${gols.map(g => {
          const m  = getMatch(g.jogoid);
          const t  = getTeam(g.timeid);
          const t1 = m ? getTeam(m.t1) : null;
          const t2 = m ? getTeam(m.t2) : null;
          return `<tr>
            <td>${t1 ? t1.nome : '?'} × ${t2 ? t2.nome : '?'}</td>
            <td>${t ? `${t.flag} ${t.nome}` : '—'}</td>
            <td>${g.jogador}</td>
            <td>${g.min || '—'}</td>
            <td><button class="btn btn-sm btn-danger" onclick="deleteGol('${g.id}')">🗑️</button></td>
          </tr>`;
        }).join('')}</tbody>
      </table>`
    : '<div class="empty" style="padding:1rem"><span class="empty-text">Nenhum gol registrado</span></div>';
}

function deleteGol(id) {
  if (!confirm('Remover este gol?')) return;
  DB.gols = DB.gols.filter(g => g.id !== id);
  saveDB();
  renderAdminGols();
}

// =========================================================
//  USUÁRIOS
// =========================================================
function renderAdminUsers() {
  const isAdmin = currentUser && currentUser.role === 'admin';
  if (!isAdmin) {
    const wrap = document.getElementById('admin-add-user-wrap');
    if (wrap) wrap.style.display = 'none';
  }

  document.getElementById('admin-users-list').innerHTML = `
    <table class="data-table" style="margin-top:1rem">
      <thead>
        <tr>
          <th>Usuário</th>
          <th>Nível</th>
          ${isAdmin ? '<th>Ações</th>' : ''}
        </tr>
      </thead>
      <tbody>
        ${DB.users.map(u => `<tr>
          <td>${u.username}</td>
          <td>${u.role === 'admin' ? '👑 Administrador' : '🎯 Organizador'}</td>
          ${isAdmin && u.id !== currentUser.id
            ? `<td><button class="btn btn-sm btn-danger" onclick="deleteUser('${u.id}')">🗑️</button></td>`
            : '<td>—</td>'}
        </tr>`).join('')}
      </tbody>
    </table>`;
}

function saveUser() {
  const u = document.getElementById('new-user').value.trim();
  const p = document.getElementById('new-pass').value;
  const r = document.getElementById('new-role').value;

  if (!u || !p)                        { alert('Preencha usuário e senha!'); return; }
  if (DB.users.find(x => x.username === u)) { alert('Usuário já existe!');      return; }

  DB.users.push({ id: 'u' + uid(), username: u, password: p, role: r });
  saveDB();
  renderAdminUsers();
  document.getElementById('new-user').value = '';
  document.getElementById('new-pass').value = '';
  alert('Usuário adicionado!');
}

function deleteUser(id) {
  if (!confirm('Remover este usuário?')) return;
  DB.users = DB.users.filter(u => u.id !== id);
  saveDB();
  renderAdminUsers();
}

// =========================================================
//  CONFIG
// =========================================================
function saveConfig() {
  DB.config.regulamento = document.getElementById('config-reg').value;
  DB.config.ano         = document.getElementById('config-ano').value;
  saveDB();
  alert('Configurações salvas!');
}

function confirmReset(cat) {
  const label = cat === 'M' ? 'Masculino' : 'Feminino';
  if (!confirm(`ATENÇÃO! Isso irá remover TODOS os jogos, gols e resultados do ${label}.\nEquipes e jogadores serão mantidos.\n\nContinuar?`)) return;

  DB.jogos = DB.jogos.filter(j => j.cat !== cat);
  DB.gols  = DB.gols.filter(g  => g.cat !== cat);
  saveDB();
  renderAdmin();
  alert(`Dados do ${label} resetados!`);
}
