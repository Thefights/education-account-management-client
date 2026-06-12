import ActionMenu from '@/components/generals/ActionMenu'
import ConfirmationButton from '@/components/generals/ConfirmationButton'
import ImagePreviewButton from '@/components/generals/ImagePreviewButton'
import GenericTable from '@/components/tables/GenericTable'
import { defaultProductStatusStyle } from '@/configs/defaultStylesConfig'
import useEnum from '@/hooks/useEnum'
import useTranslation from '@/hooks/useTranslation'
import { getImageFromCloud } from '@/utils/commons'
import { Button, Flex } from 'antd'
import { useMemo } from 'react'

const ProductManagementTableSection = ({
  products,
  loading,
  sort,
  setSort,
  selectedIds = [],
  setSelectedIds = () => {},
  actionLoading = false,
  onDeleteSelected = () => {},
  onActivateSelected = () => {},
  onDeactivateSelected = () => {},
  onCreate = () => {},
  onEdit = () => {},
}) => {
  const { t } = useTranslation()
  const _enum = useEnum()

  const hasSelectedProducts = selectedIds.length > 0

  const fields = useMemo(
    () => [
      {
        key: 'id',
        title: t('product.field.id'),
        width: 2,
        sortable: true,
        fixedColumn: true,
      },
      {
        key: 'imageUrl',
        title: t('product.field.image'),
        width: 10,
        render: (value) => {
          const imageUrl = getImageFromCloud(value)
          return <ImagePreviewButton src={imageUrl} alt="product" />
        },
      },
      {
        key: 'name',
        title: t('product.field.name'),
        width: 20,
        sortable: true,
      },
      {
        key: 'description',
        title: t('product.field.description'),
        width: 35,
        sortable: true,
      },
      {
        key: 'status',
        title: t('product.field.status'),
        width: 12,
        sortable: true,
        type: 'tag',
        options: _enum.productStatusOptions,
        color: defaultProductStatusStyle,
      },
      {
        key: 'actions',
        title: '',
        width: 5,
        render: (_, row) => (
          <ActionMenu
            actions={[
              {
                title: t('button.edit'),
                onClick: () => onEdit(row),
              },
            ]}
          />
        ),
      },
    ],
    [t, _enum.productStatusOptions, onEdit]
  )

  return (
    <>
      <Flex justify="end" align="center" gap={12} wrap="wrap" style={{ marginBottom: 12 }}>
        <ConfirmationButton
          confirmationTitle={t('product.confirm.delete_selected_title')}
          confirmationDescription={t('product.confirm.delete_selected_description', {
            number: selectedIds.length,
          })}
          confirmButtonColor="error"
          confirmButtonText={t('button.delete')}
          danger
          disabled={!hasSelectedProducts || actionLoading}
          onConfirm={onDeleteSelected}
        >
          {t('product.button.delete_selected')}
        </ConfirmationButton>

        <ConfirmationButton
          confirmationTitle={t('product.confirm.activate_selected_title')}
          confirmationDescription={t('product.confirm.activate_selected_description', {
            number: selectedIds.length,
          })}
          confirmButtonText={t('product.button.activate_selected')}
          disabled={!hasSelectedProducts || actionLoading}
          onConfirm={onActivateSelected}
        >
          {t('product.button.activate_selected')}
        </ConfirmationButton>

        <ConfirmationButton
          confirmationTitle={t('product.confirm.deactivate_selected_title')}
          confirmationDescription={t('product.confirm.deactivate_selected_description', {
            number: selectedIds.length,
          })}
          confirmButtonColor="warning"
          confirmButtonText={t('product.button.deactivate_selected')}
          disabled={!hasSelectedProducts || actionLoading}
          onConfirm={onDeactivateSelected}
        >
          {t('product.button.deactivate_selected')}
        </ConfirmationButton>

        <Button type="primary" onClick={onCreate} disabled={actionLoading}>
          {t('button.create')}
        </Button>
      </Flex>

      <GenericTable
        data={products}
        fields={fields}
        sort={sort}
        setSort={setSort}
        rowKey="id"
        canSelectRows
        selectedRows={selectedIds}
        setSelectedRows={setSelectedIds}
        loading={loading}
      />
    </>
  )
}

export default ProductManagementTableSection
