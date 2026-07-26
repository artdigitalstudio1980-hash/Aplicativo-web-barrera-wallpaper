import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { logAudit } from './audit';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

const loginAttempts = new Map<string, { count: number; lockoutUntil: number | null }>();

function checkLockout(email: string): boolean {
  const record = loginAttempts.get(email.toLowerCase());
  if (!record || !record.lockoutUntil) return false;
  if (Date.now() >= record.lockoutUntil) {
    loginAttempts.delete(email.toLowerCase());
    return false;
  }
  return true;
}

function recordFailedAttempt(email: string) {
  const key = email.toLowerCase();
  const record = loginAttempts.get(key) || { count: 0, lockoutUntil: null };
  record.count += 1;
  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    record.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
  }
  loginAttempts.set(key, record);
}

function resetAttempts(email: string) {
  loginAttempts.delete(email.toLowerCase());
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        if (checkLockout(credentials.email)) {
          logAudit({ action: 'LOGIN_FAILED', email: credentials.email, metadata: { reason: 'account_locked' } });
          throw new Error('Account temporarily locked. Try again in 15 minutes.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user?.password) {
          recordFailedAttempt(credentials.email);
          logAudit({ action: 'LOGIN_FAILED', email: credentials?.email, metadata: { reason: 'no_password' } });
          return null;
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          recordFailedAttempt(credentials.email);
          logAudit({ action: 'LOGIN_FAILED', email: credentials.email, metadata: { reason: 'wrong_password' } });
          return null;
        }

        resetAttempts(credentials.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
    updateAge: 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).isAdmin = token.isAdmin;
        (session.user as any).firstName = token.firstName;
        (session.user as any).lastName = token.lastName;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET
};
