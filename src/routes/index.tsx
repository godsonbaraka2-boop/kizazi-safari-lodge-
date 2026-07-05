import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { LanguageSwitcher, useT } from "@/lib/i18n";
import { usePiAuth } from "@/lib/use-pi-auth";
import { usePiPayment } from "@/lib/use-pi-payment";
import heroImg from "@/assets/hero.jpg";
import roomSavannah from "@/assets/room-savannah.jpg";
import roomAcacia from "@/assets/room-acacia.jpg";
import tourDrive from "@/assets/tour-drive.jpg";
import tourBalloon from "@/assets/tour-balloon.jpg";
import foodMshikaki from "@/assets/food-mshikaki.jpg";
import facilitySpa from "@/assets/facility-spa.jpg";
import facilityPool from "@/assets/facility-pool.jpg";
import facilityDeck from "@/assets/facility-deck.jpg";
import facilityBoma from "@/assets/facility-boma.jpg";
import tourSafariVehicle from "@/assets/tour-safari-vehicle.jpg";
import cultureMaasai from "@/assets/culture-maasai.jpg";
import lodgeCoffeeWorkspace from "@/assets/lodge-coffee-workspace.jpg";
import foodMandazi from "@/assets/food/mandazi.jpg";
import foodChapatiBeans from "@/assets/food/chapati-beans.jpg";
import foodOmelette from "@/assets/food/omelette.jpg";
import foodPancakes from "@/assets/food/pancakes.jpg";
import foodFruitPlatter from "@/assets/food/fruit-platter.jpg";
import foodNyamaChoma from "@/assets/food/nyama-choma.jpg";
import foodPilau from "@/assets/food/pilau.jpg";
import foodCoconutFish from "@/assets/food/coconut-fish.jpg";
import foodUgaliSukuma from "@/assets/food/ugali-sukuma.jpg";
import foodPizza from "@/assets/food/pizza.jpg";
import foodBurger from "@/assets/food/burger.jpg";
import foodPasta from "@/assets/food/pasta.jpg";
import foodCaesar from "@/assets/food/caesar.jpg";
import foodVegCurry from "@/assets/food/veg-curry.jpg";
import foodCoffee from "@/assets/food/coffee.jpg";
import foodChai from "@/assets/food/chai.jpg";
import foodMangoJuice from "@/assets/food/mango-juice.jpg";
import foodBaobab from "@/assets/food/baobab.jpg";
import foodCocktail from "@/assets/food/cocktail.jpg";


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

// Pi Network pricing: Global Consensus Value (GCV) benchmark
const PI_GCV_USD = 314159;
const toPiAmount = (usd: number) =>
  Number((usd / PI_GCV_USD).toPrecision(3));
const toPi = (usd: number) =>
  `${toPiAmount(usd).toLocaleString("en-US", { maximumSignificantDigits: 3 })} π`;

