import { Link } from 'react-router-dom';
import { ArrowRight, Award, Heart, Sparkles, Users } from 'lucide-react';
import { Section, SectionHeader, Reveal } from '@/components/ui/Section';
import { useSettings } from '@/lib/queries';

export function AboutPage() {
  const { data: settings } = useSettings();
  const trustSince = settings?.trust_since ?? 1998;
  const yearsOfTrust = new Date().getFullYear() - trustSince;

  return (
    <>
      <div className="relative bg-ink-900 text-white py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/7447284/pexels-photo-7447284.jpeg?auto=compress&cs=tinysrgb&h=800&w=1600"
            alt="Milano Foods bakery"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/80 to-transparent" />
        </div>
        <div className="container-x relative">
          <div className="max-w-2xl">
            <span className="section-eyebrow text-gold">Our Story</span>
            <h1 className="font-heading text-4xl lg:text-display-md font-semibold text-white mt-3">
              A legacy of craft and community
            </h1>
            <p className="mt-4 text-cream-200 text-lg max-w-xl">
              From a small neighbourhood bakery to Akurana's most trusted name in fresh baked goods.
            </p>
          </div>
        </div>
      </div>

      {/* Story */}
      <Section className="bg-cream">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-lift">
                <img
                  src="https://images.pexels.com/photos/35993723/pexels-photo-35993723.jpeg?auto=compress&cs=tinysrgb&h=900&w=720"
                  alt="Bakery craftsmanship"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>
            <div>
              <SectionHeader
                eyebrow="The Beginning"
                title="How it all started"
              />
              <div className="mt-6 space-y-4 text-ink-600 leading-relaxed">
                <p>
                  Milano Foods was founded in {trustSince} with a simple belief: that everyone
                  deserves fresh, quality baked goods made with care. What began as a tiny shop
                  with one oven and a handful of recipes has grown into Akurana's most beloved bakery.
                </p>
                <p>
                  Over the years, we've expanded from bread and buns to premium celebration cakes,
                  traditional sweets, restaurant meals, and full catering services — but our
                  commitment to freshness and quality has never changed.
                </p>
                <p>
                  Today, with over {settings?.review_count.toLocaleString() ?? '1,000'} Google
                  reviews and a {settings?.average_rating ?? 4.8}-star rating, we're proud to be
                  a part of our community's daily life and special moments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Mission & Vision */}
      <Section className="bg-white">
        <div className="container-x">
          <div className="grid md:grid-cols-2 gap-6">
            <Reveal>
              <div className="card p-8 h-full">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-2xl font-semibold text-ink-900">Our Mission</h3>
                <p className="mt-3 text-ink-600 leading-relaxed">
                  To craft the freshest, finest baked goods using quality ingredients and
                  time-honoured techniques, while serving our community with warmth, consistency
                  and care.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="card p-8 h-full">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/20 text-gold-600 mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-2xl font-semibold text-ink-900">Our Vision</h3>
                <p className="mt-3 text-ink-600 leading-relaxed">
                  To be Sri Lanka's most loved bakery brand — recognised for premium quality,
                  exceptional service, and a digital experience that makes every interaction
                  effortless.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Values */}
      <Section className="bg-cream-100">
        <div className="container-x">
          <SectionHeader center eyebrow="What We Stand For" title="Our values" />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Heart, title: 'Passion', desc: 'Every bake is made with genuine love for the craft.' },
              { icon: Award, title: 'Quality', desc: 'We never compromise on ingredients or standards.' },
              { icon: Users, title: 'Community', desc: 'We are proud to serve and grow with Akurana.' },
              { icon: Sparkles, title: 'Freshness', desc: 'Baked daily, never stored or reheated.' },
            ].map((v, i) => (
              <Reveal key={v.title} delay={i * 0.06}>
                <div className="card p-6 text-center h-full hover:shadow-lift hover:-translate-y-1 transition-all">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary mx-auto">
                    <v.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-ink-900 mt-4">{v.title}</h3>
                  <p className="text-sm text-ink-500 mt-2">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Stats */}
      <Section className="bg-ink-900 text-white">
        <div className="container-x">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: `${yearsOfTrust}+`, label: 'Years of Trust' },
              { value: `${settings?.review_count.toLocaleString() ?? '1,000'}+`, label: 'Google Reviews' },
              { value: `${settings?.average_rating ?? 4.8}★`, label: 'Average Rating' },
              { value: '50+', label: 'Products Daily' },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.08}>
                <div className="text-center">
                  <p className="font-heading text-4xl lg:text-5xl font-bold text-gold">{stat.value}</p>
                  <p className="text-cream-300 mt-2 text-sm">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-cream">
        <div className="container-x">
          <div className="card p-10 lg:p-14 text-center bg-gradient-to-br from-primary to-primary-600 text-white">
            <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-white">
              Ready to taste the difference?
            </h2>
            <p className="mt-3 text-cream-100 max-w-xl mx-auto">
              Browse our products or visit one of our branches today.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/products" className="btn bg-white text-primary px-7 py-3.5 hover:bg-cream-100 active:scale-[0.98]">
                Browse Products <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/branches" className="btn border border-white/40 text-white px-7 py-3.5 hover:bg-white/10 active:scale-[0.98]">
                Find a Branch
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
