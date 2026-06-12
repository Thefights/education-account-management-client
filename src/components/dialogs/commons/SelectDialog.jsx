import SearchBar from '@/components/generals/SearchBar'
import useTranslation from '@/hooks/useTranslation'
import { Modal, Radio, Space } from 'antd'
import { useMemo, useState } from 'react'

const SelectDialog = ({
	open = false,
	onClose,
	options = [],
	value = '',
	onChange,
	renderOption,
	title = '',
}) => {
	const { t } = useTranslation()
	const [searchTerm, setSearchTerm] = useState('')
	const [draft, setDraft] = useState({ sourceValue: value, selectedValue: value })
	const selectedValue = Object.is(draft.sourceValue, value) ? draft.selectedValue : value

	const filteredOptions = useMemo(() => {
		if (!searchTerm.trim()) return options || []

		const lowerSearch = searchTerm.toLowerCase()
		return (options || []).filter((opt) => {
			const label = String(opt.searchKey || opt.label || '').toLowerCase()
			return label.includes(lowerSearch)
		})
	}, [options, searchTerm])

	const handleSelect = (optionValue) => {
		setDraft({ sourceValue: value, selectedValue: optionValue })
	}

	const handleConfirm = () => {
		onChange?.(selectedValue)
		onClose?.()
	}

	const handleCancel = () => {
		onClose?.()
	}

	const listData = filteredOptions.map((opt) => ({
		key: String(opt.value),
		label: renderOption ? renderOption(opt.value, opt.label) : opt.label,
		value: opt.value,
		disabled: opt.disabled,
	}))

	return (
		<Modal
			title={title}
			open={open}
			onCancel={handleCancel}
			onOk={handleConfirm}
			okText={t('button.confirm')}
			cancelText={t('button.cancel')}
			width={600}
		>
			<Space orientation='vertical' style={{ width: '100%', marginBottom: 16 }}>
				<SearchBar value={searchTerm} setValue={setSearchTerm} />
				<div role="list" style={{ maxHeight: 300, overflow: 'auto' }}>
					{listData.map((item) => (
						<div
							key={item.key}
							role="listitem"
							style={{ cursor: item.disabled ? 'not-allowed' : 'pointer', padding: '8px 0' }}
							onClick={() => !item.disabled && handleSelect(item.value)}
						>
							<Space>
								<Radio
									checked={String(selectedValue) === String(item.value)}
									disabled={item.disabled}
								/>
								<span>{item.label}</span>
							</Space>
						</div>
					))}
				</div>
			</Space>
		</Modal>
	)
}

export default SelectDialog
