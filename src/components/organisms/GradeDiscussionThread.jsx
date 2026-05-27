import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { notification } from '../../services/notificationService';
import { eventBus } from '../../services/eventBus';

export function GradeDiscussionThread({ subjectId, studentId }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would fetch from an API
        // For now, we'll use mock data
        const mockMessages = [
          {
            id: 'msg1',
            content: 'I noticed the SBA score seems low for this term. Could you provide more details on the continuous assessment?',
            sender: 'HOD',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            read: true
          },
          {
            id: 'msg2',
            content: 'The SBA includes practical attendance (10 marks), project work (15 marks), and class exercises (5 marks). The student missed 2 practical sessions and submitted the project late.',
            sender: 'Teacher',
            timestamp: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
            read: true
          }
        ];
        setMessages(mockMessages);
      } catch (err) {
        console.error('Failed to load discussion messages:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    // Listen for new messages via event bus
    const handleNewMessage = (data) => {
      if (data.subjectId === subjectId && data.studentId === studentId) {
        setMessages(prev => [...prev, {
          id: `msg${Date.now()}`,
          content: data.message,
          sender: data.sender,
          timestamp: new Date(),
          read: false
        }]);
      }
    };

    const unsubscribe = eventBus.subscribe('grade-discussion-message', handleNewMessage);

    return () => {
      unsubscribe();
    };
  }, [subjectId, studentId]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    try {
      setIsLoading(true);
      const newMessage = {
        id: `msg${Date.now()}`,
        content: inputValue,
        sender: 'Teacher', // In real app, this would come from user context
        timestamp: new Date(),
        read: false
      };

      // Optimistically update UI
      setMessages(prev => [...prev, newMessage]);
      setInputValue('');

      // In real app, send to backend
      // await discussionService.sendMessage({ subjectId, studentId, message: inputValue });

      // Notify HOD via notification service
      // This would typically be done via backend, but for demo we'll use eventBus
      eventBus.emit('grade-discussion-message', {
        subjectId,
        studentId,
        message: inputValue,
        sender: 'Teacher'
      });

      // Create notification for HOD
      // notification.notifyTeacherOfHODAction(studentId, 'DISCUSSION_MESSAGE', subjectId, inputValue);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-900">
          Discussion: {subjectId}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {messages.length} messages
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
              No messages yet. Start the discussion!
            </p>
          ) : (
            <div className="space-y-2">
              {messages.map(msg => (
                <div key={msg.id} className={cn(
                  "flex gap-3",
                  msg.sender === 'Teacher' ? 'flex-row' : 'flex-row-reverse'
                )}>
                  <div className="w-8 h-8 flex items-center justify-center rounded-full 
                    {msg.sender === 'Teacher' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}">
                    {msg.sender === 'Teacher' ? 'T' : 'H'}
                  </div>
                  <div className="flex-1 max-w-[80%]">
                    <div className={cn(
                      "px-3 py-2 rounded-xl",
                      msg.sender === 'Teacher' ? 'bg-blue-50 text-gray-800 rounded-tl-none' : 
                        'bg-emerald-50 text-gray-800 rounded-tr-none'
                    )}>
                      <p className="text-xs font-medium text-gray-500 mb-0.5">
                        {msg.sender}
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