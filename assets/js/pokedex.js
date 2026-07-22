(() => {
  const all = window.POKEBOT_POKEDEX || [];
  const search = document.querySelector('#dex-search');
  const type = document.querySelector('#dex-type');
  const region = document.querySelector('#dex-region');
  const generation = document.querySelector('#dex-generation');
  const grid = document.querySelector('#dex-grid');
  const count = document.querySelector('#dex-count');
  const pagination = document.querySelector('#dex-pagination');
  const modal = document.querySelector('#dex-modal');
  const detail = document.querySelector('#dex-detail');
  if (!search || !grid) return;

  const PAGE_SIZE = 36;
  let page = 1;
  let lastFocused = null;
  const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
  const title = v => String(v || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const roman = n => ['','I','II','III','IV','V','VI','VII','VIII','IX'][Number(n)] || n;

  [...new Set(all.flatMap(p => p.types))].sort().forEach(v => type.insertAdjacentHTML('beforeend', `<option value="${esc(v)}">${esc(title(v))}</option>`));
  [...new Set(all.map(p => p.region))].sort().forEach(v => region.insertAdjacentHTML('beforeend', `<option value="${esc(v)}">${esc(title(v))}</option>`));
  [...new Set(all.map(p => p.generation))].sort((a,b)=>a-b).forEach(v => generation.insertAdjacentHTML('beforeend', `<option value="${esc(v)}">Generation ${roman(v)}</option>`));

  function filtered() {
    const q = search.value.trim().toLowerCase();
    return all.filter(p => {
      const hay = `${p.name} ${p.slug} ${p.id} ${p.types.join(' ')} ${p.region}`.toLowerCase();
      return (!q || hay.includes(q)) && (!type.value || p.types.includes(type.value)) && (!region.value || p.region === region.value) && (!generation.value || String(p.generation) === generation.value);
    });
  }

  function typeBadges(types) { return types.map(t => `<span class="type-badge type-${esc(t)}">${esc(title(t))}</span>`).join(''); }

  function renderPagination(total) {
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    page = Math.min(page, pages);
    const buttons = [];
    buttons.push(`<button type="button" data-page="${page-1}" ${page===1?'disabled':''}>← Previous</button>`);
    const start = Math.max(1, page - 2), end = Math.min(pages, page + 2);
    if (start > 1) buttons.push(`<button type="button" data-page="1">1</button>${start>2?'<span>…</span>':''}`);
    for (let i=start;i<=end;i++) buttons.push(`<button type="button" data-page="${i}" ${i===page?'aria-current="page"':''}>${i}</button>`);
    if (end < pages) buttons.push(`${end<pages-1?'<span>…</span>':''}<button type="button" data-page="${pages}">${pages}</button>`);
    buttons.push(`<button type="button" data-page="${page+1}" ${page===pages?'disabled':''}>Next →</button>`);
    pagination.innerHTML = buttons.join('');
  }

  function render() {
    const list = filtered();
    const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    page = Math.min(page, pages);
    const slice = list.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
    count.textContent = `${list.length} Pokémon shown`;
    grid.innerHTML = slice.length ? slice.map(p => `
      <button class="dex-card" type="button" data-slug="${esc(p.slug)}">
        <span class="dex-number">#${String(p.id).padStart(4,'0')}</span>
        <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">
        <span class="dex-name">${esc(p.name)}</span>
        <span class="dex-types">${typeBadges(p.types)}</span>
        <span class="dex-region">${esc(title(p.region))} · Gen ${roman(p.generation)}</span>
      </button>`).join('') : '<div class="empty-state database-empty"><h3>No Pokémon found</h3><p>Try a different name, type, region, or generation.</p></div>';
    renderPagination(list.length);
  }

  function evolutionHtml(p) {
    const incoming = p.evolvesFrom.map(e => `<div class="evolution-step"><strong>${esc(e.name)}</strong><span>${esc(e.method)}</span><b>→ ${esc(p.name)}</b></div>`).join('');
    const outgoing = p.evolvesTo.map(e => `<div class="evolution-step"><strong>${esc(p.name)}</strong><span>${esc(e.method)}</span><b>→ ${esc(e.name)}</b></div>`).join('');
    return incoming + outgoing || '<p class="muted">No evolution path is configured for this Pokémon.</p>';
  }

  function openDetail(slug, trigger) {
    const p = all.find(x => x.slug === slug);
    if (!p) return;
    lastFocused = trigger;
    const total = Object.values(p.stats).reduce((a,b)=>a+b,0);
    detail.innerHTML = `
      <div class="dex-detail-head">
        <div class="dex-detail-art"><span>#${String(p.id).padStart(4,'0')}</span><img src="${esc(p.image)}" alt="${esc(p.name)}"></div>
        <div><p class="eyebrow">${esc(title(p.region))} · Generation ${roman(p.generation)}</p><h2 id="dex-detail-title">${esc(p.name)}</h2><div class="dex-types detail-types">${typeBadges(p.types)}</div><p>${p.legendary?'Legendary Pokémon. ':''}${p.mythical?'Mythical Pokémon. ':''}Height ${p.heightM} m · Weight ${p.weightKg} kg · Catch rate ${p.catchRate ?? '—'} · Growth ${esc(p.growthRate)}.</p></div>
      </div>
      <div class="detail-columns">
        <section><h3>Base stats <small>Total ${total}</small></h3><div class="stat-bars">${Object.entries(p.stats).map(([name,value])=>`<div class="stat-row"><span>${esc(name)}</span><div><i style="width:${Math.min(100, value/2.55)}%"></i></div><strong>${value}</strong></div>`).join('')}</div></section>
        <section><h3>Abilities</h3><div class="ability-list">${p.abilities.map(a=>`<article><strong>${esc(a.name)}${a.hidden?' <span>Hidden</span>':''}</strong><p>${esc(a.description)}</p></article>`).join('') || '<p class="muted">No abilities configured.</p>'}</div></section>
      </div>
      <section class="detail-section"><h3>How to evolve</h3><div class="evolution-list">${evolutionHtml(p)}</div></section>
      <section class="detail-section"><h3>Level-up moves <small>${p.levelMoves.length} configured</small></h3><div class="level-move-list">${p.levelMoves.map(m=>`<span><b>Lv. ${m.level}</b> ${esc(m.name)} <i class="type-badge type-${esc(m.type)}">${esc(title(m.type))}</i></span>`).join('') || '<p class="muted">No level-up moves configured.</p>'}</div></section>`;
    modal.hidden = false;
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    modal.querySelector('.modal-close').focus();
  }

  function closeModal() {
    modal.hidden = true;
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
    if (lastFocused) lastFocused.focus();
  }

  [search,type,region,generation].forEach(el => el.addEventListener(el===search?'input':'change', () => { page=1; render(); }));
  grid.addEventListener('click', e => { const card=e.target.closest('[data-slug]'); if(card) openDetail(card.dataset.slug, card); });
  pagination.addEventListener('click', e => { const b=e.target.closest('[data-page]'); if(!b || b.disabled) return; page=Number(b.dataset.page); render(); document.querySelector('.database-controls').scrollIntoView({behavior:'smooth',block:'start'}); });
  modal.addEventListener('click', e => { if(e.target.closest('[data-close-modal]')) closeModal(); });
  document.addEventListener('keydown', e => { if(e.key==='Escape' && !modal.hidden) closeModal(); });
  render();
})();
