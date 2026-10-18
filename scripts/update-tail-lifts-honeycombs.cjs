const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '../db_products_162.json');
const products = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

console.log(`Loaded ${products.length} products from ${catalogPath}`);

// 1. Updated Tail Lift Specs and Descriptions
const TAIL_LIFT_UPDATES = {
  'ATP-TL-01': {
    name: 'Hydraulic Tail Lift 2T Aluminium W2450xH2400 24V',
    desc: 'Engineered specifically for Australian medium-to-heavy rigid transport fleets, the Aurex 2,000 kg aluminium cantilever tail lift delivers optimal cargo loading efficiency with minimal tare weight penalty. Constructed from high-tensile extruded aluminium alloy with integrated longitudinal traction grooves, the 2450 x 2400 mm platform withstands intensive pallet jack, roll cage, and forklift traffic. The robust 4-cylinder hydraulic geometry features independent lift and tilt circuits with automatic mechanical ground self-levelling, ensuring the platform remains planar on uneven curbs and loading docks. Powered by an enclosed 24V DC 2.4 kW electro-hydraulic unit equipped with hose-burst safety check valves and thermal overload protection. Fully certified to Australian Design Rule ADR 84/00 and AS/NZS 1418.8.',
    description: 'Engineered specifically for Australian medium-to-heavy rigid transport fleets, the Aurex 2,000 kg aluminium cantilever tail lift delivers optimal cargo loading efficiency with minimal tare weight penalty. Constructed from high-tensile extruded aluminium alloy with integrated longitudinal traction grooves, the 2450 x 2400 mm platform withstands intensive pallet jack, roll cage, and forklift traffic. The robust 4-cylinder hydraulic geometry features independent lift and tilt circuits with automatic mechanical ground self-levelling, ensuring the platform remains planar on uneven curbs and loading docks. Powered by an enclosed 24V DC 2.4 kW electro-hydraulic unit equipped with hose-burst safety check valves and thermal overload protection. Fully certified to Australian Design Rule ADR 84/00 and AS/NZS 1418.8.',
    shortDescription: 'Australian fleet-standard 2,000 kg aluminium cantilever tail lift (2450 W x 2400 H mm). 4-cylinder geometric mechanism with automatic ground tilt memory, 24V 2.4 kW power pack, hose-burst safety protection, and ADR 84/00 / AS 1418.8 certification.',
    price: null,
    pricing: {
      mrp: null,
      sellingPrice: null,
      tradePrice: null,
      isPOA: true,
      discountType: 'NONE',
      discountValue: 0
    },
    isPOA: true,
    isBuyable: false,
    specs: {
      'Product Type': '4-Cylinder Hydraulic Cantilever Tail Lift',
      'Rated Load Capacity': '2000 kg at 750 mm load center',
      'Platform Dimensions': '2450 W x 2400 H mm',
      'Platform Material': 'Marine-grade 6061-T6 extruded aluminium alloy with anti-slip corrugation',
      'Hydraulic Mechanism': '4-cylinder geometric linkage (2 lift cylinders + 2 tilt cylinders)',
      'Self-Levelling System': 'Automatic hydraulic ground-tilt memory and self-levelling compensation',
      'Power Supply': '24V DC electro-hydraulic power pack',
      'Motor Output Rating': '2.4 kW high-torque DC motor with thermal overload cutoff',
      'Working Pressure': '16 – 18 MPa (160 – 180 bar)',
      'Lifting Height Range': '950 mm – 1450 mm (chassis bed height)',
      'Chassis Mounting Spread': '750 / 860 / 880 mm universal Australian chassis fitment',
      'Tare Weight': '~450 kg complete assembly',
      'Hydraulic Safety': 'Velocity-sensing hose burst check valves on all 4 cylinder ports & internal relief',
      'Ground Contact Protection': 'Replaceable synthetic low-noise pavement protection rollers',
      'Warning & Hazard Visibility': 'Dual corner amber flashing LED hazard lamps & reflective ADR flags',
      'Control Interface': 'External IP67 dual-hand safety control box, platform foot controls, in-cab master isolator',
      'Dimensions': '2450 W x 2400 H mm',
      'Technical Specification': 'High-efficiency 2.0-tonne cantilever tail lift for 12T–26T GVM rigid trucks, dry freight pantechs, and curtain-side logistics.',
      'Compliance': 'ADR 84/00 & AS/NZS 1418.8 certified',
      'Australian Standard': 'ADR 84/00 & AS/NZS 1418.8 Certified',
      'Certification': 'ADR 84/00 & AS/NZS 1418.8 Certified Commercial Vehicle Tail Lift'
    },
    dhollandiaSpecs: {
      'Mechanical Kinematics': 'Heavy-duty 4-cylinder geometric cantilever linkage with maintenance-free synthetic composite pivot bushings and chrome-plated hinge pins.',
      'Hydraulic Safety Circuit': 'Independent dual-circuit lift and tilt with velocity fuse burst check valves mounted directly on all 4 cylinder ports and adjustable pressure relief.',
      'Electrical & Multi-Station Controls': 'Weatherproof IP67 two-hand exterior push-button station, platform-integrated foot switches, and an in-cab master electrical isolation switch.',
      'Australian Regulatory Standards': 'Engineered and certified in strict compliance with ADR 84/00 Rear Underrun Protection, AS/NZS 1418.8 hoist standards, and VSB 14 fleet guidelines.'
    }
  },

  'ATP-TL-02': {
    name: 'Hydraulic Tail Lift 2T Aluminium W2450xH2200 24V',
    desc: 'The Aurex 2,000 kg compact aluminium cantilever tail lift features a 2200 mm platform height, making it ideal for standard rigid truck dry-freight boxes and metro distribution bodies where overall roof clearance is critical. The marine-grade extruded aluminium deck reduces deadweight by over 30% compared to equivalent steel lifts, maximising legal payload for urban multi-drop deliveries. Equipped with dual lift cylinders, dual tilt cylinders, automatic pavement levelling, and a 24V 2.4 kW power pack housed in a weather-sealed enclosure. Fully compliant with ADR 84/00 underrun requirements and AS/NZS 1418.8 hoist standards.',
    description: 'The Aurex 2,000 kg compact aluminium cantilever tail lift features a 2200 mm platform height, making it ideal for standard rigid truck dry-freight boxes and metro distribution bodies where overall roof clearance is critical. The marine-grade extruded aluminium deck reduces deadweight by over 30% compared to equivalent steel lifts, maximising legal payload for urban multi-drop deliveries. Equipped with dual lift cylinders, dual tilt cylinders, automatic pavement levelling, and a 24V 2.4 kW power pack housed in a weather-sealed enclosure. Fully compliant with ADR 84/00 underrun requirements and AS/NZS 1418.8 hoist standards.',
    shortDescription: 'Compact 2,000 kg aluminium cantilever tail lift with 2200 mm platform height for standard rigid trucks and metro delivery vans. 4-cylinder hydraulic mechanism with automatic ground tilt memory, 24V 2.4 kW unit, and full ADR 84/00 compliance.',
    price: null,
    pricing: {
      mrp: null,
      sellingPrice: null,
      tradePrice: null,
      isPOA: true,
      discountType: 'NONE',
      discountValue: 0
    },
    isPOA: true,
    isBuyable: false,
    specs: {
      'Product Type': '4-Cylinder Hydraulic Cantilever Tail Lift (Compact Profile)',
      'Rated Load Capacity': '2000 kg at 750 mm load center',
      'Platform Dimensions': '2450 W x 2200 H mm',
      'Platform Material': 'Marine-grade 6061-T6 extruded aluminium alloy with ribbed traction deck',
      'Hydraulic Mechanism': '4-cylinder linkage (2 lift cylinders + 2 tilt cylinders)',
      'Self-Levelling System': 'Hydraulic self-levelling with automatic mechanical ground tilt',
      'Power Supply': '24V DC electro-hydraulic power pack',
      'Motor Output Rating': '2.4 kW high-torque DC motor',
      'Working Pressure': '16 – 18 MPa (160 – 180 bar)',
      'Lifting Height Range': '950 mm – 1350 mm',
      'Chassis Mounting Spread': '750 / 860 / 880 mm universal fitment',
      'Tare Weight': '~435 kg',
      'Hydraulic Safety': 'Port-mounted velocity fuse check valves & internal pressure relief',
      'Ground Contact Protection': 'Heavy synthetic pavement protection rollers',
      'Warning & Hazard Visibility': 'High-intensity flashing LED platform markers & ADR safety flags',
      'Control Interface': 'IP67 dual-button exterior control box, dual foot switches, cabin isolator',
      'Dimensions': '2450 W x 2200 H mm',
      'Technical Specification': 'Optimized low-tare 2.0-tonne cantilever tail lift for urban multi-drop distribution, rigid box bodies, and food & beverage logistics.',
      'Compliance': 'ADR 84/00 & AS/NZS 1418.8 certified',
      'Australian Standard': 'ADR 84/00 & AS/NZS 1418.8 Certified',
      'Certification': 'ADR 84/00 & AS/NZS 1418.8 Certified Commercial Vehicle Tail Lift'
    },
    dhollandiaSpecs: {
      'Mechanical Kinematics': 'Compact 4-cylinder cantilever architecture engineered for standard box heights with greaseless synthetic pivot bushings.',
      'Hydraulic Safety Circuit': 'Dual lift and tilt cylinders with port-threaded burst check valves, pilot-operated lowering lock, and 18 MPa system relief.',
      'Electrical & Multi-Station Controls': 'IP67 external two-hand controller, non-slip rubberized platform foot buttons, and dash-mounted cabin master switch.',
      'Australian Regulatory Standards': 'Certified to ADR 84/00 rear underrun safety and AS/NZS 1418.8 commercial vehicle hoist compliance.'
    }
  },

  'ATP-TL-03': {
    name: 'Hydraulic Tail Lift 2T Aluminium W2450xH2600 24V',
    desc: 'Designed for high-cube pantechs, furniture bodies, and refrigerated logistics vehicles, the Aurex 2,000 kg extended-height tail lift features an expansive 2600 mm tall aluminium platform that doubles as a full-height weather-tight rear door closure. The extended lever arm geometry delivers a vertical lift range up to 1,500 mm, accommodating tall chassis frames and dock levelers. Built with reinforced extruded aluminium box profiles, high-tensile chrome-plated cylinder shafts, synthetic ground rollers, and a high-output 24V 2.4 kW power pack with dual-speed lowering control. ADR 84/00 rear underrun certified.',
    description: 'Designed for high-cube pantechs, furniture bodies, and refrigerated logistics vehicles, the Aurex 2,000 kg extended-height tail lift features an expansive 2600 mm tall aluminium platform that doubles as a full-height weather-tight rear door closure. The extended lever arm geometry delivers a vertical lift range up to 1,500 mm, accommodating tall chassis frames and dock levelers. Built with reinforced extruded aluminium box profiles, high-tensile chrome-plated cylinder shafts, synthetic ground rollers, and a high-output 24V 2.4 kW power pack with dual-speed lowering control. ADR 84/00 rear underrun certified.',
    shortDescription: 'Extended-height 2,000 kg cantilever tail lift with 2600 mm platform height for high-cube pantechs, furniture bodies, and refrigerated transport. 4-cylinder geometry with full door closure capability and ADR 84/00 compliance.',
    price: null,
    pricing: {
      mrp: null,
      sellingPrice: null,
      tradePrice: null,
      isPOA: true,
      discountType: 'NONE',
      discountValue: 0
    },
    isPOA: true,
    isBuyable: false,
    specs: {
      'Product Type': '4-Cylinder High-Cube Cantilever Tail Lift (Full Door Closure)',
      'Rated Load Capacity': '2000 kg at 750 mm load center',
      'Platform Dimensions': '2450 W x 2600 H mm',
      'Platform Material': 'Reinforced extruded aluminium alloy with continuous anti-slip profile',
      'Hydraulic Mechanism': 'Long-geometry 4-cylinder linkage (2 lift + 2 tilt cylinders)',
      'Self-Levelling System': 'Full hydraulic ground-tilt memory with automatic tilt-at-ground',
      'Power Supply': '24V DC high-capacity hydraulic power pack',
      'Motor Output Rating': '2.4 kW heavy-duty DC motor',
      'Working Pressure': '16 – 18 MPa (160 – 180 bar)',
      'Lifting Height Range': '1100 mm – 1500 mm (tall chassis & high-cube pantechs)',
      'Chassis Mounting Spread': '750 / 860 / 880 mm universal fitment',
      'Tare Weight': '~465 kg',
      'Hydraulic Safety': 'Inline velocity-fuse burst valves on all cylinders & thermal overload switch',
      'Ground Contact Protection': 'Twin heavy-duty synthetic pavement protection rollers',
      'Warning & Hazard Visibility': 'Dual recessed corner flashing LED lamps & ADR compliance flags',
      'Control Interface': 'Weatherproof IP67 exterior enclosure, platform foot controls, in-cab master switch',
      'Dimensions': '2450 W x 2600 H mm',
      'Technical Specification': 'High-cube 2.0-tonne cantilever tail lift with full-closure door capability for tall pantechs, refrigerated logistics, and furniture freight.',
      'Compliance': 'ADR 84/00 & AS/NZS 1418.8 certified',
      'Australian Standard': 'ADR 84/00 & AS/NZS 1418.8 Certified',
      'Certification': 'ADR 84/00 & AS/NZS 1418.8 Certified Commercial Vehicle Tail Lift'
    },
    dhollandiaSpecs: {
      'Mechanical Kinematics': 'Extended-reach cantilever arms suited for high chassis frames and tall van bodies, with heavy-duty spherical self-aligning pin joints.',
      'Hydraulic Safety Circuit': '4-cylinder hydraulic geometry with instantaneous hose-burst shutoff valves on every cylinder and dual-speed platform descent.',
      'Electrical & Multi-Station Controls': 'IP67 lockable control enclosure, dual waterproof platform foot switches, and heavy-duty 24V battery isolation relay.',
      'Australian Regulatory Standards': 'Fully compliant with ADR 84/00 rear underrun impact standards, AS/NZS 1418.8, and Australian Heavy Vehicle National Law.'
    }
  },

  'ATP-TL-04': {
    name: 'Hydraulic Tail Lift 1.5T Aluminium W2450xH2400 24V',
    desc: 'The Aurex 1,500 kg Fleet-Lite cantilever tail lift is optimized for medium rigid delivery vehicles (8T to 15T GVM), parcel logistics, and retail distribution fleets. Weighing only ~410 kg, it provides maximum legal payload retention while offering a full 2450 x 2400 mm loading area suitable for two standard pallets or three roll cages. The 4-cylinder hydraulic mechanism delivers rapid, smooth cycle times powered by an energy-efficient 2.2 kW 24V DC power unit. Complete with hose-burst safety protection, automatic ground tilt, and full ADR 84/00 certification.',
    description: 'The Aurex 1,500 kg Fleet-Lite cantilever tail lift is optimized for medium rigid delivery vehicles (8T to 15T GVM), parcel logistics, and retail distribution fleets. Weighing only ~410 kg, it provides maximum legal payload retention while offering a full 2450 x 2400 mm loading area suitable for two standard pallets or three roll cages. The 4-cylinder hydraulic mechanism delivers rapid, smooth cycle times powered by an energy-efficient 2.2 kW 24V DC power unit. Complete with hose-burst safety protection, automatic ground tilt, and full ADR 84/00 certification.',
    shortDescription: 'Lightweight 1,500 kg aluminium cantilever tail lift (2450 W x 2400 H mm) optimized for medium rigid trucks and parcel delivery fleets. Low 410 kg tare, 4-cylinder geometry, automatic ground tilt, and full ADR 84/00 certification.',
    price: null,
    pricing: {
      mrp: null,
      sellingPrice: null,
      tradePrice: null,
      isPOA: true,
      discountType: 'NONE',
      discountValue: 0
    },
    isPOA: true,
    isBuyable: false,
    specs: {
      'Product Type': 'Lightweight 4-Cylinder Cantilever Tail Lift',
      'Rated Load Capacity': '1500 kg at 600 – 750 mm load center',
      'Platform Dimensions': '2450 W x 2400 H mm',
      'Platform Material': 'High-strength lightweight extruded aluminium with grooved non-slip deck',
      'Hydraulic Mechanism': '4-cylinder cantilever linkage (2 lift cylinders + 2 tilt cylinders)',
      'Self-Levelling System': 'Mechanical-hydraulic self-levelling with automatic ground-tilt compensation',
      'Power Supply': '24V DC compact electro-hydraulic power unit',
      'Motor Output Rating': '2.2 kW high-efficiency DC motor',
      'Working Pressure': '15 – 17 MPa (150 – 170 bar)',
      'Lifting Height Range': '950 mm – 1250 mm (medium rigid chassis)',
      'Chassis Mounting Spread': '750 / 860 mm chassis rail spread',
      'Tare Weight': '~410 kg (industry-leading light tare)',
      'Hydraulic Safety': 'Hose-burst safety check valves on all ports & internal relief valve',
      'Ground Contact Protection': 'Low-friction synthetic pavement protection rollers',
      'Warning & Hazard Visibility': 'Amber flashing LED safety beacons on platform corners + ADR flags',
      'Control Interface': 'IP67 dual-hand push button box, dual foot switches, in-cab isolator',
      'Dimensions': '2450 W x 2400 H mm',
      'Technical Specification': 'Lightweight 1.5-tonne cantilever tail lift for 8T–15T GVM medium rigid trucks, parcel delivery, and metro distribution fleets.',
      'Compliance': 'ADR 84/00 & AS/NZS 1418.8 certified',
      'Australian Standard': 'ADR 84/00 & AS/NZS 1418.8 Certified',
      'Certification': 'ADR 84/00 & AS/NZS 1418.8 Certified Commercial Vehicle Tail Lift'
    },
    dhollandiaSpecs: {
      'Mechanical Kinematics': 'Lightweight 4-cylinder cantilever linkage optimized to minimize vehicle deadweight while preserving torsional rigidity.',
      'Hydraulic Safety Circuit': 'Dedicated dual lift and dual tilt cylinders with velocity check burst valves directly inserted into hydraulic ports.',
      'Electrical & Multi-Station Controls': 'Heavy-duty exterior two-hand safety station, twin low-profile platform foot switches, and in-cab isolation circuit.',
      'Australian Regulatory Standards': 'ADR 84/00 compliant underrun protection geometry, AS/NZS 1418.8 certified, and NHVR approved.'
    }
  },

  'ATP-TL-05': {
    name: 'Hydraulic Tail Lift 3T Steel W2450xH2600 24V',
    desc: 'Engineered for severe-duty freight, linehaul semi-trailers, machinery transport, and high-density industrial logistics, the Aurex 3,000 kg Titan-Duty tail lift is built entirely from high-tensile structural steel with a heavy hot-dip galvanized finish for lifelong corrosion resistance. Its ultra-reinforced 4-cylinder geometry features oversize chrome-plated cylinder rams and heavy spherical pivot bearings capable of handling 3-tonne loads at a 1,000 mm load center. Driven by a high-output 24V 2.8 kW dual-flow power unit providing fast lift cycles under full capacity. Equipped with integrated ADR 84/00 certified rear underrun bumper bar.',
    description: 'Engineered for severe-duty freight, linehaul semi-trailers, machinery transport, and high-density industrial logistics, the Aurex 3,000 kg Titan-Duty tail lift is built entirely from high-tensile structural steel with a heavy hot-dip galvanized finish for lifelong corrosion resistance. Its ultra-reinforced 4-cylinder geometry features oversize chrome-plated cylinder rams and heavy spherical pivot bearings capable of handling 3-tonne loads at a 1,000 mm load center. Driven by a high-output 24V 2.8 kW dual-flow power unit providing fast lift cycles under full capacity. Equipped with integrated ADR 84/00 certified rear underrun bumper bar.',
    shortDescription: 'Heavy-duty 3,000 kg steel cantilever tail lift (2450 W x 2600 H mm) for linehaul semi-trailers and heavy machinery transport. Full hot-dip galvanized steel deck, 2.8 kW dual-flow power pack, and ADR 84/00 certified underrun bar.',
    price: null,
    pricing: {
      mrp: null,
      sellingPrice: null,
      tradePrice: null,
      isPOA: true,
      discountType: 'NONE',
      discountValue: 0
    },
    isPOA: true,
    isBuyable: false,
    specs: {
      'Product Type': 'Severe-Duty 4-Cylinder Steel Cantilever Tail Lift',
      'Rated Load Capacity': '3000 kg at 1000 mm load center',
      'Platform Dimensions': '2450 W x 2600 H mm',
      'Platform Material': 'Heavy-gauge high-tensile structural steel with non-slip diamond checker plate',
      'Surface Finish': 'Full hot-dip galvanisation (corrosion protection for linehaul & coastal fleets)',
      'Hydraulic Mechanism': 'Ultra-reinforced 4-cylinder linkage with oversized hardened chrome rams',
      'Self-Levelling System': 'Heavy-duty dual tilt cylinders with mechanical ground angle memory',
      'Power Supply': '24V DC high-output dual-flow electro-hydraulic power pack',
      'Motor Output Rating': '2.8 kW extreme-duty DC motor',
      'Working Pressure': '18 – 20 MPa (180 – 200 bar)',
      'Lifting Height Range': '1100 mm – 1550 mm (semi-trailer & heavy chassis)',
      'Chassis Mounting Spread': '880 mm heavy-vehicle chassis spread',
      'Tare Weight': '~620 kg',
      'Hydraulic Safety': 'Dual-port velocity burst check valves, pilot-operated check valving & overload relief',
      'Ground Contact Protection': 'Heavy polyurethane and steel ground contact rollers',
      'Warning & Hazard Visibility': 'Corner amber flashing LED beacons, high-vis ADR flags, reflective contour tape',
      'Control Interface': 'Heavy-duty lockable exterior steel control enclosure, platform foot controls, in-cab master switch',
      'Dimensions': '2450 W x 2600 H mm',
      'Technical Specification': 'Severe-duty 3.0-tonne steel cantilever tail lift for semi-trailers, linehaul logistics, heavy equipment, and industrial transport.',
      'Compliance': 'ADR 84/00 & AS/NZS 1418.8 certified',
      'Australian Standard': 'ADR 84/00 & AS/NZS 1418.8 Certified',
      'Certification': 'ADR 84/00 & AS/NZS 1418.8 Certified Commercial Vehicle Tail Lift'
    },
    dhollandiaSpecs: {
      'Mechanical Kinematics': 'Heavy structural steel kinematic geometry featuring oversized hardened pivot pins and spherical greasable bearings.',
      'Hydraulic Safety Circuit': 'High-volume dual lift and dual tilt cylinders equipped with dual-port velocity burst safety valves and pilot check valves.',
      'Electrical & Multi-Station Controls': 'Vandal-resistant IP67 exterior control housing, dual non-slip foot switches, and 24V emergency disconnect solenoid.',
      'Australian Regulatory Standards': 'ADR 84/00 rear underrun certified with integrated heavy bumper bar, AS/NZS 1418.8 certified, and NHVR linehaul compliant.'
    }
  },

  'ATP-TL-06': {
    name: 'Hydraulic Power Unit 12V 2.2kW c/w Accessories',
    desc: 'The Aurex PowerPack 12V-Pro is an electro-hydraulic power unit engineered as a drop-in replacement or retrofit power system for commercial cantilever tail lifts, tippers, and vehicle loading hoists. Powered by a heavy-duty 12V DC 2.2 kW starter-grade electric motor coupled to a high-pressure precision gear pump, it delivers 5.8 L/min nominal oil flow at pressures up to 21 MPa (210 bar). Features an 8-litre steel oil reservoir, integrated 12V cartridge lowering solenoid valve with emergency manual lowering bypass, heavy-duty 150A starter solenoid, pre-wired IP65 control harness, and multi-hole mounting subframe.',
    description: 'The Aurex PowerPack 12V-Pro is an electro-hydraulic power unit engineered as a drop-in replacement or retrofit power system for commercial cantilever tail lifts, tippers, and vehicle loading hoists. Powered by a heavy-duty 12V DC 2.2 kW starter-grade electric motor coupled to a high-pressure precision gear pump, it delivers 5.8 L/min nominal oil flow at pressures up to 21 MPa (210 bar). Features an 8-litre steel oil reservoir, integrated 12V cartridge lowering solenoid valve with emergency manual lowering bypass, heavy-duty 150A starter solenoid, pre-wired IP65 control harness, and multi-hole mounting subframe.',
    shortDescription: 'Universal 12V 2.2 kW electro-hydraulic power unit complete with 8L steel tank, starter solenoid, lowering valve, and pre-wired harness. Direct drop-in replacement for 1.0T to 2.5T commercial tail lifts and tippers.',
    price: null,
    pricing: {
      mrp: null,
      sellingPrice: null,
      tradePrice: null,
      isPOA: true,
      discountType: 'NONE',
      discountValue: 0
    },
    isPOA: true,
    isBuyable: false,
    specs: {
      'Product Type': 'Universal Electro-Hydraulic Power Unit Assembly',
      'Motor Voltage': '12V DC',
      'Motor Output Power': '2.2 kW high-torque starter-grade motor',
      'Pump Type': 'High-pressure precision gear pump (2.1 cc/rev, nominal delivery 5.8 L/min)',
      'Maximum Working Pressure': '21 MPa (210 bar) with user-adjustable internal relief valve',
      'Reservoir Capacity': '8.0 Litre heavy-gauge powder-coated steel tank with breather cap and sight level',
      'Directional & Lowering Valving': '12V DC cartridge lowering solenoid valve with emergency manual override screw',
      'Electrical Switching': 'Heavy-duty 150A starter solenoid relay with weather-sealed boots',
      'Harness & Control Loom': 'Pre-wired IP65 wiring harness with terminal connectors and fuse protection',
      'Mounting Subframe': 'Universal slotted steel bracket for horizontal or vertical chassis mounting',
      'Hydraulic Ports': 'Standard G3/8" BSPP pressure and tank return ports',
      'Tare Weight': '18.5 kg dry weight',
      'Compatibility': 'Direct drop-in replacement for 1.0T to 2.5T commercial tail lifts, tippers, and loading ramps',
      'Technical Specification': 'Universal 12V 2.2kW power unit for commercial vehicle tail lifts and tippers with integrated safety relief and manual lowering.',
      'Compliance': 'SAE J200 & ISO 9001 certified',
      'Australian Standard': 'ADR 84/00 & AS/NZS 1418.8 Component Fitment',
      'Certification': 'ADR 84/00 & AS/NZS 1418.8 Certified Component Fitment'
    },
    dhollandiaSpecs: {
      'Mechanical Kinematics': 'Compact enclosed reservoir chassis with vibration-damping rubber subframe mounts for underbody frame installation.',
      'Hydraulic Safety Circuit': 'Factory calibrated internal pressure relief valve with cartridge solenoid lowering valve and manual emergency bypass.',
      'Electrical & Multi-Station Controls': 'Industrial 150A starter solenoid with pre-terminated weather-sealed wiring harness and thermal overload breaker.',
      'Australian Regulatory Standards': 'Manufactured to ISO 9001 quality guidelines, meeting AS/NZS 1418.8 component replacement specifications.'
    }
  }
};

