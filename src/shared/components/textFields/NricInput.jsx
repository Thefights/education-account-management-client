import { Input } from 'antd'

const NricInput = ({ value, onChange, ...props }) => (
  <Input.Password
    placeholder="e.g. S1234567D"
    {...props}
    value={value}
    maxLength={9}
    autoComplete="off"
    onChange={(event) => onChange?.(event.target.value)}
  />
)

export default NricInput
