/*
 * API simulada do app DeoVita. Todos os dados são inventados.
 * Os formatos seguem o que o client lê; os campos com a grafia "sucess" são do código original.
 * Pagamentos, mensagens e consultas não saem daqui: nada é cobrado ou enviado.
 */
const CPF = '11144477735';
const SENHA = 'teste123';
const TOKEN = 'token-ficticio-ambiente-de-testes';
const hoje = () => new Date().toISOString().slice(0, 10);
const somarDias = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

const estado = {
  dependentes: [
    { paciente_contrato_dependente_id: 501, paciente_id: 2002, nome: 'Bia Exemplo Teste', cpf: '52998224725', nascimento: '2012-04-10', sexo: 'F', celular: '85900000002', cep: '60000000', logradouro: 'Rua Fictícia', numero: '100', complemento: '', bairro: 'Centro', municipio: 'Fortaleza', estado: 'CE', codigo_ibge: '2304400' },
  ],
  pets: [{ paciente_contrato_dependente_id: 601, paciente_id: 2003, nome: 'Rex Exemplo', especie: 'Cão', raca: 'SRD', nascimento: '2020-01-15', sexo: 'M' }],
  cartoes: [{ paciente_cartao_credito_pagarme_id: 701, first_digits: '411111', last_digits: '1111', brand: 'visa', holder_name: 'ANA EXEMPLO TESTE', holder_document: CPF, expiration_date: '12/30', card_id_pagarme: 'card_ficticio_1', default: true }],
  parcelasAbertas: [
    { paciente_contrato_parcelas_id: 9003, valor: 49.9, data: somarDias(5), id_transaction: null, taxa_adesao: false, split_vendedor: null, parcela: 3, forma_pagamento_id: 12, forma_pagamento: 'Cartão de crédito', ativo: true, excluido: false },
  ],
  parcelasPagas: [
    { paciente_contrato_parcelas_id: 9001, valor: 49.9, data: somarDias(-55), data_pagamento: somarDias(-55), parcela: 1, forma_pagamento_id: 12, forma_pagamento_fatura: 'Cartão de crédito', forma_pagamento: 'Cartão de crédito', ativo: false, excluido: false, id_armazenamento_arm: null },
    { paciente_contrato_parcelas_id: 9002, valor: 49.9, data: somarDias(-25), data_pagamento: somarDias(-25), parcela: 2, forma_pagamento_id: 12, forma_pagamento_fatura: 'Cartão de crédito', forma_pagamento: 'Cartão de crédito', ativo: false, excluido: false, id_armazenamento_arm: null },
  ],
  filaTelemedicina: null,
};

const usuario = () => ({
  cep: '60000000', numero_residencial: '100', adesao_pendente: false, termo: 'aceito', username: CPF,
  id_cliente_deovita: 2001, id_contrato: 3001, id_contrato_dependent: [], id_plano: 10, provedor: 'pagarme', id_forma_pagamento: 12,
  descricao_plano: 'Plano Família (teste)', termoTelemed: true, name: 'Ana Exemplo Teste', phone1: '85900000001', phone2: '', phone3: '',
  cpf: CPF, rg: '0000000', data_aniv: '1990-05-20', sexo: 'F', logradouro: 'Rua Fictícia', numero: '100', complemento: '', bairro: 'Centro',
  cidade: 'Fortaleza', uf: 'CE', code_ibge: '2304400', email: 'ana.exemplo@example.com', cod_enel: null, situacao: 'ATIVO',
  inicio_contrato: somarDias(-60), conciliado_rapidoc: false, id_rapidoc: null, qtde_max_dependentes: 4, qtde_max_dependentes_total: 4,
  taxa_remocao_dependente: 0, cards: estado.cartoes, adicionais: [], adicionais_pendentes: [], popup_adicionais: false, avaliacao_pendente: false,
  empreendedor: false, id_empreendedor: null, id_vendedor: null, url: '', qrcode: '', titular: true, valor_adicional: 0,
  contrato_pendente_pagamento: false, recipient_id: null, cart: [], qntdeParcelas: { countParcelas: estado.parcelasAbertas.length, datasParcelas: estado.parcelasAbertas.map((p) => p.data) },
  coordenadas_cidade: { latitude: -3.73, longitude: -38.52 }, client_deovita: true, qntde_solicitacoes: 0, qntde_solicitacoes_consulta: 0,
  telemedicina: true, forma_pagamento: 'Cartão de crédito', telepet: true, allowsTelemedicina: true, aceite_versao: true,
  creditoTelemed: [{ paciente_credito_id: 1 }], creditoTelepet: [{ paciente_credito_id: 2 }], creditoPediatra: [{ paciente_credito_id: 3 }], getCreditosParticular: [], atendimento_telemedicina: [], aviso_psicologo: false, pesquisaParcelasPendentes: 0,
  clienteImportado: { clientImportado: false, empreendedor: { contrato_id: null } },
});

