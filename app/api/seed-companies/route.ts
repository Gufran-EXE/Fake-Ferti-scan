import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Company } from "@/lib/models/Company"

const companies = [
  { companyId: "COMP001", companyName: "Indian Farmers Fertiliser Cooperative (IFFCO)", registrationNumber: "REG-IFFCO-001", ownerName: "Dileep Sanghani", city: "New Delhi", state: "Delhi", contactEmail: "info@iffco.in" },
  { companyId: "COMP002", companyName: "Rashtriya Chemicals & Fertilizers Ltd (RCF)", registrationNumber: "REG-RCF-002", ownerName: "Anil Kumar", city: "Mumbai", state: "Maharashtra", contactEmail: "info@rcfltd.com" },
  { companyId: "COMP003", companyName: "National Fertilizers Limited (NFL)", registrationNumber: "REG-NFL-003", ownerName: "Rajesh Kumar Tiwari", city: "Noida", state: "Uttar Pradesh", contactEmail: "info@nationalfertilizers.com" },
  { companyId: "COMP004", companyName: "Coromandel International Ltd", registrationNumber: "REG-CIL-004", ownerName: "Sameer Goel", city: "Hyderabad", state: "Telangana", contactEmail: "info@coromandel.com" },
  { companyId: "COMP005", companyName: "Chambal Fertilisers & Chemicals Ltd", registrationNumber: "REG-CFCL-005", ownerName: "Anil Kapoor", city: "Kota", state: "Rajasthan", contactEmail: "info@chambal.com" },
  { companyId: "COMP006", companyName: "Gujarat State Fertilizers & Chemicals (GSFC)", registrationNumber: "REG-GSFC-006", ownerName: "Mukesh Patel", city: "Vadodara", state: "Gujarat", contactEmail: "info@gsfcltd.com" },
  { companyId: "COMP007", companyName: "Deepak Fertilisers & Petrochemicals Corp", registrationNumber: "REG-DFPC-007", ownerName: "Sailesh Mehta", city: "Pune", state: "Maharashtra", contactEmail: "info@dfpcl.com" },
  { companyId: "COMP008", companyName: "Tata Chemicals Limited", registrationNumber: "REG-TCL-008", ownerName: "R. Mukundan", city: "Mumbai", state: "Maharashtra", contactEmail: "info@tatachemicals.com" },
  { companyId: "COMP009", companyName: "Zuari Agro Chemicals Ltd", registrationNumber: "REG-ZACL-009", ownerName: "Akshay Poddar", city: "Goa", state: "Goa", contactEmail: "info@zuari.com" },
  { companyId: "COMP010", companyName: "Paradeep Phosphates Limited", registrationNumber: "REG-PPL-010", ownerName: "Suresh Kumar Tripathi", city: "Paradeep", state: "Odisha", contactEmail: "info@paradeepphosphates.com" },
  { companyId: "COMP011", companyName: "Madras Fertilizers Limited (MFL)", registrationNumber: "REG-MFL-011", ownerName: "P. Rajan", city: "Chennai", state: "Tamil Nadu", contactEmail: "info@madrasfert.com" },
  { companyId: "COMP012", companyName: "Fertilizers & Chemicals Travancore (FACT)", registrationNumber: "REG-FACT-012", ownerName: "T.C. Mathew", city: "Kochi", state: "Kerala", contactEmail: "info@fact.co.in" },
  { companyId: "COMP013", companyName: "Krishak Bharati Cooperative (KRIBHCO)", registrationNumber: "REG-KRIB-013", ownerName: "Shivajirao Patil", city: "Surat", state: "Gujarat", contactEmail: "info@kribhco.net" },
  { companyId: "COMP014", companyName: "Nagarjuna Fertilizers & Chemicals Ltd", registrationNumber: "REG-NFCL-014", ownerName: "K.S. Raju", city: "Hyderabad", state: "Telangana", contactEmail: "info@nagarjunafertilizers.com" },
  { companyId: "COMP015", companyName: "Mangalore Chemicals & Fertilizers Ltd", registrationNumber: "REG-MCFL-015", ownerName: "Nihal Kaviratne", city: "Mangalore", state: "Karnataka", contactEmail: "info@mcfl.in" },
  { companyId: "COMP016", companyName: "Shriram Fertilizers & Chemicals", registrationNumber: "REG-SFC-016", ownerName: "Arun Bharat Ram", city: "New Delhi", state: "Delhi", contactEmail: "info@shriramfert.com" },
  { companyId: "COMP017", companyName: "Godavari Fertilizers & Chemicals Ltd", registrationNumber: "REG-GFCL-017", ownerName: "Ramesh Babu", city: "Kakinada", state: "Andhra Pradesh", contactEmail: "info@godavarifert.com" },
  { companyId: "COMP018", companyName: "Southern Petrochemicals Industries Corp (SPIC)", registrationNumber: "REG-SPIC-018", ownerName: "A.C. Muthiah", city: "Chennai", state: "Tamil Nadu", contactEmail: "info@spic.in" },
  { companyId: "COMP019", companyName: "Oswal Chemicals & Fertilizers Ltd", registrationNumber: "REG-OCFL-019", ownerName: "Abhey Kumar Oswal", city: "Ludhiana", state: "Punjab", contactEmail: "info@oswalfert.com" },
  { companyId: "COMP020", companyName: "Kanpur Fertilizers & Cement Ltd", registrationNumber: "REG-KFCL-020", ownerName: "Vijay Gupta", city: "Kanpur", state: "Uttar Pradesh", contactEmail: "info@kanpurfert.com" },
  { companyId: "COMP021", companyName: "Rajasthan State Mines & Minerals Ltd", registrationNumber: "REG-RSMML-021", ownerName: "Ashok Singhvi", city: "Udaipur", state: "Rajasthan", contactEmail: "info@rsmml.com" },
  { companyId: "COMP022", companyName: "Punjab Agro Industries Corporation", registrationNumber: "REG-PAIC-022", ownerName: "Harjinder Singh", city: "Chandigarh", state: "Punjab", contactEmail: "info@paic.in" },
  { companyId: "COMP023", companyName: "Bayer CropScience India Ltd", registrationNumber: "REG-BCIL-023", ownerName: "Simon-Thorsten Wiebusch", city: "Mumbai", state: "Maharashtra", contactEmail: "info@bayer.in" },
  { companyId: "COMP024", companyName: "Yara Fertilizers India Pvt Ltd", registrationNumber: "REG-YARA-024", ownerName: "Terje Knutsen", city: "Gurgaon", state: "Haryana", contactEmail: "info@yara.in" },
  { companyId: "COMP025", companyName: "Mosaic India Pvt Ltd", registrationNumber: "REG-MOSAIC-025", ownerName: "Joc O'Rourke", city: "Mumbai", state: "Maharashtra", contactEmail: "info@mosaicco.in" },
  { companyId: "COMP026", companyName: "Haifa Chemicals India Pvt Ltd", registrationNumber: "REG-HAIFA-026", ownerName: "Yair Shoham", city: "Bengaluru", state: "Karnataka", contactEmail: "info@haifagroup.in" },
  { companyId: "COMP027", companyName: "Aries Agro Limited", registrationNumber: "REG-AAL-027", ownerName: "Jimmy Mirchandani", city: "Mumbai", state: "Maharashtra", contactEmail: "info@ariesagro.com" },
  { companyId: "COMP028", companyName: "Biostadt India Limited", registrationNumber: "REG-BIL-028", ownerName: "Vinod Bahekar", city: "Mumbai", state: "Maharashtra", contactEmail: "info@biostadt.com" },
  { companyId: "COMP029", companyName: "Multiplex Bio-Tech Pvt Ltd", registrationNumber: "REG-MBTPL-029", ownerName: "Suresh Patil", city: "Bengaluru", state: "Karnataka", contactEmail: "info@multiplexgroup.com" },
  { companyId: "COMP030", companyName: "Kalyani Agro Chemicals Pvt Ltd", registrationNumber: "REG-KACPL-030", ownerName: "Ravi Kalyani", city: "Pune", state: "Maharashtra", contactEmail: "info@kalyaniagro.com" },
  { companyId: "COMP031", companyName: "Dhanuka Agritech Limited", registrationNumber: "REG-DAL-031", ownerName: "Mahendra Kumar Dhanuka", city: "New Delhi", state: "Delhi", contactEmail: "info@dhanuka.com" },
  { companyId: "COMP032", companyName: "Rallis India Limited", registrationNumber: "REG-RIL-032", ownerName: "Sanjiv Lal", city: "Mumbai", state: "Maharashtra", contactEmail: "info@rallis.co.in" },
  { companyId: "COMP033", companyName: "PI Industries Limited", registrationNumber: "REG-PIIL-033", ownerName: "Mayank Singhal", city: "Udaipur", state: "Rajasthan", contactEmail: "info@piindustries.com" },
  { companyId: "COMP034", companyName: "Sumitomo Chemical India Ltd", registrationNumber: "REG-SCIL-034", ownerName: "Sushil Kumar", city: "Mumbai", state: "Maharashtra", contactEmail: "info@sumitomochem.in" },
  { companyId: "COMP035", companyName: "Nuziveedu Seeds & Fertilizers Ltd", registrationNumber: "REG-NSFL-035", ownerName: "Murali Krishna Nuziveedu", city: "Hyderabad", state: "Telangana", contactEmail: "info@nuziveedu.com" },
  { companyId: "COMP036", companyName: "Greenfield Agrochem Pvt Ltd", registrationNumber: "REG-GAPL-036", ownerName: "Sunil Mehta", city: "Ahmedabad", state: "Gujarat", contactEmail: "info@greenfieldagro.com" },
  { companyId: "COMP037", companyName: "Krishi Rasayan Exports Pvt Ltd", registrationNumber: "REG-KREPL-037", ownerName: "Pradeep Agarwal", city: "Kolkata", state: "West Bengal", contactEmail: "info@krishirasayan.com" },
  { companyId: "COMP038", companyName: "Anand Agro Chemicals Ltd", registrationNumber: "REG-AACL-038", ownerName: "Anand Patel", city: "Anand", state: "Gujarat", contactEmail: "info@anandagro.com" },
  { companyId: "COMP039", companyName: "Bharat Agri Fert & Realty Ltd", registrationNumber: "REG-BAFRL-039", ownerName: "Bharat Shah", city: "Mumbai", state: "Maharashtra", contactEmail: "info@bharatagri.com" },
  { companyId: "COMP040", companyName: "Kisan Fertilizers Cooperative Ltd", registrationNumber: "REG-KFCOOP-040", ownerName: "Ramesh Yadav", city: "Lucknow", state: "Uttar Pradesh", contactEmail: "info@kisanfert.com" },
  { companyId: "COMP041", companyName: "Agro Phos India Ltd", registrationNumber: "REG-APIL-041", ownerName: "Dinesh Agarwal", city: "Indore", state: "Madhya Pradesh", contactEmail: "info@agrophos.com" },
  { companyId: "COMP042", companyName: "Fertinagro Biotech India Pvt Ltd", registrationNumber: "REG-FBIPL-042", ownerName: "Carlos Navarro", city: "Bengaluru", state: "Karnataka", contactEmail: "info@fertinagro.in" },
  { companyId: "COMP043", companyName: "Varsha Bioscience & Technology India", registrationNumber: "REG-VBTI-043", ownerName: "Varsha Reddy", city: "Hyderabad", state: "Telangana", contactEmail: "info@varshabio.com" },
  { companyId: "COMP044", companyName: "Swal Corporation Limited", registrationNumber: "REG-SCL-044", ownerName: "Pradeep Dave", city: "Mumbai", state: "Maharashtra", contactEmail: "info@swalcorp.com" },
  { companyId: "COMP045", companyName: "Heranba Industries Limited", registrationNumber: "REG-HIL-045", ownerName: "Sadashiv Shetty", city: "Vapi", state: "Gujarat", contactEmail: "info@heranba.com" },
  { companyId: "COMP046", companyName: "Insecticides India Limited", registrationNumber: "REG-IIL-046", ownerName: "Rajesh Aggarwal", city: "New Delhi", state: "Delhi", contactEmail: "info@insecticidesindia.com" },
  { companyId: "COMP047", companyName: "Bharat Fertilizer Industries Ltd", registrationNumber: "REG-BFIL-047", ownerName: "Suresh Bharat", city: "Patna", state: "Bihar", contactEmail: "info@bharatfert.com" },
  { companyId: "COMP048", companyName: "Deccan Fertilizers & Chemicals Ltd", registrationNumber: "REG-DFCL-048", ownerName: "Krishna Reddy", city: "Hyderabad", state: "Telangana", contactEmail: "info@deccanfert.com" },
  { companyId: "COMP049", companyName: "Himalaya Fertilizers Pvt Ltd", registrationNumber: "REG-HFPL-049", ownerName: "Vikram Thakur", city: "Shimla", state: "Himachal Pradesh", contactEmail: "info@himalayafert.com" },
  { companyId: "COMP050", companyName: "Sunrise Agro Industries Ltd", registrationNumber: "REG-SAIL-050", ownerName: "Suraj Prakash", city: "Jaipur", state: "Rajasthan", contactEmail: "info@sunriseagro.com" },
]

export async function GET() {
  try {
    await connectDB()

    // Clear existing companies
    await Company.deleteMany({})

    // Insert all 50 companies
    await Company.insertMany(
      companies.map(c => ({
        ...c,
        licenseNumber: `LIC-${c.companyId}`,
        contactPhone: `+91-${Math.floor(7000000000 + Math.random() * 2999999999)}`,
        gstNumber: `${Math.floor(10 + Math.random() * 28)}AABC${c.companyId}Z5`,
        status: "active",
        establishedYear: String(2000 + Math.floor(Math.random() * 23)),
      }))
    )

    return NextResponse.json({
      success: true,
      message: `50 fertilizer companies inserted into MongoDB!`,
      total: 50,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
