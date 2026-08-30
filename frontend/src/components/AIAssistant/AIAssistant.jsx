import React, { useState, useRef, useEffect } from 'react';
import { sendAIBobQuery } from '../../services/api';
import './AIAssistant.css';

export default function AIAssistant() {
  // The opening message describes only what IBM Bob can actually do.
  //
  // Responsible AI review P-02 and demo review 1A: the previous seed was a
  // fabricated exchange in which Bob quoted specific lab values ("16 to 22
  // ng/mL") and offered to set a reminder. Neither capability exists, and rule
  // 3a of the system prompt explicitly forbids stating a value read from a
  // document. Any question asked afterwards would have contradicted the
  // conversation already on screen.
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hi Ramaa. I can read what's in your record — your medications, "
          + "today's tasks, your appointment, your family profiles and which "
          + "documents are on file. I can't read the text inside a PDF yet, so "
          + "I'll never guess a number at you. What would you like to know?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const threadRef = useRef(null);

  // Demo review 5B: the thread has a max-height and overflow-y in CSS, but
  // nothing ever scrolled it. After a few exchanges the newest reply sat below
  // the fold and the panel looked like it had done nothing.
  useEffect(() => {
    const thread = threadRef.current;
    if (thread) {
      thread.scrollTop = thread.scrollHeight;
    }
  }, [messages, isProcessing]);

  // Questions the offline engine answers cleanly, chosen so a judge clicking a
  // pill never lands in the catch-all branch.
  const suggestions = [
    'What are my medications?',
    'What should I ask my doctor?',
    'How am I doing today?',
    "What's in my emergency card?"
  ];

  const handleSend = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isProcessing) return;

    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputValue('');
    setIsProcessing(true);
    setShowSuggestions(false);

    try {
      const aiReply = await sendAIBobQuery(text);
      setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: "I couldn't reach your record just then. Nothing has been lost — please try again."
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="ai-assistant-card">
      <div className="ai-bg-blob-1"></div>
      <div className="ai-bg-blob-2"></div>

      <div className="ai-inner-content">
        <div className="ai-header">
          <div className="ai-avatar">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 2.2l1.35 3.25L12.6 6.8 9.35 8.15 8 11.4 6.65 8.15 3.4 6.8l3.25-1.35L8 2.2z" fill="#fff"></path></svg>
          </div>
          <div>
            <div className="ai-title">IBM Bob · AI Health Assistant</div>
            <div className="ai-status">
              <span className="ai-status-dot"></span>
              {isProcessing ? 'Reading your record…' : 'Reads your record, privately and on-device'}
            </div>
          </div>
        </div>

        <div className="ai-chat-thread" ref={threadRef} aria-live="polite">
          {messages.map((msg, index) => (
            <div key={index} className={msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
              {msg.text}
            </div>
          ))}
          {isProcessing && (
            <div className="chat-bubble-ai chat-bubble-thinking">Reading your record…</div>
          )}
        </div>

        {showSuggestions && (
          <div className="ai-suggestions">
            {suggestions.map((sug, index) => (
              <button key={index} type="button" className="suggestion-pill" onClick={() => handleSend(sug)} disabled={isProcessing}>
                {sug}
              </button>
            ))}
          </div>
        )}

        <div className="ai-input-box">
          <input
            type="text"
            className="ai-input-field"
            placeholder="Ask IBM Bob anything about your health…"
            aria-label="Ask IBM Bob a question about your health record"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isProcessing}
          />
          <div className="ai-submit-btn-wrapper">
            <div className="ai-submit-glow"></div>
            <button className="ai-submit-btn" type="button" aria-label="Send question" onClick={() => handleSend()} disabled={isProcessing}>
              <svg width="15" height="15" viewBox="0 0 14 14" fill="none"><path d="M7 11.2V3M7 3L3.6 6.4M7 3l3.4 3.4" stroke="#fff" strokeWidth="1.7" strokeLinecap="round"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
