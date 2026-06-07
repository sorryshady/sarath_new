'use client';
import { slideInOut } from '@/lib/view-transition';
import Link from 'next/link';
import { useTransitionRouter } from 'next-view-transitions';
import './custom-link.css';

interface CustomLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const CustomLink = ({ href, children, className }: CustomLinkProps) => {
  const router = useTransitionRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push(href, {
      onTransitionReady: slideInOut,
    });
  };
  return (
    <Link href={href} className={`${className} custom-link`} onClick={handleClick}>
      {children}
    </Link>
  );
};

export default CustomLink;
