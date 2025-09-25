import React, { createContext, useState, useContext } from 'react';

// 1. Create the context
const HeaderContext = createContext();

// 2. Create the provider component
export const HeaderProvider = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [placeholder, setPlaceholder] = useState('Search...');
    const [onFilterPress, setOnFilterPress] = useState(() => () => {}); // A function that does nothing by default
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterOptions, setFilterOptions] = useState([]);
    const value = {
        searchTerm,
        setSearchTerm,
        placeholder,
        setPlaceholder,
        onFilterPress,
        setOnFilterPress,
        isFilterOpen,
        setIsFilterOpen,
        filterOptions,
        setFilterOptions,
    };

    return (
        <HeaderContext.Provider value={value}>
            {children}
        </HeaderContext.Provider>
    );
};

// 3. Create a custom hook for easy access
export const useHeader = () => {
    const context = useContext(HeaderContext);
    if (context === undefined) {
        throw new Error('useHeader must be used within a HeaderProvider');
    }
    return context;
};