import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'
import { Button, Space, Tooltip, Typography } from 'antd'
import { useState } from 'react'

const MaskedNric = ({ value, code = false }) => {
  const [visible, setVisible] = useState(false)
  const text = value == null || value === '' ? '-' : String(value)
  const masked = text === '-' ? text : '*'.repeat(text.length)

  return (
    <Space size={4}>
      <Typography.Text code={code}>{visible ? text : masked}</Typography.Text>
      {text !== '-' && (
        <Tooltip title={visible ? 'Hide NRIC' : 'Show NRIC'}>
          <Button
            type="text"
            size="small"
            aria-label={visible ? 'Hide NRIC' : 'Show NRIC'}
            icon={visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            onClick={() => setVisible((current) => !current)}
          />
        </Tooltip>
      )}
    </Space>
  )
}

export default MaskedNric
