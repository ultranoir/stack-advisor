import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Stack, DetailedBudget } from '~/types'

interface PdfExportOptions {
  projectName: string
  stack: Stack
  quickEstimate?: {
    daysMin: number
    daysMax: number
    budgetMin: number
    budgetMax: number
    averageTjm: number
  }
  detailedBudget?: DetailedBudget
  discount?: {
    type: string
    value: number
    discountAmount: number
    finalBudget: number
  }
  locale: string
  translations: {
    pdfTitle: string
    pdfGeneratedOn: string
    pdfRecommendedStack: string
    pdfQuickEstimation: string
    pdfDetailedBudget: string
    pdfCommercialDiscount: string
    pdfWorkload: string
    pdfBudget: string
    pdfFooter: string
    profile: string
    days: string
    dailyRate: string
    total: string
    subtotal: string
    budgetBeforeDiscount: string
    discount: string
    finalBudget: string
  }
}

export const usePdfExport = () => {
  const { formatCurrency } = useEstimation()

  const generateEstimationPdf = (options: PdfExportOptions) => {
    const {
      projectName,
      stack,
      quickEstimate,
      detailedBudget,
      discount,
      locale,
      translations,
    } = options

    // Créer le document PDF
    const doc = new jsPDF()

    // Configuration
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let yPosition = margin

    // Couleurs
    const primaryColor: [number, number, number] = [37, 99, 235] // blue-600
    const lightGray: [number, number, number] = [241, 245, 249] // slate-100
    const textGray: [number, number, number] = [51, 65, 85] // slate-700

    // En-tête
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, pageWidth, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text(translations.pdfTitle, margin, 25)

    yPosition = 50

    // Nom du projet
    doc.setTextColor(...textGray)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(projectName, margin, yPosition)
    yPosition += 10

    // Date de génération
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const dateStr = new Date().toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    doc.text(`${translations.pdfGeneratedOn} ${dateStr}`, margin, yPosition)
    yPosition += 15

    // Stack recommandée
    doc.setFillColor(...lightGray)
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 30, 3, 3, 'F')

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...primaryColor)
    doc.text(translations.pdfRecommendedStack, margin + 5, yPosition + 8)

    doc.setFontSize(14)
    doc.setTextColor(...textGray)
    doc.text(stack.name, margin + 5, yPosition + 16)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`CMS: ${stack.cms}  |  Frontend: ${stack.frontend}`, margin + 5, yPosition + 24)

    yPosition += 40

    // Estimation rapide
    if (quickEstimate) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...textGray)
      doc.text(translations.pdfQuickEstimation, margin, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [[translations.pdfWorkload, translations.pdfBudget]],
        body: [
          [
            `${quickEstimate.daysMin} - ${quickEstimate.daysMax} ${translations.days}`,
            `${formatCurrency(quickEstimate.budgetMin)} - ${formatCurrency(quickEstimate.budgetMax)}`,
          ],
        ],
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          fontSize: 11,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 10,
        },
        margin: { left: margin, right: margin },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15
    }

    // Budget détaillé
    if (detailedBudget && detailedBudget.breakdown.length > 0) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...textGray)
      doc.text(translations.pdfDetailedBudget, margin, yPosition)
      yPosition += 10

      // Tableau des profils
      const tableData = detailedBudget.breakdown.map(item => [
        item.profile,
        item.days.toString(),
        `${item.tjm_applied}€`,
        formatCurrency(item.cost),
      ])

      autoTable(doc, {
        startY: yPosition,
        head: [[translations.profile, translations.days, translations.dailyRate, translations.total]],
        body: tableData,
        foot: [[translations.subtotal, `${detailedBudget.totalDays} j`, '', formatCurrency(detailedBudget.total)]],
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          fontSize: 11,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 10,
        },
        footStyles: {
          fillColor: lightGray,
          textColor: textGray,
          fontSize: 11,
          fontStyle: 'bold',
        },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { halign: 'center', cellWidth: 30 },
          2: { halign: 'right', cellWidth: 30 },
          3: { halign: 'right', cellWidth: 50 },
        },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Remise commerciale
      if (discount && discount.discountAmount > 0) {
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(translations.pdfCommercialDiscount, margin, yPosition)
        yPosition += 10

        autoTable(doc, {
          startY: yPosition,
          body: [
            [translations.budgetBeforeDiscount, formatCurrency(detailedBudget.total)],
            [translations.discount, `- ${formatCurrency(discount.discountAmount)}`],
            [translations.finalBudget, formatCurrency(discount.finalBudget)],
          ],
          theme: 'plain',
          bodyStyles: {
            fontSize: 11,
          },
          margin: { left: margin, right: margin },
          columnStyles: {
            0: { cellWidth: 80, fontStyle: 'bold' },
            1: { halign: 'right', cellWidth: 90 },
          },
          didParseCell: (data) => {
            if (data.row.index === 2) {
              data.cell.styles.fontSize = 14
              data.cell.styles.fontStyle = 'bold'
              data.cell.styles.textColor = primaryColor
            }
          },
        })

        yPosition = (doc as any).lastAutoTable.finalY + 10
      }
    }

    // Pied de page
    const pageHeight = doc.internal.pageSize.getHeight()
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184) // slate-400
    doc.setFont('helvetica', 'italic')
    doc.text(
      translations.pdfFooter,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )

    // Sauvegarder le PDF
    const fileName = `${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_estimation.pdf`
    doc.save(fileName)
  }

  return {
    generateEstimationPdf,
  }
}
