/* Configuração da sala de vídeo. Em produção o servidor da DeoVita entrega este arquivo com os seus valores.
   - sinal: 'socket'  → usa o Socket.io do servidor da DeoVita (médico e paciente em aparelhos diferentes).
            'abas'    → só para testes: liga duas abas do MESMO navegador, sem servidor.
   - ice: servidores STUN/TURN próprios (coturn). Sem TURN, a chamada falha em algumas redes de celular. */
window.SALA_CONFIG = { sinal: 'abas', ice: [] };
