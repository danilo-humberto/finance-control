import { useEffect, useMemo, useState } from 'react';

import { cn } from '@/lib/utils';

type UserAvatarProps = {
  name?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  fallback?: string;
  className?: string;
  fallbackClassName?: string;
  ariaLabel?: string;
};

function getFallbackInitials(name?: string | null, email?: string | null) {
  const displayName = name?.trim() || email?.split('@')[0]?.trim() || '';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return initials || 'U';
}

export function UserAvatar({
  name,
  email,
  photoUrl,
  fallback,
  className,
  fallbackClassName,
  ariaLabel,
}: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = useMemo(
    () => fallback || getFallbackInitials(name, email),
    [email, fallback, name],
  );
  const shouldShowImage = Boolean(photoUrl && !imageFailed);

  useEffect(() => {
    setImageFailed(false);
  }, [photoUrl]);

  return (
    <span
      role="img"
      aria-label={ariaLabel || 'Avatar do usuario'}
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        'bg-app-icon text-brand-400',
        className,
      )}
    >
      {shouldShowImage ? (
        <img
          src={photoUrl || undefined}
          alt=""
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className={cn('leading-none', fallbackClassName)}>
          {initials}
        </span>
      )}
    </span>
  );
}
