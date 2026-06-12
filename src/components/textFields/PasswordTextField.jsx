import { isPasswordStrong, maxLen } from '@/utils/validateUtil'
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { forwardRef, useState } from 'react'
import ValidationTextField from './ValidationTextField'

/**
 * @typedef {Object} CustomProps
 * @property {string} label
 * @property {string} name
 * @property {string} value
 * @property {function} onChange
 */

/**
 * @param {import('antd').InputProps & CustomProps} props
 * @param {React.Ref} ref
 */
const PasswordTextField = ({ label, name, value, onChange, validate, ...props }, ref) => {
	const [showPassword, setShowPassword] = useState(false)

	return (
		<ValidationTextField
			ref={ref}
			label={label}
			type={showPassword ? 'text' : 'password'}
			name={name}
			value={value}
			onChange={onChange}
			validate={validate ?? [maxLen(50), isPasswordStrong()]}
			suffix={
				<Button
					type='text'
					icon={showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
					onClick={() => setShowPassword(!showPassword)}
					style={{ border: 'none', color: 'inherit' }}
				/>
			}
			{...props}
		/>
	)
}

export default forwardRef(PasswordTextField)
