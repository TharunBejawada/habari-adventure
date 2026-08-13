// apps/web/app/[lang]/thank-you/page.tsx
// Shared post-submission page for every form in the app (contact form,
// booking modal, package inquiry form). Header/Footer come from the root
// layout automatically. Text is plain English - translated into fr/es by
// the site's existing Google Translate integration, same as every other page.
import Link from "next/link";
import Image from "next/image";
import { getLangPrefix } from "../../../lib/languages";

type Params = Promise<{ lang: string }>;

export default async function ThankYouPage({ params }: { params: Params }) {
  const { lang } = await params;
  const homeHref = getLangPrefix(lang) || "/";

  return (
    <section className="w-full bg-white py-16 md:py-24">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes tyPopIn { from { opacity: 0; transform: scale(.6); } to { opacity: 1; transform: scale(1); } }
            @keyframes tyDraw { to { stroke-dashoffset: 0; } }
            @keyframes tyFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes tyPulseGlow {
              0%, 100% { box-shadow: 0 14px 30px -12px rgba(254,110,0,.65); }
              50% { box-shadow: 0 14px 38px -8px rgba(254,110,0,.9); }
            }
            .ty-badge {
              opacity: 0; transform: scale(.6);
              animation: tyPopIn .55s cubic-bezier(.2,1.4,.4,1) forwards;
              animation-delay: .15s;
            }
            .ty-badge .ty-ring {
              fill: none; stroke: rgba(255,255,255,0.9); stroke-width: 2;
              stroke-dasharray: 88; stroke-dashoffset: 88;
              animation: tyDraw .6s ease forwards; animation-delay: .35s;
            }
            .ty-badge .ty-check {
              fill: none; stroke: #fff; stroke-width: 2.4;
              stroke-linecap: round; stroke-linejoin: round;
              stroke-dasharray: 24; stroke-dashoffset: 24;
              animation: tyDraw .35s ease forwards; animation-delay: .85s;
            }
            .ty-headline { opacity: 0; animation: tyFadeUp .55s ease forwards; animation-delay: .5s; }
            .ty-sub { opacity: 0; animation: tyFadeUp .5s ease forwards; animation-delay: .65s; }
            .ty-cta {
              opacity: 0;
              animation: tyFadeUp .5s ease forwards, tyPulseGlow 2.6s ease-in-out 1.4s infinite;
              animation-delay: .8s, 1.4s;
            }
            @media (prefers-reduced-motion: reduce) {
              .ty-badge, .ty-headline, .ty-sub, .ty-cta {
                animation: none !important; opacity: 1 !important; transform: none !important;
              }
              .ty-badge .ty-ring, .ty-badge .ty-check { stroke-dashoffset: 0 !important; }
            }
          `,
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-[32px] overflow-hidden min-h-[520px] md:min-h-[600px] flex items-center justify-center shadow-xl">
          <Image
            src="/kili-mount.jpg"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/55" />

          <div className="relative z-10 text-center px-6 sm:px-10 py-16 flex flex-col items-center">
            <div className="ty-badge w-16 h-16 rounded-full border border-white/60 bg-white/10 flex items-center justify-center mb-6">
              <svg viewBox="0 0 32 32" className="w-7 h-7">
                <circle className="ty-ring" cx="16" cy="16" r="14" />
                <path className="ty-check" d="M10 16.5l4 4 8-9" />
              </svg>
            </div>

            <h1 className="ty-headline text-white font-extrabold text-4xl md:text-5xl leading-tight mb-4 text-balance">
              Thank You for Contacting Us
            </h1>
            <p className="ty-sub text-white/90 text-base md:text-lg max-w-md mb-9">
              Our team will get back to you shortly.
            </p>

            <Link
              href={homeHref}
              className="ty-cta inline-flex items-center gap-2 bg-[#fe6e00] hover:-translate-y-1 text-white font-bold text-sm md:text-base px-8 py-4 rounded-full shadow-lg transition-transform"
            >
              Back to Home
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
