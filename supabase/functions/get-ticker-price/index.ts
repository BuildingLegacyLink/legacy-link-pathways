
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
    console.log(`Fetching price for ticker: ${upperTicker}`);

    // Call Yahoo Finance API with proper headers to avoid bot detection
    const response = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${upperTicker}`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/json',
          'Referer': 'https://finance.yahoo.com/',
          'Origin': 'https://finance.yahoo.com/'
        }
      }
    );

    if (!response.ok) {
      console.error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: `Yahoo Finance error: ${response.status}` }),
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    const data = await response.json();
    console.log('Yahoo Finance response received');

    const result = data.quoteResponse?.result?.[0];

    if (!result) {
      return new Response(
        JSON.stringify({ error: "Invalid ticker or no data returned" }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    const price = result.regularMarketPrice || result.bid || result.ask || result.previousClose;
    
    if (!price || isNaN(parseFloat(price))) {
      return new Response(
        JSON.stringify({ error: 'No valid price data available' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    const responseData = {
      ticker: result.symbol || upperTicker,
      name: result.shortName || result.longName || 'Unknown',
      price: parseFloat(price),
      timestamp: new Date().toISOString(),
      source: 'Yahoo Finance'
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
    console.error('Error fetching ticker price:', error);
    
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
