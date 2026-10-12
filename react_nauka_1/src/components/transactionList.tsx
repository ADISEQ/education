import { useState } from "react";


const initialTransactions = [
  { id: 1, description: "Zakupy", amountGrosze: 12500 },
  { id: 2, description: "Paliwo", amountGrosze: 20000 },
  { id: 3, description: "Kawa", amountGrosze: 1800 },
];

export default function TransactionList() {

  const [searchTerm, setSearchTerm] = useState("");

  
  const filteredTransactions = initialTransactions.filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()));
  
    const totalAmount = filteredTransactions.reduce((acc, t) => acc + t.amountGrosze, 0);


  return (
    <div style={{ border: "1px solid white", padding: "10px", marginTop: "10px"}}>
      <h3>Lista transakcji</h3>
      <input type="text" aria-label="Wyszukaj transakcję" style={{ padding: "5px", marginBottom: "10px"}} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /> 
       <ul>
        {

          filteredTransactions.length === 0 ? (
            <li>Brak wyników</li>
          ) : (


          filteredTransactions.map((t) => (
            <li style={{ padding: "10px", marginBottom: "5px", display: "flex", gap: "10px"}} key={t.id}>
              <div style={{borderRight: "1px solid white", padding: "5px"}}>

               {t.description}
              </div>
              <div>
                {(t.amountGrosze /100).toFixed(2) } zł
              </div>
            
            
             </li>
          )))
        }
        </ul>

        <h3>Suma : {(totalAmount/100).toFixed(2)} zł</h3>
    </div>
  )
}

