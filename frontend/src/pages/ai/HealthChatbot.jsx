import React from 'react';
import { useState, useRef, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { aiAPI } from '../../utils/api';
import { FaRobot, FaUser, FaPaperPlane, FaTrash } from 'react-icons/fa';

const SUGGESTIONS = [
  'What are symptoms of diabetes?',
  'How to lower blood pressure naturally?',
  'What is the recommended daily water intake?',
  'How many hours of sleep do I need?'
];

export default function HealthChatbot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your MediCare AI health assistant. I can answer general health questions, explain medical terms, and help you navigate our hospital services. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Build history for context (exclude system message)
    const history = messages.map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await aiAPI.chat({ message: msg, history });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: err.response?.data?.message || 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setMessages([{ role: 'assistant', content: "Chat cleared! How can I help you today?" }]);
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaRobot className="text-purple-600" /> AI Health Chatbot
          </h1>
          <p className="text-gray-500">Ask health questions and get instant answers</p>
        </div>
        <button onClick={clear} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
          <FaTrash /> Clear Chat
        </button>
      </div>

      <div className="flex flex-col" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                {msg.role === 'user' ? <FaUser className="text-white text-sm" /> : <FaRobot className="text-white text-sm" />}
              </div>
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-white border border-gray-100 text-gray-700 shadow-sm rounded-tl-sm'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center"><FaRobot className="text-white text-sm" /></div>
              <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)} className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="bg-white border border-gray-200 rounded-2xl flex items-center gap-3 px-4 py-3 shadow-sm">
          <input
            className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
            placeholder="Ask a health question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            className="bg-purple-600 text-white p-2 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors">
            <FaPaperPlane />
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">This AI is for general health information only. Always consult a doctor for medical advice.</p>
      </div>
    </Layout>
  );
}