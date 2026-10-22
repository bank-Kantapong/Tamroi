export interface ThaiProvince {
  id: string;
  name_th: string;
  name_en: string;
  region: "Central" | "North" | "Northeast" | "East" | "South" | "West";
}

export const THAI_PROVINCES: ThaiProvince[] = [
  // กรุงเทพและปริมณฑล & ภาคกลาง (Central)
  { id: "BKK", name_th: "กรุงเทพมหานคร", name_en: "Bangkok", region: "Central" },
  { id: "NPT", name_th: "นครปฐม", name_en: "Nakhon Pathom", region: "Central" },
  { id: "NBI", name_th: "นนทบุรี", name_en: "Nonthaburi", region: "Central" },
  { id: "PTE", name_th: "ปทุมธานี", name_en: "Pathum Thani", region: "Central" },
  { id: "SPK", name_th: "สมุทรปราการ", name_en: "Samut Prakan", region: "Central" },
  { id: "SKN", name_th: "สมุทรสาคร", name_en: "Samut Sakhon", region: "Central" },
  { id: "AYA", name_th: "พระนครศรีอยุธยา", name_en: "Phra Nakhon Si Ayutthaya", region: "Central" },
  { id: "ATG", name_th: "อ่างทอง", name_en: "Ang Thong", region: "Central" },
  { id: "LBI", name_th: "ลพบุรี", name_en: "Lopburi", region: "Central" },
  { id: "SBR", name_th: "สิงห์บุรี", name_en: "Sing Buri", region: "Central" },
  { id: "CNT", name_th: "ชัยนาท", name_en: "Chai Nat", region: "Central" },
  { id: "SRI", name_th: "สระบุรี", name_en: "Saraburi", region: "Central" },
  { id: "SPB", name_th: "สุพรรณบุรี", name_en: "Suphan Buri", region: "Central" },
  { id: "NSN", name_th: "นครสวรรค์", name_en: "Nakhon Sawan", region: "Central" },
  { id: "UTI", name_th: "อุทัยธานี", name_en: "Uthai Thani", region: "Central" },
  { id: "KPT", name_th: "กำแพงเพชร", name_en: "Kamphaeng Phet", region: "Central" },
  { id: "PLK", name_th: "พิษณุโลก", name_en: "Phitsanulok", region: "Central" },
  { id: "PCT", name_th: "พิจิตร", name_en: "Phichit", region: "Central" },
  { id: "PNB", name_th: "เพชรบูรณ์", name_en: "Phetchabun", region: "Central" },
  { id: "SKT", name_th: "สุโขทัย", name_en: "Sukhothai", region: "Central" },

  // ภาคเหนือ (North)
  { id: "CMI", name_th: "เชียงใหม่", name_en: "Chiang Mai", region: "North" },
  { id: "CRI", name_th: "เชียงราย", name_en: "Chiang Rai", region: "North" },
  { id: "LPG", name_th: "ลำปาง", name_en: "Lampang", region: "North" },
  { id: "LPH", name_th: "ลำพูน", name_en: "Lamphun", region: "North" },
  { id: "MSN", name_th: "แม่ฮ่องสอน", name_en: "Mae Hong Son", region: "North" },
  { id: "NAN", name_th: "น่าน", name_en: "Nan", region: "North" },
  { id: "PYO", name_th: "พะเยา", name_en: "Phayao", region: "North" },
  { id: "PRE", name_th: "แพร่", name_en: "Phrae", region: "North" },
  { id: "UTD", name_th: "อุตรดิตถ์", name_en: "Uttaradit", region: "North" },

  // ภาคตะวันออกเฉียงเหนือ (Northeast)
  { id: "NMA", name_th: "นครราชสีมา", name_en: "Nakhon Ratchasima", region: "Northeast" },
  { id: "KKN", name_th: "ขอนแก่น", name_en: "Khon Kaen", region: "Northeast" },
  { id: "UDN", name_th: "อุดรธานี", name_en: "Udon Thani", region: "Northeast" },
  { id: "UBN", name_th: "อุบลราชธานี", name_en: "Ubon Ratchathani", region: "Northeast" },
  { id: "BRM", name_th: "บุรีรัมย์", name_en: "Buri Ram", region: "Northeast" },
  { id: "SRN", name_th: "สุรินทร์", name_en: "Surin", region: "Northeast" },
  { id: "SSK", name_th: "ศรีสะเกษ", name_en: "Sisaket", region: "Northeast" },
  { id: "ROI", name_th: "ร้อยเอ็ด", name_en: "Roi Et", region: "Northeast" },
  { id: "MSK", name_th: "มหาสารคาม", name_en: "Maha Sarakham", region: "Northeast" },
  { id: "CPM", name_th: "ชัยภูมิ", name_en: "Chaiyaphum", region: "Northeast" },
  { id: "LOE", name_th: "เลย", name_en: "Loei", region: "Northeast" },
  { id: "SNK", name_th: "สกลนคร", name_en: "Sakon Nakhon", region: "Northeast" },
  { id: "NPM", name_th: "นครพนม", name_en: "Nakhon Phanom", region: "Northeast" },
  { id: "MDH", name_th: "มุกดาหาร", name_en: "Mukdahan", region: "Northeast" },
  { id: "YSO", name_th: "ยโสธร", name_en: "Yasothon", region: "Northeast" },
  { id: "ACR", name_th: "อำนาจเจริญ", name_en: "Amnat Charoen", region: "Northeast" },
  { id: "NKI", name_th: "หนองคาย", name_en: "Nong Khai", region: "Northeast" },
  { id: "NBP", name_th: "หนองบัวลำภู", name_en: "Nong Bua Lamphu", region: "Northeast" },
  { id: "BKN", name_th: "บึงกาฬ", name_en: "Bueng Kan", region: "Northeast" },
  { id: "KSN", name_th: "กาฬสินธุ์", name_en: "Kalasin", region: "Northeast" },

  // ภาคตะวันออก (East)
  { id: "CBI", name_th: "ชลบุรี", name_en: "Chonburi", region: "East" },
  { id: "RYG", name_th: "ระยอง", name_en: "Rayong", region: "East" },
  { id: "CTI", name_th: "จันทบุรี", name_en: "Chanthaburi", region: "East" },
  { id: "TRT", name_th: "ตราด", name_en: "Trat", region: "East" },
  { id: "CCO", name_th: "ฉะเชิงเทรา", name_en: "Chachoengsao", region: "East" },
  { id: "PRI", name_th: "ปราจีนบุรี", name_en: "Prachinburi", region: "East" },
  { id: "SKW", name_th: "สระแก้ว", name_en: "Sa Kaeo", region: "East" },
  { id: "NYK", name_th: "นครนายก", name_en: "Nakhon Nayok", region: "East" },

  // ภาคตะวันตก (West)
  { id: "KRI", name_th: "กาญจนบุรี", name_en: "Kanchanaburi", region: "West" },
  { id: "RBR", name_th: "ราชบุรี", name_en: "Ratchaburi", region: "West" },
  { id: "PBI", name_th: "เพชรบุรี", name_en: "Phetchaburi", region: "West" },
  { id: "PKN", name_th: "ประจวบคีรีขันธ์", name_en: "Prachuap Khiri Khan", region: "West" },
  { id: "TAK", name_th: "ตาก", name_en: "Tak", region: "West" },
  { id: "SKM", name_th: "สมุทรสงคราม", name_en: "Samut Songkhram", region: "West" },

  // ภาคใต้ (South)
  { id: "PKT", name_th: "ภูเก็ต", name_en: "Phuket", region: "South" },
  { id: "KBI", name_th: "กระบี่", name_en: "Krabi", region: "South" },
  { id: "PNA", name_th: "พังงา", name_en: "Phang Nga", region: "South" },
  { id: "SNI", name_th: "สุราษฎร์ธานี", name_en: "Surat Thani", region: "South" },
  { id: "NST", name_th: "นครศรีธรรมราช", name_en: "Nakhon Si Thammarat", region: "South" },
  { id: "SKA", name_th: "สงขลา", name_en: "Songkhla", region: "South" },
  { id: "TRG", name_th: "ตรัง", name_en: "Trang", region: "South" },
  { id: "PLG", name_th: "พัทลุง", name_en: "Phatthalung", region: "South" },
  { id: "CPN", name_th: "ชุมพร", name_en: "Chumphon", region: "South" },
  { id: "RNG", name_th: "ระนอง", name_en: "Ranong", region: "South" },
  { id: "STN", name_th: "สตูล", name_en: "Satun", region: "South" },
  { id: "PTN", name_th: "ปัตตานี", name_en: "Pattani", region: "South" },
  { id: "YLA", name_th: "ยะลา", name_en: "Yala", region: "South" },
  { id: "NWT", name_th: "นราธิวาส", name_en: "Narathiwat", region: "South" },
];

