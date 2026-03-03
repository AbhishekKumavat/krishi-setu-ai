import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

// Seed/test account credentials (plaintext for bypass)
const SEED_CREDENTIALS: Record<string, { password: string; user: any }> = {
    'ramesh@gmail.com': {
        password: '1234',
        user: {
            id: 'farmer-ramesh-001',
            email: 'ramesh@gmail.com',
            name: 'Ramesh Patil',
            image: null,
            username: 'ramesh_patil',
            role: 'farmer',
            region: 'Nashik District',
            isVerified: true,
        },
    },
    'customer@test.com': {
        password: 'password123',
        user: {
            id: '1',
            email: 'customer@test.com',
            name: 'John Customer',
            image: null,
            username: 'johncustomer',
            role: 'customer',
            region: 'Mumbai',
            isVerified: true,
        },
    },
    'retailer@test.com': {
        password: 'password123',
        user: {
            id: '2',
            email: 'retailer@test.com',
            name: 'Sarah Retailer',
            image: null,
            username: 'sarahretailer',
            role: 'retailer',
            region: 'Pune',
            isVerified: true,
        },
    },
};

// Simple user validation with predefined accounts
const validateUser = async (email: string, password: string) => {
    // Check seed/demo accounts first (direct password match, no bcrypt needed)
    const seedEntry = SEED_CREDENTIALS[email];
    if (seedEntry && password === seedEntry.password) {
        return seedEntry.user;
    }

    // Find user in Supabase
    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (!user) return null;

    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) return null;

    return {
        id: user.id,
        email: user.email,
        name: user.display_name,
        username: user.username,
        role: user.role,
        region: user.region,
        isVerified: user.is_verified,
    };
};

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: { strategy: 'jwt' },
    secret: process.env.AUTH_SECRET || 'krishisetu-ai-super-secret-key-2026-local',
    pages: {
        signIn: '/login',
    },
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials || !credentials.email || !credentials.password) return null;

                const user = await validateUser(credentials.email as string, credentials.password as string);

                if (!user) return null;

                return user;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = (user as any).username;
                token.role = (user as any).role;
                token.region = (user as any).region;
                token.isVerified = (user as any).isVerified;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as any).username = token.username;
                (session.user as any).role = token.role;
                (session.user as any).region = token.region;
                (session.user as any).isVerified = token.isVerified;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // Allow relative callback URLs
            if (url.startsWith('/')) {
                // If the user is trying to go to the default callback
                if (url === '/api/auth/callback/credentials') {
                    // Redirect based on user role
                    return baseUrl + '/dashboard'; // Default redirect
                }
                return `${baseUrl}${url}`;
            } else if (new URL(url).origin === baseUrl) {
                return url;
            }
            return baseUrl;
        },
    },
});