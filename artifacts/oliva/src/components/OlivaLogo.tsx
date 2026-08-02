import { imageAssets } from '../utils/imageAssets';

interface OlivaLogoProps {
  size?: number
  className?: string
  showText?: boolean
}

export default function OlivaLogo({ size = 120, className = '', showText = true }: OlivaLogoProps) {
  return (
    <img
      src={imageAssets.logo}
      alt="Oliva — From Court to Cup"
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
