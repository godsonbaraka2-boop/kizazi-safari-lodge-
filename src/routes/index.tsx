import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";
import roomSavannah from "@/assets/room-savannah.jpg";
import roomAcacia from "@/assets/room-acacia.jpg";
import tourDrive from "@/assets/tour-drive.jpg";
import tourBalloon from "@/assets/tour-balloon.jpg";
import foodMshikaki from "@/assets/food-mshikaki.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kizazi Safari Lodge — Karibu Serengeti, Tanzania" },
      {
        name: "description",
        content:
          "Lodge ya kifahari Serengeti, Tanzania. Weka chumba, agiza chakula na safari kupitia WhatsApp moja kwa moja.",
      },
      { property: "og:title", content: "Kizazi Safari Lodge — Serengeti, Tanzania" },
      {
        property: "og:description",
        content: "Vyumba vya kifahari, chakula cha asili, na safari za porini. Booking kupitia WhatsApp.",
      },
      { property: "og:image", content: heroImg },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroImg },
    ],
  }),
  component: Index,
});

const WA = "255654617865";
const wa = (msg: string) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;

function Index() {
  return (
    <div className="min-h-screen bg-sand-50 text-earth-900 font-sans selection:bg-savannah/20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-sand-50/80 backdrop-blur-md border-b border-earth-900/5 px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold tracking-tighter uppercase font-display italic">
          Kizazi Lodge
        </div>
        <nav className="hidden md:flex gap-7 text-xs font-medium uppercase tracking-widest">
          <a href="#rooms" className="hover:text-savannah transition-colors">Vyumba</a>
          <a href="#menu" className="hover:text-savannah transition-colors">Chakula</a>
          <a href="#tours" className="hover:text-savannah transition-colors">Safari</a>
          <a href="#gallery" className="hover:text-savannah transition-colors">Picha</a>
          <a href="#contact" className="hover:text-savannah transition-colors">Wasiliana</a>
        </nav>
        <div className="flex gap-3 text-[10px] font-medium uppercase tracking-widest">
          <span className="text-savannah">SW</span>
          <span className="text-earth-900/30">EN</span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[85vh] overflow-hidden bg-earth-900">
        <img
          src={heroImg}
          alt="Hema za kifahari za Kizazi Lodge chini ya mti wa acacia, jua linapozama Serengeti"
          width={1280}
          height={1664}
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-earth-900 via-transparent to-transparent" />
        <div className="absolute bottom-12 px-6 max-w-2xl animate-fade-up">
          <span className="inline-block mb-3 px-2 py-1 bg-savannah text-white text-[10px] font-bold tracking-widest uppercase">
            Serengeti, Tanzania
          </span>
          <h1 className="text-5xl md:text-6xl font-display italic text-white mb-6 text-balance leading-[1.1]">
            Karibu Nyumbani mwa Asili.
          </h1>
          <a
            href={wa("Habari! Ningependa kuweka nafasi ya kukaa Kizazi Lodge.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-earth-900 px-8 py-4 rounded-full font-semibold transition-transform active:scale-95"
          >
            <span>Weka Nafasi Sasa</span>
            <span className="text-xs font-normal opacity-50 italic border-l border-earth-900/20 pl-3">
              via WhatsApp
            </span>
          </a>
        </div>
      </section>

      {/* Rooms */}
      <section id="rooms" className="px-6 py-20 bg-white scroll-mt-20">
        <div className="mb-10 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display italic mb-2">Vyumba na Makaazi</h2>
          <p className="text-earth-900/60 text-sm">Anasa iliyoundwa kwa roho ya pori.</p>
        </div>

        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-10">
          {ROOMS.map((r) => (
            <article key={r.name} className="group">
              <img
                src={r.img}
                alt={r.alt}
                loading="lazy"
                width={1024}
                height={1280}
                className="w-full aspect-[4/5] object-cover rounded-2xl mb-4 bg-sand-100"
              />
              <div className="flex justify-between items-start mb-2 gap-3">
                <h3 className="text-xl font-bold">{r.name}</h3>
                <div className="font-mono text-sm bg-sand-100 px-2 py-1 whitespace-nowrap">
                  {r.price}
                  <span className="text-[10px] opacity-50">/usiku</span>
                </div>
              </div>
              <p className="text-sm text-earth-900/70 mb-4">{r.desc}</p>
              <a
                href={wa(`Habari, nataka kuweka nafasi ya ${r.name}. Tafadhali nielezea zaidi.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 border border-earth-900/10 text-center rounded-xl font-medium hover:bg-earth-900 hover:text-white transition-colors"
              >
                Weka Nafasi
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="bg-sand-100 px-6 py-20 scroll-mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display italic mb-2">Chakula na Vinywaji</h2>
          <p className="text-earth-900/50 text-xs uppercase tracking-widest font-medium">
            Cuisine of the Serengeti
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-earth-900/5">
          <img
            src={foodMshikaki}
            alt="Mshikaki wa nyama uliopikwa kwa mtindo wa Tanzania"
            loading="lazy"
            width={640}
            height={640}
            className="w-full aspect-[16/9] object-cover rounded-2xl mb-8"
          />
          {MENU.map((section) => (
            <div key={section.title} className="mb-8 last:mb-0">
              <h4 className="text-savannah font-bold text-[10px] tracking-widest uppercase mb-4">
                {section.title}
              </h4>
              <div className="space-y-6">
                {section.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex justify-between items-start border-b border-earth-900/5 pb-4 gap-4"
                  >
                    <div className="max-w-[70%]">
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-xs text-earth-900/50">{item.desc}</p>
                    </div>
                    <span className="font-mono text-xs whitespace-nowrap">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <a
            href={wa("Habari, ningependa kuagiza chakula. Tafadhali nipatie menyu kamili na bei.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 flex items-center justify-center gap-2 bg-savannah hover:bg-savannah-dark text-white w-full py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors"
          >
            Agiza Chakula
          </a>
        </div>
      </section>

      {/* Tours */}
      <section id="tours" className="px-6 py-20 scroll-mt-20">
        <h2 className="text-3xl md:text-4xl font-display italic mb-10 text-center">
          Safari na Matembezi
        </h2>
        <div className="flex overflow-x-auto gap-4 -mx-6 px-6 pb-6 no-scrollbar snap-x snap-mandatory">
          {TOURS.map((t) => (
            <article
              key={t.name}
              className="min-w-[280px] sm:min-w-[320px] bg-white rounded-2xl overflow-hidden border border-earth-900/5 snap-start flex flex-col"
            >
              <img
                src={t.img}
                alt={t.alt}
                loading="lazy"
                width={800}
                height={544}
                className="w-full aspect-video object-cover bg-sand-100"
              />
              <div className="p-6 flex flex-col flex-1">
                <h4 className="font-bold mb-2">{t.name}</h4>
                <p className="text-xs text-earth-900/60 mb-4">{t.meta}</p>
                <p className="font-mono text-savannah text-sm mb-4">{t.price}</p>
                <a
                  href={wa(`Habari, naulizia kuhusu safari ya "${t.name}". Tafadhali nipatie maelezo.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto text-center text-xs font-bold uppercase tracking-widest py-3 border border-earth-900/10 rounded-xl hover:bg-earth-900 hover:text-white transition-colors"
                >
                  Uliza / Weka
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="px-6 py-20 bg-white scroll-mt-20">
        <h2 className="text-3xl md:text-4xl font-display italic mb-10">Galari</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-5xl">
          {[heroImg, roomSavannah, roomAcacia, tourDrive, tourBalloon, foodMshikaki].map(
            (src, i) => (
              <img
                key={i}
                src={src}
                alt={`Picha ya Kizazi Lodge ${i + 1}`}
                loading="lazy"
                className={`w-full object-cover rounded-xl bg-sand-100 ${
                  i % 5 === 0 ? "aspect-[3/4]" : "aspect-square"
                }`}
              />
            ),
          )}
        </div>
      </section>

      {/* Contact / Footer */}
      <footer id="contact" className="bg-earth-900 text-white px-6 pt-20 pb-32 scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display italic mb-6">Wasiliana Nasi</h2>
          <div className="space-y-4 text-white/70 text-sm mb-12">
            <p className="flex items-center gap-3">
              <span className="text-savannah font-mono">T:</span>
              <a href="tel:+255654617865" className="hover:text-white">+255 654 617 865</a>
            </p>
            <p className="flex items-center gap-3">
              <span className="text-savannah font-mono">W:</span>
              <a
                href={wa("Habari, nina swali kuhusu Kizazi Lodge.")}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                WhatsApp moja kwa moja
              </a>
            </p>
            <p className="flex items-center gap-3">
              <span className="text-savannah font-mono">A:</span> Serengeti National Park, Tanzania
            </p>
          </div>
          <div className="aspect-video bg-white/5 rounded-2xl grid place-items-center border border-white/10 mb-12 overflow-hidden">
            <iframe
              title="Ramani ya Kizazi Lodge"
              src="https://www.openstreetmap.org/export/embed.html?bbox=34.5%2C-2.7%2C35.3%2C-2.1&layer=mapnik"
              className="w-full h-full"
              loading="lazy"
            />
          </div>
          <p className="text-[10px] text-white/30 text-center tracking-widest uppercase">
            © {new Date().getFullYear()} Kizazi Safari Lodge · Tanzania
          </p>
        </div>
      </footer>

      {/* Sticky WhatsApp CTA */}
      <a
        href={wa("Habari! Nataka kuweka nafasi Kizazi Lodge.")}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 right-6 z-50 md:left-auto md:right-6 md:w-auto md:px-8 flex items-center justify-center gap-3 bg-savannah hover:bg-savannah-dark text-white py-5 rounded-2xl shadow-xl shadow-savannah/20 transition-all active:scale-95"
      >
        <span className="font-bold uppercase tracking-widest text-xs">
          Weka Nafasi via WhatsApp
        </span>
      </a>
    </div>
  );
}

const ROOMS = [
  {
    name: "Savannah Suite",
    price: "TZS 850k",
    desc: "Kitanda cha king, mtaro binafsi wenye mwonekano wa Mto Grumeti, na bafu ya nje ya mvua.",
    img: roomSavannah,
    alt: "Ndani ya hema la kifahari la Savannah Suite",
  },
  {
    name: "Acacia Family Villa",
    price: "TZS 1.4M",
    desc: "Vyumba viwili vya kulala, bwawa la kuogelea binafsi, na huduma ya butler. Watu wanne.",
    img: roomAcacia,
    alt: "Acacia Family Villa yenye paa la nyasi na mtazamo wa pori",
  },
];

const MENU = [
  {
    title: "Mlo wa Asubuhi / Breakfast",
    items: [
      { name: "Mandazi na Chai ya Tangawizi", desc: "Mandazi za kienyeji na chai ya tangawizi", price: "TZS 18,000" },
      { name: "Omeleti ya Mboga", desc: "Mayai ya kienyeji na mboga safi za bustani", price: "TZS 22,000" },
    ],
  },
  {
    title: "Mlo wa Jioni / Dinner",
    items: [
      { name: "Mshikaki wa Ng'ombe", desc: "Mishikaki ya nyama iliyokolezwa viungo vya kienyeji", price: "TZS 45,000" },
      { name: "Wali wa Nazi na Samaki", desc: "Wali wa nazi na samaki wa kuchoma", price: "TZS 52,000" },
      { name: "Pilau ya Kuku", desc: "Pilau ya viungo na kuku wa kienyeji", price: "TZS 38,000" },
    ],
  },
];

const TOURS = [
  {
    name: "Safari ya Mapambazuko",
    meta: "Saa 5 • Asubuhi • Chai/kahawa ya porini",
    price: "TZS 320,000 / mtu",
    img: tourDrive,
    alt: "Gari la safari katika nyasi za Serengeti",
  },
  {
    name: "Puto la Hewa Moto",
    meta: "Saa 3 • Mtazamo wa angani • Champagne",
    price: "TZS 1,200,000 / mtu",
    img: tourBalloon,
    alt: "Puto la hewa moto juu ya Serengeti",
  },
  {
    name: "Sundowner Bush Walk",
    meta: "Saa 2 • Jioni • Mwongozaji wa Masai",
    price: "TZS 180,000 / mtu",
    img: tourDrive,
    alt: "Matembezi ya jioni porini",
  },
];
