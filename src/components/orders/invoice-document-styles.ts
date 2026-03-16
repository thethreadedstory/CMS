export const invoiceDocumentStyles = `
  @page {
    margin: 12mm;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #111827;
    font-family: Arial, Helvetica, sans-serif;
  }

  body {
    padding: 12mm;
  }

  .invoice-print-area {
    display: block;
  }

  .invoice-shell {
    width: 100%;
    border: 1px solid #1f2937;
    padding: 24px;
    color: #111827;
    font-size: 12px;
    line-height: 1.5;
  }

  .invoice-banner {
    padding-bottom: 16px;
    text-align: center;
    border-bottom: 1px solid #1f2937;
  }

  .invoice-story-title {
    margin: 8px 0 0;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .invoice-header {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    margin-top: 18px;
    padding-bottom: 16px;
    border-bottom: 1px solid #1f2937;
  }

  .invoice-eyebrow {
    margin: 0 0 6px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .invoice-title {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .invoice-meta {
    margin: 4px 0 0;
  }

  .invoice-status-box {
    min-width: 220px;
    border: 1px solid #1f2937;
  }

  .invoice-status-box > div {
    padding: 10px 12px;
  }

  .invoice-status-box > div + div {
    border-top: 1px solid #1f2937;
  }

  .invoice-status-label,
  .invoice-section-title {
    display: block;
    margin-bottom: 4px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .invoice-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 18px;
  }

  .invoice-card,
  .invoice-notes,
  .invoice-totals-box {
    border: 1px solid #1f2937;
    padding: 12px;
  }

  .invoice-strong {
    font-weight: 700;
  }

  .invoice-summary-row,
  .invoice-total-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 6px 0;
  }

  .invoice-summary-row + .invoice-summary-row {
    border-top: 1px solid #d1d5db;
  }

  .invoice-table-wrap {
    margin-top: 18px;
    border: 1px solid #1f2937;
  }

  .invoice-table {
    width: 100%;
    border-collapse: collapse;
  }

  .invoice-table th,
  .invoice-table td {
    padding: 10px 12px;
    border-right: 1px solid #1f2937;
    border-bottom: 1px solid #1f2937;
    text-align: left;
    vertical-align: top;
  }

  .invoice-table th:last-child,
  .invoice-table td:last-child {
    border-right: 0;
  }

  .invoice-table thead th {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    background: #f3f4f6;
  }

  .invoice-table tbody tr:last-child td {
    border-bottom: 0;
  }

  .invoice-item-name {
    font-weight: 600;
  }

  .invoice-item-meta {
    color: #4b5563;
  }

  .invoice-totals-box {
    width: min(320px, 100%);
    margin-top: 18px;
    margin-left: auto;
  }

  .invoice-total-row {
    margin-top: 6px;
    border-top: 1px solid #1f2937;
    padding-top: 10px;
    font-weight: 700;
  }

  .invoice-notes {
    margin-top: 18px;
  }

  @media print {
    body {
      padding: 0;
    }

    .invoice-shell {
      box-shadow: none;
    }
  }
`
