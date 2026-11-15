import bcrypt from 'bcryptjs';

export async function getCoreSeedData() {
  const passwordHash = await bcrypt.hash('Password@123', 10);
  const dId = 'dealership-apex-01';

  const dealership = {
    id: dId,
    name: 'Apex Mobility Motors',
    city: 'Jaipur',
    tier: 'Tier-2',
    oem_brand: 'Tata Motors',
    address: 'Plot 42, Transport Nagar, Tonk Road, Jaipur'
  };

  const users = [
    { id: 'usr-ceo', name: 'Rajesh Singhania', email: 'ceo@apexmotors.com', role: 'SYSTEM_ADMIN', phone: '+91-9829011111' },
    { id: 'usr-gm', name: 'Vikramaditya Rathore', email: 'gm@apexmotors.com', role: 'GENERAL_MANAGER', phone: '+91-9829022222' },
    { id: 'usr-sm', name: 'Ananya Sharma', email: 'sales.mgr@apexmotors.com', role: 'SALES_MANAGER', phone: '+91-9829033333' },
    { id: 'usr-sc1', name: 'Rohan Verma', email: 'sales.rep@apexmotors.com', role: 'SALES_CONSULTANT', phone: '+91-9829044444' },
    { id: 'usr-sc2', name: 'Amit Saxena', email: 'amit.sales@apexmotors.com', role: 'SALES_CONSULTANT', phone: '+91-9829044445' },
    { id: 'usr-tc', name: 'Pooja Mehra', email: 'telecaller@apexmotors.com', role: 'TELECALLER', phone: '+91-9829055555' },
    { id: 'usr-fin', name: 'Manish Agarwal', email: 'finance@apexmotors.com', role: 'FINANCE_HEAD', phone: '+91-9829066666' },
    { id: 'usr-pdi', name: 'Surendra Yadav', email: 'pdi@apexmotors.com', role: 'LOGISTICS_PDI', phone: '+91-9829077777' },
    { id: 'usr-drv', name: 'Mohan Lal', email: 'driver@apexmotors.com', role: 'DRIVER', phone: '+91-9829088888' }
  ].map(u => ({ ...u, dealership_id: dId, password_hash: passwordHash }));

  const vehicles = [
    { id: 'veh-01', model: 'Nexon EV', variant: 'Empowered Plus LR', color: 'Pristine White', fuel: 'ELECTRIC', trans: 'AUTO', price: 1929000, vin: 'MAT621001PA001', engine: 'MOT-EV-901', status: 'AVAILABLE', yard: 'Stockyard Bay-A1', cost: 350 },
    { id: 'veh-02', model: 'Harrier', variant: 'Fearless Plus Dark', color: 'Oberon Black', fuel: 'DIESEL', trans: 'AUTO', price: 2644000, vin: 'MAT621002PA002', engine: 'ENG-D20-802', status: 'DEMO', yard: 'Showroom Demo Line', cost: 350 },
    { id: 'veh-03', model: 'Safari', variant: 'Accomplished Plus 6S', color: 'Cosmic Gold', fuel: 'DIESEL', trans: 'AUTO', price: 2734000, vin: 'MAT621003PA003', engine: 'ENG-D20-803', status: 'ALLOCATED', yard: 'PDI Bay 2', cost: 350 },
    { id: 'veh-04', model: 'Punch', variant: 'Creative Flagship DT', color: 'Atomic Orange', fuel: 'PETROL', trans: 'MANUAL', price: 960000, vin: 'MAT621004PA004', engine: 'ENG-P12-104', status: 'AVAILABLE', yard: 'Stockyard Bay-C2', cost: 300 },
    { id: 'veh-05', model: 'Curvv EV', variant: 'Empowered Plus A 55', color: 'Virtual Sunrise', fuel: 'ELECTRIC', trans: 'AUTO', price: 2199000, vin: 'MAT621005PA005', engine: 'MOT-EV-905', status: 'IN_TRANSIT', yard: 'Transit En-Route', cost: 350 },
    { id: 'veh-06', model: 'Nexon', variant: 'Fearless Plus S', color: 'Daytona Grey', fuel: 'PETROL', trans: 'DCA', price: 1420000, vin: 'MAT621006PA006', engine: 'ENG-P12-106', status: 'AVAILABLE', yard: 'Stockyard Bay-A3', cost: 320 },
    { id: 'veh-07', model: 'Tiago EV', variant: 'XZ Plus Tech LUX', color: 'Teal Blue', fuel: 'ELECTRIC', trans: 'AUTO', price: 1149000, vin: 'MAT621007PA007', engine: 'MOT-EV-907', status: 'AVAILABLE', yard: 'Stockyard Bay-B1', cost: 280 },
    { id: 'veh-08', model: 'Harrier', variant: 'Adventure Plus A', color: 'Pebble Grey', fuel: 'DIESEL', trans: 'AUTO', price: 2399000, vin: 'MAT621008PA008', engine: 'ENG-D20-808', status: 'DELIVERED', yard: 'Showroom Delivery Bay', cost: 0 },
    { id: 'veh-09', model: 'Punch EV', variant: 'Empowered Plus S LR', color: 'Seaweed Green', fuel: 'ELECTRIC', trans: 'AUTO', price: 1449000, vin: 'MAT621009PA009', engine: 'MOT-EV-909', status: 'ALLOCATED', yard: 'Stockyard Bay-B4', cost: 320 },
    { id: 'veh-10', model: 'Safari', variant: 'Dark Edition 7S', color: 'Oberon Black', fuel: 'DIESEL', trans: 'AUTO', price: 2699000, vin: 'MAT621010PA010', engine: 'ENG-D20-810', status: 'AVAILABLE', yard: 'Stockyard Bay-D1', cost: 350 },
    { id: 'veh-11', model: 'Altroz', variant: 'XZ Plus OS i-Turbo', color: 'Opera Blue', fuel: 'PETROL', trans: 'MANUAL', price: 999000, vin: 'MAT621011PA011', engine: 'ENG-P12-111', status: 'AVAILABLE', yard: 'Stockyard Bay-C3', cost: 290 },
    { id: 'veh-12', model: 'Curvv', variant: 'Accomplished Plus Hyperion', color: 'Pure Grey', fuel: 'PETROL', trans: 'DCA', price: 1749000, vin: 'MAT621012PA012', engine: 'ENG-P12-112', status: 'AVAILABLE', yard: 'Stockyard Bay-A2', cost: 340 }
  ].map(v => ({ ...v, dealership_id: dId }));

  const leads = [
    { id: 'lead-01', customer_name: 'Dr. Alok Nath', phone: '+91-9414012345', email: 'alok.nath@hospital.org', source: 'ONLINE_PORTAL', interested_model: 'Harrier', budget: 2700000, status: 'TEST_DRIVE_SCHEDULED', assigned_to_user_id: 'usr-sc1', telecaller_user_id: 'usr-tc', remarks: 'High intent buyer, requested dark edition test drive.' },
    { id: 'lead-02', customer_name: 'Priyanka Mittal', phone: '+91-9828067890', email: 'priyanka.m@gmail.com', source: 'WALK_IN', interested_model: 'Nexon EV', budget: 2000000, status: 'BOOKED', assigned_to_user_id: 'usr-sc1', telecaller_user_id: 'usr-tc', remarks: 'Exchange required for 2018 Swift Dzire. Approved.' },
    { id: 'lead-03', customer_name: 'Suresh Choudhary', phone: '+91-9929054321', email: 'suresh.c@textiles.com', source: 'OEM_DMS_SYNC', interested_model: 'Safari', budget: 2800000, status: 'NEW', assigned_to_user_id: 'usr-sm', telecaller_user_id: 'usr-tc', remarks: 'Looking for 7-seater delivery before next month.' },
    { id: 'lead-04', customer_name: 'Kavita Rathore', phone: '+91-9829123456', email: 'kavita.r@startup.in', source: 'DIGITAL_AD', interested_model: 'Curvv EV', budget: 2200000, status: 'QUOTED', assigned_to_user_id: 'usr-sc2', telecaller_user_id: 'usr-tc', remarks: 'Comparing Curvv EV with Creta EV.' },
    { id: 'lead-05', customer_name: 'Rajendra Joshi', phone: '+91-9785098765', email: 'r.joshi@bank.co.in', source: 'REFERRAL', interested_model: 'Punch', budget: 1000000, status: 'BOOKED', assigned_to_user_id: 'usr-sc2', telecaller_user_id: 'usr-tc', remarks: 'Bank employee, SBI auto loan pre-approved.' },
    { id: 'lead-06', customer_name: 'Sunita Jain', phone: '+91-9414087654', email: 'sunita.jain@jewellers.com', source: 'WALK_IN', interested_model: 'Tiago EV', budget: 1200000, status: 'NEW', assigned_to_user_id: 'usr-sc1', telecaller_user_id: 'usr-tc', remarks: 'City commuting second car for family.' },
    { id: 'lead-07', customer_name: 'Mahesh Sharma', phone: '+91-9829333444', email: 'mahesh.s@infra.com', source: 'CARDEKHO', interested_model: 'Harrier', budget: 2500000, status: 'QUOTED', assigned_to_user_id: 'usr-sc1', telecaller_user_id: 'usr-tc', remarks: 'Sent quote with 3-year extended warranty.' },
    { id: 'lead-08', customer_name: 'Deepak Agarwal', phone: '+91-9829444555', email: 'deepak.a@pharma.org', source: 'WALK_IN', interested_model: 'Nexon', budget: 1500000, status: 'TEST_DRIVE_SCHEDULED', assigned_to_user_id: 'usr-sc2', telecaller_user_id: 'usr-tc', remarks: 'Wants test drive of DCA transmission.' },
    { id: 'lead-09', customer_name: 'Harish Gehlot', phone: '+91-9829555666', email: 'harish.g@gmail.com', source: 'OEM_DMS_SYNC', interested_model: 'Altroz', budget: 1050000, status: 'NEW', assigned_to_user_id: 'usr-sm', telecaller_user_id: 'usr-tc', remarks: 'Inquired about CNG twin cylinder availability.' }
  ].map(l => ({ ...l, dealership_id: dId }));

  return { dealership, users, vehicles, leads };
}
