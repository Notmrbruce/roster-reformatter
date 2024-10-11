import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { writeFile, unlink, readFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const option = formData.get('option') as string

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const tempFilePath = join('/tmp', `${uuidv4()}.csv`)
  const outputFilePath = join('/tmp', `${uuidv4()}_output.csv`)

  try {
    await writeFile(tempFilePath, buffer)

    let scriptPath: string
    switch (option) {
      case 'daysOff':
        scriptPath = './scripts/csv_reformat_offonly.py'
        break
      case 'workDays':
        scriptPath = './scripts/csv_reformat_work_only.py'
        break
      default:
        scriptPath = './scripts/csv_reformat_full.py'
    }

    await new Promise((resolve, reject) => {
      exec(`python ${scriptPath} ${tempFilePath} ${outputFilePath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`)
          return reject(error)
        }
        console.log(`stdout: ${stdout}`)
        console.error(`stderr: ${stderr}`)
        resolve(null)
      })
    })

    const fileContent = await readFile(outputFilePath)
    const response = new NextResponse(fileContent)
    response.headers.set('Content-Type', 'text/csv')
    response.headers.set('Content-Disposition', 'attachment; filename="processed_roster.csv"')

    await unlink(tempFilePath)
    await unlink(outputFilePath)

    return response
  } catch (error) {
    console.error('Error processing file:', error)
    return NextResponse.json({ error: 'File processing failed' }, { status: 500 })
  }
}