
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

    // Call Yahoo Finance API with better headers
    const response = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${upperTicker}`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'cross-site'
        }
      }
    );

    if (!response.ok) {
      console.error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
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
