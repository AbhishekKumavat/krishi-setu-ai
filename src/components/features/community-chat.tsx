'use client';
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/hooks/use-user';
import { getCommunityMessages, sendCommunityMessage } from '@/app/actions/community-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from "@/components/ui/card";
import { format } from 'date-fns';

export function CommunityChat({ communityId }: { communityId: string }) {
    const { user } = useUser();
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [text, setText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const loadMessages = async () => {
        const res = await getCommunityMessages(communityId);
        if (res.success && res.messages) {
            setMessages(res.messages);
        }
    };

    useEffect(() => {
        loadMessages().then(() => setIsLoading(false));
        const interval = setInterval(loadMessages, 3000); // Polling every 3 secs for latest messages
        return () => clearInterval(interval);
    }, [communityId]);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !user) return;

        const messageText = text.trim();
        setText('');
        setIsSending(true);

        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            communityId,
            senderId: user.uid,
            senderName: user.displayName || 'App User',
            senderPhotoUrl: user.photoURL || '',
            text: messageText,
            createdAt: new Date(),
        };
        setMessages(prev => [...prev, optimisticMsg]);

        await sendCommunityMessage(communityId, user.uid, user.displayName || 'Farmer', user.photoURL || '', messageText);
        await loadMessages();
        setIsSending(false);
    };

    if (isLoading) {
        return (
            <Card className="h-[600px] flex items-center justify-center border-dashed">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-primary h-8 w-8" />
                    <p className="text-muted-foreground animate-pulse text-sm">Connecting to Live Chat...</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col h-[700px] overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 relative">
                {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-muted-foreground text-center space-y-2">
                        <span className="text-4xl">💭</span>
                        <p className="font-headline font-semibold text-foreground">No messages yet</p>
                        <p className="text-sm">Be the first to say hello to the {communityId} community!</p>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isMe = user?.uid === msg.senderId;
                        return (
                            <div key={msg.id || i} className={`flex gap-3 w-full ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                <Avatar className="h-10 w-10 border shadow-sm shrink-0">
                                    <AvatarImage src={msg.senderPhotoUrl} alt={msg.senderName} />
                                    <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <span className="text-xs font-bold text-slate-700">{msg.senderName}</span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {msg.createdAt ? format(new Date(msg.createdAt), 'hh:mm a') : 'Just now'}
                                        </span>
                                    </div>
                                    <div className={`p-3.5 shadow-sm text-sm break-words whitespace-pre-wrap ${isMe ? 'bg-[#16a34a] text-white rounded-2xl rounded-tr-sm' : 'bg-white border rounded-2xl rounded-tl-sm'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={bottomRef} className="h-1" />
            </div>

            <div className="p-4 bg-white border-t">
                {user ? (
                    <form onSubmit={handleSend} className="flex gap-2 relative">
                        <Input
                            placeholder="Type a message..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            disabled={isSending}
                            className="bg-muted/50 border-transparent focus-visible:ring-1 pr-12 focus-visible:bg-white transition-colors"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!text.trim() || isSending}
                            className={`absolute right-1 top-1 bottom-1 h-auto ${text.trim() ? 'bg-[#16a34a] hover:bg-green-700' : 'bg-muted text-muted-foreground hover:bg-muted'}`}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                ) : (
                    <div className="flex items-center justify-center p-3 bg-amber-50 rounded-lg text-amber-800 text-sm font-medium border border-amber-200">
                        🔒 Sign in to participate in the live community chat
                    </div>
                )}
            </div>
        </Card>
    )
}
