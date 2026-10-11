import { useState } from "react";

export default function TransactionList() {

  const [searchterm, setSearchTerm] = useState("");

  const initialTransactions = [
    { id: 1, description: "Zakupy", amountGrosze: 12500 },
    { id: 2, description: "Paliwo", amountGrosze: 20000 },
    { id: 3, description: "Kawa", amountGrosze: 1800 },
  ];
  let suma = initialTransactions.reduce((acc, t) => acc + t.amountGrosze, 0);

  const filteredTransations = initialTransactions.filter(t => t.description.toLowerCase().includes(searchterm.toLowerCase()));


  return (
    <div style={{ border: "1px solid white", padding: "10px", marginTop: "10px"}}>
      <h3>Lista transakcji</h3>
      <input type="text" placeholder="Wyszukaj transakcję..." style={{ padding: "5px", marginBottom: "10px"}} onChange={(e) => setSearchTerm(e.target.value)} /> 
       <ul>
        {

          filteredTransations.length === 0 ? (
            <p>brak wynikow</p>
          ) : (


          filteredTransations.map((t) => (
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

        <h3>Suma : {(suma/100).toFixed(2)} zł</h3>
    </div>
  )
}

