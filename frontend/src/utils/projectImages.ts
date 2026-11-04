export interface CityPreset {
  city: string;
  state: string;
  lat: number;
  lng: number;
  imageUrl: string;
}

export const INDIAN_CITY_PRESETS: CityPreset[] = [
  {
    city: 'New Delhi',
    state: 'Delhi',
    lat: 28.6139,
    lng: 77.2090,
    imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80'
  },
  {
    city: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.0760,
    lng: 72.8777,
    imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80'
  },
  {
    city: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80'
  },
  {
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    lat: 25.3176,
    lng: 82.9739,
    imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80'
  },
  {
    city: 'Ahmedabad',
    state: 'Gujarat',
    lat: 23.0225,
    lng: 72.5714,
    imageUrl: 'https://images.unsplash.com/photo-1532103054090-a33923a7821c?auto=format&fit=crop&w=800&q=80'
  },
  {
    city: 'Hyderabad',
    state: 'Telangana',
    lat: 17.3850,
    lng: 78.4867,
    imageUrl: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=800&q=80'
  },
  {
    city: 'Chennai',
    state: 'Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707,
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80'
  },
  {
    city: 'Kolkata',
    state: 'West Bengal',
    lat: 22.5726,
    lng: 88.3639,
    imageUrl: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80'
  },
  {
    city: 'Pune',
    state: 'Maharashtra',
    lat: 18.5204,
    lng: 73.8567,
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80'
  },
  {
    city: 'Jaipur',
    state: 'Rajasthan',
    lat: 26.9124,
    lng: 75.7873,
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80'
  },
  {
    city: 'Kochi',
    state: 'Kerala',
    lat: 9.9312,
    lng: 76.2673,
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80'
  },
  {
    city: 'Patna',
    state: 'Bihar',
    lat: 25.5941,
    lng: 85.1376,
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
  }
];

export const CURATED_INFRA_PHOTOS = [
  {
    title: 'High-Speed Expressway',
    sector: 'Roads & Highways',
    url: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Modern Metro Rail',
    sector: 'Urban Transport & Metro',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Dedicated Freight Rail',
    sector: 'Railways',
    url: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Cable-Stayed River Bridge',
    sector: 'Bridges & Viaducts',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Solar Power Park',
    sector: 'Power & Renewable Energy',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Deep Water Sea Port',
    sector: 'Ports & Shipping',
    url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Clean Water & Dam Facility',
    sector: 'Water & Sanitation',
    url: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Smart City Infrastructure',
    sector: 'Smart Cities',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
  }
];

export function getProjectImage(project?: any): string {
  if (project?.imageUrl && project.imageUrl.trim().length > 5) {
    return project.imageUrl;
  }

  // Check matching city
  const districtOrCity = (project?.district || project?.city || '').toLowerCase();
  const matchedCity = INDIAN_CITY_PRESETS.find(c => 
    districtOrCity.includes(c.city.toLowerCase()) || 
    c.city.toLowerCase().includes(districtOrCity)
  );
  if (matchedCity) {
    return matchedCity.imageUrl;
  }

  // Check matching sector
  const sector = (project?.sector || '').toLowerCase();
  if (sector.includes('metro') || sector.includes('transit')) {
    return 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80';
  }
  if (sector.includes('rail')) {
    return 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80';
  }
  if (sector.includes('water') || sector.includes('sanitation')) {
    return 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=800&q=80';
  }
  if (sector.includes('power') || sector.includes('energy') || sector.includes('solar')) {
    return 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80';
  }
  if (sector.includes('port') || sector.includes('shipping')) {
    return 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80';
  }
  if (sector.includes('aviation') || sector.includes('airport')) {
    return 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80';
  }
  if (sector.includes('bridge') || sector.includes('tunnel')) {
    return 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80';
  }

  // Default expressway / infrastructure photo
  return 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80';
}

