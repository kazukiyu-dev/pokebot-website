(() => {
  const commands = window.POKEBOT_COMMANDS || [];
  const list = document.querySelector('#command-list');
  const search = document.querySelector('#command-search');
  const select = document.querySelector('#command-category');
  const count = document.querySelector('#command-count');
  if (!list || !search || !select || !count) return;

  const categories = [...new Set(commands.map(c => c.category))].sort();
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });

  const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[char]));

  function render() {
    const q = search.value.trim().toLowerCase();
    const category = select.value;
    const filtered = commands.filter(command => {
      const haystack = `${command.command} ${command.description} ${command.category} ${command.usage}`.toLowerCase();
      return (!q || haystack.includes(q)) && (!category || command.category === category);
    });

    count.textContent = `${filtered.length} command${filtered.length === 1 ? '' : 's'} shown`;
    if (!filtered.length) {
      list.innerHTML = '<div class="empty-state"><h3>No commands found</h3><p>Try a broader keyword or choose a different category.</p></div>';
      return;
    }

    list.innerHTML = filtered.map(command => `
      <article class="command-card">
        <div class="command-card-head">
          <div>
            <code>${escapeHtml(command.command)}</code>
            <p>${escapeHtml(command.description)}</p>
          </div>
          <button class="copy-btn" type="button" data-copy="${escapeHtml(command.command)}" aria-label="Copy ${escapeHtml(command.command)}">Copy</button>
        </div>
        <div class="badges">
          <span class="tag">${escapeHtml(command.category)}</span>
          ${command.ownerOnly ? '<span class="tag admin">Owner only</span>' : ''}
          ${command.parameters.length ? `<span class="tag">${command.parameters.length} option${command.parameters.length === 1 ? '' : 's'}</span>` : '<span class="tag">No options</span>'}
        </div>
        ${command.parameters.length ? `<div class="command-usage">Usage: ${escapeHtml(command.usage)}</div>` : ''}
      </article>
    `).join('');
  }

  async function copyText(value, button) {
    try {
      await navigator.clipboard.writeText(value);
      const original = button.textContent;
      button.textContent = 'Copied';
      setTimeout(() => button.textContent = original, 1200);
    } catch {
      const area = document.createElement('textarea');
      area.value = value;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
  }

  list.addEventListener('click', event => {
    const button = event.target.closest('[data-copy]');
    if (button) copyText(button.dataset.copy, button);
  });
  search.addEventListener('input', render);
  select.addEventListener('change', render);
  render();
})();
