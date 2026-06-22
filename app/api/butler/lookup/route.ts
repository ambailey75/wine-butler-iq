import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getCurrentUser } from '@/lib/auth/current-user'
import { anthropic, CLAUDE_MODEL } from '@/lib/ai/client'
import type { ButlerResult } from '@/lib/butler/types'

const WINE_EVALUATION_TOOL = {
  name: 'wine_evaluation' as const,
  description: 'Return structured wine evaluation data',
  input_schema: {
    type: 'object' as const,
    properties: {
      producer: { type: 'string', description: 'Wine producer/winery name' },
      wineName: { type: 'string', description: 'Specific wine name or cuvee' },
      vintage: { type: ['integer', 'null'], description: 'Vintage year or null if NV/unknown' },
      region: { type: ['string', 'null'], description: 'Wine region (e.g. Napa Valley, Barossa Valley)' },
      varietal: { type: ['string', 'null'], description: 'Primary grape variety or blend name' },
      estimatedCriticScoreMin: { type: ['integer', 'null'], description: 'Low end of estimated critic score range (0-100)' },
      estimatedCriticScoreMax: { type: ['integer', 'null'], description: 'High end of estimated critic score range (0-100)' },
      estimatedRetailPriceMin: { type: ['number', 'null'], description: 'Low end of estimated retail price in USD' },
      estimatedRetailPriceMax: { type: ['number', 'null'], description: 'High end of estimated retail price in USD' },
      drinkWindowStart: { type: ['integer', 'null'], description: 'Earliest recommended drinking year' },
      drinkWindowEnd: { type: ['integer', 'null'], description: 'Latest recommended drinking year' },
      briefDescription: { type: 'string', description: 'Brief description of the wine style and characteristics (2-3 sentences)' },
    },
    required: ['producer', 'wineName', 'briefDescription'],
  },
}

const SYSTEM_PROMPT = `You are a knowledgeable wine expert. Identify the wine described by the user and provide your best estimates for critic scores, retail pricing, and drink windows. Be honest about uncertainty -- provide ranges rather than exact numbers. If you cannot identify a specific wine, do your best based on the producer and region. Always call the wine_evaluation tool with your assessment.`

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const contentType = request.headers.get('content-type') || ''

  let userContent: Anthropic.Messages.ContentBlockParam[]

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    const image = formData.get('image') as File | null
    const query = formData.get('query') as string | null
    const menuPrice = formData.get('menuPrice') as string | null

    if (!image && !query) {
      return NextResponse.json({ error: 'Provide an image or search query' }, { status: 400 })
    }

    userContent = []

    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer())
      const base64 = buffer.toString('base64')
      const mediaType = image.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
      userContent.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: base64 },
      })
      userContent.push({
        type: 'text',
        text: `Identify this wine from the image${query ? `. Additional context: ${query}` : ''}.${menuPrice ? ` The menu price is $${menuPrice}.` : ''}`,
      })
    } else {
      userContent.push({
        type: 'text',
        text: `${query}${menuPrice ? ` The menu price is $${menuPrice}.` : ''}`,
      })
    }
  } else {
    const body = await request.json()
    const { query, menuPrice } = body as { query: string; menuPrice?: number }

    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    userContent = [
      {
        type: 'text',
        text: `Identify and evaluate this wine: ${query}${menuPrice ? `. The menu price is $${menuPrice}.` : ''}`,
      },
    ]
  }

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      tools: [WINE_EVALUATION_TOOL],
      tool_choice: { type: 'tool', name: 'wine_evaluation' },
      messages: [{ role: 'user', content: userContent }],
    })

    const toolBlock = response.content.find((block) => block.type === 'tool_use')
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      return NextResponse.json({ error: 'Failed to evaluate wine' }, { status: 500 })
    }

    const result = toolBlock.input as ButlerResult
    return NextResponse.json(result)
  } catch (err) {
    console.error('Butler lookup error:', err)
    return NextResponse.json({ error: 'Failed to evaluate wine' }, { status: 500 })
  }
}
