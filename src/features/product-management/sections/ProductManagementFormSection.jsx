import GenericFormDrawer from '@/shared/components/dialogs/commons/GenericFormDrawer'
import useTranslation from '@/shared/hooks/useTranslation'
import { maxLen } from '@/shared/utils/validateUtil'
import { useMemo } from 'react'

const initialCreateValues = {
  name: '',
  description: '',
  imageUrl: null,
}

const ProductManagementFormSection = ({
  openCreate,
  setOpenCreate,
  openUpdate,
  setOpenUpdate,
  selectedRow,
  onCreateSubmit,
  onUpdateSubmit,
  refetch,
}) => {
  const { t } = useTranslation()

  const baseFields = useMemo(
    () => [
      {
        key: 'name',
        title: t('product.field.name'),
        validate: [maxLen(100)],
      },
      {
        key: 'description',
        title: t('product.field.description'),
        type: 'textarea',
        validate: [maxLen(500)],
      },
      {
        key: 'imageUrl',
        title: t('product.field.image'),
        type: 'image',
      },
    ],
    [t]
  )

  const createFields = useMemo(
    () =>
      baseFields.map((field) =>
        field.key === 'imageUrl'
          ? {
              ...field,
              required: true,
            }
          : field
      ),
    [baseFields]
  )

  const handleCreateSubmit = async ({ values, closeDrawer }) => {
    const response = await onCreateSubmit({ overrideData: values })

    if (!response) return

    closeDrawer()
    refetch()
  }

  const handleUpdateSubmit = async ({ values, closeDrawer }) => {
    if (!selectedRow?.id) return

    const response = await onUpdateSubmit({ overrideData: values })

    if (!response) return

    closeDrawer()
    refetch()
  }

  return (
    <>
      <GenericFormDrawer
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        initialValues={initialCreateValues}
        fields={createFields}
        submitLabel={t('button.create')}
        title={t('product.title.product_management')}
        onSubmit={handleCreateSubmit}
      />

      <GenericFormDrawer
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        initialValues={selectedRow}
        fields={baseFields}
        submitLabel={t('button.update')}
        title={t('product.title.product_management')}
        onSubmit={handleUpdateSubmit}
      />
    </>
  )
}

export default ProductManagementFormSection
