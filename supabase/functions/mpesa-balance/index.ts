const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface DarajaTokenResponse {
  access_token: string;
  expires_in: string;
}

interface BalanceResponse {
  OriginatorConversationID: string;
  ConversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

async function getDarajaToken(): Promise<string> {
  const auth = btoa(`${Deno.env.get('MPESA_CONSUMER_KEY')}:${Deno.env.get('MPESA_CONSUMER_SECRET')}`);
  
  const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get Daraja token');
  }

  const data: DarajaTokenResponse = await response.json();
  return data.access_token;
}

async function queryAccountBalance(token: string, phoneNumber: string): Promise<BalanceResponse> {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const businessShortCode = Deno.env.get('MPESA_SHORTCODE') || '174379';
  const passkey = Deno.env.get('MPESA_PASSKEY') || '';
  
  const password = btoa(`${businessShortCode}${passkey}${timestamp}`);
  
  const balanceData = {
    Initiator: Deno.env.get('MPESA_INITIATOR') || 'testapi',
    SecurityCredential: Deno.env.get('MPESA_SECURITY_CREDENTIAL') || '',
    CommandID: 'AccountBalance',
    PartyA: businessShortCode,
    IdentifierType: '4',
    Remarks: 'Balance query',
    QueueTimeOutURL: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mpesa-timeout`,
    ResultURL: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mpesa-balance-result`,
  };

  const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(balanceData),
  });

  if (!response.ok) {
    throw new Error('Balance query failed');
  }

  return await response.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // For demo purposes, return mock balance
    // In production, you would implement actual balance checking
    const mockBalance = Math.floor(Math.random() * 10000) + 1000;
    
    return new Response(
      JSON.stringify({
        success: true,
        balance: mockBalance.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
    
    // Uncomment below for actual Daraja API integration
    /*
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Phone number is required' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = await getDarajaToken();
    const balanceResponse = await queryAccountBalance(token, phoneNumber);

    if (balanceResponse.ResponseCode === '0') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Balance query initiated',
          conversationId: balanceResponse.ConversationID,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: balanceResponse.ResponseDescription,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    */
  } catch (error) {
    console.error('Balance query error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});