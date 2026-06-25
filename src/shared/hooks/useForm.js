import { useCallback, useRef, useState } from 'react'

const defaultInitialValues = {}

export default function useForm(initialValues = defaultInitialValues) {
	const [values, setValues] = useState(initialValues)

	const fieldsRef = useRef(new Map())

	const handleChange = useCallback((e) => {
		const { name, value } = e.target
		const keys = name.split('.')

		setValues((prev) => {
			const newValues = { ...prev }
			let nested = newValues

			for (let i = 0; i < keys.length - 1; i++) {
				const key = keys[i]
				if (Array.isArray(nested[key])) {
					nested[key] = [...nested[key]]
				} else {
					nested[key] = { ...nested[key] }
				}
				nested = nested[key]
			}

			nested[keys[keys.length - 1]] = value
			return newValues
		})
	}, [])

	const setField = useCallback((name, value) => {
		const keys = name.split('.')

		setValues((prev) => {
			const newValues = { ...prev }
			let nested = newValues

			for (let i = 0; i < keys.length - 1; i++) {
				const key = keys[i]

				if (Array.isArray(nested[key])) {
					nested[key] = [...nested[key]]
				} else {
					nested[key] = { ...(nested[key] ?? {}) }
				}

				nested = nested[key]
			}

			nested[keys[keys.length - 1]] = value
			return newValues
		})
	}, [])

	const reset = useCallback(
		(next = initialValues) => {
			setValues(next)
		},
		[initialValues]
	)

	const registerRef = useCallback(
		(name) => (el) => {
			if (!fieldsRef.current) fieldsRef.current = new Map()
			if (el) fieldsRef.current.set(name, el)
			else fieldsRef.current.delete(name)
		},
		[]
	)

	const validateAll = useCallback(() => {
		let ok = true
		for (const [, field] of fieldsRef.current) {
			if (field && typeof field.validate === 'function' && !field.validate()) ok = false
		}
		return ok
	}, [])

	const resetValidation = useCallback(() => {
		for (const [, field] of fieldsRef.current) {
			field?.resetValidation?.()
		}
	}, [])

	return {
		values,
		handleChange,
		setField,
		reset,

		fieldsRef,
		registerRef,
		validateAll,
		resetValidation,
	}
}

// Example usage:
// const formUser = useForm({ username: '', email: '' })
// formUser.handleChange()
// formUser.setField('username', 'toiTenLaDuyLP')
// formUser.setField('email', 'DuyLPCE181153@google.com')
// formUser.reset()
// formUser.reset({ username: 'DuyLP', email: 'DuyLPCE181153@fpt.edu.vn' })
// formUser.registerRef('username')
// formUser.validateAll()
