import GenerateQRClient from "./GenerateQRClient"

export const metadata = {
  title: "Generate QR"
}

export default function Page() {
  return (
    <main className="p-6">
      <GenerateQRClient />
    </main>
  )
}
