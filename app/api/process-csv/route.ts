import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const option = formData.get('option') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const base64Content = Buffer.from(buffer).toString('base64')

    // Construct the URL for the Python function
    const functionUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}/api/process_csv`
      : 'http://localhost:3000/api/process_csv'

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: base64Content,
        option: option,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error from Python function:', errorData)
      throw new Error(`Failed to process CSV: ${errorData.error}`)
    }

    const processedCsv = await response.text()

    const outputResponse = new NextResponse(processedCsv)
    outputResponse.headers.set('Content-Type', 'text/csv')
    outputResponse.headers.set('Content-Disposition', `attachment; filename="processed_roster_${uuidv4()}.csv"`)

    return outputResponse
  } catch (error: unknown) {
    console.error('Error processing file:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: 'File processing failed', details: error.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: 'File processing failed', details: 'An unknown error occurred' }, { status: 500 })
    }
  }
}