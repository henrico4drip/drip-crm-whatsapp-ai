const express = require('express');
const { listenForOperatorChanges, scanMessagesAndCreateTasks, activeBots, updateClientConversionMetrics, enviarMensagem } = require('./botManager');
const { setupDailyTasks } = require('./taskScheduler');
const cors = require('cors');
const { reprocessAllPendingTasks } = require('./reprocessTasks');

const app = express();
app.use(express.json());
app.use(cors());

// Armazenamento para QR codes e conexões SSE
const qrCodes = new Map();
const sseConnections = new Map();

// Endpoint SSE para QR codes
app.get('/api/qr-code/:whatsappNumber', (req, res) => {
    const { whatsappNumber } = req.params;
    
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
    });
    
    if (!sseConnections.has(whatsappNumber)) {
        sseConnections.set(whatsappNumber, []);
    }
    sseConnections.get(whatsappNumber).push(res);
    
    const existingQR = qrCodes.get(whatsappNumber);
    if (existingQR) {
        const data = JSON.stringify({
            whatsappNumber,
            ...existingQR
        });
        res.write(`data: ${data}\n\n`);
    }
    
    req.on('close', () => {
        const connections = sseConnections.get(whatsappNumber) || [];
        const index = connections.indexOf(res);
        if (index !== -1) {
            connections.splice(index, 1);
        }
        if (connections.length === 0) {
            sseConnections.delete(whatsappNumber);
        }
    });
    
    const heartbeat = setInterval(() => {
        res.write(': heartbeat\n\n');
    }, 30000);
    
    req.on('close', () => {
        clearInterval(heartbeat);
    });
});

// Endpoint para verificar status do WhatsApp
app.get('/api/whatsapp-status/:whatsappNumber', (req, res) => {
    const { whatsappNumber } = req.params;
    const hasQR = qrCodes.has(whatsappNumber);
    const isConnected = activeBots.has(whatsappNumber);
    
    res.json({
        whatsappNumber,
        isConnected,
        hasQRCode: hasQR,
        qrData: hasQR ? qrCodes.get(whatsappNumber) : null
    });
});

// Endpoint para iniciar bot do WhatsApp
app.post('/api/start-whatsapp-bot', async (req, res) => {
    const { whatsappNumber } = req.body;
    
    if (!whatsappNumber) {
        return res.status(400).json({ error: 'Número do WhatsApp é obrigatório.' });
    }
    
    try {
        const { startVenomBot } = require('./botManager');
        await startVenomBot(whatsappNumber, sendQrCodeToFrontend);
        res.status(200).json({ message: 'Bot iniciado com sucesso.' });
    } catch (error) {
        console.error('❌ Erro ao iniciar bot:', error);
        res.status(500).json({ error: 'Erro interno ao iniciar o bot.' });
    }
});

// Endpoint para análise retroativa
app.post('/api/analyze-retroactive', async (req, res) => {
    const { whatsappNumber } = req.body;
    
    if (!whatsappNumber) {
        return res.status(400).json({ error: 'Número do WhatsApp é obrigatório.' });
    }
    
    try {
        console.log(`API: Recebida requisição para análise retroativa do número ${whatsappNumber}`);
        const client = activeBots.get(whatsappNumber);
        
        if (!client) {
            return res.status(404).json({ error: 'Bot para este número não está ativo.' });
        }
        
        await scanMessagesAndCreateTasks(client, whatsappNumber, false);
        
        res.status(200).json({ message: 'Análise retroativa iniciada com sucesso.' });
    } catch (error) {
        console.error('❌ Erro na API de análise retroativa:', error);
        res.status(500).json({ error: 'Erro interno ao iniciar a análise retroativa.' });
    }
});

// Endpoint para consolidar todas as tarefas
app.post('/api/consolidate-all-tasks', async (req, res) => {
    try {
        console.log('🔄 Iniciando consolidação de todas as tarefas...');
        
        const botKeys = Array.from(activeBots.keys());
        if (botKeys.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Nenhum bot ativo encontrado'
            });
        }
        
        let totalClientsProcessed = 0;
        let totalTasksConsolidated = 0;
        
        // Processar cada bot ativo
        for (const whatsappNumber of botKeys) {
            try {
                const result = await processConsolidationForNumber(whatsappNumber);
                totalClientsProcessed += result.clientsProcessed;
                totalTasksConsolidated += result.tasksConsolidated;
            } catch (error) {
                console.error(`❌ Erro ao consolidar tarefas para ${whatsappNumber}:`, error);
            }
        }
        
        res.status(200).json({
            success: true,
            message: 'Consolidação concluída com sucesso',
            totalClientsProcessed,
            totalTasksConsolidated
        });
    } catch (error) {
        console.error('❌ Erro geral na consolidação:', error);
        res.status(500).json({ error: 'Erro interno na consolidação.' });
    }
});

// Endpoint para listar clientes
app.get('/api/list-clients', async (req, res) => {
    try {
        const { usuario_id } = req.query;
        
        if (!usuario_id) {
            return res.status(400).json({ error: 'usuario_id é obrigatório' });
        }
        
        const admin = require('firebase-admin');
        const db = admin.firestore();
        
        const clientesSnapshot = await db.collection('clientes')
            .where('usuario_id', '==', usuario_id)
            .orderBy('ultima_interacao', 'desc')
            .get();
        
        const clientes = [];
        for (const doc of clientesSnapshot.docs) {
            const clienteData = doc.data();
            
            // Buscar tarefas do cliente
            const tarefasSnapshot = await db.collection('clientes')
                .doc(doc.id)
                .collection('tarefas')
                .orderBy('data_criacao', 'desc')
                .limit(10)
                .get();
            
            const tarefas = tarefasSnapshot.docs.map(tarefaDoc => ({
                id: tarefaDoc.id,
                ...tarefaDoc.data()
            }));
            
            clientes.push({
                id: doc.id,
                ...clienteData,
                tarefas
            });
        }
        
        res.json({ clientes });
    } catch (error) {
        console.error('❌ Erro ao listar clientes:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Endpoint para enviar mensagem
app.post('/api/send-message/:contactId', async (req, res) => {
    try {
        const { contactId } = req.params;
        const { message, whatsappNumber } = req.body;
        
        if (!message || !whatsappNumber) {
            return res.status(400).json({ error: 'Mensagem e número do WhatsApp são obrigatórios' });
        }
        
        const result = await enviarMensagem(whatsappNumber, contactId, message);
        
        if (result.success) {
            res.json({ success: true, message: 'Mensagem enviada com sucesso' });
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Função auxiliar para processar consolidação
async function processConsolidationForNumber(whatsappNumber) {
    // Implementação da lógica de consolidação
    return {
        clientsProcessed: 0,
        tasksConsolidated: 0
    };
}

// Função para enviar QR code para frontend
function sendQrCodeToFrontend(whatsappNumber, base64Qrimg, asciiQR, urlCode) {
    const qrData = {
        base64Qrimg,
        asciiQR,
        urlCode,
        timestamp: Date.now()
    };
    
    qrCodes.set(whatsappNumber, qrData);
    
    const connections = sseConnections.get(whatsappNumber) || [];
    const data = JSON.stringify({
        whatsappNumber,
        ...qrData
    });
    
    connections.forEach(res => {
        try {
            res.write(`data: ${data}\n\n`);
        } catch (error) {
            console.error('Erro ao enviar QR code via SSE:', error);
        }
    });
}

// Inicializar serviços
listenForOperatorChanges(sendQrCodeToFrontend);
setupDailyTasks();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Backend rodando na porta ${PORT}`);
});