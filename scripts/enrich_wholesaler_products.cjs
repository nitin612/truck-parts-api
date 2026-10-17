const mongoose = require('mongoose');

const enrichments = {
  // --- GANLAND CAM DOOR LOCKS & HARDWARE ---
  'ATP-TP-01': {
    name: '27mm Heavy-Duty Cam Door Lock Kit Zinc Plated (GL-11113)',
    shortDescription: 'Commercial 27mm rear door locking gear kit complete with dual cams, heavy-duty keepers, forged handle, and anti-rattle mounting brackets. High-tensile zinc plated for Australian commercial freight.',
    description: 'The Aurex GL-11113 Cam Door Lock Kit is an industry-standard rear door locking mechanism engineered specifically for Australian commercial dry freight pantechs, refrigerated vans, and heavy-duty box trailers. Designed to accommodate standard 27mm (OD) pipe, this heavy-duty assembly provides positive locking engagement that resists extreme vibration and torsional chassis flex during linehaul transport. Features forged steel cams and heavy cast keepers with a >7µm zinc-nickel passivated coating providing exceptional corrosion resistance against road salts and coastal weathering. Includes an ergonomic lever handle with an integrated padlock eyelet and anti-rattle nylon mounting brackets for smooth, silent operation.',
    specifications: [
      { label: 'Pipe Diameter', value: '27 mm OD (Outer Diameter)' },
      { label: 'Material', value: 'High-tensile forged & stamped carbon steel' },
      { label: 'Surface Finish', value: 'Electro-galvanised zinc plated (>7µm passivation)' },
      { label: 'Kit Inclusions', value: '2x Cams, 2x Keepers, 3x Mounting Brackets, 1x Handle, 1x Handle Retainer' },
      { label: 'Assembly Weight', value: '5.4 kg (excluding pipe)' },
      { label: 'Locking Type', value: 'Over-center compression cam with padlock hole' },
      { label: 'Applications', value: 'Pantech trucks, curtainsider rear doors, logistics dry freight boxes' },
      { label: 'Standards', value: 'Complies with Australian commercial road transport body builder requirements' }
    ]
  },
  'ATP-TP-02': {
    name: '27mm Steel Cam Door Locking Gear Assembly Less Handle',
    shortDescription: 'Replacement 27mm pipe cam lock hardware assembly including dual heavy-duty locking cams, chassis keepers, and pivot brackets. Ideal for custom handle retrofits.',
    description: 'Engineered as a direct workshop replacement sub-assembly, this 27mm Cam Door Lock set provides the critical upper and lower locking points for truck and semi-trailer rear barn doors. Manufactured from high-tensile stamped steel with heavy-duty zinc protective plating, it includes two high-leverage cams, two frame-mounting keepers, and reinforced split-bracket assemblies. Supplied less the lower operating handle to allow fleet workshops to retain existing custom linkages or install specialized security handles.',
    specifications: [
      { label: 'Pipe Diameter', value: '27 mm OD' },
      { label: 'Material', value: 'High-grade carbon structural steel' },
      { label: 'Finish', value: 'Heavy zinc passivated anti-rust coating' },
      { label: 'Inclusions', value: '2x Top/Bottom Cams, 2x Weld/Bolt-on Keepers, 3x Heavy Pipe Brackets' },
      { label: 'Handle Configuration', value: 'Less handle (bare gear assembly)' },
      { label: 'Applications', value: 'Workshop repairs, custom body builds, replacement cam points' }
    ]
  },
  'ATP-TP-03': {
    name: '27mm Marine-Grade 304 Stainless Steel Cam Door Lock Kit (GL-11113S)',
    shortDescription: 'Premium grade 304 stainless steel 27mm rear door locking gear kit with mirror-polished finish. Maximum corrosion resistance for refrigerated, food transport, and coastal fleets.',
    description: 'The Aurex GL-11113S is the ultimate heavy-duty cam lock kit manufactured entirely from premium AISI 304 stainless steel. Specifically tailored for refrigerated pantechs (reefers), washdown chemical trailers, food service logistics, and coastal fleet operations where conventional zinc-plated hardware succumbs to corrosion. The mirror-polished finish not only offers sleek aesthetics but prevents bacterial harborage in sanitary food transport. Engineered for 27mm OD stainless pipe, featuring precision-cast stainless cams, reinforced keepers, and a robust spring-retained handle with safety secondary catch.',
    specifications: [
      { label: 'Pipe Diameter', value: '27 mm OD' },
      { label: 'Material', value: 'AISI 304 Marine-Grade Stainless Steel' },
      { label: 'Finish', value: 'Electropolished & mirror-buffed finish' },
      { label: 'Corrosion Resistance', value: 'Severe marine, saltwater, and chemical washdown proof' },
      { label: 'Kit Inclusions', value: '2x 304SS Cams, 2x 304SS Keepers, 3x 304SS Brackets, 1x 304SS Handle' },
      { label: 'Assembly Weight', value: '5.6 kg' },
      { label: 'Hygiene Rating', value: 'HACCP & food-grade washdown compliant' },
      { label: 'Applications', value: 'Refrigerated reefers, chemical haulage, milk tankers, livestock trailers' }
    ]
  },
  'ATP-TP-04': {
    name: 'Heavy-Duty Steel Weld-On Rear Door Hinge with Brass Bush (GL-13112)',
    shortDescription: 'Industrial forged steel weld-on rear door hinge with self-lubricating brass bushing and stainless steel hinge pin. Rated for commercial pantech and trailer doors.',
    description: 'Heavy-duty commercial forged steel door hinge engineered for linehaul semi-trailers, tippers, and rigid pantech bodies. Features an integral self-lubricating sintered brass bushing and a centerless-ground stainless steel pivot pin to prevent binding, sagging, and galling under high-tonnage door loads. The weldable steel flap allows permanent, high-strength integration directly onto the rear corner frame pillar, while the bolt-on door blade provides precise alignment and easy serviceability during door replacements.',
    specifications: [
      { label: 'Material', value: 'Forged carbon structural steel flap' },
      { label: 'Pivot Bushing', value: 'Sintered self-lubricating brass sleeve' },
      { label: 'Hinge Pin', value: 'Heavy stainless steel anti-shear pin' },
      { label: 'Mounting Style', value: 'Weld-on frame post / bolt-on door blade' },
      { label: 'Rotation Angle', value: '270 degrees full swing clearance' },
      { label: 'Applications', value: 'Pantech rear doors, tipper tailgates, container doors' }
    ]
  },
  'ATP-TP-05': {
    name: 'Heavy-Duty Steel Strap Hinge with Grease Nipple (GL-13198B)',
    shortDescription: 'Heavy-gauge zinc-plated steel strap hinge equipped with an integrated grease nipple (zerk) for continuous lubrication. Designed for severe-duty trailer and tailgate applications.',
    description: 'Engineered for high-mileage road transport where regular fleet maintenance is paramount, the GL-13198B strap hinge features an integrated grease nipple allowing quick greasing without door disassembly. Fabricated from 6mm heavy-gauge structural carbon steel with a durable zinc-plated protective layer, this hinge resists shock loads and harsh unsealed road vibrations. Ideal for rear barn doors, dropside tipper gates, and equipment access panels.',
    specifications: [
      { label: 'Material', value: '6 mm Heavy-gauge carbon steel' },
      { label: 'Lubrication', value: 'Standard hydraulic grease zerk fitting' },
      { label: 'Finish', value: 'Heavy zinc passivated anti-corrosion coating' },
      { label: 'Hole Pattern', value: 'Countersunk pre-drilled bolt holes for M10 hardware' },
      { label: 'Rotation', value: '180 - 270 degree articulation' },
      { label: 'Applications', value: 'Tipper tailgates, drop deck side gates, farm trailers, pantechs' }
    ]
  },

  // --- CAIYUAN HARDWARE ---
  'ATP-TP-06': {
    name: '304 Stainless Steel Side Door Strap Hinge Mirror Polished (A02-01S-01)',
    shortDescription: 'Grade 304 polished stainless steel side door strap hinge. 100% rustproof design for curtainsider front curtains, service vehicle side access doors, and toolboxes.',
    description: 'Precision manufactured by Guangzhou Caiyuan Hardware, the A02-01S-01 side door hinge is fabricated from solid 304-grade stainless steel with a mirror-polished finish. Designed specifically for vehicle body builders constructing service bodies, utility canopies, generator enclosures, and side access doors. The stainless steel construction ensures zero rust stains down painted bodywork even after years of continuous exposure to coastal highway conditions.',
    specifications: [
      { label: 'Manufacturer Part No', value: 'A02-01S-01' },
      { label: 'Material', value: 'AISI 304 Stainless Steel' },
      { label: 'Surface Finish', value: 'High-buff mirror polish' },
      { label: 'Fixing Holes', value: 'Pre-punched countersunk mounting holes' },
      { label: 'Corrosion Resistance', value: 'Grade 304 marine/atmospheric salt spray resistant' },
      { label: 'Applications', value: 'Canopy side doors, service bodies, horse floats, electrical enclosures' }
    ]
  },
  'ATP-TP-07': {
    name: 'Galvanized Steel Q-Track Horizontal Cargo Rail 4.5M (GL-19113H1)',
    shortDescription: 'Heavy-duty 4.5 metre galvanized steel Q-track cargo restraint rail. Engineered for heavy interior shoring beams, decking bars, and ratchet straps in pantechs.',
    description: 'The Aurex GL-19113H1 is a continuous 4.5m commercial Q-Track cargo control rail roll-formed from 2.5mm high-yield structural steel. Designed to be riveted or bolted horizontally along the internal wall framing of dry freight pantechs, furniture trucks, and semi-trailers. Accepts standard Q-track spring-loaded end fittings, round shoring beams, and heavy tie-down clip rings to provide flexible, multi-level load containment that complies with the National Heavy Vehicle Regulator (NHVR) Load Restraint Guide.',
    specifications: [
      { label: 'Length', value: '4500 mm (4.5 Metres)' },
      { label: 'Profile Type', value: 'Heavy-duty Q-Track slot profile' },
      { label: 'Material', value: '2.5 mm High-tensile carbon steel' },
      { label: 'Finish', value: 'Hot-dip galvanized / heavy electro-zinc' },
      { label: 'Working Load Limit', value: '1,000 kg per restraint point (depending on chassis fixing)' },
      { label: 'Compliance', value: 'Meets NHVR Load Restraint Guide 2018 requirements' },
      { label: 'Applications', value: 'Pantech interiors, furniture pan lines, freight forwarders' }
    ]
  },
  'ATP-TP-08': {
    name: '304 Stainless Steel Q-Track Cargo Shoring Rail 4.5M (GL-19113S)',
    shortDescription: 'Premium grade 304 stainless steel 4.5m Q-track interior cargo rail. Designed for washdown refrigerated transport, meat rails, and pharmaceutical fleets.',
    description: 'Precision roll-formed from Grade 304 stainless steel, this 4.5m continuous Q-Track rail is engineered for high-hygiene refrigerated bodies and food transport vans where regular high-pressure caustic steam cleaning is required. Unlike galvanized track that eventually oxidizes and stains insulation linings, 304 stainless steel remains completely inert, rust-free, and sanitary. Features standard Q-track keyed slots spaced for flexible positioning of insulated shoring bars and cargo nets.',
    specifications: [
      { label: 'Length', value: '4500 mm (4.5 Metres)' },
      { label: 'Material', value: 'Grade 304 Stainless Steel' },
      { label: 'Finish', value: 'Mill finish / passivated' },
      { label: 'Hygiene Standard', value: 'HACCP & food-safe certified' },
      { label: 'Compatibility', value: 'Standard Q-fittings, stainless shoring beams, tie-down clips' },
      { label: 'Applications', value: 'Reefer bodies, seafood haulage, medical & pharmaceutical delivery' }
    ]
  },
  'ATP-TP-09': {
    name: 'Galvanized Steel F-Track Interior Cargo Shoring Rail 3050x132x2mm (GL-19111H1)',
    shortDescription: 'Industrial 3.05m galvanized steel F-track cargo restraint rail (132mm wide x 2mm thickness). Universal hole pattern for standard commercial shoring bars.',
    description: 'Roll-formed from 2.0mm high-tensile steel, this 3050mm F-Track profile features standard vertical series F slots designed for rapid adjustment of spring-loaded round shoring bars and decking beams. Widely installed across Australian dry freight pantechs and distribution rigids. The 132mm profile width provides generous surface contact for secure chassis riveting, and the heavy zinc galvanizing provides durable protection against scuffs from pallet jacks and forklift tines.',
    specifications: [
      { label: 'Length', value: '3050 mm (3.05 Metres)' },
      { label: 'Width', value: '132 mm profile' },
      { label: 'Thickness', value: '2.0 mm heavy-gauge steel' },
      { label: 'Finish', value: 'Zinc electro-galvanized' },
      { label: 'Slot Profile', value: 'Standard Series F round / slot pattern' },
      { label: 'Applications', value: 'Dry freight vans, metro parcel delivery, pantech side walls' }
    ]
  },
  'ATP-TP-10': {
    name: 'Heavy-Duty Zinc Plated Dropside Corner Post / Column (F07-04C-01)',
    shortDescription: 'Fabricated heavy-duty steel dropside upright post with zinc-plated anti-corrosion finish. Designed for flatbed bodies, farm tippers, and dropside utility trays.',
    description: 'Manufactured by Guangzhou Caiyuan Hardware (Part F07-04C-01), this heavy-duty steel upright column is engineered for dropside truck trays, flatbed semi-trailers, and agricultural tippers. Designed to anchor dropside gates securely under load, with precision-located hinge sockets and latch catches. The entire assembly is hot-dip zinc plated to prevent corrosion from rain, dirt, and fertilizer exposure.',
    specifications: [
      { label: 'Part Number', value: 'F07-04C-01' },
      { label: 'Material', value: 'Heavy structural hollow section steel' },
      { label: 'Surface Finish', value: 'Heavy zinc electro-plated' },
      { label: 'Mounting Style', value: 'Socket-mount / removable corner pillar' },
      { label: 'Applications', value: 'Dropside truck bodies, tipper side coamings, flatbed trailers' }
    ]
  },
  'ATP-TP-11': {
    name: 'Heavy-Duty Tautliner Canvas Roof Stand Arch 1995x1600mm Powder Coated',
    shortDescription: 'Curtainsider steel roof support arch stand (1995mm W x 1600mm H). Heavy-gauge tubular steel construction with tough powder-coated finish for commercial tautliners.',
    description: 'Fabricated by Caiyuan Hardware to precision engineering drawings, this 1995mm wide by 1600mm high canvas stand provides structural support for the curtain roof and pelmet system on commercial curtainsider (tautliner) semi-trailers. Manufactured from heavy-wall tubular steel and coated with high-adhesion electrostatic powder coating, it resists wind buffeting, roof sagging, and abrasive canvas wear during highway linehaul operation.',
    specifications: [
      { label: 'Width (W)', value: '1995 mm' },
      { label: 'Height (H)', value: '1600 mm' },
      { label: 'Material', value: 'Structural tubular carbon steel' },
      { label: 'Surface Finish', value: 'Durable architectural powder coat' },
      { label: 'Function', value: 'Curtain canvas roof arch support & structural stabilization' },
      { label: 'Applications', value: 'Tautliner trailers, curtainsider rigids, truck canvas canopies' }
    ]
  },
  'ATP-TP-12': {
    name: 'Heavy-Duty Tautliner Canvas Roof Stand Arch 2045x1600mm Powder Coated',
    shortDescription: 'Curtainsider steel roof support arch stand (2045mm W x 1600mm H). High-strength tubular steel frame with weather-resistant powder coating.',
    description: 'Engineered for wider tautliner bodies and standard 2.5m wide commercial semi-trailers, this 2045mm x 1600mm canvas stand supports the upper roof structure, pelmet tracks, and tensioned roof tarp. Built from precision-bent structural steel tubing with reinforced gusseting and coated in high-durability powder coat to prevent rust and canvas discoloration.',
    specifications: [
      { label: 'Width (W)', value: '2045 mm' },
      { label: 'Height (H)', value: '1600 mm' },
      { label: 'Material', value: 'Heavy structural steel tube' },
      { label: 'Finish', value: 'Powder coated protective finish' },
      { label: 'Applications', value: 'Curtainsider semi-trailers, linehaul tautliners, B-double lead trailers' }
    ]
  },
  'ATP-TP-13': {
    name: 'Heavy-Duty Tautliner Canvas Roof Stand Arch 1250x1600mm Powder Coated',
    shortDescription: 'Curtainsider steel roof support arch stand (1250mm W x 1600mm H). Compact tubular steel frame for medium rigid tautliners and drop-deck front sections.',
    description: 'Designed for narrower body specifications, drop-deck goose-neck transitions, and medium-rigid curtainsiders, this 1250mm x 1600mm canvas stand provides robust upper roof support. Heavy tubular steel construction with precision welded mounting plates and high-grade baked powder coat finish ensures long service life without structural fatigue.',
    specifications: [
      { label: 'Width (W)', value: '1250 mm' },
      { label: 'Height (H)', value: '1600 mm' },
      { label: 'Material', value: 'Structural tubular steel' },
      { label: 'Finish', value: 'Electrostatic powder coated' },
      { label: 'Applications', value: 'Medium rigid curtainsiders, drop deck trailer neck sections' }
    ]
  },
  'ATP-TP-14': {
    name: 'Adjustable Heavy-Duty Steel Cargo Shoring Bar with Lever Handle (GL-15616)',
    shortDescription: 'Heavy-duty telescoping steel cargo shoring bar with quick-action ratcheting lever handle and non-marking rubber feet. Universal fit for pantechs and containers.',
    description: 'The Aurex GL-15616 Cargo Bar provides fast, secure cargo blocking and bracing inside truck bodies, shipping containers, and pantech trailers without requiring wall tracks. Features a heavy-duty steel telescoping shaft with a quick-release mechanical lever ratchet mechanism that applies positive holding pressure against trailer sidewalls. Heavy-duty articulated rubber foot pads pivot to grip uneven walls without marring interior composite panels or gelcoat liners.',
    specifications: [
      { label: 'Part Number', value: 'GL-15616' },
      { label: 'Material', value: 'Heavy structural steel tube with cast lever handle' },
      { label: 'Adjustment Range', value: '2260 mm to 2630 mm (Standard commercial width)' },
      { label: 'Foot Pads', value: 'Heavy-duty non-slip articulated rubber feet' },
      { label: 'Mechanism', value: 'Positive-action mechanical locking lever with safety latch' },
      { label: 'Applications', value: 'Dry freight restraint, pallet securing, logistics shoring' }
    ]
  },
  'ATP-TP-15': {
    name: 'Heavy-Duty Zinc Plated Spring-Loaded Shoot Bolt Latch (GL-ASJ04)',
    shortDescription: 'Industrial spring-loaded shoot bolt with hold-open retention notch and zinc-plated carbon steel body. Essential for tailgate, drop gate, and door securing.',
    description: 'The GL-ASJ04 is an industrial-duty spring-loaded shoot bolt engineered for rapid, positive locking of commercial truck tailgates, tipper side gates, utility toolboxes, and horse float ramps. Built with a heavy-gauge zinc-plated steel housing and an internal heavy-duty compression spring that drives the solid steel bolt firmly into the keeper. Features a 90-degree twist-lock hold-back notch allowing the bolt to remain retracted during loading and unloading.',
    specifications: [
      { label: 'Part Number', value: 'GL-ASJ04' },
      { label: 'Bolt Diameter', value: '12 mm solid steel pin' },
      { label: 'Material', value: 'High-tensile zinc plated carbon steel' },
      { label: 'Operation', value: 'Spring-loaded with twist-lock hold-back detent' },
      { label: 'Mounting Style', value: 'Bolt-on or weld-on steel bracket' },
      { label: 'Applications', value: 'Tipper tailgates, dropside trays, equipment access hatches' }
    ]
  },
  'ATP-TP-16': {
    name: 'Steel F-Track Shoring Beam End Fitting with Webbing Strap Loop (GL-19120)',
    shortDescription: 'Heavy-duty zinc plated steel end fitting with integrated high-strength webbing strap loop. Connects directly into standard F-track cargo restraint systems.',
    description: 'Engineered by Ganland (GL-19120), this heavy-duty stamped steel end fitting connects directly into series F track slots on dry freight pantechs. Incorporates an integrated steel buckle loop designed for sewing into heavy 50mm tie-down webbing or ratchet assemblies, allowing drivers to anchor cargo directly into wall rails with positive locking security.',
    specifications: [
      { label: 'Part Number', value: 'GL-19120' },
      { label: 'Track Compatibility', value: 'Universal Series F Track (OD 19mm - 25mm)' },
      { label: 'Material', value: 'Stamped high-tensile carbon steel' },
      { label: 'Finish', value: 'Zinc plated passivated finish' },
      { label: 'Strap Compatibility', value: 'Suits standard 50 mm commercial webbing' },
      { label: 'Applications', value: 'Cargo restraint straps, internal pallet tie-downs' }
    ]
  },
  'ATP-TP-17': {
    name: 'Steel Cargo Track Spring-Loaded End Fitting with Hook (GL-19117)',
    shortDescription: 'Spring-loaded steel track end fitting with heavy forged hook. Snaps into cargo track rails to provide an instant high-load anchor point.',
    description: 'The GL-19117 is a heavy-duty spring-loaded steel end fitting designed for instant snap-in locking into commercial cargo tracks. Features an internal tempered steel return spring that locks the locating dog securely into the track aperture, preventing accidental dislodgement during transport vibration. Fitted with a forged steel clevis hook for direct connection to chains, strap snap-hooks, and cargo nets.',
    specifications: [
      { label: 'Part Number', value: 'GL-19117' },
      { label: 'Material', value: 'Forged and stamped carbon steel' },
      { label: 'Finish', value: 'Zinc electro-plated' },
      { label: 'Locking Style', value: 'Spring-loaded quick-release plunger' },
      { label: 'Applications', value: 'E-track, Q-track, and universal logistics tracks' }
    ]
  },
  'ATP-TP-18': {
    name: 'Heavy-Duty Zinc Plated T-Style Truck Door Hold-Back Retainer (GL-16513)',
    shortDescription: 'Heavy-duty steel T-style door retainer catch. Secures rear and side barn doors flush against the truck body during loading and unloading.',
    description: 'The Aurex GL-16513 T-Style Door Retainer is a rugged hold-back catch designed to lock truck barn doors in the open 270-degree position against the body side wall. Prevents doors from swinging shut unexpectedly in heavy wind gusts or on inclined loading docks, protecting loading personnel and dock equipment. Fabricated from heavy-gauge carbon steel with a deep zinc-plated coating, featuring a positive spring retention jaw.',
    specifications: [
      { label: 'Part Number', value: 'GL-16513' },
      { label: 'Material', value: 'Heavy structural carbon steel' },
      { label: 'Finish', value: 'Zinc electro-plated anti-corrosion' },
      { label: 'Mechanism', value: 'T-bar hook and spring-retained socket catch' },
      { label: 'Applications', value: 'Pantech rear doors, refrigerated van doors, horse floats' }
    ]
  },
  'ATP-TP-19': {
    name: 'Heavy-Duty DN16mm 304 Stainless Steel Flush Paddle Handle Latch (A20-01S-06)',
    shortDescription: 'Flush-mount DN16mm paddle handle lock manufactured from solid 304 stainless steel with mirror polish finish. Key-locking mechanism with weather-sealed pan.',
    description: 'Manufactured by Guangzhou Caiyuan Hardware (Part A20-01S-06), this premium DN16mm flush paddle handle latch is built from marine-grade 304 stainless steel with a high-lustre mirror polish. Designed for flush recessed mounting into truck toolboxes, service body doors, generator compartments, and canopy access hatches. Features an integrated key lock barrel with dust cover and a heavy rear cam tongue that provides positive sealing compression against rubber door gaskets.',
    specifications: [
      { label: 'Part Number', value: 'A20-01S-06' },
      { label: 'Material', value: 'AISI 304 Marine-Grade Stainless Steel' },
      { label: 'Surface Finish', value: 'Mirror buffed polish' },
      { label: 'Mounting Style', value: 'Recessed flush mount with 4 countersunk fixing studs' },
      { label: 'Locking Barrel', value: 'Key-locking cylinder with water-resistant keyway shutter' },
      { label: 'Rod Drive', value: 'Suits DN16mm locking rods and custom cam linkages' },
      { label: 'Applications', value: 'Service canopies, underbody toolboxes, fire rescue apparatus' }
    ]
  },
  'ATP-TP-20': {
    name: 'Flush Recessed Zinc Alloy Paddle Toolbox Lock with Dual Keys (GL-12140)',
    shortDescription: 'Recessed flush paddle latch lock in durable zinc alloy with stainless steel face. Features a sealed key barrel, dual keys, and pre-fitted waterproof foam gasket.',
    description: 'The GL-12140 is a rugged, weather-sealed flush paddle lock designed for commercial service truck toolboxes, canopy doors, and battery compartments. Die-cast in high-strength zinc alloy with a corrosion-resistant satin faceplate, it includes a rubber sealing gasket to prevent water ingress into dry tool compartments. Supplied complete with two double-sided keys and an adjustable rear locking cam.',
    specifications: [
      { label: 'Part Number', value: 'GL-12140' },
      { label: 'Material', value: 'High-pressure die-cast zinc alloy with steel cam' },
      { label: 'Finish', value: 'Satin chrome / black powder coat option' },
      { label: 'Sealing', value: 'Pre-fitted closed-cell EPDM perimeter gasket' },
      { label: 'Keys Included', value: '2x Keyed-alike / keyed-to-differ commercial keys' },
      { label: 'Applications', value: 'Underbody toolboxes, ute canopies, generator cabinets' }
    ]
  },
  'ATP-TP-21': {
    name: 'Heavy-Duty 304 Stainless Steel Commercial Grab Handle (GL-14175)',
    shortDescription: 'Solid 304 stainless steel grab handle with mirror polish finish. Heavy-duty ergonomic design for cab entry, tailboard access, and service bodies.',
    description: 'Manufactured by Ganland (GL-14175), this heavy-duty grab handle is constructed from solid 304 stainless steel tubing with welded mounting flanges. Designed to assist operators mounting commercial truck chassis, tailgates, and service trays. Mirror polished for supreme corrosion resistance and sleek styling that complements modern fleet paintwork.',
    specifications: [
      { label: 'Part Number', value: 'GL-14175' },
      { label: 'Material', value: 'AISI 304 Stainless Steel' },
      { label: 'Finish', value: 'Mirror polished' },
      { label: 'Mounting', value: 'Dual twin-bolt mounting flanges' },
      { label: 'Applications', value: 'Cab entry steps, rear van door boarding, horsebox access' }
    ]
  },
  'ATP-TP-22': {
    name: 'Zinc Plated Tubular Steel Grab Handle L330 x H50mm (GL-14175B)',
    shortDescription: 'Commercial 330mm heavy-duty tubular steel grab handle (50mm standoff). Zinc plated finish with pre-drilled bolt-through mounting ends.',
    description: 'The GL-14175B is a cost-effective, heavy-duty tubular steel grab handle measuring 330mm long with a 50mm clearance standoff. Zinc plated to withstand tough Australian quarry, mining, and highway environments. Designed for direct bolt-through mounting onto truck coaming rails, tipper tailgates, and heavy industrial plant equipment.',
    specifications: [
      { label: 'Part Number', value: 'GL-14175B' },
      { label: 'Total Length (L)', value: '330 mm' },
      { label: 'Standoff Height (H)', value: '50 mm' },
      { label: 'Material', value: 'Tubular carbon structural steel' },
      { label: 'Finish', value: 'Zinc electro-plated' },
      { label: 'Applications', value: 'Tipper bodies, flatbed coaming rails, mining access steps' }
    ]
  },
  'ATP-TP-23': {
    name: 'Heavy-Duty 228mm Stamped Steel Van Rear Door Hinge Zinc Plated (GL-13213)',
    shortDescription: 'Heavy-duty 228mm commercial van and trailer rear door hinge. High-strength stamped carbon steel with zinc passivated finish and 270-degree swing.',
    description: 'The GL-13213 is a 228mm heavy commercial rear door hinge engineered for linehaul dry freight trailers and rigid van bodies. Stamped from 5mm high-yield carbon steel and electro-plated with heavy zinc to resist road salt and grime. The precision-machined pivot pin allows smooth 270-degree door opening so barn doors fold completely flat against trailer sidewalls during loading bay docking.',
    specifications: [
      { label: 'Part Number', value: 'GL-13213' },
      { label: 'Length', value: '228 mm' },
      { label: 'Material', value: '5 mm Stamped carbon structural steel' },
      { label: 'Finish', value: 'Zinc plated passivated' },
      { label: 'Swing Clearance', value: '270 degrees' },
      { label: 'Applications', value: 'Commercial van rear doors, pantechs, container modifications' }
    ]
  },
  'ATP-TP-24': {
    name: 'Heavy-Duty 235mm 304 Stainless Steel Refrigerated Door Strap Hinge (GL-13195S)',
    shortDescription: 'Grade 304 polished stainless steel 235mm rear door strap hinge. Designed for heavy insulated doors on refrigerated reefers and food logistics trailers.',
    description: 'The Aurex GL-13195S is a high-specification 235mm strap hinge manufactured exclusively from AISI 304 stainless steel with a high-buff mirror finish. Specifically designed to support the immense weight of thick composite insulated doors on refrigerated reefers without sagging or pin wear. Stainless steel construction ensures zero contamination in food-grade haulage and complete immunity against coastal saltwater corrosion.',
    specifications: [
      { label: 'Part Number', value: 'GL-13195S' },
      { label: 'Length', value: '235 mm' },
      { label: 'Material', value: 'AISI 304 Stainless Steel' },
      { label: 'Finish', value: 'Mirror buffed polish' },
      { label: 'Pin Material', value: 'Hardened 304 stainless steel pivot pin' },
      { label: 'Standards', value: 'HACCP food grade compliant & marine corrosion proof' },
      { label: 'Applications', value: 'Refrigerated reefers, insulated milk vans, pharmaceutical logistics' }
    ]
  },
  'ATP-TP-25': {
    name: 'Grade 304 Stainless Steel T-Style Truck Door Retainer Catch (GL-16511S)',
    shortDescription: 'Marine-grade 304 stainless steel T-style door hold-back catch. Mirror polished for refrigerated, chemical, and coastal road transport vehicles.',
    description: 'Manufactured by Ganland (GL-16511S), this T-style door retainer is fabricated from 100% Grade 304 stainless steel with a high-shine mirror polish. Provides positive hold-back retention for truck and trailer doors, ensuring barn doors cannot be slammed shut by crosswinds during loading dock operations. Completely rust-proof, making it the preferred choice for refrigerated logistics fleets and coastal hauliers.',
    specifications: [
      { label: 'Part Number', value: 'GL-16511S' },
      { label: 'Material', value: 'AISI 304 Stainless Steel' },
      { label: 'Finish', value: 'Mirror polished' },
      { label: 'Inclusions', value: 'T-bar latch hook and spring-loaded base catch' },
      { label: 'Corrosion Resistance', value: 'Marine grade, washdown and salt-spray immune' },
      { label: 'Applications', value: 'Reefer bodies, beverage trucks, coastal freight trailers' }
    ]
  },

  // --- ACCESSORIES ---
  'ATP-ACC-01': {
    name: 'Heavy-Duty Molded EPDM Rubber Buffer Stop (GL-23116)',
    shortDescription: 'Industrial molded EPDM rubber buffer block with dual recessed bolt holes. Provides impact protection for loading docks, truck chassis, and tailgates.',
    description: 'The Aurex GL-23116 Rubber Buffer is a heavy-duty impact absorber molded from high-density, weather-resistant EPDM rubber. Engineered to absorb high kinetic energy impacts when reversing into loading bays, protecting trailer rear frames, lights, and dock structures from severe damage. Features two pre-molded recessed mounting holes with steel washer inserts to prevent mounting bolt pull-through.',
    specifications: [
      { label: 'Part Number', value: 'GL-23116' },
      { label: 'Material', value: 'High-density molded EPDM impact rubber' },
      { label: 'Shore Hardness', value: '75A - 80A Durometer' },
      { label: 'Mounting Holes', value: 'Dual recessed holes with integral steel reinforcement washers' },
      { label: 'Weathering', value: 'UV, ozone, oil, and extreme temperature resistant (-40°C to +90°C)' },
      { label: 'Applications', value: 'Rear chassis underrun protection, loading dock bumpers, tailgate stops' }
    ]
  },
  'ATP-ACC-02': {
    name: 'Underbody Steel Truck Toolbox 1200x450x400mm Key Locking (GL-25126)',
    shortDescription: 'Heavy-duty 1.5mm powder-coated steel underbody truck toolbox (1200 x 450 x 400mm). Features stainless steel key-locking paddle latch and waterproof seal.',
    description: 'The Aurex GL-25126 Underbody Toolbox is constructed from 1.5mm heavy-gauge structural steel, robotic seam-welded for exceptional rigidity. Designed for mounting beneath truck trays, tippers, and semi-trailer chassis coamings. Features a drop-down door supported by heavy-duty stainless steel check cables, a flush-mounted key-locking 304 stainless paddle latch, and a full-perimeter automotive rubber bulb seal that guarantees dry, dust-free tool storage across unsealed Australian outback routes.',
    specifications: [
      { label: 'Part Number', value: 'GL-25126' },
      { label: 'Dimensions', value: '1200 mm (L) x 450 mm (H) x 400 mm (D)' },
      { label: 'Steel Gauge', value: '1.5 mm Cold-rolled structural carbon steel' },
      { label: 'Surface Finish', value: 'Electrostatically applied black powder coat' },
      { label: 'Locking System', value: 'AISI 304 Stainless steel key-locking flush paddle latch' },
      { label: 'Weatherproofing', value: 'Full perimeter continuous hollow EPDM rubber bulb seal' },
      { label: 'Door Support', value: 'Dual stainless steel wire retainers' },
      { label: 'Applications', value: 'Truck trays, semi-trailers, tippers, heavy haulage floats' }
    ]
  }
};

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aurex');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  
  console.log(`Starting enrichment of ${Object.keys(enrichments).length} products...`);
  let updatedCount = 0;
  
  for (const [sku, data] of Object.entries(enrichments)) {
    const res = await Product.updateOne(
      { sku },
      {
        $set: {
          name: data.name,
          shortDescription: data.shortDescription,
          description: data.description,
          specifications: data.specifications
        }
      }
    );
    if (res.matchedCount > 0) {
      updatedCount++;
      console.log(`✓ Enriched ${sku}: ${data.name}`);
    } else {
      console.log(`✗ Product not found: ${sku}`);
    }
  }

  console.log(`\nSuccessfully enriched ${updatedCount} products in MongoDB!`);
  await mongoose.disconnect();
}

main().catch(console.error);
