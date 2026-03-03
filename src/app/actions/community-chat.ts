'use server';

import { db } from "@/db";
import { communityChatMessages } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function getCommunityMessages(communityId: string) {
    try {
        const messages = await db.select()
            .from(communityChatMessages)
            .where(eq(communityChatMessages.communityId, communityId))
            .orderBy(asc(communityChatMessages.createdAt)) // oldest to newest
            .limit(200);
        return { success: true, messages };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function sendCommunityMessage(communityId: string, senderId: string, senderName: string, senderPhotoUrl: string, text: string) {
    try {
        await db.insert(communityChatMessages).values({
            communityId,
            senderId,
            senderName,
            senderPhotoUrl,
            text,
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
