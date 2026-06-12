import SkeletonTextField from '@/shared/components/skeletons/SkeletonTextField'
import { Space } from 'antd'

const ProfileSkeletonSection = () => (
  <Space orientation="vertical" size={20} style={{ width: '100%', paddingTop: 24 }}>
    <div style={{ width: 180, margin: '0 auto' }}>
      <SkeletonTextField numberOfRow={2} withTitle />
    </div>
    <SkeletonTextField numberOfRow={6} />
  </Space>
)

export default ProfileSkeletonSection
