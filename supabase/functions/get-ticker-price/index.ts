
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
        JSON.stringify({ error: "Missing ticker parameter" }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    const upperTicker = ticker.toUpperCase();
    console.log(`Fetching price for ticker: ${upperTicker}`);

    // Call Yahoo Finance API from the server
    const response = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${upperTicker}`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TickerPriceFetcher/1.0)'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Yahoo Finance API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Yahoo Finance response received');

    if (!data.quoteResponse?.result?.length) {
      throw new Error('No quote data found for ticker');
    }

    const quote = data.quoteResponse.result[0];
    const price = quote.regularMarketPrice || quote.bid || quote.ask || quote.previousClose;
    
    if (!price || isNaN(parseFloat(price))) {
      throw new Error('No valid price data available');
    }

    const result = {
      ticker: quote.symbol || upperTicker,
      name: quote.shortName || quote.longName || 'Unknown',
      price: parseFloat(price),
      timestamp: new Date().toISOString(),
      source: 'Yahoo Finance'
    };

    console.log(`Successfully fetched price for ${upperTicker}: $${result.price}`);

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('Error fetching ticker price:', error);
    
    return new Response(
      JSON.stringify({ 
        error: `Failed to fetch price: ${error.message}`,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});
