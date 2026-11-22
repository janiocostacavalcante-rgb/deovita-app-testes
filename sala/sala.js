/* Sala de vídeo própria da DeoVita (sem Jitsi). Uma página só, usada pelo médico e pelo paciente:
   vídeo direto entre os dois (WebRTC), com a marca no canto inferior esquerdo.
   Endereço: sala/?sala=CODIGO&papel=paciente|medico&nome=NOME&com=NOME_DO_OUTRO */
(function () {
  'use strict';
  var cfg = window.SALA_CONFIG || {};
  var q = new URLSearchParams(location.search);
  var SALA = (q.get('sala') || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64);
  var PAPEL = q.get('papel') === 'medico' ? 'medico' : 'paciente';
  var NOME = (q.get('nome') || (PAPEL === 'medico' ? 'Profissional' : 'Paciente')).slice(0, 60);
  var COM = (q.get('com') || '').slice(0, 60);
  var EU = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

  var el = function (id) { return document.getElementById(id); };
  var remoto = el('remoto'), local = el('local'), estado = el('estado'), mensagem = el('mensagem'), bola = el('bola'), centro = el('centro');
  var fluxo = null, pc = null, outro = null, nomeOutro = COM, inicio = 0, relogio = null, encerrada = false, filaIce = [];

  var iniciais = function (n) { return n.split(' ').map(function (p) { return p[0] || ''; }).slice(0, 2).join('').toUpperCase(); };
  function mostra(texto, erro) { centro.hidden = false; mensagem.textContent = texto; mensagem.className = erro ? 'erro' : ''; }
  function titulo() { el('titulo').textContent = nomeOutro ? 'Consulta com ' + nomeOutro : 'Consulta por vídeo'; bola.textContent = iniciais(nomeOutro || (PAPEL === 'medico' ? 'Paciente' : 'Profissional')); }
  function avisa(tipo) { try { var m = { origem: 'sala-deovita', tipo: tipo, sala: SALA }; if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(m)); if (window.parent !== window) window.parent.postMessage(m, '*'); } catch (e) {} }

  /* ---------- Sinalização: como os dois lados trocam os dados para se achar ---------- */
  function sinalAbas() {
    var canal = new BroadcastChannel('deovita-sala-' + SALA);
    return { enviar: function (d) { canal.postMessage(d); }, aoReceber: function (f) { canal.onmessage = function (e) { f(e.data); }; }, fechar: function () { canal.close(); }, pronto: Promise.resolve() };
  }
  function sinalSocket() {
    var s = window.io(cfg.socketUrl || undefined, { transports: ['websocket', 'polling'], auth: { token: q.get('token') || '' } });
    var pronto = new Promise(function (ok, falha) {
      s.on('connect', function () { s.emit('sala:entrar', { sala: SALA, papel: PAPEL, nome: NOME, token: q.get('token') || '' }, function (r) { r && r.ok ? ok() : falha(new Error((r && r.erro) || 'Não foi possível entrar na sala.')); }); });
      s.on('connect_error', function () { falha(new Error('Sem conexão com o servidor de vídeo.')); });
    });
    return { enviar: function (d) { s.emit('sala:sinal', d); }, aoReceber: function (f) { s.on('sala:sinal', f); }, fechar: function () { s.disconnect(); }, pronto: pronto };
  }
  var sinal = null;
  function envia(tipo, extra) { if (sinal) sinal.enviar(Object.assign({ tipo: tipo, de: EU, papel: PAPEL, nome: NOME }, extra || {})); }

  /* ---------- Conexão de vídeo ---------- */
  function novaConexao() {
    if (pc) { try { pc.close(); } catch (e) {} }
    filaIce = [];
    pc = new RTCPeerConnection({ iceServers: cfg.ice || [] });
    if (fluxo) fluxo.getTracks().forEach(function (t) { pc.addTrack(t, fluxo); });
    else { pc.addTransceiver('video', { direction: 'recvonly' }); pc.addTransceiver('audio', { direction: 'recvonly' }); }
    pc.onicecandidate = function (e) { if (e.candidate) envia('candidato', { para: outro, candidato: e.candidate.toJSON() }); };
    pc.ontrack = function (e) { if (remoto.srcObject !== e.streams[0]) { remoto.srcObject = e.streams[0]; remoto.play().catch(function () {}); } };
    pc.onconnectionstatechange = function () {
      if (!pc) return;
      if (pc.connectionState === 'connected') conectou();
      else if (pc.connectionState === 'failed') { estado.textContent = 'Conexão perdida. Tentando de novo…'; if (souQuemLiga()) ligar(); }
      else if (pc.connectionState === 'disconnected') estado.textContent = 'Conexão instável…';
    };
    return pc;
  }
  function souQuemLiga() { return outro && EU > outro; }
  function ligar() { novaConexao(); pc.createOffer().then(function (o) { return pc.setLocalDescription(o); }).then(function () { envia('oferta', { para: outro, sdp: pc.localDescription.toJSON() }); }).catch(falhou); }
  function falhou(e) { console.error(e); estado.textContent = 'Não foi possível conectar o vídeo.'; }
  function conectou() {
    centro.hidden = true; estado.textContent = 'Em chamada'; document.body.dataset.estado = 'em-chamada';
    if (!inicio) { inicio = Date.now(); el('tempo').hidden = false; relogio = setInterval(function () { var s = Math.floor((Date.now() - inicio) / 1000); el('tempo').textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }, 1000); }
    envia('estado', { para: outro, mic: micLigado(), cam: camLigada() });
    avisa('conectada');
  }
  function saiuOutro() {
    outro = null; if (pc) { try { pc.close(); } catch (e) {} pc = null; }
    remoto.srcObject = null; el('aviso-remoto').hidden = true; delete document.body.dataset.estado;
    if (!encerrada) { estado.textContent = 'Aguardando'; mostra((nomeOutro || 'A outra pessoa') + ' saiu da chamada. Aguardando voltar…'); }
  }
  function recebe(d) {
    if (!d || d.de === EU || encerrada) return;
    if (d.para && d.para !== EU) return;
    if (d.tipo === 'ola' || d.tipo === 'ola-de-volta') {
      if (outro && outro !== d.de) return; /* a sala é de duas pessoas */
      var novo = outro !== d.de; outro = d.de; if (d.nome && !COM) nomeOutro = d.nome; titulo();
      if (d.tipo === 'ola') envia('ola-de-volta', { para: d.de });
      if (novo) { estado.textContent = 'Conectando…'; mostra('Conectando com ' + (nomeOutro || 'a outra pessoa') + '…'); if (souQuemLiga()) ligar(); }
    } else if (d.tipo === 'oferta' && d.de === outro) {
      novaConexao(); pc.setRemoteDescription(d.sdp).then(function () { filaIce.splice(0).forEach(function (c) { pc.addIceCandidate(c).catch(function () {}); }); return pc.createAnswer(); }).then(function (a) { return pc.setLocalDescription(a); }).then(function () { envia('resposta', { para: outro, sdp: pc.localDescription.toJSON() }); }).catch(falhou);
    } else if (d.tipo === 'resposta' && d.de === outro && pc) {
      pc.setRemoteDescription(d.sdp).then(function () { filaIce.splice(0).forEach(function (c) { pc.addIceCandidate(c).catch(function () {}); }); }).catch(falhou);
    } else if (d.tipo === 'candidato' && d.de === outro && pc) {
      if (pc.remoteDescription && pc.remoteDescription.type) pc.addIceCandidate(d.candidato).catch(function () {}); else filaIce.push(d.candidato);
    } else if (d.tipo === 'estado' && d.de === outro) {
      var partes = []; if (d.cam === false) partes.push('câmera desligada'); if (d.mic === false) partes.push('microfone desligado');
      var a = el('aviso-remoto'); a.hidden = !partes.length; a.textContent = (nomeOutro || 'A outra pessoa') + ': ' + partes.join(' e ');
    } else if (d.tipo === 'tchau' && d.de === outro) saiuOutro();
  }

  /* ---------- Microfone, câmera e encerrar ---------- */
  function faixa(tipo) { return fluxo ? fluxo.getTracks().filter(function (t) { return t.kind === tipo; })[0] : null; }
  function micLigado() { var t = faixa('audio'); return !!(t && t.enabled); }
  function camLigada() { var t = faixa('video'); return !!(t && t.enabled); }
  function botao(id, ligado, nome) { var b = el(id); b.setAttribute('aria-pressed', ligado ? 'false' : 'true'); b.setAttribute('aria-label', (ligado ? 'Desligar ' : 'Ligar ') + nome); b.querySelector('.risco').toggleAttribute('hidden', ligado); }
  function atualizaBotoes() { botao('mic', micLigado(), 'microfone'); botao('cam', camLigada(), 'câmera'); local.classList.toggle('desligada', !camLigada()); el('mic').disabled = !faixa('audio'); el('cam').disabled = !faixa('video'); }
  el('mic').onclick = function () { var t = faixa('audio'); if (t) { t.enabled = !t.enabled; atualizaBotoes(); envia('estado', { para: outro, mic: micLigado(), cam: camLigada() }); } };
  el('cam').onclick = function () { var t = faixa('video'); if (t) { t.enabled = !t.enabled; atualizaBotoes(); envia('estado', { para: outro, mic: micLigado(), cam: camLigada() }); } };
  function encerrar() {
    if (encerrada) return; encerrada = true; envia('tchau', { para: outro });
    if (relogio) clearInterval(relogio);
    if (pc) { try { pc.close(); } catch (e) {} pc = null; }
    if (fluxo) fluxo.getTracks().forEach(function (t) { t.stop(); });
    if (sinal) setTimeout(function () { sinal.fechar(); }, 200);
    remoto.srcObject = null; local.srcObject = null; local.hidden = true; el('controles').hidden = true; el('aviso-remoto').hidden = true;
    estado.textContent = 'Chamada encerrada'; document.body.dataset.estado = 'encerrada'; mostra('Chamada encerrada.'); el('voltar').hidden = false; el('voltar').focus();
    avisa('encerrada');
  }
  el('sair').onclick = encerrar;
  el('voltar').onclick = function () { avisa('voltar'); if (window.opener || history.length <= 1) window.close(); else history.back(); };
  addEventListener('pagehide', function () { if (!encerrada) envia('tchau', { para: outro }); });

  /* ---------- Entrada ---------- */
  function entrar(comMidia) {
    el('tentar').hidden = true; el('sem-camera').hidden = true; estado.textContent = 'Preparando…'; mostra(comMidia ? 'Ligando a câmera e o microfone…' : 'Entrando…');
    var pedido = comMidia ? navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } }) : Promise.resolve(null);
    pedido.then(function (f) {
      fluxo = f; if (f) { local.srcObject = f; local.hidden = false; } else local.hidden = true; atualizaBotoes();
      var usaSocket = cfg.sinal === 'socket' && typeof window.io === 'function';
      if (cfg.sinal === 'socket' && !usaSocket) throw new Error('O servidor de vídeo não respondeu.');
      sinal = usaSocket ? sinalSocket() : sinalAbas();
      return sinal.pronto;
    }).then(function () {
      sinal.aoReceber(recebe); estado.textContent = 'Aguardando'; document.body.dataset.pronto = '1';
      mostra('Aguardando ' + (nomeOutro || (PAPEL === 'medico' ? 'o paciente' : 'o profissional')) + ' entrar…'); envia('ola');
    }).catch(function (e) {
      var negou = e && (e.name === 'NotAllowedError' || e.name === 'SecurityError'), semAparelho = e && (e.name === 'NotFoundError' || e.name === 'NotReadableError' || e.name === 'OverconstrainedError');
      estado.textContent = 'Não foi possível entrar';
      mostra(negou ? 'A câmera e o microfone não foram liberados. Libere nas permissões do aparelho e tente de novo.' : semAparelho ? 'Não encontramos câmera ou microfone neste aparelho.' : (e && e.message) || 'Não foi possível entrar na sala.', true);
      el('tentar').hidden = false; if (negou || semAparelho) el('sem-camera').hidden = false;
    });
  }
  el('tentar').onclick = function () { entrar(true); };
  el('sem-camera').onclick = function () { entrar(false); };

  titulo();
  if (!SALA) { estado.textContent = 'Endereço incompleto'; mostra('Esta consulta não foi encontrada. Abra a chamada de novo pelo app.', true); el('controles').hidden = true; local.hidden = true; return; }
  if (!window.RTCPeerConnection || !navigator.mediaDevices) { estado.textContent = 'Aparelho sem suporte'; mostra('Este navegador não permite chamada de vídeo. Atualize o app ou o navegador.', true); el('controles').hidden = true; local.hidden = true; return; }
  if (cfg.sinal === 'socket' && typeof window.io !== 'function') {
    var s = document.createElement('script'); s.src = (cfg.socketUrl || '') + '/socket.io/socket.io.js'; s.onload = function () { entrar(true); }; s.onerror = function () { entrar(true); }; document.head.appendChild(s);
  } else entrar(true);
})();
