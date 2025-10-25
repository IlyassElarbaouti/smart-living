import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Chat Message Types
export interface ChatMessage {
    id: string;
    content: string;
    role: 'USER' | 'ASSISTANT' | 'SYSTEM';
    timestamp: Date | string;
    sender: {
        id: string;
        name: string;
        avatar: string;
        isOnline: boolean;
    };
    status?: 'sent' | 'delivered' | 'read';
}

interface ChatState {
    isChatOpen: boolean;
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    toggleChat: () => void;
    setMessages: (messages: ChatMessage[]) => void;
    addMessage: (message: ChatMessage) => void;
    sendMessage: (content: string) => Promise<void>;
    loadMessages: () => Promise<void>;
    clearMessages: () => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useChat = create<ChatState>((set, get) => ({
    isChatOpen: false,
    messages: [],
    isLoading: false,
    error: null,
    
    toggleChat: () => set((state) => ({ 
        isChatOpen: !state.isChatOpen 
    })),
    
    setMessages: (messages) => set({ messages }),
    
    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),
    
    sendMessage: async (content: string) => {
        set({ isLoading: true, error: null });
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content, role: 'USER' }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();
            
            // Add user message
            if (data.message) {
                get().addMessage({
                    id: data.message.id,
                    content: data.message.content,
                    role: data.message.role,
                    timestamp: data.message.createdAt,
                    sender: {
                        id: data.message.profile?.id || 'user',
                        name: data.message.profile 
                            ? `${data.message.profile.firstName || ''} ${data.message.profile.lastName || ''}`.trim()
                            : 'You',
                        avatar: data.message.profile?.avatar || '/default-avatar.png',
                        isOnline: true,
                    },
                    status: 'sent',
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            set({ error: 'Failed to send message. Please try again.' });
        } finally {
            set({ isLoading: false });
        }
    },
    
    loadMessages: async () => {
        set({ isLoading: true, error: null });
        
        try {
            const response = await fetch('/api/chat');
            
            if (!response.ok) {
                throw new Error('Failed to load messages');
            }

            const data = await response.json();
            set({ messages: data.messages || [] });
        } catch (error) {
            console.error('Error loading messages:', error);
            set({ error: 'Failed to load messages. Please try again.' });
        } finally {
            set({ isLoading: false });
        }
    },
    
    clearMessages: () => set({ messages: [] }),
    
    setLoading: (isLoading) => set({ isLoading }),
    
    setError: (error) => set({ error }),
}))

// Cart Types
export interface CartItem {
    id: string;
    menuItemId: string;
    name: string;
    price: number;
    image?: string;
    quantity: number;
    venueId: string;
    venueName: string;
    notes?: string;
}

interface CartState {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
    removeItem: (menuItemId: string) => void;
    updateQuantity: (menuItemId: string, quantity: number) => void;
    updateNotes: (menuItemId: string, notes: string) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
    getItemsByVenue: () => Map<string, CartItem[]>;
}

export const useCart = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            
            addItem: (item) => set((state) => {
                const existingItem = state.items.find(i => i.menuItemId === item.menuItemId);
                
                if (existingItem) {
                    // Update quantity if item already exists
                    return {
                        items: state.items.map(i =>
                            i.menuItemId === item.menuItemId
                                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                                : i
                        ),
                    };
                }
                
                // Add new item
                return {
                    items: [
                        ...state.items,
                        {
                            ...item,
                            quantity: item.quantity || 1,
                        },
                    ],
                };
            }),
            
            removeItem: (menuItemId) => set((state) => ({
                items: state.items.filter(item => item.menuItemId !== menuItemId),
            })),
            
            updateQuantity: (menuItemId, quantity) => set((state) => {
                if (quantity <= 0) {
                    return {
                        items: state.items.filter(item => item.menuItemId !== menuItemId),
                    };
                }
                
                return {
                    items: state.items.map(item =>
                        item.menuItemId === menuItemId
                            ? { ...item, quantity }
                            : item
                    ),
                };
            }),
            
            updateNotes: (menuItemId, notes) => set((state) => ({
                items: state.items.map(item =>
                    item.menuItemId === menuItemId
                        ? { ...item, notes }
                        : item
                ),
            })),
            
            clearCart: () => set({ items: [] }),
            
            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },
            
            getTotalPrice: () => {
                return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
            },
            
            getItemsByVenue: () => {
                const venueMap = new Map<string, CartItem[]>();
                
                get().items.forEach(item => {
                    const venueItems = venueMap.get(item.venueId) || [];
                    venueItems.push(item);
                    venueMap.set(item.venueId, venueItems);
                });
                
                return venueMap;
            },
        }),
        {
            name: 'cart-storage',
        }
    )
)
