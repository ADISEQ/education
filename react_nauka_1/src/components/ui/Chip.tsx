import type { ReactNode } from "react"


const styles: Record<string, string> = {
    primary: "rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary",
    secondary: "test"
}



export default function Chip({type, children}: {type: keyof typeof styles, children: ReactNode}) {
  return (

    <p className={styles[type]}>{children}</p>
  )
}

