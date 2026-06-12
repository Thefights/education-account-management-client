import { Space } from 'antd'
import ProfileInfoGridSection from './ProfileInfoGridSection'
import ProfileSkeletonSection from './ProfileSkeletonSection'
import ProfileSummarySection from './ProfileSummarySection'

const ProfileDetailsSection = ({ profile, loading }) => {
  if (loading || !profile) {
    return <ProfileSkeletonSection />
  }

  return (
    <Space orientation="vertical" size={20} style={{ width: '100%' }}>
      <ProfileSummarySection profile={profile} />
      <ProfileInfoGridSection profile={profile} />
    </Space>
  )
}

export default ProfileDetailsSection
