import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

export function SearchableSelect({
  value = '',
  onChange,
  options = [],
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

  // Sort options Z–A descending case-insensitively
  const sortedOptions = [...options].sort((a, b) =>
    b.localeCompare(a, undefined, { sensitivity: 'base' })
  );

  // Filter options based on query (preserving Z–A order)
  const filteredOptions = sortedOptions.filter(opt =>
    opt.toLowerCase().includes((searchQuery || '').toLowerCase().trim())
  );

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

  // Reset highlight index when filtered list changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery, isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current && listRef.current.children[highlightedIndex]) {
      listRef.current.children[highlightedIndex].scrollIntoView({
        block: 'nearest'
      });
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

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && filteredOptions.length > 0) {
        handleSelect(filteredOptions[highlightedIndex] || filteredOptions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  // Display value in input when closed or focused
  const displayValue = isOpen ? searchQuery : (value || '');

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
          className="absolute z-50 left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-slate-900/98 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-2xl py-1 text-sm scrollbar-thin scrollbar-thumb-slate-700 divide-y divide-slate-800/40"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => {
              const isSelected = opt.toLowerCase() === (value || '').toLowerCase();
              const isHighlighted = idx === highlightedIndex;

              return (
                <button
                  key={opt}
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
          )}
        </div>
      )}
    </div>
  );
}
