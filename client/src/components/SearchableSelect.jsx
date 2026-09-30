import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

export function SearchableSelect({
  value = '',
  onChange,
  options = [],
  sections = null, // [{ title: 'Popular brands', options: [...] }, { title: 'All brands', options: [...] }]
  placeholder = 'Select option',
  disabled = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const isSearchActive = Boolean(searchQuery && searchQuery.trim().length > 0);

  // When search is active, deduplicate across all sections or options, sort A–Z
  let filteredOptions = [];
  let flatSelectableItems = [];

  if (isSearchActive) {
    const allUniqueOptions = Array.from(
      new Set(sections ? sections.flatMap(s => s.options) : options)
    ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    const query = searchQuery.toLowerCase().trim();
    filteredOptions = allUniqueOptions.filter(opt =>
      opt.toLowerCase().includes(query)
    );
    flatSelectableItems = filteredOptions;
  } else if (sections && sections.length > 0) {
    flatSelectableItems = sections.flatMap(s => s.options);
  } else {
    flatSelectableItems = [...options].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
  }

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlight index when query or open state changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery, isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-select-option="true"]');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({
          block: 'nearest'
        });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (selectedOption) => {
    onChange(selectedOption);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!isOpen) setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
      setSearchQuery('');
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    const itemCount = flatSelectableItems.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (itemCount > 0) {
        setHighlightedIndex(prev => (prev < itemCount - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (itemCount > 0) {
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : itemCount - 1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && itemCount > 0) {
        handleSelect(flatSelectableItems[highlightedIndex] || flatSelectableItems[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  // Display value in input when closed or focused
  const displayValue = isOpen ? searchQuery : (value || '');

  // Keep running index for sectioned render to map to flatSelectableItems
  let runningItemIndex = 0;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={displayValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck="false"
          className={`w-full bg-slate-950 border rounded-xl pl-3.5 pr-16 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition ${
            disabled
              ? 'opacity-40 cursor-not-allowed border-slate-800 bg-slate-950/40 text-slate-500 select-none'
              : isOpen
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : 'border-slate-700/80 hover:border-slate-600'
          }`}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              onClick={handleClear}
              className="p-1 text-slate-500 hover:text-slate-300 transition rounded-md hover:bg-slate-800/80 cursor-pointer"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => {
              if (!disabled) {
                if (isOpen) {
                  setIsOpen(false);
                  setSearchQuery('');
                } else {
                  inputRef.current?.focus();
                  setIsOpen(true);
                }
              }
            }}
            className={`p-1 text-slate-400 hover:text-slate-200 transition ${
              disabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'
            }`}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-emerald-400' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {isOpen && !disabled && (
        <div
          ref={listRef}
          className="absolute z-50 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-slate-900/98 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-2xl py-1 text-sm scrollbar-thin scrollbar-thumb-slate-700"
        >
          {isSearchActive ? (
            // Full catalogue search results: flat list deduplicated across sections
            filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.toLowerCase() === (value || '').toLowerCase();
                const isHighlighted = idx === highlightedIndex;

                return (
                  <button
                    key={opt}
                    data-select-option="true"
                    type="button"
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full text-left px-3.5 py-2.5 transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                        : isHighlighted
                        ? 'bg-slate-800/90 text-white'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-xs text-slate-400 text-center">
                No matching results for &ldquo;{searchQuery}&rdquo;
              </div>
            )
          ) : sections && sections.length > 0 ? (
            // Sectioned view (Popular brands, All brands)
            sections.map((section, sIdx) => (
              <div key={section.title || sIdx} className="border-b border-slate-800/40 last:border-b-0">
                <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/90 sticky top-0 backdrop-blur-sm border-y border-slate-800/60 select-none z-10 flex items-center justify-between">
                  <span>{section.title}</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {section.options.length}
                  </span>
                </div>
                {section.options.map((opt) => {
                  const currentFlatIdx = runningItemIndex++;
                  const isSelected = opt.toLowerCase() === (value || '').toLowerCase();
                  const isHighlighted = currentFlatIdx === highlightedIndex;

                  return (
                    <button
                      key={`${section.title}-${opt}-${currentFlatIdx}`}
                      data-select-option="true"
                      type="button"
                      onClick={() => handleSelect(opt)}
                      onMouseEnter={() => setHighlightedIndex(currentFlatIdx)}
                      className={`w-full text-left px-3.5 py-2 transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                          : isHighlighted
                          ? 'bg-slate-800/90 text-white'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="truncate">{opt}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            // Standard flat list (e.g. Model selection)
            flatSelectableItems.length > 0 ? (
              flatSelectableItems.map((opt, idx) => {
                const isSelected = opt.toLowerCase() === (value || '').toLowerCase();
                const isHighlighted = idx === highlightedIndex;

                return (
                  <button
                    key={opt}
                    data-select-option="true"
                    type="button"
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full text-left px-3.5 py-2.5 transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                        : isHighlighted
                        ? 'bg-slate-800/90 text-white'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-xs text-slate-400 text-center">
                No options available
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
