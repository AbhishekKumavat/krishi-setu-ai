import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const src = path.resolve('f:/farmingo-main/farmingo-main/Krushiai-masterai/src/components/chatbot/KrishiChatbot.tsx');
        const dest = path.resolve('f:/farmingo-main/farmingo-main/src/components/features/krishi-chatbot.tsx');
        fs.copyFileSync(src, dest);
        return NextResponse.json({ success: true, src, dest });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
