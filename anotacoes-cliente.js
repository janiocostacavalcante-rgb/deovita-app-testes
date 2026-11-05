/* Modo de anotações do ambiente de testes. Fica fora do código do app: o simulador injeta este arquivo no HTML. */
(function () {
  if (window.__anotacoesDeovita) return;
  window.__anotacoesDeovita = true;

  var estilo = document.createElement('style');
  estilo.textContent = [
    '#an-raiz{position:fixed;right:8px;bottom:92px;z-index:2147483000;font:14px/1.4 system-ui,sans-serif;color:#1a202c}',
    '#an-raiz button{font:inherit;cursor:pointer;border-radius:8px;border:1px solid #cbd5e0;background:#fff;color:#1a202c;padding:8px 12px}',
    '#an-raiz button.an-prim{background:#1a365d;border-color:#1a365d;color:#fff}',
    '#an-raiz button:focus-visible,#an-raiz textarea:focus-visible,#an-raiz input:focus-visible{outline:2px solid #2b6cb0;outline-offset:2px}',
    '#an-painel{position:absolute;right:0;bottom:48px;width:min(340px,calc(100vw - 24px));max-height:70vh;overflow:auto;background:#fff;border:1px solid #cbd5e0;border-radius:10px;padding:12px;box-shadow:0 8px 24px rgba(0,0,0,.2)}',
    '#an-painel h2{font-size:15px;margin:0 0 8px;font-weight:600}',
    '#an-painel label{display:block;margin:8px 0 4px;font-size:13px}',
    '#an-painel textarea,#an-painel input{width:100%;box-sizing:border-box;padding:8px;border:1px solid #cbd5e0;border-radius:6px;font:inherit;color:#1a202c;background:#fff}',
    '#an-painel .an-linha{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}',
    '#an-painel .an-item{border-top:1px solid #e2e8f0;padding:8px 0;font-size:13px}',
    '#an-painel .an-meta{color:#4a5568;font-size:12px;overflow-wrap:anywhere}',
    '#an-painel .an-erro{color:#c53030;font-size:13px;margin-top:6px}',
    '.an-alvo{outline:3px solid #dd6b20 !important;outline-offset:1px}',
    '#an-aviso{position:fixed;top:0;left:0;right:0;z-index:2147483000;background:#1a365d;color:#fff;font:13px system-ui,sans-serif;text-align:center;padding:6px 10px}',
  ].join('');
  document.head.appendChild(estilo);

  var raiz = document.createElement('div');
  raiz.id = 'an-raiz';
  raiz.innerHTML = '<div id="an-painel" hidden></div><button type="button" class="an-prim" id="an-abrir">Anotar</button>';
  document.body.appendChild(raiz);

  var painel = raiz.querySelector('#an-painel');
  var botao = raiz.querySelector('#an-abrir');
  var escolhendo = false;
  var alvo = null;
  var aviso = null;
  var rascunho = '';

  var URL_PLANILHA = window.ANOTACOES_URL || '';
  var loja = URL_PLANILHA ? {
    listar: function () {
      return fetch(URL_PLANILHA, { cache: 'no-store' }).then(function (r) {
        if (!r.ok) throw new Error();
        return r.json();
      }).then(function (d) {
        return (d.notas || []).filter(function (n) { return n.app === 'deovita-app'; }).map(function (n) {
          return { id: n.num, texto: n.texto, situacao: n.status, autor: n.autorNome, tela: n.telaOriginal || n.tela };
        });
      });
    },
    salvar: function (a) {
      var nota = {
        id: 'app-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8), app: 'deovita-app', status: 'aberta', criado: new Date().toISOString(),
        tela: 'app-deovita', telaOriginal: a.tela, telaNome: 'App DeoVita: ' + a.tela, autorNome: a.autor, texto: a.texto,
        elemento: a.elemento, textoDoElemento: a.textoDoElemento, tamanhoDaTela: a.tamanhoDaTela,
      };
      return fetch(URL_PLANILHA, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ acao: 'add', nota: nota }) }).then(function (r) {
        if (!r.ok) throw new Error();
      });
    },
  } : {
    listar: function () {
      return fetch('/__teste/anotacoes').then(function (r) { if (!r.ok) throw new Error(); return r.json(); });
    },
    salvar: function (a) {
      return fetch('/__teste/anotacoes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(a) }).then(function (r) { if (!r.ok) throw new Error(); });
    },
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function descrever(el) {
    if (!el) return '';
    var partes = [];
    var atual = el;
    for (var i = 0; atual && atual.nodeType === 1 && i < 4; i++) {
      var p = atual.tagName.toLowerCase();
      if (atual.id) { partes.unshift(p + '#' + atual.id); break; }
      var pai = atual.parentElement;
      if (pai) p += ':nth-child(' + (Array.prototype.indexOf.call(pai.children, atual) + 1) + ')';
      partes.unshift(p);
      atual = pai;
    }
    return partes.join(' > ');
  }

  function limparAlvo() {
    if (alvo) alvo.classList.remove('an-alvo');
    alvo = null;
  }

  function pararEscolha() {
    escolhendo = false;
    document.removeEventListener('click', aoEscolher, true);
    if (aviso) { aviso.remove(); aviso = null; }
  }

  function aoEscolher(ev) {
    if (raiz.contains(ev.target)) return;
    ev.preventDefault();
    ev.stopPropagation();
    limparAlvo();
    alvo = ev.target;
    alvo.classList.add('an-alvo');
    pararEscolha();
    mostrarFormulario();
  }

  function escolher() {
    rascunho = (painel.querySelector('#an-texto') || {}).value || rascunho;
    escolhendo = true;
    aviso = document.createElement('div');
    aviso.id = 'an-aviso';
    aviso.textContent = 'Toque no ponto da tela que você quer comentar.';
    document.body.appendChild(aviso);
    painel.hidden = true;
    document.addEventListener('click', aoEscolher, true);
  }

  function mostrarFormulario(erro) {
    var autor = localStorage.getItem('anotacoes-autor') || '';
    var marcado = alvo ? (alvo.innerText || alvo.getAttribute('aria-label') || alvo.tagName.toLowerCase()).trim().slice(0, 60) : '';
    painel.innerHTML =
      '<h2>Nova anotação</h2>' +
      '<div class="an-meta">Tela: ' + esc(location.pathname) + '</div>' +
      '<div class="an-meta">' + (alvo ? 'Ponto marcado: ' + esc(marcado) : 'Sem ponto marcado: vale para a tela inteira.') + '</div>' +
      '<label for="an-autor">Seu nome</label><input id="an-autor" autocomplete="name" value="' + esc(autor) + '">' +
      '<label for="an-texto">O que precisa mudar?</label><textarea id="an-texto" rows="4">' + esc(rascunho) + '</textarea>' +
      (erro ? '<div class="an-erro" role="alert">' + esc(erro) + '</div>' : '') +
      '<div class="an-linha"><button type="button" class="an-prim" id="an-salvar">Salvar</button>' +
      '<button type="button" id="an-marcar">' + (alvo ? 'Marcar outro ponto' : 'Marcar um ponto') + '</button>' +
      '<button type="button" id="an-ver">Ver anotações</button></div>';
    painel.hidden = false;
    painel.querySelector('#an-salvar').onclick = salvar;
    painel.querySelector('#an-marcar').onclick = escolher;
    painel.querySelector('#an-ver').onclick = listar;
    painel.querySelector('#an-texto').focus();
  }

  function salvar() {
    var texto = painel.querySelector('#an-texto').value.trim();
    var autor = painel.querySelector('#an-autor').value.trim();
    rascunho = painel.querySelector('#an-texto').value;
    if (!texto) return mostrarFormulario('Escreva o que precisa mudar.');
    localStorage.setItem('anotacoes-autor', autor);
    var botaoSalvar = painel.querySelector('#an-salvar');
    botaoSalvar.disabled = true;
    loja.salvar({
      autor: autor,
      texto: texto,
      tela: location.pathname + location.search,
      elemento: descrever(alvo),
      textoDoElemento: alvo ? (alvo.innerText || '').trim().slice(0, 200) : '',
      tamanhoDaTela: innerWidth + 'x' + innerHeight,
    }).then(function () {
      rascunho = '';
      limparAlvo();
      listar();
    }).catch(function () {
      mostrarFormulario('Não foi possível salvar. Seu texto continua aqui: tente de novo.');
    });
  }

  function listar() {
    rascunho = (painel.querySelector('#an-texto') || {}).value || rascunho;
    painel.hidden = false;
    painel.innerHTML = '<h2>Anotações</h2><div class="an-meta">Carregando…</div>';
    loja.listar().then(function (lista) {
      var itens = lista.slice().reverse().map(function (a) {
        return '<div class="an-item"><div>' + esc(a.texto) + '</div><div class="an-meta">#' + a.id + ' · ' + esc(a.situacao) + ' · ' + esc(a.autor) + ' · ' + esc(a.tela) + '</div></div>';
      }).join('');
      painel.innerHTML = '<h2>Anotações (' + lista.length + ')</h2>' + (itens || '<div class="an-meta">Nenhuma anotação ainda.</div>') +
        '<div class="an-linha"><button type="button" class="an-prim" id="an-nova">Nova anotação</button></div>';
      painel.querySelector('#an-nova').onclick = function () { mostrarFormulario(); };
    }).catch(function () {
      painel.innerHTML = '<h2>Anotações</h2><div class="an-erro" role="alert">Não foi possível carregar.</div><div class="an-linha"><button type="button" id="an-tentar">Tentar de novo</button></div>';
      painel.querySelector('#an-tentar').onclick = listar;
    });
  }

  botao.onclick = function () {
    if (escolhendo) { pararEscolha(); }
    if (!painel.hidden) { rascunho = (painel.querySelector('#an-texto') || {}).value || rascunho; painel.hidden = true; limparAlvo(); return; }
    mostrarFormulario();
  };
})();
