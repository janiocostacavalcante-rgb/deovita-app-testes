/* Aviso fixo: deixa claro que é ambiente de testes e informa o acesso fictício. */
(function () {
  function mostrar() {
    if (sessionStorage.getItem('aviso-testes-fechado')) return;
    var d = document.createElement('div');
    d.setAttribute('role', 'status');
    d.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483001;background:#744210;color:#fff;font:13px/1.35 system-ui,sans-serif;padding:8px 10px;display:flex;gap:10px;align-items:center;justify-content:space-between';
    var t = document.createElement('span');
    t.textContent = 'Ambiente de testes com dados fictícios. Não digite dados reais. Acesso: CPF 111.444.777-35, senha teste123.';
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = 'Entendi';
    b.style.cssText = 'font:inherit;background:#fff;color:#744210;border:0;border-radius:6px;padding:4px 10px;cursor:pointer;flex:none';
    b.onclick = function () { sessionStorage.setItem('aviso-testes-fechado', '1'); d.remove(); };
    d.appendChild(t);
    d.appendChild(b);
    document.body.appendChild(d);
  }
  if (document.body) mostrar();
  else document.addEventListener('DOMContentLoaded', mostrar);
})();
