import { useState } from 'react'
import { Button, ConfirmDialog } from '@masaar/ui'

interface ConfirmButtonProps {
  label: string
  title: string
  description: string
  loading?: boolean
  onConfirm: () => void
}

/** A destructive row action that only runs after the user confirms it. */
export function ConfirmButton({ label, title, description, loading, onConfirm }: ConfirmButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="danger-outline" size="sm" loading={loading} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <ConfirmDialog
        open={open}
        title={title}
        description={description}
        confirmLabel={label}
        cancelLabel="Keep"
        variant="danger"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false)
          onConfirm()
        }}
      />
    </>
  )
}
