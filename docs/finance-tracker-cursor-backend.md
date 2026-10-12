# Finance Tracker — brief backendu do Cursora


## Cel i sposób pracy

Buduję frontend React + TypeScript do portfolio. Backend ma umożliwić ćwiczenie REST, walidacji, paginacji, błędów i trwałości danych. Pracuj w folderze backend. Zachowaj istniejącą aplikację frontendową i jej strukturę. Sprawdź instrukcje repo oraz wersję Node, dobierz kompatybilne stabilne zależności, zapisz lockfile.

Proponowany stack: Node, TypeScript, Express, SQLite; walidacja runtime np. Zod, testy API np. Vitest/Supertest. Prosta warstwa route → service → repository. Bez mikroserwisów, kolejek, Kubernetes ani rozbudowanej architektury. Wersja podstawowa ma jednego użytkownika lokalnego i fikcyjne dane. Brak logowania na tym etapie jest jawnym ograniczeniem. Nasłuchuj na 127.0.0.1 domyślnie; konfigurację kontenerową dodamy osobno. Nie publikuj mutowalnego API bez autoryzacji.

Najpierw utwórz OpenAPI zgodne z poniższą specyfikacją i wskaż ewentualne sprzeczności. Potem wykonuj FT-014, FT-015, FT-020 osobno. Każda zmiana kontraktu wymaga opisania wpływu na frontend i mocki. Nie zmieniaj nazw pól samowolnie.

## Model i reguły

Transaction:
```ts
type Transaction = {
  id: string;
  description: string;
  amountGrosze: number;
  type: 'income' | 'expense';
  categoryId: string;
  date: string; // rzeczywista data kalendarzowa YYYY-MM-DD
};
```

Id generuje backend, jako unikalny niepusty string (np. UUID). Opis trimowany, 1–120 znaków. amountGrosze: liczba całkowita 1–100000000; waluta stała PLN. Znak finansowy wynika z type, kwota zawsze dodatnia. Dane wejściowe z dodatkowymi nieznanymi polami odrzucaj jako 422. Odrzuć NaN, nieskończoność, string w miejscu kwoty i wartości niecałkowite. Dla agregatów sprawdzaj Number.isSafeInteger; przekroczenie bezpiecznego zakresu zwraca jawny błąd, nie przybliżoną kwotę.

Data biznesowa nie jest timestampem. Waliduj także poprawność kalendarzową (np. 2026-02-30 jest błędne); nie przesuwaj daty przez UTC. Miesiąc ma format YYYY-MM. Daty od/do obejmują oba końce zakresu.

Category: { id: string, name: string }. Lista seedowana, stała w MVP: Jedzenie, Transport, Mieszkanie, Rozrywka, Zdrowie, Wynagrodzenie, Inne. Kategorie nie ograniczają typu transakcji. categoryId musi istnieć. Zarządzanie kategoriami poza MVP.

Budget: { id: string, month: string, categoryId: string, limitGrosze: number }. Limit całkowity 1–100000000 groszy. Unikalność (month, categoryId) wymuszana również w bazie. spentGrosze wyliczaj z wydatków expense; nie przechowuj go jako ręcznie aktualizowanego pola. remainingGrosze może być ujemne.

## Endpointy

Prefix: /api. Sukcesy i błędy zwracają application/json, oprócz DELETE 204. Id nieistniejącego zasobu: 404. Niepoprawny payload/query: 422. Nieznany endpoint: 404. Błędy wewnętrzne: 500 bez stack trace w odpowiedzi. Limity długości i typy parametrów walidowane przed zapytaniem SQL.

| Metoda i ścieżka | Wejście | Wynik |
|---|---|---|
| GET /health | brak | 200 { status: 'ok' } |
| GET /categories | brak | 200 { items: Category[] } |
| GET /transactions | q, type, categoryId, from, to, page, pageSize | 200 lista opisana poniżej |
| GET /transactions/:id | id | 200 Transaction |
| POST /transactions | description, amountGrosze, type, categoryId, date; Idempotency-Key | 201 Transaction |
| PATCH /transactions/:id | niepusty podzbiór pól edytowalnych | 200 pełny Transaction |
| DELETE /transactions/:id | id | 204 bez body |
| GET /summary | month wymagany | 200 agregaty opisane poniżej |
| GET /budgets | month wymagany | 200 { items: BudgetView[] } |
| POST /budgets | month, categoryId, limitGrosze | 201 BudgetView; duplikat 409 |
| PATCH /budgets/:id | wyłącznie limitGrosze | 200 BudgetView |
| DELETE /budgets/:id | id | 204 bez body |

### Lista transakcji

q: trim, max 120 znaków; literalne wyszukiwanie substring bez rozróżniania wielkości liter także dla polskich liter. Zdefiniuj identyczną normalizację Unicode i case w mocku i backendzie; nie polegaj na domyślnym ASCII-only SQLite LIKE. Znaki % i _ są zwykłym tekstem zapytania. type tylko income/expense. Filtry łączone AND. from/to poprawne daty; from > to daje 422. Nieznana kategoria filtra daje 422. Puste opcjonalne filtry frontend pomija.

page domyślnie 1, całkowite >=1. pageSize domyślnie 20, całkowite 1–100. Sortowanie stałe: date malejąco, potem id rosnąco. total to liczba dopasowanych rekordów przed paginacją. Strona poza zakresem daje items: [], zachowując total i totals. Frontend może cofnąć stronę po usunięciu ostatniego rekordu.

