export async function getLiveTransportGps(req, res, next) {
  try {
    const { identifier } = req.params;
    const cleanId = (identifier || 'OTF-892101').toUpperCase();

    const telemetry = {
      tracking_id: `TRK-GPS-${cleanId.replace(/[^A-Z0-9]/g, '')}`,
      vehicle_identifier: cleanId,
      carrier: {
        truck_number: 'MH-12-RN-9921',
        transporter_name: 'Mahindra Logistics Dedicated Car Carrier',
        capacity: '8 Car Articulated Auto Trailer',
        driver_name: 'Dnyaneshwar Patil',
        driver_phone: '+91-9822019921'
      },
      route: {
        origin: 'Tata Motors Passenger Vehicles Ltd, Pimpri Plant, Pune (MH-12)',
        destination: 'Apex Mobility Motors Central Stockyard, Andheri West, Mumbai (MH-02)',
        total_distance_km: 148,
        distance_covered_km: 92,
        distance_remaining_km: 56,
        current_speed_kmh: 54,
        current_location_landmark: 'Khopoli Expressway Toll (KM 74), Mumbai-Pune Expressway',
        gps_coordinates: { latitude: 18.7891, longitude: 73.3421 },
        estimated_arrival: 'Today by 06:30 PM IST'
      },
      milestones: [
        { id: 1, title: 'Factory Invoiced & Carrier Loaded', location: 'Pimpri Plant, Pune', time: '08:30 AM', status: 'COMPLETED' },
        { id: 2, title: 'Talegaon Toll Plaza Expressway Entry', location: 'Talegaon, MH', time: '11:15 AM', status: 'COMPLETED' },
        { id: 3, title: 'Khandala Ghat Safety Inspection', location: 'Lonavala / Khandala', time: '02:00 PM', status: 'COMPLETED' },
        { id: 4, title: 'Expressway Transit', location: 'Khopoli (Current Position)', time: 'Live', status: 'IN_TRANSIT' },
        { id: 5, title: 'Navi Mumbai Entry & Kalamboli Hub', location: 'Navi Mumbai, MH', time: '05:15 PM (Est)', status: 'UPCOMING' },
        { id: 6, title: 'Dealership Stockyard Receiving & PDI', location: 'Andheri West, Mumbai', time: '06:30 PM (Est)', status: 'UPCOMING' }
      ]
    };

    return res.json({ success: true, data: telemetry });
  } catch (err) {
    return next(err);
  }
}
