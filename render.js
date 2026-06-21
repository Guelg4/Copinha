/* =========================================================
   render.js — Renderizadores das páginas públicas
   ========================================================= */

// ── HOME ──────────────────────────────────────────────────
function renderHome() {
  updateGenderBadges();
  const g       = currentGender;
  const matches = getMatches(g);

  // Próximos jogos
  const upcoming = matches
    .filter(m => !m.played)
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))
    .slice(0, 4);

  document.getElementById('home-proximos').innerHTML = upcoming.length
    ? upcoming.map(m => {
        const t1 = getTeam(m.t1), t2 = getTeam(m.t2);
        return `<div class="upcoming-card">
          <div class="uc-team">${t1 ? `<span>${t1.flag}</span><span>${t1.nome}</span>` : ''}</div>
          <div class="uc-vs">
            <span class="uc-vs-text">VS</span>
            <span class="uc-time">${m.data ? fmtDate(m.data) : 'TBD'} ${m.hora || ''}</span>
          </div>
          <div class="uc-team right">${t2 ? `<span>${t2.nome}</span><span>${t2.flag}</span>` : ''}</div>
        </div>`;
      }).join('')
    : emptyState('📅', 'Nenhum jogo agendado');

  // Últimos resultados
  const played = matches
    .filter(m => m.played)
    .sort((a, b) => (b.data + b.hora).localeCompare(a.data + a.hora))
    .slice(0, 4);

  document.getElementById('home-resultados').innerHTML = played.length
    ? played.map(m => {
        const t1 = getTeam(m.t1), t2 = getTeam(m.t2);
        return `<div class="match-card" style="cursor:default">
          <div class="match-meta">
            <strong>${phaseLabel(m.fase)}</strong>
            ${m.data ? fmtDate(m.data) : '??'}
          </div>
          <div class="match-teams">
            <div class="match-team"><span class="match-flag">${t1 ? t1.flag : '?'}</span><span class="match-tname">${t1 ? t1.nome : '?'}</span></div>
            <div class="match-score">${m.g1} – ${m.g2}</div>
            <div class="match-team"><span class="match-flag">${t2 ? t2.flag : '?'}</span><span class="match-tname">${t2 ? t2.nome : '?'}</span></div>
          </div>
        </div>`;
      }).join('')
    : emptyState('⚽', 'Nenhum resultado ainda');

  // Tabela resumida (top 6 geral)
  const allStandings = ['A','B','C','D'].flatMap(gr => computeStandings(g, gr));
  const top6 = allStandings.sort((a, b) => b.pts - a.pts).slice(0, 6);

  document.getElementById('home-tabela').innerHTML = top6.length
    ? `<table class="data-table">
        <thead><tr><th>#</th><th>Time</th><th>Pts</th><th>Sg</th></tr></thead>
        <tbody>${top6.map((t, i) => `<tr class="${i === 0 ? 'highlight' : ''}">
          <td><span class="rank-badge ${i===0?'rank-1':i===1?'rank-2':i===2?'rank-3':'rank-n'}">${i+1}</span></td>
          <td>${teamCell(t)}</td>
          <td><strong>${t.pts}</strong></td>
          <td>${t.gp - t.gc}</td>
        </tr>`).join('')}</tbody>
      </table>`
    : emptyState('📊', 'Sem dados ainda');

  // Artilheiros em destaque
  const scorers = computeScorers(g).slice(0, 5);
  document.getElementById('home-artilheiros').innerHTML = scorers.length
    ? scorers.map((s, i) => `
        <div class="scorer-row">
          <span class="scorer-rank">${i + 1}</span>
          <span class="scorer-flag">${s.flag}</span>
          <div class="scorer-info">
            <div class="scorer-name">${s.nome}</div>
            <div class="scorer-team">${s.time}</div>
          </div>
          <span class="scorer-goals">${s.gols}</span>
          <span class="scorer-ball">⚽</span>
        </div>`).join('')
    : emptyState('🥅', 'Sem gols registrados');

  // Stats rápidas
  const allGoals  = DB.gols.filter(gl => gl.cat === g);
  const totalJogos = matches.filter(m => m.played).length;
  document.getElementById('home-stats').innerHTML = `
    <div class="stat-item"><div class="stat-val">${matches.length}</div><div class="stat-label">Total de Jogos</div></div>
    <div class="stat-item"><div class="stat-val">${totalJogos}</div><div class="stat-label">Realizados</div></div>
    <div class="stat-item"><div class="stat-val">${allGoals.length}</div><div class="stat-label">Gols</div></div>
    <div class="stat-item"><div class="stat-val">${totalJogos > 0 ? (allGoals.length / totalJogos).toFixed(1) : '—'}</div><div class="stat-label">Média/Jogo</div></div>
    <div class="stat-item"><div class="stat-val">${getTeams(g).length}</div><div class="stat-label">Equipes</div></div>`;
}

