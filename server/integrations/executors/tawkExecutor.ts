export type TawkExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

// NOTE:
// Tawk.to's publicly accessible API documentation endpoints were not reliably fetchable
// in this environment (many docs URLs returned 404). To avoid implementing incorrect
// endpoints, this executor is a safe placeholder.
//
// Once the official API base + routes are confirmed, implement:
// - send_message
// - create_ticket
// - get_visitor_info
// - ban_visitor
export async function executeTawkAction(input: TawkExecuteInput): Promise<any> {
  const { actionId } = input;
  return {
    status: 'skipped',
    message:
      `Tawk action not implemented (API endpoints not confirmed in this environment): ${actionId}`,
  };
}
