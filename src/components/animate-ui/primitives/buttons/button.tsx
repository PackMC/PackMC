'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

import { Slot, type WithAsChild } from '@/components/animate-ui/primitives/animate/slot';

type ButtonProps = WithAsChild<
  Omit<HTMLMotionProps<'button'>, 'ref'> & {
    hoverScale?: number;
    tapScale?: number;
  }
> & React.RefAttributes<HTMLButtonElement>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      hoverScale = 1.05,
      tapScale = 0.95,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Component = asChild ? Slot : motion.button;

    return (
      <Component
        ref={ref}
        whileTap={{ scale: tapScale }}
        whileHover={{ scale: hoverScale }}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, type ButtonProps };
