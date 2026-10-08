const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Campaign = require('../models/Campaign');
const CarouselSlide = require('../models/CarouselSlide');
const ContentPage = require('../models/ContentPage');
const Blog = require('../models/Blog');
const WelcomeOffer = require('../models/WelcomeOffer');
const PaymentSettings = require('../models/PaymentSettings');
const SiteSetting = require('../models/SiteSetting');
const Enquiry = require('../models/Enquiry');

const seedTruckData = async () => {
  console.log('🚛 Seeding Full Aurex Heavy Truck Parts domain data...');

  // ==========================================
  // 1. BRANDS
  // ==========================================
  const brandsData = [
    { name: 'Beauway', type: 'PARTS_MANUFACTURER', originCountry: 'Australia/Global', description: 'Specialist hydraulic tail lifts and power units for commercial transport.' },
    { name: 'Ganland', type: 'PARTS_MANUFACTURER', originCountry: 'Australia/Global', description: 'Heavy-duty truck and trailer door gear, hinges, load restraint tracks, and vehicle accessories.' },
    { name: 'Caiyuan', type: 'PARTS_MANUFACTURER', originCountry: 'Australia/Global', description: 'Stainless steel hardware, side door hinges, polished paddle latches, and structural trailer components.' },
    { name: 'Aurex', type: 'PARTS_MANUFACTURER', originCountry: 'Australia', description: 'Australia’s heavy commercial vehicle parts and truck body specialist.' },
    { name: 'Cummins', type: 'PARTS_MANUFACTURER', originCountry: 'USA', description: 'World-leading heavy diesel engines, turbochargers, and filtration components.' },
    { name: 'Kenworth', type: 'TRUCK_MANUFACTURER', originCountry: 'USA/Australia', description: 'The World’s Best heavy-duty commercial transport trucks.' },
    { name: 'Volvo Trucks', type: 'TRUCK_MANUFACTURER', originCountry: 'Sweden', description: 'Pioneering heavy commercial transport, powertrains, and safety.' },
    { name: 'Mack Trucks', type: 'TRUCK_MANUFACTURER', originCountry: 'USA/Australia', description: 'Born ready heavy-duty vocational and highway prime movers.' },
    { name: 'Freightliner', type: 'TRUCK_MANUFACTURER', originCountry: 'USA', description: 'Leading North American commercial truck manufacturer.' },
    { name: 'Meritor', type: 'PARTS_MANUFACTURER', originCountry: 'USA', description: 'Global supplier of heavy truck drivetrains, brakes, and axles.' },
    { name: 'Bendix', type: 'PARTS_MANUFACTURER', originCountry: 'USA', description: 'Pioneering active safety, air brakes, and air charging solutions.' },
    { name: 'Eaton Fuller', type: 'PARTS_MANUFACTURER', originCountry: 'USA', description: 'Industry benchmark heavy-duty manual and automated transmissions.' },
    { name: 'Hendrickson', type: 'PARTS_MANUFACTURER', originCountry: 'USA', description: 'Leading manufacturer of heavy-duty truck and trailer suspensions.' },
    { name: 'Fleetguard', type: 'PARTS_MANUFACTURER', originCountry: 'USA', description: 'Advanced filtration systems, lube filters, fuel-water separators.' }
  ];

  const createdBrands = {};
  for (const b of brandsData) {
    let brand = await Brand.findOne({ name: b.name });
    if (!brand) {
      brand = await Brand.create(b);
    } else {
      Object.assign(brand, b);
      await brand.save();
    }
    createdBrands[b.name] = brand;
  }
  console.log(`✅ ${Object.keys(createdBrands).length} Brands ready.`);

  // ==========================================
  // 2. CATEGORIES
  // ==========================================
  const categoriesData = [
    {
      name: 'Tail Lifts',
      slug: 'tail-lifts',
      code: 'TL',
      tag: 'Built to order',
      blurb: 'Sized for Aussie bodies. 1.5T to 3T aluminium and steel, 24V, full kit included.',
      description: 'Sized for Aussie bodies. 1.5T to 3T aluminium and steel, 24V, full kit included.',
      icon: 'truck',
      image: { url: '/images/TAIL-LIFTS-CAT.jpg', publicId: 'cat_tail_lifts' },
      sortOrder: 1,
      isFeatured: true
    },
    {
      name: 'Trailer Parts',
      slug: 'trailer-parts',
      code: 'TRL',
      tag: 'Enquiry only',
      blurb: 'Door gear, hinges, tracks, canvas stands and columns. Call for fitment and price.',
      description: 'Door gear, hinges, tracks, canvas stands and columns. Call for fitment and price.',
      icon: 'disc',
      image: { url: '/images/TRAILER-PARTS-CAT.jpg', publicId: 'cat_trailer_parts' },
      sortOrder: 2,
      isFeatured: true
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      code: 'ACC',
      tag: 'VIC stock',
      blurb: 'Bars, buffers, bolts, boxes, handles and fittings for bodies and trailers.',
      description: 'Bars, buffers, bolts, boxes, handles and fittings for bodies and trailers.',
      icon: 'tool',
      image: { url: '/images/ACCESSORIES-CAT.jpg', publicId: 'cat_accessories' },
      sortOrder: 3,
      isFeatured: true
    },
    {
      name: 'Engine & Powertrain',
      slug: 'engine-powertrain',
      code: 'ENG',
      tag: 'OEM Spec',
      blurb: 'Turbochargers, fuel injectors, water pumps, pistons, EGR valves, and overhaul kits.',
      description: 'Turbochargers, fuel injectors, water pumps, pistons, EGR valves, and overhaul kits.',
      icon: 'engine',
      sortOrder: 4,
      isFeatured: false
    },
    {
      name: 'Brakes & Wheel Ends',
      slug: 'brakes-wheel-ends',
      code: 'BRK',
      tag: 'ADR Approved',
      blurb: 'Air brake valves, brake shoes, drums, rotors, calipers, slack adjusters, and wheel hubs.',
      description: 'Air brake valves, brake shoes, drums, rotors, calipers, slack adjusters, and wheel hubs.',
      icon: 'disc',
      sortOrder: 5,
      isFeatured: false
    },
    {
      name: 'Suspension & Steering',
      slug: 'suspension-steering',
      code: 'SUS',
      tag: 'Heavy Duty',
      blurb: 'Air springs/bellows, shock absorbers, leaf springs, tie rods, drag links, and king pin sets.',
      description: 'Air springs/bellows, shock absorbers, leaf springs, tie rods, drag links, and king pin sets.',
      icon: 'move',
      sortOrder: 6,
      isFeatured: false
    }
  ];

  const createdCategories = {};
  for (const c of categoriesData) {
    let cat = await Category.findOne({ slug: c.slug });
    if (!cat) {
      cat = await Category.create(c);
    } else {
      Object.assign(cat, c);
      await cat.save();
    }
    createdCategories[c.slug] = cat;
  }
  console.log(`✅ ${Object.keys(createdCategories).length} Categories ready.`);

  // ==========================================
  // 3. PRODUCTS (ALL 36 AUREX CATALOG LINES)
  // ==========================================
  const rawProducts = [
    { sku: "TL-20-2450-2400", name: "Hydraulic Tail Lift 2T Aluminium W2450xH2400 24V", category: "tail-lifts", sub: "Tail Lifts", price: 4450, brand: "Beauway", rating: 4.8, reviews: 12, badge: "2T Aluminium", fit: "Suits rigid trucks and tray bodies", oem: "BW-TL-20-2400", status: "Built to order", lead: "3 to 4 weeks", desc: "2-tonne aluminium hydraulic tail lift, W2450xH2400, 24V with zinc-nickel cylinders, safety valves and galvanized bracket. Includes warning light, anti-slip plate, foot controller, seal kit and locking latch.", specs: { Capacity: "2000 kg", Platform: "2450 W x 2400 H mm", Power: "24V", Material: "Aluminium", Finish: "Anti slip plate" } },
    { sku: "TL-20-2450-2200", name: "Hydraulic Tail Lift 2T Aluminium W2450xH2200 24V", category: "tail-lifts", sub: "Tail Lifts", price: 4250, brand: "Beauway", rating: 4.8, reviews: 8, badge: "2T Aluminium", fit: "Suits rigid trucks and tray bodies", oem: "BW-TL-20-2200", status: "Built to order", lead: "3 to 4 weeks", desc: "2-tonne aluminium hydraulic tail lift, W2450xH2200, 24V with zinc-nickel cylinder, safety valve and galvanized bracket. Includes warning light, anti-slip plate, foot controller, seal kit and locking latch.", specs: { Capacity: "2000 kg", Platform: "2450 W x 2200 H mm", Power: "24V", Material: "Aluminium", Finish: "Anti slip plate" } },
    { sku: "TL-20-2450-2600", name: "Hydraulic Tail Lift 2T Aluminium W2450xH2600 24V", category: "tail-lifts", sub: "Tail Lifts", price: 4650, brand: "Beauway", rating: 4.8, reviews: 10, badge: "2T Aluminium", fit: "Suits rigid trucks and tray bodies", oem: "BW-TL-20-2600", status: "Built to order", lead: "3 to 4 weeks", desc: "2-tonne aluminium hydraulic tail lift, W2450xH2600, 24V with zinc-nickel cylinders, safety valves and galvanized bracket. Includes warning light, anti-slip plate, foot controller, seal kit and locking latch.", specs: { Capacity: "2000 kg", Platform: "2450 W x 2600 H mm", Power: "24V", Material: "Aluminium", Finish: "Anti slip plate" } },
    { sku: "TL-15-2450-2400", name: "Hydraulic Tail Lift 1.5T Aluminium W2450xH2400 24V", category: "tail-lifts", sub: "Tail Lifts", price: 3850, brand: "Beauway", rating: 4.7, reviews: 6, badge: "1.5T Aluminium", fit: "Suits light rigids and vans", oem: "BW-TL-15-2400", status: "Built to order", lead: "3 to 4 weeks", desc: "1.5-tonne aluminium hydraulic tail lift, W2450xH2400, 24V with zinc-nickel cylinders, safety valves and galvanized bracket. Includes warning light, anti-slip plate, foot controller, seal kit and locking latch.", specs: { Capacity: "1500 kg", Platform: "2450 W x 2400 H mm", Power: "24V", Material: "Aluminium", Finish: "Anti slip plate" } },
    { sku: "TL-30-2450-2600-S", name: "Hydraulic Tail Lift 3T Steel W2450xH2600 24V", category: "tail-lifts", sub: "Tail Lifts", price: 5900, brand: "Beauway", rating: 4.9, reviews: 5, badge: "3T Steel", fit: "Suits heavy rigids and fleet bodies", oem: "BW-TL-30-2600", status: "Built to order", lead: "4 to 5 weeks", desc: "3-tonne steel hydraulic tail lift, W2450xH2600, 24V with zinc-nickel cylinders, safety valves and galvanized bracket. Includes warning light, anti-slip plate, foot controller, seal kit and locking latch.", specs: { Capacity: "3000 kg", Platform: "2450 W x 2600 H mm", Power: "24V", Material: "Steel", Finish: "Galv plus anti slip" } },
    { sku: "PU-12V-22KW", name: "Hydraulic Power Unit 12V 2.2kW c/w Accessories", category: "tail-lifts", sub: "Power Units", price: 790, brand: "Beauway", rating: 4.7, reviews: 4, badge: "Power Unit", fit: "Suits tail lift systems", oem: "BW-PU-12V", status: "In stock VIC", lead: "Ships in 24 hrs", desc: "Hydraulic power unit 12V 2.2kW complete with accessories for tail lift operation.", specs: { Voltage: "12V", Power: "2.2 kW", Use: "Tail lift spare", Inclusions: "Accessories kit" } },

    { sku: "GL-11113", name: "27mm Steel Door Locking Gear 200L+200R", category: "trailer-parts", sub: "Door Gear", price: null, brand: "Ganland", rating: 4.7, reviews: 30, badge: "Door Gear", fit: "Suits truck and trailer doors", oem: "GL-11113", status: "Enquiry", lead: "Confirm stock", desc: "27mm steel door locking gear set, 200 left + 200 right.", specs: { Bar: "27 mm steel", Set: "200L plus 200R", Use: "Pantech rear doors" } },
    { sku: "GL-11113-NL", name: "27mm Steel Door Locking Gear without Latch", category: "trailer-parts", sub: "Door Gear", price: null, brand: "Ganland", rating: 4.6, reviews: 14, badge: "Door Gear", fit: "Suits truck and trailer doors", oem: "GL-11113-NL", status: "Enquiry", lead: "Confirm stock", desc: "27mm steel door locking gear without latch.", specs: { Bar: "27 mm steel", Latch: "Not included", Use: "Replacement bars" } },
    { sku: "GL-11113S", name: "27mm Stainless Steel Truck Door Gear 50L+50R", category: "trailer-parts", sub: "Door Gear", price: null, brand: "Ganland", rating: 4.8, reviews: 16, badge: "Stainless", fit: "Suits truck doors and marine", oem: "GL-11113S", status: "Enquiry", lead: "Confirm stock", desc: "27mm stainless steel truck door gear, 50 left + 50 right.", specs: { Bar: "27 mm stainless", Set: "50L plus 50R", Use: "Marine and food grade" } },
    { sku: "GL-13112", name: "Steel Hinges", category: "trailer-parts", sub: "Hinges", price: null, brand: "Ganland", rating: 4.6, reviews: 41, badge: "Hinge", fit: "Suits trailer doors and bodies", oem: "GL-13112", status: "Enquiry", lead: "Confirm stock", desc: "Steel hinges for trailer doors and body panels.", specs: { Material: "Steel", Use: "Doors and gates", Finish: "Zinc" } },
    { sku: "GL-13198B", name: "Steel Hinges", category: "trailer-parts", sub: "Hinges", price: null, brand: "Ganland", rating: 4.6, reviews: 25, badge: "Hinge", fit: "Suits trailer doors and bodies", oem: "GL-13198B", status: "Enquiry", lead: "Confirm stock", desc: "Steel hinges for trailer doors and body panels.", specs: { Material: "Steel", Use: "Tailgates", Finish: "Zinc" } },
    { sku: "A02-01S-01", name: "Side Door Hinge Stainless 304 Polished", category: "trailer-parts", sub: "Hinges", price: null, brand: "Caiyuan", rating: 4.7, reviews: 22, badge: "304 Stainless", fit: "Suits truck side doors", oem: "A02-01S-01", status: "Enquiry", lead: "Confirm stock", desc: "Side door hinge, stainless steel 304, polished.", specs: { Material: "304 stainless", Finish: "Polished", Use: "Side doors" } },
    { sku: "GL-19113H1", name: "Steel Q Track 4.5m", category: "trailer-parts", sub: "Tracks", price: null, brand: "Ganland", rating: 4.7, reviews: 23, badge: "Q Track", fit: "Suits curtains and load restraint", oem: "GL-19113H1", status: "Enquiry", lead: "Confirm stock", desc: "Steel Q track, 4.5m per piece.", specs: { Length: "4.5 m", Material: "Steel", Use: "Load restraint" } },
    { sku: "GL-19113SH1", name: "304 Stainless Steel Q Track 4.5m", category: "trailer-parts", sub: "Tracks", price: null, brand: "Ganland", rating: 4.8, reviews: 12, badge: "304 Stainless", fit: "Suits curtains and marine", oem: "GL-19113SH1", status: "Enquiry", lead: "Confirm stock", desc: "304 stainless steel Q track, 4.5m per piece.", specs: { Length: "4.5 m", Material: "304 stainless", Use: "Washdown trailers" } },
    { sku: "GL-19111H1", name: "Steel F Track 3050x132x2mm", category: "trailer-parts", sub: "Tracks", price: null, brand: "Ganland", rating: 4.7, reviews: 15, badge: "F Track", fit: "Suits curtains and decks", oem: "GL-19111H1", status: "Enquiry", lead: "Confirm stock", desc: "Steel F track 3050x132x2mm, 4.5m per piece.", specs: { Length: "3050 mm", Profile: "F track", Material: "Steel" } },
    { sku: "F07-04C-01", name: "Iron Column Zinc Plated", category: "trailer-parts", sub: "Structure", price: null, brand: "Caiyuan", rating: 4.6, reviews: 9, badge: "Column", fit: "Suits curtains and bodies", oem: "F07-04C-01", status: "Enquiry", lead: "Confirm stock", desc: "Iron column, steel, zinc plated, built to drawing.", specs: { Material: "Iron", Finish: "Zinc plated", Use: "Body upright" } },
    { sku: "CANVAS-1995-1600", name: "Canvas Stand 1995Wx1600H Steel Powder Coated", category: "trailer-parts", sub: "Canvas Stands", price: null, brand: "Caiyuan", rating: 4.6, reviews: 7, badge: "Canvas Stand", fit: "Suits tautliner bodies", oem: "CANVAS-1995", status: "Built to order", lead: "2 to 3 weeks", desc: "Canvas stand 1995W x 1600H, steel, powder coated, built to drawing.", specs: { Width: "1995 mm", Height: "1600 mm", Finish: "Powder coated" } },
    { sku: "CANVAS-2045-1600", name: "Canvas Stand 2045Wx1600H Steel Powder Coated", category: "trailer-parts", sub: "Canvas Stands", price: null, brand: "Caiyuan", rating: 4.6, reviews: 6, badge: "Canvas Stand", fit: "Suits tautliner bodies", oem: "CANVAS-2045", status: "Built to order", lead: "2 to 3 weeks", desc: "Canvas stand 2045W x 1600H, steel, powder coated, built to drawing.", specs: { Width: "2045 mm", Height: "1600 mm", Finish: "Powder coated" } },
    { sku: "CANVAS-1250-1600", name: "Canvas Stand 1250Wx1600H Steel Powder Coated", category: "trailer-parts", sub: "Canvas Stands", price: null, brand: "Caiyuan", rating: 4.6, reviews: 6, badge: "Canvas Stand", fit: "Suits tautliner bodies", oem: "CANVAS-1250", status: "Built to order", lead: "2 to 3 weeks", desc: "Canvas stand 1250W x 1600H, steel, powder coated, built to drawing.", specs: { Width: "1250 mm", Height: "1600 mm", Finish: "Powder coated" } },

    { sku: "GL-15616", name: "Steel Cargo Bar with Handle", category: "accessories", sub: "Load Restraint", price: 129, brand: "Ganland", rating: 4.7, reviews: 26, badge: "Cargo Bar", fit: "Suits pantech vans and trailers", oem: "GL-15616", status: "In stock VIC", lead: "Ships in 24 hrs", desc: "Steel cargo bar with handle for load control.", specs: { Material: "Steel", Use: "Pantech and trailers", Type: "Cargo bar" } },
    { sku: "GL-23116", name: "Rubber Buffer", category: "accessories", sub: "Buffers", price: 12.5, brand: "Ganland", rating: 4.6, reviews: 31, badge: "Buffer", fit: "Suits doors and tailgates", oem: "GL-23116", status: "In stock VIC", lead: "Ships in 24 hrs", desc: "Rubber buffer for doors and tailgates.", specs: { Material: "Rubber", Use: "Doors" } },
    { sku: "GL-ASJ04", name: "Steel Spring Bolt", category: "accessories", sub: "Bolts", price: 14.5, brand: "Ganland", rating: 4.6, reviews: 29, badge: "Spring Bolt", fit: "Suits doors and gates", oem: "GL-ASJ04", status: "In stock VIC", lead: "Ships in 24 hrs", desc: "Steel spring bolt for doors and gates.", specs: { Material: "Steel", Type: "Spring bolt" } },
    { sku: "GL-19120", name: "Steel End Fitting with Strap", category: "accessories", sub: "Fittings", price: 26, brand: "Ganland", rating: 4.6, reviews: 18, badge: "End Fitting", fit: "Suits curtains and straps", oem: "GL-19120", status: "In stock VIC", lead: "Ships in 24 hrs", desc: "Steel end fitting with strap.", specs: { Use: "Curtains", Type: "End fitting" } },
    { sku: "GL-19117", name: "Steel End Fitting with Strap", category: "accessories", sub: "Fittings", price: 24, brand: "Ganland", rating: 4.6, reviews: 16, badge: "End Fitting", fit: "Suits curtains and straps", oem: "GL-19117", status: "In stock VIC", lead: "Ships in 24 hrs", desc: "Steel end fitting with strap.", specs: { Use: "Curtains", Type: "End fitting" } },
    { sku: "GL-16513", name: "Steel Door Retainer", category: "accessories", sub: "Door Hardware", price: 45, brand: "Ganland", rating: 4.6, reviews: 13, badge: "Retainer", fit: "Suits truck and trailer doors", oem: "GL-16513", status: "In stock VIC", lead: "Ships in 24 hrs", desc: "Steel door retainer for truck and trailer doors.", specs: { Material: "Steel", Use: "Hold open" } },
    { sku: "GL-25126", name: "Steel Tool Box 1200x450x400", category: "accessories", sub: "Tool Boxes", price: 293, brand: "Ganland", rating: 4.8, reviews: 21, badge: "Steel Box", fit: "Suits ute trays and trailer drawbars", oem: "GL-25126", status: "In stock VIC", lead: "Ships in 24 hrs", desc: "Steel toolbox 1200x450x400 for utes, trays and trailers.", specs: { Size: "1200 x 450 x 400 mm", Material: "Steel", Lock: "Lockable lid" } },
    { sku: "A20-01S-06", name: "DN16 Paddle Handle Latch 304 Stainless Polished", category: "accessories", sub: "Latches", price: 23, brand: "Caiyuan", rating: 4.7, reviews: 18, badge: "304 Stainless", fit: "Suits toolboxes and side doors", oem: "A20-01S-06", status: "In stock VIC", lead: "Ships in 24 hrs", desc: "DN16mm paddle handle latch, 304 stainless steel, polished, built to drawing.", specs: { Material: "304 stainless", Type: "Paddle latch" } },
    { sku: "GL-12140", name: "Zinc Alloy Lock", category: "accessories", sub: "Locks", price: 17.5, brand: "Ganland", rating: 4.6, reviews: 33, badge: "Lock", fit: "Suits toolboxes and canopies", oem: "GL-12140", status: "In stock VIC", lead: "Ships in 24 hrs", desc: "Zinc alloy lock with keys for toolboxes and panels.", specs: { Material: "Zinc alloy", Keys: "Included" } },
    { sku: "GL-14175", name: "Stainless Steel Handle", category: "accessories", sub: "Handles", price: 11, brand: "Ganland", rating: 4.6, reviews: 27, badge: "Stainless", fit: "Suits toolboxes and doors", oem: "GL-14175", status: "In stock VIC", lead: "Ships in 24 hrs", desc: "Stainless steel pull handle for toolboxes and doors.", specs: { Material: "Stainless", Use: "Doors" } },
    { sku: "GL-14175B", name: "Steel Handle L330 H50 without Mounting Base", category: "accessories", sub: "Handles", price: 11, brand: "Ganland", rating: 4.5, reviews: 19, badge: "Steel", fit: "Suits toolboxes and doors", oem: "GL-14175B", status: "In stock VIC", lead: "Ships in 24 hrs", desc: "Steel handle L330 H50 without mounting base.", specs: { Length: "330 mm", Material: "Steel" } },
    { sku: "GL-13213", name: "228mm Steel Hinges", category: "accessories", sub: "Hinges", price: 10, brand: "Ganland", rating: 4.6, reviews: 20, badge: "228mm", fit: "Suits doors and tailgates", oem: "GL-13213", status: "In stock VIC", lead: "Ships in 24 hrs", desc: "228mm steel hinges for doors and tailgates.", specs: { Length: "228 mm", Material: "Steel" } },
    { sku: "GL-13195S", name: "235mm 304 Stainless Steel Hinges", category: "accessories", sub: "Hinges", price: 16, brand: "Ganland", rating: 4.8, reviews: 17, badge: "304 Stainless", fit: "Suits doors and marine bodies", oem: "GL-13195S", status: "In stock VIC", lead: "Ships in 24 hrs", desc: "235mm 304 stainless steel hinges.", specs: { Length: "235 mm", Material: "304 stainless" } },
    { sku: "GL-16511S", name: "Stainless Steel Retainer", category: "accessories", sub: "Door Hardware", price: 23, brand: "Ganland", rating: 4.7, reviews: 15, badge: "Stainless", fit: "Suits doors and panels", oem: "GL-16511S", status: "In stock VIC", lead: "Ships in 24 hrs", desc: "Stainless steel retainer for doors and panels.", specs: { Material: "Stainless", Use: "Hold open" } },
    { sku: "GL-19116", name: "Plastic End Cap", category: "accessories", sub: "Caps", price: 4.5, brand: "Ganland", rating: 4.5, reviews: 24, badge: "End Cap", fit: "Suits tracks and rails", oem: "GL-19116", status: "In stock VIC", lead: "Ships in 24 hrs", desc: "Plastic end cap for tracks and rails.", specs: { Material: "Plastic", Use: "Track ends" } },
    { sku: "GL-19116B", name: "Plastic End Cap", category: "accessories", sub: "Caps", price: 5.5, brand: "Ganland", rating: 4.5, reviews: 22, badge: "End Cap", fit: "Suits tracks and rails", oem: "GL-19116B", status: "In stock VIC", lead: "Ships in 24 hrs", desc: "Plastic end cap variant for tracks and rails.", specs: { Material: "Plastic", Use: "Track ends" } },
    { sku: "FZ-26184", name: "Roller", category: "accessories", sub: "Rollers", price: 32, brand: "Ganland", rating: 4.5, reviews: 11, badge: "Roller", fit: "Suits trailers and workshop", oem: "FZ-26184", status: "In stock VIC", lead: "Ships in 24 hrs", desc: "Roller for trailer and workshop use.", specs: { Use: "Trailers", Type: "Roller" } },
  ];

  let prodCount = 0;
  for (const p of rawProducts) {
    const catObj = createdCategories[p.category];
    const brandObj = createdBrands[p.brand] || createdBrands['Aurex'];
    const isEnquiry = p.price === null;
    const priceVal = isEnquiry ? 0 : Number(p.price);

    const prodPayload = {
      sku: p.sku,
      name: p.name,
      category: catObj?._id,
      categories: catObj ? [catObj._id] : [],
      categorySlug: p.category,
      sub: p.sub,
      brand: brandObj?._id,
      brandName: p.brand,
      pricing: {
        mrp: priceVal,
        sellingPrice: priceVal,
        tradePrice: priceVal > 0 ? Math.round(priceVal * 0.9) : 0,
        isPOA: isEnquiry
      },
      rating: p.rating || 4.6,
      reviewCount: p.reviews || 10,
      badge: p.badge || '',
      badges: p.badge ? [{ label: p.badge, type: 'info' }] : [],
      fit: p.fit,
      oem: p.oem,
      oemPartNumber: p.oem,
      stockStatus: p.status,
      lead: p.lead,
      desc: p.desc,
      description: p.desc,
      shortDescription: p.desc,
      specs: p.specs || {},
      specifications: Object.entries(p.specs || {}).map(([label, value]) => ({ label, value: String(value) })),
      images: [
        {
          url: `/images/products/${p.sku}.jpg`,
          publicId: p.sku,
          isPrimary: true,
          alt: p.name
        }
      ],
      inventory: {
        stock: p.status === 'In stock VIC' ? 24 : (p.status === 'Built to order' ? 6 : 12),
        lowStockThreshold: 2,
        trackInventory: true,
        warehouseLocation: 'VIC-CAMPBELLFIELD-MAIN'
      },
      status: 'PUBLISHED',
      isFeatured: true
    };

    let existing = await Product.findOne({ sku: p.sku });
    if (!existing) {
      await Product.create(prodPayload);
    } else {
      Object.assign(existing, prodPayload);
      await existing.save();
    }
    prodCount++;
  }
  console.log(`✅ ${prodCount} Approved Aurex Products seeded.`);

  // ==========================================
  // 4. BLOGS / NEWS & GUIDES
  // ==========================================
  const newsArticles = [
    {
      title: "New Aurex range: tail lifts land in VIC",
      date: "02 Sep 2026",
      tag: "Tail Lifts",
      img: "/images/TAIL-LIFTS-CAT.jpg",
      slug: "tail-lifts-land-in-vic",
      excerpt: "1.5T aluminium to 3T steel tail lifts with full fitting kits, stocked in Campbellfield and VIN-matched before dispatch.",
      type: "NEWS",
      category: "INDUSTRY_NEWS",
      isPublished: true,
      body: [
        { p: "Our new tail lift range has landed in Campbellfield VIC: 1.5-tonne aluminium lifts for vans and light rigids, 2-tonne aluminium and steel lifts for general rigid work, and 3-tonne steel lifts for heavy pallet and fleet bodies. Every lift ships as a complete kit with platform, arms, powerpack, controls, lights and fasteners, so nothing holds up the fit-off." },
        { h: "Picking the right capacity", p: "Match the lift to body type, pallet weight and lift height, not just the badge on the door. Most general-freight rigids suit a 2T lift. Heavy pallet, beverage or building-supply work calls for 3T steel. Vans and light rigids are best served by 1.5T aluminium, which saves tare weight for payload." },
        { h: "Voltage, platform and controls", p: "All Aurex lifts run 12V or 24V electro-hydraulics to suit the truck's system. Platform widths follow the W2450 standard with heights from 2200 to 2600mm. Foot controllers come standard, with hand controllers and wireless options on request." },
        { h: "VIN-matched before dispatch", p: "Send your VIN, body measurements and a photo of the rear frame. Our counter confirms voltage, platform size and bracket geometry before a lift leaves Campbellfield, and every consignment carries its fitting checklist." },
        { list: ["Free VIN and fitment check on every tail lift order", "Same-day dispatch on stocked lines ordered by 2pm", "Fitting support on 03 9000 0000 during business hours", "Warranty support with parts ex VIC stock"] }
      ]
    },
    {
      title: "Toolbox and door hardware refresh",
      date: "21 Aug 2026",
      tag: "Tool Boxes",
      img: "/images/products/GL-25126.jpg",
      slug: "toolbox-door-hardware-refresh",
      excerpt: "Steel toolboxes, paddle latches, cam locks and door locking gear refreshed, with matched sets invoiced together and freighted daily.",
      type: "NEWS",
      category: "INDUSTRY_NEWS",
      isPublished: true,
      body: [
        { p: "The toolbox and door hardware shelves have been refreshed: steel toolboxes in the popular 1200mm footprint, stainless paddle latches, cam locks with dust covers, and complete door locking gear sets with keepers. Order the box, latch and lock together and they arrive on one invoice, keyed and checked as a set." },
        { h: "Measure once: box, latch and aperture", p: "Most returns in this category come down to aperture size. Measure the cut-out, not the old latch face, and note the grip range (panel thickness). For toolboxes, confirm clear opening as well as overall dimensions, because gas struts and trays eat into usable space." },
        { h: "Left and right, from the driver's seat", p: "Door gear hands are always quoted from the driver's seat. A photo of the fitting with a tape measure in frame gets you an exact match, usually within 4 business hours." },
        { list: ["Matched latch, lock and keeper sets on one invoice", "Stainless options for marine and washdown bodies", "Bulk fleet pricing over 5 units", "Free road freight over the threshold, Australia-wide"] }
      ]
    },
    {
      title: "Tracks, caps and fittings explained",
      date: "09 Aug 2026",
      tag: "Trailer Parts",
      img: "/images/products/GL-19111H1.jpg",
      slug: "tracks-caps-fittings-explained",
      excerpt: "Q-track vs F-track, lengths, materials and end fittings: how to spec restraint track for tautliners and flat tops.",
      type: "NEWS",
      category: "INDUSTRY_NEWS",
      isPublished: true,
      body: [
        { p: "Restraint track looks simple until you try to order it: Q-track and F-track profiles are not interchangeable, lengths run to 3050mm and beyond, and end caps, joiners and fasteners differ by system. This guide covers how our counter specs track for tautliner curtains, flat-top decks and fit-outs." },
        { h: "Q-track vs F-track", p: "Q-track suits recessed curtain applications with its positive-lock buckle interface, while F-track is the flat-deck standard for load binders and straps. Confirm which buckles and fittings your fleet already runs before adding length, because mixing systems across a fleet doubles spares holdings." },
        { h: "Lengths, materials and finishes", p: "Standard lengths centre on 3050mm in zinc and stainless finishes. Stainless earns its keep on coastal, livestock and chemical washdown bodies; zinc is the value choice for general freight. End caps keep water and grit out of the channel and should be replaced with the track, not reused." },
        { h: "Send measurements, get an exact price", p: "Trailer parts are enquiry-only because profiles and hands vary. Photos plus millimetre measurements, or your VIN and body type, get you an exact price and lead time, usually within 4 business hours." },
        { list: ["Millimetre measurements beat part names every time", "Confirm buckle and fitting system before ordering length", "Stainless for coastal and washdown bodies", "Caps and joiners quoted with every track length"] }
      ]
    },
    {
      title: "New stock: stainless hinges and paddle latches",
      date: "28 Jul 2026",
      tag: "Accessories",
      img: "/images/products/A20-01S-06.jpg",
      slug: "stainless-hinges-paddle-latches",
      excerpt: "Stainless hinges, paddle latches and keepers now stocked in depth: corrosion-proof hardware for doors, toolboxes and bodies.",
      type: "NEWS",
      category: "INDUSTRY_NEWS",
      isPublished: true,
      body: [
        { p: "Fresh stock has landed across stainless hinges, paddle latches, keepers and associated fasteners. If your doors live outdoors, near the coast or through washdown bays, stainless hardware pays for itself in avoided call-outs and seized fittings." },
        { h: "Where stainless matters most", p: "Hinges and latches on rear doors, side doors, toolbox lids and tail lift platforms cop the worst of road spray and wash chemicals. Zinc hardware survives general freight duty; stainless is the call for livestock, marine-adjacent, food-grade washdown and coastal fleets." },
        { h: "Hinge sizing checklist", p: "Match leaf length and width, knuckle diameter, pin diameter and hole pattern, not just overall length. Strap, butt and weld-on patterns all sit in the range, and our counter will cross your old hinge from a photo with a ruler in frame." },
        { list: ["Stainless, zinc and weld-on patterns stocked", "Photo-with-ruler matching from the counter", "Keeper and striker sets matched to the latch", "Same-day dispatch ordered by 2pm"] }
      ]
    }
  ];

  for (const n of newsArticles) {
    let blog = await Blog.findOne({ slug: n.slug });
    if (!blog) {
      await Blog.create(n);
    } else {
      Object.assign(blog, n);
      await blog.save();
    }
  }

  const guides = [
    { title: "How to pick the right tail lift", excerpt: "Capacity, platform size and body match in five minutes.", tag: "Tail Lifts", img: "/images/TAIL-LIFTS-CAT.jpg", type: "GUIDE", slug: "how-to-pick-the-right-tail-lift" },
    { title: "Door gear and hinge checklist", excerpt: "Left/right, latch and stainless options explained.", tag: "Trailer Parts", img: "/images/products/GL-11113.jpg", type: "GUIDE", slug: "door-gear-and-hinge-checklist" },
    { title: "Q track vs F track", excerpt: "Lengths, materials and end caps matched.", tag: "Accessories", img: "/images/products/GL-19113H1.jpg", type: "GUIDE", slug: "q-track-vs-f-track" },
    { title: "Toolbox lock and latch guide", excerpt: "Paddle latches, locks and handles sized.", tag: "Tool Boxes", img: "/images/products/GL-25126.jpg", type: "GUIDE", slug: "toolbox-lock-and-latch-guide" },
    { title: "Canvas stand measuring guide", excerpt: "Widths and heights for tautliner bodies.", tag: "Trailer Parts", img: "/images/products/CANVAS-1995-1600.jpg", type: "GUIDE", slug: "canvas-stand-measuring-guide" },
    { title: "Cargo control basics", excerpt: "Bars, buffers and end fittings that hold.", tag: "Accessories", img: "/images/products/GL-15616.jpg", type: "GUIDE", slug: "cargo-control-basics" }
  ];

  for (const g of guides) {
    let guideBlog = await Blog.findOne({ slug: g.slug });
    if (!guideBlog) {
      await Blog.create({
        ...g,
        summary: g.excerpt,
        content: g.excerpt,
        isPublished: true
      });
    }
  }
  console.log('✅ Editorial News and Guides seeded.');

  // ==========================================
  // 5. HERO SLIDES
  // ==========================================
  const heroSlides = [
    {
      title: "Tail Lifts That Earn.",
      subtitle: "1.5T to 3T aluminium and steel lifts with full kits.",
      sub: "1.5T to 3T aluminium and steel lifts with full kits.",
      eyebrow: "Australia's heavy body specialist",
      badgeText: "Australia's heavy body specialist",
      cta: "Shop Tail Lifts",
      buttonText: "Shop Tail Lifts",
      href: "/shop/tail-lifts",
      buttonLink: "/shop/tail-lifts",
      img: "/images/web/hero-roadtrain.jpg",
      image: { url: "/images/web/hero-roadtrain.jpg" },
      sortOrder: 1,
      isActive: true
    },
    {
      title: "Trailer Hardware, Matched.",
      subtitle: "Door gear, tracks and stands. Priced on enquiry.",
      sub: "Door gear, tracks and stands. Priced on enquiry.",
      eyebrow: "Campbellfield VIC stock",
      badgeText: "Campbellfield VIC stock",
      cta: "Enquire Now",
      buttonText: "Enquire Now",
      href: "/shop/trailer-parts",
      buttonLink: "/shop/trailer-parts",
      img: "/images/web/hero-semi.jpg",
      image: { url: "/images/web/hero-semi.jpg" },
      sortOrder: 2,
      isActive: true
    },
    {
      title: "Accessories Off the Shelf.",
      subtitle: "Bars, buffers, boxes and fittings, ready to ship.",
      sub: "Bars, buffers, boxes and fittings, ready to ship.",
      eyebrow: "Same day dispatch by 2pm",
      badgeText: "Same day dispatch by 2pm",
      cta: "Shop Accessories",
      buttonText: "Shop Accessories",
      href: "/shop/accessories",
      buttonLink: "/shop/accessories",
      img: "/images/web/port.jpg",
      image: { url: "/images/web/port.jpg" },
      sortOrder: 3,
      isActive: true
    }
  ];

  for (const s of heroSlides) {
    let slide = await CarouselSlide.findOne({ title: s.title });
    if (!slide) {
      await CarouselSlide.create(s);
    } else {
      Object.assign(slide, s);
      await slide.save();
    }
  }
  console.log('✅ Hero Carousel Slides seeded.');

  // ==========================================
  // 6. SITE SETTINGS, FAQS & TESTIMONIALS
  // ==========================================
  const defaultFaqs = [
    { q: "How do I pick the right tail lift capacity?", a: "Tell us your body type, pallet weight and lift height. Most rigids suit 2T. Heavy pallet work suits 3T steel. Vans suit 1.5T aluminium. We confirm voltage and platform size before you order." },
    { q: "Why are trailer parts enquiry only?", a: "Trailer hardware varies by profile, hand and finish. Send photos plus measurements or your VIN and body type. We match the exact gear, hinge or track and reply with price and lead time, usually within 4 business hours." },
    { q: "Do you help with fitment?", a: "Yes. Every line is catalogued by make, model and OEM cross. For critical jobs we run a VIN check before dispatch so the part fits first time." },
    { q: "How fast is freight?", a: "VIC Metro 1 day. Sydney, Brisbane and Adelaide 1 to 2 days. Perth and regional 2 to 5 days. Free road freight over $500. Click and Collect from Campbellfield is free with 4 hour turnaround." },
    { q: "Do you offer trade pricing?", a: "Yes. ABN workshops save 5 percent with priority quotes. Fleets with 5 plus vehicles save 10 percent with 30 day terms and saved lists. Volume breaks apply over 5 units." },
    { q: "Are parts ADR compliant?", a: "Our range is selected for Australian bodies and tested to suit ADR requirements. If a line needs a drawing or compliance note, we supply it with the quote." }
  ];

  const defaultTestimonials = [
    { name: "Rudi Santoso", role: "Fleet Manager, Melbourne Transport", quote: "Aurex matched our body hardware in one call and had it on the dock next morning. Zero downtime on our linehaul fleet.", rating: 5, sku: "GL-25126", img: "https://randomuser.me/api/portraits/men/32.jpg" },
    { name: "Sneha Kulkarni", role: "Production Lead, Cutwell Bodies", quote: "Door locking gear and keeper sets match our CAD specs flawlessly. No guessing left or right configurations.", rating: 5, sku: "GL-11113", img: "https://randomuser.me/api/portraits/women/44.jpg" },
    { name: "Vikram Nair", role: "Maintenance Lead, AusTrans Logistics", quote: "30-day billing, bulk fleet rates, and ADR compliance certificates provided on every consignment without asking.", rating: 5, sku: "GL-19113H1", img: "https://randomuser.me/api/portraits/men/54.jpg" },
    { name: "Maria Anggraini", role: "Workshop Owner, Geelong Heavy Repairs", quote: "Direct fit replacement powerpacks and hydraulic cylinders arrived within 24 hours. Saved our breakdown crew a full day.", rating: 5, sku: "A20-01S-06", img: "https://randomuser.me/api/portraits/women/68.jpg" },
    { name: "Aarav Sharma", role: "Quality Head, Aeroworks Transport", quote: "Toolbox latches, locks, and cam seals all in one invoice. Ordered Friday, fitted and certified Monday morning.", rating: 5, sku: "GL-25126", img: "https://randomuser.me/api/portraits/men/75.jpg" }
  ];

  let siteSetting = await SiteSetting.findOne();
  if (!siteSetting) {
    await SiteSetting.create({
      storeName: "Aurex Truck Parts Australia",
      shortName: "Aurex",
      address: "41 Halley Court, Campbellfield VIC 3061",
      phone: "03 9000 0000",
      phoneHref: "tel:0390000000",
      email: "sales@aurextruckparts.com.au",
      hours: "Mon to Fri 9am to 5pm. Sat 9am to 12pm.",
      freeFreightOver: 500,
      standardFee: 24,
      expressFee: 39,
      abn: "ABN 12 345 678 901",
      announcement: "Free road freight over $500. Order by 2pm for same day dispatch.",
      promise: "Order by 2pm for same day dispatch from Campbellfield.",
      faqs: defaultFaqs,
      testimonials: defaultTestimonials
    });
  } else {
    siteSetting.faqs = defaultFaqs;
    siteSetting.testimonials = defaultTestimonials;
    await siteSetting.save();
  }
  console.log('✅ Site Settings, FAQs and Testimonials seeded.');

  // ==========================================
  // 7. COUPONS & PROMOTIONS
  // ==========================================
  const coupons = [
    {
      code: 'WELCOME10',
      description: 'First order 10% discount on Aurex truck parts & hardware',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minimumOrderValue: 0,
      maximumDiscount: 200,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      code: 'FLEET5',
      description: 'Fleet discount 5% for bulk truck fleets & transport workshops',
      discountType: 'PERCENTAGE',
      discountValue: 5,
      minimumOrderValue: 1000,
      maximumDiscount: 500,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true
    }
  ];

  for (const c of coupons) {
    let coup = await Coupon.findOne({ code: c.code });
    if (!coup) await Coupon.create(c);
  }

  // ==========================================
  // 8. SAMPLE ENQUIRIES
  // ==========================================
  const seedEnquiries = [
    {
      enquiryNumber: "ENQ-1001",
      customerName: "Mark D.",
      name: "Mark D.",
      phone: "0400 111 222",
      email: "mark@lavertonfleet.com.au",
      topic: "Trailer Parts",
      message: "Need door locking gear plus hinges for 6 trailers. Can you confirm left/right?",
      status: "NEW"
    },
    {
      enquiryNumber: "ENQ-1002",
      customerName: "Sarah K.",
      name: "Sarah K.",
      phone: "0400 333 444",
      email: "sarah@brisbanehaul.com.au",
      topic: "Accessories",
      message: "Steel toolbox plus paddle latch and lock. Price with freight to Brisbane?",
      status: "RESOLVED"
    }
  ];

  for (const eq of seedEnquiries) {
    let existingEq = await Enquiry.findOne({ enquiryNumber: eq.enquiryNumber });
    if (!existingEq) {
      await Enquiry.create(eq);
    }
  }

  // ==========================================
  // 9. PAYMENT SETTINGS
  // ==========================================
  let paySettings = await PaymentSettings.findOne();
  if (!paySettings) {
    await PaymentSettings.create({
      directBankTransfer: {
        enabled: true,
        bankName: 'National Australia Bank (NAB)',
        accountName: 'Aurex Truck Parts Australia Pty Ltd',
        bsbOrRouting: '083-004',
        accountNumber: '123456789',
        swiftBic: 'NATAAU3303M',
        instructions: 'Please include your Order Number as payment reference. Stock is allocated once EFT remittance is received.'
      },
      tradeAccount30Days: {
        enabled: true,
        description: 'Approved 30-Day commercial trade credit account for registered transport companies and workshops.',
        requireApproval: true
      },
      codDepotPickup: {
        enabled: true,
        description: 'Pay on collection at Campbellfield Parts Counter (EFTPOS, Card, or Cash).',
        warehouseAddress: '41 Halley Court, Campbellfield VIC 3061'
      },
      purchaseOrders: {
        enabled: true,
        requirePONumber: true
      }
    });
  }

  console.log('🎉 Master Aurex domain data seeded successfully!');
};

module.exports = seedTruckData;
