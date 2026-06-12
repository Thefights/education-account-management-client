import useTranslation from '@/hooks/useTranslation'
import { Flex, Grid, Pagination, Select, Space, Typography } from 'antd'
import { useMemo } from 'react'

const tablePaginationStyles = {
  root: {
    width: '100%',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 8,
    minWidth: 0,
  },
  controls: {
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    minWidth: 0,
    rowGap: 8,
  },
  pageSizeSelect: {
    width: 72,
  },
  paginationWrap: {
    minWidth: 0,
    overflowX: 'auto',
    paddingBottom: 2,
  },
}

const getPaginationLocale = (t) => ({
  items_per_page: t('pagination.items_per_page'),
  jump_to: t('pagination.jump_to'),
  jump_to_confirm: t('pagination.jump_to_confirm'),
  page: t('pagination.page'),
  prev_page: t('pagination.prev_page'),
  next_page: t('pagination.next_page'),
  prev_5: t('pagination.prev_5'),
  next_5: t('pagination.next_5'),
  prev_3: t('pagination.prev_3'),
  next_3: t('pagination.next_3'),
  page_size: t('pagination.page_size'),
})

export const GenericPagination = ({
  totalPage,
  page,
  setPage,
  siblingCount = 1,
  boundaryCount = 2,
  loading = false,
  showQuickJumper = true,
  locale,
}) => {
  const safeTotalPage = totalPage ?? 0

  return (
    <Pagination
      size="small"
      current={page}
      total={safeTotalPage}
      pageSize={1}
      disabled={loading}
      locale={locale}
      showQuickJumper={showQuickJumper}
      showSizeChanger={false}
      showLessItems={siblingCount <= 1}
      pageSizeOptions={[]}
      onChange={setPage}
      responsive
      hideOnSinglePage={false}
      showPrevNextJumpers={boundaryCount > 1}
    />
  )
}

export const GenericTablePagination = ({
  totalCount,
  totalPage,
  page,
  setPage,
  pageSize,
  setPageSize,
  pageSizeOptions = [10, 25, 50],
  loading = false,
}) => {
  const { t } = useTranslation()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.sm
  const safeTotalCount = totalCount ?? 0
  const safeTotalPage = totalPage ?? 0

  const paginationLocale = useMemo(() => getPaginationLocale(t), [t])

  const handlePageSizeChange = (nextPageSize) => {
    setPageSize(nextPageSize)
    setPage(1)
  }

  return (
    <Flex
      align={isMobile ? 'stretch' : 'center'}
      vertical={isMobile}
      gap={isMobile ? 8 : 16}
      style={tablePaginationStyles.root}
    >
      <Typography.Text style={{ whiteSpace: 'nowrap' }}>
        {t('text.total')} {safeTotalCount} {t('text.items')}
      </Typography.Text>
      <Flex
        align={isMobile ? 'stretch' : 'center'}
        gap={8}
        vertical={isMobile}
        style={tablePaginationStyles.controls}
      >
        <Space size="small" wrap>
          <Typography.Text>{t('text.rows_per_page')}:</Typography.Text>
          <Select
            size="small"
            disabled={loading}
            value={pageSize}
            onChange={handlePageSizeChange}
            options={pageSizeOptions.map((option) => ({
              label: String(option),
              value: option,
            }))}
            style={tablePaginationStyles.pageSizeSelect}
          />
        </Space>
        <Typography.Text style={{ whiteSpace: 'nowrap' }}>
          {t('text.page_of', { page, totalPage: safeTotalPage })}
        </Typography.Text>
        <div style={tablePaginationStyles.paginationWrap}>
          <GenericPagination
            totalPage={safeTotalPage}
            page={page}
            setPage={setPage}
            loading={loading}
            locale={paginationLocale}
            showQuickJumper={!isMobile}
          />
        </div>
      </Flex>
    </Flex>
  )
}

// Usage example:

/*
<GenericPagination
	totalPage={totalPage}
	page={page}
	setPage={setPage}
/>

<GenericTablePagination
  totalCount={totalCount}
	totalPage={totalPage}
	page={page}
	setPage={setPage}
	pageSize={pageSize}
	setPageSize={setPageSize}
	loading={loading}
/>
*/
