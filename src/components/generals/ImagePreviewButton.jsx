import { Modal } from 'antd'
import { useState } from 'react'

const ImagePreviewButton = ({
  src,
  alt = 'image',
  previewAlt = `${alt} preview`,
  width = 56,
  height = 56,
}) => {
  const [open, setOpen] = useState(false)

  const handleClose = () => setOpen(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width,
          height,
          padding: 0,
          border: '1px solid var(--app-border-color)',
          borderRadius: 6,
          overflow: 'hidden',
          cursor: 'pointer',
          background: 'transparent',
        }}
      >
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          style={{ display: 'block', objectFit: 'cover' }}
        />
      </button>

      <Modal open={open} footer={null} centered onCancel={handleClose} afterClose={handleClose}>
        <img
          src={src}
          alt={previewAlt}
          style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
        />
      </Modal>
    </>
  )
}

export default ImagePreviewButton
