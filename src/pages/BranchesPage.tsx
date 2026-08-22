import { MapPin, Phone, Clock, Navigation, MessageCircle } from 'lucide-react';
import { Section, SectionHeader, Reveal } from '@/components/ui/Section';
import { useBranches, useSettings } from '@/lib/queries';

export function BranchesPage() {
  const { data: branches } = useBranches();
  const { data: settings } = useSettings();

  return (
    <>
      <div className="bg-ink-900 text-white py-16 lg:py-20">
        <div className="container-x">
          <span className="section-eyebrow text-gold">Branches</span>
          <h1 className="font-heading text-4xl lg:text-display-md font-semibold text-white mt-3">
            Come visit us
          </h1>
          <p className="mt-3 text-cream-200 text-lg max-w-2xl">
            Find your nearest Milano Foods branch. Fresh bakes, warm smiles and great food await.
          </p>
        </div>
      </div>

      <Section className="bg-cream">
        <div className="container-x">
          <div className="grid gap-6 lg:gap-8">
            {branches?.map((branch, i) => (
              <Reveal key={branch.id} delay={i * 0.1}>
                <div className="card overflow-hidden grid md:grid-cols-2 hover:shadow-lift transition-shadow">
                  {/* Map embed */}
                  <div className="relative min-h-[250px] bg-cream-200">
                    {branch.map_embed ? (
                      <iframe
                        src={branch.map_embed}
                        title={branch.name}
                        className="absolute inset-0 h-full w-full"
                        loading="lazy"
                        style={{ border: 0 }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="h-12 w-12 text-primary mx-auto" />
                          <p className="text-sm text-muted mt-2 max-w-xs px-6">{branch.address}</p>
                          {branch.map_url && (
                            <a
                              href={branch.map_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-outline mt-4"
                            >
                              <Navigation className="h-4 w-4" /> Open in Maps
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-6 lg:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <h2 className="font-heading text-2xl font-semibold text-ink-900">{branch.name}</h2>
                      {branch.is_main && (
                        <span className="chip bg-gold/20 text-gold-700">Main Branch</span>
                      )}
                    </div>
                    <p className="text-ink-600 leading-relaxed">{branch.address}</p>

                    <div className="mt-5 space-y-3">
                      {branch.hours && (
                        <div className="flex items-start gap-3 text-sm">
                          <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-ink-800">Opening Hours</p>
                            <p className="text-ink-500">{branch.hours}</p>
                          </div>
                        </div>
                      )}
                      {branch.phone && (
                        <div className="flex items-start gap-3 text-sm">
                          <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-ink-800">Phone</p>
                            <a href={`tel:${branch.phone}`} className="text-ink-500 hover:text-primary transition-colors">
                              {branch.phone}
                            </a>
                          </div>
                        </div>
                      )}
                      {branch.whatsapp && (
                        <div className="flex items-start gap-3 text-sm">
                          <MessageCircle className="h-5 w-5 text-success-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-ink-800">WhatsApp</p>
                            <a
                              href={`https://wa.me/${branch.whatsapp.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ink-500 hover:text-success-600 transition-colors"
                            >
                              {branch.whatsapp}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      {branch.map_url && (
                        <a
                          href={branch.map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary"
                        >
                          <Navigation className="h-4 w-4" /> Get Directions
                        </a>
                      )}
                      {branch.phone && (
                        <a href={`tel:${branch.phone}`} className="btn-outline">
                          <Phone className="h-4 w-4" /> Call Now
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Contact strip */}
          {settings && (
            <div className="mt-12 card p-8 bg-ink-900 text-white border-0">
              <div className="grid sm:grid-cols-3 gap-6 text-center">
                <div>
                  <MapPin className="h-6 w-6 text-gold mx-auto" />
                  <p className="mt-2 text-cream-200 text-sm">{settings.address}</p>
                </div>
                <div>
                  <Phone className="h-6 w-6 text-gold mx-auto" />
                  <p className="mt-2 text-cream-200 text-sm">{settings.phone}</p>
                </div>
                <div>
                  <Clock className="h-6 w-6 text-gold mx-auto" />
                  <p className="mt-2 text-cream-200 text-sm">Open daily 6 AM – 10 PM</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
