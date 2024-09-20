import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../../styles/pending/Filters.css';
import { faChevronDown, faChevronUp, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

export const Filters = ({ setFilters, customerInfo, setCustomerInfo, sort, setSort }) => {
    const [closingFilters, setClosingFilters] = useState(false);
    const [customerExpanded, setCustomerExpanded] = useState(false);
    const [sortExpanded, setSortExpanded] = useState(false);

    const closeFilters = () => {
        setClosingFilters(true);
        setTimeout(() => {
            setFilters(false);
            setClosingFilters(false);
        }, 300);
    };

    const customerOptions = ['Name', 'Email', 'Phone Number'];
    const sortOptions = ['Date', 'Employee'];

    return (
        <div className={`filters ${closingFilters && 'closing_filters'}`}>
            <div className='filters_top'>
                <h2 className='filters_title'>List Filters</h2>
                <FontAwesomeIcon className='close_filters' icon={faTimes} onClick={closeFilters} />
            </div>

            {/* Customer Filter */}
            <div className='filters_section'>
                <p className='filters_subtitle'>Customer</p>

                <div className='filters_selector'>
                    <div className='filters_selector_top' onClick={() => setCustomerExpanded(!customerExpanded)} >
                        <p className='filters_selector_text'>{customerOptions[customerInfo]}</p>
                        <FontAwesomeIcon 
                            className='filters_selector_icon' 
                            icon={customerExpanded ? faChevronUp : faChevronDown} 
                        />
                    </div>

                    {customerExpanded && (
                        <div className='filters_selector_options'>
                            {customerOptions
                                .filter((_, index) => index !== customerInfo)
                                .map((option, index) => (
                                    <p
                                        key={index}
                                        className='filters_selector_text filters_selector_text_bottom'
                                        onClick={() => {
                                            setCustomerInfo(customerOptions.indexOf(option));
                                            setCustomerExpanded(false);
                                        }}
                                    >
                                        {option}
                                    </p>
                                ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Sort Filter */}
            <div className='filters_section'>
                <p className='filters_subtitle'>Sort By</p>

                <div className='filters_selector'>
                    <div className='filters_selector_top' onClick={() => setSortExpanded(!sortExpanded)} >
                        <p className='filters_selector_text'>{sortOptions[sort]}</p>
                        <FontAwesomeIcon 
                            className='filters_selector_icon' 
                            icon={sortExpanded ? faChevronUp : faChevronDown} 
                        />
                    </div>

                    {sortExpanded && (
                        <div className='filters_selector_options'>
                            {sortOptions
                                .filter((_, index) => index !== sort)
                                .map((option, index) => (
                                    <p
                                        key={index}
                                        className='filters_selector_text filters_selector_text_bottom'
                                        onClick={() => {
                                            setSort(sortOptions.indexOf(option));
                                            setSortExpanded(false);
                                        }}
                                    >
                                        {option}
                                    </p>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
