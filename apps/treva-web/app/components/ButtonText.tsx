import type { ReactNode } from 'react';

type ButtonTextProps = {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'span';
  textAs?: 'div' | 'span';
};

export const ButtonText = ({
  children,
  className,
  as: Wrapper = 'div',
  textAs: Text = 'div',
}: ButtonTextProps) => {
  const wrapperClassName = ['button-text-wrap', className].filter(Boolean).join(' ');

  return (
    <Wrapper className={wrapperClassName}>
      <Text className="button-text">{children}</Text>
      <Text className="button-text" aria-hidden="true">
        {children}
      </Text>
    </Wrapper>
  );
};
