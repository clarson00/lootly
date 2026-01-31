/**
 * Receipt OCR using Tesseract.js
 * Extracts total amount from receipt images
 */

let tesseractWorker = null;

// Lazy-load Tesseract.js worker
async function getWorker() {
  if (tesseractWorker) return tesseractWorker;

  // Dynamic import to reduce initial bundle size
  const Tesseract = await import('tesseract.js');

  tesseractWorker = await Tesseract.createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        // Could emit progress here if needed
      }
    }
  });

  return tesseractWorker;
}

/**
 * Extract total amount from receipt text
 * Looks for common patterns: "Total", "Amount Due", "Grand Total", etc.
 */
function extractTotalFromText(text) {
  if (!text) return null;

  // Normalize text
  const normalizedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .toUpperCase();

  // Common patterns for total amount on receipts
  const patterns = [
    // "TOTAL: $XX.XX" or "TOTAL $XX.XX"
    /TOTAL[:\s]*\$?\s*(\d+[.,]\d{2})/i,
    // "AMOUNT DUE: $XX.XX"
    /AMOUNT\s*DUE[:\s]*\$?\s*(\d+[.,]\d{2})/i,
    // "GRAND TOTAL: $XX.XX"
    /GRAND\s*TOTAL[:\s]*\$?\s*(\d+[.,]\d{2})/i,
    // "BALANCE DUE: $XX.XX"
    /BALANCE\s*DUE[:\s]*\$?\s*(\d+[.,]\d{2})/i,
    // "TOTAL DUE: $XX.XX"
    /TOTAL\s*DUE[:\s]*\$?\s*(\d+[.,]\d{2})/i,
    // "SUBTOTAL: $XX.XX" (fallback)
    /SUBTOTAL[:\s]*\$?\s*(\d+[.,]\d{2})/i,
    // Just a dollar amount after "TOTAL" on a new line
    /TOTAL[\s\n]*\$?\s*(\d+[.,]\d{2})/i,
    // Dollar amount that looks like a total (larger amounts near end of receipt)
    /\$\s*(\d{2,}[.,]\d{2})\s*$/im,
  ];

  for (const pattern of patterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      // Convert comma decimal separator to period if needed
      const amount = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(amount) && amount > 0 && amount < 10000) {
        return {
          amount,
          confidence: 0.9, // High confidence for pattern match
          matchedText: match[0]
        };
      }
    }
  }

  // Fallback: Find all dollar amounts and return the largest
  const dollarPattern = /\$?\s*(\d+[.,]\d{2})/g;
  const amounts = [];
  let amountMatch;
  while ((amountMatch = dollarPattern.exec(normalizedText)) !== null) {
    const val = parseFloat(amountMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0 && val < 10000) {
      amounts.push(val);
    }
  }

  if (amounts.length > 0) {
    // Return the largest amount (likely the total)
    const maxAmount = Math.max(...amounts);
    return {
      amount: maxAmount,
      confidence: 0.6, // Lower confidence for fallback
      matchedText: `$${maxAmount.toFixed(2)} (inferred)`
    };
  }

  return null;
}

/**
 * Perform OCR on a receipt image and extract the total
 * @param {File|Blob|string} image - Image file, blob, or data URL
 * @returns {Promise<{amount: number, confidence: number, rawText: string} | null>}
 */
export async function scanReceipt(image) {
  try {
    const worker = await getWorker();

    const { data } = await worker.recognize(image);

    const result = extractTotalFromText(data.text);

    if (result) {
      return {
        amount: result.amount,
        confidence: result.confidence * (data.confidence / 100), // Combine OCR and pattern confidence
        rawText: data.text,
        matchedText: result.matchedText
      };
    }

    return {
      amount: null,
      confidence: 0,
      rawText: data.text,
      matchedText: null
    };
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('Failed to scan receipt: ' + error.message);
  }
}

/**
 * Terminate the worker to free resources
 */
export async function terminateWorker() {
  if (tesseractWorker) {
    await tesseractWorker.terminate();
    tesseractWorker = null;
  }
}

/**
 * Pre-load the OCR worker in the background
 */
export function preloadWorker() {
  getWorker().catch(console.error);
}
