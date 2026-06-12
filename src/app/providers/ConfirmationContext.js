import { createContext } from 'react'

export const ConfirmationContext = createContext(
  /** @type {null | ((opts: ConfirmOptions)=>Promise<boolean>)} */ (null)
)
