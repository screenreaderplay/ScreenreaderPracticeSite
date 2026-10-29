/* Wyvernway shared data and helpers. Every flight is invented. */
window.WYV = (function () {
  const airports = [
    { code: 'CML', name: 'Camelot' },
    { code: 'ATS', name: 'Atlantis' },
    { code: 'AVN', name: 'Avalon' },
    { code: 'ELD', name: 'El Dorado' },
    { code: 'SHG', name: 'Shangri-La' },
    { code: 'XAN', name: 'Xanadu' },
    { code: 'ASG', name: 'Asgard' },
    { code: 'OLY', name: 'Mount Olympus' },
    { code: 'LMR', name: 'Lemuria' },
    { code: 'HYB', name: 'Hy-Brasil' },
    { code: 'LYN', name: 'Lyonesse' },
    { code: 'THL', name: 'Thule' },
    { code: 'HPB', name: 'Hyperborea' },
    { code: 'SHB', name: 'Shambhala' },
    { code: 'VLH', name: 'Valhalla' }
  ];

  const airlines = [
    { code: 'PX', name: 'Phoenix Air', color: '#c2410c' },
    { code: 'KR', name: 'Kraken Airways', color: '#1d4ed8' },
    { code: 'GF', name: 'Griffin Air', color: '#a16207' },
    { code: 'WY', name: 'Wyrmline', color: '#047857' },
    { code: 'UN', name: 'Unicorn Air', color: '#7e22ce' },
    { code: 'RC', name: 'Roc Airlines', color: '#be123c' }
  ];

  const cabins = [
    { value: 'economy', label: 'Economy', mult: 1 },
    { value: 'premium', label: 'Premium economy', mult: 1.6 },
    { value: 'business', label: 'Business', mult: 2.8 },
    { value: 'first', label: 'First', mult: 4.2 }
  ];

  const extras = [
    { value: 'bag', label: 'Checked bag (23 kg)', price: 35 },
    { value: 'priority', label: 'Priority boarding', price: 12 },
    { value: 'insurance', label: 'Dragon-attack insurance', price: 8 }
  ];

  // Popular destinations (carousel). Image file names are deliberately unhelpful,
  // so version 3, which has no alt text, reads them out.
  const destinations = [
    { code: 'AVN', img: 'img/IMG_2041.svg', region: 'Isles of the West', price: 189,
      blurb: 'Mist-wrapped orchards and a lake that remembers kings.',
      alt: 'A small green island with a white tower, rising from a misty lake at dawn' },
    { code: 'ATS', img: 'img/IMG_2042.svg', region: 'The Sunken Sea', price: 264,
      blurb: 'Marble streets under a crystal dome, 40 fathoms down.',
      alt: 'A glass dome over white columns on the sea floor, with bubbles rising and light falling through the water' },
    { code: 'SHG', img: 'img/IMG_2043.svg', region: 'Kunlun Mountains', price: 312,
      blurb: 'A hidden valley where nobody is ever in a hurry.',
      alt: 'Snow-capped mountains above a green valley with a small red pagoda, under a warm evening sky' },
    { code: 'CML', img: 'img/IMG_2044.svg', region: 'Logres', price: 149,
      blurb: 'Round tables, long feasts and a castle on every hill.',
      alt: 'A grey stone castle with blue-roofed towers and a red flag, on a green hill under a clear sky' },
    { code: 'VLH', img: 'img/IMG_2045.svg', region: 'The Nine Realms', price: 399,
      blurb: 'A great hall of shields, under the northern lights.',
      alt: 'A long wooden hall hung with round shields on a snowy plain, under green and violet northern lights' }
  ];

  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function airport(code) { return airports.find(a => a.code === code); }
  function airportByName(name) {
    const n = (name || '').trim().toLowerCase();
    return airports.find(a => a.name.toLowerCase() === n || a.code.toLowerCase() === n || (a.name + ' (' + a.code + ')').toLowerCase() === n);
  }
  function cabin(value) { return cabins.find(c => c.value === value) || cabins[0]; }

  function flights(from, to, date, cabinValue) {
    const r = rng(hash(from + to + date));
    const mult = cabin(cabinValue).mult;
    const others = airports.filter(a => a.code !== from && a.code !== to);
    const list = [];
    for (let i = 0; i < 9; i++) {
      const al = airlines[Math.floor(r() * airlines.length)];
      const roll = r();
      const stops = roll < 0.4 ? 0 : roll < 0.8 ? 1 : 2;
      const dep = 6 * 60 + Math.floor((r() * 16 * 60) / 5) * 5;
      const dur = 70 + Math.floor((r() * 200) / 5) * 5 + stops * (80 + Math.floor((r() * 60) / 5) * 5);
      const via = [];
      for (let s = 0; s < stops; s++) via.push(others[Math.floor(r() * others.length)].name);
      const base = 49 + r() * 260 - stops * 25 + (dep < 8 * 60 ? -15 : 0);
      list.push({
        id: 'f' + i,
        airline: al,
        flightNo: al.code + ' ' + (100 + Math.floor(r() * 899)),
        dep: dep, arr: dep + dur, dur: dur, stops: stops, via: via,
        price: Math.max(39, Math.round(base * mult))
      });
    }
    return list;
  }

  // Cheapest fare on a given day, and whether that is a low, average or high price for the route
  function dayPrice(from, to, isoDate) {
    const base = 80 + (hash(from + to) % 140);
    const r = rng(hash(from + to + isoDate + 'day'))();
    const wd = parseISO(isoDate).getDay();
    const week = (wd === 5 || wd === 0) ? 1.18 : (wd === 2 || wd === 3) ? 0.86 : 1;
    const price = Math.round(base * (0.7 + r * 0.75) * week);
    const ratio = price / base;
    return { price: price, band: ratio < 0.92 ? 'low' : ratio > 1.25 ? 'high' : 'average' };
  }

  function sortFlights(list, mode) {
    const copy = list.slice();
    if (mode === 'cheapest') copy.sort((a, b) => a.price - b.price);
    else if (mode === 'fastest') copy.sort((a, b) => a.dur - b.dur);
    else copy.sort((a, b) => (a.price / 10 + a.dur / 6 + a.stops * 25) - (b.price / 10 + b.dur / 6 + b.stops * 25));
    return copy;
  }

  function filterFlights(list, f) {
    return list.filter(x =>
      f.stops.has(x.stops >= 2 ? '2' : String(x.stops)) &&
      f.airlines.has(x.airline.code) &&
      x.dep < f.before * 60);
  }

  function pad(n) { return String(n).padStart(2, '0'); }
  function fmtTime(m) { m = m % 1440; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
  function fmtDur(m) { return Math.floor(m / 60) + 'h ' + pad(m % 60) + 'm'; }
  function spokenDur(m) {
    const h = Math.floor(m / 60), mm = m % 60;
    return h + (h === 1 ? ' hour' : ' hours') + (mm ? ' ' + mm + ' minutes' : '');
  }
  function stopsText(f) { return f.stops === 0 ? 'Direct' : f.stops === 1 ? '1 stop' : f.stops + ' stops'; }
  function nextDay(f) { return f.arr >= 1440; }
  function beforeText(h) { return h >= 24 ? 'Any time' : 'Before ' + pad(h) + ':00'; }

  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseISO(s) { const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function addDays(d, n) { const c = new Date(d); c.setDate(c.getDate() + n); return c; }
  function today() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  const longFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const shortFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const monthFmt = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' });
  function fmtLong(s) { return longFmt.format(parseISO(s)); }
  function fmtShort(s) { return shortFmt.format(parseISO(s)); }
  function fmtMonth(d) { return monthFmt.format(d); }
  function money(n) { return '£' + n.toLocaleString('en-GB'); }

  function logo(al, withName) {
    const w = withName ? 150 : 40;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="40" viewBox="0 0 ' + w + ' 40">' +
      '<rect width="40" height="40" rx="10" fill="' + al.color + '"/>' +
      '<text x="20" y="26" font-family="Arial" font-size="15" font-weight="700" fill="#fff" text-anchor="middle">' + al.code + '</text>' +
      (withName ? '<text x="48" y="25" font-family="Arial" font-size="13" font-weight="700" fill="' + al.color + '">' + al.name + '</text>' : '') +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function bookingRef() { return 'WYV-' + (1000 + Math.floor(Math.random() * 9000)); }

  return {
    airports, airlines, cabins, extras, destinations, airport, airportByName, cabin, flights, dayPrice, sortFlights, filterFlights,
    fmtTime, fmtDur, spokenDur, stopsText, nextDay, beforeText, iso, parseISO, addDays, today,
    fmtLong, fmtShort, fmtMonth, money, logo, bookingRef
  };
})();
