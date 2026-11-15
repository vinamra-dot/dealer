export function getKycWorkshopSeedData() {
  const kycList = [
    {
      id: 'kyc-01',
      dealership_id: 'dealership-apex-01',
      customer_name: 'Rahul Sharma',
      customer_phone: '+91-9876543210',
      pan_number: 'ABCPS1234F',
      aadhaar_masked: 'XXXX-XXXX-9012',
      doc_type: 'AADHAAR_PAN',
      verification_status: 'VERIFIED',
      uploaded_files: 'pan_card.pdf, aadhaar_card.pdf',
      verified_by: 'Finance Head (Anil Mehta)',
      remarks: 'All RTO verification cleared. Ready for vehicle registration.'
    },
    {
      id: 'kyc-02',
      dealership_id: 'dealership-apex-01',
      customer_name: 'Dr. Alok Nath',
      customer_phone: '+91-9414012345',
      pan_number: 'ALKPZ7890K',
      aadhaar_masked: 'XXXX-XXXX-4567',
      doc_type: 'AADHAAR_PAN_DL',
      verification_status: 'VERIFIED',
      uploaded_files: 'pan_dr_alok.pdf, driving_licence.pdf',
      verified_by: 'Finance Head (Anil Mehta)',
      remarks: 'Doctor quota verified. HDFC DO sanction attached.'
    },
    {
      id: 'kyc-03',
      dealership_id: 'dealership-apex-01',
      customer_name: 'Priya Rathore',
      customer_phone: '+91-9829033445',
      pan_number: 'PRYRT5678M',
      aadhaar_masked: 'XXXX-XXXX-7891',
      doc_type: 'AADHAAR_PAN',
      verification_status: 'PENDING',
      uploaded_files: 'aadhaar_card.pdf',
      verified_by: null,
      remarks: 'PAN card upload pending from customer.'
    },
    {
      id: 'kyc-04',
      dealership_id: 'dealership-apex-01',
      customer_name: 'Vikramaditya Solanki',
      customer_phone: '+91-9829122334',
      pan_number: 'VKMSL9911P',
      aadhaar_masked: 'XXXX-XXXX-3344',
      doc_type: 'COMPANY_GST_KYC',
      verification_status: 'VERIFIED',
      uploaded_files: 'gst_certificate.pdf, pan.pdf',
      verified_by: 'General Manager (Suresh Nair)',
      remarks: 'Corporate purchase for Solanki Infra Ltd.'
    }
  ];

  const jobCards = [
    {
      id: 'jc-01',
      dealership_id: 'dealership-apex-01',
      job_card_number: 'JC-2026-0891',
      customer_name: 'Harish Choudhary',
      customer_phone: '+91-9414055667',
      vehicle_model: 'Harrier',
      reg_number: 'MH-02-DW-8821',
      odometer_in: 20450,
      fuel_level: '65%',
      service_type: 'PERIODIC_MAINTENANCE',
      bay_number: 'BAY-02 (HYDRAULIC)',
      advisor_name: 'Manish Saini',
      technician_name: 'Ramesh Kumawat',
      estimated_cost: 8500.00,
      actual_cost: 8200.00,
      status: 'IN_REPAIR',
      complaints: 'Engine oil replacement, wheel alignment, brake inspection.'
    },
    {
      id: 'jc-02',
      dealership_id: 'dealership-apex-01',
      job_card_number: 'JC-2026-0892',
      customer_name: 'Sunita Meena',
      customer_phone: '+91-9829044556',
      vehicle_model: 'Nexon EV',
      reg_number: 'MH-12-EV-1029',
      odometer_in: 5120,
      fuel_level: '85% SoC',
      service_type: 'FIRST_FREE_SERVICE',
      bay_number: 'BAY-01 (EV DIAGNOSTIC)',
      advisor_name: 'Manish Saini',
      technician_name: 'Vikram EV Specialist',
      estimated_cost: 0.00,
      actual_cost: 0.00,
      status: 'WASHING',
      complaints: 'First 5,000 km check-up, battery health diagnosis.'
    },
    {
      id: 'jc-03',
      dealership_id: 'dealership-apex-01',
      job_card_number: 'JC-2026-0893',
      customer_name: 'Kavita Agarwal',
      customer_phone: '+91-9829088771',
      vehicle_model: 'Safari',
      reg_number: 'MH-14-XY-9900',
      odometer_in: 34100,
      fuel_level: '40%',
      service_type: 'RUNNING_REPAIR',
      bay_number: 'BAY-03 (LIFT)',
      advisor_name: 'Rajendra Joshi',
      technician_name: 'Mukesh Sharma',
      estimated_cost: 14200.00,
      actual_cost: 0.00,
      status: 'ARRIVED',
      complaints: 'Front brake shudder, AC cooling intermittent.'
    },
    {
      id: 'jc-04',
      dealership_id: 'dealership-apex-01',
      job_card_number: 'JC-2026-0894',
      customer_name: 'Deepak Gehlot',
      customer_phone: '+91-9414033221',
      vehicle_model: 'Punch',
      reg_number: 'MH-01-PZ-4411',
      odometer_in: 12800,
      fuel_level: '50%',
      service_type: 'PERIODIC_MAINTENANCE',
      bay_number: 'BAY-04 (QUICK SERVICE)',
      advisor_name: 'Rajendra Joshi',
      technician_name: 'Santosh Yadav',
      estimated_cost: 4800.00,
      actual_cost: 4800.00,
      status: 'QC_CLEARED',
      complaints: '10,000 km general service, tire rotation.'
    }
  ];

  return { kycList, jobCards };
}