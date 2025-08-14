// backend/aiService.js
const axios = require('axios');

// IMPORTANTE: Esta chave foi fornecida pelo usuário.
// Em um ambiente de produção, esta chave DEVE ser armazenada em variáveis de ambiente,
// e NUNCA diretamente no código-fonte.
const OPENROUTER_API_KEY = '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'; // Sua chave API

/**
 * Gera uma resposta de IA com base na mensagem atual e no histórico de conversas.
 * @param {string} currentMessage O corpo da mensagem atual do cliente.
 * @param {Array<Object>} chatHistory Um array de objetos de mensagem (Venom-Bot format),
 * representando o histórico da conversa.
 * @returns {Promise<string>} A resposta sugerida pela IA.
 */
async function gerarRespostaIA(currentMessage, chatHistory = []) {
  if (!currentMessage || currentMessage.trim() === '') {
    console.warn('⚠️ Mensagem vazia para IA, retornando resposta padrão.');
    return 'Olá! Como posso ajudar?';
  }

  // Constrói o array de mensagens para a API da OpenRouter.
  // Começa com a instrução do sistema.
  const messagesForAI = [
    {
      role: 'system',
      content: 'Você é um vendedor simpático, objetivo e direto. Sugira uma resposta comercial para a seguinte mensagem de um cliente, levando em conta o histórico da conversa.'
    }
  ];

  // Adiciona as mensagens do histórico, formatando-as para o papel 'user' ou 'assistant'.
  // O Venom-Bot marca 'fromMe' para mensagens enviadas pelo bot (assistente).
  chatHistory.forEach(msg => {
    if (msg.body && msg.body.trim() !== '') {
      messagesForAI.push({
        role: msg.fromMe ? 'assistant' : 'user',
        content: msg.body
      });
    }
  });

  // Adiciona a mensagem atual do cliente como a última mensagem do usuário.
  messagesForAI.push({
    role: 'user',
    content: currentMessage
  });

  try {
    const resposta = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo', // Modelo de IA a ser utilizado
        messages: messagesForAI, // Array de mensagens construído
        max_tokens: 100, // Limite o tamanho da resposta da IA
        temperature: 0.7 // Controla a criatividade da IA (0.0 a 1.0)
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return resposta.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('❌ Erro ao gerar resposta com IA:', error.response?.data?.message || error.message);
    return 'Desculpe, não consegui gerar uma resposta automática. Posso ajudar de outra forma?';
  }
}

// Exporta a função para que possa ser utilizada por outros módulos do backend.
module.exports = { gerarRespostaIA };