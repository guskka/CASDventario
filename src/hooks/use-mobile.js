import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Já começa com o valor certo (lido na hora), sem precisar de um segundo render.
  const [isMobile, setIsMobile] = React.useState(
    () => window.innerWidth < MOBILE_BREAKPOINT
  )

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange);
  }, [])

  return !!isMobile
}
