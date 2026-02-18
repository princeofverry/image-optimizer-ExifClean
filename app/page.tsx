"use client" // Wajib ada karena kita butuh interaksi (klik tombol)

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react" // Ikon loading

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  // Fungsi saat user pilih file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  // Fungsi saat tombol diklik
  const handleUpload = async () => {
    if (!file) return alert("Pilih file dulu, ya!")

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Kirim ke API yang baru kita buat
      const response = await fetch("/api/clean", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Gagal memproses gambar")

      // Ambil hasil file bersih (Blob) dan download otomatis
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `clean_${file.name}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      alert("Berhasil! Foto bersih sudah terdownload 🚀")
    } catch (error) {
      console.error(error)
      alert("Ups, ada kesalahan saat memproses gambar.")
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
          Hapus metadata lokasi & privasi dari fotomu sebelum di-upload ke internet.
        </p>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>Format supported: JPG, PNG, WEBP</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Input 
              id="picture" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>

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