import React, { useState } from 'react';
import { sendAIBobQuery } from '../../services/api';
import './AIAssistant.css';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { sender: 'user', text: 'Why is my Vitamin D still low?' },
    { sender: 'ai', text: "Your levels rose from 16 to 22 ng/mL since April — real progress, just below the 30 target. You've logged 4 of 8 weekly doses. Want me to set a Sunday reminder?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const suggestions = [
    'Explain my blood report',
    'Compare with last year',
    'Prepare questions for my doctor',
    'What should I improve this month?'
  ];

  const handleSend = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isProcessing) return;
    
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputValue('');
    setIsProcessing(true);
    setShowSuggestions(false); // Hide suggestion panel immediately upon interaction
    
    try {
      const aiReply = await sendAIBobQuery(text);
      setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: "I encountered a connection error, but your data is secure. Let's try that again." }]);
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

        <div className="ai-chat-thread">
          {messages.map((msg, index) => (
            <div key={index} className={msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
              {msg.text}
            </div>
          ))}
        </div>

        {showSuggestions && (
          <div className="ai-suggestions">
            {suggestions.map((sug, index) => (
              <button key={index} className="suggestion-pill" onClick={() => handleSend(sug)} disabled={isProcessing}>
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
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isProcessing}
          />
          <div className="ai-submit-btn-wrapper">
            <div className="ai-submit-glow"></div>
            <button className="ai-submit-btn" onClick={() => handleSend()} disabled={isProcessing}>
              <svg width="15" height="15" viewBox="0 0 14 14" fill="none"><path d="M7 11.2V3M7 3L3.6 6.4M7 3l3.4 3.4" stroke="#fff" strokeWidth="1.7" strokeLinecap="round"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}