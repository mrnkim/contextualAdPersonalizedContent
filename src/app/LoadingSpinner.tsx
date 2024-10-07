import React from 'react';
import clsx from 'clsx';

type Size = 'sm' | 'md' | 'lg';
type Color = 'default' | 'primary';

function getSize(size: Size): string {
  switch (size) {
    case 'sm':
      return 'w-4 h-4';
    case 'md':
      return 'w-5 h-5';
    case 'lg':
      return 'w-10 h-10';
  }
}

function getColor(color: Color): string {
  switch (color) {
    case 'default':
      return 'border-grey-500';
    case 'primary':
      return 'border-green-500';
  }
}

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: Size;
  color?: Color;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  size = 'sm',
  color = 'default',
  ...props
}) => (
  <div
    className={clsx(
      getSize(size),
      getColor(color),
      "rounded-full border-2 border-solid border-t-transparent",
      "animate-spin",
      className
    )}
    {...props}
  />
);

export default LoadingSpinner;

