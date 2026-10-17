const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const PRODUCTS_13 = [
  {
    sku: 'ATP-BP-01',
    oem: 'VNFHP432320',
    name: 'FRP Honeycomb Side Panel 4300x2300x20mm',
    sub: 'FRP Honeycomb Panels',
    dimensions: '4300 x 2300 x 20mm (9.89 m²)',
    area: '9.89 m²',
    marketPrice: 1249.00,
    aurexPrice: 1210.00,
    shortDescription: 'Ultra-lightweight high-strength FRP honeycomb composite side wall panel (4300x2300x20mm, 9.89m²). High-gloss UV-stabilised gelcoat face over polypropylene honeycomb core for dry freight pantechs.',
    description: 'Commercial grade FRP (Fiberglass Reinforced Plastic) polypropylene honeycomb side panel engineered specifically for Australian truck and van bodybuilders. Measuring 4300mm long by 2300mm wide at 20mm thickness, this panel provides 9.89m² of seamless surface area. The high-gloss gelcoat exterior delivers superior UV resistance and weather durability against harsh Australian sun, while the non-corrosive thermoplastic honeycomb core delivers significant weight savings over traditional steel or plywood walls without sacrificing torsional rigidity.',
    parameters: 'Dimensions: 4300 x 2300 x 20mm | Area: 9.89m² | Core: Polypropylene Honeycomb (8mm cell) | Facing: 1.5mm - 2.0mm High-Gloss White Woven Roving Gelcoat (RAL 9016) | Density: 80 kg/m³ | Weight: ~7.5 kg/m²',
    technicalSpec: 'Continuous structural sandwich panel offering superior impact damping, high flexural strength, rot-proof and waterproof construction for commercial rigid pantech bodies and dry freight vans.',
    certification: 'AS/NZS ISO 9001 Approved Commercial Transport Standard; AS 4256.3 & ISO 845 Compliance',
    fit: 'Suits rigid pantechs, dry freight bodies, and delivery trucks up to 4.3m length'
  },
  {
    sku: 'ATP-BP-02',
    oem: 'VNFHP242320',
    name: 'FRP Honeycomb Front Panel 2400x2300x20mm',
    sub: 'FRP Honeycomb Panels',
    dimensions: '2400 x 2300 x 20mm (5.52 m²)',
    area: '5.52 m²',
    marketPrice: 699.00,
    aurexPrice: 678.00,
    shortDescription: 'High-strength aerodynamic FRP honeycomb composite front bulkhead panel (2400x2300x20mm, 5.52m²). Seamless gelcoat face with structural PP honeycomb core for commercial truck bodies.',
    description: 'Heavy-duty front bulkhead composite panel for commercial rigid trucks and trailers. Sized at 2400mm width by 2300mm height at 20mm thickness (5.52m²), this structural FRP sandwich panel is designed to withstand front cargo shifting loads and headboard air pressure during high-speed highway haulage. Rot-proof, chemical resistant, and easily bonded to aluminium front corner caps.',
    parameters: 'Dimensions: 2400 x 2300 x 20mm | Area: 5.52m² | Core: Polypropylene Honeycomb | Finish: Gelcoat White (RAL 9016) | Weight: ~41.4 kg | High frontal impact resistance',
    technicalSpec: 'Engineered front bulkhead panel for rigid truck bodies, pantechs and box trailers with high strength-to-weight ratio and seamless clean finish.',
    certification: 'AS/NZS ISO 9001 Approved Commercial Transport Standard; AS 4256.3 Compliance',
    fit: 'Suits truck front headboards, bulkheads, and van front walls'
  },
  {
    sku: 'ATP-BP-03',
    oem: 'VNFHP241220',
    name: 'FRP Honeycomb Door Panel 2400x1200x20mm',
    sub: 'FRP Honeycomb Panels',
    dimensions: '2400 x 1200 x 20mm (2.88 m²)',
    area: '2.88 m²',
    marketPrice: 365.00,
    aurexPrice: 354.00,
    shortDescription: 'Precision-cut lightweight FRP honeycomb door panel (2400x1200x20mm, 2.88m²). Ideal for rear barn doors, side access doors, and service body panels.',
    description: 'Precision manufactured 2400 x 1200 x 20mm FRP honeycomb panel specifically engineered for commercial vehicle rear barn doors and side access portals. Lightweight construction reduces door hinge fatigue and operator lifting strain while maintaining rigid flat alignment against rubber weather seals.',
    parameters: 'Dimensions: 2400 x 1200 x 20mm | Area: 2.88m² | Weight: ~21.6 kg | Core: PP Honeycomb | Double-sided High-Gloss White Gelcoat | Thermal acoustic damping',
    technicalSpec: 'Commercial van and truck rear door infill panel with excellent flexural rigidity, waterproof edge compatibility, and high impact resistance.',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard',
    fit: 'Suits standard height commercial van rear barn doors and side doors'
  },
  {
    sku: 'ATP-BP-04',
    oem: 'VNFHP281220',
    name: 'FRP Honeycomb Door Panel 2800x1200x20mm',
    sub: 'FRP Honeycomb Panels',
    dimensions: '2800 x 1200 x 20mm (3.36 m²)',
    area: '3.36 m²',
    marketPrice: 425.00,
    aurexPrice: 412.00,
    shortDescription: 'High-cube commercial FRP honeycomb door panel (2800x1200x20mm, 3.36m²). Built for tall pantechs, semitrailers, and high-cube delivery trucks.',
    description: 'Extended height 2800 x 1200 x 20mm composite door panel engineered for high-cube semitrailers and oversized rigid truck rear doors. Features double-sided woven roving gelcoat faces for superior rigidity over large spans without bowing or thermal deformation in Australian desert heat.',
    parameters: 'Dimensions: 2800 x 1200 x 20mm | Area: 3.36m² | Weight: ~25.2 kg | Core: Polypropylene Honeycomb | Finish: High-Gloss White RAL 9016',
    technicalSpec: 'High-cube commercial vehicle rear door panel offering high torsional rigidity and reduced tare weight.',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard',
    fit: 'Suits tall semi-trailers, drop-deck trailers, and high-cube pantechs'
  },
  {
    sku: 'ATP-BP-05',
    oem: 'VNFHP321220',
    name: 'FRP Honeycomb Door Panel 3200x1200x20mm',
    sub: 'FRP Honeycomb Panels',
    dimensions: '3200 x 1200 x 20mm (3.84 m²)',
    area: '3.84 m²',
    marketPrice: 485.00,
    aurexPrice: 470.00,
    shortDescription: 'Heavy-duty full-height FRP honeycomb door panel (3200x1200x20mm, 3.84m²). Engineered for maximum height logistics trailers and mezzanine bodies.',
    description: 'Maximum-height 3200 x 1200 x 20mm commercial honeycomb door panel. Specially reinforced with multi-axial fiberglass roving to maintain structural integrity across extreme 3.2m door openings on Australian interstate freight vans.',
    parameters: 'Dimensions: 3200 x 1200 x 20mm | Area: 3.84m² | Weight: ~28.8 kg | Impact Resistance: High | Thermal Expansion: Ultra-low',
    technicalSpec: 'Full-height commercial dry freight rear door composite panel with seamless weather sealing and superior hinge retention strength.',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard',
    fit: 'Suits mega-trailers, interstate linehaul pantechs, and tall freight vans'
  },
  {
    sku: 'ATP-BP-06',
    oem: 'VNFPP241220',
    name: 'FRP Plywood Door Panel 2400x1200x20mm',
    sub: 'FRP Plywood Panels',
    dimensions: '2400 x 1200 x 20mm (2.88 m²)',
    area: '2.88 m²',
    marketPrice: 389.00,
    aurexPrice: 377.00,
    shortDescription: 'Heavy-duty structural FRP plywood core door panel (2400x1200x20mm, 2.88m²). Extreme point-impact and hinge screw retention strength.',
    description: 'Heavy-duty composite door panel combining a solid structural exterior-grade hardwood plywood core with smooth fiberglass gelcoat protective skins. Designed for severe-duty freight applications where forklift back-up impacts and extreme hardware retention strength are paramount.',
    parameters: 'Dimensions: 2400 x 1200 x 20mm | Area: 2.88m² | Core: Structural Marine/Exterior Plywood | Facing: 1.5mm FRP Gelcoat | High fastener pull-out strength',
    technicalSpec: 'Solid structural composite door panel for heavy transport vehicles requiring maximum hinge, latch, and keeper screw retention.',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard; AS/NZS 2269 Compliance',
    fit: 'Suits heavy-duty distribution trucks, dock-loading vans, and mining service bodies'
  },
  {
    sku: 'ATP-BP-07',
    oem: 'VNFPP281220',
    name: 'FRP Plywood Door Panel 2800x1200x20mm',
    sub: 'FRP Plywood Panels',
    dimensions: '2800 x 1200 x 20mm (3.36 m²)',
    area: '3.36 m²',
    marketPrice: 450.00,
    aurexPrice: 436.00,
    shortDescription: 'Extended height structural FRP plywood core door panel (2800x1200x20mm, 3.36m²). Built for high-abuse commercial trailer barn doors.',
    description: 'Extended 2800mm structural FRP plywood door panel engineered for heavy distribution trailers. Features continuous hardwood veneer core under high-pressure FRP lamination, preventing delamination and puncture under rough freight handling.',
    parameters: 'Dimensions: 2800 x 1200 x 20mm | Area: 3.36m² | Core: High-density Hardwood Plywood | Facings: UV-Stabilized Gloss White Gelcoat | High point-load tolerance',
    technicalSpec: 'High-abuse structural composite rear door panel with excellent fatigue resistance and durable weatherproof edge sealing.',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard',
    fit: 'Suits high-cube trailers and high-impact logistics fleet vehicles'
  },
  {
    sku: 'ATP-BP-08',
    oem: 'VNFPP321220',
    name: 'FRP Plywood Door Panel 3200x1200x20mm',
    sub: 'FRP Plywood Panels',
    dimensions: '3200 x 1200 x 20mm (3.84 m²)',
    area: '3.84 m²',
    marketPrice: 515.00,
    aurexPrice: 499.00,
    shortDescription: 'Maximum height heavy-duty FRP plywood door panel (3200x1200x20mm, 3.84m²). Ultimate impact and fastener holding for linehaul freight.',
    description: 'Commercial 3200mm high structural FRP plywood composite panel. The rigid wood core prevents flex over the 3.2m height, ensuring positive seal contact with rubber gaskets and preventing water and dust ingress during long highway runs.',
    parameters: 'Dimensions: 3200 x 1200 x 20mm | Area: 3.84m² | Core: Exterior Hardwood Plywood | Facings: Impact-Resistant FRP Gelcoat | Weight: ~38 kg',
    technicalSpec: 'Severe-duty interstate trailer barn door panel engineered for structural integrity and high torsional stiffness.',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard',
    fit: 'Suits linehaul semi-trailers, B-doubles, and road train pantechs'
  },
  {
    sku: 'ATP-BP-09',
    oem: 'VNFXP281230',
    name: 'Insulated XPS Composite Panel 2800x1200x30mm',
    sub: 'XPS Insulated Panels',
    dimensions: '2800 x 1200 x 30mm (3.36 m²)',
    area: '3.36 m²',
    marketPrice: 460.00,
    aurexPrice: 446.00,
    shortDescription: 'Thermal insulated FRP extruded polystyrene (XPS) composite panel 30mm thickness. Sized 2800x1200mm for refrigerated bodies and chilled delivery vans.',
    description: 'High-performance thermal insulation sandwich panel manufactured with high-density extruded polystyrene (XPS) closed-cell foam core laminated between smooth food-grade FRP gelcoat skins. Delivers outstanding thermal insulation (low thermal conductivity) and zero moisture absorption for temperature-controlled transport.',
    parameters: 'Dimensions: 2800 x 1200 x 30mm | Area: 3.36m² | Core: High-Density Extruded Polystyrene (XPS 38-42 kg/m³) | Facings: 1.5mm Food-Safe Gloss White FRP | Thermal Conductivity: λ ≤ 0.028 W/m·K',
    technicalSpec: 'Closed-cell thermal sandwich panel for refrigerated truck bodies, chiller vans, and temperature-sensitive pharmaceutical haulage.',
    certification: 'AS/NZS ISO 9001 Approved; HACCP Food Safety Compatible; AS 4256.3 Standards Compliant',
    fit: 'Suits refrigerated van bodies, chiller boxes, and temperature-controlled food transport'
  },
  {
    sku: 'ATP-BP-10',
    oem: 'VNFXP321230',
    name: 'Insulated XPS Composite Panel 3200x1200x30mm',
    sub: 'XPS Insulated Panels',
    dimensions: '3200 x 1200 x 30mm (3.84 m²)',
    area: '3.84 m²',
    marketPrice: 525.00,
    aurexPrice: 509.00,
    shortDescription: 'Thermal insulated FRP extruded polystyrene (XPS) composite panel 3200x1200x30mm. High-efficiency thermal insulation for refrigerated trailers.',
    description: 'Extended 3200mm thermal composite sandwich panel engineered for high-cube refrigerated bodies and cold chain delivery vehicles. The closed-cell XPS core prevents water vapour transmission and frost buildup within the panel core.',
    parameters: 'Dimensions: 3200 x 1200 x 30mm | Area: 3.84m² | Core: High-Density Closed-Cell XPS | Finish: Food-Grade White Gelcoat | Thermal Resistance: R 1.1 m²·K/W',
    technicalSpec: 'High-efficiency thermal insulation composite panel for cold chain logistics and refrigerated pantechs.',
    certification: 'AS/NZS ISO 9001 Approved; HACCP Food Safety Compatible; AS 4256.3 Standards Compliant',
    fit: 'Suits refrigerated semitrailers, chiller pantechs, and cold store delivery vehicles'
  },
  {
    sku: 'ATP-BP-11',
    oem: 'VNFHP432320-RAW',
    name: 'FRP Honeycomb Side Panel 4300x2300x20mm (Industrial Raw Edge)',
    sub: 'FRP Honeycomb Panels',
    dimensions: '4300 x 2300 x 20mm (9.89 m²)',
    area: '9.89 m²',
    marketPrice: 1195.00,
    aurexPrice: 1159.00,
    shortDescription: 'Industrial raw-edge FRP polypropylene honeycomb panel (4300x2300x20mm, 9.89m²). Ready for custom workshop profiling, CNC machining, and edge capping.',
    description: 'Full-size 4300 x 2300 x 20mm FRP honeycomb panel supplied with untrimmed industrial edges for custom bodybuilder fabrication, window/access hatch cutouts, and specialized vehicle fitouts. High-tensile woven roving skins withstand intense road vibration and dynamic body flexing.',
    parameters: 'Dimensions: 4300 x 2300 x 20mm | Area: 9.89m² | Core: Polypropylene Honeycomb | Finish: High-Gloss White Gelcoat | Weight: ~7.5 kg/m²',
    technicalSpec: 'Workshop-grade raw edge structural composite panel for custom vehicle bodybuilders and commercial coachbuilders.',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard; AS 4256.3 Compliance',
    fit: 'Suits custom truck body fabricators, camper conversions, and utility bodies'
  },
  {
    sku: 'ATP-BP-12',
    oem: 'VNERDS205M',
    name: 'EPDM Rubber Door Seal 20mm x 5M',
    sub: 'Door Seals',
    dimensions: '20mm x 5M',
    area: '5.0 Metres',
    marketPrice: 59.50,
    aurexPrice: 57.50,
    shortDescription: 'Heavy-duty commercial EPDM rubber weather and dust seal 20mm x 5.0m for van and truck body rear doors. High UV and ozone resistance.',
    description: 'Commercial grade co-extruded EPDM rubber door seal with reinforced gripping spine and flexible hollow bulb sealing profile. Designed to seal rear barn doors and side access hatches against rain, road grime, dust, and highway air drafts across extreme Australian climate ranges.',
    parameters: 'Profile Width: 20mm | Roll Length: 5.0m | Material: Virgin EPDM Rubber with Internal Steel Carrier | Temperature Range: -40°C to +120°C | Weather & Ozone Proof',
    technicalSpec: 'Automotive grade EPDM weather seal with embedded steel grip channel and bulb/lip seal for commercial truck rear doors.',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard; SAE J200 Compliance',
    fit: 'Suits truck pantech rear doors, refrigerated van doors, and toolbox seals'
  },
  {
    sku: 'ATP-BP-13',
    oem: 'VNPVCDS205M',
    name: 'PVC Door Seal 20mm x 5M',
    sub: 'Door Seals',
    dimensions: '20mm x 5M',
    area: '5.0 Metres',
    marketPrice: 48.50,
    aurexPrice: 47.00,
    shortDescription: 'Commercial flexible co-extruded PVC weather and dust seal 20mm x 5.0m for van and truck body doors. Direct fit for Vanguard bodies.',
    description: 'Commercial grade flexible PVC door seal engineered for sealing truck body and van rear barn doors against rain, road dust, and highway air penetration. Extruded from virgin UV-stabilised PVC compound with high tear strength and elasticity across -30°C to +70°C.',
    parameters: 'Profile Width: 20mm | Length: 5.0m | Flexible co-extruded PVC with sealing flap | UV & Ozone Stabilized | Temperature: -30°C to +70°C',
    technicalSpec: 'Flexible co-extruded PVC weather and dust seal for van and commercial vehicle side and rear barn doors.',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard; AS 3958 Compliance',
    fit: 'Suits pantechs, van rear doors, and truck body perimeter sealing'
  }
];

