import React from 'react'
import { cn } from '../utils/cn'

const LoadingSpinner = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn('loading-spinner', sizeClasses[size])} />
    </div>
  )
}

export default LoadingSpinner