import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { notification } from '../../services/notificationService';
import { eventBus } from '../../services/eventBus';
import { useRole } from '../../context/RoleContext';

export function DirectMessaging({ userId, userRole, counterpartRole = 'HOD' }) {
  const { user } = useRole();
  const currentUserId = userId || (user?.id || user?.staffId);
  const isTeacher = userRole === 'teacher' || user?.role === 'TEACHER';
  const isHOD = userRole === 'HOD' || user?.role === 'HOD';
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUserId) return;

    // Load initial messages
    loadMessages();

    // Listen for new messages via event bus
    const handleNewMessage = (data) => {
      // Check if this message is for the current user
      const isForCurrentUser = 
        (data.recipientId === currentUserId && data.senderId !== currentUserId) ||
        (data.senderId === currentUserId && data.recipientId !== currentUserId);

      if (isForCurrentUser && data.conversationId) {
        // Generate conversation ID based on participants
        const participantIds = [currentUserId, data.senderId === currentUserId ? data.recipientId : data.senderId].filter(Boolean);
        const conversationId = participantIds.sort().join('-');

        if (data.conversationId === conversationId) {
          setMessages(prev => [...prev, {
            id: data.id || `msg${Date.now()}`,
            content: data.content,
            senderId: data.senderId,
            recipientId: data.recipientId,
            timestamp: data.timestamp || new Date().toISOString(),
            read: data.read || false
          }]);
          
          // Update unread count if message is for current user and not read
          if (data.recipientId === currentUserId && !(data.read || false)) {
            setUncount(prev => prev + 1);
          }
        }
      }
    };

    const unsubscribe = eventBus.subscribe('direct-message', handleNewMessage);

    return () => {
      unsubscribe();
    };
  }, [currentUserId]);

  const loadMessages = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll use mock data or empty array
      const mockMessages = [];
      setMessages(mockMessages);
    } catch (err) {
      console.error('Failed to load direct messages:', err);
      setMessages([]);
    }
  }, [currentUserId]);

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || !currentUserId) return;

    try {
      setIsLoading(true);
      const newMessage = {
        id: `msg${Date.now()}`,
        content: inputValue,
        senderId: currentUserId,
        recipientId: null, // Will be set based on role
        timestamp: new Date().toISOString(),
        read: false
      };

      // Determine recipient based on roles
      let recipientId = null;
      if (isTeacher && counterpartRole === 'HOD') {
        // In real app, would lookup HOD ID for teacher's department
        recipientId = 'hod-placeholder'; // Placeholder
      } else if (isHOD && counterpartRole === 'teacher') {
        // Would need specific teacher ID in real implementation
        recipientId = 'teacher-placeholder'; // Placeholder
      }

      // For demo, we'll broadcast to all potential recipients
      // In real app, this would be sent to specific recipient via backend
      const messageToSend = {
        ...newMessage,
        recipientId,
        conversationId: [currentUserId, recipientId].filter(Boolean).sort().join('-') || 'demo-conversation'
      };

      // Optimistically update UI
      setMessages(prev => [...prev, messageToSend]);
      setInputValue('');

      // Send via event bus (would go to backend in real implementation)
      eventBus.emit('direct-message', {
        ...messageToSend,
        conversationId: messageToSend.conversationId
      });

      // Send notification to recipient
      if (recipientId && recipientId !== currentUserId) {
        notification.sendHODAlert(
          recipientId,
          'DIRECT_MESSAGE',
          {
            message: inputValue,
            fromUserId: currentUserId,
            fromUserRole: isTeacher ? 'teacher' : 'HOD'
          }
        ).catch(err => {
          console.error('Failed to send notification for direct message:', err);
        });
      }
    } catch (err) {
      console.error('Failed to send direct message:', err);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, currentUserId, isTeacher, isHOD, counterpartRole]);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-900">
          Direct Messages {counterpartRole === 'HOD' ? '(to HODs)' : '(to Teachers)'}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {unreadCount > 0 ? `(${unreadCount} unread)` : ''}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-gray-100 rounded hover:text-gray-700 transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-center py-4 text-gray-500 italic">
              No messages yet. Start the conversation!
            </p>
          ) : (
            <div className="space-y-2">
              {messages.map(msg => (
                <div key={msg.id} className={cn(
                  "flex gap-3",
                  msg.senderId === currentUserId ? 'flex-row-reverse' : 'flex-row'
                )}>
                  <div className="w-8 h-8 flex items-center justify-center rounded-full 
                    {msg.senderId === currentUserId ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}">
                    {msg.senderId === currentUserId ? 'T' : 'H'}
                  </div>
                  <div className="flex-1 max-w-[80%]">
                    <div className={cn(
                      "px-3 py-2 rounded-xl",
                      msg.senderId === currentUserId ? 'bg-blue-50 text-gray-800 rounded-tl-none' : 
                        'bg-emerald-50 text-gray-800 rounded-tr-none'
                    )}>
                      <p className="text-xs font-medium text-gray-500 mb-0.5">
                        {msg.senderId === currentUserId ? 'You' : (msg.senderId.includes('hod') ? 'HOD' : 'Teacher')}
                      </p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}