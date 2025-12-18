import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { Sandbox } from '@e2b/desktop';
import { z } from 'zod';

// Note: In production, manage Sandbox IDs in a session store/Redis
let activeSandbox: Sandbox | null = null;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Check if API keys are available
  const hasApiKeys = process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.E2B_API_KEY;

  if (!hasApiKeys) {
    // Demo mode - return simulated responses
    const demoResponse = {
      id: 'demo-' + Date.now(),
      role: 'assistant',
      content: `🤖 **Demo Mode Active**

I'm currently running in demo mode. To enable full AI-powered desktop automation:

1. **Add API Keys to .env.local:**
   \`\`\`env
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
   E2B_API_KEY=your_e2b_key
   \`\`\`

2. **Available Features in Demo:**
   - Interface demonstration
   - Component interaction
   - Layout preview
   - System status monitoring

3. **Full Features (with API keys):**
   - Real AI reasoning with Gemini 3
   - Live desktop automation with E2B
   - VNC streaming
   - File operations
   - Browser automation

**Try asking me:** "Show me what you can do" or "Initialize desktop session"
`,
      timestamp: Date.now()
    };

    return new Response(JSON.stringify(demoResponse), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const result = streamText({
    model: google('gemini-2.0-flash-exp'),
    messages,
    maxSteps: 10,
    tools: {
      init_desktop: tool({
        description: 'Boot the desktop environment and return connection details',
        parameters: z.object({}),
        execute: async () => {
          if (!activeSandbox) activeSandbox = await Sandbox.create();
          await activeSandbox.stream.start({ requireAuth: false });
          return {
            vncUrl: activeSandbox.stream.getUrl(),
            sandboxId: activeSandbox.sandboxId,
          };
        },
      }),
      computer_action: tool({
        description: 'Execute mouse/keyboard actions or launch apps',
        parameters: z.object({
          action: z.enum(['click', 'type', 'launch', 'press']),
          x: z.number().optional(),
          y: z.number().optional(),
          text: z.string().optional(),
        }),
        execute: async ({ action, x, y, text }) => {
          if (!activeSandbox) throw new Error("Desktop not initialized");
          if (action === 'click' && x && y) await activeSandbox.mouse.click(x, y);
          if (action === 'type' && text) await activeSandbox.keyboard.type(text);
          if (action === 'launch' && text) await activeSandbox.launch(text);
          return { success: true };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
