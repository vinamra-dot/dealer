// Seeds for Accidental Claims, Used Car Auctions & HSRP/FASTag
export function getUltimateSeedData() {
  const dId = 'dealership-apex-01';

  const accidentalClaims = [
    {
      id: 'claim-01',
      dealership_id: dId,
      claim_number: 'CLM-2026-0812',
      customer_name: 'Kailash Kher',
      customer_phone: '+91-9820011223',
      vehicle_model: 'Harrier Fearless+ Dark',
      reg_number: 'MH-02-DW-8821',
      insurance_company: 'HDFC ERGO General Insurance',
      policy_number: 'HD-MOT-2026-9921',
      surveyor_name: 'Rajesh Deshmukh',
      surveyor_phone: '+91-9820011223',
      estimated_loss: 45000.00,
      approved_amount: 42500.00,
      customer_deductible: 1000.00,
      claim_status: 'CASHLESS_SANCTIONED',
      damage_description: 'Rear bumper, sensor harness and tailgate metallic paint repair.'
    },
    {
      id: 'claim-02',
      dealership_id: dId,
      claim_number: 'CLM-2026-0813',
      customer_name: 'Anil Kulkarni',
      customer_phone: '+91-9822044551',
      vehicle_model: 'Nexon EV Empowered',
      reg_number: 'MH-12-EV-1029',
      insurance_company: 'ICICI Lombard GIC',
      policy_number: 'IC-EV-8821-33',
      surveyor_name: 'Prashant Patil',
      surveyor_phone: '+91-9822044551',
      estimated_loss: 28000.00,
      approved_amount: 28000.00,
      customer_deductible: 1000.00,
      claim_status: 'IN_PAINT_BOOTH',
      damage_description: 'Left front fender denting, DRL alignment and bumper painting.'
    },
    {
      id: 'claim-03',
      dealership_id: dId,
      claim_number: 'CLM-2026-0814',
      customer_name: 'Vikram Gokhale',
      customer_phone: '+91-9823099882',
      vehicle_model: 'Safari Accomplished+ 6S',
      reg_number: 'MH-14-XY-9900',
      insurance_company: 'Bajaj Allianz General Insurance',
      policy_number: 'BA-SAF-7712',
      surveyor_name: 'Sanjay Shinde',
      surveyor_phone: '+91-9823099882',
      estimated_loss: 62000.00,
      approved_amount: 0.00,
      customer_deductible: 1500.00,
      claim_status: 'SURVEY_SCHEDULED',
      damage_description: 'Frontal collision damage: radiator grill, bracket and AC condenser.'
    }
  ];

  const auctions = [
    {
      id: 'auc-01',
      dealership_id: dId,
      used_car_id: 'uc-01',
      vehicle_name: '2021 Hyundai Creta SX (Petrol)',
      reg_number: 'MH-02-EE-4491',
      evaluator_name: 'Ganesh Shinde',
      starting_bid: 850000.00,
      current_highest_bid: 940000.00,
      highest_bidder: 'Spinny Direct Procurement',
      auction_status: 'ACTIVE',
      total_bids: 7
    },
    {
      id: 'auc-02',
      dealership_id: dId,
      used_car_id: 'uc-02',
      vehicle_name: '2019 Maruti Vitara Brezza ZDi',
      reg_number: 'MH-12-QC-1120',
      evaluator_name: 'Ganesh Shinde',
      starting_bid: 620000.00,
      current_highest_bid: 695000.00,
      highest_bidder: 'Cars24 B2B Dealer Network',
      auction_status: 'ACTIVE',
      total_bids: 5
    },
    {
      id: 'auc-03',
      dealership_id: dId,
      used_car_id: 'uc-03',
      vehicle_name: '2020 Honda City VX (Manual)',
      reg_number: 'MH-04-AK-9081',
      evaluator_name: 'Vikramaditya Rathore',
      starting_bid: 780000.00,
      current_highest_bid: 845000.00,
      highest_bidder: 'CarDekho Auctions Pro',
      auction_status: 'ACCEPTED',
      total_bids: 11
    }
  ];

  const compliance = [
    {
      id: 'fit-01',
      dealership_id: dId,
      booking_id: 'bk-01',
      otf_number: 'OTF-892101',
      customer_name: 'Priyanka Mittal',
      vehicle_model: 'Safari Empowered Plus LR',
      vin: 'MAT621003PA003',
      reg_number: 'MH-02-DW-4091',
      front_hsrp_laser_code: 'MH02AA90123',
      rear_hsrp_laser_code: 'MH02AA90124',
      fastag_barcode: '60741299881001',
      fastag_bank: 'IDBI_BANK',
      fastag_status: 'ACTIVE',
      hsrp_status: 'AFFIXED'
    },
    {
      id: 'fit-02',
      dealership_id: dId,
      booking_id: 'bk-02',
      otf_number: 'OTF-892102',
      customer_name: 'Rajendra Joshi',
      vehicle_model: 'Punch Creative Flagship',
      vin: 'MAT621009PA009',
      reg_number: 'MH-12-EV-5512',
      front_hsrp_laser_code: 'MH12BB44102',
      rear_hsrp_laser_code: 'MH12BB44103',
      fastag_barcode: '60741299881002',
      fastag_bank: 'ICICI_BANK',
      fastag_status: 'PENDING',
      hsrp_status: 'AFFIXED'
    },
    {
      id: 'fit-03',
      dealership_id: dId,
      booking_id: 'bk-03',
      otf_number: 'OTF-892103',
      customer_name: 'Dr. Alok Nath',
      vehicle_model: 'Harrier Fearless Dark',
      vin: 'MAT621002PA002',
      reg_number: 'MH-01-PZ-9912',
      front_hsrp_laser_code: 'Awaiting Laser Tag',
      rear_hsrp_laser_code: 'Awaiting Laser Tag',
      fastag_barcode: '60741299881003',
      fastag_bank: 'IDBI_BANK',
      fastag_status: 'PENDING',
      hsrp_status: 'PENDING'
    }
  ];

  return { accidentalClaims, auctions, compliance };
}