```json
{
  "items": [
    { "id": "t1", "description": "Kawa", "amountGrosze": 1800, "type": "expense", "categoryId": "food", "date": "2026-10-11" }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1,
  "totals": { "incomeGrosze": 0, "expenseGrosze": 1800, "netGrosze": -1800 }
}
```

totals dotyczy WSZYSTKICH rekordów pasujących do filtrów, a nie jednej strony. Dla pustego wyniku: items [], total 0, wszystkie agregaty 0. netGrosze=incomeGrosze-expenseGrosze.

### Tworzenie i ponowienia

POST /transactions wymaga nagłówka Idempotency-Key (niepusty string max 100 znaków). Pierwsza próba: 201. Ponowienie tego samego klucza z tym samym znormalizowanym body: zapamiętany kod 201 i ta sama odpowiedź, bez duplikatu. Ten sam klucz z innym body: 409 IDEMPOTENCY_CONFLICT. Brak/błędny klucz: 422. Mapowanie klucza i utworzenie rekordu zapisuj atomowo w bazie; testuj także równoczesne żądania. W lokalnym MVP rekordy idempotencji przechowuj do resetu bazy. Ponowienie odtwarza pierwotną odpowiedź, nawet jeśli transakcja została później zmieniona; frontend następnie odświeża listę. Ograniczenie opisz w README.

PATCH nie zmienia id. Puste body lub nieznane pole: 422. Usunięcie już usuniętego id daje 404, co nie jest dowodem problemu pierwszego usunięcia. Frontend nie może traktować braku odpowiedzi sieciowej jako gwarancji, że operacja nie zaszła.

### Dashboard i budżety

GET /summary?month=2026-10:
```json
{
  "month": "2026-10",
  "incomeGrosze": 500000,
  "expenseGrosze": 125000,
  "netGrosze": 375000,
  "expensesByCategory": [
    { "categoryId": "food", "expenseGrosze": 125000 }
  ]
}
```

Kategorie bez wydatków można pominąć, sortowanie expenseGrosze malejąco, potem categoryId rosnąco. Suma kategorii musi równać się expenseGrosze. Pusty miesiąc daje zera i pustą tablicę. Podsumowanie miesiąca nie zależy od filtra q ani od strony listy.

BudgetView to Budget plus spentGrosze i remainingGrosze. Wydatki dla kategorii i miesiąca są sumowane bez paginacji. remainingGrosze=limitGrosze-spentGrosze. GET zwraca tylko ustawione budżety; pusty miesiąc daje items: []. UI liczy procent, a brak limitu oznacza Brak budżetu, nie limit 0. POST tej samej pary month/categoryId zwraca 409 BUDGET_EXISTS, nawet przy równoczesnych żądaniach.

### Błędy

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Sprawdź dane formularza.",
    "fieldErrors": { "amountGrosze": "Kwota musi być dodatnią liczbą całkowitą groszy." }
  }
}
```

Kody: VALIDATION_ERROR (422), NOT_FOUND (404), IDEMPOTENCY_CONFLICT (409), BUDGET_EXISTS (409), INTERNAL_ERROR (500). fieldErrors opcjonalne dla błędów innych niż walidacja; nazwy pól odpowiadają API. Dla błędnego JSON 400 z tą samą strukturą i code INVALID_JSON. Logi nie zawierają sekretów. Zapytania SQL parametryzowane, payload ograniczony rozmiarem, CORS z listy dozwolonych originów w env.

## Dostarczenie i odbiór zadań

FT-014: backend, schema/migracje, deterministyczny seed, /health, /categories, .env.example i README. Seed min. 45 transakcji z 3 miesięcy, oba typy, różne kategorie. Reset działa tylko w środowisku development/test i jawnie usuwa fikcyjne dane. Nie dodawaj publicznego endpointu resetu.

FT-015: CRUD transakcji, filtry, paginacja, idempotencja, błędy i testy API. Testy: puste dane, 404, 422, zła data, kwota z ułamkiem grosza, page=0, pageSize=101, literalne %/_, polskie litery, granice dat, agregaty przed paginacją, jednakowa data wielu wpisów, powtórzony klucz i inny payload, równoczesność, trwałość po ponownym otwarciu bazy.

FT-020: summary i budgets, unikalność w bazie, testy miesięcy, przychodów pomijanych przy wydatkach, przekroczenia limitu i zmiany transakcji. Fixture: 500000 groszy income, 125000 expense → 375000 net. Limit 50000, wydatki 60000 → remaining -10000.

W każdym zadaniu dostarcz listę zmienionych plików, instrukcję uruchomienia, wykonane polecenia testowe z wynikiem, przykładowe requesty oraz pozostałe ograniczenia. Nie twierdź, że test został wykonany, jeśli nie został uruchomiony. Nie zmieniaj frontendu ani konfiguracji jego zależności bez wskazania konieczności.

## Późniejsze rozszerzenie FT-031

Prawdziwa sesja i wielu użytkowników to odrębne wydanie. Wymaga ownerId i filtrów właściciela we wszystkich odczytach, zapisach, agregatach i budżetach; unikalność budżetu uwzględnia użytkownika, klucze idempotencji również. Backend musi testami uniemożliwić dostęp przez cudze id. Wybór dostawcy tożsamości lub własnej sesji ustalamy wtedy, przed publikacją prywatnych danych. Nie dopisuj teraz prowizorycznego JWT do localStorage.
