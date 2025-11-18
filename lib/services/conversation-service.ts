import { supabase } from '@/lib/supabase'

export interface Conversation {
  id: string
  user_id: string
  title: string
  messages: ConversationMessage[]
  created_at: string
  updated_at: string
}

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export class ConversationService {
  // Criar uma nova conversa
  static async createConversation(userId: string, title: string, messages: ConversationMessage[]): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          title,
          messages,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating conversation:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating conversation:', error)
      return null
    }
  }

  // Buscar todas as conversas de um usuário
  static async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching conversations:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching conversations:', error)
      return []
    }
  }

  // Buscar uma conversa específica
  static async getConversation(conversationId: string, userId: string): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching conversation:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching conversation:', error)
      return null
    }
  }

  // Atualizar uma conversa
  static async updateConversation(conversationId: string, userId: string, messages: ConversationMessage[], title?: string): Promise<boolean> {
    try {
      const updateData: any = {
        messages,
        updated_at: new Date().toISOString()
      }

      if (title) {
        updateData.title = title
      }

      const { error } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', conversationId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating conversation:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating conversation:', error)
      return false
    }
  }

  // Deletar uma conversa
  static async deleteConversation(conversationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error deleting conversation:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting conversation:', error)
      return false
    }
  }

  // Gerar título automaticamente baseado nas mensagens
  static generateTitle(messages: ConversationMessage[]): string {
    const firstUserMessage = messages.find(m => m.role === 'user')?.content
    if (!firstUserMessage) return 'Nova Conversa'

    // Pega as primeiras 50 caracteres da primeira mensagem
    const title = firstUserMessage.slice(0, 50)
    return title.length === 50 ? `${title}...` : title
  }

  // Salvar conversa do localStorage para Supabase
  static async saveLocalConversationToSupabase(userId: string, localConversation: any): Promise<string | null> {
    try {
      const title = this.generateTitle(localConversation.messages)
      const conversation = await this.createConversation(userId, title, localConversation.messages)
      return conversation?.id || null
    } catch (error) {
      console.error('Error saving local conversation to Supabase:', error)
      return null
    }
  }

  // Migrar todas as conversas do localStorage para Supabase
  static async migrateLocalConversations(userId: string): Promise<void> {
    try {
      // Buscar conversas do localStorage
      const localConversations = JSON.parse(localStorage.getItem(`conversations_${userId}`) || '[]')
      
      if (localConversations.length === 0) return

      // Salvar cada conversa no Supabase
      for (const localConv of localConversations) {
        await this.saveLocalConversationToSupabase(userId, localConv)
      }

      console.log(`Migrated ${localConversations.length} conversations to Supabase`)
    } catch (error) {
      console.error('Error migrating local conversations:', error)
    }
  }
}