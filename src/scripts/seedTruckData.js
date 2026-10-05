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

const seedTruckData = async () => {
  console.log('🚛 Seeding Heavy Truck Parts domain data...');

  // 1. Brands
  const brandsData = [
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
    }
    createdBrands[b.name] = brand;
  }
  console.log(`✅ ${Object.keys(createdBrands).length} Brands ready.`);

  // 2. Categories
  const categoriesData = [
    { name: 'Engine & Powertrain', code: 'ENG', description: 'Turbochargers, fuel injectors, water pumps, pistons, EGR valves, and engine overhaul kits.', icon: 'engine' },
    { name: 'Brakes & Wheel Ends', code: 'BRK', description: 'Air brake valves, brake shoes, drums, rotors, calipers, slack adjusters, and wheel hubs.', icon: 'disc' },
    { name: 'Suspension & Steering', code: 'SUS', description: 'Air springs/bellows, shock absorbers, leaf springs, tie rods, drag links, and king pin sets.', icon: 'move' },
    { name: 'Transmission & Driveline', code: 'DRV', description: 'Heavy duty clutches, transmission rebuild parts, universal joints, and center support bearings.', icon: 'tool' },
    { name: 'Exhaust & Emissions', code: 'EXH', description: 'DPF filters, SCR catalysts, NOx sensors, exhaust bellows, and heavy duty clamps.', icon: 'wind' },
    { name: 'Cooling & Air Intake', code: 'COL', description: 'Heavy truck radiators, charge air coolers (intercoolers), fan clutches, and charge air hoses.', icon: 'thermometer' },
    { name: 'Electrical & Lighting', code: 'ELE', description: 'LED work lamps, headlights, starters, 160A-200A alternators, sensors, and ECM modules.', icon: 'zap' },
    { name: 'Cabin & Body Panels', code: 'BDY', description: 'Chrome bumpers, grilles, side mirrors, aerodynamic fairings, and door components.', icon: 'truck' },
    { name: 'Filters & Fluids', code: 'FLT', description: 'Heavy duty engine oil, transmission fluid, coolant, fuel filters, and air dryers.', icon: 'droplet' }
  ];

  const createdCategories = {};
  for (const c of categoriesData) {
    let cat = await Category.findOne({ name: c.name });
    if (!cat) {
      cat = await Category.create(c);
    }
    createdCategories[c.name] = cat;
  }
  console.log(`✅ ${Object.keys(createdCategories).length} Categories ready.`);

  // 3. Products
  const productsData = [
    {
      sku: 'TURBO-ISX15-4309437',
      name: 'Cummins ISX15 / QSX15 HE451VE Variable Geometry Turbocharger (VGT)',
      oemPartNumber: '4309437',
      alternatePartNumbers: ['4309437RX', '2881997', '3792776', '4046031'],
      brand: createdBrands['Cummins']?._id,
      brandName: 'Cummins',
      category: createdCategories['Engine & Powertrain']?._id,
      categories: [createdCategories['Engine & Powertrain']?._id],
      condition: 'NEW',
      placementPosition: 'ENGINE_BAY',
      shortDescription: 'Genuine OEM specification HE451VE VGT Holset Turbocharger for Cummins ISX15 and QSX15 15.0L heavy diesel engines.',
      description: 'Engineered for extreme durability and optimal boost control under heavy road train and long-haul transport demands. Includes calibrated electronic actuator.',
      pricing: { mrp: 3850, sellingPrice: 3290, tradePrice: 2890, isPOA: false },
      coreDeposit: { required: true, amount: 450, returnWindowDays: 30, notes: 'Full refund upon return of intact exchange core unit within 30 days.' },
      dimensions: { weightKg: 28.5, lengthCm: 45, widthCm: 40, heightCm: 38 },
      shippingClass: 'OVERSIZED_BULKY',
      inventory: { stock: 12, lowStockThreshold: 3, trackInventory: true, warehouseLocation: 'AISLE-4-BAY-B' },
      fitments: [
        { make: 'Kenworth', model: 'T909', yearFrom: 2012, yearTo: 2024, engine: 'Cummins ISX15 / X15 550-600HP' },
        { make: 'Kenworth', model: 'T659', yearFrom: 2013, yearTo: 2024, engine: 'Cummins ISX15 / X15' },
        { make: 'Mack', model: 'Super-Liner', yearFrom: 2014, yearTo: 2023, engine: 'Cummins ISX15' },
        { make: 'Freightliner', model: 'Coronado', yearFrom: 2012, yearTo: 2022, engine: 'Cummins ISX15' }
      ],
      specifications: [
        { label: 'Turbo Model', value: 'Holset HE451VE' },
        { label: 'Cooling Type', value: 'Water & Oil Cooled' },
        { label: 'Actuator', value: 'Pre-calibrated 12V / 24V Electronic' },
        { label: 'Engine Displacement', value: '15.0 Litre 6-Cylinder' }
      ],
      badges: [{ label: 'Heavy Duty', type: 'success' }, { label: 'Core Exchange Available', type: 'info' }],
      status: 'PUBLISHED',
      isFeatured: true
    },
    {
      sku: 'BRK-MERITOR-EX225',
      name: 'Meritor EX225 Air Disc Brake Caliper Assembly (LH / RH)',
      oemPartNumber: 'EX225-L2',
      alternatePartNumbers: ['KIT2252', '68324832', 'MC22501'],
      brand: createdBrands['Meritor']?._id,
      brandName: 'Meritor',
      category: createdCategories['Brakes & Wheel Ends']?._id,
      categories: [createdCategories['Brakes & Wheel Ends']?._id],
      condition: 'NEW',
      placementPosition: 'BRAKE_SYSTEM',
      shortDescription: 'High-performance heavy commercial vehicle air disc brake caliper assembly for steer and drive axles.',
      description: 'Manufactured to exceed OE safety specifications with sealed guide pins, corrosion-resistant slide mechanisms, and dual pistons.',
      pricing: { mrp: 980, sellingPrice: 795, tradePrice: 690, isPOA: false },
      coreDeposit: { required: false, amount: 0 },
      dimensions: { weightKg: 34.0, lengthCm: 48, widthCm: 32, heightCm: 25 },
      shippingClass: 'OVERSIZED_BULKY',
      inventory: { stock: 24, lowStockThreshold: 4, warehouseLocation: 'BAY-12-SHELF-3' },
      fitments: [
        { make: 'Volvo Trucks', model: 'FH16 / FH540', yearFrom: 2014, yearTo: 2024, engine: 'D13 / D16' },
        { make: 'Kenworth', model: 'K200 / K220', yearFrom: 2015, yearTo: 2024, engine: 'All Options' },
        { make: 'Freightliner', model: 'Cascadia', yearFrom: 2019, yearTo: 2024, engine: 'Detroit DD13/DD16' }
      ],
      specifications: [
        { label: 'Rotor Diameter', value: '430mm (22.5" Wheels)' },
        { label: 'Operating Pressure', value: 'Max 10 Bar (Air)' },
        { label: 'Piston Configuration', value: 'Dual Synchronized' }
      ],
      status: 'PUBLISHED',
      isFeatured: true
    },
    {
      sku: 'SUSP-HENDRICKSON-PRIMAAX',
      name: 'Hendrickson PRIMAAX Heavy Duty Air Spring / Air Bellow 57122-002',
      oemPartNumber: '57122-002',
      alternatePartNumbers: ['W01-358-9622', '1R12-603', '57122-001'],
      brand: createdBrands['Hendrickson']?._id,
      brandName: 'Hendrickson',
      category: createdCategories['Suspension & Steering']?._id,
      categories: [createdCategories['Suspension & Steering']?._id],
      condition: 'NEW',
      placementPosition: 'SUSPENSION',
      shortDescription: 'Heavy duty air suspension spring bag for Hendrickson PRIMAAX EX severe service rear drive suspensions.',
      description: 'Reinforced 4-ply rubber construction engineered for road trains, heavy logging, and mining haul applications.',
      pricing: { mrp: 285, sellingPrice: 220, tradePrice: 185, isPOA: false },
      dimensions: { weightKg: 7.2, lengthCm: 35, widthCm: 35, heightCm: 45 },
      shippingClass: 'PARCEL',
      inventory: { stock: 48, lowStockThreshold: 10, warehouseLocation: 'SHELF-A1' },
      fitments: [
        { make: 'Kenworth', model: 'T909 / T659 / C509', yearFrom: 2010, yearTo: 2024, engine: 'All Engines' },
        { make: 'Mack', model: 'Titan / Super-Liner', yearFrom: 2012, yearTo: 2024, engine: 'MP8 / MP10' }
      ],
      status: 'PUBLISHED',
      isFeatured: true
    },
    {
      sku: 'CLUTCH-EATON-209701-82',
      name: 'Eaton Fuller Advantage 15.5" Easy Pedal Heavy Duty Dual Plate Clutch Kit',
      oemPartNumber: '209701-82',
      alternatePartNumbers: ['108925-82', 'CL-EAT-209701', '308925-25'],
      brand: createdBrands['Eaton Fuller']?._id,
      brandName: 'Eaton Fuller',
      category: createdCategories['Transmission & Driveline']?._id,
      categories: [createdCategories['Transmission & Driveline']?._id],
      condition: 'NEW',
      placementPosition: 'TRANSMISSION',
      shortDescription: 'Self-adjusting 2050 ft-lb torque capacity dual-plate ceramic clutch kit for 18-speed Roadranger transmissions.',
      description: 'Engineered for high torque road train and B-Double applications. Includes release bearing, clutch brake, and installation tool.',
      pricing: { mrp: 1850, sellingPrice: 1540, tradePrice: 1350, isPOA: false },
      dimensions: { weightKg: 62.0, lengthCm: 50, widthCm: 50, heightCm: 30 },
      shippingClass: 'OVERSIZED_BULKY',
      inventory: { stock: 15, lowStockThreshold: 3, warehouseLocation: 'PALLET-RACK-7' },
      fitments: [
        { make: 'Kenworth', model: 'T909 / K200', yearFrom: 2012, yearTo: 2024, engine: 'Cummins X15 600HP' },
        { make: 'Freightliner', model: 'Coronado / Cascadia', yearFrom: 2013, yearTo: 2023, engine: 'Detroit DD15' }
      ],
      status: 'PUBLISHED',
      isFeatured: true
    },
    {
      sku: 'COOL-VOLVO-RAD-21870087',
      name: 'Volvo FH16 / FM Heavy Duty Aluminum Radiator Assembly',
      oemPartNumber: '21870087',
      alternatePartNumbers: ['21561074', '20722861', 'RAD-VOL-218'],
      brand: createdBrands['Volvo Trucks']?._id,
      brandName: 'Volvo Trucks',
      category: createdCategories['Cooling & Air Intake']?._id,
      categories: [createdCategories['Cooling & Air Intake']?._id],
      condition: 'NEW',
      placementPosition: 'COOLING_SYSTEM',
      shortDescription: 'Premium direct-fit high cooling efficiency aluminum radiator with reinforced tanks.',
      description: 'Tested for maximum vibration resistance under rough outback Australian conditions.',
      pricing: { mrp: 2150, sellingPrice: 1780, tradePrice: 1520, isPOA: false },
      dimensions: { weightKg: 38.0, lengthCm: 110, widthCm: 85, heightCm: 22 },
      shippingClass: 'PALLET_HEAVY',
      inventory: { stock: 8, lowStockThreshold: 2, warehouseLocation: 'CRATE-AREA-B' },
      fitments: [
        { make: 'Volvo Trucks', model: 'FH16 600 / 700 / 750', yearFrom: 2013, yearTo: 2024, engine: 'D16G / D16K' }
      ],
      status: 'PUBLISHED'
    },
    {
      sku: 'ENG-CUMMINS-X15-LONGBLOCK',
      name: 'Cummins X15 Euro 5 / Euro 6 Complete Rebuilt Long Block Engine',
      oemPartNumber: 'X15-REMAN-600',
      alternatePartNumbers: ['X15-LB-550', 'X15-PERF-600'],
      brand: createdBrands['Cummins']?._id,
      brandName: 'Cummins',
      category: createdCategories['Engine & Powertrain']?._id,
      categories: [createdCategories['Engine & Powertrain']?._id],
      condition: 'REMAN_EXCHANGE',
      placementPosition: 'ENGINE_BAY',
      shortDescription: 'Complete factory-specification rebuilt X15 Performance series diesel engine with genuine Cummins internals.',
      description: 'Dyno-tested with certificate of performance. Fully blueprinted, line-bored, new pistons, bearings, oil pump, and reman cylinder head. Available on exchange basis.',
      pricing: { mrp: 38000, sellingPrice: 32500, tradePrice: 29500, isPOA: true },
      coreDeposit: { required: true, amount: 6500, returnWindowDays: 60, notes: 'Refundable core deposit subject to inspection of rebuildable block and crankshaft.' },
      dimensions: { weightKg: 1320.0, lengthCm: 170, widthCm: 110, heightCm: 145 },
      shippingClass: 'PALLET_HEAVY',
      inventory: { stock: 2, lowStockThreshold: 1, trackInventory: true, warehouseLocation: 'HEAVY-CRANE-BAY' },
      fitments: [
        { make: 'Kenworth', model: 'T909 / C509 / T659 / K200', yearFrom: 2016, yearTo: 2024, engine: 'Cummins X15' }
      ],
      badges: [{ label: 'POA / Quote Only', type: 'warning' }, { label: 'Dyno Tested', type: 'highlight' }],
      status: 'PUBLISHED',
      isFeatured: true
    }
  ];

  for (const p of productsData) {
    let prod = await Product.findOne({ sku: p.sku });
    if (!prod) {
      await Product.create(p);
    }
  }
  console.log(`✅ Seeded ${productsData.length} heavy truck parts with fitment & specifications.`);

  // 4. Coupons & Welcome Offer
  let coupon = await Coupon.findOne({ code: 'FLEET10' });
  if (!coupon) {
    await Coupon.create({
      code: 'FLEET10',
      description: '10% Discount for Commercial Fleet orders over $1,500',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minimumOrderValue: 1500,
      maximumDiscount: 500,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true
    });
  }

  let welcome = await WelcomeOffer.findOne();
  if (!welcome) {
    await WelcomeOffer.create({
      title: 'Welcome Fleet Discount',
      description: 'Get $50 off your first commercial truck parts order over $500.',
      couponCode: 'WELCOME50',
      discountType: 'FIXED',
      discountValue: 50,
      minimumOrderValue: 500,
      isActive: true
    });
  }

  // 5. Payment Settings (B2B wire, 30-day invoice, COD — NO RAZORPAY)
  let paySettings = await PaymentSettings.findOne();
  if (!paySettings) {
    await PaymentSettings.create({
      directBankTransfer: {
        enabled: true,
        bankName: 'National Australia Bank (NAB)',
        accountName: 'Aurex Truck Parts Pty Ltd',
        bsbOrRouting: '083-004',
        accountNumber: '123456789',
        instructions: 'Please include your Order Number as payment reference. Stock is allocated once EFT confirmation is received.'
      },
      tradeAccount30Days: {
        enabled: true,
        description: 'Approved 30-Day commercial credit account for registered transport companies.',
        requireApproval: true
      },
      codDepotPickup: {
        enabled: true,
        description: 'Pay on collection at Sydney Parts Warehouse (EFTPOS, Card, or Cash).',
        warehouseAddress: '100 Industrial Drive, Transport Logistics Hub, Sydney NSW'
      },
      purchaseOrders: {
        enabled: true,
        requirePONumber: true
      }
    });
  }

  // 6. Content Pages (Warranty, Core Return, Heavy Freight)
  const pages = [
    {
      title: 'Heavy Freight & Delivery Policy',
      slug: 'heavy-freight-policy',
      content: `### Commercial Freight & Delivery Guidelines\n\nAll heavy truck parts are securely palletized or boxed for national road transport via Toll, TNT, and Northline.\n\n- **Free Freight**: Orders over $500 weighing under 25kg qualify for free road express.\n- **Tail-Lift Delivery**: For heavy components exceeding 40kg, please specify if a tail-lift truck is required at delivery site if no forklift is available.\n- **Depot Collection**: Fast same-day pickup available from our Sydney Distribution Center.`
    },
    {
      title: 'Core Deposit & Exchange Policy',
      slug: 'core-deposit-policy',
      content: `### Core Exchange Return Terms\n\nWhen purchasing rebuilt/exchange components (e.g. Turbochargers, Injectors, Starters, Engines):\n\n1. **Core Return Window**: Exchange core units must be returned within 30 to 60 days.\n2. **Condition**: Cores must be fully assembled, drained of fluids, and free from catastrophic casing cracks.\n3. **Full Surcharge Refund**: Once inspected and verified by our technical workshop, 100% of the core surcharge is refunded.`
    }
  ];

  for (const page of pages) {
    let p = await ContentPage.findOne({ slug: page.slug });
    if (!p) await ContentPage.create(page);
  }

  // 7. Technical Blog
  let blog = await Blog.findOne({ slug: 'cummins-isx15-vgt-maintenance-guide' });
  if (!blog) {
    await Blog.create({
      title: 'Cummins ISX15 VGT Turbocharger Troubleshooting & Maintenance Guide',
      slug: 'cummins-isx15-vgt-maintenance-guide',
      summary: 'Essential diagnostic steps for variable geometry turbochargers in heavy highway prime movers.',
      content: `Variable geometry turbochargers (VGT) are critical for modern diesel emission compliance and engine responsiveness. Common failure modes include carbon buildup in the sliding nozzle vanes and coolant leaks in the electronic actuator housing. Regular oil change intervals with high-grade synthetic diesel oil ensure long bearing life.`,
      tags: ['Cummins', 'ISX15', 'Turbochargers', 'Maintenance'],
      category: 'MAINTENANCE_GUIDES',
      readTimeMinutes: 6,
      isPublished: true
    });
  }

  console.log('✅ Master heavy truck parts seed completed successfully.');
};

module.exports = seedTruckData;
