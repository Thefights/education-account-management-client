import ImagePreviewButton from '@/shared/components/generals/ImagePreviewButton'
import { getImageFromCloud } from '@/shared/utils/commons'
import { renderEmptyFallback } from '@/shared/utils/handleStringUtil'
import { Typography } from 'antd'

const ProfileSummarySection = ({ profile }) => {
  const imageSrc = getImageFromCloud(profile.imageUrl)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '24px 0 10px',
        textAlign: 'center',
      }}
    >
      <ImagePreviewButton src={imageSrc} alt="profile" width={56} height={56} />
      <Typography.Title level={5} style={{ margin: '2px 0 0', overflowWrap: 'anywhere' }}>
        {renderEmptyFallback(profile.fullName)}
      </Typography.Title>
      <Typography.Text type="secondary" style={{ overflowWrap: 'anywhere' }}>
        {renderEmptyFallback(profile.email)}
      </Typography.Text>
    </div>
  )
}

export default ProfileSummarySection
