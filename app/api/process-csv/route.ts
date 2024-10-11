import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const option = formData.get('option') as string

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64Content = buffer.toString('base64')

    const apiUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}/api/process_csv`
      : 'http://localhost:3000/api/process_csv'

    const response = await fetch(apiUrl, {
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
      throw new Error(`Failed to process CSV: ${response.statusText}`)
    }

    const processedCsv = await response.text()

    const outputResponse = new NextResponse(processedCsv)
    outputResponse.headers.set('Content-Type', 'text/csv')
    outputResponse.headers.set('Content-Disposition', `attachment; filename="processed_roster_${uuidv4()}.csv"`)

    return outputResponse
  } catch (error) {
    console.error('Error processing file:', error)
    return NextResponse.json({ error: 'File processing failed', details: error.message }, { status: 500 })
  }
}