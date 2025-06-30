
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker } = await req.json();

    if (!ticker) {
      return new Response(
        JSON.stringify({ error: "Ticker is required" }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    const upperTicker = ticker.toUpperCase();
    console.log(`Fetching price for ticker: ${upperTicker} via Finnhub`);

    const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY');
    
    if (!FINNHUB_API_KEY) {
      console.error('FINNHUB_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ error: "API configuration error" }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Fetch current price quote from Finnhub
    const quoteResponse = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${upperTicker}`,
      {
        method: 'GET',
        headers: {
          'X-Finnhub-Token': FINNHUB_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!quoteResponse.ok) {
      console.error(`Finnhub quote API error: ${quoteResponse.status} ${quoteResponse.statusText}`);
      return new Response(
        JSON.stringify({ error: `Finnhub quote error: ${quoteResponse.status}` }),
        { 
          status: quoteResponse.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    const quoteData = await quoteResponse.json();
    console.log('Finnhub quote response received:', quoteData);

    // Check if we have valid price data
    if (!quoteData || !quoteData.c || quoteData.c === 0) {
      return new Response(
        JSON.stringify({ error: "No valid price data found for ticker" }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Fetch company profile for name
    const profileResponse = await fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${upperTicker}`,
      {
        method: 'GET',
        headers: {
          'X-Finnhub-Token': FINNHUB_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    let companyName = 'Unknown Company';
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      companyName = profileData.name || companyName;
    }

    const responseData = {
      ticker: upperTicker,
      name: companyName,
      price: parseFloat(quoteData.c),
      timestamp: new Date().toISOString(),
      source: 'Finnhub'
    };

    console.log(`Successfully fetched price for ${upperTicker}: $${responseData.price}`);

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('Error fetching ticker price from Finnhub:', error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch ticker price", 
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});