const WHOLESALER_UPDATES = [
  {
    sku: 'ATP-TP-14',
    name: 'Adjustable Heavy-Duty Steel Cargo Shoring Bar with Quick-Release Lever Handle',
    shortDescription: 'Telescoping steel cargo shoring bar (2270–2590mm) fitted with heavy-duty ratcheting lever handle and non-marking suction rubber feet.',
    description: 'Professional commercial grade adjustable cargo shoring bar manufactured from heavy-gauge galvanized steel tubing. Equipped with an ergonomic quick-release ratcheting lever handle that allows single-handed tensioning and instant cargo locking between trailer sidewalls. Heavy-duty pivoting non-marking rubber feet provide positive, slip-resistant grip against smooth timber, FRP, or aluminium walls without damaging panels.',
    wholesalerRemarks: 'With Handle: Heavy-duty ratcheting lever handle mechanism factory assembled on telescoping tube for rapid tensioning.',
    specs: {
      'Working Range': '2270mm – 2590mm (89.4" – 102.0")',
      'Tube Diameter': '38mm OD Outer Tube / 32mm Inner Tube',
      'Material': 'Galvanized High-Tensile Steel with Heavy-Duty Zinc Plating',
      'Handle Mechanism': 'Quick-Release Ratchet Locking Lever Handle',
      'End Fitting': 'Pivoting Non-Marking Ribbed Rubber Suction Feet (100 x 60mm)',
      'Load Rating': '1,000 kg (2,200 lbs) Working Load Limit (WLL)',
      'Certification': 'AS/NZS ISO 9001 Approved Commercial Transport Standard; EN 12195-1 Compliance',
      'Australian Standard': 'AS/NZS ISO 9001 Commercial Transport Standard Approved',
      'Dimensions': '2270–2590mm Extended x 38mm Tube',
      'Weight': '9.8 kg'
    },
    images: [
      { url: '/images/products/ATP-TP-14-handle.jpg', isPrimary: true },
      { url: '/images/products/ATP-TP-14-schematic.png' },
      { url: 'https://res.cloudinary.com/yltvvyl6/image/upload/v1791476764/aurex_truck_parts/products/ATP-TP-14.jpg' }
    ]
  },
  {
    sku: 'ATP-TP-16',
    name: 'F-Track Spring-Loaded End Fitting with 50mm Webbing Strap',
    shortDescription: 'High-tensile zinc plated F-track spring plunger end fitting supplied with heavy-duty 50mm polyester webbing strap loop.',
    description: 'Heavy-duty steel end fitting engineered specifically for standard F-series vertical and horizontal logistics track. Features a spring-loaded plunger locking pin for positive, rattle-free engagement and is factory assembled with a high-tenacity 50mm polyester webbing strap loop for connecting ratchet buckles, tie-down hooks, or cargo nets.',
    wholesalerRemarks: 'With Strap: Pre-assembled with 50mm industrial polyester webbing strap loop.',
    specs: {
      'Track System': 'Standard F-Track (Series F logistics track slots)',
      'Pin Diameter': '19mm (3/4") Spring-Loaded Plunger Pin',
      'Strap Width': '50mm (2") High-Tenacity Polyester Webbing',
      'Material': 'Forged & Stamped Steel with Yellow/Clear Zinc Chromate Plating',
      'Breaking Strength': '1,800 kg (4,000 lbs)',
      'Working Load Limit': '600 kg (1,320 lbs) WLL',
      'Certification': 'AS/NZS ISO 9001 Approved Commercial Transport Standard; AS/NZS 4380 Compliance',
      'Australian Standard': 'AS/NZS ISO 9001 Commercial Transport Standard Approved',
      'Dimensions': 'L140mm x W50mm x D25mm'
    },
    images: [
      { url: '/images/products/ATP-TP-16-strap.png', isPrimary: true },
      { url: 'https://res.cloudinary.com/yltvvyl6/image/upload/v1791476767/aurex_truck_parts/products/ATP-TP-16.jpg' }
    ]
  },
  {
    sku: 'ATP-TP-17',
    name: 'E & Q-Track Heavy-Duty End Fitting with Webbing Strap & Forged Snap Hook',
    shortDescription: 'Heavy-duty E/Q-track spring clip fitting supplied with industrial 50mm webbing strap and forged steel clevis latch hook.',
    description: 'Premium logistics track connector designed for standard horizontal and vertical E-Track and Q-Track systems. Supplied complete with a high-tenacity 50mm industrial webbing strap and a heavy forged steel clevis snap hook with spring safety latch. Provides instant, ultra-secure anchor attachment for transport restraint chains, cargo nets, and tie-down straps.',
    wholesalerRemarks: 'With Strap & Hook: Supplied complete with reinforced webbing strap and forged safety latch hook.',
    specs: {
      'Track System': 'Universal E-Track & Q-Track (Series E & Series A)',
      'Strap Width': '50mm (2") Industrial Heavy-Duty Polyester Webbing',
      'Hook Type': 'Forged Alloy Steel Clevis Snap Hook with Spring Safety Latch',
      'Material': 'High-Tensile Zinc Dichromate Plated Carbon Steel',
      'Breaking Strength': '2,270 kg (5,000 lbs)',
      'Working Load Limit': '750 kg (1,650 lbs) WLL',
      'Certification': 'AS/NZS ISO 9001 Approved Commercial Transport Standard; AS/NZS 4380 & DOT Compliance',
      'Australian Standard': 'AS/NZS ISO 9001 Commercial Transport Standard Approved',
      'Dimensions': 'L220mm Overall x W65mm'
    },
    images: [
      { url: '/images/products/ATP-TP-17-strap.jpg', isPrimary: true },
      { url: 'https://res.cloudinary.com/yltvvyl6/image/upload/v1791476769/aurex_truck_parts/products/ATP-TP-17.jpg' }
    ]
  },
  {
    sku: 'ATP-TP-01',
    name: '27mm Commercial Door Locking Gear Kit with Lever Handle (200L / 200R)',
    shortDescription: 'Complete 27mm heavy-duty commercial truck & trailer cam door lock kit with operating lever handle, keepers, and pipe brackets. 200L / 200R sets.',
    description: 'Complete commercial vehicle rear door lock hardware system engineered for 27mm (1-1/16") OD locking pipe. Package includes heavy forged steel top and bottom locking cams, matched heavy-duty keeper brackets, reinforced pipe guide brackets with nylon anti-vibration bushings, and an ergonomic operating lever handle with integrated padlock hole and safety latch catch.',
    wholesalerRemarks: 'With Handle (200L+200R): Supplied complete with lever handle, keepers, and cams for Left-Hand and Right-Hand installations.',
    specs: {
      'Pipe Compatibility': 'Standard 27mm OD (1-1/16") Lock Rod Tube',
      'Configuration': 'Complete Set with Lever Handle (200L Left-Hand / 200R Right-Hand Available)',
      'Material': 'High-Grade Forged & Stamped Carbon Steel',
      'Finish': 'Heavy Hot-Dip Galvanized / Bright Zinc Plated (>12µm)',
      'Corrosion Resistance': 'ASTM B117 72-Hour Salt Spray Tested',
      'Certification': 'AS/NZS ISO 9001 Approved Commercial Transport Standard',
      'Australian Standard': 'AS/NZS ISO 9001 Commercial Transport Standard Approved',
      'Dimensions': 'Suits 27mm OD Tube; Handle Length 340mm; Base 180x38mm'
    },
    images: [
      { url: '/images/products/ATP-TP-01-gl11113.jpg', isPrimary: true },
      { url: '/images/products/ATP-TP-01-schematic.png' },
      { url: 'https://res.cloudinary.com/yltvvyl6/image/upload/v1791476735/aurex_truck_parts/products/ATP-TP-01.jpg' }
    ]
  },
  {
    sku: 'ATP-TP-02',
    name: '27mm Commercial Cam Gear Sub-Assembly (Less Operating Handle)',
    shortDescription: '27mm steel cam door lock hardware kit without handle / latch for custom workshop lever installations.',
    wholesalerRemarks: 'Without Latch: Cam and keeper gear sub-assembly without operating lever handle.',
    specs: {
      'Pipe Compatibility': 'Standard 27mm OD (1-1/16") Lock Rod Tube',
      'Configuration': 'Cam & Keeper Sub-Assembly (Less Handle / Latch)',
      'Material': 'Drop-Forged High-Tensile Steel with Heavy Zinc Plating',
      'Certification': 'AS/NZS ISO 9001 Approved Commercial Transport Standard',
      'Australian Standard': 'AS/NZS ISO 9001 Commercial Transport Standard Approved'
    }
  },
  {
    sku: 'ATP-TP-22',
    name: 'Heavy-Duty Commercial Tubular Grab Handle (Without Mounting Base)',
    shortDescription: 'Direct weld-on / bolt-through 330mm tubular steel commercial grab handle without separate base flanges.',
    wholesalerRemarks: 'Without Mounting Base: Direct tubular ends without mounting base plates.',
    specs: {
      'Length': '330 mm',
      'Height / Standoff': '50 mm',
      'Mounting': 'Direct Weld-On / Bolt-Through (Without Mounting Base Flanges)',
      'Material': 'Cold-Drawn Heavy-Wall Steel Tubing (Ø25mm OD)',
      'Certification': 'AS/NZS ISO 9001 Approved Commercial Transport Standard',
      'Australian Standard': 'AS/NZS ISO 9001 Commercial Transport Standard Approved'
    }
  },
  {
    sku: 'ATP-TP-20',
    name: 'Stainless Steel Flush Paddle Handle Lock with Sealed Lock Cylinder',
    shortDescription: 'Heavy-duty 304 stainless steel recessed paddle latch with neoprene gasket, 2 keys, and blind mounting studs.',
    images: [
      { url: '/images/products/ATP-TP-20-paddle.png', isPrimary: true },
      { url: 'https://res.cloudinary.com/yltvvyl6/image/upload/v1791476774/aurex_truck_parts/products/ATP-TP-20.jpg' }
    ],
    specs: {
      'Dimensions': '120mm Width x 92mm Height x 45mm Depth',
      'Cutout Size': '93mm x 67mm',
      'Material': 'Grade 304 Polished Stainless Steel Pan & Paddle',
      'Waterproof Rating': 'IP65 Weather & Dust Ingress Protection',
      'Certification': 'AS/NZS ISO 9001 Approved Commercial Transport Standard',
      'Australian Standard': 'AS/NZS ISO 9001 Commercial Transport Standard Approved'
    }
  },
  {
    sku: 'ATP-TP-13',
    name: 'Guangzhou Heavy-Duty Canvas Support Stand 1250mm Width',
    shortDescription: 'Commercial tubular steel canvas and tarp support arch stand 1250mm width x 1600mm height. High-durability black powder coat.',
    wholesalerRemarks: 'Guangzhou Winnie Quotation Item: Width 1250mm x Height 1600mm Canvas Stand',
    specs: {
      'Width': '1250 mm',
      'Height': '1600 mm',
      'Tube Specification': '32mm OD x 2.5mm Wall Structural Steel Tubing',
      'Finish': 'Electrostatically Applied UV-Resistant Black Powder Coat',
      'Certification': 'AS/NZS ISO 9001 Approved Commercial Transport Standard',
      'Australian Standard': 'AS/NZS ISO 9001 Commercial Transport Standard Approved'
    }
  },
  {
    sku: 'ATP-TP-11',
    name: 'Guangzhou Heavy-Duty Canvas Support Stand 1995mm Width',
    shortDescription: 'Commercial tubular steel canvas and tarp support arch stand 1995mm width x 1600mm height. Standard semitrailer span.',
    wholesalerRemarks: 'Guangzhou Winnie Quotation Item: Width 1995mm x Height 1600mm Canvas Stand',
    specs: {
      'Width': '1995 mm',
      'Height': '1600 mm',
      'Tube Specification': '32mm OD x 2.5mm Wall Structural Steel Tubing',
      'Finish': 'Electrostatically Applied UV-Resistant Black Powder Coat',
      'Certification': 'AS/NZS ISO 9001 Approved Commercial Transport Standard',
      'Australian Standard': 'AS/NZS ISO 9001 Commercial Transport Standard Approved'
    }
  },
  {
    sku: 'ATP-TP-12',
    name: 'Guangzhou Heavy-Duty Canvas Support Stand 2045mm Width',
    shortDescription: 'Commercial tubular steel canvas and tarp support arch stand 2045mm width x 1600mm height. Wide high-cube trailer span.',
    wholesalerRemarks: 'Guangzhou Winnie Quotation Item: Width 2045mm x Height 1600mm Canvas Stand',
    specs: {
      'Width': '2045 mm',
      'Height': '1600 mm',
      'Tube Specification': '32mm OD x 2.5mm Wall Structural Steel Tubing',
      'Finish': 'Electrostatically Applied UV-Resistant Black Powder Coat',
      'Certification': 'AS/NZS ISO 9001 Approved Commercial Transport Standard',
      'Australian Standard': 'AS/NZS ISO 9001 Commercial Transport Standard Approved'
    }
  }
];

