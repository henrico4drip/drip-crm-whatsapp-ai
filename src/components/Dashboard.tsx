import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Cliente, Tarefa } from '@/types';
import ClientCard from './ClientCard';
import ClientDetails from './ClientDetails';
import RetroactiveAIAnalysis from './RetroactiveAIAnalysis';
import WhatsAppQRCode from './WhatsAppQRCode';
import { Button } from '@/components/ui/button';
import { LogOut, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Dashboard: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [clientTaskCounts, setClientTaskCounts] = useState<{[key: string]: number}>({});
  const [indexError, setIndexError] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, userData, logout } = useAuth();
  
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) return;

    console.log('🔍 DASHBOARD - Iniciando busca de clientes');
    console.log('- User UID:', user.uid);
    
    setLoading(true);
    setIndexError(false);

    const loadClientsAndTasks = async () => {
      try {
        console.log('📋 STEP 1 - Buscando clientes...');
        
        const clientesQuery = query(
          collection(db, 'clientes'),
          where('usuario_id', '==', user.uid)
        );
        
        const clientesSnapshot = await getDocs(clientesQuery);
        console.log('✅ Clientes encontrados:', clientesSnapshot.size);
        
        if (clientesSnapshot.empty) {
          setClientes([]);
          setClientTaskCounts({});
          setLoading(false);
          return;
        }

        const clientsData: Cliente[] = [];
        const taskCounts: {[key: string]: number} = {};

        for (const clienteDoc of clientesSnapshot.docs) {
          const clienteData = clienteDoc.data();
          const cliente: Cliente = {
            cliente_id: clienteDoc.id,
            ...clienteData
          } as Cliente;
          clientsData.push(cliente);

          const tarefasQuery = query(
            collection(db, 'clientes', clienteDoc.id, 'tarefas'),
            where('status', '==', 'pendente_sumario'),
            orderBy('data_criacao', 'desc')
          );
          
          const tarefasSnapshot = await getDocs(tarefasQuery);
          taskCounts[clienteDoc.id] = tarefasSnapshot.size;
        }

        const sortedClients = clientsData.sort((a, b) => {
          const aTaskCount = taskCounts[a.cliente_id] || 0;
          const bTaskCount = taskCounts[b.cliente_id] || 0;
          
          if (aTaskCount > 0 && bTaskCount === 0) return -1;
          if (bTaskCount > 0 && aTaskCount === 0) return 1;
          
          const aTaxa = a.taxa_conversao || 0;
          const bTaxa = b.taxa_conversao || 0;
          if (aTaxa !== bTaxa) return bTaxa - aTaxa;
          
          const aTime = a.timestamp_ultima_mensagem?.toDate?.()?.getTime() || 0;
          const bTime = b.timestamp_ultima_mensagem?.toDate?.()?.getTime() || 0;
          return bTime - aTime;
        });
        
        const clientsToDisplay = sortedClients.slice(0, 12);
        
        console.log('📊 RESUMO FINAL:');
        console.log('- Total de clientes encontrados:', clientsData.length);
        console.log('- Total de clientes exibidos:', clientsToDisplay.length);
        console.log('- Total de tarefas pendentes:', Object.values(taskCounts).reduce((a, b) => a + b, 0));
        
        setClientes(clientsToDisplay);
        setClientTaskCounts(taskCounts);
        setLoading(false);
        
      } catch (error: any) {
        console.error('❌ Erro geral ao carregar dados:', error);
        
        if (error.code === 'failed-precondition' && error.message.includes('index')) {
          setIndexError(true);
        }
        
        setLoading(false);
      }
    };

    loadClientsAndTasks();
  }, [user, refreshKey]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleAnalysisComplete = () => {
    console.log('🔄 Análise retroativa concluída. Forçando recarga do dashboard...');
    setRefreshKey(prevKey => prevKey + 1);
  };

  const retryWithIndex = () => {
    console.log('🔄 Tentando novamente...');
    setIndexError(false);
    setLoading(true);
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  if (selectedCliente) {
    return (
      <ClientDetails 
        cliente={selectedCliente} 
        onBack={() => setSelectedCliente(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                CRM WhatsApp com IA 🤖
              </h1>
              <p className="text-gray-600">
                Gerencie seus clientes e mensagens com sugestões automáticas
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Olá, {userData?.email || user?.email}</p>
                <p className="text-xs text-gray-500">
                  {clientes.length} clientes • {Object.values(clientTaskCounts).reduce((a, b) => a + b, 0)} tarefas pendentes
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {indexError && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="space-y-2">
                <p className="font-medium">📋 Índice necessário</p>
                <p className="text-sm">
                  O Firebase precisa de um índice para ordenação. Clique no link para criar o índice ou tente novamente.
                </p>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={retryWithIndex}
                    className="text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Tentar novamente
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">🔍 Status do Sistema</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>👤 Usuário:</strong> {user?.email} (UID: {user?.uid})</p>
            <p><strong>📊 Clientes:</strong> {clientes.length}</p>
            <p><strong>📋 Tarefas Pendentes:</strong> {Object.values(clientTaskCounts).reduce((a, b) => a + b, 0)}</p>
            <p><strong>🔄 Status:</strong> {loading ? 'Carregando...' : 'Pronto'}</p>
          </div>
        </div>

        <RetroactiveAIAnalysis onAnalysisComplete={handleAnalysisComplete} />
        
        {userData?.whatsapp_comercial && (
          <WhatsAppQRCode whatsappNumber={userData.whatsapp_comercial} />
        )}

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Clientes (Tarefas Pendentes → Taxa de Conversão → Atividade Recente)
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando clientes e tarefas...</p>
            </div>
          ) : clientes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📱</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum cliente encontrado.
              </h3>
              <p className="text-gray-600 mb-4">
                Aguardando mensagens do WhatsApp para criar clientes e tarefas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientes.map((cliente) => (
                <ClientCard
                  key={cliente.cliente_id}
                  cliente={cliente}
                  pendingTasksCount={clientTaskCounts[cliente.cliente_id] || 0}
                  onClick={() => setSelectedCliente(cliente)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;