const beneficios = [{ descricao: 'Telemedicina 24 horas' }, { descricao: 'Descontos em exames e consultas' }, { descricao: 'Até 4 dependentes' }];
const planos = () => [
  { forma_pagamento_id: 10, nome_impressao: 'Plano Família (teste)', parcelas: 12, recomendado: true, beneficios_plano: beneficios, valor_parcelas: [{ quantidade: 12, modalidades: [{ nome: 'Cartão de crédito', plano_id: 10, quantidade: 12, valor: 49.9, forma_id: 12 }, { nome: 'Pix', plano_id: 10, quantidade: 12, valor: 47.9, forma_id: 5 }] }] },
  { forma_pagamento_id: 11, nome_impressao: 'Plano Individual (teste)', parcelas: 12, recomendado: false, beneficios_plano: beneficios.slice(0, 2), valor_parcelas: [{ quantidade: 12, modalidades: [{ nome: 'Cartão de crédito', plano_id: 11, quantidade: 12, valor: 29.9, forma_id: 12 }] }] },
];

const valoresTelemedicina = () => ({
  prontoAtendimento: { faltou: false, valor_clinico: 0, valor_pediatra: 0, valor_veterinario: 0, id_procedimento_clinico: 1, id_procedimento_pediatra: 2, id_procedimento_veterinario: 3, valor_clinico_assinante: 0, valor_pediatra_assinante: 0, valor_veterinario_assinante: 0 },
  especialista: { faltou: false, valor_psicologia: 80, valor_ortopedista: 90, valor_dermatologista: 90, valor_nutricionista: 70, id_procedimento_psicologia: 4, id_procedimento_ortopedista: 5, id_procedimento_dermatologista: 6, id_procedimento_nutricionista: 7, a_partir_de_psicologia: 80, a_partir_de_ortopedista: 90, a_partir_de_dermatologista: 90, a_partir_de_nutricionista: 70 },
  prontoAtendimento_gratis: true,
});

const ok = (corpo, status = 200) => ({ status, corpo });

