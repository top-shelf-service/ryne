
'use client';

import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

const initialConversations = [
  {
    id: 1,
    name: 'Alice',
    avatar: 'https://placehold.co/32x32.png?text=A',
    lastMessage: 'Sure, I can take that shift.',
    lastMessageTime: '5m ago',
    unread: 2,
  },
  {
    id: 2,
    name: 'Bob',
    avatar: 'https://placehold.co/32x32.png?text=B',
    lastMessage: 'Can you cover for me on Friday?',
    lastMessageTime: '1h ago',
    unread: 0,
  },
  {
    id: 3,
    name: 'Charlie',
    avatar: 'https://placehold.co/32x32.png?text=C',
    lastMessage: 'Got it, thanks!',
    lastMessageTime: 'yesterday',
    unread: 0,
  },
   {
    id: 4,
    name: 'Admin',
    avatar: 'https://placehold.co/32x32.png?text=AD',
    lastMessage: 'Team meeting at 3pm today.',
    lastMessageTime: 'yesterday',
    unread: 0,
  },
];

const initialMessages = {
    1: [
        { id: 1, sender: 'Alice', text: 'Hey, I saw the new schedule.', timestamp: '10:00 AM' },
        { id: 2, sender: 'Me', text: 'Great! Any questions?', timestamp: '10:01 AM' },
        { id: 3, sender: 'Alice', text: 'Yes, about the weekend shift. Can I swap with Bob?', timestamp: '10:02 AM' },
        { id: 4, sender: 'Me', text: 'Let me check with him. One moment.', timestamp: '10:03 AM' },
        { id: 5, sender: 'Me', text: 'Bob is okay with it. I\'ll update the schedule.', timestamp: '10:05 AM' },
        { id: 6, sender: 'Alice', text: 'Sure, I can take that shift.', timestamp: '10:06 AM' },
    ],
    2: [
        { id: 1, sender: 'Bob', text: 'Can you cover for me on Friday?', timestamp: '9:00 AM' },
    ],
    3: [
        { id: 1, sender: 'Charlie', text: 'Got it, thanks!', timestamp: 'Yesterday' },
    ],
    4: [
        { id: 1, sender: 'Admin', text: 'Team meeting at 3pm today.', timestamp: 'Yesterday' },
    ]
};


export default function MessagingPage() {
  const [conversations, setConversations] = React.useState(initialConversations);
  const [messages, setMessages] = React.useState(initialMessages);
  const [selectedConversation, setSelectedConversation] = React.useState(initialConversations[0]);
  const [newMessage, setNewMessage] = React.useState('');
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'Staff';

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const newMsg = {
        id: Date.now(),
        sender: 'Me',
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prevMessages => {
        const currentConvoMessages = prevMessages[selectedConversation.id as keyof typeof prevMessages] || [];
        return {
            ...prevMessages,
            [selectedConversation.id]: [...currentConvoMessages, newMsg]
        };
    });

    setConversations(prevConvos => prevConvos.map(convo => 
        convo.id === selectedConversation.id 
        ? { ...convo, lastMessage: newMessage, lastMessageTime: 'Just now' }
        : convo
    ));

    setNewMessage('');
  };
  
  const myName = role === 'Admin' ? 'Admin' : 'Staff Member';

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="In-App Messaging"
        description="Communicate with your team members directly."
      />
      <Card className="flex-grow flex flex-col h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 md:grid-cols-3 w-full flex-grow overflow-hidden">
          <div className="col-span-1 border-r border-border flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <div className="flex-grow overflow-y-auto">
              {conversations.map(convo => (
                <div
                  key={convo.id}
                  className={cn(
                    'flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50',
                    selectedConversation.id === convo.id && 'bg-muted'
                  )}
                  onClick={() => setSelectedConversation(convo)}
                >
                  <Avatar>
                    <AvatarImage src={convo.avatar} />
                    <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow overflow-hidden">
                    <p className="font-semibold truncate">{convo.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{convo.lastMessage}</p>
                  </div>
                  <div className="flex flex-col items-end text-xs text-muted-foreground">
                    <span>{convo.lastMessageTime}</span>
                    {convo.unread > 0 && (
                      <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                        {convo.unread}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="flex items-center gap-4 p-4 border-b flex-shrink-0">
                   <Avatar>
                    <AvatarImage src={selectedConversation.avatar} />
                    <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold">{selectedConversation.name}</h3>
                </div>
                <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {messages[selectedConversation.id as keyof typeof messages]?.map(msg => (
                        <div key={msg.id} className={cn('flex items-end gap-2', msg.sender === 'Me' ? 'justify-end' : 'justify-start')}>
                            {msg.sender !== 'Me' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={selectedConversation.avatar} />
                                    <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn(
                                'max-w-xs lg:max-w-md p-3 rounded-lg',
                                msg.sender === 'Me' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            )}>
                                <p className="text-sm">{msg.text}</p>
                                <p className="text-xs mt-1 text-right opacity-70">{msg.timestamp}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t flex-shrink-0">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      autoComplete="off"
                    />
                    <Button type="submit" size="icon" className="flex-shrink-0">
                      <SendHorizonal size={20} />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
               <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Select a conversation to start chatting</p>
                </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
