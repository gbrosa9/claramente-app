import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { createAuthClient } from '@/lib/supabase/auth'

const authSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET

if (!authSecret) {
  console.warn('NEXTAUTH_SECRET/JWT_SECRET is not configured. Set it in your environment to enable secure sessions.')
}

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { prompt: "select_account" } },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Create a Supabase client for authentication
          const supabase = createAuthClient()

          // Try to sign in with Supabase Auth
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error || !data.user) {
            console.error('Supabase auth error:', error)
            return null
          }

          // Check if email is confirmed
          if (!data.user.email_confirmed_at) {
            console.error('Email not confirmed')
            return null
          }

          // Return user data for NextAuth
          return {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || data.user.email!,
            role: data.user.user_metadata?.role || 'USER',
            verified: data.user.email_confirmed_at !== null,
            onboardCompleted: data.user.user_metadata?.onboard_completed || false,
            termsAccepted: data.user.user_metadata?.terms_accepted || false,
          }
        } catch (error) {
          console.error('Login error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  jwt: {
    secret: authSecret,
    maxAge: 8 * 60 * 60, // 8 hours
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role || 'USER'
        token.verified = user.verified !== undefined ? user.verified : true
        token.onboardCompleted = user.onboardCompleted !== undefined ? user.onboardCompleted : false
        token.termsAccepted = user.termsAccepted !== undefined ? user.termsAccepted : false
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = (token.role as string) || 'USER'
        session.user.verified = (token.verified as boolean) !== undefined ? (token.verified as boolean) : true
        session.user.onboardCompleted = (token.onboardCompleted as boolean) !== undefined ? (token.onboardCompleted as boolean) : false
        session.user.termsAccepted = (token.termsAccepted as boolean) !== undefined ? (token.termsAccepted as boolean) : false
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log('User signed in:', { 
        userId: user.id, 
        email: user.email, 
        provider: account?.provider,
        isNewUser 
      })
    },
    async signOut({ token }) {
      console.log('User signed out:', { userId: token?.sub })
    }
  }
}

// Type augmentation for NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      verified: boolean
      onboardCompleted: boolean
      termsAccepted: boolean
    }
  }

  interface User {
    role: string
    verified: boolean
    onboardCompleted: boolean
    termsAccepted: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    verified: boolean
    onboardCompleted: boolean
    termsAccepted: boolean
  }
}