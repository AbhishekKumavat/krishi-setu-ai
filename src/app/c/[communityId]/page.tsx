'use client';

import { PostList } from '@/components/features/post-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CreatePostDialog } from '@/components/features/create-post-dialog';
import { Plus, Rss, Settings, MoreHorizontal, Shield, Pencil, Calendar, Globe, MessageSquare, Loader2 } from 'lucide-react';
import { Suspense, useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { CommunityChat } from '@/components/features/community-chat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTimestamp } from '@/lib/utils';
import type { Community } from '@/lib/actions/community';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useFirestore, useUser } from '@/firebase';
import React from 'react';
import { Timestamp } from 'firebase/firestore';

const STATIC_CITIES = [
  {
    id: 'jalgaon-hub',
    name: 'Jalgaon Farmers',
    description: 'A community for farmers in Jalgaon to discuss Banana, Cotton, and local market trends.',
    bannerUrl: '/jalgaon.jpg',
    creatorId: 'system',
    creatorUsername: 'KrishiSetu',
    postCount: 142,
    createdAt: Timestamp.now(),
    type: 'public',
    isStatic: true
  },
  {
    id: 'nashik-hub',
    name: 'Nashik Grape Growers',
    description: 'Connect with vineyards, export specialists, and vegetable growers in the Nashik region.',
    bannerUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
    creatorId: 'system',
    creatorUsername: 'KrishiSetu',
    postCount: 89,
    createdAt: Timestamp.now(),
    type: 'public',
    isStatic: true
  },
  {
    id: 'pune-hub',
    name: 'Pune Agri-Hub',
    description: 'Discuss modern farming techniques, greenhouse setups, and direct-to-consumer sales in Pune.',
    bannerUrl: 'https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?auto=format&fit=crop&q=80&w=600',
    creatorId: 'system',
    creatorUsername: 'KrishiSetu',
    postCount: 256,
    createdAt: Timestamp.now(),
    type: 'public',
    isStatic: true
  },
  {
    id: 'nagpur-hub',
    name: 'Nagpur Orange City',
    description: 'Dedicated to citrus farmers, cotton growers, and central Maharashtra agricultural discussions.',
    bannerUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=600',
    creatorId: 'system',
    creatorUsername: 'KrishiSetu',
    postCount: 115,
    createdAt: Timestamp.now(),
    type: 'public',
    isStatic: true
  }
];


export default function CommunitySubPage({ params }: { params: Promise<{ communityId: string }> }) {
  const resolvedParams = React.use(params);
  const communityId = resolvedParams.communityId;
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const staticCommunity = Object.values(STATIC_CITIES).find(c => c.id === communityId) as any;

  const communityRef = useMemo(() => {
    if (!firestore || staticCommunity) return null;
    return doc(firestore, 'communities', communityId);
  }, [firestore, communityId, staticCommunity]);

  const { data: fbCommunity, loading } = useDoc<Community>(communityRef);

  const community = staticCommunity || fbCommunity;

  if (loading && !staticCommunity) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isOwner = community && currentUser && community.creatorId === currentUser.uid && !community.isStatic;

  if (!community) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Community not found</h1>
        <p className="text-muted-foreground">The community c/{communityId} does not exist.</p>
        <Button asChild variant="link">
          <Link href="/community">Explore other communities</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Banner and Header */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="relative h-48 w-full bg-muted">
          {community.bannerUrl && (
            <Image src={community.bannerUrl} alt={`${community.name} banner`} fill className="object-cover" />
          )}
          {/* Fading blur overlay */}
          <div
            className="absolute inset-x-0 bottom-0 h-3/4 bg-black/20 backdrop-blur-xl pointer-events-none"
            style={{
              WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
              maskImage: 'linear-gradient(to top, black, transparent)',
            }}
          />
          {isOwner && (
            <Button variant="outline" size="icon" className="absolute top-2 right-2 h-8 w-8 bg-black/50 hover:bg-black/75 border-none text-white">
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="p-4">
          <div className="relative flex items-center -mt-16">
            <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-card bg-muted">
              {community.iconUrl && <AvatarImage src={community.iconUrl} />}
              <AvatarFallback className="text-4xl">
                {community.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <h1 className="font-headline text-2xl md:text-3xl font-bold tracking-tight">
                c/{community.name}
              </h1>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <CreatePostDialog communityId={communityId}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </CreatePostDialog>
            <Button variant="outline">
              <Rss className="mr-2 h-4 w-4" />
              Subscribe
            </Button>
            {isOwner && (
              <Button variant="secondary" className="ml-auto">
                <Shield className="mr-2 h-4 w-4" />
                Mod Tools
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <MoreHorizontal />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <CommunityChat communityId={communityId} />
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex justify-between items-center">
                <span>About c/{community.name}</span>
                {isOwner && (
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <p className="text-muted-foreground">{community.description}</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Created {formatTimestamp(community.createdAt, { format: 'full', addSuffix: false })}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span className="capitalize">{community.type}</span>
              </div>
              <Separator />
              <Button variant="outline" className="w-full">Add a community guide</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Moderators</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message Mods
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
