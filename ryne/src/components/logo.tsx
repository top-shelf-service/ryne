import * as React from 'react';
import Image from 'next/image';

export function Logo(props: Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'>) {
  return (
    <Image
      src="https://placehold.co/200x50.png"
      alt="Shyft Logo"
      width={100}
      height={25}
      data-ai-hint="rock mountain"
      {...props}
    />
  );
}
