import { jsPDF } from "jspdf"

export async function generateCertificate({
  name,
  score,
  date,
}: {
  name: string
  score: number
  date: string
}) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  })

  // Background
  doc.setFillColor(240, 248, 255)
  doc.rect(0, 0, 297, 210, "F")

  // Border
  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(2)
  doc.rect(10, 10, 277, 190)

  // Title
  doc.setFontSize(32)
  doc.setTextColor(59, 130, 246)
  doc.setFont("helvetica", "bold")
  doc.text("Certificate of Participation", 148.5, 50, { align: "center" })

  // Subtitle
  doc.setFontSize(18)
  doc.setTextColor(100, 116, 139)
  doc.setFont("helvetica", "normal")
  doc.text("Hackathon 2026", 148.5, 65, { align: "center" })
  doc.text("National Institute of Technology Silchar", 148.5, 75, { align: "center" })

  // Certificate text
  doc.setFontSize(14)
  doc.setTextColor(30, 41, 59)
  doc.text("This is to certify that", 148.5, 100, { align: "center" })

  // Name
  doc.setFontSize(24)
  doc.setTextColor(59, 130, 246)
  doc.setFont("helvetica", "bold")
  doc.text(name, 148.5, 120, { align: "center" })

  // Description
  doc.setFontSize(14)
  doc.setTextColor(30, 41, 59)
  doc.setFont("helvetica", "normal")
  doc.text("has successfully participated in the hackathon", 148.5, 135, { align: "center" })
  doc.text(`with a total score of ${score} points.`, 148.5, 145, { align: "center" })

  // Date
  doc.setFontSize(12)
  doc.setTextColor(100, 116, 139)
  doc.text(`Date: ${date}`, 148.5, 170, { align: "center" })

  // Signature lines
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text("Organizing Committee", 60, 190, { align: "center" })
  doc.text("NIT Silchar", 237, 190, { align: "center" })

  return doc.output("arraybuffer")
}

