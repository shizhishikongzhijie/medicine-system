interface Props {
    children: React.ReactNode;
}

const Provider: React.FC<Props> = ({children}) => {
    const ThemeContext = React.createContext(null)
    return (
        <ThemeContext.Provider value={null}>
            {children}
        </ThemeContext.Provider>
    )
}