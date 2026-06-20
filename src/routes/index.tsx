import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import heroImg from "@/assets/hero.jpg";
import roomSavannah from "@/assets/room-savannah.jpg";
import roomAcacia from "@/assets/room-acacia.jpg";
import tourDrive from "@/assets/tour-drive.jpg";
import tourBalloon from "@/assets/tour-balloon.jpg";
import foodMshikaki from "@/assets/food-mshikaki.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kizazi Safari Lodge — Serengeti, Tanzania" },
      {
        name: "description",
        content:
          "Luxury safari lodge in the Serengeti, Tanzania. Book rooms, order food and game drives directly via WhatsApp.",
      },
      { property: "og:title", content: "Kizazi Safari Lodge — Serengeti, Tanzania" },
      {
        property: "og:description",
        content:
          "Luxury tented suites, authentic cuisine and guided safaris. Booking via WhatsApp.",
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
          <a href="#rooms" className="hover:text-savannah transition-colors">Rooms</a>
          <a href="#book" className="hover:text-savannah transition-colors">Book</a>
          <a href="#menu" className="hover:text-savannah transition-colors">Dining</a>
          <a href="#tours" className="hover:text-savannah transition-colors">Safaris</a>
          <a href="#gallery" className="hover:text-savannah transition-colors">Gallery</a>
          <a href="#contact" className="hover:text-savannah transition-colors">Contact</a>
        </nav>
        <a
          href={`tel:+${WA}`}
          className="text-[10px] font-medium uppercase tracking-widest text-savannah"
        >
          +255 654 617 865
        </a>
      </header>

      {/* Hero */}
      <section className="relative h-[85vh] overflow-hidden bg-earth-900">
        <img
          src={heroImg}
          alt="Luxury canvas safari tents under an acacia tree at golden hour in the Serengeti"
          width={1280}
          height={1664}
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-earth-900 via-transparent to-transparent" />
        <div className="absolute bottom-12 px-6 max-w-2xl animate-fade-up">
          <span className="inline-block mb-3 px-2 py-1 bg-savannah text-white text-[10px] font-bold tracking-widest uppercase">
            Serengeti · Tanzania
          </span>
          <h1 className="text-5xl md:text-6xl font-display italic text-white mb-6 text-balance leading-[1.1]">
            Welcome to the heart of the wild.
          </h1>
          <a
            href={wa("Hello! I would like to enquire about a stay at Kizazi Safari Lodge.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-earth-900 px-8 py-4 rounded-full font-semibold transition-transform active:scale-95"
          >
            <span>Book Your Stay</span>
            <span className="text-xs font-normal opacity-50 italic border-l border-earth-900/20 pl-3">
              via WhatsApp
            </span>
          </a>
        </div>
      </section>

      {/* Rooms */}
      <section id="rooms" className="px-6 py-20 bg-white scroll-mt-20">
        <div className="mb-10 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display italic mb-2">Rooms & Suites</h2>
          <p className="text-earth-900/60 text-sm">Luxury tailored for the wild spirit.</p>
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
                  <span className="text-[10px] opacity-50">/night</span>
                </div>
              </div>
              <p className="text-sm text-earth-900/70 mb-4">{r.desc}</p>
              <a
                href={wa(`Hello, I would like to book the ${r.name}. Please share availability and details.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 border border-earth-900/10 text-center rounded-xl font-medium hover:bg-earth-900 hover:text-white transition-colors"
              >
                Book Room
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* Booking Form */}
      <section id="book" className="px-6 py-20 bg-earth-900 text-white scroll-mt-20">
        <div className="max-w-xl mx-auto">
          <span className="inline-block mb-3 px-2 py-1 bg-savannah text-white text-[10px] font-bold tracking-widest uppercase">
            Reservation
          </span>
          <h2 className="text-3xl md:text-4xl font-display italic mb-2">Book Your Stay</h2>
          <p className="text-white/60 text-sm mb-8">
            Fill in the details below and we'll continue the conversation on WhatsApp.
          </p>
          <BookingForm />
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="bg-sand-100 px-6 py-20 scroll-mt-20">

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display italic mb-2">Dining</h2>
          <p className="text-earth-900/50 text-xs uppercase tracking-widest font-medium">
            Cuisine of the Serengeti
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-earth-900/5">
          <img
            src={foodMshikaki}
            alt="Tanzanian-style grilled beef skewers"
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
            href={wa("Hello, I would like to place a food order. Please send the full menu and prices.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 flex items-center justify-center gap-2 bg-savannah hover:bg-savannah-dark text-white w-full py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors"
          >
            Order Food
          </a>
        </div>
      </section>

      {/* Tours */}
      <section id="tours" className="px-6 py-20 scroll-mt-20">
        <h2 className="text-3xl md:text-4xl font-display italic mb-10 text-center">
          Safaris & Excursions
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
                  href={wa(`Hello, I would like more information about the "${t.name}" safari.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto text-center text-xs font-bold uppercase tracking-widest py-3 border border-earth-900/10 rounded-xl hover:bg-earth-900 hover:text-white transition-colors"
                >
                  Enquire / Book
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="px-6 py-20 bg-white scroll-mt-20">
        <h2 className="text-3xl md:text-4xl font-display italic mb-10">Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-5xl">
          {[heroImg, roomSavannah, roomAcacia, tourDrive, tourBalloon, foodMshikaki].map(
            (src, i) => (
              <img
                key={i}
                src={src}
                alt={`Kizazi Lodge photo ${i + 1}`}
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
          <h2 className="text-3xl md:text-4xl font-display italic mb-6">Get in Touch</h2>
          <div className="space-y-4 text-white/70 text-sm mb-12">
            <p className="flex items-center gap-3">
              <span className="text-savannah font-mono">T:</span>
              <a href="tel:+255654617865" className="hover:text-white">
                +255 654 617 865
              </a>
            </p>
            <p className="flex items-center gap-3">
              <span className="text-savannah font-mono">W:</span>
              <a
                href={wa("Hello, I have a question about Kizazi Safari Lodge.")}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                Chat on WhatsApp
              </a>
            </p>
            <p className="flex items-center gap-3">
              <span className="text-savannah font-mono">A:</span> Serengeti National Park, Tanzania
            </p>
          </div>
          <div className="aspect-video bg-white/5 rounded-2xl grid place-items-center border border-white/10 mb-12 overflow-hidden">
            <iframe
              title="Kizazi Lodge location map"
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
        href={wa("Hello! I would like to book a stay at Kizazi Safari Lodge.")}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 right-6 z-50 md:left-auto md:right-6 md:w-auto md:px-8 flex items-center justify-center gap-3 bg-savannah hover:bg-savannah-dark text-white py-5 rounded-2xl shadow-xl shadow-savannah/20 transition-all active:scale-95"
      >
        <span className="font-bold uppercase tracking-widest text-xs">
          Book Now via WhatsApp
        </span>
      </a>
    </div>
  );
}

const ROOMS = [
  {
    name: "Savannah Suite",
    price: "TZS 850k",
    desc: "King-size bed, private deck overlooking the Grumeti River, and an outdoor rainfall shower.",
    img: roomSavannah,
    alt: "Interior of the luxury Savannah Suite tent",
  },
  {
    name: "Acacia Family Villa",
    price: "TZS 1.4M",
    desc: "Two bedrooms, private plunge pool and personal butler service. Sleeps four guests.",
    img: roomAcacia,
    alt: "Acacia Family Villa with thatched roof and savannah views",
  },
];

const MENU = [
  {
    title: "Breakfast",
    items: [
      { name: "Mandazi & Ginger Tea", desc: "Traditional East African doughnuts with spiced ginger tea", price: "TZS 18,000" },
      { name: "Garden Omelette", desc: "Free-range eggs with fresh herbs from our garden", price: "TZS 22,000" },
    ],
  },
  {
    title: "Dinner",
    items: [
      { name: "Mshikaki — Beef Skewers", desc: "Char-grilled beef skewers with local spices", price: "TZS 45,000" },
      { name: "Coconut Rice & Fish", desc: "Coconut rice with pan-seared river fish", price: "TZS 52,000" },
      { name: "Chicken Pilau", desc: "Aromatic spiced rice with free-range chicken", price: "TZS 38,000" },
    ],
  },
];

const TOURS = [
  {
    name: "Sunrise Game Drive",
    meta: "5 hours · Morning · Bush coffee & tea",
    price: "TZS 320,000 / person",
    img: tourDrive,
    alt: "Safari vehicle in the Serengeti grasslands",
  },
  {
    name: "Hot Air Balloon Safari",
    meta: "3 hours · Panoramic views · Champagne toast",
    price: "TZS 1,200,000 / person",
    img: tourBalloon,
    alt: "Hot air balloon over the Serengeti plains",
  },
  {
    name: "Sundowner Bush Walk",
    meta: "2 hours · Evening · Maasai guide",
    price: "TZS 180,000 / person",
    img: tourDrive,
    alt: "Guided sundowner bush walk",
  },
];

function BookingForm() {
  const [name, setName] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [room, setRoom] = useState("Savannah Suite");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = name.trim().slice(0, 80);
    if (!trimmedName) return setError("Please enter your full name.");
    if (!checkIn || !checkOut) return setError("Please choose your check-in and check-out dates.");
    if (new Date(checkOut) <= new Date(checkIn))
      return setError("Check-out must be after check-in.");
    if (guests < 1 || guests > 12) return setError("Number of guests must be between 1 and 12.");
    setError(null);

    const msg = [
      "Hello Kizazi Safari Lodge, I would like to make a booking:",
      `• Name: ${trimmedName}`,
      `• Room: ${room}`,
      `• Check-in: ${checkIn}`,
      `• Check-out: ${checkOut}`,
      `• Guests: ${guests}`,
      notes.trim() ? `• Notes: ${notes.trim().slice(0, 400)}` : null,
      "",
      "Please confirm availability. Asante!",
    ]
      .filter(Boolean)
      .join("\n");

    window.open(wa(msg), "_blank", "noopener,noreferrer");
  };

  const field =
    "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-savannah";
  const label = "block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="bf-name" className={label}>Full Name</label>
        <input
          id="bf-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          required
          autoComplete="name"
          placeholder="Jane Doe"
          className={field}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="bf-in" className={label}>Check-in</label>
          <input
            id="bf-in"
            type="date"
            value={checkIn}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setCheckIn(e.target.value)}
            required
            className={field}
          />
        </div>
        <div>
          <label htmlFor="bf-out" className={label}>Check-out</label>
          <input
            id="bf-out"
            type="date"
            value={checkOut}
            min={checkIn || new Date().toISOString().split("T")[0]}
            onChange={(e) => setCheckOut(e.target.value)}
            required
            className={field}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="bf-guests" className={label}>Guests</label>
          <input
            id="bf-guests"
            type="number"
            min={1}
            max={12}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            required
            className={field}
          />
        </div>
        <div>
          <label htmlFor="bf-room" className={label}>Room</label>
          <select
            id="bf-room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className={field}
          >
            <option className="text-earth-900">Savannah Suite</option>
            <option className="text-earth-900">Acacia Family Villa</option>
            <option className="text-earth-900">No preference</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="bf-notes" className={label}>Notes (optional)</label>
        <textarea
          id="bf-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={400}
          rows={3}
          placeholder="Dietary requirements, airport transfers, special occasions…"
          className={field}
        />
      </div>

      {error && (
        <p className="text-sm text-savannah" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full bg-savannah hover:bg-savannah-dark text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors active:scale-[0.99]"
      >
        Send Booking via WhatsApp
      </button>
      <p className="text-[10px] text-white/40 text-center">
        Opens WhatsApp with your details pre-filled — no payment online.
      </p>
    </form>
  );
}

