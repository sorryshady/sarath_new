'use client';

import { Fragment, useRef } from 'react';

import Copy from '@/components/copy/Copy';
import { ApertureMark } from '@/components/global/ApertureMark';
import type { ContactSettings } from '@/types/contact';

import './contact.css';

type Social = { label: string; href: string };

export function ContactSection({ settings }: { settings: ContactSettings | null }) {
  const sectionRef = useRef<HTMLElement>(null);

  const email = settings?.contactEmail;
  const phone = settings?.contactPhone;
  const location = settings?.contactLocation;

  const socials: Social[] = [
    settings?.instagramUrl ? { label: 'Instagram', href: settings.instagramUrl } : null,
    settings?.vimeoUrl ? { label: 'Vimeo', href: settings.vimeoUrl } : null,
    settings?.linkedinUrl ? { label: 'LinkedIn', href: settings.linkedinUrl } : null,
  ].filter((s): s is Social => s !== null);

  return (
    <section
      ref={sectionRef}
      id="contact"
      data-nav-theme="light"
      className="cnt"
      aria-label="Contact"
    >
      <div className="cnt-inner">
        {/* Left — invitation + contact details */}
        <div className="cnt-text">
          <p className="cnt-eyebrow">Get in touch</p>

          <Copy>
            <h2 className="cnt-invite">
              Let&apos;s make<br />
              something.
            </h2>
          </Copy>

          <p className="cnt-lede">
            Films, frames, or verse — if there&apos;s a story to tell, I&apos;d like
            to hear it.
          </p>

          <div className="cnt-rule" aria-hidden="true" />

          {(email || phone || location) && (
            <div className="cnt-details">
              {email && (
                <a href={`mailto:${email}`} className="cnt-detail cnt-detail--link">
                  {email}
                </a>
              )}
              {phone && <span className="cnt-detail">{phone}</span>}
              {location && <span className="cnt-detail">{location}</span>}
            </div>
          )}

          {socials.length > 0 && (
            <div className="cnt-socials">
              {socials.map((s, i) => (
                <Fragment key={s.label}>
                  {i > 0 && <span className="cnt-social-sep" aria-hidden="true">·</span>}
                  <a
                    href={s.href}
                    className="cnt-social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.label}
                  </a>
                </Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Right — the aperture irises shut as the end-card settles */}
        <div className="cnt-stage" aria-hidden="true">
          <span className="cnt-stage-label cnt-stage-label--tl">f/1.4</span>
          <span className="cnt-stage-label cnt-stage-label--tr">35MM</span>
          <ApertureMark triggerRef={sectionRef} className="cnt-aperture" />
          <span className="cnt-stage-label cnt-stage-label--b">End of reel</span>
        </div>
      </div>

      {/* Closing slate */}
      <div className="cnt-fin" aria-hidden="true">
        <span className="cnt-fin-rule" />
        <span className="cnt-fin-word">Fin.</span>
        <span className="cnt-fin-rule" />
      </div>
    </section>
  );
}