// ── CLASSIFICAÇÃO ─────────────────────────────────────────
function renderClassificacao() {
  updateGenderBadges();
  const cat    = currentGender;
  const grupos = currentGroupFilter === 'all' ? ['A','B','C','D'] : [currentGroupFilter];
  let html     = '';

  grupos.forEach(gr => {
    const rows = computeStandings(cat, gr);
    html += `<div style="margin-bottom:2rem">
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem">
        <span style="font-family:'Bebas Neue',cursive;font-size:1.3rem;color:var(--gold2)">Grupo ${gr}</span>
        <span class="tag tag-group">Fase de Grupos</span>
      </div>
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead>
            <tr><th>#</th><th>Equipe</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th><th>Pts</th></tr>
          </thead>
          <tbody>
            ${rows.map((t, i) => `<tr class="${i === 0 ? 'highlight' : ''}">
              <td><span class="rank-badge ${i===0?'rank-1':i===1?'rank-2':i===2?'rank-3':'rank-n'}">${i+1}</span></td>
              <td>${teamCell(t)}</td>
              <td>${t.j}</td><td>${t.v}</td><td>${t.e}</td><td>${t.d}</td>
              <td>${t.gp}</td><td>${t.gc}</td>
              <td>${t.gp - t.gc > 0 ? '+' : ''}<strong>${t.gp - t.gc}</strong></td>
              <td><strong>${t.pts}</strong></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      ${rows.length === 0 ? emptyState('', 'Nenhuma equipe neste grupo') : ''}
    </div>`;
  });

  document.getElementById('classif-content').innerHTML =
    html || emptyState('📊', 'Sem dados');

  // Atualiza aba ativa
  document.querySelectorAll('.group-tab').forEach(b => {
    b.classList.remove('active');
    const oc = b.getAttribute('onclick') || '';
    if (oc.includes("'" + currentGroupFilter + "'")) b.classList.add('active');
  });
}

// ── JOGOS ─────────────────────────────────────────────────
function renderJogos() {
  updateGenderBadges();
  const cat     = currentGender;
  let matches   = getMatches(cat);
  const fGrupo  = document.getElementById('filter-grupo').value;
  const fStatus = document.getElementById('filter-status').value;

  if (fGrupo)            matches = matches.filter(m => m.fase === fGrupo);
  if (fStatus === 'played')  matches = matches.filter(m => m.played);
  if (fStatus === 'pending') matches = matches.filter(m => !m.played);

  matches.sort((a, b) =>
    ((a.data || '9999') + (a.hora || '99')).localeCompare((b.data || '9999') + (b.hora || '99'))
  );

  if (!matches.length) {
    document.getElementById('jogos-content').innerHTML = emptyState('📋', 'Nenhum jogo encontrado');
    return;
  }

  document.getElementById('jogos-content').innerHTML = matches.map(m => {
    const t1     = getTeam(m.t1), t2 = getTeam(m.t2);
    const goals1 = DB.gols.filter(g => g.cat === cat && g.jogoid === m.id && g.timeid === m.t1);
    const goals2 = DB.gols.filter(g => g.cat === cat && g.jogoid === m.id && g.timeid === m.t2);
    const gs1    = goals1.map(g => g.jogador + (g.min ? ' ' + g.min + '\'' : '')).join(', ');
    const gs2    = goals2.map(g => g.jogador + (g.min ? ' ' + g.min + '\'' : '')).join(', ');

    return `<div class="match-card" style="flex-direction:column;align-items:stretch;gap:0.5rem">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem">
        <div class="match-meta">
          <strong>${phaseLabel(m.fase)}</strong>
          ${m.data ? fmtDate(m.data, { day:'2-digit', month:'2-digit', year:'2-digit' }) : '—'} ${m.hora || ''}
          ${m.local ? `<br><span style="color:var(--gray);font-size:10px">📍 ${m.local}</span>` : ''}
        </div>
        <div class="match-teams" style="flex:1">
          <div class="match-team">${t1 ? `<span class="match-flag">${t1.flag}</span><span class="match-tname">${t1.nome}</span>` : ''}</div>
          ${m.played
            ? `<div class="match-score">${m.g1} – ${m.g2}</div>`
            : `<div class="match-score pending">VS</div>`}
          <div class="match-team">${t2 ? `<span class="match-flag">${t2.flag}</span><span class="match-tname">${t2.nome}</span>` : ''}</div>
        </div>
        <span class="${phaseBadgeClass(m.fase)}">${phaseLabel(m.fase)}</span>
      </div>
      ${m.played && (gs1 || gs2)
        ? `<div style="display:flex;justify-content:space-between;padding:0.4rem 0;border-top:1px solid rgba(255,255,255,0.05);font-size:11px;color:var(--gray)">
             <span>⚽ ${gs1 || '—'}</span>
             <span style="text-align:right">⚽ ${gs2 || '—'}</span>
           </div>`
        : ''}
    </div>`;
  }).join('');
}

// ── CHAVEAMENTO ───────────────────────────────────────────
function bracketTeamRow(t, isT1, match) {
  let sc  = '—';
  let win = false;
  if (match && match.played) {
    sc  = isT1 ? match.g1 : match.g2;
    win = isT1
      ? parseInt(match.g1) > parseInt(match.g2)
      : parseInt(match.g2) > parseInt(match.g1);
  }
  return `<div class="bracket-team ${win ? 'winner' : ''}">
    <span class="bt-flag">${t ? t.flag : '?'}</span>
    <span class="bt-name">${t ? t.nome : '<span class="bt-tbd">A definir</span>'}</span>
    <span class="bt-score">${match && match.played ? sc : '—'}</span>
  </div>`;
}

function bracketMatchHTML(t1, t2, m) {
  return `<div class="bracket-match">
    ${bracketTeamRow(t1, true,  m)}
    ${bracketTeamRow(t2, false, m)}
  </div>`;
}

function renderChaveamento() {
  updateGenderBadges();
  const cat  = currentGender;
  const lA   = getBracketLeader(cat, 'A');
  const lB   = getBracketLeader(cat, 'B');
  const lC   = getBracketLeader(cat, 'C');
  const lD   = getBracketLeader(cat, 'D');

  const mSF1 = getBracketMatch(cat, 'SF', 1);
  const mSF2 = getBracketMatch(cat, 'SF', 2);
  const m3P  = getBracketMatch(cat, '3P');
  const mF   = getBracketMatch(cat, 'F');

  const winSF1 = getMatchWinner(mSF1), winSF2 = getMatchWinner(mSF2);
  const losSF1 = getMatchLoser(mSF1),  losSF2 = getMatchLoser(mSF2);

  const t1SF1 = mSF1 ? getTeam(mSF1.t1) : lA;
  const t2SF1 = mSF1 ? getTeam(mSF1.t2) : lB;
  const t1SF2 = mSF2 ? getTeam(mSF2.t1) : lC;
  const t2SF2 = mSF2 ? getTeam(mSF2.t2) : lD;
  const t13P  = m3P  ? getTeam(m3P.t1)  : losSF1;
  const t23P  = m3P  ? getTeam(m3P.t2)  : losSF2;
  const t1F   = mF   ? getTeam(mF.t1)   : winSF1;
  const t2F   = mF   ? getTeam(mF.t2)   : winSF2;

  const winF = getMatchWinner(mF);

  let html = `
    <div class="bracket-round">
      <div class="bracket-round-title">Semifinais</div>
      ${bracketMatchHTML(t1SF1, t2SF1, mSF1)}
      ${bracketMatchHTML(t1SF2, t2SF2, mSF2)}
    </div>
    <div class="bracket-round">
      <div class="bracket-round-title">3º Lugar</div>
      ${bracketMatchHTML(t13P, t23P, m3P)}
    </div>
    <div class="bracket-round">
      <div class="bracket-round-title">🏆 Final</div>
      ${bracketMatchHTML(t1F, t2F, mF)}
    </div>`;

  if (winF) {
    html += `<div class="bracket-round">
      <div class="bracket-round-title">🥇 Campeão</div>
      <div class="bracket-match" style="border-color:var(--gold);background:rgba(212,160,23,0.08)">
        <div class="bracket-team winner" style="justify-content:center;padding:1rem">
          <span style="font-size:1.5rem">${winF.flag}</span>
          <span class="bt-name" style="font-size:1rem">${winF.nome}</span>
          <span style="font-size:1rem">🏆</span>
        </div>
      </div>
    </div>`;
  }

  document.getElementById('bracket-content').innerHTML = html;
}

// ── ARTILHARIA ────────────────────────────────────────────
function renderArtilharia() {
  updateGenderBadges();
  const scorers = computeScorers(currentGender);

  document.getElementById('artilharia-content').innerHTML = scorers.length
    ? `<div style="max-width:600px">${scorers.map((s, i) => `
        <div class="scorer-row">
          <span class="scorer-rank">${i + 1}</span>
          <span class="scorer-flag">${s.flag}</span>
          <div class="scorer-info">
            <div class="scorer-name">${s.nome}</div>
            <div class="scorer-team">${s.time}</div>
          </div>
          <span class="scorer-goals">${s.gols}</span>
          <span class="scorer-ball">⚽</span>
        </div>`).join('')}</div>`
    : emptyState('🥅', 'Nenhum gol registrado ainda');
}

// ── ESTATÍSTICAS ──────────────────────────────────────────
function renderEstatisticas() {
  updateGenderBadges();
  const cat     = currentGender;
  const matches = getMatches(cat).filter(m => m.played);
  const goals   = DB.gols.filter(g => g.cat === cat);

  const allStandings = ['A','B','C','D'].flatMap(gr => computeStandings(cat, gr));
  let bestAtk = null, bestDef = null, mostWins = null;

  if (allStandings.length) {
    bestAtk  = allStandings.reduce((a, b) => b.gp > a.gp ? b : a);
    bestDef  = allStandings.reduce((a, b) => b.gc < a.gc ? b : a);
    mostWins = allStandings.reduce((a, b) => b.v  > a.v  ? b : a);
  }

  let biggestWin  = null;
  let biggestDiff = 0;
  matches.forEach(m => {
    const d = Math.abs(parseInt(m.g1) - parseInt(m.g2));
    if (d > biggestDiff) { biggestDiff = d; biggestWin = m; }
  });

  const avgGoals = matches.length > 0 ? (goals.length / matches.length).toFixed(2) : 0;

  let html = `<div class="cards-grid" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr));margin-bottom:2rem">
    <div class="stat-item"><div class="stat-val">${matches.length}</div><div class="stat-label">Partidas</div></div>
    <div class="stat-item"><div class="stat-val">${goals.length}</div><div class="stat-label">Total de Gols</div></div>
    <div class="stat-item"><div class="stat-val">${avgGoals}</div><div class="stat-label">Média Gols/Jogo</div></div>
    <div class="stat-item"><div class="stat-val">${getTeams(cat).length}</div><div class="stat-label">Equipes</div></div>
    <div class="stat-item"><div class="stat-val">${getPlayers(cat).length}</div><div class="stat-label">Jogadores</div></div>
  </div>`;

  html += `<div class="cards-grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">`;

  if (bestAtk) {
    const t = getTeam(bestAtk.id) || bestAtk;
    html += `<div class="card">
      <div class="card-title">🔥 Melhor Ataque</div>
      ${teamCell(t)}
      <div style="font-size:1.8rem;font-family:'Bebas Neue',cursive;color:var(--gold2);margin-top:0.5rem">${bestAtk.gp} gols</div>
    </div>`;
  }
  if (bestDef) {
    const t = getTeam(bestDef.id) || bestDef;
    html += `<div class="card">
      <div class="card-title">🛡️ Melhor Defesa</div>
      ${teamCell(t)}
      <div style="font-size:1.8rem;font-family:'Bebas Neue',cursive;color:var(--gold2);margin-top:0.5rem">${bestDef.gc} gols sofridos</div>
    </div>`;
  }
  if (mostWins) {
    const t = getTeam(mostWins.id) || mostWins;
    html += `<div class="card">
      <div class="card-title">🏆 Mais Vitórias</div>
      ${teamCell(t)}
      <div style="font-size:1.8rem;font-family:'Bebas Neue',cursive;color:var(--gold2);margin-top:0.5rem">${mostWins.v} vitórias</div>
    </div>`;
  }
  if (biggestWin) {
    const t1 = getTeam(biggestWin.t1), t2 = getTeam(biggestWin.t2);
    html += `<div class="card">
      <div class="card-title">💥 Maior Goleada</div>
      <div style="font-size:14px;margin-bottom:0.25rem">${t1 ? t1.nome : '?'} ${biggestWin.g1}×${biggestWin.g2} ${t2 ? t2.nome : '?'}</div>
      <div style="font-size:11px;color:var(--gray)">Diferença de ${biggestDiff} gols</div>
    </div>`;
  }

  html += `</div>`;
  document.getElementById('estatisticas-content').innerHTML = html;
}

// ── EQUIPES ───────────────────────────────────────────────
function renderEquipes() {
  updateGenderBadges();
  const teams = getTeams(currentGender);

  document.getElementById('equipes-cards').innerHTML = teams.length
    ? teams.map(t => `
        <div class="team-card">
          ${t.escudo
            ? `<img src="${t.escudo}" alt="${t.nome}"
                style="width:90px;height:90px;border-radius:50%;object-fit:cover;
                       margin:0 auto 0.75rem;display:block;
                       border:2px solid var(--border);
                       box-shadow:0 0 18px rgba(212,160,23,0.2)">`
            : `<span class="team-card-flag" style="font-size:3rem">${t.flag}</span>`}
          <div class="team-card-name">${t.flag} ${t.nome}</div>
          <div class="team-card-class">${t.sala}</div>
          <div class="team-card-group">Grupo ${t.grupo}</div>
        </div>`).join('')
    : emptyState('🛡️', 'Nenhuma equipe cadastrada');
}

// ── REGULAMENTO ───────────────────────────────────────────
function renderRegulamento() {
  document.getElementById('regulamento-content').innerHTML = `
    <div style="max-width:700px">
      <div style="background:var(--navy2);border:1px solid var(--border2);border-radius:12px;padding:2rem">
        <pre style="white-space:pre-wrap;font-family:'Inter',sans-serif;font-size:14px;line-height:1.8;color:var(--white)">${DB.config.regulamento}</pre>
      </div>
    </div>`;
}