// 2. Process each product
let tlCount = 0;
let accCount = 0;

for (let i = 0; i < products.length; i++) {
  const p = products[i];
  const sku = p.sku;

  // Tail lift enrichment
  if (TAIL_LIFT_UPDATES[sku]) {
    const update = TAIL_LIFT_UPDATES[sku];
    Object.assign(p, update);
    tlCount++;
    console.log(`Updated tail lift: ${sku}`);
  }

  // Honeycomb panels ATP-ACC-06 to ATP-ACC-16 price enquiry conversion
  if (sku >= 'ATP-ACC-06' && sku <= 'ATP-ACC-16') {
    p.price = null;
    p.pricing = {
      mrp: null,
      sellingPrice: null,
      tradePrice: null,
      isPOA: true,
      discountType: 'NONE',
      discountValue: 0
    };
    p.isPOA = true;
    p.isBuyable = false;

    // Filter out ~3% Below Market badge, set clean Trade Enquiry badge
    p.badges = [{ label: 'Trade Enquiry', type: 'warning' }];

    // Clean specs object: remove Market Benchmark Price and Aurex Fleet Price
    if (p.specs) {
      delete p.specs['Market Benchmark Price'];
      delete p.specs['Aurex Fleet Price'];
      delete p.specs['Aurex Target Price'];
    }

    // Clean specifications array
    if (Array.isArray(p.specifications)) {
      p.specifications = p.specifications.filter(s => {
        const lbl = (s.label || '').toLowerCase();
        return !lbl.includes('market benchmark') && !lbl.includes('fleet price') && !lbl.includes('target price');
      });
    }

    accCount++;
    console.log(`Updated honeycomb to Price Enquiry: ${sku}`);
  }
}

// 3. Write back to catalog
fs.writeFileSync(catalogPath, JSON.stringify(products, null, 2), 'utf8');
console.log(`Successfully updated ${tlCount} tail lifts and ${accCount} honeycomb panels in ${catalogPath}`);
