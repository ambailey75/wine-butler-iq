import Image from 'next/image'

export default function Home() {
  return (
    <main className="dark flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center font-serif text-foreground">
      <Image
        src="/wine-butler-ai-logo.png"
        alt="Wine Butler AI"
        width={160}
        height={160}
        className="mb-6"
        priority
      />

      <h1 className="mb-4 text-primary" style={{
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        fontWeight: 'bold',
        letterSpacing: '0.05em',
      }}>
        Wine Butler AI
      </h1>

      <p className="mb-10 text-muted-foreground" style={{
        fontSize: 'clamp(1rem, 2.5vw, 1.35rem)',
        maxWidth: '520px',
        lineHeight: '1.7',
        fontFamily: 'Arial, sans-serif',
      }}>
        Your personal wine inventory tracker and AI sommelier. Track your collection,
        discover drinking windows, and get expert pairing recommendations — all in one place.
      </p>

      <div className="w-full max-w-[420px] rounded-xl border border-border bg-card p-6 px-8">
        <p className="mb-2 font-sans text-[0.95rem] uppercase tracking-widest text-primary">
          Coming Soon
        </p>
        <p className="m-0 font-sans text-[0.9rem] text-muted-foreground">
          Private beta launching in 2026. Built for serious collectors.
        </p>
      </div>
    </main>
  )
}
