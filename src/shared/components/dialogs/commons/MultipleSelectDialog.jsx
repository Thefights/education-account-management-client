import SearchBar from '@/shared/components/generals/SearchBar'
import useTranslation from '@/shared/hooks/useTranslation'
import { Button, Checkbox, Modal, Space } from 'antd'
import { useMemo, useState } from 'react'

const MultipleSelectDialog = ({
	open = false,
	onClose,
	options = [],
	value = [],
	onChange,
	renderOption,
	title = '',
}) => {
	const { t } = useTranslation()
	const [searchTerm, setSearchTerm] = useState('')
	const initialValues = Array.isArray(value) ? value : []
	const [draft, setDraft] = useState({ sourceValue: value, selectedValues: initialValues })
	const selectedValues = Object.is(draft.sourceValue, value) ? draft.selectedValues : initialValues

	const selectedSet = useMemo(() => new Set(selectedValues.map((v) => String(v))), [selectedValues])

	const unselectedOptions = useMemo(() => {
		return (options || []).filter((opt) => !selectedSet.has(String(opt.value)))
	}, [options, selectedSet])

	const selectedOptions = useMemo(() => {
		return (options || []).filter((opt) => selectedSet.has(String(opt.value)))
	}, [options, selectedSet])

	const filteredUnselectedOptions = useMemo(() => {
		if (!searchTerm.trim()) return unselectedOptions

		const lowerSearch = searchTerm.toLowerCase()
		return unselectedOptions.filter((opt) => {
			const label = String(opt.searchKey || opt.label || '').toLowerCase()
			return label.includes(lowerSearch)
		})
	}, [unselectedOptions, searchTerm])

	const disabledValueSet = useMemo(
		() =>
			new Set(
				(options || []).filter((opt) => opt.disabled).map((opt) => String(opt.value))
			),
		[options]
	)

	const selectableUnselectedOptions = useMemo(
		() => filteredUnselectedOptions.filter((opt) => !opt.disabled),
		[filteredUnselectedOptions]
	)

	const handleToggle = (optionValue) => {
		const strValue = String(optionValue)
		if (disabledValueSet.has(strValue)) return

		if (selectedSet.has(strValue)) {
			setDraft({
				sourceValue: value,
				selectedValues: selectedValues.filter((v) => String(v) !== strValue),
			})
		} else {
			setDraft({
				sourceValue: value,
				selectedValues: [...selectedValues, optionValue],
			})
		}
	}

	const handleSelectAll = () => {
		setDraft({
			sourceValue: value,
			selectedValues: [...selectedValues, ...selectableUnselectedOptions.map((opt) => opt.value)],
		})
	}

	const handleDeselectAll = () => {
		setDraft({ sourceValue: value, selectedValues: [] })
	}

	const handleConfirm = () => {
		onChange?.(selectedValues)
		onClose?.()
	}

	const handleCancel = () => {
		onClose?.()
	}

	return (
		<Modal
			title={title}
			open={open}
			onCancel={handleCancel}
			onOk={handleConfirm}
			okText={t('button.confirm')}
			cancelText={t('button.cancel')}
			width={900}
		>
			<Space orientation='vertical' style={{ width: '100%' }} size='large'>
				<SearchBar value={searchTerm} setValue={setSearchTerm} />

				<div style={{ display: 'flex', gap: 16 }}>
					{/* Unselected Options */}
					<div style={{ flex: 1 }}>
						<h4>{t('text.available')}</h4>
						<div role="list" style={{ maxHeight: 300, overflow: 'auto' }}>
							{filteredUnselectedOptions.map((opt) => (
								<div
									key={String(opt.value)}
									role="listitem"
									style={{ cursor: opt.disabled ? 'not-allowed' : 'pointer', padding: '8px 0' }}
									onClick={() => handleToggle(opt.value)}
								>
									<Space>
										<Checkbox
											checked={false}
											disabled={opt.disabled}
										/>
										<span>{renderOption ? renderOption(opt.value, opt.label) : opt.label}</span>
									</Space>
								</div>
							))}
						</div>
						<Space style={{ marginTop: 12 }}>
							<Button type='primary' onClick={handleSelectAll} size='small'>
								{t('button.select_all')}
							</Button>
							<Button onClick={handleDeselectAll} size='small'>
								{t('button.deselect_all')}
							</Button>
						</Space>
					</div>

					{/* Selected Options */}
					<div style={{ flex: 1 }}>
						<h4>{t('text.selected')}</h4>
						<div role="list" style={{ maxHeight: 300, overflow: 'auto' }}>
							{selectedOptions.map((opt) => (
								<div
									key={String(opt.value)}
									role="listitem"
									style={{ cursor: 'pointer', padding: '8px 0' }}
									onClick={() => handleToggle(opt.value)}
								>
									<Space>
										<Checkbox checked={true} />
										<span>{renderOption ? renderOption(opt.value, opt.label) : opt.label}</span>
									</Space>
								</div>
							))}
						</div>
					</div>
				</div>
			</Space>
		</Modal>
	)
}

export default MultipleSelectDialog
