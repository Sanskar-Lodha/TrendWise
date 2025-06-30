
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
    const { topic, source } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate article content using OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert SEO content writer for TrendWise, a trending topics blog. Create comprehensive, engaging articles about trending topics. 
            
            Format your response as JSON with these fields:
            - title: SEO-optimized title (60 chars max)
            - slug: URL-friendly slug
            - excerpt: Brief summary (160 chars max)
            - content: Full article content in HTML format with proper headings, paragraphs, and structure
            - meta_description: SEO meta description (160 chars max)
            - tags: Array of 3-5 relevant tags
            - read_time: Estimated read time (e.g., "5 min read")
            
            Make the content informative, engaging, and SEO-friendly. Include proper HTML structure with h2, h3, p, ul, li tags.`
          },
          {
            role: 'user',
            content: `Write a comprehensive article about this trending topic: "${topic}" from source: ${source}. Make it informative and engaging for readers interested in current trends.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`)
    }

    const openAIData = await openAIResponse.json()
    const generatedContent = openAIData.choices[0].message.content

    let articleData
    try {
      articleData = JSON.parse(generatedContent)
    } catch (parseError) {
      // Fallback if JSON parsing fails
      articleData = {
        title: `${topic}: Current Trends and Insights`,
        slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        excerpt: `Explore the latest insights and trends about ${topic}.`,
        content: `<h2>About ${topic}</h2><p>${generatedContent}</p>`,
        meta_description: `Latest trends and insights about ${topic}.`,
        tags: [topic.split(' ')[0] || 'trending', 'news', 'insights'],
        read_time: '5 min read'
      }
    }

    // Generate a random image URL (placeholder)
    const imageUrl = `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000000)}?auto=format&fit=crop&w=800&q=80`

    // Insert article into database
    const { data: article, error: insertError } = await supabaseClient
      .from('articles')
      .insert([
        {
          title: articleData.title,
          slug: articleData.slug,
          excerpt: articleData.excerpt,
          content: articleData.content,
          meta_description: articleData.meta_description,
          author: 'TrendWise AI',
          tags: articleData.tags,
          image_url: imageUrl,
          trending: Math.random() > 0.5, // Random trending status
          read_time: articleData.read_time
        }
      ])
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      throw insertError
    }

    // Mark the trending topic as used
    await supabaseClient
      .from('trending_topics')
      .update({ used_for_article: true })
      .eq('topic', topic)
      .eq('source', source)

    return new Response(
      JSON.stringify({ 
        success: true, 
        article: article,
        message: 'Article generated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-article function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate article', 
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
