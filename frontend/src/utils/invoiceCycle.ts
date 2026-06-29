export type MonthYear = {
  month: number;
  year: number;
};

function isValidDay(day: number | undefined) {
  return Number.isInteger(day) && Number(day) >= 1 && Number(day) <= 31;
}

function getLastDayOfMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function clampDayToMonth(day: number, month: number, year: number) {
  return Math.min(day, getLastDayOfMonth(month, year));
}

function getDateFromDay(day: number, month: number, year: number) {
  return new Date(year, month - 1, clampDayToMonth(day, month, year));
}

export function addMonthsToMonthYear(
  monthYear: MonthYear,
  offset: number,
): MonthYear {
  const date = new Date(monthYear.year, monthYear.month - 1 + offset, 1);

  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export function getCurrentMonthYear(referenceDate = new Date()): MonthYear {
  return {
    month: referenceDate.getMonth() + 1,
    year: referenceDate.getFullYear(),
  };
}

export function getCurrentInvoiceMonthYear(
  dueDay: number | undefined,
  referenceDate = new Date(),
): MonthYear {
  const currentMonthYear = getCurrentMonthYear(referenceDate);

  if (!isValidDay(dueDay)) {
    return currentMonthYear;
  }

  const currentDueDate = getDateFromDay(
    Number(dueDay),
    currentMonthYear.month,
    currentMonthYear.year,
  );
  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );

  if (today > currentDueDate) {
    return addMonthsToMonthYear(currentMonthYear, 1);
  }

  return currentMonthYear;
}

export function getInvoiceMonthYearForPurchaseDate(
  purchaseDate: string,
  closingDay: number | undefined,
  dueDay: number | undefined,
  fallbackDate = new Date(),
): MonthYear {
  const parsedPurchaseDate = new Date(`${purchaseDate}T00:00:00`);

  if (
    Number.isNaN(parsedPurchaseDate.getTime()) ||
    !isValidDay(closingDay) ||
    !isValidDay(dueDay)
  ) {
    return getCurrentMonthYear(fallbackDate);
  }

  const purchaseMonthYear = getCurrentMonthYear(parsedPurchaseDate);
  const currentClosingDate = getDateFromDay(
    Number(closingDay),
    purchaseMonthYear.month,
    purchaseMonthYear.year,
  );
  const closingMonthYear =
    parsedPurchaseDate <= currentClosingDate
      ? purchaseMonthYear
      : addMonthsToMonthYear(purchaseMonthYear, 1);

  if (Number(closingDay) > Number(dueDay)) {
    return addMonthsToMonthYear(closingMonthYear, 1);
  }

  return closingMonthYear;
}

export function getInvoiceDueDateLabel(
  dueDay: number | undefined,
  month: number,
  year: number,
  fallback = '--/--/----',
) {
  if (!isValidDay(dueDay)) {
    return fallback;
  }

  const day = clampDayToMonth(Number(dueDay), month, year);

  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

export function getInvoiceClosingDateLabel(
  closingDay: number | undefined,
  dueDay: number | undefined,
  invoiceMonth: number,
  invoiceYear: number,
  fallback = '--/--/----',
) {
  if (!isValidDay(closingDay)) {
    return fallback;
  }

  const closingMonthYear =
    isValidDay(dueDay) && Number(closingDay) > Number(dueDay)
      ? addMonthsToMonthYear({ month: invoiceMonth, year: invoiceYear }, -1)
      : { month: invoiceMonth, year: invoiceYear };
  const day = clampDayToMonth(
    Number(closingDay),
    closingMonthYear.month,
    closingMonthYear.year,
  );

  return `${String(day).padStart(2, '0')}/${String(closingMonthYear.month).padStart(2, '0')}/${closingMonthYear.year}`;
}
