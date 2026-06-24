import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="dark flex min-h-screen items-center justify-center bg-background p-8 font-serif text-foreground">
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Image
            src="/wine-butler-ai-logo.png"
            alt="Wine Butler AI"
            width={120}
            height={120}
            className="mx-auto mb-4"
            priority
          />
          <h1 className="text-[1.75rem] font-bold tracking-wide text-primary">
            Wine Butler AI
          </h1>
        </div>
        {children}
      </div>
    </main>
  )
}