function Index() {
  const { t } = useT();
  const { user: piUser, loading: piLoading, signIn: piSignIn, signOut: piSignOut } = usePiAuth();
  const { pay: piPay, paying: piPaying } = usePiPayment();
  const [payingRoom, setPayingRoom] = useState<string | null>(null);
  const [payingItem, setPayingItem] = useState<string | null>(null);

  const handleMenuPay = async (item: { name: string; piAmount: number }) => {
    setPayingItem(item.name);
    try {
      const res = await piPay({
        amount: item.piAmount,
        memo: `Kizazi Lodge — ${item.name}`,
        metadata: { kind: "food_order", item: item.name },
      });
      window.open(
        wa(
          `Hello, I just paid ${item.piAmount} π for "${item.name}" via Pi Network. Payment ID: ${res.paymentId}, txid: ${res.txid}. Please prepare my order.`,
        ),
        "_blank",
      );
    } catch {
      /* surfaced via hook */
    } finally {
      setPayingItem(null);
    }
  };


  const handleRoomPay = async (room: { name: string; piAmount: number }) => {
    setPayingRoom(room.name);
    try {
      const res = await piPay({
        amount: room.piAmount,
        memo: `Kizazi Lodge — ${room.name} (1 night)`,
        metadata: { kind: "room_booking", room: room.name },
      });
      window.open(
        wa(
          `Hello, I just paid ${room.piAmount} π for the ${room.name} via Pi Network. Payment ID: ${res.paymentId}, txid: ${res.txid}. Please confirm my booking.`,
        ),
        "_blank",
      );
    } catch {
      /* surfaced via hook error */
    } finally {
      setPayingRoom(null);
    }
  };
  return (
    <div className="min-h-screen bg-sand-50 text-earth-900 font-sans selection:bg-savannah/20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-sand-50/80 backdrop-blur-md border-b border-earth-900/5 px-6 py-4 flex justify-between items-center gap-4">
        <div className="text-xl font-bold tracking-tighter uppercase font-display italic">
          Kizazi Lodge
        </div>
        <nav className="hidden md:flex gap-6 text-xs font-medium uppercase tracking-widest">
          <a href="#rooms" className="hover:text-savannah transition-colors">{t("nav.rooms")}</a>
          <a href="#facilities" className="hover:text-savannah transition-colors">{t("nav.facilities")}</a>
          <a href="#book" className="hover:text-savannah transition-colors">{t("nav.book")}</a>
          <a href="#menu" className="hover:text-savannah transition-colors">{t("nav.dining")}</a>
          <a href="#tours" className="hover:text-savannah transition-colors">{t("nav.safaris")}</a>
          <a href="#culture" className="hover:text-savannah transition-colors">{t("nav.culture")}</a>
          <a href="#gallery" className="hover:text-savannah transition-colors">{t("nav.gallery")}</a>
          <a href="#contact" className="hover:text-savannah transition-colors">{t("nav.contact")}</a>
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {piUser ? (
            <button
              onClick={piSignOut}
              title={`Signed in as @${piUser.username} — click to sign out`}
              className="flex items-center gap-2 text-[11px] font-semibold text-savannah hover:opacity-80 transition-opacity"
            >
              <span className="w-7 h-7 rounded-full bg-savannah text-sand-50 flex items-center justify-center text-[11px] font-bold uppercase">
                {piUser.username.slice(0, 2)}
              </span>
              <span className="hidden sm:inline">@{piUser.username}</span>
            </button>
          ) : (
            <button
              onClick={() => void piSignIn()}
              disabled={piLoading}
              className="text-[10px] font-medium uppercase tracking-widest text-sand-50 bg-savannah rounded-full px-3 py-1.5 hover:bg-savannah/90 transition-colors disabled:opacity-60"
            >
              {piLoading ? t("header.connecting") : t("header.signIn")}
            </button>
          )}
        </div>
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
            {t("hero.badge")}
          </span>
          <h1 className="text-5xl md:text-6xl font-display italic text-white mb-4 text-balance leading-[1.1]">
            {t("hero.title")}
          </h1>
          <p className="text-white/70 text-sm mb-6">
            {t("hero.subtitle")}
          </p>
          <a
            href={wa("Hello! I would like to enquire about a stay at Kizazi Safari Lodge.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-earth-900 px-8 py-4 rounded-full font-semibold transition-transform active:scale-95"
          >
            <span>{t("hero.book")}</span>
            <span className="text-xs font-normal opacity-50 italic border-l border-earth-900/20 pl-3">
              {t("hero.viaWa")}
            </span>
          </a>

        </div>
      </section>

      {/* Rooms */}
      <section id="rooms" className="px-6 py-20 bg-white scroll-mt-20">
        <div className="mb-10 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display italic mb-2">{t("rooms.title")}</h2>
          <p className="text-earth-900/60 text-sm">{t("rooms.subtitle")}</p>
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
                  {r.price}{" "}
                  <span className="text-[10px] opacity-50">/{t("rooms.night")}</span>
                </div>

              </div>
              <p className="text-sm text-earth-900/70 mb-4">{r.desc}</p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={wa(`Hello, I would like to book the ${r.name}. Please share availability and details.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-4 border border-earth-900/10 text-center rounded-xl font-medium text-sm hover:bg-earth-900 hover:text-white transition-colors"
                >
                  {t("rooms.enquire")}

                </a>
                <button
                  type="button"
                  onClick={() => void handleRoomPay(r)}
                  disabled={piPaying && payingRoom === r.name}
                  className="py-4 rounded-xl font-medium text-sm bg-savannah text-white hover:bg-savannah/90 transition-colors disabled:opacity-60"
                >
                  {piPaying && payingRoom === r.name ? "…" : `${t("rooms.pay")} ${r.piAmount} π`}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Facilities / Attractions */}
      <section id="facilities" className="bg-sand-100 px-6 py-20 scroll-mt-20">
        <div className="mb-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display italic mb-2">{t("facilities.title")}</h2>
          <p className="text-earth-900/60 text-sm">{t("facilities.subtitle")}</p>
        </div>


        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FACILITIES.map((f) => (
            <article key={f.name} className="bg-white rounded-2xl overflow-hidden border border-earth-900/5 flex flex-col group">
              <img
                src={f.img}
                alt={f.alt}
                loading="lazy"
                width={1024}
                height={1280}
                className="w-full aspect-[4/5] object-cover bg-sand-100 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-sm mb-1">{f.name}</h3>
                <p className="text-xs text-earth-900/60 mb-4 flex-1">{f.desc}</p>
                <a
                  href={wa(`Hello, I am interested in the ${f.name}. Please share more details.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center text-[10px] font-bold uppercase tracking-widest py-3 border border-earth-900/10 rounded-xl hover:bg-earth-900 hover:text-white transition-colors"
                >
                  {t("rooms.enquire")}

                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="book" className="px-6 py-20 bg-earth-900 text-white scroll-mt-20">
        <div className="max-w-xl mx-auto">
          <span className="inline-block mb-3 px-2 py-1 bg-savannah text-white text-[10px] font-bold tracking-widest uppercase">
            {t("book.badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-display italic mb-2">{t("book.title")}</h2>
          <p className="text-white/60 text-sm mb-8">
            {t("book.subtitle")}
          </p>

          <BookingForm />
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="bg-sand-100 px-6 py-20 scroll-mt-20">

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display italic mb-2">{t("menu.title")}</h2>
          <p className="text-earth-900/50 text-xs uppercase tracking-widest font-medium">
            {t("menu.subtitle")}
          </p>
        </div>


        <div className="max-w-5xl mx-auto">
          {MENU.map((section) => (
            <div key={section.titleKey} className="mb-12 last:mb-0">
              <h4 className="text-savannah font-bold text-[11px] tracking-widest uppercase mb-5 text-center">
                {t(section.titleKey)}
              </h4>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {section.items.map((item) => (
                  <article
                    key={item.name}
                    className="bg-white rounded-2xl overflow-hidden border border-earth-900/5 flex flex-col"
                  >
                    <img
                      src={item.img}
                      alt={item.name}
                      loading="lazy"
                      width={1024}
                      height={768}
                      className="w-full aspect-[4/3] object-cover bg-sand-100"
                    />
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between items-start gap-3 mb-1">
                        <p className="font-bold text-sm leading-tight">{item.name}</p>
                        <span className="font-mono text-xs whitespace-nowrap text-savannah font-bold">
                          {item.price}
                        </span>
                      </div>
                      <p className="text-xs text-earth-900/60 mb-4 flex-1">{item.desc}</p>
                      <button
                        type="button"
                        onClick={() => void handleMenuPay(item)}
                        disabled={piPaying && payingItem === item.name}
                        className="mt-auto w-full py-3 rounded-xl font-bold uppercase text-[11px] tracking-widest bg-savannah text-white hover:bg-savannah/90 transition-colors disabled:opacity-60"
                      >
                        {piPaying && payingItem === item.name
                          ? "…"
                          : `${t("rooms.pay")} ${item.piAmount} π`}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
          <a
            href={wa("Hello, I would like to place a food order. Please send the full menu and prices.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 flex items-center justify-center gap-2 bg-earth-900 hover:bg-earth-900/90 text-white max-w-md mx-auto py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors"
          >
            {t("menu.order")}
          </a>
        </div>
      </section>


      {/* Tours */}
      <section id="tours" className="px-6 py-20 scroll-mt-20">
        <h2 className="text-3xl md:text-4xl font-display italic mb-10 text-center">
          {t("tours.title")}
        </h2>
        <div className="flex overflow-x-auto gap-4 -mx-6 px-6 pb-6 no-scrollbar snap-x snap-mandatory">
          {TOURS.map((tour) => (
            <article
              key={tour.name}
              className="min-w-[280px] sm:min-w-[320px] bg-white rounded-2xl overflow-hidden border border-earth-900/5 snap-start flex flex-col"
            >
              <img
                src={tour.img}
                alt={tour.alt}
                loading="lazy"
                width={800}
                height={544}
                className="w-full aspect-video object-cover bg-sand-100"
              />
              <div className="p-6 flex flex-col flex-1">
                <h4 className="font-bold mb-2">{tour.name}</h4>
                <p className="text-xs text-earth-900/60 mb-4">{tour.meta}</p>
                <p className="font-mono text-savannah text-sm mb-4">{tour.price}</p>
                <a
                  href={wa(`Hello, I would like more information about the "${tour.name}" safari.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto text-center text-xs font-bold uppercase tracking-widest py-3 border border-earth-900/10 rounded-xl hover:bg-earth-900 hover:text-white transition-colors"
                >
                  {t("tours.enquire")}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Culture & Remote Work */}
      <section id="culture" className="bg-sand-100 px-6 py-20 scroll-mt-20">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display italic mb-2">{t("culture.title")}</h2>
          <p className="text-earth-900/60 text-sm max-w-xl mx-auto">{t("culture.subtitle")}</p>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          <article className="group relative overflow-hidden rounded-3xl bg-earth-900">
            <img
              src={cultureMaasai}
              alt="Maasai elders in traditional red shuka robes and beaded jewelry at sunset"
              loading="lazy"
              width={1280}
              height={832}
              className="w-full aspect-[4/3] object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-earth-900 via-earth-900/60 to-transparent p-6 pt-16">
              <span className="text-[10px] uppercase tracking-widest text-savannah font-bold">
                Maasai Heritage
              </span>
              <h3 className="text-white font-display italic text-2xl mt-1">
                Traditional Boma Experience
              </h3>
            </div>
          </article>
          <article className="group relative overflow-hidden rounded-3xl bg-earth-900">
            <img
              src={lodgeCoffeeWorkspace}
              alt="Tourists with laptops and a steaming coffee cup on a wooden deck overlooking the savannah"
              loading="lazy"
              width={1280}
              height={832}
              className="w-full aspect-[4/3] object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-earth-900 via-earth-900/60 to-transparent p-6 pt-16">
              <span className="text-[10px] uppercase tracking-widest text-savannah font-bold">
                Coffee · Wi-Fi · Wild Views
              </span>
              <h3 className="text-white font-display italic text-2xl mt-1">
                Work Remotely from the Savannah
              </h3>
            </div>
          </article>
        </div>
      </section>


      {/* Gallery */}
      <section id="gallery" className="px-6 py-20 bg-white scroll-mt-20">
        <h2 className="text-3xl md:text-4xl font-display italic mb-10">{t("gallery.title")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-5xl">
          {[heroImg, cultureMaasai, roomSavannah, lodgeCoffeeWorkspace, tourSafariVehicle, roomAcacia, facilitySpa, facilityPool, tourDrive, facilityDeck, facilityBoma, tourBalloon, foodMshikaki].map(

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

      {/* Need Help */}
      <section id="help" className="bg-sand-100 px-6 py-16 scroll-mt-20">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-earth-900/5 p-8 text-center">
          <h3 className="text-2xl font-display italic mb-2">{t("help.title")}</h3>
          <p className="text-earth-900/60 text-sm mb-6">
            {t("help.subtitle")}
          </p>

          <div className="space-y-2 text-sm">
            <p>
              <span className="text-savannah font-mono mr-2">E:</span>
              <a href="mailto:godsonbaraka2@gmail.com" className="underline hover:text-savannah">
                godsonbaraka2@gmail.com
              </a>
            </p>
            <p>
              <span className="text-savannah font-mono mr-2">P/WA:</span>
              <a href="tel:+255654617865" className="underline hover:text-savannah">
                +255 654 617 865
              </a>
            </p>
            <p className="text-earth-900/60 text-xs mt-4">
              Location: Northern Corridor, Arusha, Tanzania
            </p>
          </div>
        </div>
      </section>

      {/* Pi Integration Status */}
      <section id="pi-status" className="bg-white px-6 py-16 scroll-mt-20">
        <div className="max-w-2xl mx-auto rounded-3xl border border-earth-900/10 p-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs uppercase tracking-widest text-earth-900/60">Pi Integration Status</span>
          </div>
          <h3 className="text-2xl font-display italic mb-6">
            Configured for Vercel Deployment
          </h3>
          <p className="text-sm text-earth-900/60 mb-6">
            These are the official URLs registered for this app in the Pi Developer Portal.
          </p>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-earth-900/50 uppercase text-xs tracking-widest mb-1">Production URL</dt>
              <dd className="break-all">
                <a
                  href="https://kizazilodgeuqc0446.pinet.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-savannah"
                >
                  https://kizazilodgeuqc0446.pinet.com
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-earth-900/50 uppercase text-xs tracking-widest mb-1">Repository</dt>
              <dd className="break-all">
                <a
                  href="https://github.com/godsonbaraka2-boop/kizazi-safari-lodge-"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-savannah"
                >
                  github.com/godsonbaraka2-boop/kizazi-safari-lodge-
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-earth-900/50 uppercase text-xs tracking-widest mb-1">Privacy Policy</dt>
              <dd className="break-all">
                <a
                  href="https://kizazilodgeuqc0446.pinet.com/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-savannah"
                >
                  https://kizazilodgeuqc0446.pinet.com/privacy-policy
                </a>
              </dd>
            </div>

            <div>
              <dt className="text-earth-900/50 uppercase text-xs tracking-widest mb-1">Developer Contact</dt>
              <dd>
                <a href="mailto:godsonbaraka2@gmail.com" className="underline hover:text-savannah">
                  godsonbaraka2@gmail.com
                </a>
                {" · "}
                <a href="tel:+255654617865" className="underline hover:text-savannah">
                  +255 654 617 865
                </a>
              </dd>
            </div>
          </dl>
          <p className="text-xs text-earth-900/50 mt-6">
            Payments are processed via the Pi SDK. API keys are stored securely server-side.
          </p>
        </div>
      </section>

      {/* Contact / Footer */}
      <footer id="contact" className="bg-earth-900 text-white px-6 pt-20 pb-20 scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display italic mb-6">{t("contact.title")}</h2>
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
              <span className="text-savannah font-mono">A:</span> Northern Corridor, Arusha, Tanzania
            </p>
          </div>

          <div className="border-t border-white/10 pt-10 mb-10">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-white/80">Contact Developer</h3>
            <div className="space-y-2 text-sm text-white/70">
              <p className="flex items-center gap-3">
                <span className="text-savannah font-mono">E:</span>
                <a href="mailto:godsonbaraka2@gmail.com" className="hover:text-white">
                  godsonbaraka2@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-savannah font-mono">P/WA:</span>
                <a href="tel:+255654617865" className="hover:text-white">
                  +255 654 617 865
                </a>
              </p>
            </div>
          </div>

          <div className="aspect-video bg-white/5 rounded-2xl grid place-items-center border border-white/10 mb-12 overflow-hidden">
            <iframe
              title="Kizazi Lodge location map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=34.5%2C-2.7%2C35.3%2C-2.1&layer=mapnik"
              className="w-full h-full"
              loading="lazy"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-[10px] text-white/30 tracking-widest uppercase border-t border-white/10 pt-8">
            <p>© {new Date().getFullYear()} Kizazi Safari Lodge · Tanzania</p>
            <span className="hidden sm:inline">·</span>
            <a
              href="https://github.com/godsonbaraka2-boop/kizazi-safari-lodge-"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/60 transition-colors"
            >
              Source code managed on Lovable platform
            </a>
            <span className="hidden sm:inline">·</span>
            <Link to="/privacy-policy" className="hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const ROOMS = [
  {
    name: "Savannah Suite",
    price: toPi(330),
    piAmount: toPiAmount(330),
    desc: "King-size bed, private deck overlooking the Grumeti River, and an outdoor rainfall shower.",
    img: roomSavannah,
    alt: "Interior of the luxury Savannah Suite tent",
  },
  {
    name: "Acacia Family Villa",
    price: toPi(543),
    piAmount: toPiAmount(543),
    desc: "Two bedrooms, private plunge pool and personal butler service. Sleeps four guests.",
    img: roomAcacia,
    alt: "Acacia Family Villa with thatched roof and savannah views",
  },
];

type MenuItem = {
  name: string;
  desc: string;
  usd: number;
  img: string;
};

const menuItem = (
  name: string,
  desc: string,
  usd: number,
  img: string,
): MenuItem & { price: string; piAmount: number } => ({
  name,
  desc,
  usd,
  img,
  price: toPi(usd),
  piAmount: toPiAmount(usd),
});

const MENU = [
  {
    titleKey: "menu.breakfast",
    items: [
      menuItem("Mandazi & Ginger Tea", "East African doughnuts with spiced ginger tea", 7, foodMandazi),
      menuItem("Chapati & Beans", "Warm Swahili flatbread with slow-cooked coconut beans", 6, foodChapatiBeans),
      menuItem("Garden Omelette", "Free-range eggs, tomato, onion and fresh garden herbs", 8.5, foodOmelette),
      menuItem("Continental Pancakes", "Fluffy pancakes, honey, banana and passion fruit", 10, foodPancakes),
      menuItem("Fresh Tropical Fruit Platter", "Mango, pineapple, papaya, watermelon", 9, foodFruitPlatter),
    ],
  },
  {
    titleKey: "menu.tanzanian",
    items: [
      menuItem("Nyama Choma & Ugali", "Char-grilled beef with maize ugali, kachumbari salad", 22, foodNyamaChoma),
      menuItem("Mshikaki — Beef Skewers", "Char-grilled marinated beef skewers with pili-pili sauce", 17.5, foodMshikaki),
      menuItem("Chicken Pilau", "Aromatic spiced rice with free-range chicken and cloves", 15, foodPilau),
      menuItem("Coconut Fish Curry", "Pan-seared river fish in creamy coconut curry, coconut rice", 20, foodCoconutFish),
      menuItem("Ugali & Sukuma Wiki", "Maize ugali with sautéed collard greens, a Tanzanian classic", 10, foodUgaliSukuma),
    ],
  },
  {
    titleKey: "menu.international",
    items: [
      menuItem("Wood-fired Margherita Pizza", "San Marzano tomato, mozzarella, fresh basil", 16, foodPizza),
      menuItem("Serengeti Beef Burger & Fries", "Grass-fed beef, cheddar, caramelised onion, hand-cut fries", 18, foodBurger),
      menuItem("Grilled Chicken Pasta", "Penne, grilled chicken, sun-dried tomato in creamy pesto", 17, foodPasta),
      menuItem("Caesar Salad", "Crisp romaine, parmesan, croutons, house Caesar dressing", 12, foodCaesar),
      menuItem("Vegetable Curry & Rice", "Seasonal vegetable coconut curry with basmati rice", 13, foodVegCurry),
    ],
  },
  {
    titleKey: "menu.drinks",
    items: [
      menuItem("Kilimanjaro Single-Origin Coffee", "Freshly brewed Tanzanian arabica, served in a copper pot", 5, foodCoffee),
      menuItem("Spiced African Chai", "Black tea steeped with cardamom, cinnamon and ginger", 4, foodChai),
      menuItem("Fresh Mango & Passion Juice", "Cold-pressed, no added sugar", 6, foodMangoJuice),
      menuItem("Baobab Smoothie", "Baobab superfruit, banana and honey", 7, foodBaobab),
      menuItem("Serengeti Sundowner Cocktail", "Rum, hibiscus, ginger, fresh lime — a signature at dusk", 12, foodCocktail),
    ],
  },
];


const TOURS = [
  {
    name: "Sunrise Game Drive",
    meta: "5 hours · Morning · Bush coffee & tea",
    price: `${toPi(124)} / person`,
    piAmount: toPiAmount(124),
    img: tourSafariVehicle,
    alt: "Tourists on a green safari 4x4 photographing giraffes at sunrise",
  },
  {
    name: "Hot Air Balloon Safari",
    meta: "3 hours · Panoramic views · Champagne toast",
    price: `${toPi(465)} / person`,
    piAmount: toPiAmount(465),
    img: tourBalloon,
    alt: "Hot air balloon over the Serengeti plains",
  },
  {
    name: "Sundowner Bush Walk",
    meta: "2 hours · Evening · Maasai guide",
    price: `${toPi(70)} / person`,
    piAmount: toPiAmount(70),
    img: tourDrive,
    alt: "Guided sundowner bush walk",
  },
  {
    name: "Maasai Cultural Visit",
    meta: "3 hours · Traditional boma · Beadwork & song",
    price: `${toPi(55)} / person`,
    piAmount: toPiAmount(55),
    img: cultureMaasai,
    alt: "Maasai elders in traditional attire at a boma",
  },
];



const FACILITIES = [
  {
    name: "Bush Spa & Wellness",
    desc: "Open-air massages, herbal treatments and a calm deck overlooking the wild.",
    img: facilitySpa,
    alt: "Open-air safari lodge spa deck with savannah views",
  },
  {
    name: "Infinity Pool",
    desc: "Cool off in a pool that seems to merge into the endless Serengeti plains.",
    img: facilityPool,
    alt: "Infinity pool overlooking the Serengeti at sunset",
  },
  {
    name: "Sundowner Deck",
    desc: "An elevated timber deck to watch herds, sunsets and the big cats after dusk.",
    img: facilityDeck,
    alt: "Elevated safari lodge deck overlooking the savannah",
  },
  {
    name: "Maasai Cultural Boma",
    desc: "Experience Maasai song, beadwork and stories around a traditional fire circle.",
    img: facilityBoma,
    alt: "Traditional Maasai cultural boma at the lodge",
  },
];

const PI_PER_NIGHT = 0.00105;

function BookingForm() {
  const { pay: piPay, paying, error: piError } = usePiPayment();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(""); // digits only, no +255
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [room, setRoom] = useState("Savannah Suite");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const n = Math.round(ms / 86400000);
    return n > 0 ? n : 0;
  })();

  const total = +(nights * PI_PER_NIGHT).toFixed(5);

  const makeCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let s = "";
    for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return `KIZ-${s}`;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = name.trim().slice(0, 80);
    const digits = phone.replace(/\D/g, "");
    if (!trimmedName) return setError("Please enter your full name.");
    if (digits.length !== 9) return setError("Phone number must be 9 digits after +255.");
    if (!checkIn || !checkOut) return setError("Please choose your check-in and check-out dates.");
    if (nights < 1) return setError("Check-out must be after check-in.");
    if (guests < 1 || guests > 12) return setError("Number of guests must be between 1 and 12.");
    setError(null);

    const fullPhone = `+255${digits}`;
    const amount = total > 0 ? total : PI_PER_NIGHT;
    try {
      await piPay({
        amount,
        memo: `Kizazi Lodge — ${room} (${nights} night${nights > 1 ? "s" : ""})`,
        metadata: {
          kind: "room_booking_form",
          room,
          name: trimmedName,
          phone: fullPhone,
          checkIn,
          checkOut,
          guests,
          nights,
        },
      });
      setConfirmation(makeCode());
    } catch {
      /* error surfaced via piError */
    }
  };

  const field =
    "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-savannah";
  const label = "block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2";

  if (confirmation) {
    const waMsg =
      `*NEW BOOKING — KIZAZI SAFARI LODGE*\n\n` +
      `Confirmation Code: ${confirmation}\n` +
      `Guest Name: ${name}\n` +
      `Phone: +255${phone}\n` +
      `Room: ${room}\n` +
      `Check-in: ${checkIn}\n` +
      `Check-out: ${checkOut}\n` +
      `Nights: ${nights}\n` +
      `Guests: ${guests}\n` +
      `Total Paid: ${total} π\n\n` +
      `Payment completed via Pi Network. Please confirm my reservation.`;
    return (
      <div className="bg-white/5 border border-white/15 rounded-2xl p-8 text-center space-y-4">
        <div className="text-4xl">🎉</div>
        <h3 className="text-2xl font-display italic text-white">Booking Confirmed!</h3>
        <p className="text-white/70 text-sm">Your confirmation code:</p>
        <p className="text-2xl font-mono font-bold text-purple-300 tracking-widest">
          {confirmation}
        </p>
        <p className="text-white/50 text-xs">
          Keep this code safe. We'll be in touch on +255{phone.replace(/\D/g, "")} shortly.
        </p>
        <a
          href={wa(waMsg)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full bg-[#25D366] hover:bg-[#1ebe57] text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors"
        >
          NITUMIE WHATSAPP
        </a>
      </div>
    );
  }


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
          <label htmlFor="bf-in" className={label}>📅 Check-in</label>
          <input
            id="bf-in"
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            required
            aria-label="Select check-in date"
            placeholder="Select check-in date"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="bf-out" className={label}>📅 Check-out</label>
          <input
            id="bf-out"
            type="date"
            value={checkOut}
            min={checkIn || today}
            onChange={(e) => setCheckOut(e.target.value)}
            required
            aria-label="Select check-out date"
            placeholder="Select check-out date"
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
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="bf-phone" className={label}>Phone Number</label>
        <div className="flex items-stretch rounded-xl overflow-hidden border border-white/15 focus-within:border-savannah bg-white">
          <span className="px-3 flex items-center text-sm font-semibold text-earth-900 bg-sand-100 border-r border-white/15 select-none">
            +255
          </span>
          <input
            id="bf-phone"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
            required
            autoComplete="tel-national"
            pattern="[0-9]{9}"
            maxLength={9}
            className="flex-1 bg-white px-3 py-3 text-sm text-earth-900 focus:outline-none"
          />
        </div>
        <p className="mt-1 text-[10px] text-white/40">9 digits after +255 (e.g. 712345678)</p>
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

      {/* Booking Summary */}
      <div className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-center">
        {nights > 0 ? (
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            GUESTS: <span className="text-white">{guests}</span>
            <span className="text-white/30 mx-2">|</span>
            NIGHTS: <span className="text-white">{nights}</span>
            <span className="text-white/30 mx-2">|</span>
            TOTAL: <span className="text-purple-300">{total} π</span>
          </p>
        ) : (
          <p className="text-xs font-medium text-white/60 italic">
            Please select your dates
          </p>
        )}
      </div>

      {(error || piError) && (
        <p className="text-sm text-red-300" role="alert">
          {error ?? piError}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={paying}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors active:scale-[0.99]"
        >
          {paying ? "Processing payment…" : `PAY WITH PI — ${PI_PER_NIGHT} π`}
        </button>
        <p className="mt-2 text-[11px] text-white/50 text-center">
          Per night - {room}. Total will be shown after selecting your dates.
        </p>
      </div>
    </form>
  );
}


