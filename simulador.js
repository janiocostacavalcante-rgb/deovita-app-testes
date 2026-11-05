/* Versão de página web do ambiente de testes: responde às chamadas do app dentro do próprio navegador.
   Nada sai daqui. Cada testador tem seus próprios dados fictícios, e eles voltam ao início ao recarregar a página. */
(function () {
  var HOST = 'simulador.invalid';
  var fetchOriginal = window.fetch.bind(window);
  function eDoSimulador(url) {
    try { return new URL(url, location.href).hostname === HOST; } catch (e) { return false; }
  }
  window.fetch = function (entrada, opcoes) {
    var url = typeof entrada === 'string' ? entrada : (entrada && entrada.url) || String(entrada);
    if (!eDoSimulador(url)) return fetchOriginal(entrada, opcoes);
    opcoes = opcoes || {};
    var u = new URL(url);
    var metodo = (opcoes.method || 'GET').toUpperCase();
    var corpo = {};
    try { if (typeof opcoes.body === 'string') corpo = JSON.parse(opcoes.body); } catch (e) { corpo = {}; }
    var cabecalhos = {};
    new Headers(opcoes.headers || {}).forEach(function (v, k) { cabecalhos[k] = v; });
    var caminho = u.pathname.replace(/\/{2,}/g, '/');
    if (caminho.indexOf('/externo/') === 0) {
      return Promise.resolve(new Response('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>', { status: 200, headers: { 'Content-Type': 'image/svg+xml' } }));
    }
    var r = window.SimuladorDeovita.responder(metodo, caminho, corpo, u.searchParams, cabecalhos);
    if (r === undefined) {
      console.info('[simulador] rota sem simulação:', metodo, caminho);
      r = { status: 200, corpo: [] };
    }
    return Promise.resolve(new Response(JSON.stringify(r.corpo), { status: r.status || 200, headers: { 'Content-Type': 'application/json' } }));
  };
})();
