import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface STKCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
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

    const callbackData: STKCallback = await req.json();
    const stkCallback = callbackData.Body.stkCallback;

    console.log('Received STK Callback:', JSON.stringify(stkCallback, null, 2));

    // Extract transaction details
    let transactionDetails = {
      merchantRequestId: stkCallback.MerchantRequestID,
      checkoutRequestId: stkCallback.CheckoutRequestID,
      resultCode: stkCallback.ResultCode,
      resultDesc: stkCallback.ResultDesc,
      amount: 0,
      mpesaReceiptNumber: '',
      phoneNumber: '',
      transactionDate: '',
    };

    // If transaction was successful, extract metadata
    if (stkCallback.ResultCode === 0 && stkCallback.CallbackMetadata) {
      const metadata = stkCallback.CallbackMetadata.Item;
      
      metadata.forEach(item => {
        switch (item.Name) {
          case 'Amount':
            transactionDetails.amount = Number(item.Value);
            break;
          case 'MpesaReceiptNumber':
            transactionDetails.mpesaReceiptNumber = String(item.Value);
            break;
          case 'PhoneNumber':
            transactionDetails.phoneNumber = String(item.Value);
            break;
          case 'TransactionDate':
            transactionDetails.transactionDate = String(item.Value);
            break;
        }
      });
    }

    // Update transaction status in database
    const status = stkCallback.ResultCode === 0 ? 'completed' : 'failed';
    
    const { error } = await supabase
      .from('transactions')
      .update({
        status,
        mpesa_receipt: transactionDetails.mpesaReceiptNumber,
        updated_at: new Date().toISOString(),
      })
      .eq('checkout_request_id', stkCallback.CheckoutRequestID);

    if (error) {
      console.error('Database update error:', error);
    } else {
      console.log(`Transaction ${stkCallback.CheckoutRequestID} updated to ${status}`);
    }

    // Always return success to M-Pesa
    return new Response(
      JSON.stringify({
        ResultCode: 0,
        ResultDesc: 'Success',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Callback processing error:', error);
    
    // Still return success to M-Pesa to avoid retries
    return new Response(
      JSON.stringify({
        ResultCode: 0,
        ResultDesc: 'Success',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});