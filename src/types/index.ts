export interface User {
  uid: string;
  email: string;
  displayName?: string;
  whatsapp_comercial?: string;
}

export interface Cliente {
  cliente_id: string;
  nome: string;
  telefone: string;
  usuario_id: string;
  ultima_mensagem?: string;
  timestamp_ultima_mensagem?: any;
  total_tarefas_resumo_geradas?: number;
  total_tarefas_resumo_convertidas?: number;
  taxa_conversao?: number;
}

export interface Tarefa {
  id: string;
  mensagem_recebida: string;
  mensagem_sugerida: string;
  status: 'pendente' | 'enviada' | 'concluída' | 'pendente_sumario' | 'pendente_retroativa' | 'consolidada';
  data_criacao: any;
  timestamp_mensagem_original?: any;
  tags?: string[];
  follow_up?: boolean;
  metadata?: {
    message_id?: string;
    message_ids?: string[];
    from?: string;
    type?: string;
    notify_name?: string;
    is_retroactive?: boolean;
    total_messages?: number;
    context_messages?: number;
    conversation_summary?: string;
    unresponded_messages?: string;
  };
}

export interface WhatsAppStatus {
  number: string;
  status: 'connected' | 'disconnected' | 'qr_code' | 'loading';
  qrCode?: string;
}