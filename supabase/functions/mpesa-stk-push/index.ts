const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

interface DarajaTokenResponse {
  access_token: string;
  expires_in: string;
}

interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
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

async function initiateStkPush(token: string, request: STKPushRequest): Promise<STKPushResponse> {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const businessShortCode = Deno.env.get('MPESA_SHORTCODE') || '174379';
  const passkey = Deno.env.get('MPESA_PASSKEY') || '';
  
  const password = btoa(`${businessShortCode}${passkey}${timestamp}`);
  
  const stkPushData = {
    BusinessShortCode: businessShortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: request.amount,
    PartyA: request.phoneNumber,
    PartyB: businessShortCode,
    PhoneNumber: request.phoneNumber,
    CallBackURL: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mpesa-callback`,
    AccountReference: request.accountReference,
    TransactionDesc: request.transactionDesc,
  };

  const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stkPushData),
  });

  if (!response.ok) {
    throw new Error('STK Push request failed');
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
    const { phoneNumber, amount, accountReference, transactionDesc }: STKPushRequest = await req.json();

    // Validate input
    if (!phoneNumber || !amount || !accountReference) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Missing required fields' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Format phone number to 254XXXXXXXXX
    const formattedPhone = phoneNumber.startsWith('254') 
      ? phoneNumber 
      : `254${phoneNumber.substring(1)}`;

    // Get Daraja access token
    const token = await getDarajaToken();

    // Initiate STK Push
    const stkResponse = await initiateStkPush(token, {
      phoneNumber: formattedPhone,
      amount,
      accountReference,
      transactionDesc: transactionDesc || 'M-Pesa Payment',
    });

    if (stkResponse.ResponseCode === '0') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'STK Push initiated successfully',
          data: {
            merchantRequestId: stkResponse.MerchantRequestID,
            checkoutRequestId: stkResponse.CheckoutRequestID,
            customerMessage: stkResponse.CustomerMessage,
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: stkResponse.ResponseDescription || 'STK Push failed',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('STK Push error:', error);
    
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