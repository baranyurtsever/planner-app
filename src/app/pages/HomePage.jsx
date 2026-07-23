import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <section className="grid items-center gap-12 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-teal-700">
          Birlikte planla, kendin gibi gez
        </p>
        <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-slate-950 md:text-7xl">
          Bir sonraki yolculuğun, dağınık sekmelerden daha iyisini hak ediyor.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Planı ekibinle paylaş; harcamalarını ve hazırlıklarını kendi sınırlarında tut.
          Peregrin, ortak Geziyi ve kişisel tercihlerini birbirine karıştırmaz.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/register"
            className="rounded-full bg-teal-800 px-6 py-3 font-bold text-white shadow-lg shadow-teal-900/10 hover:bg-teal-900"
          >
            Ücretsiz başla
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 hover:border-teal-600"
          >
            Hesabım var
          </Link>
        </div>
      </div>
      <div className="relative rounded-[2rem] bg-teal-900 p-6 text-white shadow-2xl">
        <div className="rounded-2xl bg-white/10 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-200">Bangkok</p>
          <h2 className="mt-2 text-2xl font-bold">Bugünün planı</h2>
          {['08:30 · Wat Pho', '12:00 · Yaowarat', '18:45 · Chao Phraya'].map((item) => (
            <div key={item} className="mt-3 rounded-xl bg-white/10 px-4 py-3 text-sm">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-amber-300 p-4 text-slate-900">
            <p className="text-xs font-bold uppercase">Hazırlık</p>
            <p className="mt-4 text-3xl font-black">8/11</p>
          </div>
          <div className="rounded-2xl bg-rose-200 p-4 text-slate-900">
            <p className="text-xs font-bold uppercase">Bütçe</p>
            <p className="mt-4 text-3xl font-black">₺18K</p>
          </div>
        </div>
      </div>
    </section>
  )
}