async function syncAtlas() {
  const uri = process.env.MONGO_URI || 'mongodb+srv://aurextruckparts_db_user:XJy8qwWdtL8xa9_@truckparts.fts4dkk.mongodb.net/test?retryWrites=true&w=majority';
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log('✅ Connected to MongoDB Atlas:', mongoose.connection.host, `(DB: ${mongoose.connection.name})`);

  const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const Brand = mongoose.model('Brand', new mongoose.Schema({}, { strict: false }));

  // 1. Locate Accessories Category
  let accCat = await Category.findOne({ slug: 'accessories' });
  if (!accCat) {
    accCat = await Category.findOne({ name: /accessories/i });
  }
  if (!accCat) {
    console.log('Creating Accessories category...');
    accCat = await Category.create({
      name: 'Accessories',
      slug: 'accessories',
      description: 'Rubber buffers, steel toolboxes, chrome wheel nut covers, composite body panels and commercial vehicle accessories.',
      image: { url: 'https://res.cloudinary.com/yltvvyl6/image/upload/v1791476759/aurex_truck_parts/categories/ACCESSORIES-CAT.jpg' },
      isFeatured: true,
      displayOrder: 3
    });
  }
  console.log(`Using Accessories category ID: ${accCat._id} (slug: ${accCat.slug})`);

  // Remove any legacy "body-panels" category if it exists
  const deletedCat = await Category.deleteOne({ slug: 'body-panels' });
  if (deletedCat.deletedCount > 0) {
    console.log('Removed legacy "body-panels" category doc from Atlas.');
  }

  let brand = await Brand.findOne({ name: /Aurex/i });
  const brandId = brand ? brand._id : accCat._id;

  // 2. Seed 13 Products (ATP-BP-01 to 13) into Accessories
  console.log('\n--- Seeding 13 Commercial Body Panels into Accessories ---');
  for (const item of PRODUCTS_13) {
    const slug = `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${item.sku.toLowerCase()}`;
    const productDoc = {
      name: item.name,
      sku: item.sku,
      oemPartNumber: item.oem,
      brand: brandId,
      brandName: 'Aurex Panels',
      category: accCat._id,
      categories: [accCat._id],
      categorySlug: 'accessories',
      sub: item.sub,
      pricing: {
        mrp: item.marketPrice,
        sellingPrice: item.aurexPrice,
        tradePrice: Math.round(item.aurexPrice * 0.9),
        isPOA: true,
        discountType: 'PERCENTAGE',
        discountValue: 3
      },
      status: 'PUBLISHED',
      isBuyable: false,
      isFeatured: true,
      stockStatus: 'Enquiry only',
      lead: 'Custom Quote / Ex-Stock VIC',
      fit: item.fit,
      shortDescription: item.shortDescription,
      description: item.description,
      desc: item.description,
      images: [
        {
          url: `/images/products/${item.sku}.webp`,
          publicId: `aurex_truck_parts/products/${item.sku}`,
          alt: item.name,
          sortOrder: 0,
          isPrimary: true
        }
      ],
      imageUrl: `/images/products/${item.sku}.webp`,
      specs: {
        Dimensions: item.dimensions,
        'Surface Area': item.area,
        'Market Benchmark Price': `$${item.marketPrice.toFixed(2)} AUD`,
        'Aurex Fleet Price': `$${item.aurexPrice.toFixed(2)} AUD (~3% below market)`,
        'Product Parameter': item.parameters,
        'Technical Specification': item.technicalSpec,
        Certification: item.certification,
        'Australian Standard': item.certification
      },
      specifications: [
        { label: 'Dimensions', value: item.dimensions },
        { label: 'Surface Area', value: item.area },
        { label: 'Market Benchmark', value: `$${item.marketPrice.toFixed(2)} AUD` },
        { label: 'Aurex Target Price', value: `$${item.aurexPrice.toFixed(2)} AUD (~3% below market)` },
        { label: 'Product Parameter', value: item.parameters },
        { label: 'Technical Specification', value: item.technicalSpec },
        { label: 'Certification', value: item.certification },
        { label: 'Australian Standard', value: item.certification }
      ],
      badges: [
        { label: 'Enquiry Only', type: 'warning' },
        { label: '~3% Below Market', type: 'success' }
      ],
      slug,
      rating: 4.8,
      reviewCount: 16
    };

    await Product.findOneAndUpdate(
      { sku: item.sku },
      { $set: productDoc },
      { upsert: true, new: true }
    );
    console.log(`✓ Seeded ${item.sku}: ${item.name} ($${item.aurexPrice} AUD, Category: accessories)`);
  }

  // 3. Update existing products with factory remarks & Ganland images/schematics
  console.log('\n--- Syncing Wholesaler Remarks & Images for Existing Products ---');
  for (const upd of WHOLESALER_UPDATES) {
    const existing = await Product.findOne({ sku: upd.sku });
    if (!existing) {
      console.log(`Skipping ${upd.sku} (not found in DB)`);
      continue;
    }

    const setObj = {};
    if (upd.name) setObj.name = upd.name;
    if (upd.shortDescription) setObj.shortDescription = upd.shortDescription;
    if (upd.description) {
      setObj.description = upd.description;
      setObj.desc = upd.description;
    }
    if (upd.wholesalerRemarks) setObj.wholesalerRemarks = upd.wholesalerRemarks;
    if (upd.specs) {
      setObj.specs = { ...(existing.specs || {}), ...upd.specs };
      const newSpecsArray = Object.entries(setObj.specs).map(([label, value]) => ({ label, value: String(value) }));
      setObj.specifications = newSpecsArray;
    }
    if (upd.images && upd.images.length > 0) {
      setObj.images = upd.images;
      setObj.imageUrl = upd.images[0].url;
    }

    await Product.updateOne({ sku: upd.sku }, { $set: setObj });
    console.log(`✓ Updated ${upd.sku}: remarks="${upd.wholesalerRemarks || 'updated'}" (${(upd.images || []).length} images)`);
  }

  // 4. Update Accessories Category Product Count
  const totalAcc = await Product.countDocuments({
    $or: [
      { category: accCat._id },
      { categories: accCat._id },
      { categorySlug: 'accessories' }
    ],
    status: 'PUBLISHED'
  });
  console.log(`\nTotal published products in Accessories category: ${totalAcc}`);
  accCat.count = totalAcc;
  accCat.productCount = totalAcc;
  await accCat.save();
  console.log(`✅ Updated Accessories category product count to: ${totalAcc}`);

  // Total DB products summary
  const totalProducts = await Product.countDocuments({ status: 'PUBLISHED' });
  console.log(`✅ Total active published products in Atlas DB: ${totalProducts}`);

  await mongoose.disconnect();
  console.log('✅ MongoDB connection closed. All operations completed successfully.');
}

syncAtlas().catch(err => {
  console.error('❌ Error during Atlas sync:', err);
  process.exit(1);
});
