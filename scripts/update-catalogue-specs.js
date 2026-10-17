const mongoose = require('mongoose');
require('dotenv').config();

const CATALOGUE_UPDATES = {
  // Page 1
  'ATP-TP-29': {
    dimensions: '20mm x 5M',
    parameters: 'Profile Width: 20mm | Length: 5.0m | Co-extruded flexible PVC with sealing flap | UV & Ozone Stabilized',
    technicalSpec: 'Flexible co-extruded PVC weather and dust seal for van and commercial vehicle side and rear barn doors',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard; AS 3958 Compliance'
  },
  // Page 2
  'ATP-TP-30': {
    dimensions: '25mm x 5M',
    parameters: 'Profile Width: 25mm | Length: 5.0m | Heavy-duty flexible PVC with dual sealing lip | High elasticity',
    technicalSpec: 'Perimeter door weather seal for medium commercial trucks, service bodies and delivery vans',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard'
  },
  'ATP-TP-31': {
    dimensions: '30mm x 4M',
    parameters: 'Profile Width: 30mm | Length: 4.0m | Reinforced channel section PVC | Extreme temperature rating -30°C to +70°C',
    technicalSpec: 'Heavy commercial truck body door seal for dry freight and insulated pantechs',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard'
  },
  'ATP-TP-32': {
    dimensions: '55mm x 4.2M',
    parameters: 'Profile Width: 55mm | Length: 4.2m | Wide-flange co-extruded PVC seal with dual wiper lip',
    technicalSpec: 'Wide perimeter door seal for refrigerated bodies, pantechs and dry freight trailers',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard'
  },
  'ATP-TP-33': {
    dimensions: '85mm x 5M',
    parameters: 'Profile Width: 85mm | Length: 5.0m | Extra-wide multi-chamber PVC profile with retention bead',
    technicalSpec: 'Heavy-duty insulated and refrigerated truck body door perimeter seal',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard'
  },
  'ATP-TP-34': {
    dimensions: '25 x 30mm x 5M',
    parameters: 'J-Profile Section: 25 x 30mm | Length: 5.0m | Co-extruded PVC with internal gripping spine',
    technicalSpec: 'J-channel clip-on edge door seal for commercial truck bodies and trailer doors',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard'
  },
  'ATP-TP-35': {
    dimensions: '30 x 55mm',
    parameters: 'Cross Section: 30 x 55mm | Heavy vulcanized EPDM dense rubber | Continuous hollow bulb profile',
    technicalSpec: 'Heavy-duty refrigerated truck, container and freezer body compression door gasket',
    certification: 'AS/NZS ISO 9001 Approved Commercial Transport Standard'
  },
  'ATP-TP-36': {
    dimensions: '100 x 20mm',
    parameters: 'Colour: Grey | Material: Virgin Moulded PVC | 90 Degree pre-formed corner tab',
    technicalSpec: 'Corner joining tab for perimeter PVC door seals, prevents water and dust ingress at door corners',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard'
  },
  'ATP-TP-37': {
    dimensions: '100 x 20mm',
    parameters: 'Colour: Black | Material: Moulded EPDM Rubber | High elasticity 90 Degree corner tab',
    technicalSpec: 'Corner insert for rubber door gaskets to ensure continuous hermetic sealing',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard'
  },
  'ATP-TP-38': {
    dimensions: '280mm Overall Length x 50mm Blade Width',
    parameters: 'Material: Forged structural carbon steel | Mounting: Weld-on lug | Heavy-duty stainless pivot pin',
    technicalSpec: 'Rear barn door weld-on hinge assembly for heavy commercial truck and semi-trailer bodies',
    certification: 'AS/NZS ISO 9001 Heavy Commercial Transport Standard Approved'
  },
  'ATP-TP-39': {
    dimensions: '280mm Overall Length x 50mm Blade Width',
    parameters: 'Material: Forged carbon steel | Mounting: Bolt-on (3 x M10 pre-drilled holes) | Finish: Zinc plated',
    technicalSpec: 'Rear barn door bolt-on hinge for dry freight and refrigerated trailers',
    certification: 'AS/NZS ISO 9001 Heavy Commercial Transport Standard Approved'
  },
  'ATP-TP-40': {
    dimensions: '280mm Overall Length x 50mm Blade Width',
    parameters: 'Material: Grade 304 Stainless Steel | Finish: Mirror electropolished | Mounting: Weld-on lug',
    technicalSpec: 'Marine and corrosion resistant rear door weld-on hinge for refrigerated and livestock trailers',
    certification: 'AS/NZS ISO 9001 & AS 2832 Corrosion Resistant Standard Approved'
  },
  'ATP-TP-41': {
    dimensions: '280mm Overall Length x 50mm Blade Width',
    parameters: 'Material: Grade 304 Stainless Steel | Mounting: Bolt-on with 3 pre-drilled holes | 12mm stainless pin',
    technicalSpec: 'Premium corrosion-resistant bolt-on hinge for refrigerated bodies and trailers',
    certification: 'AS/NZS ISO 9001 & AS 2832 Corrosion Resistant Standard Approved'
  },
  'ATP-TP-42': {
    dimensions: '85 x 206mm',
    parameters: 'Width: 85mm | Length: 206mm | Material: Cold-rolled mild steel | Finish: Zinc plated',
    technicalSpec: 'Side access door hinge for commercial vehicle bodies, service trucks and trailers',
    certification: 'AS/NZS ISO 9001 Commercial Vehicle Standard Approved'
  },
  // Page 3
  'ATP-TP-43': {
    dimensions: '260mm Length x 45mm Width',
    parameters: 'Length: 260mm | Material: Grade 304 Stainless Steel | Bolt-on mounting with 3 holes | Polished finish',
    technicalSpec: '260mm stainless steel rear door bolt-on hinge for refrigerated and van bodies',
    certification: 'AS/NZS ISO 9001 & AS 2832 Corrosion Resistant Standard Approved'
  },
  'ATP-TP-44': {
    dimensions: 'Suits 27mm Pipe',
    parameters: 'Suits Pipe OD: 27mm (1-1/16") | Drop-forged steel cams and keepers | Finish: Zinc plated',
    technicalSpec: 'Commercial truck body rear door rotary cam lock mechanism kit complete with keepers and guides',
    certification: 'AS/NZS ISO 9001 Heavy Commercial Transport Standard Approved'
  },
  'ATP-TP-45': {
    dimensions: 'Suits 34mm Pipe',
    parameters: 'Suits Heavy Pipe OD: 34mm (1-5/16") | Heavy forged cams | 4 x reinforced rod guides | Zinc plated',
    technicalSpec: 'Heavy-duty container and road train semi-trailer rear door cam lock kit for high-rigidity doors',
    certification: 'AS/NZS ISO 9001 Heavy Commercial Transport Standard Approved'
  },
  'ATP-TP-46': {
    dimensions: 'Suits 27mm Pipe x 10mm Handle',
    parameters: 'Suits Pipe OD: 27mm | Handle Thickness: 10mm offset lever handle with vinyl grip | Forged steel',
    technicalSpec: 'Commercial van and trailer rear door locking kit with reinforced 10mm handle',
    certification: 'AS/NZS ISO 9001 Heavy Commercial Transport Standard Approved'
  },
  'ATP-TP-47': {
    dimensions: 'Suits 22mm Pipe x 10mm Handle',
    parameters: 'Suits Pipe OD: 22mm (7/8") | Handle Thickness: 10mm | Compact forged steel construction | Zinc plated',
    technicalSpec: 'Light-to-medium commercial truck body side and rear door cam lock kit',
    certification: 'AS/NZS ISO 9001 Commercial Vehicle Standard Approved'
  },
  'ATP-TP-48': {
    dimensions: 'Standard Sider Profile (Left Hand)',
    parameters: 'Handing: Left Hand (LH) | High-strength cast ductile iron body | Heavy-duty reduction gear drive',
    technicalSpec: 'Heavy-duty curtain tensioning ratchet winch mechanism for tautliner curtain side trailers',
    certification: 'AS/NZS 4380:2001 & NTC Load Restraint Guide Certified'
  },
  'ATP-TP-49': {
    dimensions: 'Standard Sider Profile (Right Hand)',
    parameters: 'Handing: Right Hand (RH) | High-strength cast ductile iron body | Heavy-duty reduction gear drive',
    technicalSpec: 'Heavy-duty curtain tensioning ratchet winch mechanism for tautliner curtain side trailers',
    certification: 'AS/NZS 4380:2001 & NTC Load Restraint Guide Certified'
  },
  'ATP-TP-50': {
    dimensions: '85mm Width x 3.0 Metres Length',
    parameters: 'Profile Width: 85mm | Length: 3.0m | Material: 2.5mm high-tensile steel | Round "O" pattern | Zinc plated',
    technicalSpec: 'Surface mount / recessed cargo restraint track for commercial vans and tautliners; 1500kg LC per hole',
    certification: 'AS/NZS 4380:2001 (Motor Vehicles - Cargo Restraint Systems) Approved'
  },
  'ATP-TP-51': {
    dimensions: 'Suits 85mm Track Profile',
    parameters: 'Material: Injection moulded high-impact ABS / Polypropylene | Colour: Black | 2-screw fixing',
    technicalSpec: 'Protective safety end cap for cargo track ends to prevent load snagging and worker injury',
    certification: 'AS/NZS 4380 & WHS Fleet Workplace Safety Standard Approved'
  },
  'ATP-TP-52': {
    dimensions: '132mm Width x 3.0 Metres Length x 2.5mm',
    parameters: 'Width: 132mm | Length: 3.0m | Thickness: 2.5mm | Horizontal E-track slot configuration | Zinc electroplated',
    technicalSpec: 'Universal commercial cargo restraint track for heavy transport logistics; 2000kg LC rated',
    certification: 'AS/NZS 4380:2001 & NTC Load Restraint Guide Approved'
  },
  'ATP-TP-53': {
    dimensions: 'Suits 132mm E-Track Profile',
    parameters: 'Material: Heavy-duty impact-resistant plastic | Colour: Black | Flush snap/screw fitment',
    technicalSpec: 'Safety finishing end cap for 132mm horizontal E-track sections',
    certification: 'WHS Fleet Workplace Safety Standard Approved'
  },
  'ATP-TP-54': {
    dimensions: '3M x 132mm x 3.0mm Heavy Gauge',
    parameters: 'Width: 132mm | Length: 3.0m | Heavy gauge 3.0mm structural steel | Hot-dip zinc coating | 2500kg LC rated',
    technicalSpec: 'Heavy-duty commercial freight E-track for multi-tier shoring and pallet restraint',
    certification: 'AS/NZS 4380:2001 & NTC Load Restraint Guide Certified'
  },
  'ATP-TP-55': {
    dimensions: 'Adjustable 2280mm to 2640mm',
    parameters: 'Adjustment: 2280mm to 2640mm | Tube Dia: 42mm | Zinc plated steel | F-track captive plungers with release handle',
    technicalSpec: 'Telescopic captive cargo shoring bar for load bracing and double-deck pallet loading; 1000kg WLL',
    certification: 'AS/NZS 4380:2001 (Cargo Restraint Systems) Approved; Rated to 1000 kg WLL'
  },
  // Page 4
  'ATP-TP-56': {
    dimensions: 'Base 65 x 50mm, Hook Projection 60mm',
    parameters: 'Material: Pressed carbon steel | Finish: Zinc electroplated | Spring-loaded latching tongue',
    technicalSpec: 'Spring-assisted commercial truck and trailer door hold-back retainer catch',
    certification: 'AS/NZS ISO 9001 Approved Commercial Vehicle Standard'
  },
  'ATP-TP-57': {
    dimensions: '40 x 64mm Base, Hook Projection 60mm',
    parameters: 'Base: 40 x 64mm | Material: Grade 304 Marine Stainless Steel | Polished finish | Stainless spring mechanism',
    technicalSpec: 'Stainless steel door catch retainer for refrigerated and livestock truck bodies',
    certification: 'AS/NZS ISO 9001 & AS 2832 Approved'
  },
  'ATP-TP-58': {
    dimensions: 'Base 75 x 50mm, Arm Reach 80mm',
    parameters: 'Material: Heavy forged steel | Finish: Zinc plated | Heavy-duty T-bracket socket and plunger catch',
    technicalSpec: 'Heavy-duty commercial door hold-back catch assembly for rigorous road conditions',
    certification: 'AS/NZS ISO 9001 Commercial Vehicle Standard Approved'
  },
  'ATP-TP-59': {
    dimensions: 'Base 75 x 50mm, Arm Reach 80mm',
    parameters: 'Material: Grade 304 Stainless Steel | Mirror polished finish | T-head plunger style with rubber bumper',
    technicalSpec: 'Heavy-duty stainless door hold-back retainer for refrigerated bodies and trailers',
    certification: 'AS/NZS ISO 9001 & AS 2832 Approved'
  },
  'ATP-TP-60': {
    dimensions: 'Body Length 545mm, Arm Length 432mm',
    parameters: 'Body: 545mm | Arm: 432mm | Material: Heavy tubular steel | Finish: Zinc plated | Multi-position pivot arm',
    technicalSpec: 'Long-reach underbody door hold-back arm for commercial truck bodies and trailers',
    certification: 'AS/NZS ISO 9001 Commercial Vehicle Standard Approved'
  },
  'ATP-TP-61': {
    dimensions: 'Body Length 502mm, Arm Length 274mm',
    parameters: 'Body: 502mm | Arm: 274mm | Material: Tubular steel | Finish: Zinc plated | Heavy-duty chassis pivot bracket',
    technicalSpec: 'Medium-reach universal underbody door retainer for rigid trucks and semi-trailers',
    certification: 'AS/NZS ISO 9001 Commercial Vehicle Standard Approved'
  },
  'ATP-TP-62': {
    dimensions: 'Body Length 490mm, Arm Length 280mm',
    parameters: 'Body: 490mm | Arm: 280mm | Material: Structural extruded aluminium | Stainless hardware | Under 1.2kg weight',
    technicalSpec: 'Lightweight aluminium underbody door retainer arm for refrigerated and dry freight van bodies',
    certification: 'AS/NZS ISO 9001 Commercial Vehicle Standard Approved'
  },
  'ATP-TP-63': {
    dimensions: '152 x 320mm Dish, Suits 16mm Rod',
    parameters: 'Pan: 152 x 320mm | Suits 16mm diameter rods | Material: Grade 304 Stainless Steel | Includes 2 keys & gasket',
    technicalSpec: 'Recessed paddle handle lock kit for commercial vehicle doors with 16mm multi-point locking rods',
    certification: 'AS/NZS ISO 9001 & ADR Cabin / Body Security Standard Approved'
  },
  'ATP-TP-64': {
    dimensions: '105 x 25mm Cutout',
    parameters: 'Footprint: 105 x 25mm | Handing: Left Hand | Material: Zinc plated steel with stainless pivot | 2-point rod linkage',
    technicalSpec: 'Internal linkage paddle lock kit for service body and toolbox side compartments',
    certification: 'AS/NZS ISO 9001 Commercial Vehicle Standard Approved'
  },
  'ATP-TP-65': {
    dimensions: '120 x 92mm, Depth 35mm',
    parameters: 'Dimensions: 120 x 92mm | Finish: UV resistant satin black powder coat | Zinc alloy & steel | Key locking with 2 keys',
    technicalSpec: 'Flush-mount paddle handle lock for canopies, toolboxes, and service truck bodies',
    certification: 'AS/NZS ISO 9001 & IP54 Weatherproof Rating Approved'
  },
  'ATP-TP-66': {
    dimensions: '120 x 92mm',
    parameters: 'Dimensions: 120 x 92mm | Material: Grade 304 mirror polished stainless steel | Weatherproof rubber gasket | 2 keys',
    technicalSpec: 'Flush-mount stainless paddle latch for underbody toolboxes, canopies, and service bodies',
    certification: 'AS/NZS ISO 9001 & IP54 Weatherproof Rating Approved'
  },
  'ATP-TP-67': {
    dimensions: '120 x 92mm with Internal Release',
    parameters: 'Dimensions: 120 x 92mm | Material: Grade 304 Stainless Steel | Internal emergency escape safety release lever',
    technicalSpec: 'Stainless paddle lock with inside emergency escape release for commercial service bodies and canopies',
    certification: 'AS/NZS ISO 9001 & WHS Australian Fleet Safety Standard Approved'
  },
  'ATP-TP-68': {
    dimensions: '124 x 121mm, Depth 40mm',
    parameters: 'Dish: 124 x 121mm | Material: Grade 304 stainless steel dish with cast chrome drop T-handle | Adjustable roller cam',
    technicalSpec: 'Heavy-duty compression drop T-latch for truck underbody toolboxes and plant equipment',
    certification: 'AS/NZS ISO 9001 & IP65 Dust/Water Seal Standard Approved'
  },
  // Page 5
  'ATP-TP-69': {
    dimensions: '275 x 65 x 5mm',
    parameters: 'Length: 275mm | Width: 65mm | Thickness: 5mm structural steel | Triangular gusseted bracing | Galvanized finish',
    technicalSpec: 'Semi-trailer radius mudguard and spray suppression chassis mounting bracket',
    certification: 'ADR 42/04 (General Safety Requirements - Wheel Guards) Approved'
  },
  'ATP-TP-70': {
    dimensions: 'Base 200 x 120mm, Pin Stroke 50mm',
    parameters: 'Footprint: 200 x 120mm | Stroke: 50mm | Cast ductile iron & forged steel | Foot-operated quick-release latch',
    technicalSpec: 'Curtain sider sliding center post lower base locking assembly for tautliner trailers',
    certification: 'NTC Load Restraint Guide 2018 & AS/NZS ISO 9001 Approved'
  },
  'ATP-TP-71': {
    dimensions: '1220 x 1500mm',
    parameters: 'Width: 1220mm | Height: 1500mm | Material: Tubular steel with vertical reinforcement uprights | Enamel blue finish',
    technicalSpec: 'Heavy-duty hanging load restraint gate for curtain side semi-trailers and rigid trucks',
    certification: 'NTC Load Restraint Guide (Gate Load Rating Certified); ADR Compliant'
  },
  'ATP-TP-72': {
    dimensions: "4' (100mm) x 50mm Inside Opening",
    parameters: 'Inside: 100mm (4 Inch) x 50mm | Height: 120mm | 5mm heavy mild steel wall | Weld-on bevel with drainage slot',
    technicalSpec: 'Heavy-duty coaming rail weld-on pocket for 4-inch curtain truck gate posts',
    certification: 'NTC Load Restraint Guide 2018 Certified; Heavy Structural Steel'
  },
  'ATP-TP-73': {
    dimensions: 'Pin 25mm Dia x 140mm Gudgeon',
    parameters: 'Pin: 25mm dia | Length: 140mm | Through-hole: 17mm for safety linchpin | Forged high-tensile carbon steel | Weld-on',
    technicalSpec: 'Heavy tipper tailgate gudgeon hinge assembly with pin hole for bulk haulage tippers',
    certification: 'AS/NZS ISO 9001 Heavy Commercial Transport Standard Approved'
  },
  'ATP-TP-74': {
    dimensions: 'Pin 25mm Dia x 140mm Gudgeon',
    parameters: 'Pin: 25mm dia | Length: 140mm | Solid forged pin without hole | High-tensile forged steel | Weld-on lugs',
    technicalSpec: 'Solid heavy tipper body tailgate pivot hinge for quarry and aggregate dump bodies',
    certification: 'AS/NZS ISO 9001 Heavy Commercial Transport Standard Approved'
  },
  'ATP-TP-75': {
    dimensions: 'Overall Length 225mm, Base Width 45mm',
    parameters: 'Length: 225mm | Base: 45mm | Forged carbon steel | Zinc dichromate plated | Padlockable catch | 25mm threaded travel',
    technicalSpec: 'Heavy-duty over-centre toggle clamp fastener for tipper sides, dropsides and tailgates',
    certification: 'AS/NZS ISO 9001 Commercial Vehicle Standard Approved'
  },
  'ATP-TP-76': {
    dimensions: 'Overall Length 168mm, Pin 12mm',
    parameters: 'Length: 168mm | Pin Dia: 12mm | Throw: 35mm | Heavy zinc plated steel | Spring action with hold-open notch',
    technicalSpec: 'Spring-loaded sliding locking latch for trailer ramps, gates, and cages',
    certification: 'AS/NZS ISO 9001 Commercial Vehicle Standard Approved'
  },
  'ATP-TP-77': {
    dimensions: '12mm Pin Dia x M12 Thread',
    parameters: 'Pin Dia: 12mm | Thread: M12 x 35mm shank | Forged steel | Zinc plated | Includes M12 nyloc nut and washer',
    technicalSpec: 'Heavy-duty pivoting anti-luce fastener for truck dropsides, tailgates and ute trays',
    certification: 'AS/NZS ISO 9001 Commercial Vehicle Standard Approved'
  },
  'ATP-TP-78': {
    dimensions: '12mm Pin Dia x 160mm Length',
    parameters: 'Pin: 12mm dia | Overall Length: 160mm | Bracket: 80 x 38mm | Carbon steel | Heavy compression spring | Rubber grip',
    technicalSpec: 'Heavy spring-loaded barrel bolt latch for horse floats, livestock trailers, and tippers',
    certification: 'AS/NZS ISO 9001 Commercial Vehicle Standard Approved'
  },
  'ATP-TP-79': {
    dimensions: 'Dish 102 x 95mm, Ring 10mm Wire',
    parameters: 'Lashing Capacity: 2000 kg LC (2.0 Tonne) | Breaking Strength: 4000 kg | Recessed 4-hole dish | Zinc plated forged ring',
    technicalSpec: 'Floor recessed tie-down lashing D-ring for commercial truck decks, horse floats and trailers',
    certification: 'AS/NZS 4380:2001 (Cargo Restraint Systems) Approved; Rated to 2000 kg LC'
  },
  // Page 6
  'ATP-ACC-03': {
    dimensions: '32mm Inside Diameter x 50mm Height',
    parameters: 'Hex Size: 32mm | Height: 50mm | Material: Triple chrome plated virgin ABS | Internal retention teeth | Pack of 10',
    technicalSpec: 'Protective chrome wheel nut cover for 32mm commercial truck and bus wheel nuts',
    certification: 'AS/NZS ISO 9001 Commercial Transport Standard Approved'
  },
  'ATP-ACC-04': {
    dimensions: '33mm Inside Diameter x 50mm Height',
    parameters: 'Hex Size: 33mm | Height: 50mm | Material: Chrome plated virgin ABS | Flanged collar base | Pack of 10',
    technicalSpec: 'Protective wheel nut cover for 33mm heavy vehicle European & Japanese stud wheels',
    certification: 'AS/NZS ISO 9001 Commercial Transport Standard Approved'
  },
  'ATP-TP-80': {
    dimensions: '3500mm Length (Pair)',
    parameters: 'Length: 3500mm | Pair Kit: 2 x 3.5m aluminium side rails + galvanized drop brackets + end caps',
    technicalSpec: 'Heavy vehicle side underrun lateral protection device system for commercial trucks and rigid bodies',
    certification: 'ADR 84/00 Certified (Heavy Vehicle Lateral Protection); UN ECE R73 Approved'
  },
  'ATP-TP-81': {
    dimensions: '6500mm Length (Pair)',
    parameters: 'Length: 6500mm | Pair Kit: 2 x 6.5m extruded structural aluminium rails + 8 x heavy chassis drop brackets',
    technicalSpec: 'Full-length semi-trailer side underrun protection system for national road transport compliance',
    certification: 'ADR 84/00 Certified (Heavy Vehicle Lateral Protection); UN ECE R73 Approved'
  },
  'ATP-TP-82': {
    dimensions: '735mm Length x 250mm Stroke',
    parameters: 'Length: 735mm | Material: 4mm structural galvanized steel | Telescopic drop setting | Fold-up pivot feature',
    technicalSpec: 'Telescopic adjustable drop bracket for heavy vehicle lateral underrun side guard rails',
    certification: 'ADR 84/00 Certified Component; Heavy Vehicle National Law Compliant'
  },
  'ATP-TP-83': {
    dimensions: '6.5 Metres Length x 100mm Height',
    parameters: 'Length: 6.5m | Height: 100mm | Depth: 30mm | Material: Structural 6061-T6 aluminium extrusion | Aerodynamic ribbed',
    technicalSpec: 'Continuous side guard rail profile extrusion for custom bodybuilding and fleet retrofits',
    certification: 'ADR 84/00 & UN ECE R73 Material Strength Certified'
  },
  'ATP-TP-84': {
    dimensions: 'Suits 100 x 30mm Rail Profile',
    parameters: 'Material: Cast aluminium alloy | Flush internal push-in plug with fastener hole | Mill finish',
    technicalSpec: 'Safety end cover cap for aluminium side underrun rail ends to eliminate sharp edges',
    certification: 'ADR 84/00 Safety Requirements Approved'
  },
  'ATP-TP-85': {
    dimensions: '90 Degree Corner (150 x 150mm Legs)',
    parameters: 'Angle: 90 Degree | Material: Die-cast structural aluminium | Smooth rounded external safety radius',
    technicalSpec: '90-degree corner transition connector for side guard rail systems',
    certification: 'ADR 84/00 Safety Corner Mandate Approved'
  },
  'ATP-TP-86': {
    dimensions: 'Suits 90 Degree Guardrail Joint',
    parameters: 'Material: Formed aluminium plate | Flush protective joint cap | Corrosion proof',
    technicalSpec: 'Protective cover cap for lateral protection corner joints',
    certification: 'ADR 84/00 Component Approved'
  },
  'ATP-ACC-05': {
    dimensions: '280 x 80 x 75mm',
    parameters: 'Length: 280mm | Width: 80mm | Height: 75mm | High-density vulcanized synthetic rubber | 2 x pre-drilled holes',
    technicalSpec: 'D-section loading dock buffer bumper for truck rears, loading bays and trailers',
    certification: 'AS/NZS ISO 9001 Heavy Transport Standard Approved'
  },
  'ATP-TP-87': {
    dimensions: '0.8mm Thickness x 2515mm Width (Per Kg)',
    parameters: 'Thickness: 0.8mm | Width: 2515mm | Material: 5052-H32 Marine Grade aluminium alloy | Tension leveled continuous coil',
    technicalSpec: 'Seamless one-piece truck body and pantech roof coil skin, eliminates leak points across truck roofs',
    certification: 'AS/NZS 1866 & AS/NZS 1734 Structural Aluminium Approved'
  },
  'ATP-TP-88': {
    dimensions: '5.0 Metres Length x 44 x 147mm',
    parameters: 'Length: 5.0m | Section: 44 x 147mm | Material: Structural 6061-T6 aluminium extrusion | Integrated roof bow track',
    technicalSpec: 'Upper perimeter roof coaming rail extrusion for dry freight and refrigerated bodies',
    certification: 'AS/NZS 1866 Structural Extrusion Approved'
  },
  'ATP-TP-89': {
    dimensions: '4.3 Metres Length x 60 x 112mm',
    parameters: 'Length: 4.3m | Section: 60 x 112mm | Material: Extruded architectural aluminium | Panel retention channel',
    technicalSpec: 'Intermediate wall post and corner structural profile for commercial body building',
    certification: 'AS/NZS 1866 Structural Extrusion Approved'
  },
  'ATP-TP-90': {
    dimensions: '4.3 Metres Length x 210mm Height x 43mm Flange',
    parameters: 'Length: 4.3m | Height: 210mm | Flange: 43mm | Material: Heavy structural 6061-T6 aluminium | Forklift rub rail',
    technicalSpec: 'Transport bottom coaming rail for rigid truck decks, flat tops and pantechs',
    certification: 'AS/NZS 1866 Structural Aluminium Approved; ADR Body Compliant'
  },
  // Page 7
  'ATP-TP-91': {
    dimensions: '5.0 Metres Length x 87mm Base x 26mm Crown',
    parameters: 'Length: 5.0m | Base: 87mm | Height: 26mm | Top-hat profile with fastener flanges | High-strength aluminium',
    technicalSpec: 'Ceiling roof bow support profile for commercial van bodies and dry vans',
    certification: 'AS/NZS 1866 Structural Aluminium Approved'
  },
  'ATP-TP-92': {
    dimensions: 'Standard PTB Profile, Radius 100mm',
    parameters: 'Profile: PTB | Radius: 100mm | Material: Heavy die-cast aluminium alloy | Pre-drilled counterbored holes',
    technicalSpec: 'Front top corner casting for commercial van bodies, matches PTB rail profiles',
    certification: 'AS/NZS ISO 9001 Commercial Transport Standard Approved'
  },
  'ATP-TP-93': {
    dimensions: 'Suits PTB Corner Cap',
    parameters: 'Material: Pressed marine aluminium sheet | Aerodynamic contour profile',
    technicalSpec: 'Outer aerodynamic trim cover for PTB cast corner cap',
    certification: 'AS/NZS ISO 9001 Approved'
  },
  'ATP-TP-94': {
    dimensions: 'Standard ALLT Bevelled Profile, 120mm Leg',
    parameters: 'Profile: ALLT heavy bevel | Leg: 120mm | Material: Cast structural aluminium | High impact resistance',
    technicalSpec: 'Heavy-duty front corner casting for heavy commercial freight bodies',
    certification: 'AS/NZS ISO 9001 Approved'
  },
  'ATP-TP-95': {
    dimensions: 'Suits ALLT Corner Cap',
    parameters: 'Material: Pressed aluminium alloy | High-precision formed trim plate',
    technicalSpec: 'External cover plate for ALLT corner casting',
    certification: 'AS/NZS ISO 9001 Approved'
  },
  'ATP-TP-96': {
    dimensions: '3-Way 90 Degree Junction, 110mm Legs',
    parameters: 'Configuration: 3-Way square bevel | Legs: 110mm | Material: High-density cast aluminium',
    technicalSpec: 'Universal 3-way top corner casting for square-corner truck bodies',
    certification: 'AS/NZS ISO 9001 Approved'
  },
  'ATP-TP-97': {
    dimensions: '400mm Wide x 350mm Height',
    parameters: 'Width: 400mm | Height: 350mm | Frame: 480 x 420mm | Cast marine aluminium alloy | Cam lock handle with neoprene seal',
    technicalSpec: 'Gravity discharge grain hatch chute for bulk haulage tipper tailgates',
    certification: 'AS/NZS ISO 9001 Commercial Transport Standard Approved'
  },
  'ATP-TP-98': {
    dimensions: '7-Step Configuration, Length 2100mm x Width 380mm',
    parameters: 'Steps: 7 | Length: 2100mm | Width: 380mm | High-tensile aluminium alloy | 50mm serrated non-slip rungs | Pivoting mounts',
    technicalSpec: 'Tipper body exterior access ladder for operator inspection and tarping',
    certification: 'AS 1657:2018 (Fixed Platforms, Walkways, Stairways and Ladders) Certified'
  },
  'ATP-TP-99': {
    dimensions: 'Frame 745 x 345mm x 3-Step Retractable',
    parameters: 'Frame: 745 x 345mm | 3-Step slide-out | Structural carbon steel | Hot-dip zinc plated | Non-slip punched traction treads',
    technicalSpec: '3-step slide-out retractable chassis access ladder for tipper trucks and trailers',
    certification: 'AS 1657:2018 & WHS Fleet Access Safety Standard Certified'
  },
  'ATP-TP-100': {
    dimensions: 'Frame 640 x 390mm x 2-Step Retractable',
    parameters: 'Frame: 640 x 390mm | 2-Step slide-out | Heavy structural steel | Hot-dip zinc plated | Anti-slip punched rungs',
    technicalSpec: '2-step retractable underbody chassis ladder for service bodies and tippers',
    certification: 'AS 1657:2018 & WHS Fleet Access Safety Standard Certified'
  },
  'ATP-TP-101': {
    dimensions: '25mm Dia Pin x 113mm Usable Length',
    parameters: 'Pin: 25mm dia | Length: 113mm | Handle: 160mm | Forged carbon steel | Zinc plated | Includes safety cotter pin hole',
    technicalSpec: 'Heavy-duty manual tailgate locking bolt for gravel and sand tippers',
    certification: 'AS/NZS ISO 9001 Heavy Commercial Transport Standard Approved'
  },
  'ATP-TP-102': {
    dimensions: '25mm Dia Pin x 88mm Length',
    parameters: 'Pin: 25mm dia | Length: 88mm | High-strength forged aluminium alloy with stainless hardware | Corrosion proof',
    technicalSpec: 'Quick-action tailgate grain lock for aluminium grain tippers and aggregate bodies',
    certification: 'AS/NZS ISO 9001 Heavy Commercial Transport Standard Approved'
  },
  'ATP-TP-103': {
    dimensions: '175mm Bristle Height x 40.0 Metres Length',
    parameters: 'Bristle: 175mm | Length: 40m roll | UV-stabilized polypropylene bristles with galvanized steel channel spine',
    technicalSpec: 'Heavy vehicle wheel mudguard spray suppression skirt to reduce wet road spray',
    certification: 'ADR 42/04 (Wheel Guard & Spray Suppression) Approved; VSB 14 Compliant'
  },
  // Page 8
  'ATP-TP-104': {
    dimensions: '3.0 Metres Length x 75mm Bristle x 25mm F-Clip',
    parameters: 'Length: 3.0m | Bristle: 75mm | Anodized aluminium F-clip carrier | Dense black polypropylene filaments',
    technicalSpec: 'Rigid spray suppression and draft barrier brush strip for tippers and trailers',
    certification: 'ADR 42/04 Approved Spray Suppressant System'
  },
  'ATP-TP-105': {
    dimensions: '30mm Pin Diameter x 180mm Centers',
    parameters: 'Pin: 30mm dia | Centers: 180mm | Heavy cast & forged alloy steel | 3-way articulation (top pivot, bottom drop, side swing)',
    technicalSpec: 'Complete 3-way combination hinge kit for dual-action tipper tailgates with greasable zerk fittings',
    certification: 'AS/NZS ISO 9001 Heavy Commercial Transport Standard Approved'
  },
  'ATP-TP-106': {
    dimensions: '40mm Pin Diameter x 200mm Centers',
    parameters: 'Pin: 40mm dia | Centers: 200mm | High-tensile forged steel | 3-way action | Greasable bronze bushings',
    technicalSpec: 'Extra heavy-duty 40mm 3-way tailgate hinge kit for rock, quarry and heavy payload tippers',
    certification: 'AS/NZS ISO 9001 Heavy Commercial Transport Standard Approved'
  },
  'ATP-TP-107': {
    dimensions: '50mm Pin Diameter x 230mm Centers',
    parameters: 'Pin: 50mm dia | Centers: 230mm | Premium forged carbon steel | 50mm solid pins | Rated for heavy dump bodies',
    technicalSpec: 'Severe service 50mm 3-way tipper tailgate pivot and swing kit for road trains and mining tippers',
    certification: 'AS/NZS ISO 9001 Heavy Commercial Transport Standard Approved'
  },
  'ATP-ACC-06': {
    dimensions: '350mm (W) x 350mm (H), Aluminium',
    parameters: 'Dimensions: 350 x 350mm | 1.6mm Marine Aluminium Base | 15 Stainless Steel Hinged Aluminium Leaves | Dual spring clasp',
    technicalSpec: 'Complete multi-placard flip sign containing all 15 Australian Dangerous Goods classes for fuel & chemical transport',
    certification: 'Australian Dangerous Goods Code (ADG 7.8) Approved; AS 1216 & AS 2187 Compliant'
  },
  'ATP-ACC-07': {
    dimensions: '350mm (W) x 350mm (H), ABS',
    parameters: 'Dimensions: 350 x 350mm | Impact-modified UV-stabilized heavy ABS backing | 15 weather-resistant leaves',
    technicalSpec: 'Lightweight multi-class dangerous goods flip placard sign for transport fuel and chem tankers',
    certification: 'Australian Dangerous Goods Code (ADG 7.8) Approved; AS 1216 Compliant'
  },
  'ATP-ACC-08': {
    dimensions: '300 x 400mm Left',
    parameters: 'Dimensions: 300 x 400mm | Orientation: Left Hand | 3M Class 1 (Class 400) High Intensity Prismatic (HIP) | Self-adhesive',
    technicalSpec: 'Heavy vehicle rear marker plate adhesive sticker for rigid trucks, semi-trailers and road trains',
    certification: 'AS 4001.1 (Motor Vehicles - Rear Marker Plates) Certified; VSB 12 & AS/NZS 1906.1 Class 1 Approved'
  },
  'ATP-ACC-09': {
    dimensions: '300 x 400mm Right',
    parameters: 'Dimensions: 300 x 400mm | Orientation: Right Hand | 3M Class 1 HIP Reflective Film | Solvent acrylic permanent adhesive',
    technicalSpec: 'Heavy vehicle rear marker plate sticker, Right Hand slant',
    certification: 'AS 4001.1 (Motor Vehicles - Rear Marker Plates) Certified; VSB 12 & AS/NZS 1906.1 Class 1 Approved'
  },
  'ATP-ACC-10': {
    dimensions: '300 x 300mm Left',
    parameters: 'Dimensions: 300 x 300mm | Orientation: Left Hand chevron | 3M Class 1 HIP prismatic film | Permanent outdoor adhesive',
    technicalSpec: 'Square rear marker plate sticker for trucks and trailers with restricted mounting space',
    certification: 'AS 4001.1 Certified; VSB 12 & AS/NZS 1906.1 Class 1 Approved'
  },
  'ATP-ACC-11': {
    dimensions: '300 x 300mm Right',
    parameters: 'Dimensions: 300 x 300mm | Orientation: Right Hand chevron | 3M Class 1 HIP prismatic film | Weatherproof',
    technicalSpec: 'Square rear marker plate sticker, Right Hand slant',
    certification: 'AS 4001.1 Certified; VSB 12 & AS/NZS 1906.1 Class 1 Approved'
  },
  'ATP-ACC-12': {
    dimensions: '400mm x 100mm 41A Left',
    parameters: 'Dimensions: 400 x 100mm | Configuration: 41A Left | 3M Class 1 Reflective film | Red/Yellow diagonal zebra stripes',
    technicalSpec: 'Strip rear marker plate sticker for narrow vehicle rear sills, tailgates and underrun bars',
    certification: 'AS 4001.1 Certified; VSB 12 Compliant'
  },
  'ATP-ACC-13': {
    dimensions: '400mm x 100mm 41B Right',
    parameters: 'Dimensions: 400 x 100mm | Configuration: 41B Right | 3M Class 1 Reflective film | Red/Yellow diagonal stripes',
    technicalSpec: 'Strip rear marker plate sticker, 41B Right Hand configuration',
    certification: 'AS 4001.1 Certified; VSB 12 Compliant'
  },
  'ATP-ACC-14': {
    dimensions: '600mm x 150mm (Left Side)',
    parameters: 'Dimensions: 600 x 150mm | Orientation: 615A Left Hand | 3M Class 1 Prismatic Reflective | Long-life outdoor durability',
    technicalSpec: 'Full-size 600x150mm rear marker plate sticker for commercial vehicles and prime movers',
    certification: 'AS 4001.1 Certified; VSB 12 & AS/NZS 1906.1 Class 1 Approved'
  },
  'ATP-ACC-15': {
    dimensions: '600mm x 150mm (Right Side)',
    parameters: 'Dimensions: 600 x 150mm | Orientation: 615B Right Hand | 3M Class 1 Prismatic Reflective | UV adhesive',
    technicalSpec: 'Full-size 600x150mm rear marker plate sticker, Right Hand configuration',
    certification: 'AS 4001.1 Certified; VSB 12 & AS/NZS 1906.1 Class 1 Approved'
  },
  'ATP-ACC-16': {
    dimensions: '300 x 100mm',
    parameters: 'Dimensions: 300 x 100mm | Material: 3M Class 1 HIP Yellow Reflective | Bold black text: "DO NOT OVERTAKE TURNING VEHICLE"',
    technicalSpec: 'Heavy vehicle turning safety warning sticker for mounting alongside rear marker plates',
    certification: 'VSB 12 & Australian Road Rules Regulation 315 Certified Approved'
  },
  'ATP-ACC-17': {
    dimensions: '510 x 250mm',
    parameters: 'Dimensions: 510 x 250mm | 3M Class 1 Reflective on 1.6mm Marine Aluminium Plate | Pre-drilled holes | Text: "ROAD TRAIN"',
    technicalSpec: 'Rigid aluminium combination vehicle warning sign for designated road train routes',
    certification: 'NHVR Heavy Vehicle National Law & VSB 12 Approved Certified'
  },
  // Page 9
  'ATP-ACC-18': {
    dimensions: '510 x 251mm',
    parameters: 'Dimensions: 510 x 251mm | 3M Class 1 Reflective on 1.6mm Aluminium Plate | Pre-drilled mounting holes | Text: "OVERSIZE"',
    technicalSpec: 'Over-dimension vehicle warning sign for wide/long haulage transport',
    certification: 'NHVR Oversize Overmass (OSOM) National Regulation & VSB 12 Approved'
  },
  'ATP-ACC-19': {
    dimensions: '600 x 450mm',
    parameters: 'Dimensions: 600 x 450mm | 3M Class 1 Reflective on 1.6mm Aluminium Plate | Text: "LONG VEHICLE"',
    technicalSpec: 'Long vehicle rear marker aluminium plate for B-doubles and long single articulated combinations',
    certification: 'NHVR Heavy Vehicle National Law & VSB 12 Approved Certified'
  },
  // Multi-packs for stickers
  'ATP-ACC-20': {
    dimensions: '300 x 400mm Left (Pack of 2)',
    parameters: 'Pack: 2 Plates | 300 x 400mm Left | 3M Class 1 HIP Reflective Film | Self-adhesive vinyl',
    technicalSpec: 'Heavy vehicle rear marker plate stickers pack of 2 (Left Hand)',
    certification: 'AS 4001.1 Certified; VSB 12 Approved'
  },
  'ATP-ACC-21': {
    dimensions: '300 x 400mm Right (Pack of 2)',
    parameters: 'Pack: 2 Plates | 300 x 400mm Right | 3M Class 1 HIP Reflective Film | Self-adhesive vinyl',
    technicalSpec: 'Heavy vehicle rear marker plate stickers pack of 2 (Right Hand)',
    certification: 'AS 4001.1 Certified; VSB 12 Approved'
  },
  'ATP-ACC-22': {
    dimensions: '300 x 300mm Left (Pack of 2)',
    parameters: 'Pack: 2 Plates | 300 x 300mm Left | 3M Class 1 HIP reflective film | Permanent adhesive',
    technicalSpec: 'Square rear marker plate stickers pack of 2 (Left Hand)',
    certification: 'AS 4001.1 Certified; VSB 12 Approved'
  },
  'ATP-ACC-23': {
    dimensions: '300 x 300mm Right (Pack of 2)',
    parameters: 'Pack: 2 Plates | 300 x 300mm Right | 3M Class 1 HIP reflective film | Permanent adhesive',
    technicalSpec: 'Square rear marker plate stickers pack of 2 (Right Hand)',
    certification: 'AS 4001.1 Certified; VSB 12 Approved'
  },
  'ATP-ACC-24': {
    dimensions: '400 x 100mm 41A Left (Pack of 2)',
    parameters: 'Pack: 2 Plates | 400 x 100mm 41A | 3M Class 1 Reflective | Strip configuration',
    technicalSpec: 'Zebra strip rear marker stickers pack of 2 (Left Hand)',
    certification: 'AS 4001.1 Certified; VSB 12 Approved'
  },
  'ATP-ACC-25': {
    dimensions: '400 x 100mm 41B Right (Pack of 2)',
    parameters: 'Pack: 2 Plates | 400 x 100mm 41B | 3M Class 1 Reflective | Strip configuration',
    technicalSpec: 'Zebra strip rear marker stickers pack of 2 (Right Hand)',
    certification: 'AS 4001.1 Certified; VSB 12 Approved'
  },
  'ATP-ACC-26': {
    dimensions: '600 x 150mm Left (Pack of 2)',
    parameters: 'Pack: 2 Plates | 600 x 150mm 615A | 3M Class 1 Reflective | Long life outdoor adhesive',
    technicalSpec: 'Full-size vehicle zebra rear marker stickers pack of 2 (Left Side)',
    certification: 'AS 4001.1 Certified; VSB 12 Approved'
  },
  'ATP-ACC-27': {
    dimensions: '600 x 150mm Right (Pack of 2)',
    parameters: 'Pack: 2 Plates | 600 x 150mm 615B | 3M Class 1 Reflective | Long life outdoor adhesive',
    technicalSpec: 'Full-size vehicle zebra rear marker stickers pack of 2 (Right Side)',
    certification: 'AS 4001.1 Certified; VSB 12 Approved'
  },
  // Aluminium plate signs
  'ATP-ACC-28': {
    dimensions: '300 x 400mm Left Hand on Aluminium Plate',
    parameters: 'Backing: 1.6mm Marine Grade 5052-H32 Aluminium Plate | Facing: 3M Class 1 HIP Reflective | Orientation: Left Hand',
    technicalSpec: 'Rigid aluminium rear marker plate for heavy transport vehicles, trailers and prime movers',
    certification: 'AS 4001.1 (Rear Marker Plates for Motor Vehicles and Trailers) Certified; VSB 12 Approved'
  },
  'ATP-ACC-29': {
    dimensions: '300 x 300mm on Aluminium Plate',
    parameters: 'Backing: 1.6mm Marine Grade Aluminium Plate | Facing: 3M Class 1 Reflective | Orientation: Right Hand chevron',
    technicalSpec: 'Rigid square aluminium rear marker plate for heavy transport vehicles',
    certification: 'AS 4001.1 Certified; VSB 12 Approved'
  },
  'ATP-ACC-30': {
    dimensions: '300 x 100mm on Aluminium Plate',
    parameters: 'Backing: 1.6mm Aluminium Plate | Text: "DO NOT OVERTAKE TURNING VEHICLE" | Facing: 3M Class 1 Yellow Reflective',
    technicalSpec: 'Rigid aluminium turning vehicle warning plate for rear mounting alongside marker plates',
    certification: 'VSB 12 & Australian Road Rules Regulation 315 Certified Approved'
  },
  'ATP-ACC-31': {
    dimensions: '400 x 100mm Left Hand on Aluminium Plate',
    parameters: 'Backing: 1.6mm Aluminium Plate | Facing: 3M Class 1 Reflective Zebra (41A Left) | Pre-drilled mounting holes',
    technicalSpec: 'Rigid aluminium strip rear marker plate for truck and trailer rear crossmembers',
    certification: 'AS 4001.1 Certified; VSB 12 Approved'
  },
  'ATP-ACC-32': {
    dimensions: '400 x 100mm Right Hand on Aluminium Plate',
    parameters: 'Backing: 1.6mm Aluminium Plate | Facing: 3M Class 1 Reflective Zebra (41B Right) | Pre-drilled mounting holes',
    technicalSpec: 'Rigid aluminium strip rear marker plate for truck and trailer rear crossmembers',
    certification: 'AS 4001.1 Certified; VSB 12 Approved'
  },
  'ATP-ACC-33': {
    dimensions: '600 x 150mm Left Hand on Aluminium Plate',
    parameters: 'Backing: 1.6mm Heavy Marine Grade Aluminium Plate | Facing: 3M Class 1 Reflective Zebra (615A Left)',
    technicalSpec: 'Full-size rigid aluminium rear marker plate for commercial trucks, semi-trailers and B-doubles',
    certification: 'AS 4001.1 Certified; VSB 12 Approved'
  },
  'ATP-ACC-34': {
    dimensions: '600 x 150mm Right Hand on Aluminium Plate',
    parameters: 'Backing: 1.6mm Heavy Marine Grade Aluminium Plate | Facing: 3M Class 1 Reflective Zebra (615B Right)',
    technicalSpec: 'Full-size rigid aluminium rear marker plate for commercial trucks, semi-trailers and B-doubles',
    certification: 'AS 4001.1 Certified; VSB 12 Approved'
  },
  // Page 10
  'ATP-ACC-35': {
    dimensions: '600mm x 150mm on Aluminium Plate (Left)',
    parameters: 'Backing: 1.6mm Aluminium Plate | Facing: 3M Class 1 Reflective Chevron with integrated DNOTV sign (615A Left)',
    technicalSpec: 'Combination marker and turning vehicle warning sign on heavy aluminium plate',
    certification: 'AS 4001.1 & VSB 12 Certified Approved'
  },
  'ATP-ACC-36': {
    dimensions: '600mm x 150mm on Aluminium Plate (Right)',
    parameters: 'Backing: 1.6mm Aluminium Plate | Facing: 3M Class 1 Reflective Chevron with integrated DNOTV sign (615B Right)',
    technicalSpec: 'Combination marker and turning vehicle warning sign on heavy aluminium plate',
    certification: 'AS 4001.1 & VSB 12 Certified Approved'
  }
};

