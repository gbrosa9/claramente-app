"use client"

import { useState } from 'react'
import { useSupabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SupabaseAuth() {
  const supabase = useSupabase()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      let result
      if (isSignUp) {
        result = await supabase.auth.signUp({
          email,
          password,
        })
        if (result.error) {
          setMessage(result.error.message)
        } else if (result.data.user && !result.data.user.email_confirmed_at) {
          setMessage('Verifique seu email para confirmar sua conta!')
        }
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (result.error) {
          setMessage(result.error.message)
        }
      }
    } catch (error) {
      setMessage('Ocorreu um erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`
      }
    })
    if (error) {
      setMessage(error.message)
    }
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isSignUp ? 'Criar Conta' : 'Entrar'}</CardTitle>
        <CardDescription>
          {isSignUp 
            ? 'Crie uma conta para sincronizar suas conversas' 
            : 'Entre para acessar suas conversas salvas'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Carregando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
          </Button>
        </form>

        <div className="text-center">
          <span className="text-sm text-gray-600">ou</span>
        </div>

        <Button
          onClick={handleGoogleAuth}
          variant="outline"
          className="w-full"
          disabled={loading}
        >
          Continuar com Google
        </Button>

        {message && (
          <p className={`text-sm text-center ${
            message.includes('erro') || message.includes('Error') 
              ? 'text-red-600' 
              : 'text-green-600'
          }`}>
            {message}
          </p>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-purple-600 hover:underline"
          >
            {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem conta? Criar uma'}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}