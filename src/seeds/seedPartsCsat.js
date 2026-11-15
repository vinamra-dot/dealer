export function getPartsCsatSeedData() {
  const spareParts = [
    {
      id: 'part-01',
      dealership_id: 'dealership-apex-01',
      part_number: 'TM-OIL-SYN-5W30',
      part_name: 'Fully Synthetic Engine Oil (5W-30) - 3.5L',
      category: 'LUBRICANTS',
      bin_location: 'RACK-A-01',
      stock_quantity: 45,
      min_stock_alert: 15,
      unit_price: 2650.00,
      compatibility: 'Harrier, Safari, Nexon, Punch'
    },
    {
      id: 'part-02',
      dealership_id: 'dealership-apex-01',
      part_number: 'TM-BRK-FRT-HAR',
      part_name: 'Front Ceramic Brake Pad Set',
      category: 'BRAKES',
      bin_location: 'BIN-B-14',
      stock_quantity: 4,
      min_stock_alert: 8,
      unit_price: 4200.00,
      compatibility: 'Harrier, Safari'
    },
    {
      id: 'part-03',
      dealership_id: 'dealership-apex-01',
      part_number: 'TM-FLT-OIL-01',
      part_name: 'Genuine Spin-On Oil Filter',
      category: 'FILTERS',
      bin_location: 'BIN-C-05',
      stock_quantity: 68,
      min_stock_alert: 20,
      unit_price: 480.00,
      compatibility: 'Universal Tata Diesel / Petrol'
    },
    {
      id: 'part-04',
      dealership_id: 'dealership-apex-01',
      part_number: 'TM-FLT-AIR-02',
      part_name: 'High Flow Air Cleaner Element',
      category: 'FILTERS',
      bin_location: 'BIN-C-08',
      stock_quantity: 28,
      min_stock_alert: 10,
      unit_price: 750.00,
      compatibility: 'Harrier, Safari Kryotec 2.0L'
    },
    {
      id: 'part-05',
      dealership_id: 'dealership-apex-01',
      part_number: 'TM-EV-CHG-7KW',
      part_name: '7.2kW AC Fast Home Wallbox Charger',
      category: 'ELECTRICAL_EV',
      bin_location: 'BAY-EV-SEC-01',
      stock_quantity: 12,
      min_stock_alert: 5,
      unit_price: 32000.00,
      compatibility: 'Nexon EV, Curvv EV, Tiago EV'
    },
    {
      id: 'part-06',
      dealership_id: 'dealership-apex-01',
      part_number: 'TM-WPR-SET-26',
      part_name: 'Frameless Aerodynamic Wiper Blades (Pair)',
      category: 'ACCESSORIES',
      bin_location: 'BIN-D-02',
      stock_quantity: 32,
      min_stock_alert: 10,
      unit_price: 1150.00,
      compatibility: 'Harrier, Safari, Curvv'
    }
  ];

  const csatSurveys = [
    {
      id: 'csat-01',
      dealership_id: 'dealership-apex-01',
      customer_name: 'Rahul Sharma',
      customer_phone: '+91-9876543210',
      vehicle_model: 'Nexon EV',
      delivery_date: '2026-11-01',
      nps_rating: 10,
      feedback_category: 'SALES_EXPERIENCE',
      comments: 'Outstanding delivery experience! Rohan Verma explained all EV software features thoroughly.',
      survey_status: 'COMPLETED',
      first_service_due: '2026-12-01',
      service_reminder_sent: true
    },
    {
      id: 'csat-02',
      dealership_id: 'dealership-apex-01',
      customer_name: 'Dr. Alok Nath',
      customer_phone: '+91-9414012345',
      vehicle_model: 'Harrier',
      delivery_date: '2026-11-05',
      nps_rating: 9,
      feedback_category: 'DELIVERY_TIMELINESS',
      comments: 'Car was sanitized and spotless. Documentation was very quick with finance team.',
      survey_status: 'COMPLETED',
      first_service_due: '2026-12-05',
      service_reminder_sent: false
    },
    {
      id: 'csat-03',
      dealership_id: 'dealership-apex-01',
      customer_name: 'Priya Rathore',
      customer_phone: '+91-9829033445',
      vehicle_model: 'Punch',
      delivery_date: '2026-11-08',
      nps_rating: 8,
      feedback_category: 'CONSULTANT_BEHAVIOR',
      comments: 'Pleased with the vehicle. Waiting time at cashier was a bit high.',
      survey_status: 'COMPLETED',
      first_service_due: '2026-12-08',
      service_reminder_sent: false
    }
  ];

  return { spareParts, csatSurveys };
}