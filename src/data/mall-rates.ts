export interface TimeBandRate {
  start: string
  end: string
  firstHour?: number
  firstTwoHours?: number
  firstFourHours?: number
  subsequentHalfHour?: number
  perEntry?: number
  maxCap?: number
}

export interface MallRateConfig {
  id: string
  keywords: string[]
  name: string
  gracePeriodMins?: number
  weekday: TimeBandRate[]
  saturday: TimeBandRate[]
  sundayAndPh: TimeBandRate[]
  remarks?: string
}

export const mallRatesData: MallRateConfig[] = [
  {
    id: "VIVOCITY",
    keywords: ["VIVOCITY", "HARBOURFRONT", "1 HARBOURFRONT WALK"],
    name: "VivoCity",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "07:00",
        end: "18:00",
        firstHour: 2.20,
        subsequentHalfHour: 1.00,
      },
      {
        start: "18:00",
        end: "07:00",
        perEntry: 4.00,
      },
    ],
    saturday: [
      {
        start: "07:00",
        end: "18:00",
        firstHour: 2.40,
        subsequentHalfHour: 1.10,
      },
      {
        start: "18:00",
        end: "07:00",
        perEntry: 4.50,
      },
    ],
    sundayAndPh: [
      {
        start: "07:00",
        end: "18:00",
        firstHour: 2.40,
        subsequentHalfHour: 1.10,
      },
      {
        start: "18:00",
        end: "07:00",
        perEntry: 4.50,
      },
    ],
    remarks: "10-min grace period. Electric vehicle charging available at B1/B2.",
  },
  {
    id: "ION_ORCHARD",
    keywords: ["ION ORCHARD", "2 ORCHARD TURN"],
    name: "ION Orchard",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "08:00",
        end: "17:00",
        firstHour: 3.00,
        subsequentHalfHour: 1.50,
      },
      {
        start: "17:00",
        end: "08:00",
        perEntry: 5.00,
      },
    ],
    saturday: [
      {
        start: "08:00",
        end: "18:00",
        firstHour: 3.50,
        subsequentHalfHour: 1.75,
      },
      {
        start: "18:00",
        end: "08:00",
        perEntry: 5.50,
      },
    ],
    sundayAndPh: [
      {
        start: "08:00",
        end: "18:00",
        firstHour: 3.50,
        subsequentHalfHour: 1.75,
      },
      {
        start: "18:00",
        end: "08:00",
        perEntry: 5.50,
      },
    ],
    remarks: "Free parking perks with minimum spend on ION+ Rewards.",
  },
  {
    id: "NGEE_ANN_CITY",
    keywords: ["NGEE ANN CITY", "TAKASHIMAYA", "391 ORCHARD ROAD"],
    name: "Ngee Ann City (Takashimaya)",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "08:00",
        end: "17:00",
        firstHour: 3.00,
        subsequentHalfHour: 1.50,
      },
      {
        start: "17:00",
        end: "08:00",
        perEntry: 4.50,
      },
    ],
    saturday: [
      {
        start: "08:00",
        end: "17:00",
        firstHour: 3.50,
        subsequentHalfHour: 1.75,
      },
      {
        start: "17:00",
        end: "08:00",
        perEntry: 5.00,
      },
    ],
    sundayAndPh: [
      {
        start: "08:00",
        end: "17:00",
        firstHour: 3.50,
        subsequentHalfHour: 1.75,
      },
      {
        start: "17:00",
        end: "08:00",
        perEntry: 5.00,
      },
    ],
    remarks: "Spacious multi-deck carpark accessible via Orchard Link.",
  },
  {
    id: "SUNTEC_CITY",
    keywords: ["SUNTEC CITY", "SUNTEC", "3 TEMASEK BOULEVARD"],
    name: "Suntec City",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "07:00",
        end: "17:00",
        firstHour: 2.60,
        subsequentHalfHour: 1.30,
      },
      {
        start: "17:00",
        end: "07:00",
        perEntry: 3.60,
      },
    ],
    saturday: [
      {
        start: "07:00",
        end: "07:00",
        firstFourHours: 3.60,
        subsequentHalfHour: 1.30,
      },
    ],
    sundayAndPh: [
      {
        start: "07:00",
        end: "07:00",
        firstFourHours: 3.60,
        subsequentHalfHour: 1.30,
      },
    ],
    remarks: "Weekends: First 4 hours flat $3.60, subsequent $1.30/30 mins.",
  },
  {
    id: "MARINA_SQUARE",
    keywords: ["MARINA SQUARE", "6 RAFFLES BOULEVARD"],
    name: "Marina Square",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "07:00",
        end: "17:00",
        firstTwoHours: 3.00,
        subsequentHalfHour: 1.20,
      },
      {
        start: "17:00",
        end: "07:00",
        perEntry: 3.20,
      },
    ],
    saturday: [
      {
        start: "07:00",
        end: "07:00",
        firstTwoHours: 3.20,
        subsequentHalfHour: 1.20,
      },
    ],
    sundayAndPh: [
      {
        start: "07:00",
        end: "07:00",
        firstTwoHours: 3.20,
        subsequentHalfHour: 1.20,
      },
    ],
    remarks: "Weekdays: First 2 hours $3.00, subsequent $1.20/30 mins. $3.20 per entry after 5pm.",
  },
  {
    id: "BUGIS_JUNCTION",
    keywords: ["BUGIS JUNCTION", "200 VICTORIA STREET"],
    name: "Bugis Junction",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "08:00",
        end: "17:00",
        firstHour: 2.20,
        subsequentHalfHour: 1.10,
      },
      {
        start: "17:00",
        end: "08:00",
        perEntry: 3.50,
      },
    ],
    saturday: [
      {
        start: "08:00",
        end: "17:00",
        firstTwoHours: 3.50,
        subsequentHalfHour: 1.30,
      },
      {
        start: "17:00",
        end: "08:00",
        perEntry: 3.50,
      },
    ],
    sundayAndPh: [
      {
        start: "08:00",
        end: "17:00",
        firstTwoHours: 3.50,
        subsequentHalfHour: 1.30,
      },
      {
        start: "17:00",
        end: "08:00",
        perEntry: 3.50,
      },
    ],
    remarks: "CapitaLand Mall rewards applicable.",
  },
  {
    id: "BUGIS_PLUS",
    keywords: ["BUGIS+", "BUGIS PLUS", "201 VICTORIA STREET"],
    name: "Bugis+",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "08:00",
        end: "17:00",
        firstHour: 2.20,
        subsequentHalfHour: 1.10,
      },
      {
        start: "17:00",
        end: "08:00",
        perEntry: 3.50,
      },
    ],
    saturday: [
      {
        start: "08:00",
        end: "17:00",
        firstTwoHours: 3.50,
        subsequentHalfHour: 1.30,
      },
      {
        start: "17:00",
        end: "08:00",
        perEntry: 3.50,
      },
    ],
    sundayAndPh: [
      {
        start: "08:00",
        end: "17:00",
        firstTwoHours: 3.50,
        subsequentHalfHour: 1.30,
      },
      {
        start: "17:00",
        end: "08:00",
        perEntry: 3.50,
      },
    ],
    remarks: "Direct sheltered linkway to Bugis Junction.",
  },
  {
    id: "PLAZA_SINGAPURA",
    keywords: ["PLAZA SINGAPURA", "68 ORCHARD ROAD"],
    name: "Plaza Singapura",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "00:00",
        end: "17:59",
        firstHour: 2.20,
        subsequentHalfHour: 1.00,
      },
      {
        start: "18:00",
        end: "23:59",
        perEntry: 3.50,
      },
    ],
    saturday: [
      {
        start: "00:00",
        end: "17:59",
        firstTwoHours: 3.20,
        subsequentHalfHour: 1.00,
      },
      {
        start: "18:00",
        end: "23:59",
        perEntry: 3.50,
      },
    ],
    sundayAndPh: [
      {
        start: "00:00",
        end: "17:59",
        firstTwoHours: 3.20,
        subsequentHalfHour: 1.00,
      },
      {
        start: "18:00",
        end: "23:59",
        perEntry: 3.50,
      },
    ],
    remarks: "Direct access to Dhoby Ghaut MRT interchange.",
  },
  {
    id: "JEWEL_CHANGI",
    keywords: ["JEWEL", "JEWEL CHANGI", "78 AIRPORT BOULEVARD"],
    name: "Jewel Changi Airport",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "00:00",
        end: "23:59",
        firstHour: 2.40,
        subsequentHalfHour: 1.20,
      },
    ],
    saturday: [
      {
        start: "00:00",
        end: "23:59",
        firstHour: 2.40,
        subsequentHalfHour: 1.20,
      },
    ],
    sundayAndPh: [
      {
        start: "00:00",
        end: "23:59",
        firstHour: 2.40,
        subsequentHalfHour: 1.20,
      },
    ],
    remarks: "General parking (B3-B5): $0.04/min ($2.40/hr). Short-stay B2M/B2 has higher rates ($5 for 1st 90 mins, $5/30m thereafter).",
  },
  {
    id: "WESTGATE",
    keywords: ["WESTGATE", "3 GATEWAY DRIVE"],
    name: "Westgate",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "00:00",
        end: "18:00",
        firstHour: 1.60,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "23:59",
        perEntry: 3.00,
      },
    ],
    saturday: [
      {
        start: "00:00",
        end: "18:00",
        firstTwoHours: 3.00,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "23:59",
        perEntry: 3.00,
      },
    ],
    sundayAndPh: [
      {
        start: "00:00",
        end: "18:00",
        firstTwoHours: 3.00,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "23:59",
        perEntry: 3.00,
      },
    ],
    remarks: "Linked to Jurong East MRT and JEM.",
  },
  {
    id: "JEM",
    keywords: ["JEM", "50 JURONG GATEWAY ROAD"],
    name: "Jem",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "06:00",
        end: "18:00",
        firstHour: 1.60,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "06:00",
        perEntry: 3.00,
      },
    ],
    saturday: [
      {
        start: "06:00",
        end: "18:00",
        firstTwoHours: 3.00,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "06:00",
        perEntry: 3.00,
      },
    ],
    sundayAndPh: [
      {
        start: "06:00",
        end: "18:00",
        firstTwoHours: 3.00,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "06:00",
        perEntry: 3.00,
      },
    ],
    remarks: "Lendlease Plus member perks available.",
  },
  {
    id: "JURONG_POINT",
    keywords: ["JURONG POINT", "1 JURONG WEST CENTRAL 2"],
    name: "Jurong Point",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "07:00",
        end: "17:00",
        firstTwoHours: 2.50,
        subsequentHalfHour: 1.20,
      },
      {
        start: "17:00",
        end: "07:00",
        perEntry: 3.00,
      },
    ],
    saturday: [
      {
        start: "07:00",
        end: "17:00",
        firstTwoHours: 3.00,
        subsequentHalfHour: 1.20,
      },
      {
        start: "17:00",
        end: "07:00",
        perEntry: 3.50,
      },
    ],
    sundayAndPh: [
      {
        start: "07:00",
        end: "17:00",
        firstTwoHours: 3.00,
        subsequentHalfHour: 1.20,
      },
      {
        start: "17:00",
        end: "07:00",
        perEntry: 3.50,
      },
    ],
    remarks: "Free parking 12pm-2pm Monday to Thursday (excluding PH).",
  },
  {
    id: "NEX",
    keywords: ["NEX", "23 SERANGOON CENTRAL"],
    name: "NEX Mall",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "07:00",
        end: "17:00",
        firstHour: 1.60,
        subsequentHalfHour: 0.80,
      },
      {
        start: "17:00",
        end: "07:00",
        perEntry: 3.00,
      },
    ],
    saturday: [
      {
        start: "07:00",
        end: "17:00",
        firstTwoHours: 3.00,
        subsequentHalfHour: 0.80,
      },
      {
        start: "17:00",
        end: "07:00",
        perEntry: 3.00,
      },
    ],
    sundayAndPh: [
      {
        start: "07:00",
        end: "17:00",
        firstTwoHours: 3.00,
        subsequentHalfHour: 0.80,
      },
      {
        start: "17:00",
        end: "07:00",
        perEntry: 3.00,
      },
    ],
    remarks: "Major transport hub with North-East and Circle Lines.",
  },
  {
    id: "TAMPINES_MALL",
    keywords: ["TAMPINES MALL", "4 TAMPINES CENTRAL 5"],
    name: "Tampines Mall",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "06:00",
        end: "18:00",
        firstHour: 1.60,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "06:00",
        perEntry: 3.00,
      },
    ],
    saturday: [
      {
        start: "06:00",
        end: "18:00",
        firstTwoHours: 3.00,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "06:00",
        perEntry: 3.00,
      },
    ],
    sundayAndPh: [
      {
        start: "06:00",
        end: "18:00",
        firstTwoHours: 3.00,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "06:00",
        perEntry: 3.00,
      },
    ],
    remarks: "CapitaLand Mall in Tampines Regional Centre.",
  },
  {
    id: "WATERWAY_POINT",
    keywords: ["WATERWAY POINT", "83 PUNGGOL CENTRAL"],
    name: "Waterway Point",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "07:00",
        end: "17:00",
        firstHour: 1.60,
        subsequentHalfHour: 0.80,
      },
      {
        start: "17:00",
        end: "07:00",
        perEntry: 2.80,
      },
    ],
    saturday: [
      {
        start: "07:00",
        end: "17:00",
        firstTwoHours: 2.80,
        subsequentHalfHour: 0.80,
      },
      {
        start: "17:00",
        end: "07:00",
        perEntry: 2.80,
      },
    ],
    sundayAndPh: [
      {
        start: "07:00",
        end: "17:00",
        firstTwoHours: 2.80,
        subsequentHalfHour: 0.80,
      },
      {
        start: "17:00",
        end: "07:00",
        perEntry: 2.80,
      },
    ],
    remarks: "Frasers Property Experience points accepted.",
  },
  {
    id: "MARINA_BAY_SANDS",
    keywords: ["MARINA BAY SANDS", "MBS", "10 BAYFRONT AVENUE"],
    name: "Marina Bay Sands",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "07:00",
        end: "19:00",
        firstHour: 4.00,
        subsequentHalfHour: 2.00,
        maxCap: 35.00,
      },
      {
        start: "19:00",
        end: "07:00",
        perEntry: 9.00,
      },
    ],
    saturday: [
      {
        start: "07:00",
        end: "19:00",
        firstHour: 5.00,
        subsequentHalfHour: 2.50,
        maxCap: 40.00,
      },
      {
        start: "19:00",
        end: "07:00",
        perEntry: 10.00,
      },
    ],
    sundayAndPh: [
      {
        start: "07:00",
        end: "19:00",
        firstHour: 5.00,
        subsequentHalfHour: 2.50,
        maxCap: 40.00,
      },
      {
        start: "19:00",
        end: "07:00",
        perEntry: 10.00,
      },
    ],
    remarks: "Sands Rewards Lifestyle members can redeem parking privileges.",
  },
  {
    id: "GREAT_WORLD",
    keywords: ["GREAT WORLD", "GREAT WORLD CITY", "1 KIM SENG PROMENADE"],
    name: "Great World",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "06:00",
        end: "17:00",
        firstHour: 2.00,
        subsequentHalfHour: 1.00,
      },
      {
        start: "17:00",
        end: "06:00",
        perEntry: 3.50,
      },
    ],
    saturday: [
      {
        start: "06:00",
        end: "17:00",
        firstTwoHours: 3.50,
        subsequentHalfHour: 1.00,
      },
      {
        start: "17:00",
        end: "06:00",
        perEntry: 3.50,
      },
    ],
    sundayAndPh: [
      {
        start: "06:00",
        end: "17:00",
        firstTwoHours: 3.50,
        subsequentHalfHour: 1.00,
      },
      {
        start: "17:00",
        end: "06:00",
        perEntry: 3.50,
      },
    ],
    remarks: "Directly connected to Great World MRT Station (Thomson-East Coast Line).",
  },
  {
    id: "PARAGON",
    keywords: ["PARAGON", "290 ORCHARD ROAD"],
    name: "Paragon Shopping Centre",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "03:00",
        end: "17:00",
        firstHour: 3.20,
        subsequentHalfHour: 1.60,
      },
      {
        start: "17:00",
        end: "03:00",
        perEntry: 4.50,
      },
    ],
    saturday: [
      {
        start: "03:00",
        end: "17:00",
        firstTwoHours: 4.50,
        subsequentHalfHour: 1.80,
      },
      {
        start: "17:00",
        end: "03:00",
        perEntry: 4.50,
      },
    ],
    sundayAndPh: [
      {
        start: "03:00",
        end: "17:00",
        firstTwoHours: 4.50,
        subsequentHalfHour: 1.80,
      },
      {
        start: "17:00",
        end: "03:00",
        perEntry: 4.50,
      },
    ],
    remarks: "Premier Orchard shopping destination with high-capacity basement parking.",
  },
  {
    id: "SOMERSET_313",
    keywords: ["313@SOMERSET", "313 SOMERSET", "313 ORCHARD ROAD"],
    name: "313@Somerset",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "06:00",
        end: "18:00",
        firstHour: 2.50,
        subsequentHalfHour: 1.25,
      },
      {
        start: "18:00",
        end: "06:00",
        perEntry: 4.00,
      },
    ],
    saturday: [
      {
        start: "06:00",
        end: "18:00",
        firstTwoHours: 4.00,
        subsequentHalfHour: 1.50,
      },
      {
        start: "18:00",
        end: "06:00",
        perEntry: 4.00,
      },
    ],
    sundayAndPh: [
      {
        start: "06:00",
        end: "18:00",
        firstTwoHours: 4.00,
        subsequentHalfHour: 1.50,
      },
      {
        start: "18:00",
        end: "06:00",
        perEntry: 4.00,
      },
    ],
    remarks: "Direct access to Somerset MRT Station.",
  },
]
