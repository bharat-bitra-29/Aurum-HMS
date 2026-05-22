export default function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className="rounded-full border-2 border-white/10 border-t-gold-400 animate-spin"
        style={{ width: size, height: size }}
      />
    </div>
  )
}