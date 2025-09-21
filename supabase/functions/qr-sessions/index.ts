import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface QRSessionRequest {
  phoneNumber: string;
  amount?: number;
  type: 'send' | 'receive';
}

interface QRSession {
  id: string;
  sessionId: string;
  phoneNumber: string;
  amount?: number;
  type: 'send' | 'receive';
  expiresAt: string;
  createdAt: string;
}

function generateSessionId(): string {
  return Math.random().toString(36).substr(2, 12).toUpperCase();
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'POST') {
      const { phoneNumber, amount, type }: QRSessionRequest = await req.json();

      if (!phoneNumber || !type) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const sessionId = generateSessionId();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      const { data, error } = await supabase
        .from('qr_sessions')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          phone_number: phoneNumber,
          amount,
          type,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create QR session' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const session: QRSession = {
        id: data.id,
        sessionId: data.session_id,
        phoneNumber: data.phone_number,
        amount: data.amount,
        type: data.type,
        expiresAt: data.expires_at,
        createdAt: data.created_at,
      };

      return new Response(
        JSON.stringify(session),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const sessionId = url.pathname.split('/').pop();

      if (!sessionId) {
        return new Response(
          JSON.stringify({ error: 'Session ID is required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data, error } = await supabase
        .from('qr_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .gt('expires_at', new Date().toISOString())
        .is('used_at', null)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ 
            valid: false,
            message: 'Session not found or expired' 
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const session: QRSession = {
        id: data.id,
        sessionId: data.session_id,
        phoneNumber: data.phone_number,
        amount: data.amount,
        type: data.type,
        expiresAt: data.expires_at,
        createdAt: data.created_at,
      };

      return new Response(
        JSON.stringify({ 
          valid: true, 
          session 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('QR sessions error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});