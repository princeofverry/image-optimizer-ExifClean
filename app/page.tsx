"use client"

import { useState, useCallback } from "react"
import exifr from "exifr" 
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, UploadCloud, ShieldAlert, CheckCircle, Trash2 } from "lucide-react" // Ganti ikon X jadi Trash2 biar lebih jelas

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [metadata, setMetadata] = useState<any>(null)

  const scanMetadata = async (file: File) => {
    try {
      const output = await exifr.parse(file, { tiff: true, exif: true, gps: true })
      setMetadata(output)
    } catch (error) {
      console.error("Gagal baca metadata", error)
      setMetadata(null)
    }
  }

  const processFile = (selectedFile: File) => {
    if (selectedFile) {
      setFile(selectedFile)
      const objectUrl = URL.createObjectURL(selectedFile)
      setPreview(objectUrl)
      scanMetadata(selectedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) processFile(selectedFile)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false)
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles?.[0]?.type.startsWith("image/")) {
      processFile(droppedFiles[0])
    } else {
      alert("Mohon drop file gambar saja ya!")
    }
  }, [])

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    setMetadata(null)
    const input = document.getElementById("picture") as HTMLInputElement
    if (input) input.value = ""
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/clean", { method: "POST", body: formData })
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 transition-colors">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Exif<span className="text-blue-600">Clean</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Hapus metadata lokasi & privasi dari fotomu.
        </p>
      </div>

      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>Drag & drop atau klik untuk pilih file</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {preview ? (
            <div className="space-y-4">
              {/* Preview Gambar */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-gray-100 shadow-inner">
                <img src={preview} alt="Preview" className="h-full w-full object-contain" />
              </div>

              {/* Laporan Metadata */}
              <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-center gap-2 mb-2 text-yellow-800 font-semibold">
                  <ShieldAlert size={18} />
                  <span>Privacy Check</span>
                </div>
                
                {metadata ? (
                  <ul className="text-sm space-y-1 text-gray-700">
                    {metadata.Make || metadata.Model ? (
                      <li className="flex justify-between border-b border-yellow-200 pb-1">
                        <span>Device:</span> <span className="font-medium">{metadata.Make} {metadata.Model}</span>
                      </li>
                    ) : null}
                    {metadata.latitude ? (
                      <li className="flex justify-between border-b border-yellow-200 pb-1 text-red-600 font-bold">
                        <span>⚠️ GPS:</span> <span>Detected!</span>
                      </li>
                    ) : (
                      <li className="flex justify-between text-green-600">
                        <span>GPS:</span> <span>Safe (Not Found)</span>
                      </li>
                    )}
                  </ul>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={16} />
                    <span className="text-sm">Tidak ada metadata berbahaya ditemukan.</span>
                  </div>
                )}
              </div>

              {/* DUA TOMBOL AKSI */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={clearFile}
                  disabled={loading}
                >
                  <Trash2 size={16} className="mr-2" />
                  Ganti Foto
                </Button>

                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700" 
                  onClick={handleUpload} 
                  disabled={loading}
                >
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> ...</> : "Clean & Save"}
                </Button>
              </div>

            </div>
          ) : (
            // Upload Zone
            <div 
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${isDragging ? "border-blue-500 bg-blue-50 scale-105" : "border-gray-300 hover:bg-gray-50 hover:border-blue-400"}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="mb-4 rounded-full bg-blue-100 p-3 text-blue-600">
                <UploadCloud size={24} />
              </div>
              <p className="mb-1 text-sm font-medium text-gray-700">Drag & drop fotomu di sini</p>
              <Input id="picture" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <label htmlFor="picture" className="cursor-pointer text-xs text-blue-600 hover:underline">
                Atau klik untuk browse file
              </label>
            </div>
          )}
        </CardContent>
      </Card>
      
      <p className="mt-8 text-xs text-gray-400">Project by Daffa & Team. 2026.</p>
    </main>
  )
}