let _catalogueSpecsSynced = false;

async function syncCatalogueSpecs(m = mongoose) {
  if (_catalogueSpecsSynced) return 0;
  const collection = m.connection.collection('products');
  const skus = Object.keys(CATALOGUE_UPDATES);

  // Single batch find instead of 113 sequential round-trips
  const existingDocs = await collection.find({ sku: { $in: skus } }).toArray();
  const existingMap = new Map(existingDocs.map((doc) => [doc.sku, doc]));

  const bulkOps = [];
  for (const [sku, data] of Object.entries(CATALOGUE_UPDATES)) {
    const existing = existingMap.get(sku);
    if (!existing) continue;

    const currentSpecs = existing.specs || {};
    const updatedSpecs = {
      ...currentSpecs,
      'Dimensions': data.dimensions,
      'Product Parameter': data.parameters,
      'Technical Specification': data.technicalSpec,
      'Certification': data.certification,
      'Australian Standard': data.certification.split(';')[0].trim()
    };

    // Eliminate contradictory height for wheel nut covers
    if (sku === 'ATP-ACC-03' || sku === 'ATP-ACC-04') {
      updatedSpecs['Overall Height'] = '50 mm (1-31/32 in)';
    }

    // Keep specifications array in sync
    const specsMap = new Map();
    if (Array.isArray(existing.specifications)) {
      for (const item of existing.specifications) {
        if (item && item.label) specsMap.set(item.label, item.value);
      }
    }
    for (const [k, v] of Object.entries(updatedSpecs)) {
      specsMap.set(k, String(v));
    }
    const updatedSpecificationsArray = Array.from(specsMap.entries()).map(([label, value]) => ({ label, value }));

    bulkOps.push({
      updateOne: {
        filter: { sku },
        update: {
          $set: {
            specs: updatedSpecs,
            specifications: updatedSpecificationsArray
          }
        }
      }
    });
  }

  if (bulkOps.length > 0) {
    await collection.bulkWrite(bulkOps, { ordered: false });
  }

  // Ensure tail lifts have Australian Standard certification
  await collection.updateMany(
    { sku: { $regex: /^ATP-TL-/i } },
    {
      $set: {
        'specs.Certification': 'ADR 84/00 & AS/NZS 1418.8 Certified Commercial Vehicle Tail Lift',
        'specs.Australian Standard': 'ADR 84/00 & AS/NZS 1418.8 Certified'
      }
    }
  );

  // Ensure all remaining trailer hardware (ATP-TP-01 to 28) and accessories have commercial standards
  await collection.updateMany(
    { sku: { $regex: /^ATP-TP-(0[1-9]|1[0-5])/i }, 'specs.Certification': { $exists: false } },
    {
      $set: {
        'specs.Certification': 'AS/NZS 4380:2001 & AS/NZS ISO 9001 Heavy Commercial Transport Standard Approved',
        'specs.Australian Standard': 'AS/NZS ISO 9001 Heavy Commercial Transport Approved'
      }
    }
  );

  await collection.updateMany(
    { 'specs.Certification': { $exists: false } },
    {
      $set: {
        'specs.Certification': 'AS/NZS ISO 9001 Heavy Commercial Transport Standard Approved',
        'specs.Australian Standard': 'AS/NZS ISO 9001 Commercial Transport Standard Approved'
      }
    }
  );

  _catalogueSpecsSynced = true;
  return bulkOps.length;
}

if (require.main === module) {
  (async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aurex';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB for catalogue specs update...`);
    const count = await syncCatalogueSpecs(mongoose);
    console.log(`\nSuccessfully updated ${count} products with catalogue dimensions, parameters and Australian Standard certifications!`);
    await mongoose.disconnect();
  })().catch(console.error);
}

module.exports = {
  CATALOGUE_UPDATES,
  syncCatalogueSpecs
};
