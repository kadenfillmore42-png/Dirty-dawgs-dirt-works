const services = [
  "Landscaping",
  "Hardscaping",
  "Excavation",
  "Site Preparation",
  "Hauling",
  "Grading & Drainage",
];

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    alt: "excavation work",
  },
  {
    src: "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0",
    alt: "grading site",
  },
  {
    src: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
    alt: "hardscaping patio",
  },
  {
    src: "https://images.unsplash.com/photo-1590725121839-892b458a74fe",
    alt: "landscaping work",
  },
  {
    src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd",
    alt: "driveway construction",
  },
  {
    src: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449",
    alt: "site prep equipment",
  },
];

export default function ExcavationHardscapingBusinessWebsite() {
  return (
    <main className="bg-gray-50 text-gray-900">
      <section
        className="bg-cover bg-center text-white"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1503387762-592deb58ef4e')",
        }}
      >
        <div className="bg-black/60">
          <div className="mx-auto max-w-6xl px-6 py-24 text-center">
            <h1 className="mb-4 text-5xl font-bold">Dirty Dawgs Dirt Works</h1>
            <p className="mb-4 text-xl">Built Tough. Done Right.</p>
            <p className="mb-6 text-lg">Free Estimates on All Projects</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:17193341624"
                className="rounded-xl bg-green-500 px-6 py-3 text-lg font-semibold text-white"
              >
                Call Now
              </a>
              <a
                href="mailto:dirtydawgsdirtwork@gmail.com"
                className="rounded-xl bg-white px-6 py-3 text-lg font-semibold text-black"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-4 text-center text-3xl font-semibold">Our Services</h2>
        <p className="mb-10 text-center text-lg">
          Free Estimates - Reliable Work - Local Experts
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service) => (
            <div key={service} className="rounded-2xl bg-white p-6 shadow">
              {service}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-4 text-center text-3xl font-semibold">
            Project Gallery
          </h2>
          <p className="mb-10 text-center text-lg">
            Real work. Real results. Free estimates on all projects.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {galleryImages.map((image) => (
              <img
                key={image.src}
                className="h-64 w-full rounded-2xl object-cover shadow"
                src={image.src}
                alt={image.alt}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-3xl font-semibold">Service Area</h2>
          <p className="text-lg">
            Proudly serving Pueblo West, Pueblo, and surrounding areas. Free
            Estimates Available.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-6 text-center text-3xl font-semibold">Find Us</h2>
        <div className="h-[400px] w-full overflow-hidden rounded-2xl shadow">
          <iframe
            src="https://maps.google.com/maps?q=Pueblo%20West%20Colorado&t=&z=12&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title="Dirty Dawgs Dirt Works service area map"
          />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="mb-8 text-center text-3xl font-semibold">Contact Us</h2>
        <p className="mb-8 text-center text-lg">
          Call today for your Free Estimate!
        </p>
        <div className="grid gap-6 text-center md:grid-cols-3">
          <div>
            <p className="font-semibold">Phone</p>
            <p>(719) 334-1624</p>
          </div>
          <div>
            <p className="font-semibold">Email</p>
            <p>dirtydawgsdirtwork@gmail.com</p>
          </div>
          <div>
            <p className="font-semibold">Location</p>
            <p>Pueblo West, CO</p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <a
            href="tel:17193341624"
            className="inline-block rounded-2xl bg-green-600 px-8 py-4 text-xl font-bold text-white shadow-lg"
          >
            Call Now - Free Estimate
          </a>
        </div>
      </section>

      <footer className="bg-gray-900 py-6 text-center text-white">
        <p>&copy; 2026 Dirty Dawgs Dirt Works. All rights reserved.</p>
      </footer>
    </main>
  );
}
