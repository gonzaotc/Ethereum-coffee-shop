import React from 'react'

const Spinner = ({ className}) => {
    return <div className={`lds-dual-ring ${className}`}></div>;
}

export default Spinner