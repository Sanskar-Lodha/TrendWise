
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Simulated trending topics (in a real implementation, you would use Google Trends API and Twitter API)
    const mockTrendingTopics = [
      { topic: 'Artificial Intelligence in Healthcare', source: 'google_trends', search_volume: 15000, region: 'US' },
      { topic: 'Sustainable Energy Solutions', source: 'google_trends', search_volume: 12000, region: 'Global' },
      { topic: 'Remote Work Productivity', source: 'twitter', search_volume: 8500, region: 'US' },
      { topic: 'Cryptocurrency Market Trends', source: 'twitter', search_volume: 20000, region: 'Global' },
      { topic: 'Climate Change Innovation', source: 'google_trends', search_volume: 11000, region: 'EU' },
      { topic: 'Mental Health Awareness', source: 'twitter', search_volume: 9500, region: 'US' },
      { topic: 'Electric Vehicle Adoption', source: 'google_trends', search_volume: 13500, region: 'Global' },
      { topic: 'Social Media Privacy', source: 'twitter', search_volume: 7200, region: 'US' }
    ]

    // Insert trending topics into database
    const insertPromises = mockTrendingTopics.map(async (topicData) => {
      const { error } = await supabaseClient
        .from('trending_topics')
        .upsert([
          {
            topic: topicData.topic,
            source: topicData.source,
            search_volume: topicData.search_volume,
            region: topicData.region,
            used_for_article: false
          }
        ], { 
          onConflict: 'topic,source',
          ignoreDuplicates: false 
        })

      if (error) {
        console.error('Error inserting topic:', topicData.topic, error)
      }
      return { topic: topicData.topic, success: !error }
    })

    const results = await Promise.all(insertPromises)
    const successCount = results.filter(r => r.success).length

    // Get unused trending topics for article generation
    const { data: unusedTopics, error: fetchError } = await supabaseClient
      .from('trending_topics')
      .select('*')
      .eq('used_for_article', false)
      .order('search_volume', { ascending: false })
      .limit(5)

    if (fetchError) {
      console.error('Error fetching unused topics:', fetchError)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Fetched ${successCount} trending topics`,
        availableTopics: unusedTopics?.length || 0,
        topicsForGeneration: unusedTopics || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in fetch-trending-topics function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch trending topics', 
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
