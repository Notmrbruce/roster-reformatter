'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Roboto } from 'next/font/google'
import { Loader2, Upload, Download, Info, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'

const roboto = Roboto({ subsets: ['latin'], weight: ['400', '700'] })

export default function RosterReformatter() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processingOption, setProcessingOption] = useState('full')
  const [showInstructions, setShowInstructions] = useState(false)

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0])
    setError(null)
    setResult(null)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  })

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first.')
      return
    }

    setProcessing(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('option', processingOption)

    try {
      const response = await fetch('/api/process-csv', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('File processing failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      setResult(url)
    } catch (err) {
      setError('An error occurred while processing the file. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions)
  }

  return (
    <div className={`min-h-screen bg-gray-900 text-gray-100 ${roboto.className}`}>
      <header className="bg-gray-800 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Roster Reformatter</h1>
          <p className="mt-2 text-gray-400">Easily process and reformat your CSV roster files</p>
        </div>
      </header>

      <main className="container mx-auto px-2 sm:px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-500 bg-opacity-10' : ''
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <p>{file.name}</p>
            ) : isDragActive ? (
              <p>Drop the file here...</p>
            ) : (
              <div>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">Drag & drop a CSV file here, or click to select one</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Processing Options</h2>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="full"
                  checked={processingOption === 'full'}
                  onChange={(e) => setProcessingOption(e.target.value)}
                  className="mr-2"
                />
                Full Roster
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="daysOff"
                  checked={processingOption === 'daysOff'}
                  onChange={(e) => setProcessingOption(e.target.value)}
                  className="mr-2"
                />
                Days Off Only
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="workDays"
                  checked={processingOption === 'workDays'}
                  onChange={(e) => setProcessingOption(e.target.value)}
                  className="mr-2"
                />
                Work Days Only
              </label>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              <Info className="inline-block mr-1 h-4 w-4" />
              Select the type of roster you want to generate
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!file || processing}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full"
          >
            {processing ? (
              <Loader2 className="animate-spin mx-auto h-5 w-5" />
            ) : (
              'Process File'
            )}
          </button>

          {error && (
            <div className="mt-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-4">
              <a
                href={result}
                download="processed_roster.csv"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center transition-colors"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Processed File
              </a>
            </div>
          )}
        </div>

        {/* Image Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Example Calendars</h2>
          
          {/* Instructions toggle button for small screens */}
          <button
            onClick={toggleInstructions}
            className="md:hidden w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mb-4 flex items-center justify-center"
          >
            {showInstructions ? (
              <>
                <ChevronUp className="mr-2 h-5 w-5" />
                Hide Instructions
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-5 w-5" />
                Show Instructions
              </>
            )}
          </button>

          {/* Instructions for small screens */}
          {showInstructions && (
            <div className="md:hidden bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold mb-2">How to Use the Roster Reformatter</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Upload your CSV roster file using the drag-and-drop area or file selector.</li>
                <li>Choose the processing option that fits your needs (Full Roster, Days Off Only, or Work Days Only).</li>
                <li>Click the "Process File" button to reformat your roster.</li>
                <li>Download the processed file and import it into your preferred calendar application.</li>
              </ol>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/calendarexample-LwiMKNLwzM6QGSDQ7b6mZvlOktfhyP.jpg"
                alt="Full roster calendar"
                width={200}
                height={400}
                className="rounded-lg shadow-lg w-full h-auto"
              />
              <p className="mt-2 text-center italic text-sm">Full roster*</p>
            </div>

            {/* Instructions for larger screens */}
            <div className="hidden md:flex flex-col justify-center bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">How to Use the Roster Reformatter</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Upload your CSV roster file using the drag-and-drop area or file selector.</li>
                <li>Choose the processing option that fits your needs (Full Roster, Days Off Only, or Work Days Only).</li>
                <li>Click the "Process File" button to reformat your roster.</li>
                <li>Download the processed file and import it into your preferred calendar application.</li>
              </ol>
            </div>

            <div className="flex flex-col items-center">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/calendarexample1-LhfzmFkpTMyoHMy8fk7en0fQp4rAO6.jpg"
                alt="Separate Days off & Work only calendars"
                width={200}
                height={400}
                className="rounded-lg shadow-lg w-full h-auto"
              />
              <p className="mt-2 text-center italic text-sm">Separate Days off & Work only calendars*</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/calendarexample2-j7oTYpGLb47OVjXHaMOGoNpYUYJqQP.jpg"
              alt="Example of non-iOS calendar"
              width={400}
              height={200}
              className="rounded-lg shadow-lg w-full h-auto max-w-[600px]"
            />
            <p className="mt-2 text-center italic text-sm">Example of non-iOS calendar*</p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2024 Roster Reformatter. All rights reserved.</p>
          <div className="mt-2">
            <a href="#" className="hover:text-white mr-4">Privacy Policy</a>
            <a href="#" className="hover:text-white mr-4">Terms of Service</a>
            <a href="#" className="hover:text-white">How It Works</a>
          </div>
        </div>
      </footer>
    </div>
  )
}