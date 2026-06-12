import { ArrowRightOutlined } from '@ant-design/icons'
import { Col, Row, Space } from 'antd'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import ValidationTextField from './ValidationTextField'

/**
 * A time range field with native date/time inputs.
 *
 * @param {Object} props
 * @param {string} props.date - ISO date string (yyyy-MM-dd)
 * @param {string} props.fromTime - Time string (HH:mm)
 * @param {string} props.toTime - Time string (HH:mm)
 * @param {(date: string, fromTime: string, toTime: string) => void} props.onChange
 * @param {string} [props.dateLabel='Date']
 * @param {string} [props.fromLabel='From']
 * @param {string} [props.toLabel='To']
 * @param {string} [props.minDate] - Minimum selectable date (yyyy-MM-dd).
 * @param {string} [props.maxDate] - Maximum selectable date (yyyy-MM-dd).
 * @param {string} [props.minTime] - Minimum selectable time (HH:mm).
 * @param {string} [props.maxTime] - Maximum selectable time (HH:mm).
 * @param {boolean} [props.showDate=false] - Whether to show the date input.
 * @param {((value: string) => string | true) | ((value: string) => string | true)[]} [props.fromValidate] - Validation for the "from" field.
 * @param {((value: string) => string | true) | ((value: string) => string | true)[]} [props.toValidate] - Validation for the "to" field.
 * @param {((value: string) => string | true) | ((value: string) => string | true)[]} [props.dateValidate] - Validation for the "date" field.
 */

const TimeRangeField = (
	{
		date = '',
		fromTime = '',
		toTime = '',
		onChange,
		dateLabel = 'Date',
		fromLabel = 'From',
		toLabel = 'To',
		minDate,
		maxDate,
		minTime,
		maxTime,
		showDate = false,
		fromValidate,
		toValidate,
		dateValidate,
		...props
	},
	ref
) => {
	const dateRef = useRef()
	const fromRef = useRef()
	const toRef = useRef()

	useImperativeHandle(ref, () => ({
		validate: () => {
			const a = showDate ? (dateRef.current?.validate() ?? true) : true
			const b = fromRef.current?.validate() ?? true
			const c = toRef.current?.validate() ?? true
			return a && b && c
		},
		resetValidation: () => {
			dateRef.current?.resetValidation?.()
			fromRef.current?.resetValidation?.()
			toRef.current?.resetValidation?.()
		},
	}))

	return (
		<Space orientation='vertical' style={{ width: '100%' }}>
			{showDate && (
				<ValidationTextField
					ref={dateRef}
					type='date'
					label={dateLabel}
					value={date || ''}
					onChange={(e) => onChange?.(e.target.value, fromTime, toTime)}
					validate={dateValidate}
					min={minDate}
					max={maxDate}
					{...props}
				/>
			)}
			<Row gutter={12} align='middle'>
				<Col flex={1}>
					<ValidationTextField
						ref={fromRef}
						type='time'
						label={fromLabel}
						value={fromTime || ''}
						onChange={(e) => onChange?.(date, e.target.value, toTime)}
						validate={fromValidate}
						min={minTime}
						max={toTime || maxTime}
						{...props}
					/>
				</Col>
				<Col style={{ marginBottom: 24 }}>
					<ArrowRightOutlined style={{ color: '#666' }} />
				</Col>
				<Col flex={1}>
					<ValidationTextField
						ref={toRef}
						type='time'
						label={toLabel}
						value={toTime || ''}
						onChange={(e) => onChange?.(date, fromTime, e.target.value)}
						validate={toValidate}
						min={fromTime || minTime}
						max={maxTime}
						{...props}
					/>
				</Col>
			</Row>
		</Space>
	)
}

export default forwardRef(TimeRangeField)
