# 📈 XTB Portfolio Analyzer

Nowoczesna, bezpieczna i niezwykle przejrzysta aplikacja webowa do całościowej analizy portfela inwestycyjnego na podstawie raportów **XLSX** i **CSV** wygenerowanych z platformy **XTB** (xStation 5 oraz aplikacji mobilnej).

---

## ✨ Główne Możliwości

### 1. 📂 Wieloplikowy Import & Scalony Portfel (Unified Portfolio)
- **Import wielu plików naraz**: Możliwość zaznaczenia lub przeciągnięcia wielu plików `.xlsx` / `.csv` (np. *Konto Główne PLN*, *Rachunek IKE*, *Rachunek IKZE*, *Raporty z kolejnych lat*).
- **Całościowy portfel**: Wszystkie rachunki i okresy są automatycznie integrowane w jeden spójny portfel, dając pełny obraz całego majątku.
- **Inteligentna deduplikacja**: Możliwość cyklicznego wgrywania nowych wyciągów – system automatycznie rozpoznaje i ignoruje już zaimportowane wcześniej transakcje.
- **Wskaźnik rachunków**: Oznaczenie numerów kont (np. `#51499252`) przy każdej pozycji z możliwością filtrowania.

### 2. 📊 Zaawansowane Wykresy i Analityka
- **Struktura portfela w czasie (Historical Asset Allocation)**: Skumulowany wykres powierzchniowy (*Stacked Area Chart*) prezentujący zmianę wartości i udziałów klas aktywów (Akcje, ETF-y, CFD/Krypto, Gotówka) w PLN oraz w ujęciu procentowym (%).
- **Zyski i Straty (Cumulative & Daily P&L)**: Wykres skumulowanej krzywej zysku netto oraz słupki dziennych realizacji.
- **Benchmarking Rynkowy**: Porównanie stopy zwrotu Twojego portfela ze światowymi indeksami:
  - **S&P 500** (SPY / VOO)
  - **MSCI ACWI** (All Country World Index)
  - **WIG20 Total Return** (GPW)
  - Automatyczne wyliczanie wskaźnika **Alfa (Alpha)** ponad rynek.
- **Top Pozycje (Asset Allocation Donut)**: Wykres kołowy i lista spółek o najwyższej wadze w portfelu.

### 3. 📑 Tabele Analityczne & Progressive Disclosure
- **Zamknięte Pozycje**: Wyszukiwarka, filtry kategorii (Akcje, ETF, CFD, Krypto), filtr zysków/strat, sortowanie wielokolumnowe, paginacja oraz eksport do **CSV**.
- **Szczegóły Transakcji**: Kliknięcie w dowolną pozycję otwiera szczegółowy panel z dokładnym czasem trzymania, cenami otwarcia/zamknięcia, kursami przewalutowania i prowizjami.
- **Przepływy Gotówkowe (Cash Flow)**: Pełny rejestr wpłat, wypłat, otrzymanych dywidend, podatków potrąconych u źródła oraz odsetek od wolnych środków.

### 4. 💰 Centrum Dywidend
- Wykres miesięcznego pasywnego dochodu z dywidend.
- Zestawienie kwot **brutto**, **netto** oraz **podatku potrąconego u źródła (W-8BEN)**.
- Ranking spółek wypłacających najwyższe dywidendy.

### 5. 🎨 UI/UX & Prywatność
- **Domyślny Tryb Jasny (Light Mode)** z możliwością błyskawicznego przełączenia na **Tryb Ciemny (Dark Mode)**.
- **Tryb Prywatności (Privacy Mode)**: Jednym kliknięciem maskuje wrażliwe kwoty i salda (`••••••`), ułatwiając udostępnianie ekranu i prezentację statystyk.
- **Wygodne filtry czasowe**: 1M, 3M, 6M, YTD, 1R, Cały okres (All).

---

## 🚀 Jak wyeksportować raport z XTB?

1. Zaloguj się na platformie **xStation 5** (przeglądarka) lub w aplikacji mobilnej XTB.
2. Przejdź do zakładki **Historia** -> **Pozycje zamknięte**.
3. Ustaw pożądany zakres dat (np. *Cała historia* lub *Bieżący rok*).
4. Kliknij prawym przyciskiem myszy na tabelę lub wybierz ikonę eksportu i pobierz plik **Raport (XLSX)** lub **CSV**.
5. W aplikacji kliknij przycisk **Wgraj Pliki** i przeciągnij pobrany plik (lub kilka plików).

---

## 🛠️ Stos Technologiczny (Tech Stack)

- **Frontend**: React 19, TypeScript, Vite.
- **Styling**: Tailwind CSS v4, Lucide React (ikony), font *Plus Jakarta Sans*.
- **Wykresy**: Recharts (zoptymalizowane pod kątem czytelności finansowej).
- **Parser danych**: SheetJS (`xlsx`) z obsługą formatów liczb polskich (przecinki, spacje), walut i różnych struktur tabelarycznych XTB.
- **Zarządzanie stanem**: React Context API z pamięcią lokalną (`localStorage`).

---

## 💻 Uruchomienie Lokalne

```bash
# 1. Klonowanie repozytorium lub przejście do katalogu projektu
cd xtb-portfolio-analyzer

# 2. Instalacja zależności
npm install

# 3. Uruchomienie serwera deweloperskiego
npm run dev

# 4. Budowanie wersji produkcyjnej
npm run build
```

---

## 🔒 Prywatność i Bezpieczeństwo

Wszystkie operacje przetwarzania i parsowania plików XLSX/CSV odbywają się **w 100% lokalnie w Twojej przeglądarce**. Dane nie są przesyłane na żadne zewnętrzne serwery podmiotów trzecich.
