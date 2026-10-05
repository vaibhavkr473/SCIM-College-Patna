import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api.js';

export default function PublicAssistants() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState('');
  const [whatsAppLoading, setWhatsAppLoading] = useState(false);
  const [whatsAppStatus, setWhatsAppStatus] = useState('');
  const [whatsAppError, setWhatsAppError] = useState(false);
  const [whatsAppUrl, setWhatsAppUrl] = useState('');
  const chatInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatOpen) chatInputRef.current?.focus();
  }, [chatOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const handleWhatsAppRequest = async () => {
    const whatsappTab = window.open('about:blank', '_blank');
    if (whatsappTab) whatsappTab.opener = null;
    setWhatsAppLoading(true);
    setWhatsAppStatus('');
    setWhatsAppError(false);
    setWhatsAppUrl('');

    try {
      const data = await api.requestWhatsAppContact();
      if (whatsappTab) {
        whatsappTab.location.replace(data.url);
        setWhatsAppStatus('Opening WhatsApp...');
      } else {
        setWhatsAppUrl(data.url);
        setWhatsAppStatus('Continue to WhatsApp using the link below.');
      }
    } catch (error) {
      whatsappTab?.close();
      setWhatsAppStatus(error.message || 'We could not send your request. Please try again.');
      setWhatsAppError(true);
    } finally {
      setWhatsAppLoading(false);
    }
  };

  const handleAsk = async (event) => {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || chatLoading) return;

    const nextMessages = [...messages, { role: 'user', content: trimmedQuestion }];
    setMessages(nextMessages);
    setQuestion('');
    setChatLoading(true);

    try {
      const response = await api.askPublicTutor({
        question: trimmedQuestion,
        history: messages.map(({ role, content }) => ({
          role: role === 'user' ? 'user' : 'model',
          content,
        })),
      });
      if (response.provider) setActiveProvider(response.provider);
      setMessages([
        ...nextMessages,
        { role: 'ai', content: response.answer || 'I could not find an answer. Please try rephrasing your question.' },
      ]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        { role: 'ai', content: error.message || 'The AI assistant is unavailable right now. Please try again shortly.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="public-assistants">
      {chatOpen && (
        <section className="public-chat-panel" aria-label="SCIM AI assistant">
          <div className="public-chat-header">
            <span className="public-chat-avatar" aria-hidden="true"><i className="bi bi-stars" /></span>
            <div>
              <strong>SCIM AI Assistant</strong>
              <span>
                {activeProvider
                  ? `Powered by ${activeProvider === 'openai' ? 'OpenAI' : 'Gemini'}`
                  : 'Uses your configured AI provider'}
              </span>
            </div>
            <button
              type="button"
              className="public-chat-close"
              aria-label="Close AI assistant"
              onClick={() => setChatOpen(false)}
            >
              <i className="bi bi-x-lg" aria-hidden="true" />
            </button>
          </div>

          <div className="public-chat-messages" aria-live="polite" aria-relevant="additions">
            {messages.length === 0 && (
              <div className="public-chat-welcome">
                <span className="public-chat-welcome-icon"><i className="bi bi-stars" aria-hidden="true" /></span>
                <h3>How can I help?</h3>
                <p>Ask me about BBA, BCA, study resources, or the student portal.</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div className={`public-chat-message ${message.role}`} key={`${message.role}-${index}`}>
                {message.content}
              </div>
            ))}
            {chatLoading && (
              <div className="public-chat-message ai public-chat-typing" role="status">
                <span /><span /><span />
                <span className="visually-hidden">Gemini is thinking</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="public-chat-form" onSubmit={handleAsk}>
            <label className="visually-hidden" htmlFor="public-ai-question">Ask the AI assistant</label>
            <input
              ref={chatInputRef}
              id="public-ai-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength={1000}
              placeholder="Type your question..."
              disabled={chatLoading}
              required
            />
            <button type="submit" aria-label="Send question" disabled={chatLoading || !question.trim()}>
              <i className="bi bi-arrow-up" aria-hidden="true" />
            </button>
          </form>
          <p className="public-chat-disclaimer">AI responses can make mistakes. Please verify important information.</p>
        </section>
      )}

      <div className="public-assistant-actions">
        {whatsAppStatus && (
          <div className={`public-assistant-status${whatsAppError ? ' is-error' : ''}`} role="status">
            {whatsAppStatus}
            {whatsAppUrl && (
              <a className="public-assistant-whatsapp-link" href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
                Open WhatsApp <i className="bi bi-arrow-up-right" aria-hidden="true" />
              </a>
            )}
          </div>
        )}
        <button
          type="button"
          className="public-assistant-button public-assistant-whatsapp"
          aria-label="Request contact through WhatsApp"
          title="Contact us on WhatsApp"
          onClick={handleWhatsAppRequest}
          disabled={whatsAppLoading}
        >
          <i className={`bi ${whatsAppLoading ? 'bi-arrow-repeat' : 'bi-whatsapp'}`} aria-hidden="true" />
          <span>{whatsAppLoading ? 'Sending request...' : 'WhatsApp'}</span>
        </button>
        <button
          type="button"
          className="public-assistant-button public-assistant-gemini"
          aria-label={chatOpen ? 'Close AI assistant' : 'Open AI assistant'}
          title="Chat with the SCIM AI assistant"
          aria-expanded={chatOpen}
          onClick={() => setChatOpen((open) => !open)}
        >
          <i className={`bi ${chatOpen ? 'bi-x-lg' : 'bi-stars'}`} aria-hidden="true" />
          <span>{chatOpen ? 'Close assistant' : 'Ask Gemini'}</span>
        </button>
      </div>
    </div>
  );
}
