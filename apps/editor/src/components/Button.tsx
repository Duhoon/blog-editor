import { ReactEventHandler } from "react"

interface ButtonProps {
  onClick?: ReactEventHandler<HTMLButtonElement>,
  children: React.ReactNode
}

export default function Button({onClick, children}: ButtonProps){
  return (
    <button 
      className={`hover:cursor-pointer px-4 py-3 bg-green-300 rounded-md`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}