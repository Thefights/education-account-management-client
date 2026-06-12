import { ArrowRightOutlined } from '@ant-design/icons'
import { Col, Row } from 'antd'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import ValidationTextField from './ValidationTextField'

/**
 * A date range field using native date inputs.
 *
 * @param {Object} props
 * @param {string} props.fromDate - ISO date string (yyyy-MM-dd)
 * @param {string} props.toDate - ISO date string (yyyy-MM-dd)
 * @param {(fromDate: string, toDate: string) => void} props.onChange
 * @param {string} [props.fromLabel='From']
 * @param {string} [props.toLabel='To']
 * @param {string} [props.minDate] - Minimum selectable date (yyyy-MM-dd).
 * @param {string} [props.maxDate] - Maximum selectable date (yyyy-MM-dd).
 * @param {((value: string) => string | true) | ((value: string) => string | true)[]} [props.fromValidate] - Validation for the "from" field.
 * @param {((value: string) => string | true) | ((value: string) => string | true)[]} [props.toValidate] - Validation for the "to" field.
 */

const DateRangeField = (
	{
		fromDate = '',
		toDate = '',
		onChange,
		fromLabel = 'From',
		toLabel = 'To',
		minDate,
		maxDate,
		fromValidate,
		toValidate,
		...props
	},
	ref
) => {
	const fromRef = useRef()
	const toRef = useRef()

	const normalizeRange = (nextFromDate, nextToDate) => {
		if (nextFromDate && nextToDate && nextFromDate > nextToDate) {
			return {
				fromDate: nextToDate,
				toDate: nextFromDate,
			}
		}

		return {
			fromDate: nextFromDate,
			toDate: nextToDate,
		}
	}

	useImperativeHandle(ref, () => ({
		validate: () => {
			const a = fromRef.current?.validate() ?? true
			const b = toRef.current?.validate() ?? true
			return a && b
		},
		resetValidation: () => {
			fromRef.current?.resetValidation?.()
			toRef.current?.resetValidation?.()
		},
	}))

	return (
		<Row gutter={12} align='middle'>
			<Col flex={1}>
				<ValidationTextField
					ref={fromRef}
					type='date'
					label={fromLabel}
					value={fromDate || ''}
					onChange={(e) => {
						const normalizedRange = normalizeRange(e.target.value, toDate)
						onChange?.(normalizedRange.fromDate, normalizedRange.toDate)
					}}
					validate={fromValidate}
					min={minDate}
					max={toDate || maxDate}
					{...props}
				/>
			</Col>
			<Col style={{ marginBottom: 24 }}>
				<ArrowRightOutlined style={{ color: '#666' }} />
			</Col>
			<Col flex={1}>
				<ValidationTextField
					ref={toRef}
					type='date'
					label={toLabel}
					value={toDate || ''}
					onChange={(e) => {
						const normalizedRange = normalizeRange(fromDate, e.target.value)
						onChange?.(normalizedRange.fromDate, normalizedRange.toDate)
					}}
					validate={toValidate}
					min={fromDate || minDate}
					max={maxDate}
					{...props}
				/>
			</Col>
		</Row>
	)
}

export default forwardRef(DateRangeField)
