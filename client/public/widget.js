/**
 * AgentForge Chatbot Widget
 * Embed this script on your website to add an AI chatbot
 * 
 * Usage: <script src="https://your-domain.com/widget.js" data-agent-id="your-agent-id"></script>
 * 
 * Configuration options (data attributes):
 * - data-agent-id: Required. Your agent ID
 * - data-position: Widget position (bottom-right, bottom-left, top-right, top-left)
 * - data-primary-color: Main color for the widget (hex code)
 * - data-agent-name: Display name for the agent
 * - data-greeting: Initial greeting message
 * - data-avatar-url: URL for agent avatar image
 * - data-show-branding: Show "Powered by AgentForge" (true/false)
 * - data-auto-open: Auto-open chat on page load (true/false)
 */

(function() {
  'use strict';

  // Get configuration from script tag
  const scriptTag = document.currentScript || document.querySelector('script[data-agent-id]');
  const agentId = scriptTag?.getAttribute('data-agent-id');
  const position = scriptTag?.getAttribute('data-position') || 'bottom-right';
  const primaryColor = scriptTag?.getAttribute('data-primary-color') || '#6366f1';
  const agentName = scriptTag?.getAttribute('data-agent-name') || 'AI Assistant';
  const greeting = scriptTag?.getAttribute('data-greeting') || 'Hi! How can I help you today?';
  const avatarUrl = scriptTag?.getAttribute('data-avatar-url') || '';
  const showBranding = scriptTag?.getAttribute('data-show-branding') !== 'false';
  const autoOpen = scriptTag?.getAttribute('data-auto-open') === 'true';
  
  if (!agentId) {
    console.error('AgentForge Widget: Missing data-agent-id attribute');
    return;
  }

  // Get the API base URL from the script src
  const scriptSrc = scriptTag?.src || '';
  const baseUrl = scriptSrc.replace('/widget.js', '');

  // Simple markdown parser for structured responses
  function parseMarkdown(text) {
    if (!text) return '';
    
    let html = text
      // Escape HTML first
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Bold: **text** or __text__
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      // Italic: *text* or _text_
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      // Headers: # Header
      .replace(/^### (.+)$/gm, '<h4 style="font-size:14px;font-weight:600;margin:8px 0 4px;">$1</h4>')
      .replace(/^## (.+)$/gm, '<h3 style="font-size:15px;font-weight:600;margin:10px 0 6px;">$1</h3>')
      .replace(/^# (.+)$/gm, '<h2 style="font-size:16px;font-weight:700;margin:12px 0 8px;">$1</h2>')
      // Bullet points: - item or * item
      .replace(/^[\-\*] (.+)$/gm, '<li style="margin-left:16px;margin-bottom:4px;">$1</li>')
      // Numbered lists: 1. item
      .replace(/^\d+\. (.+)$/gm, '<li style="margin-left:16px;margin-bottom:4px;list-style-type:decimal;">$1</li>')
      // Wrap consecutive list items in ul
      .replace(/(<li[^>]*>.*<\/li>\n?)+/g, function(match) {
        return '<ul style="margin:8px 0;padding-left:8px;list-style-position:inside;">' + match + '</ul>';
      })
      // Code inline: `code`
      .replace(/`([^`]+)`/g, '<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:13px;">$1</code>')
      // Line breaks
      .replace(/\n\n/g, '</p><p style="margin:8px 0;">')
      .replace(/\n/g, '<br>');
    
    // Wrap in paragraph if not starting with block element
    if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol')) {
      html = '<p style="margin:0;">' + html + '</p>';
    }
    
    return html;
  }

  // Styles for the widget
  const styles = `
    .af-widget-container {
      position: fixed !important;
      ${position.includes('bottom') ? 'bottom: 20px !important;' : 'top: 20px !important;'}
      ${position.includes('right') ? 'right: 20px !important;' : 'left: 20px !important;'}
      z-index: 999999 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
    }

    .af-widget-button {
      width: 60px !important;
      height: 60px !important;
      border-radius: 50% !important;
      background: ${primaryColor} !important;
      border: none !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
      transition: transform 0.2s, box-shadow 0.2s !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    .af-widget-button:hover {
      transform: scale(1.05) !important;
      box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2) !important;
    }

    .af-widget-button svg {
      width: 28px !important;
      height: 28px !important;
      fill: white !important;
    }

    .af-widget-chat {
      position: absolute !important;
      ${position.includes('bottom') ? 'bottom: 70px !important;' : 'top: 70px !important;'}
      ${position.includes('right') ? 'right: 0 !important;' : 'left: 0 !important;'}
      width: 380px !important;
      height: 520px !important;
      background: #ffffff !important;
      border-radius: 16px !important;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
      display: none !important;
      flex-direction: column !important;
      overflow: hidden !important;
    }

    .af-widget-chat.open {
      display: flex !important;
    }

    .af-widget-header {
      background: ${primaryColor} !important;
      color: white !important;
      padding: 16px 20px !important;
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
    }

    .af-widget-header-avatar {
      width: 40px !important;
      height: 40px !important;
      border-radius: 50% !important;
      background: rgba(255, 255, 255, 0.2) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .af-widget-header-avatar svg {
      width: 24px !important;
      height: 24px !important;
      fill: white !important;
    }

    .af-widget-header-info h3 {
      margin: 0 !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      color: white !important;
    }

    .af-widget-header-info p {
      margin: 2px 0 0 !important;
      font-size: 12px !important;
      opacity: 0.85 !important;
      color: white !important;
    }

    .af-widget-close {
      margin-left: auto !important;
      background: none !important;
      border: none !important;
      color: white !important;
      cursor: pointer !important;
      padding: 4px !important;
      opacity: 0.8 !important;
      transition: opacity 0.2s !important;
    }

    .af-widget-close:hover {
      opacity: 1 !important;
    }

    .af-widget-messages {
      flex: 1 !important;
      overflow-y: auto !important;
      padding: 16px !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 12px !important;
      background: #f9fafb !important;
    }

    .af-widget-message {
      max-width: 85% !important;
      padding: 12px 16px !important;
      border-radius: 16px !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      animation: af-fadeIn 0.2s ease !important;
    }

    @keyframes af-fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .af-widget-message.user {
      align-self: flex-end !important;
      background: ${primaryColor} !important;
      color: white !important;
      border-bottom-right-radius: 4px !important;
    }

    .af-widget-message.assistant {
      align-self: flex-start !important;
      background: white !important;
      color: #1f2937 !important;
      border-bottom-left-radius: 4px !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
    }

    .af-widget-message.assistant a {
      color: ${primaryColor} !important;
      text-decoration: underline !important;
      word-break: break-all !important;
    }

    .af-widget-message.assistant a:hover {
      opacity: 0.8 !important;
    }

    .af-widget-typing {
      display: flex !important;
      gap: 4px !important;
      padding: 12px 16px !important;
      background: white !important;
      border-radius: 16px !important;
      align-self: flex-start !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
    }

    .af-widget-typing span {
      width: 8px !important;
      height: 8px !important;
      background: #9ca3af !important;
      border-radius: 50% !important;
      animation: af-typing 1.4s infinite ease-in-out !important;
    }

    .af-widget-typing span:nth-child(2) { animation-delay: 0.2s !important; }
    .af-widget-typing span:nth-child(3) { animation-delay: 0.4s !important; }

    @keyframes af-typing {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }

    .af-widget-input-area {
      padding: 16px !important;
      background: white !important;
      border-top: 1px solid #e5e7eb !important;
      display: flex !important;
      gap: 8px !important;
    }

    .af-widget-input {
      flex: 1 !important;
      padding: 12px 16px !important;
      border: 1px solid #e5e7eb !important;
      border-radius: 24px !important;
      font-size: 14px !important;
      outline: none !important;
      transition: border-color 0.2s !important;
      background: white !important;
      color: #1f2937 !important;
    }

    .af-widget-input:focus {
      border-color: ${primaryColor} !important;
    }

    .af-widget-input::placeholder {
      color: #9ca3af !important;
    }

    .af-widget-send {
      width: 44px !important;
      height: 44px !important;
      border-radius: 50% !important;
      background: ${primaryColor} !important;
      border: none !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: background 0.2s !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    .af-widget-send:hover {
      background: ${primaryColor}dd !important;
    }

    .af-widget-send:disabled {
      background: #9ca3af !important;
      cursor: not-allowed !important;
    }

    .af-widget-send svg {
      width: 20px !important;
      height: 20px !important;
      fill: white !important;
    }

    .af-widget-powered {
      text-align: center !important;
      padding: 8px !important;
      font-size: 11px !important;
      color: #9ca3af !important;
      background: white !important;
    }

    .af-widget-powered a {
      color: ${primaryColor} !important;
      text-decoration: none !important;
    }

    /* Tablet styles */
    @media (max-width: 768px) {
      .af-widget-chat {
        width: 340px !important;
        height: 480px !important;
      }
    }

    /* Mobile styles */
    @media (max-width: 480px) {
      .af-widget-container {
        ${position.includes('bottom') ? 'bottom: 12px !important;' : 'top: 12px !important;'}
        ${position.includes('right') ? 'right: 12px !important;' : 'left: 12px !important;'}
      }

      .af-widget-button {
        width: 52px !important;
        height: 52px !important;
      }

      .af-widget-button svg {
        width: 24px !important;
        height: 24px !important;
      }

      .af-widget-chat {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        height: 100% !important;
        max-height: 100vh !important;
        border-radius: 0 !important;
        z-index: 9999999 !important;
      }

      .af-widget-header {
        padding: 14px 16px !important;
        border-radius: 0 !important;
      }

      .af-widget-header-avatar {
        width: 36px !important;
        height: 36px !important;
      }

      .af-widget-header-info h3 {
        font-size: 15px !important;
      }

      .af-widget-header-info p {
        font-size: 11px !important;
      }

      .af-widget-messages {
        padding: 12px !important;
        gap: 10px !important;
      }

      .af-widget-message {
        max-width: 88% !important;
        padding: 10px 14px !important;
        font-size: 14px !important;
        border-radius: 14px !important;
      }

      .af-widget-input-area {
        padding: 12px !important;
        gap: 8px !important;
      }

      .af-widget-input {
        padding: 10px 14px !important;
        font-size: 16px !important; /* Prevents zoom on iOS */
      }

      .af-widget-send {
        width: 40px !important;
        height: 40px !important;
        flex-shrink: 0 !important;
      }

      .af-widget-send svg {
        width: 18px !important;
        height: 18px !important;
      }

      .af-widget-powered {
        padding: 6px !important;
        font-size: 10px !important;
      }
    }

    /* Extra small mobile */
    @media (max-width: 360px) {
      .af-widget-message {
        max-width: 90% !important;
        padding: 8px 12px !important;
        font-size: 13px !important;
      }

      .af-widget-input {
        padding: 8px 12px !important;
      }
    }
  `;

  // Create avatar HTML - use custom image or default SVG
  const avatarHTML = avatarUrl 
    ? `<img src="${avatarUrl}" alt="${agentName}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>`;

  // Branding HTML
  const brandingHTML = showBranding 
    ? `<div class="af-widget-powered">
          Powered by <a href="${baseUrl}" target="_blank">AgentForge</a>
        </div>`
    : '';

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
            ${avatarHTML}
          </div>
          <div class="af-widget-header-info">
            <h3>${agentName}</h3>
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
        ${brandingHTML}
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

  // Auto-open if configured
  if (autoOpen) {
    setTimeout(toggleChat, 1500);
  }

  // Helper function to convert URLs to clickable links
  function linkify(text) {
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g;
    return text.replace(urlRegex, function(url) {
      // Truncate display URL if too long
      const displayUrl = url.length > 50 ? url.substring(0, 50) + '...' : url;
      return '<a href="' + url + '" target="_blank" rel="noopener noreferrer" style="color: ' + primaryColor + '; text-decoration: underline; word-break: break-all;">' + displayUrl + '</a>';
    });
  }

  // Add message to chat with markdown support
  function addMessage(content, role) {
    const messageEl = document.createElement('div');
    messageEl.className = `af-widget-message ${role}`;
    
    if (role === 'assistant') {
      // Parse markdown and convert URLs to clickable links
      const parsedContent = parseMarkdown(content);
      messageEl.innerHTML = linkify(parsedContent);
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
