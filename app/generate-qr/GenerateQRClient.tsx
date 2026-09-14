"use client"

import React, { useState } from "react"
import QRCode from "qrcode"
import JSZip from "jszip"
import { saveAs } from "file-saver"

export default function GenerateQRClient() {
  const [input, setInput] = useState("")
  const [previews, setPreviews] = useState<{
    text: string
    dataUrl: string
    filename: string
  }[]>([])
  const [loading, setLoading] = useState(false)
  const [copying, setCopying] = useState(false)

  async function handlePreview() {
    const lines = input
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
    const res: { text: string; dataUrl: string; filename: string }[] = []
    for (let i = 0; i < lines.length; i++) {
      const text = lines[i]
      try {
        const dataUrl = await generateCompositeDataUrl(text, 300)
        res.push({ text, dataUrl, filename: `qrcode-${i + 1}.png` })
      } catch (e) {
        console.error("QRCode error", e)
      }
    }
    setPreviews(res)
  }

  async function handleDownloadZip() {
    setLoading(true)
    try {
      const lines = input
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
      const zip = new JSZip()
      for (let i = 0; i < lines.length; i++) {
        const dataUrl = await generateCompositeDataUrl(lines[i], 300)
        const res = await fetch(dataUrl)
        const blob = await res.blob()
        zip.file(`qrcode-${i + 1}.png`, blob)
      }
      const content = await zip.generateAsync({ type: "blob" })
      saveAs(content, "qrcodes.zip")
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }


  async function handleCopySingle(dataUrl: string) {
    if (!navigator.clipboard || (window as any).ClipboardItem === undefined) {
      alert("Tarayıcınız görsel kopyalamayı desteklemiyor. Lütfen Chrome/MSEdge kullanın.")
      return
    }
    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const item = new (window as any).ClipboardItem({ [blob.type]: blob })
      await navigator.clipboard.write([item])
      alert("Görsel kopyalandı. Şimdi yapıştırabilirsiniz.")
    } catch (e) {
      console.error(e)
      alert("Kopyalama başarısız. Tarayıcı izinleri veya destek sorun olabilir.")
    }
  }

  async function handleCopyAll() {
    if (!navigator.clipboard || (window as any).ClipboardItem === undefined) {
      alert("Tarayıcınız çoklu görsel kopyalamayı desteklemiyor. Lütfen Chrome/MSEdge kullanın.")
      return
    }
    setCopying(true)
    try {
      const lines = input
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
      const items: any[] = []
      for (let i = 0; i < lines.length; i++) {
        const dataUrl = await generateCompositeDataUrl(lines[i], 300)
        const res = await fetch(dataUrl)
        const blob = await res.blob()
        items.push(new (window as any).ClipboardItem({ [blob.type]: blob }))
        // small delay
        await new Promise((r) => setTimeout(r, 80))
      }
      await navigator.clipboard.write(items)
      alert("Tüm görseller kopyalandı. Şimdi yapıştırabilirsiniz.")
    } catch (e) {
      console.error(e)
      alert("Çoklu kopyalama başarısız. Tarayıcı desteklemiyor veya izin vermiyor.")
    } finally {
      setCopying(false)
    }
  }

  async function handleDownloadSingle(dataUrl: string, filename: string) {
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    saveAs(blob, filename)
  }

  async function generateCompositeDataUrl(text: string, qrSize = 300) {
    // generate QR as dataURL first
    const qrDataUrl = await QRCode.toDataURL(text, { type: "image/png", width: qrSize })

    // load into Image
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = reject
      i.src = qrDataUrl
    })

    // create canvas with styled card area (rounded rect, title, divider)
    const padding = 24
    const cardPadding = 20
    const cardWidth = qrSize + cardPadding * 2
    const titleFontSize = Math.max(28, Math.floor(qrSize / 8))
    const lineGap = 8

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!

    // measure title (wrap if needed)
    ctx.font = `bold ${titleFontSize}px "Inter", sans-serif`
    const maxTextWidth = cardWidth - cardPadding * 2
    const words = text.split(" ")
    const lines: string[] = []
    let cur = ""
    for (const w of words) {
      const test = cur ? cur + " " + w : w
      const width = ctx.measureText(test).width
      if (width > maxTextWidth && cur) {
        lines.push(cur)
        cur = w
      } else {
        cur = test
      }
    }
    if (cur) lines.push(cur)

    const titleLineHeight = titleFontSize + 6
    const titleHeight = lines.length * titleLineHeight

    const cardHeight = cardPadding + titleHeight + lineGap + 8 + img.height + cardPadding
    const outerPadding = 12
    canvas.width = cardWidth + outerPadding * 2
    canvas.height = cardHeight + outerPadding * 2

    // background page
    ctx.fillStyle = "#eef1f4"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // draw rounded card
    const rx = outerPadding
    const ry = outerPadding
    const cw = cardWidth
    const ch = cardHeight
    const r = 18
    ctx.fillStyle = "#ffffff"
    roundRect(ctx, rx, ry, cw, ch, r, true, false)

    // card border
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 8
    roundRect(ctx, rx, ry, cw, ch, r, false, true)

    // draw title lines
    ctx.fillStyle = "#000"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.font = `bold ${titleFontSize}px "Inter", sans-serif`
    const centerX = rx + cw / 2
    let y = ry + cardPadding
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], centerX, y)
      y += titleLineHeight
    }

    // divider line under title
    const dividerY = y + 8
    const dividerPadding = 20
    ctx.fillStyle = "#000"
    ctx.fillRect(rx + dividerPadding, dividerY, cw - dividerPadding * 2, 6)

    // draw QR centered under divider
    const qrX = rx + (cw - img.width) / 2
    const qrY = dividerY + 12
    ctx.drawImage(img, qrX, qrY)

    return canvas.toDataURL("image/png")
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: boolean, stroke: boolean) {
    if (r > w / 2) r = w / 2
    if (r > h / 2) r = h / 2
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
    if (fill) ctx.fill()
    if (stroke) ctx.stroke()
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-2">QR Kod Üretici</h1>
      <p className="text-sm text-muted-foreground mb-4">Her satıra bir metin girin, birden fazla QR oluşturabilirsiniz.</p>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Her satıra bir metin yazın..."
        rows={8}
        className="w-full p-3 border rounded"
      />

      <div className="mt-3 flex gap-2">
        <button onClick={handlePreview} className="px-4 py-2 bg-gray-800 text-white rounded">Önizle</button>
        <button onClick={handleDownloadZip} disabled={loading || !input.trim()} className="px-4 py-2 bg-blue-600 text-white rounded">
          {loading ? "Oluşturuluyor..." : "Tümünü ZIP İndir"}
        </button>
        <button onClick={handleCopyAll} disabled={copying || !input.trim()} className="px-4 py-2 bg-yellow-500 text-white rounded">
          {copying ? "Kopyalanıyor..." : "Tümünü Kopyala"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {previews.map((p) => (
          <div key={p.filename} className="border p-2 rounded">
            <div className="text-sm font-medium mb-2 truncate">{p.text}</div>
            <img src={p.dataUrl} alt={p.text} className="w-full h-auto" />
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs truncate">{p.filename}</span>
              <div className="flex gap-2">
                <button onClick={() => handleCopySingle(p.dataUrl)} className="text-sm text-green-600">Kopyala</button>
                <button onClick={() => handleDownloadSingle(p.dataUrl, p.filename)} className="text-sm text-blue-600">PNG</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
