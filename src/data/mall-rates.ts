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
    id: "BEDOK_MALL",
    keywords: ["BEDOK MALL", "311 NEW UPPER CHANGI ROAD", "311 NEW UPPER CHANGI"],
    name: "Bedok Mall",
    gracePeriodMins: 15,
    weekday: [
      {
        start: "00:00",
        end: "17:59",
        firstHour: 1.55,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "23:59",
        perEntry: 2.60,
      },
    ],
    saturday: [
      {
        start: "00:00",
        end: "17:59",
        firstHour: 1.55,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "23:59",
        perEntry: 2.60,
      },
    ],
    sundayAndPh: [
      {
        start: "00:00",
        end: "17:59",
        firstHour: 1.55,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "23:59",
        perEntry: 2.60,
      },
    ],
    remarks: "15-min grace period. $2.60 per entry after 6:00 PM every day.",
  },
  {
    id: "VIVOCITY",
    keywords: ["VIVOCITY", "HARBOURFRONT", "1 HARBOURFRONT WALK"],
    name: "VivoCity",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "07:00",
        end: "17:59",
        firstHour: 1.60,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "06:59",
        perEntry: 3.50,
      },
    ],
    saturday: [
      {
        start: "07:00",
        end: "17:59",
        firstHour: 2.20,
        subsequentHalfHour: 1.10,
      },
      {
        start: "18:00",
        end: "06:59",
        perEntry: 4.00,
      },
    ],
    sundayAndPh: [
      {
        start: "07:00",
        end: "17:59",
        firstHour: 2.20,
        subsequentHalfHour: 1.10,
      },
      {
        start: "18:00",
        end: "06:59",
        perEntry: 4.00,
      },
    ],
    remarks: "10-min grace period. $3.50 per entry after 6:00 PM (Mon–Fri), $4.00 on weekends.",
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
    remarks: "$5.00 per entry after 5:00 PM (Mon–Fri). Free parking perks with minimum spend on ION+ Rewards.",
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
    remarks: "$4.50 per entry after 5:00 PM (Mon–Fri). Spacious basement parking.",
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
    remarks: "Weekdays: $3.60 per entry after 5:00 PM. Weekends: First 4 hours flat $3.60.",
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
    remarks: "$3.20 per entry after 5:00 PM (Mon–Fri).",
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
    remarks: "$3.50 per entry after 5:00 PM daily.",
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
    remarks: "$3.50 per entry after 5:00 PM daily.",
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
    remarks: "$3.50 per entry after 6:00 PM daily. Direct connection to Dhoby Ghaut MRT.",
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
    remarks: "General parking (B3-B5): $0.04/min ($2.40/hr).",
  },
  {
    id: "WESTGATE",
    keywords: ["WESTGATE", "3 GATEWAY DRIVE"],
    name: "Westgate",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "00:00",
        end: "17:59",
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
        end: "17:59",
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
        end: "17:59",
        firstTwoHours: 3.00,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "23:59",
        perEntry: 3.00,
      },
    ],
    remarks: "$3.00 per entry after 6:00 PM daily.",
  },
  {
    id: "JEM",
    keywords: ["JEM", "50 JURONG GATEWAY ROAD"],
    name: "Jem",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "06:00",
        end: "17:59",
        firstHour: 1.60,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "05:59",
        perEntry: 3.00,
      },
    ],
    saturday: [
      {
        start: "06:00",
        end: "17:59",
        firstTwoHours: 3.00,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "05:59",
        perEntry: 3.00,
      },
    ],
    sundayAndPh: [
      {
        start: "06:00",
        end: "17:59",
        firstTwoHours: 3.00,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "05:59",
        perEntry: 3.00,
      },
    ],
    remarks: "$3.00 per entry after 6:00 PM daily.",
  },
  {
    id: "JURONG_POINT",
    keywords: ["JURONG POINT", "1 JURONG WEST CENTRAL 2"],
    name: "Jurong Point",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "07:00",
        end: "16:59",
        firstTwoHours: 2.50,
        subsequentHalfHour: 1.20,
      },
      {
        start: "17:00",
        end: "06:59",
        perEntry: 3.00,
      },
    ],
    saturday: [
      {
        start: "07:00",
        end: "16:59",
        firstTwoHours: 3.00,
        subsequentHalfHour: 1.20,
      },
      {
        start: "17:00",
        end: "06:59",
        perEntry: 3.50,
      },
    ],
    sundayAndPh: [
      {
        start: "07:00",
        end: "16:59",
        firstTwoHours: 3.00,
        subsequentHalfHour: 1.20,
      },
      {
        start: "17:00",
        end: "06:59",
        perEntry: 3.50,
      },
    ],
    remarks: "Free parking 12pm–2pm Mon–Thu (excluding PH). $3.00 per entry after 5pm weekdays.",
  },
  {
    id: "NEX",
    keywords: ["NEX", "23 SERANGOON CENTRAL"],
    name: "NEX Mall",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "07:00",
        end: "16:59",
        firstHour: 1.60,
        subsequentHalfHour: 0.80,
      },
      {
        start: "17:00",
        end: "06:59",
        perEntry: 3.00,
      },
    ],
    saturday: [
      {
        start: "07:00",
        end: "16:59",
        firstTwoHours: 3.00,
        subsequentHalfHour: 0.80,
      },
      {
        start: "17:00",
        end: "06:59",
        perEntry: 3.00,
      },
    ],
    sundayAndPh: [
      {
        start: "07:00",
        end: "16:59",
        firstTwoHours: 3.00,
        subsequentHalfHour: 0.80,
      },
      {
        start: "17:00",
        end: "06:59",
        perEntry: 3.00,
      },
    ],
    remarks: "$3.00 per entry after 5:00 PM daily.",
  },
  {
    id: "TAMPINES_MALL",
    keywords: ["TAMPINES MALL", "4 TAMPINES CENTRAL 5"],
    name: "Tampines Mall",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "06:00",
        end: "17:59",
        firstHour: 1.60,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "05:59",
        perEntry: 3.00,
      },
    ],
    saturday: [
      {
        start: "06:00",
        end: "17:59",
        firstTwoHours: 3.00,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "05:59",
        perEntry: 3.00,
      },
    ],
    sundayAndPh: [
      {
        start: "06:00",
        end: "17:59",
        firstTwoHours: 3.00,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "05:59",
        perEntry: 3.00,
      },
    ],
    remarks: "$3.00 per entry after 6:00 PM daily.",
  },
  {
    id: "WATERWAY_POINT",
    keywords: ["WATERWAY POINT", "83 PUNGGOL CENTRAL"],
    name: "Waterway Point",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "07:00",
        end: "16:59",
        firstHour: 1.60,
        subsequentHalfHour: 0.80,
      },
      {
        start: "17:00",
        end: "06:59",
        perEntry: 2.80,
      },
    ],
    saturday: [
      {
        start: "07:00",
        end: "16:59",
        firstTwoHours: 2.80,
        subsequentHalfHour: 0.80,
      },
      {
        start: "17:00",
        end: "06:59",
        perEntry: 2.80,
      },
    ],
    sundayAndPh: [
      {
        start: "07:00",
        end: "16:59",
        firstTwoHours: 2.80,
        subsequentHalfHour: 0.80,
      },
      {
        start: "17:00",
        end: "06:59",
        perEntry: 2.80,
      },
    ],
    remarks: "$2.80 per entry after 5:00 PM daily.",
  },
  {
    id: "NORTHPOINT_CITY",
    keywords: ["NORTHPOINT CITY", "NORTHPOINT", "930 YISHUN AVE 2"],
    name: "Northpoint City",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "07:00",
        end: "16:59",
        firstHour: 1.60,
        subsequentHalfHour: 0.80,
      },
      {
        start: "17:00",
        end: "06:59",
        perEntry: 2.80,
      },
    ],
    saturday: [
      {
        start: "07:00",
        end: "16:59",
        firstTwoHours: 2.80,
        subsequentHalfHour: 0.80,
      },
      {
        start: "17:00",
        end: "06:59",
        perEntry: 2.80,
      },
    ],
    sundayAndPh: [
      {
        start: "07:00",
        end: "16:59",
        firstTwoHours: 2.80,
        subsequentHalfHour: 0.80,
      },
      {
        start: "17:00",
        end: "06:59",
        perEntry: 2.80,
      },
    ],
    remarks: "$2.80 per entry after 5:00 PM daily.",
  },
  {
    id: "CAUSEWAY_POINT",
    keywords: ["CAUSEWAY POINT", "1 WOODLANDS SQUARE"],
    name: "Causeway Point",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "07:00",
        end: "16:59",
        firstHour: 1.60,
        subsequentHalfHour: 0.80,
      },
      {
        start: "17:00",
        end: "06:59",
        perEntry: 2.80,
      },
    ],
    saturday: [
      {
        start: "07:00",
        end: "16:59",
        firstTwoHours: 2.80,
        subsequentHalfHour: 0.80,
      },
      {
        start: "17:00",
        end: "06:59",
        perEntry: 2.80,
      },
    ],
    sundayAndPh: [
      {
        start: "07:00",
        end: "16:59",
        firstTwoHours: 2.80,
        subsequentHalfHour: 0.80,
      },
      {
        start: "17:00",
        end: "06:59",
        perEntry: 2.80,
      },
    ],
    remarks: "$2.80 per entry after 5:00 PM daily.",
  },
  {
    id: "JUNCTION_8",
    keywords: ["JUNCTION 8", "9 BISHAN PLACE"],
    name: "Junction 8",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "06:00",
        end: "17:59",
        firstHour: 1.60,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "05:59",
        perEntry: 3.00,
      },
    ],
    saturday: [
      {
        start: "06:00",
        end: "17:59",
        firstTwoHours: 3.00,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "05:59",
        perEntry: 3.00,
      },
    ],
    sundayAndPh: [
      {
        start: "06:00",
        end: "17:59",
        firstTwoHours: 3.00,
        subsequentHalfHour: 0.80,
      },
      {
        start: "18:00",
        end: "05:59",
        perEntry: 3.00,
      },
    ],
    remarks: "$3.00 per entry after 6:00 PM daily.",
  },
  {
    id: "PAYA_LEBAR_QUARTER",
    keywords: ["PAYA LEBAR QUARTER", "PLQ MALL", "10 PAYA LEBAR ROAD"],
    name: "PLQ Mall",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "06:00",
        end: "17:59",
        firstHour: 1.50,
        subsequentHalfHour: 0.75,
      },
      {
        start: "18:00",
        end: "05:59",
        perEntry: 3.00,
      },
    ],
    saturday: [
      {
        start: "06:00",
        end: "17:59",
        firstTwoHours: 1.80,
        subsequentHalfHour: 0.90,
      },
      {
        start: "18:00",
        end: "05:59",
        perEntry: 3.00,
      },
    ],
    sundayAndPh: [
      {
        start: "06:00",
        end: "17:59",
        firstTwoHours: 1.80,
        subsequentHalfHour: 0.90,
      },
      {
        start: "18:00",
        end: "05:59",
        perEntry: 3.00,
      },
    ],
    remarks: "$3.00 per entry after 6:00 PM daily.",
  },
  {
    id: "MARINA_BAY_SANDS",
    keywords: ["MARINA BAY SANDS", "MBS", "10 BAYFRONT AVENUE"],
    name: "Marina Bay Sands",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "07:00",
        end: "18:59",
        firstHour: 4.00,
        subsequentHalfHour: 2.00,
        maxCap: 35.00,
      },
      {
        start: "19:00",
        end: "06:59",
        perEntry: 9.00,
      },
    ],
    saturday: [
      {
        start: "07:00",
        end: "18:59",
        firstHour: 5.00,
        subsequentHalfHour: 2.50,
        maxCap: 40.00,
      },
      {
        start: "19:00",
        end: "06:59",
        perEntry: 10.00,
      },
    ],
    sundayAndPh: [
      {
        start: "07:00",
        end: "18:59",
        firstHour: 5.00,
        subsequentHalfHour: 2.50,
        maxCap: 40.00,
      },
      {
        start: "19:00",
        end: "06:59",
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
        end: "16:59",
        firstHour: 2.00,
        subsequentHalfHour: 1.00,
      },
      {
        start: "17:00",
        end: "05:59",
        perEntry: 3.50,
      },
    ],
    saturday: [
      {
        start: "06:00",
        end: "16:59",
        firstTwoHours: 3.50,
        subsequentHalfHour: 1.00,
      },
      {
        start: "17:00",
        end: "05:59",
        perEntry: 3.50,
      },
    ],
    sundayAndPh: [
      {
        start: "06:00",
        end: "16:59",
        firstTwoHours: 3.50,
        subsequentHalfHour: 1.00,
      },
      {
        start: "17:00",
        end: "05:59",
        perEntry: 3.50,
      },
    ],
    remarks: "$3.50 per entry after 5:00 PM daily.",
  },
  {
    id: "PARAGON",
    keywords: ["PARAGON", "290 ORCHARD ROAD"],
    name: "Paragon Shopping Centre",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "03:00",
        end: "16:59",
        firstHour: 3.20,
        subsequentHalfHour: 1.60,
      },
      {
        start: "17:00",
        end: "02:59",
        perEntry: 4.50,
      },
    ],
    saturday: [
      {
        start: "03:00",
        end: "16:59",
        firstTwoHours: 4.50,
        subsequentHalfHour: 1.80,
      },
      {
        start: "17:00",
        end: "02:59",
        perEntry: 4.50,
      },
    ],
    sundayAndPh: [
      {
        start: "03:00",
        end: "16:59",
        firstTwoHours: 4.50,
        subsequentHalfHour: 1.80,
      },
      {
        start: "17:00",
        end: "02:59",
        perEntry: 4.50,
      },
    ],
    remarks: "$4.50 per entry after 5:00 PM daily.",
  },
  {
    id: "SOMERSET_313",
    keywords: ["313@SOMERSET", "313 SOMERSET", "313 ORCHARD ROAD"],
    name: "313@Somerset",
    gracePeriodMins: 10,
    weekday: [
      {
        start: "06:00",
        end: "17:59",
        firstHour: 2.50,
        subsequentHalfHour: 1.25,
      },
      {
        start: "18:00",
        end: "05:59",
        perEntry: 4.00,
      },
    ],
    saturday: [
      {
        start: "06:00",
        end: "17:59",
        firstTwoHours: 4.00,
        subsequentHalfHour: 1.50,
      },
      {
        start: "18:00",
        end: "05:59",
        perEntry: 4.00,
      },
    ],
    sundayAndPh: [
      {
        start: "06:00",
        end: "17:59",
        firstTwoHours: 4.00,
        subsequentHalfHour: 1.50,
      },
      {
        start: "18:00",
        end: "05:59",
        perEntry: 4.00,
      },
    ],
    remarks: "$4.00 per entry after 6:00 PM daily.",
  },
]
