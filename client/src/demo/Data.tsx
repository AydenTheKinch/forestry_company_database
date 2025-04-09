export {}

// TypeScript interfaces
interface Contractor {
    id: number;
    companyName: string;
    registrationNumber: string;
    city: string;
    province: string;
    country: string;
    size: string;
    equipment: string[];
    operations: string[];
    founded: string;
    region: string;
    capacity: string;
    address: string;
    phone: string;
    website: string;
  }
  
  interface FilterState {
    keyword: string;
    registrationNumber: string;
    companyName: string;
    city: string;
    province: string;
    size: string;
    equipment: string;
    operation: string;
  }
  
  // Mock data from CSV
  const contractorData: Contractor[] = [
    {
      id: 1,
      companyName: "GROOT BROS. CONTRACTING LTD.",
      registrationNumber: "BC-0914356",
      city: "Houston",
      province: "BC",
      country: "Canada",
      size: ">20 employees",
      equipment: ["Tigercat 870C Feller Buncher", "Forwarder"],
      operations: ["Softwood/Tree length", "Cut-to-length"],
      founded: "2011-07-01",
      region: "Nadina Forest District",
      capacity: "350,000 cubic metres",
      address: "1300 Morice River Rd, Houston, BC, V0J 1Z0",
      phone: "250-845-0093",
      website: ""
    },
    {
      id: 4,
      companyName: "LO-BAR LOG TRANSPORT CO. LTD.",
      registrationNumber: "BC-0857297",
      city: "Prince George",
      province: "BC",
      country: "Canada",
      size: ">20 employees",
      equipment: ["Cut-to-length machinery"],
      operations: ["Softwood", "cut-to-length", "stumpside delivery"],
      founded: "2009-08-01",
      region: "Prince George",
      capacity: "430,000 cubic metres",
      address: "8377 John Hart Hwy, Prince George, BC, V2K 3B8",
      phone: "(250) 962-8644",
      website: ""
    },
    {
      id: 5,
      companyName: "HOOBANOFF LOGGING LIMITED",
      registrationNumber: "BC-0386507",
      city: "Canal Flats",
      province: "BC",
      country: "Canada",
      size: "6-19 employed",
      equipment: [],
      operations: [],
      founded: "1990-05-01",
      region: "",
      capacity: "",
      address: "4746 Beatty, Canal Flats, BC, V0B 1B0",
      phone: "250-349-5415",
      website: ""
    },
    {
      id: 8,
      companyName: "MYATOVIC BROS. LOGGING LTD.",
      registrationNumber: "BC-1185070",
      city: "Mackenzie",
      province: "BC",
      country: "Canada",
      size: ">20 employees",
      equipment: ["Cut-to-length machinery"],
      operations: ["Softwood", "cut-to-length"],
      founded: "2018-11-01",
      region: "Mackenzie",
      capacity: "300,000 cubic metres",
      address: "",
      phone: "",
      website: ""
    },
    {
      id: 33,
      companyName: "D. K. LOGGING LTD.",
      registrationNumber: "BC-0503235",
      city: "Fort St James",
      province: "BC",
      country: "Canada",
      size: ">20 employees",
      equipment: ["Tree length equipment", "Long-log equipment"],
      operations: ["Softwood/Tree", "long-log length"],
      founded: "1995-08-28",
      region: "Fort St James, Leo Creek",
      capacity: "450,000 cubic metres",
      address: "",
      phone: "",
      website: "http://www.jdforestmanagement.ca/"
    },
    {
      id: 46,
      companyName: "ISLAND FOREST COMPANY LTD.",
      registrationNumber: "BC-1115653",
      city: "",
      province: "BC",
      country: "Canada",
      size: ">20 employees",
      equipment: [],
      operations: [],
      founded: "2017-04-19",
      region: "",
      capacity: "",
      address: "",
      phone: "",
      website: "https://westwoodfibre.ca/"
    },
    {
      id: 48,
      companyName: "KAMAC CONSTRUCTION LTD.",
      registrationNumber: "BC-0955749",
      city: "Prince George",
      province: "BC",
      country: "Canada",
      size: "6-19 employed",
      equipment: ["548 Cat processor with Waratah 62"],
      operations: ["Long and short wood processing"],
      founded: "2012-11-22",
      region: "Bear Lake",
      capacity: "",
      address: "",
      phone: "",
      website: ""
    }
  ];