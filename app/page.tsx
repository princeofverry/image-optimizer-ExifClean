"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, X } from "lucide-react" // Tambah ikon X untuk hapus preview

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null) // State untuk URL gambar
  const [loading, setLoading] = useState(false)

  // Fungsi saat user pilih file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Buat URL sementara agar gambar bisa muncul
      const objectUrl = URL.createObjectURL(selectedFile)
      setPreview(objectUrl)
    }
  }

  // Fungsi untuk reset/hapus gambar yang dipilih
  const clearFile = () => {
    setFile(null)
    setPreview(null)
    // Reset input file (trik biar bisa pilih file yang sama lagi kalau mau)
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
      clearFile() // Reset setelah download
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
          <CardDescription>Format supported: JPG, PNG, WEBP</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* AREA PREVIEW GAMBAR */}
          {preview ? (
            <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg border bg-gray-100">
              <img 
                src={preview} 
                alt="Preview" 
                className="h-full w-full object-contain" 
              />
              {/* Tombol X Kecil di pojok kanan atas preview */}
              <button 
                onClick={clearFile}
                className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                title="Hapus gambar"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            // Kalau belum ada gambar, tampilkan input file biasa
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input 
                id="picture" 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
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