/** Rotas exatas e por padrão. Retorno undefined = ainda sem simulação (registrado pelo servidor). */
const ROTAS = [
  ['POST', /^\/auth\/login$/, (_m, c) => {
    const nome = String(c.username || '').replace(/\D/g, '');
    if (nome === CPF && c.password === SENHA) return ok({ loggedIn: true, token: TOKEN, ...usuario() });
    return ok({ loggedIn: false, status: 'CPF ou senha incorretos.' });
  }],
  ['GET', /^\/auth\/login$/, (_m, _c, _q, h) => (String(h.authorization || '').includes(TOKEN) ? ok({ loggedIn: true, ...usuario() }) : ok({ loggedIn: false }))],
  ['POST', /^\/auth\/recoveryData$/, () => ok({ success: true, data: usuario() })],
  ['GET', /^\/auth\/logout/, () => ok({ success: true })],
  ['GET', /^\/logout\//, () => ok({ success: true })],

  ['GET', /^\/clients\/getClubeVantagens$/, () => ok([{ id: 1, nome: 'Parceiro Fictício', descricao: '10% de desconto (exemplo)', imagem: '', link: '' }])],
  ['POST', /^\/cart$/, () => ok({ success: true })],
  ['GET', /^\/cart\/updateCart\//, () => ok({ cart: [], solicitacoes: 0, solicitacoes_consulta: 0 })],
  ['POST', /^\/pacientes\/pesquisarValoresTelemedicina$/, () => ok(valoresTelemedicina())],
  ['POST', /^\/pacientes\/pesquisarValoresPresenciais$/, () => ok({ data: [] })],
  ['POST', /^\/pacientes\/getStatusTelepet$/, () => ok({ ativo: true })],
  ['POST', /^\/client\/dependents-no-cpf$/, () => ok({ data: [] })],
  ['POST', /^\/logs\/loginLog$/, () => ok({ success: true })],
  ['GET', /^\/cache\/telemedicine$/, () => ok(estado.filaTelemedicina ? [estado.filaTelemedicina] : [])],
  ['DELETE', /^\/cache\/telemedicine\/\d+$/, () => { estado.filaTelemedicina = null; return ok({ message: 'Removido.' }); }],

  ['GET', /^\/plans$/, () => ok(planos())],
  ['GET', /^\/plans\/black-friday$/, () => ok(planos().map((p) => ({ ...p, telemedicina_ilimitada: true })))],
  ['GET', /^\/plans\/\d+\/pagamentos\/[^/]+$/, () => ok([{ forma_rendimento_parcelas_id: 1, nome: 'Cartão de crédito', valor: 49.9, valor_promocional: null, forma_rendimento_id: 12, valor_minimo_parcela: 10, parcelamento_maximo: 12, perm_parcelamento: true, supervisor: 0, vendedor: 0, gerente: 0 }])],
  ['POST', /^\/clients\/searchPlanoValue$/, () => ok({ success: true, simestralidade: 12, valor: { valor: 49.9, pet_gratuito: 1, valor_extra_dep: 10, taxa_remocao_dependente: 0 } })],
  ['POST', /^\/client\/dependentsCancelados$/, () => ok({ success: true, data: [] })],
  ['GET', /^\/cache\/schedule-changes$/, () => ok([])],
  ['GET', /^\/installments\/pet-credit$/, () => ok([])],
  ['POST', /^\/clients\/getContratoCancelado$/, () => ok({ data: [] })],
  ['GET', /^\/extras\/byPlanId\/\d+$/, () => ok([])],

  ['POST', /^\/client\/dependents$/, () => ok({ success: true, data: estado.dependentes })],
  ['POST', /^\/client\/dependents2$/, () => ok({ success: true, data: estado.dependentes })],
  ['POST', /^\/client\/pets$/, () => ok({ data: estado.pets })],
  ['POST', /^\/client\/add_dependent$/, (_m, c) => {
    estado.dependentes.push({ paciente_contrato_dependente_id: 500 + estado.dependentes.length + 1, paciente_id: 2100 + estado.dependentes.length, nome: c.nome || c.name || 'Dependente Fictício', cpf: c.cpf || '', nascimento: c.nascimento || '2000-01-01', sexo: c.sexo || 'F', celular: c.celular || '', cep: '60000000', logradouro: 'Rua Fictícia', numero: '100', complemento: '', bairro: 'Centro', municipio: 'Fortaleza', estado: 'CE', codigo_ibge: '2304400' });
    return ok({ success: true, data: {} });
  }],
  ['POST', /^\/client\/del_dependent$/, (_m, c) => {
    estado.dependentes = estado.dependentes.filter((d) => d.paciente_contrato_dependente_id !== Number(c.id));
    return ok({ success: true });
  }],
  ['GET', /^\/pacientes\/[^/]+\/[^/]+\/[^/]+\/[^/]+$/, () => ok([
    { paciente_id: 2001, nome: 'Ana Exemplo Teste', cpf: CPF, idade: 36, sexo: 'F', telefone: '', celular: '85900000001', whatsapp: '85900000001' },
    ...estado.dependentes.map((d) => ({ paciente_id: d.paciente_id, nome: d.nome, cpf: d.cpf, idade: 14, sexo: d.sexo, telefone: '', celular: d.celular, whatsapp: d.celular })),
  ])],

  ['POST', /^\/client\/parcelas$/, () => ok(estado.parcelasAbertas)],
  ['POST', /^\/clients\/fetchStatusParcelas$/, (_m, c) => ok((c.parcelas || []).map((id) => ({ id, status: 'pending' })))],
  ['GET', /^\/clients\/parcelas\/pagas\/\d+$/, () => ok(estado.parcelasPagas)],
  ['GET', /^\/clients\/parcelas\/historico\/\d+$/, () => ok([...estado.parcelasPagas, ...estado.parcelasAbertas])],
  ['POST', /^\/clients\/getCreditCardsByClient\/\d+$/, () => ok(estado.cartoes)],
  ['POST', /^\/pagamento\/criar-cartao$/, (_m, c) => {
    // Nunca guarda número nem CVV: só os dígitos que qualquer comprovante mostra.
    const n = String(c.number || '').replace(/\D/g, '');
    return ok({ id: `card_ficticio_${Date.now()}`, first_six_digits: n.slice(0, 6), last_four_digits: n.slice(-4), brand: 'visa', holder_name: c.holder_name, holder_document: c.holder_document, exp_month: c.exp_month, exp_year: c.exp_year });
  }],
  ['POST', /^\/client\/add_credit_card$/, () => ok({ success: true, id: 702, fingerprint_card_pagarme: 'ficticio', default: false })],
  ['POST', /^\/client\/rm_credit_card\/\d+$/, () => ok({ success: true })],
  ['POST', /^\/client\/stamp-default-card\/\d+$/, () => ok({ success: true })],
  ['POST', /^\/payment\/[^/]+\/card$/, () => ok({ sucess: true, message: 'Pagamento simulado aprovado. Nada foi cobrado.', id: 'pag_ficticio' })],
  ['POST', /^\/payment\/[^/]+\/pix$/, () => ok({ sucess: true, message: 'Pix simulado. Nada foi cobrado.', id: 'pix_ficticio', pix_code: 'PIX-FICTICIO-AMBIENTE-DE-TESTES' })],
  ['POST', /^\/payment\/[^/]+\/boleto$/, () => ok({ sucess: true, message: 'Boleto simulado. Nada foi cobrado.', id: 'bol_ficticio', boleto_url: '', boleto_barcode: '00000000000000000000000000000000000000000000' })],

  ['POST', /^\/clients\/getStatusChamada$/, () => ok('AGUARDANDO')],
  ['POST', /^\/telemedicine\/enter-room$/, () => ok({ message: 'Sala simulada: a chamada de vídeo não ocorre neste ambiente.' })],
  ['GET', /^\/schedule\/scheduletelemed\/[^/]+$/, () => ok({ agenda_exames_id: 8001, paciente_id: 2001, medico_id: null, medico_ready: false, faturado: true, position: 2, avg_wait_time: 12, avg_wait_time_min_minutos: 8, avg_wait_time_max_minutos: 16 })],
  ['GET', /^\/schedule\/scheduletelemedEspecialist\/[^/]+$/, () => ok({ position: 2, medico_ready: false })],
  ['GET', /^\/schedule\/get_motivos_cancelamento$/, () => ok([{ id: 1, descricao: 'Não preciso mais' }, { id: 2, descricao: 'Demorou muito' }])],
  ['POST', /^\/clients\/cancelarAtendimento$/, () => { estado.filaTelemedicina = null; return ok({ success: true }); }],
  ['GET', /^\/pet\/medico_online$/, () => ok([])],
  ['GET', /^\/pet\/schedule\/[^/]+$/, () => ok({})],
];

const PREFIXOS_API = ['/auth', '/logout', '/clients', '/client', '/cart', '/pacientes', '/logs', '/cache', '/plans', '/extras', '/pagamento', '/payment', '/telemedicine', '/schedule', '/pet', '/transactions', '/notifications', '/sms', '/whatsapp', '/appointments', '/cities', '/locations', '/service', '/contracts', '/installments', '/entrepreneur', '/voucher', '/banks', '/invoices', '/qrcode', '/pdf'];

const simulador = {
  ehRotaDeApi: (caminho) => PREFIXOS_API.some((p) => caminho === p || caminho.startsWith(`${p}/`)),
  responder(metodo, caminho, corpo, consulta, cabecalhos) {
    const semBarra = caminho.length > 1 ? caminho.replace(/\/$/, '') : caminho;
    for (const [m, padrao, fn] of ROTAS) {
      if (m !== metodo) continue;
      const r = semBarra.match(padrao);
      if (r) return fn(r, corpo, consulta, cabecalhos);
    }
    return undefined;
  },
  hoje,
};

if (typeof module !== 'undefined' && module.exports) module.exports = simulador;
else window.SimuladorDeovita = simulador;
