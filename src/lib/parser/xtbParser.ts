import * as XLSX from 'xlsx';
import { AssetCategory, CashOperationType, ParseResult, TradeType, XtbCashOperation, XtbOpenPosition, XtbTrade } from '../../types/portfolio';

/**
 * Normalizes number string from Polish/European format (e.g. "1 511,51", "28,655", "-604,93", 1511.51)
 */
export function parseNumber(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;

  let str = String(val).trim();
  // Remove non-breaking spaces and regular spaces
  str = str.replace(/\s+/g, '').replace(/\u00A0/g, '');
  
  // If format is like "1.234,56", replace '.' then ',' with '.'
  if (str.includes(',') && str.includes('.')) {
    if (str.indexOf('.') < str.indexOf(',')) {
      // European 1.234,56
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // US with commas 1,234.56
      str = str.replace(/,/g, '');
    }
  } else if (str.includes(',')) {
    str = str.replace(',', '.');
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Normalizes dates from various formats (e.g. "2025-02-03 14:34:38", "03.02.2025 14:34", Excel serial)
 */
export function parseDate(val: any): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Date) return val.toISOString();

  // Excel serial number
  if (typeof val === 'number') {
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  const str = String(val).trim();
  // Format DD.MM.YYYY HH:mm:ss
  const ddmmyyyy = str.match(/^(\d{2})[./-](\d{2})[./-](\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (ddmmyyyy) {
    const [, d, m, y, hh, mm, ss] = ddmmyyyy;
    const dateObj = new Date(
      parseInt(y, 10),
      parseInt(m, 10) - 1,
      parseInt(d, 10),
      hh ? parseInt(hh, 10) : 0,
      mm ? parseInt(mm, 10) : 0,
      ss ? parseInt(ss, 10) : 0
    );
    if (!isNaN(dateObj.getTime())) return dateObj.toISOString();
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return new Date().toISOString();
}

/**
 * Categorize asset
 */
export function parseAssetCategory(categoryRaw: string, ticker: string): AssetCategory {
  const cat = (categoryRaw || '').toUpperCase();
  const tick = (ticker || '').toUpperCase();

  if (cat.includes('ETF') || tick.endsWith('.DE') && (tick.startsWith('VWCE') || tick.startsWith('IUSN') || tick.startsWith('EUNL') || tick.startsWith('XEPS'))) {
    return 'ETF';
  }
  if (cat.includes('CFD') || cat.includes('CRYPTO') || tick.includes('SOLANA') || tick.includes('BITCOIN') || tick.includes('ETH')) {
    return cat.includes('CRYPTO') || tick.includes('SOLANA') || tick.includes('BTC') ? 'CRYPTO' : 'CFD';
  }
  if (cat.includes('FOREX') || cat.includes('FX')) {
    return 'FOREX';
  }
  if (cat.includes('STOCK') || cat.includes('AKCJE') || cat.includes('EQUITY') || tick.endsWith('.PL') || tick.endsWith('.US') || tick.endsWith('.NL')) {
    return 'STOCK';
  }
  return 'STOCK';
}

/**
 * Categorize cash operation
 */
export function parseCashOpType(typeRaw: string, comment: string = ''): CashOperationType {
  const t = (typeRaw || '').toLowerCase();
  const c = (comment || '').toLowerCase();
  const combined = `${t} ${c}`;

  if (combined.includes('wpłata') || combined.includes('deposit') || combined.includes('zasilenie')) {
    return 'DEPOSIT';
  }
  if (combined.includes('wypłata') || combined.includes('withdrawal')) {
    return 'WITHDRAWAL';
  }
  if (combined.includes('dywidenda') || combined.includes('dividend')) {
    return 'DIVIDEND';
  }
  if (combined.includes('podatek') || combined.includes('tax') || combined.includes('withholding')) {
    return 'TAX';
  }
  if (combined.includes('odsetki') || combined.includes('oprocentowanie') || combined.includes('interest')) {
    return 'INTEREST';
  }
  if (combined.includes('prowizja') || combined.includes('opłata') || combined.includes('fee') || combined.includes('sec')) {
    return 'FEE';
  }
  if (combined.includes('przelew') || combined.includes('transfer')) {
    return 'TRANSFER';
  }
  return 'OTHER';
}

/**
 * Main parser function supporting ArrayBuffer (from File) or string (CSV)
 */
export function parseXtbFile(
  fileContent: ArrayBuffer | string,
  existingTrades: XtbTrade[] = [],
  existingOperations: XtbCashOperation[] = []
): ParseResult {
  const warnings: string[] = [];
  let accountNumber = '';

  let workbook: XLSX.WorkBook;

  try {
    if (typeof fileContent === 'string') {
      workbook = XLSX.read(fileContent, { type: 'string', raw: false });
    } else {
      workbook = XLSX.read(fileContent, { type: 'array', raw: false });
    }
  } catch (err: any) {
    return {
      success: false,
      trades: [],
      cashOperations: [],
      openPositions: [],
      warnings: [`Błąd odczytu pliku: ${err.message || 'Niepoprawny format pliku XLSX/CSV'}`],
      newTradesCount: 0,
      duplicateTradesCount: 0,
      newOperationsCount: 0,
      duplicateOperationsCount: 0,
    };
  }

  const parsedTrades: XtbTrade[] = [];
  const parsedOperations: XtbCashOperation[] = [];
  const parsedOpenPositions: XtbOpenPosition[] = [];

  // Iterate all sheets
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    // Convert sheet to array of arrays
    const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (!rawRows || rawRows.length === 0) continue;

    const lowerSheetName = sheetName.toLowerCase();
    
    // Check if sheet contains closed positions or cash operations
    let currentSection: 'NONE' | 'CLOSED' | 'CASH' | 'OPEN' = 'NONE';
    if (lowerSheetName.includes('zamknięte') || lowerSheetName.includes('closed')) {
      currentSection = 'CLOSED';
    } else if (lowerSheetName.includes('gotówkowe') || lowerSheetName.includes('cash')) {
      currentSection = 'CASH';
    } else if (lowerSheetName.includes('otwarte') || lowerSheetName.includes('open')) {
      currentSection = 'OPEN';
    }

    let headerIndices: Record<string, number> = {};
    let isHeaderFound = false;

    for (let rowIndex = 0; rowIndex < rawRows.length; rowIndex++) {
      const row = rawRows[rowIndex];
      if (!row || row.length === 0) continue;

      const firstCell = String(row[0] || '').trim();
      const firstCellLower = firstCell.toLowerCase();

      // Check account number metadata
      if (firstCellLower.includes('account number') || firstCellLower.includes('numer rachunku') || firstCellLower.includes('nr konta')) {
        const acc = String(row[1] || row[0]).replace(/[^\d]/g, '');
        if (acc && !accountNumber) {
          accountNumber = acc;
        }
      }

      // Check section headers in CSV-like concatenated files
      if (firstCellLower === 'closed positions' || firstCellLower === 'pozycje zamknięte') {
        currentSection = 'CLOSED';
        isHeaderFound = false;
        headerIndices = {};
        continue;
      }
      if (firstCellLower === 'cash operations' || firstCellLower === 'operacje gotówkowe') {
        currentSection = 'CASH';
        isHeaderFound = false;
        headerIndices = {};
        continue;
      }
      if (firstCellLower === 'open positions' || firstCellLower === 'otwarte pozycje') {
        currentSection = 'OPEN';
        isHeaderFound = false;
        headerIndices = {};
        continue;
      }

      // Detect header row
      const rowStr = row.map((c) => String(c).toLowerCase()).join(' ');
      const hasInstrument = rowStr.includes('instrument') || rowStr.includes('ticker') || rowStr.includes('symbol');
      const hasVolume = rowStr.includes('volume') || rowStr.includes('wolumen') || rowStr.includes('ilość');
      const hasProfit = rowStr.includes('profit') || rowStr.includes('zysk') || rowStr.includes('strata');
      const hasCashType = rowStr.includes('typ') || rowStr.includes('type');
      const hasCashAmount = rowStr.includes('kwota') || rowStr.includes('amount');

      if ((hasInstrument && (hasVolume || hasProfit)) || (hasCashType && hasCashAmount)) {
        headerIndices = {};
        row.forEach((colName, colIdx) => {
          const colKey = String(colName || '').toLowerCase().trim();
          headerIndices[colKey] = colIdx;
        });
        isHeaderFound = true;

        if (hasCashType && hasCashAmount && !hasInstrument) {
          currentSection = 'CASH';
        } else if (hasInstrument) {
          if (currentSection !== 'OPEN') {
            currentSection = 'CLOSED';
          }
        }
        continue;
      }

      if (!isHeaderFound) continue;

      // Skip summary rows (e.g. "Profit/loss", "Podsumowanie", etc.)
      if (
        firstCellLower.includes('profit/loss') ||
        firstCellLower.includes('podsumowanie') ||
        firstCellLower.includes('total') ||
        firstCellLower.includes('date from') ||
        firstCellLower.includes('date to')
      ) {
        continue;
      }

      // Helper function to get value by matching possible header names
      const getVal = (...keys: string[]) => {
        for (const k of keys) {
          for (const [header, idx] of Object.entries(headerIndices)) {
            if (header.includes(k)) {
              const v = row[idx];
              if (v !== undefined && v !== null && v !== '') return v;
            }
          }
        }
        return '';
      };

      // Process CLOSED TRADES
      if (currentSection === 'CLOSED') {
        const instrument = String(getVal('instrument', 'nazwa') || row[0] || '').trim();
        const ticker = String(getVal('ticker', 'symbol') || row[1] || instrument).trim();
        const categoryRaw = String(getVal('category', 'kategoria') || row[2] || '');
        const typeRaw = String(getVal('type', 'typ') || row[3] || 'BUY').trim().toUpperCase();

        if (!instrument && !ticker) continue;

        const volume = parseNumber(getVal('volume', 'wolumen', 'ilość') || row[4]);
        const openPrice = parseNumber(getVal('open price', 'cena otwarcia') || row[5]);
        const openTimeRaw = getVal('open time', 'czas otwarcia') || row[6];
        const closePrice = parseNumber(getVal('close price', 'cena zamknięcia') || row[7]);
        const closeTimeRaw = getVal('close time', 'czas zamknięcia') || row[8];
        const profitNet = parseNumber(getVal('profit/loss', 'zysk/strata', 'zysk netto') || row[10]);
        const profitGross = parseNumber(getVal('gross profit', 'zysk brutto') || row[11] || profitNet);
        const purchaseValue = parseNumber(getVal('purchase value', 'wartość zakupu') || row[12]);
        const saleValue = parseNumber(getVal('sale value', 'wartość sprzedaży') || row[13]);
        const commission = parseNumber(getVal('commission', 'prowizja') || row[16]);
        const swap = parseNumber(getVal('swap') || row[18]);
        const openConversionRate = parseNumber(getVal('open conversion', 'kurs przewalutowania otwarcia') || row[20]);
        const closeConversionRate = parseNumber(getVal('close conversion', 'kurs przewalutowania zamknięcia') || row[21]);
        const positionId = String(getVal('position id', 'id pozycji', 'id transakcji') || row[23] || '').trim();
        const comment = String(getVal('comment', 'komentarz') || row[24] || '').trim();

        const openTime = parseDate(openTimeRaw);
        const closeTime = parseDate(closeTimeRaw);

        // Duration in days
        const durationMs = new Date(closeTime).getTime() - new Date(openTime).getTime();
        const durationDays = Math.max(0, Math.round(durationMs / (1000 * 60 * 60 * 24)));

        // Return %
        let returnPercent = 0;
        if (openPrice > 0 && closePrice > 0) {
          returnPercent = ((closePrice - openPrice) / openPrice) * 100;
          if (typeRaw === 'SELL') returnPercent = -returnPercent;
        } else if (purchaseValue > 0) {
          returnPercent = (profitNet / purchaseValue) * 100;
        }

        const category = parseAssetCategory(categoryRaw, ticker);
        const type: TradeType = typeRaw.includes('SELL') ? 'SELL' : 'BUY';

        const id = positionId || `${ticker}_${openTime}_${volume}_${profitNet}`;

        parsedTrades.push({
          id,
          positionId: positionId || undefined,
          instrument,
          ticker: ticker || instrument,
          category,
          type,
          volume,
          openPrice,
          openTime,
          closePrice,
          closeTime,
          profitNet,
          profitGross,
          purchaseValue: purchaseValue || (openPrice * volume),
          saleValue: saleValue || (closePrice * volume),
          commission,
          swap,
          openConversionRate: openConversionRate || undefined,
          closeConversionRate: closeConversionRate || undefined,
          comment: comment || undefined,
          durationDays,
          returnPercent,
        });
      }

      // Process CASH OPERATIONS
      else if (currentSection === 'CASH') {
        const timeRaw = getVal('time', 'czas', 'data') || row[1] || row[0];
        const typeRaw = String(getVal('type', 'typ') || row[2] || row[1] || '').trim();
        const amount = parseNumber(getVal('amount', 'kwota') || row[3] || row[2]);
        const currency = String(getVal('currency', 'waluta') || row[4] || 'PLN').trim().toUpperCase() || 'PLN';
        const operationId = String(getVal('id', 'id operacji') || row[0] || '').trim();
        const comment = String(getVal('comment', 'komentarz') || row[5] || row[4] || '').trim();

        if (!typeRaw && amount === 0) continue;

        const time = parseDate(timeRaw);
        const type = parseCashOpType(typeRaw, comment);
        const id = operationId || `cash_${time}_${type}_${amount}`;

        parsedOperations.push({
          id,
          operationId: operationId || undefined,
          time,
          type,
          typeRaw,
          amount,
          currency,
          comment: comment || undefined,
        });
      }

      // Process OPEN POSITIONS
      else if (currentSection === 'OPEN') {
        const instrument = String(getVal('instrument', 'nazwa') || row[0] || '').trim();
        const ticker = String(getVal('ticker', 'symbol') || row[1] || instrument).trim();
        if (!instrument && !ticker) continue;

        const categoryRaw = String(getVal('category', 'kategoria') || row[2] || '');
        const typeRaw = String(getVal('type', 'typ') || 'BUY').trim().toUpperCase();
        const volume = parseNumber(getVal('volume', 'wolumen', 'ilość') || row[4]);
        const openPrice = parseNumber(getVal('open price', 'cena otwarcia') || row[5]);
        const openTime = parseDate(getVal('open time', 'czas otwarcia') || row[6]);
        const currentPrice = parseNumber(getVal('current price', 'cena rynkowa', 'kurs') || row[7] || openPrice);
        const purchaseValue = parseNumber(getVal('purchase value', 'wartość zakupu') || row[12] || (openPrice * volume));
        const currentValue = parseNumber(getVal('current value', 'wartość rynkowa') || row[13] || (currentPrice * volume));
        const unrealizedProfit = parseNumber(getVal('profit/loss', 'zysk/strata') || (currentValue - purchaseValue));
        const positionId = String(getVal('position id', 'id pozycji') || row[23] || '').trim();

        const returnPercent = purchaseValue > 0 ? (unrealizedProfit / purchaseValue) * 100 : 0;

        parsedOpenPositions.push({
          id: positionId || `${ticker}_open_${openTime}`,
          positionId: positionId || `${ticker}_open`,
          instrument,
          ticker,
          category: parseAssetCategory(categoryRaw, ticker),
          type: typeRaw.includes('SELL') ? 'SELL' : 'BUY',
          volume,
          openPrice,
          openTime,
          currentPrice,
          purchaseValue,
          currentValue,
          unrealizedProfit,
          returnPercent,
        });
      }
    }
  }

  // Deduplicate against existing data
  const existingTradeMap = new Set(
    existingTrades.map((t) => t.positionId || `${t.ticker}_${t.openTime}_${t.profitNet}`)
  );
  const existingOpMap = new Set(
    existingOperations.map((o) => o.operationId || `${o.time}_${o.type}_${o.amount}`)
  );

  let newTradesCount = 0;
  let duplicateTradesCount = 0;
  const mergedTrades = [...existingTrades];

  for (const trade of parsedTrades) {
    const key = trade.positionId || `${trade.ticker}_${trade.openTime}_${trade.profitNet}`;
    if (existingTradeMap.has(key)) {
      duplicateTradesCount++;
    } else {
      existingTradeMap.add(key);
      mergedTrades.push(trade);
      newTradesCount++;
    }
  }

  let newOperationsCount = 0;
  let duplicateOperationsCount = 0;
  const mergedOperations = [...existingOperations];

  for (const op of parsedOperations) {
    const key = op.operationId || `${op.time}_${op.type}_${op.amount}`;
    if (existingOpMap.has(key)) {
      duplicateOperationsCount++;
    } else {
      existingOpMap.add(key);
      mergedOperations.push(op);
      newOperationsCount++;
    }
  }

  // Sort trades by closeTime descending
  mergedTrades.sort((a, b) => new Date(b.closeTime).getTime() - new Date(a.closeTime).getTime());
  // Sort cash operations by time descending
  mergedOperations.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  if (parsedTrades.length === 0 && parsedOperations.length === 0) {
    warnings.push(
      'Nie znaleziono pozycji ani operacji gotówkowych. Upewnij się, że plik to raport wyeksportowany z XTB (np. zawiera zakładki "Pozycje zamknięte" lub "Operacje gotówkowe").'
    );
  }

  return {
    success: parsedTrades.length > 0 || parsedOperations.length > 0,
    accountNumber: accountNumber || undefined,
    trades: mergedTrades,
    cashOperations: mergedOperations,
    openPositions: parsedOpenPositions,
    warnings,
    newTradesCount,
    duplicateTradesCount,
    newOperationsCount,
    duplicateOperationsCount,
  };
}
