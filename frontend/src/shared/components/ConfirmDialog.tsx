import Modal from './Modal'
import Button from './Button'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmLabel?: string
  variant?: 'danger' | 'gold'
  loading?: boolean
}

export default function ConfirmDialog({
  open, onClose, onConfirm, title = 'Confirm', message,
  confirmLabel = 'Confirm', variant = 'danger', loading
}: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
      <p className="text-sm text-noir-300 font-sans leading-relaxed mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant={variant} size="sm" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}