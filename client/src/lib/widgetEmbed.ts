export type WidgetEmbedWidgetConfig = {
  primaryColor?: string | null;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | (string & {});
  avatarUrl?: string | null;
  showBranding?: boolean | null;
  autoOpen?: boolean | null;
  widgetKey?: string | null;
  allowedOrigins?: string[] | null;
};

export function buildWidgetEmbedCode(params: {
  baseUrl: string;
  agentId: string;
  agentName?: string | null;
  forceAgentName?: boolean;
  greeting?: string | null;
  widgetConfig?: WidgetEmbedWidgetConfig | null;
}) {
  const { baseUrl, agentId, agentName, forceAgentName, greeting, widgetConfig } = params;

  let code = `<script src="${baseUrl}/widget.js"`;
  code += `\n  data-agent-id="${agentId}"`;

  if (widgetConfig?.widgetKey) {
    code += `\n  data-widget-key="${widgetConfig.widgetKey}"`;
  }

  if (agentName && (forceAgentName || agentName !== "AI Assistant")) {
    code += `\n  data-agent-name="${agentName}"`;
  }

  if (widgetConfig?.primaryColor && widgetConfig.primaryColor !== "#6366f1") {
    code += `\n  data-primary-color="${widgetConfig.primaryColor}"`;
  }

  if (widgetConfig?.position && widgetConfig.position !== "bottom-right") {
    code += `\n  data-position="${widgetConfig.position}"`;
  }

  if (widgetConfig?.avatarUrl) {
    code += `\n  data-avatar-url="${widgetConfig.avatarUrl}"`;
  }

  if (widgetConfig?.showBranding === false) {
    code += `\n  data-show-branding="false"`;
  }

  if (widgetConfig?.autoOpen) {
    code += `\n  data-auto-open="true"`;
  }

  if (greeting) {
    code += `\n  data-greeting="${greeting.replace(/\"/g, '&quot;')}"`;
  }

  code += `>\n</script>`;
  return code;
}

export function buildWidgetNextJsScriptSnippet(params: {
  baseUrl: string;
  agentId: string;
  widgetKey?: string | null;
}) {
  const { baseUrl, agentId, widgetKey } = params;
  const widgetKeyLine = widgetKey ? `\n  data-widget-key=\"${widgetKey}\"` : "";

  return `// Next.js example\nimport Script from 'next/script'\n\n<Script \n  src=\"${baseUrl}/widget.js\"\n  data-agent-id=\"${agentId}\"${widgetKeyLine}\n  strategy=\"afterInteractive\"\n/>`;
}
