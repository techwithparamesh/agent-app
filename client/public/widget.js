/**
 * AgentForge Chatbot Widget
 * Embed this script on your website to add an AI chatbot
 * 
 * Usage: <script src="https://your-domain.com/widget.js" data-agent-id="your-agent-id"></script>
 */

(function() {
  'use strict';

  // Get configuration from script tag
  const scriptTag = document.currentScript || document.querySelector('script[data-agent-id]');
  const agentId = scriptTag?.getAttribute('data-agent-id');
  const position = scriptTag?.getAttribute('data-position') || 'bottom-right';
  const primaryColor = scriptTag?.getAttribute('data-primary-color') || '#6366f1';
  const greeting = scriptTag?.getAttribute('data-greeting') || 'Hi! How can I help you today?';
  
  if (!agentId) {
    console.error('AgentForge Widget: Missing data-agent-id attribute');
    return;
  }

  // Get the API base URL from the script src
  const scriptSrc = scriptTag?.src || '';
  const baseUrl = scriptSrc.replace('/widget.js', '');

  // Styles for the widget
  const styles = `
    .af-widget-container {
      position: fixed;
      ${position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
      ${position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }

    .af-widget-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${primaryColor};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .af-widget-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
    }

    .af-widget-button svg {
      width: 28px;
      height: 28px;
      fill: white;
    }

    .af-widget-chat {
      position: absolute;
      ${position.includes('bottom') ? 'bottom: 70px;' : 'top: 70px;'}
      ${position.includes('right') ? 'right: 0;' : 'left: 0;'}
      width: 380px;
      height: 520px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }

    .af-widget-chat.open {
      display: flex;
    }

    .af-widget-header {
      background: ${primaryColor};
      color: white;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .af-widget-header-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .af-widget-header-avatar svg {
      width: 24px;
      height: 24px;
      fill: white;
    }

    .af-widget-header-info h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .af-widget-header-info p {
      margin: 2px 0 0;
      font-size: 12px;
      opacity: 0.85;
    }

    .af-widget-close {
      margin-left: auto;
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .af-widget-close:hover {
      opacity: 1;
    }

    .af-widget-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f9fafb;
    }

    .af-widget-message {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
      animation: af-fadeIn 0.2s ease;
    }

    @keyframes af-fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .af-widget-message.user {
      align-self: flex-end;
      background: ${primaryColor};
      color: white;
      border-bottom-right-radius: 4px;
    }

    .af-widget-message.assistant {
      align-self: flex-start;
      background: white;
      color: #1f2937;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .af-widget-message.assistant a {
      color: ${primaryColor};
      text-decoration: underline;
      word-break: break-all;
    }

    .af-widget-message.assistant a:hover {
      opacity: 0.8;
    }

    .af-widget-typing {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
      background: white;
      border-radius: 16px;
      align-self: flex-start;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .af-widget-typing span {
      width: 8px;
      height: 8px;
      background: #9ca3af;
      border-radius: 50%;
      animation: af-typing 1.4s infinite ease-in-out;
    }

    .af-widget-typing span:nth-child(2) { animation-delay: 0.2s; }
    .af-widget-typing span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes af-typing {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }

    .af-widget-input-area {
      padding: 16px;
      background: white;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
    }

    .af-widget-input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #e5e7eb;
      border-radius: 24px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .af-widget-input:focus {
      border-color: ${primaryColor};
    }

    .af-widget-send {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: ${primaryColor};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .af-widget-send:hover {
      background: ${primaryColor}dd;
    }

    .af-widget-send:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .af-widget-send svg {
      width: 20px;
      height: 20px;
      fill: white;
    }

    .af-widget-powered {
      text-align: center;
      padding: 8px;
      font-size: 11px;
      color: #9ca3af;
      background: white;
    }

    .af-widget-powered a {
      color: ${primaryColor};
      text-decoration: none;
    }

    @media (max-width: 480px) {
      .af-widget-chat {
        width: calc(100vw - 40px);
        height: calc(100vh - 120px);
        ${position.includes('right') ? 'right: -10px;' : 'left: -10px;'}
      }
    }
  `;

  // Create widget HTML
  const widgetHTML = `
    <div class="af-widget-container" id="af-widget">
      <button class="af-widget-button" id="af-toggle" aria-label="Open chat">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
          <path d="M7 9h10v2H7zm0-3h10v2H7z"/>
        </svg>
      </button>
      <div class="af-widget-chat" id="af-chat">
        <div class="af-widget-header">
          <div class="af-widget-header-avatar">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <div class="af-widget-header-info">
            <h3>AI Assistant</h3>
            <p>Always here to help</p>
          </div>
          <button class="af-widget-close" id="af-close" aria-label="Close chat">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="af-widget-messages" id="af-messages">
          <div class="af-widget-message assistant">${greeting}</div>
        </div>
        <div class="af-widget-input-area">
          <input type="text" class="af-widget-input" id="af-input" placeholder="Type your message..." />
          <button class="af-widget-send" id="af-send" aria-label="Send message">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        <div class="af-widget-powered">
          Powered by <a href="${baseUrl}" target="_blank">AgentForge</a>
        </div>
      </div>
    </div>
  `;

  // Inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Inject widget
  const widgetContainer = document.createElement('div');
  widgetContainer.innerHTML = widgetHTML;
  document.body.appendChild(widgetContainer);

  // Get elements
  const toggleBtn = document.getElementById('af-toggle');
  const closeBtn = document.getElementById('af-close');
  const chatWindow = document.getElementById('af-chat');
  const messagesContainer = document.getElementById('af-messages');
  const inputField = document.getElementById('af-input');
  const sendBtn = document.getElementById('af-send');

  let isOpen = false;
  let isTyping = false;

  // Toggle chat window
  function toggleChat() {
    isOpen = !isOpen;
    chatWindow.classList.toggle('open', isOpen);
    if (isOpen) {
      inputField.focus();
    }
  }

  toggleBtn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  // Helper function to convert URLs to clickable links
  function linkify(text) {
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g;
    return text.replace(urlRegex, function(url) {
      // Truncate display URL if too long
      const displayUrl = url.length > 50 ? url.substring(0, 50) + '...' : url;
      return '<a href="' + url + '" target="_blank" rel="noopener noreferrer" style="color: ' + primaryColor + '; text-decoration: underline; word-break: break-all;">' + displayUrl + '</a>';
    });
  }

  // Add message to chat
  function addMessage(content, role) {
    const messageEl = document.createElement('div');
    messageEl.className = `af-widget-message ${role}`;
    
    // For assistant messages, convert URLs to clickable links
    if (role === 'assistant') {
      messageEl.innerHTML = linkify(content);
    } else {
      messageEl.textContent = content;
    }
    
    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Show typing indicator
  function showTyping() {
    if (isTyping) return;
    isTyping = true;
    const typingEl = document.createElement('div');
    typingEl.className = 'af-widget-typing';
    typingEl.id = 'af-typing';
    typingEl.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(typingEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Hide typing indicator
  function hideTyping() {
    isTyping = false;
    const typingEl = document.getElementById('af-typing');
    if (typingEl) typingEl.remove();
  }

  // Generate or get session ID for conversation tracking
  function getSessionId() {
    let sessionId = localStorage.getItem('af_widget_session');
    if (!sessionId) {
      sessionId = 'widget_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('af_widget_session', sessionId);
    }
    return sessionId;
  }

  const sessionId = getSessionId();

  // Send message to API
  async function sendMessage() {
    const message = inputField.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    inputField.value = '';
    sendBtn.disabled = true;

    // Show typing indicator
    showTyping();

    try {
      const response = await fetch(`${baseUrl}/api/widget/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agentId,
          message: message,
          sessionId: sessionId,
        }),
      });

      hideTyping();

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      addMessage(data.response, 'assistant');
    } catch (error) {
      hideTyping();
      addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
      console.error('AgentForge Widget Error:', error);
    }

    sendBtn.disabled = false;
    inputField.focus();
  }

  // Event listeners
  sendBtn.addEventListener('click', sendMessage);
  inputField.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Enable/disable send button based on input
  inputField.addEventListener('input', function() {
    sendBtn.disabled = !inputField.value.trim();
  });

  console.log('AgentForge Widget loaded successfully');
})();
