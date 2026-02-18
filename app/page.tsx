"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, X, UploadCloud } from "lucide-react" // Tambah ikon UploadCloud

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false) // State untuk deteksi drag

  // Fungsi proses file (dipakai baik dari klik maupun drop)
  const processFile = (selectedFile: File) => {
    if (selectedFile) {
      setFile(selectedFile)
      const objectUrl = URL.createObjectURL(selectedFile)
      setPreview(objectUrl)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) processFile(selectedFile)
  }

  // --- LOGIKA DRAG & DROP ---
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles && droppedFiles[0]) {
      // Pastikan yang di-drop adalah gambar
      if (droppedFiles[0].type.startsWith("image/")) {
        processFile(droppedFiles[0])
      } else {
        alert("Mohon drop file gambar saja ya! (JPG, PNG, WEBP)")
      }
    }
  }, [])
  // --------------------------

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    const input = document.getElementById("picture") as HTMLInputElement
    if (input) input.value = ""
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/clean", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Gagal memproses gambar")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `clean_${file.name}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      alert("Berhasil! Foto bersih sudah terdownload 🚀")
      clearFile()
    } catch (error) {
      console.error(error)
      alert("Gagal memproses gambar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Exif<span className="text-blue-600">Clean</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Hapus metadata lokasi & privasi dari fotomu.
        </p>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>Drag & drop atau klik untuk pilih file</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {preview ? (
            <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg border bg-gray-100 shadow-sm">
              <img 
                src={preview} 
                alt="Preview" 
                className="h-full w-full object-contain" 
              />
              <button 
                onClick={clearFile}
                className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 transition-colors"
                title="Hapus gambar"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            // AREA DRAG & DROP
            <div 
              className={`
                relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed 
                p-8 text-center transition-colors
                ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-50"}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="mb-4 rounded-full bg-blue-100 p-3 text-blue-600">
                <UploadCloud size={24} />
              </div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                Drag & drop fotomu di sini
              </p>
              <p className="mb-4 text-xs text-gray-500">
                Atau klik tombol di bawah ini
              </p>
              
              {/* Input file kita sembunyikan tapi tetap berfungsi lewat label/tombol */}
              <Input 
                id="picture" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
              <label 
                htmlFor="picture"
                className="cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Pilih File
              </label>
            </div>
          )}

          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleUpload}
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Clean Metadata & Download"
            )}
          </Button>

        </CardContent>
      </Card>
      
      <p className="mt-8 text-sm text-gray-400">
        Aman. Proses dilakukan di browser/server sementara.
      </p>
    </main>
  )
}