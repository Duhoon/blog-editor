import { ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export default function Button({children, className = "", ...props}: ButtonProps){
  return (
    <button 
      className={`hover:cursor-pointer px-4 py-3 bg-green-300 rounded-md disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
