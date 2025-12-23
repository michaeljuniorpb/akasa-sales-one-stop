
/**
 * Formats a number to Indonesian Rupiah currency format.
 */
export const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Strips non-numeric characters for processing.
 * Handles decimal conversion from comma (ID) to dot (JS).
 */
export const parseNumber = (value: string, isFloat: boolean = false): number => {
  if (!value) return 0;
  
  if (isFloat) {
    // Ubah koma menjadi titik untuk kalkulasi JS, lalu bersihkan karakter non-numeric selain titik
    const normalized = value.replace(/,/g, '.');
    const clean = normalized.replace(/[^0-9.]/g, '');
    
    // Tangani kasus jika user mengetik titik di awal atau ganda
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  // Untuk angka bulat (Rupiah)
  const clean = value.replace(/[^0-9]/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Formats date to a readable Indonesian format.
 */
export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};
